export type RiskLevel = "low" | "medium" | "high";
export type RiskCategory = "A" | "B" | "C" | "D" | "E";
export type VerificationStatus = "verified" | "partial" | "pending";
export type InvestmentStatus = "pending" | "active" | "completed" | "defaulted" | "cancelled";
export type UpdateType = "milestone" | "report" | "update";
export type NotificationType = "opportunity" | "investment" | "update" | "return";

export interface BusinessUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  type: UpdateType;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  sector: string;
  description: string;
  location: string;
  yearsOperating: number;
  fundingGoal: number;
  amountRaised: number;
  minInvestment: number;
  expectedRoi: string;
  duration: string;
  trustScore: number;
  riskLevel: RiskLevel;
  riskCategory: RiskCategory;
  verificationStatus: VerificationStatus;
  investmentType: string;
  investorCount: number;
  updates: BusinessUpdate[];
  daysLeft: number;
}

export interface Investment {
  id: string;
  businessId: string;
  businessName: string;
  industry: string;
  amountInvested: number;
  investmentDate: string;
  status: InvestmentStatus;
  expectedReturn: number;
  maturityDate: string;
  roi: string;
  progress: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: NotificationType;
}

export const BUSINESSES: Business[] = [
  {
    id: "1",
    name: "Lagos Pharma Distributors",
    industry: "Pharmaceuticals",
    sector: "Healthcare",
    description:
      "Leading pharmaceutical distributor serving 200+ pharmacies across Lagos and Ogun states. Expanding distribution network to Abuja with working capital financing for new inventory cycle.",
    location: "Lagos Island, Lagos",
    yearsOperating: 7,
    fundingGoal: 25000000,
    amountRaised: 18750000,
    minInvestment: 100000,
    expectedRoi: "22–28%",
    duration: "18 months",
    trustScore: 87,
    riskLevel: "low",
    riskCategory: "B",
    verificationStatus: "verified",
    investmentType: "Profit Share",
    investorCount: 47,
    daysLeft: 12,
    updates: [
      {
        id: "u1",
        title: "Q1 Revenue Report",
        content:
          "Achieved ₦180M in revenue for Q1, up 23% from previous quarter. All investor milestones on track.",
        date: "2026-05-15",
        type: "report",
      },
      {
        id: "u2",
        title: "Abuja Branch Lease Signed",
        content:
          "Secured premises for the Abuja distribution centre. Renovations begin next week.",
        date: "2026-04-28",
        type: "milestone",
      },
    ],
  },
  {
    id: "2",
    name: "Abuja Solar Energy Co.",
    industry: "Renewable Energy",
    sector: "Energy",
    description:
      "Installing solar micro-grids for commercial and residential clients in FCT. Proven revenue model with 3-year maintenance contracts. Expanding fleet of installation teams.",
    location: "Wuse 2, Abuja",
    yearsOperating: 4,
    fundingGoal: 15000000,
    amountRaised: 9000000,
    minInvestment: 50000,
    expectedRoi: "30–38%",
    duration: "24 months",
    trustScore: 79,
    riskLevel: "medium",
    riskCategory: "C",
    verificationStatus: "verified",
    investmentType: "Fixed Return",
    investorCount: 31,
    daysLeft: 28,
    updates: [
      {
        id: "u3",
        title: "50 Installations Completed",
        content:
          "Crossed 50 solar installations milestone. Total capacity: 420 kWp. On track for Q3 targets.",
        date: "2026-05-20",
        type: "milestone",
      },
    ],
  },
  {
    id: "3",
    name: "Kano Agro-Processing Ltd",
    industry: "Agriculture",
    sector: "Agro-processing",
    description:
      "Processing and packaging groundnut oil and sesame products for export. Equipment acquisition financing for two new cold-press machines to triple output capacity.",
    location: "Kano Industrial Estate",
    yearsOperating: 9,
    fundingGoal: 40000000,
    amountRaised: 28000000,
    minInvestment: 300000,
    expectedRoi: "18–24%",
    duration: "12 months",
    trustScore: 91,
    riskLevel: "low",
    riskCategory: "A",
    verificationStatus: "verified",
    investmentType: "Asset-Backed",
    investorCount: 68,
    daysLeft: 5,
    updates: [
      {
        id: "u4",
        title: "Machine Delivery Confirmed",
        content:
          "First cold-press machine has been delivered. Commissioning scheduled for next week.",
        date: "2026-06-02",
        type: "milestone",
      },
    ],
  },
  {
    id: "4",
    name: "PH Logistics Fleet",
    industry: "Logistics",
    sector: "Transport",
    description:
      "B2B last-mile logistics serving e-commerce platforms in Rivers State. Expanding fleet from 12 to 30 vehicles to meet growing demand from online retailers.",
    location: "Port Harcourt, Rivers",
    yearsOperating: 5,
    fundingGoal: 35000000,
    amountRaised: 12250000,
    minInvestment: 100000,
    expectedRoi: "25–32%",
    duration: "30 months",
    trustScore: 74,
    riskLevel: "medium",
    riskCategory: "C",
    verificationStatus: "verified",
    investmentType: "Asset Leasing",
    investorCount: 24,
    daysLeft: 45,
    updates: [],
  },
  {
    id: "5",
    name: "Lekki Suites Hotel",
    industry: "Hospitality",
    sector: "Hotels",
    description:
      "Boutique business hotel with 42 rooms in Lekki Phase 1. Refinancing for renovation and smart-room upgrades. 82% average occupancy rate over past 2 years.",
    location: "Lekki Phase 1, Lagos",
    yearsOperating: 6,
    fundingGoal: 60000000,
    amountRaised: 42000000,
    minInvestment: 500000,
    expectedRoi: "16–20%",
    duration: "36 months",
    trustScore: 83,
    riskLevel: "low",
    riskCategory: "B",
    verificationStatus: "verified",
    investmentType: "Profit Share",
    investorCount: 52,
    daysLeft: 8,
    updates: [
      {
        id: "u5",
        title: "Renovation Phase 1 Complete",
        content:
          "Lobby and 18 rooms fully renovated. Reopened to guests with strong initial bookings.",
        date: "2026-05-30",
        type: "update",
      },
    ],
  },
  {
    id: "6",
    name: "TechHub Coworking Network",
    industry: "Technology",
    sector: "Real Estate",
    description:
      "Operating 3 coworking spaces in Lagos with 600+ active members. Expanding to Abuja and Ibadan with revenue-based financing.",
    location: "Victoria Island, Lagos",
    yearsOperating: 3,
    fundingGoal: 20000000,
    amountRaised: 5000000,
    minInvestment: 50000,
    expectedRoi: "28–35%",
    duration: "18 months",
    trustScore: 68,
    riskLevel: "high",
    riskCategory: "D",
    verificationStatus: "partial",
    investmentType: "Profit Share",
    investorCount: 14,
    daysLeft: 60,
    updates: [],
  },
];

