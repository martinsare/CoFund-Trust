import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { supabase, supabaseConfigured } from "@/lib/supabase";
import { sbGetProfile, sbSignIn, sbSignOut, sbSignUp, sbUpdateProfile } from "@/lib/supabaseService";

export type UserRole = "investor" | "business" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: UserRole;
  walletBalance: number;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  bvn?: string;
  investmentGoal?: string;
  riskTolerance?: string;
  investmentExperience?: string;
  incomeRange?: string;
  sourceOfFunds?: string;
  businessName?: string;
  cacNumber?: string;
  businessType?: string;
  yearsOperating?: string;
  annualRevenue?: string;
  referralCode?: string;
  agreedToTerms?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  role: UserRole;
  dateOfBirth?: string;
  bvn?: string;
  investmentGoal?: string;
  riskTolerance?: string;
  investmentExperience?: string;
  incomeRange?: string;
  sourceOfFunds?: string;
  businessName?: string;
  cacNumber?: string;
  businessType?: string;
  yearsOperating?: string;
  annualRevenue?: string;
  referralCode?: string;
  agreedToTerms?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<UserRole>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateWallet: (amount: number) => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "name" | "phone" | "country" | "bio" | "avatar">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, User> = {
  "investor@cofund.africa": {
    id: "demo_investor",
    name: "Adebayo Okafor",
    email: "investor@cofund.africa",
    phone: "08012345678",
    country: "Nigeria",
    role: "investor",
    walletBalance: 2500000,
    investmentGoal: "Grow wealth",
    riskTolerance: "Medium",
    investmentExperience: "3-5 years",
    incomeRange: "₦500k – ₦1M",
    sourceOfFunds: "Salary/Employment",
  },
  "business@cofund.africa": {
    id: "demo_business",
    name: "Amaka Osei",
    email: "business@cofund.africa",
    phone: "08087654321",
    country: "Nigeria",
    role: "business",
    walletBalance: 0,
    businessName: "Lagos Pharma Distributors",
    businessType: "Limited Liability (LLC)",
    yearsOperating: "3-5 years",
    annualRevenue: "₦5M – ₦20M",
  },
  "admin@cofund.africa": {
    id: "demo_admin",
    name: "Adesanya Ayomide",
    email: "admin@cofund.africa",
    phone: "09082988080",
    country: "Nigeria",
    role: "admin",
    walletBalance: 0,
  },
};

