import React, { createContext, useContext, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  BUSINESSES,
  Business,
  BrfrStatus,
  DisputePriority,
  DisputeRecord,
  DisputeStatus,
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
  createBusiness: (draft: BusinessDraft) => Business;
  updateBusiness: (id: string, patch: Partial<Business>) => void;
  submitDispute: (draft: DisputeDraft) => DisputeRecord;
  updateDispute: (id: string, patch: Partial<DisputeRecord>) => void;
}

const SystemContext = createContext<SystemContextType | null>(null);

const BUSINESS_TEMPLATE = BUSINESSES[0];

const INITIAL_BUSINESSES = BUSINESSES.map((business) => ({
  ...business,
  updates: business.updates.map((update) => ({ ...update })),
  milestones: business.milestones.map((milestone) => ({ ...milestone })),
}));

const INITIAL_DISPUTES: DisputeRecord[] = [];

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
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES);

  const currentBusiness = useMemo(() => {
    if (!user || user.role !== "business") return null;
    return businesses.find((business) => business.name === user.businessName) ?? businesses[0] ?? null;
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
    setBusinesses((prev) => prev.map((business) => (business.id === id ? { ...business, ...patch } : business)));
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
    setDisputes((prev) => prev.map((dispute) => (dispute.id === id ? { ...dispute, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : dispute)));
  };

  const value = { businesses, currentBusiness, disputes, createBusiness, updateBusiness, submitDispute, updateDispute };

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystemData() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystemData must be used within SystemProvider");
  return ctx;
}