export const INVESTMENTS: Investment[] = [
  {
    id: "inv1",
    businessId: "1",
    businessName: "Lagos Pharma Distributors",
    industry: "Pharmaceuticals",
    amountInvested: 500000,
    investmentDate: "2026-02-14",
    status: "active",
    expectedReturn: 625000,
    maturityDate: "2027-08-14",
    roi: "25%",
    progress: 0.35,
  },
  {
    id: "inv2",
    businessId: "3",
    businessName: "Kano Agro-Processing Ltd",
    industry: "Agriculture",
    amountInvested: 300000,
    investmentDate: "2026-01-20",
    status: "active",
    expectedReturn: 363000,
    maturityDate: "2027-01-20",
    roi: "21%",
    progress: 0.55,
  },
  {
    id: "inv3",
    businessId: "5",
    businessName: "Lekki Suites Hotel",
    industry: "Hospitality",
    amountInvested: 1000000,
    investmentDate: "2025-09-10",
    status: "active",
    expectedReturn: 1170000,
    maturityDate: "2028-09-10",
    roi: "17%",
    progress: 0.22,
  },
  {
    id: "inv4",
    businessId: "2",
    businessName: "Abuja Solar Energy Co.",
    industry: "Renewable Energy",
    amountInvested: 200000,
    investmentDate: "2025-06-01",
    status: "completed",
    expectedReturn: 264000,
    maturityDate: "2026-06-01",
    roi: "32%",
    progress: 1,
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "New Opportunity Available",
    body: "Kano Agro-Processing Ltd is closing in 5 days. Only ₦12M remaining.",
    time: "2 hours ago",
    read: false,
    type: "opportunity",
  },
  {
    id: "n2",
    title: "Investment Confirmed",
    body: "Your ₦500K investment in Lagos Pharma Distributors has been activated.",
    time: "3 days ago",
    read: false,
    type: "investment",
  },
  {
    id: "n3",
    title: "Business Update",
    body: "Lekki Suites Hotel posted a new milestone: Renovation Phase 1 Complete.",
    time: "5 days ago",
    read: true,
    type: "update",
  },
  {
    id: "n4",
    title: "Return Paid",
    body: "You received ₦264,000 from Abuja Solar Energy Co. Investment completed.",
    time: "1 week ago",
    read: true,
    type: "return",
  },
  {
    id: "n5",
    title: "New Opportunity",
    body: "PH Logistics Fleet is now accepting investors. 30%+ ROI projected.",
    time: "2 weeks ago",
    read: true,
    type: "opportunity",
  },
];

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
};