function dbRowToUser(row: Record<string, unknown>): User {
  return {
    id:                   String(row.id ?? ""),
    name:                 String(row.name ?? ""),
    email:                String(row.email ?? ""),
    phone:                String(row.phone ?? ""),
    country:              String(row.country ?? "Nigeria"),
    role:                 (row.role as UserRole) ?? "investor",
    walletBalance:        Number(row.wallet_balance ?? 0),
    avatar:               row.avatar ? String(row.avatar) : undefined,
    bio:                  row.bio ? String(row.bio) : undefined,
    dateOfBirth:          row.date_of_birth ? String(row.date_of_birth) : undefined,
    bvn:                  row.bvn ? String(row.bvn) : undefined,
    investmentGoal:       row.investment_goal ? String(row.investment_goal) : undefined,
    riskTolerance:        row.risk_tolerance ? String(row.risk_tolerance) : undefined,
    investmentExperience: row.investment_experience ? String(row.investment_experience) : undefined,
    incomeRange:          row.income_range ? String(row.income_range) : undefined,
    sourceOfFunds:        row.source_of_funds ? String(row.source_of_funds) : undefined,
    businessName:         row.business_name ? String(row.business_name) : undefined,
    cacNumber:            row.cac_number ? String(row.cac_number) : undefined,
    businessType:         row.business_type ? String(row.business_type) : undefined,
    yearsOperating:       row.years_operating ? String(row.years_operating) : undefined,
    annualRevenue:        row.annual_revenue ? String(row.annual_revenue) : undefined,
    referralCode:         row.referral_code ? String(row.referral_code) : undefined,
    agreedToTerms:        Boolean(row.agreed_to_terms ?? false),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistLocal = async (u: User) => {
    await AsyncStorage.setItem("cofund_user", JSON.stringify(u));
    setUser(u);
  };

  useEffect(() => {
    if (supabaseConfigured && supabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        const session = data.session;
        if (session) {
          try {
            const profile = await sbGetProfile(session.user.id);
            if (profile) {
              const u = dbRowToUser(profile as Record<string, unknown>);
              await persistLocal(u);
            }
          } catch {
            // profile fetch failed — clear session
          }
        }
        setIsLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT") {
          await AsyncStorage.removeItem("cofund_user");
          setUser(null);
        } else if (session) {
          try {
            const profile = await sbGetProfile(session.user.id);
            if (profile) {
              const u = dbRowToUser(profile as Record<string, unknown>);
              await persistLocal(u);
            }
          } catch {}
        }
      });
      return () => listener.subscription.unsubscribe();
    } else {
      AsyncStorage.getItem("cofund_user")
        .then((data) => {
          if (data) setUser(JSON.parse(data));
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<UserRole> => {
    const lower = email.toLowerCase();

    if (supabaseConfigured && supabase) {
      const isDemoEmail = Object.keys(DEMO_USERS).includes(lower);
      if (isDemoEmail) {
        const demo = DEMO_USERS[lower];
        await persistLocal(demo);
        return demo.role;
      }
      const { session } = await sbSignIn(email, password);
      if (session) {
        const profile = await sbGetProfile(session.user.id);
        if (profile) {
          const u = dbRowToUser(profile as Record<string, unknown>);
          await persistLocal(u);
          return u.role;
        }
      }
      return role ?? "investor";
    }

    const demo = DEMO_USERS[lower];
    const u: User = demo ?? {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: email.split("@")[0].replace(/[._]/g, " "),
      email,
      phone: "",
      country: "Nigeria",
      role: role ?? "investor",
      walletBalance: role === "investor" ? 2500000 : 0,
    };
    await persistLocal(u);
    return u.role;
  };

  const register = async (data: RegisterData) => {
    if (supabaseConfigured && supabase) {
      await sbSignUp(data.email, data.password, {
        name: data.name,
        role: data.role,
        phone: data.phone,
        country: data.country,
        date_of_birth: data.dateOfBirth,
        bvn: data.bvn,
        investment_goal: data.investmentGoal,
        risk_tolerance: data.riskTolerance,
        investment_experience: data.investmentExperience,
        income_range: data.incomeRange,
        source_of_funds: data.sourceOfFunds,
        business_name: data.businessName,
        cac_number: data.cacNumber,
        business_type: data.businessType,
        years_operating: data.yearsOperating,
        annual_revenue: data.annualRevenue,
        referral_code: data.referralCode,
        agreed_to_terms: data.agreedToTerms,
      });
      return;
    }

    const u: User = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: data.name,
      email: data.email,
      phone: data.phone,
      country: data.country,
      role: data.role,
      walletBalance: data.role === "investor" ? 2500000 : 0,
      dateOfBirth: data.dateOfBirth,
      bvn: data.bvn,
      investmentGoal: data.investmentGoal,
      riskTolerance: data.riskTolerance,
      investmentExperience: data.investmentExperience,
      incomeRange: data.incomeRange,
      sourceOfFunds: data.sourceOfFunds,
      businessName: data.businessName,
      cacNumber: data.cacNumber,
      businessType: data.businessType,
      yearsOperating: data.yearsOperating,
      annualRevenue: data.annualRevenue,
      referralCode: data.referralCode,
      agreedToTerms: data.agreedToTerms,
    };
    await persistLocal(u);
  };

  const logout = async () => {
    if (supabaseConfigured) await sbSignOut();
    await AsyncStorage.removeItem("cofund_user");
    setUser(null);
  };

  const updateWallet = async (amount: number) => {
    if (!user) return;
    const newBalance = user.walletBalance + amount;
    if (supabaseConfigured && supabase && !user.id.startsWith("demo_")) {
      await sbUpdateProfile(user.id, { wallet_balance: newBalance });
    }
    await persistLocal({ ...user, walletBalance: newBalance });
  };

  const updateProfile = async (data: Partial<Pick<User, "name" | "phone" | "country" | "bio" | "avatar">>) => {
    if (!user) return;
    if (supabaseConfigured && supabase && !user.id.startsWith("demo_")) {
      await sbUpdateProfile(user.id, data);
    }
    await persistLocal({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateWallet, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
