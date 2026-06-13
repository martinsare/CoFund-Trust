import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
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
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("cofund_user")
      .then((data) => {
        if (data) setUser(JSON.parse(data));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = async (u: User) => {
    await AsyncStorage.setItem("cofund_user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, _pw: string, role?: UserRole) => {
    const demo = DEMO_USERS[email.toLowerCase()];
    const u: User = demo ?? {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: email.split("@")[0].replace(/[._]/g, " "),
      email,
      phone: "",
      country: "Nigeria",
      role: role ?? "investor",
      walletBalance: role === "investor" ? 2500000 : 0,
    };
    await persist(u);
  };

  const register = async (data: RegisterData) => {
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
    await persist(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("cofund_user");
    setUser(null);
  };

  const updateWallet = async (amount: number) => {
    if (!user) return;
    await persist({ ...user, walletBalance: user.walletBalance + amount });
  };

  const updateProfile = async (data: Partial<Pick<User, "name" | "phone" | "country" | "bio" | "avatar">>) => {
    if (!user) return;
    await persist({ ...user, ...data });
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
