import React, { createContext, useContext, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  AdminListing,
  AdminThread,
  AdminTransaction,
  BUSINESSES,
  Business,
  BrfrStatus,
  DisputePriority,
  DisputeRecord,
  INITIAL_ADMIN_LISTINGS,
  INITIAL_ADMIN_THREADS,
  INITIAL_ADMIN_TRANSACTIONS,
  RiskCategory,
  RiskLevel,
  VerificationStatus,
} from "@/constants/mockData";

interface BusinessDraft {
  name: string;
  industry: string;
  location: string;
  sector?: string;
  description?: string;
  fundingGoal: number;
  minInvestment: number;
  expectedRoi: string;
  duration: string;
  investmentType: string;
  yearsOperating?: number;
  employeeCount?: number;
  revenueRange?: string;
  trustScore?: number;
  riskLevel?: RiskLevel;
  riskCategory?: RiskCategory;
  verificationStatus?: VerificationStatus;
  kybStage?: 1 | 2 | 3 | 4 | 5;
  brfrStatus?: BrfrStatus;
  investorCount?: number;
  daysLeft?: number;
}

interface DisputeDraft {
  businessId: string;
  businessName: string;
  investorId: string;
  investorName: string;
  category: string;
  subject: string;
  details: string;
  investmentId?: string;
  evidenceCount?: number;
  priority?: DisputePriority;
}

interface SystemContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  disputes: DisputeRecord[];
  adminTransactions: AdminTransaction[];
  adminListings: AdminListing[];
  adminThreads: AdminThread[];

  createBusiness: (draft: BusinessDraft) => Business;
  updateBusiness: (id: string, patch: Partial<Business>) => void;

  submitDispute: (draft: DisputeDraft) => DisputeRecord;
  updateDispute: (id: string, patch: Partial<DisputeRecord>) => void;
  deleteDispute: (id: string) => void;

  addAdminTransaction: (tx: Omit<AdminTransaction, "id">) => void;
  deleteAdminTransaction: (id: string) => void;

  addAdminListing: (listing: Omit<AdminListing, "id">) => void;
  updateAdminListing: (id: string, patch: Partial<AdminListing>) => void;
  deleteAdminListing: (id: string) => void;

  addAdminThread: (thread: Omit<AdminThread, "id">) => void;
  updateAdminThread: (id: string, patch: Partial<AdminThread>) => void;
  deleteAdminThread: (id: string) => void;
}

const SystemContext = createContext<SystemContextType | null>(null);

const BUSINESS_TEMPLATE = BUSINESSES[0];

const INITIAL_BUSINESSES = BUSINESSES.map((business) => ({
  ...business,
  updates: business.updates.map((update) => ({ ...update })),
  milestones: business.milestones.map((milestone) => ({ ...milestone })),
}));

function getPriorityFromCategory(category: string): DisputePriority {
  const normalized = category.toLowerCase();
  if (normalized.includes("fraud") || normalized.includes("critical")) return "critical";
  if (normalized.includes("payment") || normalized.includes("milestone") || normalized.includes("delay")) return "high";
  if (normalized.includes("kyb") || normalized.includes("refund")) return "medium";
  return "low";
}

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<AdminTransaction[]>(INITIAL_ADMIN_TRANSACTIONS);
  const [adminListings, setAdminListings] = useState<AdminListing[]>(INITIAL_ADMIN_LISTINGS);
  const [adminThreads, setAdminThreads] = useState<AdminThread[]>(INITIAL_ADMIN_THREADS);

  const currentBusiness = useMemo(() => {
    if (!user || user.role !== "business") return null;
    return businesses.find((business) => business.name === user.businessName) ?? null;
  }, [businesses, user]);

  const createBusiness = (draft: BusinessDraft) => {
    const next: Business = {
      ...BUSINESS_TEMPLATE,
      id: `biz-${Date.now()}`,
      name: draft.name,
      industry: draft.industry,
      sector: draft.sector ?? draft.industry,
      description: draft.description ?? BUSINESS_TEMPLATE.description,
      location: draft.location,
      yearsOperating: draft.yearsOperating ?? 1,
      employeeCount: draft.employeeCount ?? 0,
      revenueRange: draft.revenueRange ?? "Pending submission",
      fundingGoal: draft.fundingGoal,
      amountRaised: 0,
      minInvestment: draft.minInvestment,
      expectedRoi: draft.expectedRoi,
      duration: draft.duration,
      trustScore: draft.trustScore ?? 50,
      riskLevel: draft.riskLevel ?? "medium",
      riskCategory: draft.riskCategory ?? "C",
      verificationStatus: draft.verificationStatus ?? "pending",
      kybStage: draft.kybStage ?? 1,
      brfrStatus: draft.brfrStatus ?? "yellow",
      investmentType: draft.investmentType,
      investorCount: draft.investorCount ?? 0,
      updates: [],
      milestones: [],
      daysLeft: draft.daysLeft ?? 90,
    };
    setBusinesses((prev) => [next, ...prev]);
    return next;
  };

  const updateBusiness = (id: string, patch: Partial<Business>) => {
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const submitDispute = (draft: DisputeDraft) => {
    const next: DisputeRecord = {
      id: `disp-${Date.now()}`,
      reference: `INV-${String(4000 + disputes.length + 1).slice(-4)}`,
      businessId: draft.businessId,
      businessName: draft.businessName,
      investorId: draft.investorId,
      investorName: draft.investorName,
      investmentId: draft.investmentId,
      category: draft.category,
      subject: draft.subject,
      details: draft.details,
      status: "open",
      priority: draft.priority ?? getPriorityFromCategory(draft.category),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      evidenceCount: draft.evidenceCount ?? 0,
    };
    setDisputes((prev) => [next, ...prev]);
    return next;
  };

  const updateDispute = (id: string, patch: Partial<DisputeRecord>) => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : d)));
  };

  const deleteDispute = (id: string) => {
    setDisputes((prev) => prev.filter((d) => d.id !== id));
  };

  const addAdminTransaction = (tx: Omit<AdminTransaction, "id">) => {
    setAdminTransactions((prev) => [{ ...tx, id: `wt-${Date.now()}` }, ...prev]);
  };
  const deleteAdminTransaction = (id: string) => {
    setAdminTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addAdminListing = (listing: Omit<AdminListing, "id">) => {
    setAdminListings((prev) => [{ ...listing, id: `ml-${Date.now()}` }, ...prev]);
  };
  const updateAdminListing = (id: string, patch: Partial<AdminListing>) => {
    setAdminListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };
  const deleteAdminListing = (id: string) => {
    setAdminListings((prev) => prev.filter((l) => l.id !== id));
  };

  const addAdminThread = (thread: Omit<AdminThread, "id">) => {
    setAdminThreads((prev) => [{ ...thread, id: `at-${Date.now()}` }, ...prev]);
  };
  const updateAdminThread = (id: string, patch: Partial<AdminThread>) => {
    setAdminThreads((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };
  const deleteAdminThread = (id: string) => {
    setAdminThreads((prev) => prev.filter((t) => t.id !== id));
  };

  const value: SystemContextType = {
    businesses, currentBusiness, disputes, adminTransactions, adminListings, adminThreads,
    createBusiness, updateBusiness,
    submitDispute, updateDispute, deleteDispute,
    addAdminTransaction, deleteAdminTransaction,
    addAdminListing, updateAdminListing, deleteAdminListing,
    addAdminThread, updateAdminThread, deleteAdminThread,
  };

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystemData() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystemData must be used within SystemProvider");
  return ctx;
}
