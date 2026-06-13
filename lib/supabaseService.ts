import { supabase, supabaseConfigured } from "./supabase";
import type { UserRole } from "@/context/AuthContext";

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export async function sbSignUp(
  email: string,
  password: string,
  meta: { name: string; role: UserRole; phone?: string; country?: string; [key: string]: unknown }
) {
  if (!supabaseConfigured || !supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: meta },
  });
  if (error) throw error;
  return data;
}

export async function sbSignIn(email: string, password: string) {
  if (!supabaseConfigured || !supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function sbSignOut() {
  if (!supabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}

export async function sbGetSession() {
  if (!supabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────

export async function sbGetProfile(userId: string) {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function sbUpdateProfile(
  userId: string,
  updates: Partial<{
    name: string; phone: string; country: string; bio: string; avatar: string;
    wallet_balance: number;
  }>
) {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// BUSINESSES
// ─────────────────────────────────────────────

export async function sbGetBusinesses() {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("businesses")
    .select("*, milestones(*), business_updates(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function sbGetBusiness(id: string) {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("businesses")
    .select("*, milestones(*), business_updates(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function sbUpdateBusinessBrfr(id: string, brfrStatus: string) {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from("businesses").update({ brfr_status: brfrStatus }).eq("id", id);
  if (error) throw error;
}

export async function sbUpdateBusinessKyb(id: string, kybStage: number, verificationStatus: string) {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from("businesses").update({ kyb_stage: kybStage, verification_status: verificationStatus }).eq("id", id);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// INVESTMENTS
// ─────────────────────────────────────────────

export async function sbGetInvestorInvestments(investorId: string) {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("investments")
    .select("*, businesses(name, industry, location, brfr_status, expected_roi)")
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function sbCreateInvestment(investment: {
  investor_id: string;
  business_id: string;
  amount: number;
  platform_fee: number;
  investment_type: string;
  expected_roi: string;
  duration: string;
}) {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("investments")
    .insert({ ...investment, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

export async function sbGetNotifications(userId: string) {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function sbMarkNotificationRead(notificationId: string) {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// PLATFORM KPIs (admin)
// ─────────────────────────────────────────────

export async function sbGetPlatformKpis() {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from("platform_kpis").select("*").single();
  if (error) throw error;
  return data;
}
