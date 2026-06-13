/**
 * AppDataContext — single source of truth for all lookup/reference data.
 *
 * Pattern:
 *  - Initial values come from mockData (app renders instantly, no loading state).
 *  - If Supabase env vars are present, fetches live data from the DB on mount
 *    and silently replaces the initial values.
 *
 * Switching to Supabase:
 *  1. Set EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 *  2. That's it.  No screen changes needed.
 *  3. Once you confirm the live data looks right, empty the arrays in mockData.ts
 *     (or delete the file — screens no longer import from it directly).
 */

import React, { createContext, useContext, useEffect, useState } from "react";

import { supabase, supabaseConfigured } from "@/lib/supabase";
import {
  ANNUAL_REVENUE,
  BUSINESS_TYPES,
  COUNTRIES,
  DISPUTE_CATEGORIES,
  EXPERIENCE_OPTIONS,
  FUND_SOURCES,
  INCOME_RANGES,
  INDUSTRIES,
  INVESTMENT_DURATIONS,
  INVESTMENT_GOALS,
  INVESTMENT_TYPES,
  KYC_TIERS,
  MOCK_REFERRAL_HISTORY,
  PRO_BENEFITS,
  PRO_PLANS,
  REFERRAL_HOW_IT_WORKS,
  RISK_OPTIONS,
  YEARS_OPERATING,
  type KycTier,
  type ProBenefit,
  type ProPlan,
  type ReferralHistoryItem,
  type ReferralStep,
} from "@/constants/mockData";

interface AppData {
  COUNTRIES: string[];
  INDUSTRIES: string[];
  INVESTMENT_GOALS: string[];
  RISK_OPTIONS: { label: string; sub: string; icon: string }[];
  EXPERIENCE_OPTIONS: string[];
  INCOME_RANGES: string[];
  FUND_SOURCES: string[];
  BUSINESS_TYPES: string[];
  YEARS_OPERATING: string[];
  ANNUAL_REVENUE: string[];
  INVESTMENT_TYPES: string[];
  INVESTMENT_DURATIONS: string[];
  DISPUTE_CATEGORIES: string[];
  KYC_TIERS: KycTier[];
  PRO_BENEFITS: ProBenefit[];
  PRO_PLANS: ProPlan[];
  REFERRAL_HOW_IT_WORKS: ReferralStep[];
  MOCK_REFERRAL_HISTORY: ReferralHistoryItem[];
}

const AppDataContext = createContext<AppData>({
  COUNTRIES,
  INDUSTRIES,
  INVESTMENT_GOALS,
  RISK_OPTIONS,
  EXPERIENCE_OPTIONS,
  INCOME_RANGES,
  FUND_SOURCES,
  BUSINESS_TYPES,
  YEARS_OPERATING,
  ANNUAL_REVENUE,
  INVESTMENT_TYPES,
  INVESTMENT_DURATIONS,
  DISPUTE_CATEGORIES,
  KYC_TIERS,
  PRO_BENEFITS,
  PRO_PLANS,
  REFERRAL_HOW_IT_WORKS,
  MOCK_REFERRAL_HISTORY,
});

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>({
    COUNTRIES,
    INDUSTRIES,
    INVESTMENT_GOALS,
    RISK_OPTIONS,
    EXPERIENCE_OPTIONS,
    INCOME_RANGES,
    FUND_SOURCES,
    BUSINESS_TYPES,
    YEARS_OPERATING,
    ANNUAL_REVENUE,
    INVESTMENT_TYPES,
    INVESTMENT_DURATIONS,
    DISPUTE_CATEGORIES,
    KYC_TIERS,
    PRO_BENEFITS,
    PRO_PLANS,
    REFERRAL_HOW_IT_WORKS,
    MOCK_REFERRAL_HISTORY,
  });

  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;

    const db = supabase;

    Promise.all([
      db.from("countries").select("name").order("name"),
      db.from("industries").select("name").order("name"),
      db.from("investment_goals").select("label").order("id"),
      db.from("risk_profiles").select("label,sub,icon").order("id"),
      db.from("experience_levels").select("label").order("id"),
      db.from("income_ranges").select("label").order("id"),
      db.from("fund_sources").select("label").order("id"),
      db.from("business_types").select("label").order("id"),
      db.from("years_operating_options").select("label").order("id"),
      db.from("annual_revenue_ranges").select("label").order("id"),
      db.from("investment_types").select("label").order("id"),
      db.from("investment_durations").select("label").order("months"),
      db.from("dispute_categories").select("label").order("id"),
      db.from("kyc_tiers").select("tier,label,investment_limit,description,requirements").order("tier"),
      db.from("pro_plans").select("id,label,price_ngn,period,saving").order("price_ngn"),
    ]).then(
      ([
        countries, industries, goals, risks, experience, income,
        fundSrc, bizTypes, yearsOp, revenue, invTypes, durations,
        disputeCats, kycTiers, proPlans,
      ]) => {
        setData((prev) => ({
          ...prev,
          ...(countries.data?.length   ? { COUNTRIES:           countries.data.map((r) => r.name) }          : {}),
          ...(industries.data?.length  ? { INDUSTRIES:          industries.data.map((r) => r.name) }         : {}),
          ...(goals.data?.length       ? { INVESTMENT_GOALS:    goals.data.map((r) => r.label) }             : {}),
          ...(risks.data?.length       ? { RISK_OPTIONS:        risks.data.map((r) => ({ label: r.label, sub: r.sub ?? "", icon: r.icon ?? "" })) } : {}),
          ...(experience.data?.length  ? { EXPERIENCE_OPTIONS:  experience.data.map((r) => r.label) }        : {}),
          ...(income.data?.length      ? { INCOME_RANGES:       income.data.map((r) => r.label) }            : {}),
          ...(fundSrc.data?.length     ? { FUND_SOURCES:        fundSrc.data.map((r) => r.label) }           : {}),
          ...(bizTypes.data?.length    ? { BUSINESS_TYPES:      bizTypes.data.map((r) => r.label) }          : {}),
          ...(yearsOp.data?.length     ? { YEARS_OPERATING:     yearsOp.data.map((r) => r.label) }           : {}),
          ...(revenue.data?.length     ? { ANNUAL_REVENUE:      revenue.data.map((r) => r.label) }           : {}),
          ...(invTypes.data?.length    ? { INVESTMENT_TYPES:    invTypes.data.map((r) => r.label) }          : {}),
          ...(durations.data?.length   ? { INVESTMENT_DURATIONS: durations.data.map((r) => r.label) }        : {}),
          ...(disputeCats.data?.length ? { DISPUTE_CATEGORIES:  disputeCats.data.map((r) => r.label) }       : {}),
          ...(kycTiers.data?.length    ? {
            KYC_TIERS: kycTiers.data.map((r, i) => ({
              tier: r.tier,
              label: r.label,
              limit: r.investment_limit,
              description: r.description ?? "",
              requirements: r.requirements ?? [],
              status: (i === 0 ? "verified" : i === 1 ? "in_progress" : "locked") as KycTier["status"],
            })),
          } : {}),
          ...(proPlans.data?.length ? {
            PRO_PLANS: proPlans.data.map((r) => ({
              id: r.id,
              label: r.label,
              price: r.price_ngn,
              period: r.period,
              saving: r.saving ?? null,
              popular: r.id === "quarterly",
            })),
          } : {}),
        }));
      }
    ).catch(() => {
    });
  }, []);

  return <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  return useContext(AppDataContext);
}
