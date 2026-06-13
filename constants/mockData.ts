export type RiskLevel = "low" | "medium" | "high";
export type RiskCategory = "A" | "B" | "C" | "D" | "E";
export type VerificationStatus = "verified" | "partial" | "pending";
export type InvestmentStatus = "pending" | "active" | "completed" | "defaulted" | "cancelled";
export type UpdateType = "milestone" | "report" | "update";
export type NotificationType = "opportunity" | "investment" | "update" | "return";
export type BrfrStatus = "green" | "yellow" | "orange" | "red";
export type MilestoneStatus = "completed" | "active" | "pending";
export type DisputeStatus = "open" | "under_review" | "resolved" | "escalated";
export type DisputePriority = "low" | "medium" | "high" | "critical";

export const KYB_STAGES = [
  "Basic Eligibility",
  "Business Verification (KYB)",
  "Financial Assessment",
  "Operational Assessment",
  "Investment Readiness",
] as const;

export interface BusinessUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  type: UpdateType;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  amount: number;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  sector: string;
  description: string;
  location: string;
  yearsOperating: number;
  employeeCount: number;
  revenueRange: string;
  fundingGoal: number;
  amountRaised: number;
  minInvestment: number;
  expectedRoi: string;
  duration: string;
  trustScore: number;
  riskLevel: RiskLevel;
  riskCategory: RiskCategory;
  verificationStatus: VerificationStatus;
  kybStage: 1 | 2 | 3 | 4 | 5;
  brfrStatus: BrfrStatus;
  investmentType: string;
  investorCount: number;
  updates: BusinessUpdate[];
  milestones: Milestone[];
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

export interface DisputeRecord {
  id: string;
  reference: string;
  businessId: string;
  businessName: string;
  investorId: string;
  investorName: string;
  investmentId?: string;
  category: string;
  subject: string;
  details: string;
  status: DisputeStatus;
  priority: DisputePriority;
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
  response?: string;
  assignedTo?: string;
}

export interface MarketListing {
  id: string;
  businessId: string;
  businessName: string;
  industry: string;
  sector: string;
  originalAmount: number;
  askPrice: number;
  expectedReturn: number;
  maturityDate: string;
  daysToMaturity: number;
  roi: string;
  premiumDiscount: number;
  sellerType: "retail" | "institutional";
  listedDate: string;
  trustScore: number;
}

export interface MessageThread {
  id: string;
  businessId: string;
  businessName: string;
  industry: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  initials: string;
  color: string;
}

export interface WalletTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "investment" | "return" | "fee";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending";
}

export interface PortfolioDataPoint {
  month: string;
  value: number;
}

export interface SectorAllocation {
  sector: string;
  percentage: number;
  color: string;
  amount: number;
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
    employeeCount: 48,
    revenueRange: "₦180M–₦240M/yr",
    fundingGoal: 25000000,
    amountRaised: 18750000,
    minInvestment: 100000,
    expectedRoi: "22–28%",
    duration: "18 months",
    trustScore: 87,
    riskLevel: "low",
    riskCategory: "B",
    verificationStatus: "verified",
    kybStage: 5,
    brfrStatus: "green",
    investmentType: "Profit Share",
    investorCount: 47,
    daysLeft: 12,
    updates: [
      {
        id: "u1",
        title: "Q1 Revenue Report",
        content: "Achieved ₦180M in revenue for Q1, up 23% from previous quarter. All investor milestones on track.",
        date: "2026-05-15",
        type: "report",
      },
      {
        id: "u2",
        title: "Abuja Branch Lease Signed",
        content: "Secured premises for the Abuja distribution centre. Renovations begin next week.",
        date: "2026-04-28",
        type: "milestone",
      },
    ],
    milestones: [
      { id: "m1a", title: "Working Capital Disbursement", description: "Initial escrow release for Q1 inventory purchase", status: "completed", dueDate: "2026-03-01", amount: 6250000 },
      { id: "m1b", title: "Abuja Distribution Centre", description: "Lease signed and fitout commenced", status: "completed", dueDate: "2026-05-01", amount: 6250000 },
      { id: "m1c", title: "Fleet Expansion – Phase 1", description: "3 new refrigerated trucks delivered and operational", status: "active", dueDate: "2026-08-01", amount: 6250000 },
      { id: "m1d", title: "Abuja Go-Live", description: "Full operations launched in Abuja with 50+ pharmacy clients", status: "pending", dueDate: "2026-11-01", amount: 6250000 },
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
    employeeCount: 22,
    revenueRange: "₦45M–₦70M/yr",
    fundingGoal: 15000000,
    amountRaised: 9000000,
    minInvestment: 50000,
    expectedRoi: "30–38%",
    duration: "24 months",
    trustScore: 79,
    riskLevel: "medium",
    riskCategory: "C",
    verificationStatus: "verified",
    kybStage: 5,
    brfrStatus: "yellow",
    investmentType: "Fixed Return",
    investorCount: 31,
    daysLeft: 28,
    updates: [
      {
        id: "u3",
        title: "50 Installations Completed",
        content: "Crossed 50 solar installations milestone. Total capacity: 420 kWp. On track for Q3 targets.",
        date: "2026-05-20",
        type: "milestone",
      },
    ],
    milestones: [
      { id: "m2a", title: "Equipment Procurement", description: "Solar panels, inverters and batteries sourced", status: "completed", dueDate: "2026-02-15", amount: 5000000 },
      { id: "m2b", title: "50 Installations", description: "Reach 50 active solar installations in FCT", status: "completed", dueDate: "2026-05-15", amount: 4000000 },
      { id: "m2c", title: "Team Scale-Up", description: "Hire and train 8 additional installation engineers", status: "active", dueDate: "2026-08-15", amount: 3000000 },
      { id: "m2d", title: "100 Installations & Maintenance Revenue", description: "Double client base with recurring contracts", status: "pending", dueDate: "2026-11-15", amount: 3000000 },
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
    employeeCount: 95,
    revenueRange: "₦320M–₦400M/yr",
    fundingGoal: 40000000,
    amountRaised: 28000000,
    minInvestment: 300000,
    expectedRoi: "18–24%",
    duration: "12 months",
    trustScore: 91,
    riskLevel: "low",
    riskCategory: "A",
    verificationStatus: "verified",
    kybStage: 5,
    brfrStatus: "green",
    investmentType: "Asset-Backed",
    investorCount: 68,
    daysLeft: 5,
    updates: [
      {
        id: "u4",
        title: "Machine Delivery Confirmed",
        content: "First cold-press machine has been delivered. Commissioning scheduled for next week.",
        date: "2026-06-02",
        type: "milestone",
      },
    ],
    milestones: [
      { id: "m3a", title: "Machine #1 Procurement", description: "First cold-press machine purchased and shipped", status: "completed", dueDate: "2026-04-01", amount: 14000000 },
      { id: "m3b", title: "Machine #1 Commissioning", description: "Installation, testing and first production run", status: "active", dueDate: "2026-06-15", amount: 7000000 },
      { id: "m3c", title: "Machine #2 Procurement", description: "Second cold-press machine ordered", status: "pending", dueDate: "2026-08-01", amount: 14000000 },
      { id: "m3d", title: "Full Capacity Operations", description: "Both machines running at 85%+ capacity for export", status: "pending", dueDate: "2026-12-01", amount: 5000000 },
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
    employeeCount: 35,
    revenueRange: "₦80M–₦120M/yr",
    fundingGoal: 35000000,
    amountRaised: 12250000,
    minInvestment: 100000,
    expectedRoi: "25–32%",
    duration: "30 months",
    trustScore: 74,
    riskLevel: "medium",
    riskCategory: "C",
    verificationStatus: "verified",
    kybStage: 4,
    brfrStatus: "yellow",
    investmentType: "Asset Leasing",
    investorCount: 24,
    daysLeft: 45,
    updates: [],
    milestones: [
      { id: "m4a", title: "Fleet Batch 1 (6 vehicles)", description: "First 6 vehicles purchased and insured", status: "completed", dueDate: "2026-03-01", amount: 8000000 },
      { id: "m4b", title: "Driver Recruitment & Training", description: "18 drivers hired and safety-certified", status: "active", dueDate: "2026-06-01", amount: 4250000 },
      { id: "m4c", title: "Fleet Batch 2 (12 vehicles)", description: "Next 12 vehicles to expand route coverage", status: "pending", dueDate: "2026-10-01", amount: 14000000 },
      { id: "m4d", title: "Full Fleet Operational", description: "30 vehicles active with e-commerce SLA contracts", status: "pending", dueDate: "2027-02-01", amount: 8750000 },
    ],
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
    employeeCount: 62,
    revenueRange: "₦140M–₦180M/yr",
    fundingGoal: 60000000,
    amountRaised: 42000000,
    minInvestment: 500000,
    expectedRoi: "16–20%",
    duration: "36 months",
    trustScore: 83,
    riskLevel: "low",
    riskCategory: "B",
    verificationStatus: "verified",
    kybStage: 5,
    brfrStatus: "green",
    investmentType: "Profit Share",
    investorCount: 52,
    daysLeft: 8,
    updates: [
      {
        id: "u5",
        title: "Renovation Phase 1 Complete",
        content: "Lobby and 18 rooms fully renovated. Reopened to guests with strong initial bookings.",
        date: "2026-05-30",
        type: "update",
      },
    ],
    milestones: [
      { id: "m5a", title: "Phase 1 – Lobby & 18 Rooms", description: "Renovation and smart-room fitout complete", status: "completed", dueDate: "2026-05-15", amount: 20000000 },
      { id: "m5b", title: "Phase 2 – Remaining 24 Rooms", description: "Full hotel renovation and technology upgrade", status: "active", dueDate: "2026-09-01", amount: 22000000 },
      { id: "m5c", title: "Soft Launch & Marketing Push", description: "Rebranding, OTA listing updates and corporate sales", status: "pending", dueDate: "2026-11-01", amount: 10000000 },
      { id: "m5d", title: "Occupancy Target 90%", description: "Sustained 90% occupancy triggering final profit-share", status: "pending", dueDate: "2027-03-01", amount: 8000000 },
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
    employeeCount: 11,
    revenueRange: "₦18M–₦30M/yr",
    fundingGoal: 20000000,
    amountRaised: 5000000,
    minInvestment: 50000,
    expectedRoi: "28–35%",
    duration: "18 months",
    trustScore: 68,
    riskLevel: "high",
    riskCategory: "D",
    verificationStatus: "partial",
    kybStage: 3,
    brfrStatus: "orange",
    investmentType: "Profit Share",
    investorCount: 14,
    daysLeft: 60,
    updates: [],
    milestones: [
      { id: "m6a", title: "Abuja Location – Lease", description: "Secure and sign lease for Abuja coworking space", status: "active", dueDate: "2026-07-01", amount: 5000000 },
      { id: "m6b", title: "Abuja Fitout & Launch", description: "Renovate and open Abuja location with 150 desks", status: "pending", dueDate: "2026-10-01", amount: 8000000 },
      { id: "m6c", title: "Ibadan Location – Lease & Launch", description: "Expand into Ibadan market", status: "pending", dueDate: "2027-02-01", amount: 7000000 },
    ],
  },
  {
    id: "7",
    name: "GreenHouse Agro Ltd",
    industry: "Agriculture",
    sector: "Horticulture",
    description:
      "Hydroponic vegetable farming supplying premium supermarkets and restaurants in Abuja. Seeking expansion capital for two new greenhouse facilities.",
    location: "Kubwa, Abuja",
    yearsOperating: 2,
    employeeCount: 14,
    revenueRange: "₦12M–₦20M/yr",
    fundingGoal: 18000000,
    amountRaised: 0,
    minInvestment: 50000,
    expectedRoi: "20–26%",
    duration: "24 months",
    trustScore: 58,
    riskLevel: "high",
    riskCategory: "D",
    verificationStatus: "pending",
    kybStage: 2,
    brfrStatus: "green",
    investmentType: "Profit Share",
    investorCount: 0,
    daysLeft: 90,
    updates: [],
    milestones: [
      { id: "m7a", title: "Greenhouse #1 Construction", description: "Build and equip first hydroponic greenhouse", status: "pending", dueDate: "2026-10-01", amount: 9000000 },
      { id: "m7b", title: "Greenhouse #2 Construction", description: "Second greenhouse and cold storage", status: "pending", dueDate: "2027-03-01", amount: 9000000 },
    ],
  },
  {
    id: "8",
    name: "TechBridge Solutions",
    industry: "Technology",
    sector: "Fintech",
    description:
      "B2B payment infrastructure enabling MSME merchants to accept card and mobile payments across Nigeria. Seeking seed round for hardware deployment.",
    location: "Ikeja, Lagos",
    yearsOperating: 1,
    employeeCount: 8,
    revenueRange: "₦5M–₦12M/yr",
    fundingGoal: 12000000,
    amountRaised: 0,
    minInvestment: 50000,
    expectedRoi: "35–45%",
    duration: "18 months",
    trustScore: 52,
    riskLevel: "high",
    riskCategory: "E",
    verificationStatus: "pending",
    kybStage: 1,
    brfrStatus: "green",
    investmentType: "Fixed Return",
    investorCount: 0,
    daysLeft: 90,
    updates: [],
    milestones: [
      { id: "m8a", title: "POS Terminal Deployment – Batch 1", description: "Deploy 200 terminals to Lagos merchants", status: "pending", dueDate: "2026-09-01", amount: 6000000 },
      { id: "m8b", title: "Transaction Volume Target", description: "Reach ₦500M monthly transaction volume", status: "pending", dueDate: "2027-01-01", amount: 6000000 },
    ],
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

export const DISPUTES: DisputeRecord[] = [
  {
    id: "disp-1",
    reference: "INV-0042",
    businessId: "1",
    businessName: "Lagos Pharma Distributors",
    investorId: "inv1",
    investorName: "Tosin Adebayo",
    investmentId: "inv1",
    category: "Milestone Delay",
    subject: "Milestone 3 delivery moved without notice",
    details:
      "The investor reports that the fleet expansion milestone was shifted after the expected release window and wants an updated recovery timeline.",
    status: "open",
    priority: "high",
    createdAt: "2026-06-12",
    updatedAt: "2026-06-12",
    evidenceCount: 2,
  },
  {
    id: "disp-2",
    reference: "INV-0043",
    businessId: "5",
    businessName: "Lekki Suites Hotel",
    investorId: "inv3",
    investorName: "Sola Martins",
    investmentId: "inv3",
    category: "Payout Review",
    subject: "Return timing clarification",
    details:
      "The investor asked for a confirmation on the next revenue-share date after the renovation update was published.",
    status: "under_review",
    priority: "medium",
    createdAt: "2026-06-09",
    updatedAt: "2026-06-11",
    evidenceCount: 1,
    assignedTo: "Operations Desk",
    response: "Investor was informed of the updated payout schedule and the next milestone release window.",
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
  {
    id: "n6",
    title: "Market Listing",
    body: "A Lagos Pharma investment slot is now listed on the Secondary Market.",
    time: "3 weeks ago",
    read: true,
    type: "investment",
  },
];

export const MARKET_LISTINGS: MarketListing[] = [
  {
    id: "ml1",
    businessId: "1",
    businessName: "Lagos Pharma Distributors",
    industry: "Pharmaceuticals",
    sector: "Healthcare",
    originalAmount: 500000,
    askPrice: 520000,
    expectedReturn: 625000,
    maturityDate: "Aug 2027",
    daysToMaturity: 426,
    roi: "25%",
    premiumDiscount: 4,
    sellerType: "retail",
    listedDate: "Jun 10, 2026",
    trustScore: 87,
  },
  {
    id: "ml2",
    businessId: "3",
    businessName: "Kano Agro-Processing Ltd",
    industry: "Agriculture",
    sector: "Agro-processing",
    originalAmount: 1000000,
    askPrice: 980000,
    expectedReturn: 1210000,
    maturityDate: "Jan 2027",
    daysToMaturity: 212,
    roi: "21%",
    premiumDiscount: -2,
    sellerType: "institutional",
    listedDate: "Jun 8, 2026",
    trustScore: 91,
  },
  {
    id: "ml3",
    businessId: "5",
    businessName: "Lekki Suites Hotel",
    industry: "Hospitality",
    sector: "Hotels",
    originalAmount: 500000,
    askPrice: 495000,
    expectedReturn: 585000,
    maturityDate: "Sep 2028",
    daysToMaturity: 820,
    roi: "17%",
    premiumDiscount: -1,
    sellerType: "retail",
    listedDate: "Jun 5, 2026",
    trustScore: 83,
  },
  {
    id: "ml4",
    businessId: "4",
    businessName: "PH Logistics Fleet",
    industry: "Logistics",
    sector: "Transport",
    originalAmount: 200000,
    askPrice: 215000,
    expectedReturn: 256000,
    maturityDate: "Dec 2026",
    daysToMaturity: 180,
    roi: "28%",
    premiumDiscount: 7.5,
    sellerType: "institutional",
    listedDate: "Jun 11, 2026",
    trustScore: 74,
  },
  {
    id: "ml5",
    businessId: "2",
    businessName: "Abuja Solar Energy Co.",
    industry: "Renewable Energy",
    sector: "Energy",
    originalAmount: 300000,
    askPrice: 310000,
    expectedReturn: 414000,
    maturityDate: "Mar 2027",
    daysToMaturity: 274,
    roi: "38%",
    premiumDiscount: 3.3,
    sellerType: "retail",
    listedDate: "Jun 9, 2026",
    trustScore: 79,
  },
];

export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: "mt1",
    businessId: "1",
    businessName: "Lagos Pharma Distributors",
    industry: "Pharmaceuticals",
    lastMessage: "Thanks for your continued support! Our Q2 report is attached.",
    timestamp: "2h ago",
    unread: 2,
    initials: "LP",
    color: "#1a5e9a",
  },
  {
    id: "mt2",
    businessId: "3",
    businessName: "Kano Agro-Processing Ltd",
    industry: "Agriculture",
    lastMessage: "We've hit the 70% funding milestone! See the latest update.",
    timestamp: "1d ago",
    unread: 0,
    initials: "KA",
    color: "#2db56e",
  },
  {
    id: "mt3",
    businessId: "5",
    businessName: "Lekki Suites Hotel",
    industry: "Hospitality",
    lastMessage: "Your quarterly returns have been processed successfully.",
    timestamp: "3d ago",
    unread: 1,
    initials: "LS",
    color: "#e08c1a",
  },
  {
    id: "mt4",
    businessId: "2",
    businessName: "Abuja Solar Energy Co.",
    industry: "Energy",
    lastMessage: "Investment matured. Final return of ₦264,000 sent to wallet.",
    timestamp: "1w ago",
    unread: 0,
    initials: "AS",
    color: "#7c3aed",
  },
];

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: "tx1", type: "deposit", amount: 2000000, description: "Bank Transfer — Zenith Bank", date: "Jun 1, 2026", status: "completed" },
  { id: "tx2", type: "investment", amount: -1000000, description: "Investment: Lekki Suites Hotel", date: "Sep 10, 2025", status: "completed" },
  { id: "tx3", type: "return", amount: 264000, description: "Return: Abuja Solar Energy Co.", date: "Jun 1, 2026", status: "completed" },
  { id: "tx4", type: "investment", amount: -500000, description: "Investment: Lagos Pharma Distributors", date: "Feb 14, 2026", status: "completed" },
  { id: "tx5", type: "investment", amount: -300000, description: "Investment: Kano Agro-Processing", date: "Jan 20, 2026", status: "completed" },
  { id: "tx6", type: "fee", amount: -2640, description: "Platform fee (1%) — Solar return", date: "Jun 1, 2026", status: "completed" },
  { id: "tx7", type: "deposit", amount: 500000, description: "Bank Transfer — GTBank", date: "Jan 10, 2026", status: "completed" },
];

export const PORTFOLIO_GROWTH: PortfolioDataPoint[] = [
  { month: "Jan", value: 500000 },
  { month: "Feb", value: 1100000 },
  { month: "Mar", value: 1100000 },
  { month: "Apr", value: 1800000 },
  { month: "May", value: 2064000 },
  { month: "Jun", value: 2000000 },
];

export const SECTOR_ALLOCATIONS: SectorAllocation[] = [
  { sector: "Hospitality", percentage: 50, color: "#e08c1a", amount: 1000000 },
  { sector: "Healthcare", percentage: 25, color: "#1a5e9a", amount: 500000 },
  { sector: "Agriculture", percentage: 15, color: "#2db56e", amount: 300000 },
  { sector: "Energy", percentage: 10, color: "#7c3aed", amount: 200000 },
];

export const BUSINESS_MONTHLY: { month: string; investors: number; raised: number }[] = [
  { month: "Jan", investors: 8, raised: 2000000 },
  { month: "Feb", investors: 15, raised: 5500000 },
  { month: "Mar", investors: 24, raised: 9000000 },
  { month: "Apr", investors: 32, raised: 13500000 },
  { month: "May", investors: 41, raised: 16000000 },
  { month: "Jun", investors: 47, raised: 18750000 },
];

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP / REFERENCE DATA  (seeded into DB; replace these arrays with queries)
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRIES: string[] = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Ethiopia", "Egypt",
  "Tanzania", "Uganda", "Rwanda", "Senegal", "Côte d'Ivoire", "Cameroon",
  "Zambia", "Zimbabwe", "Mozambique", "Botswana", "Malawi",
];

export const INDUSTRIES: string[] = [
  "Agriculture", "Healthcare", "Logistics", "Technology", "Hospitality",
  "Real Estate", "Manufacturing", "Retail", "Energy", "Education", "Finance", "Other",
];

export const INVESTMENT_GOALS: string[] = [
  "Grow wealth", "Passive income", "Retirement planning", "Save for future", "Diversify portfolio",
];

export const RISK_OPTIONS: { label: string; sub: string; icon: string }[] = [
  { label: "Conservative", sub: "Preserve capital, low risk",      icon: "shield" },
  { label: "Moderate",     sub: "Balanced growth & safety",        icon: "activity" },
  { label: "Aggressive",   sub: "High growth, higher risk",        icon: "trending-up" },
];

export const EXPERIENCE_OPTIONS: string[] = [
  "First timer", "1–2 years", "3–5 years", "5+ years",
];

export const INCOME_RANGES: string[] = [
  "Below ₦100k/mo", "₦100k – ₦500k/mo", "₦500k – ₦1M/mo", "Above ₦1M/mo",
];

export const FUND_SOURCES: string[] = [
  "Salary / Employment", "Business income", "Inheritance", "Savings", "Investments / Dividends",
];

export const BUSINESS_TYPES: string[] = [
  "Sole Proprietorship", "Partnership", "Limited Liability (LLC)", "NGO / Non-profit",
];

export const YEARS_OPERATING: string[] = [
  "Less than 1 year", "1–2 years", "3–5 years", "5+ years",
];

export const ANNUAL_REVENUE: string[] = [
  "Below ₦1M", "₦1M – ₦5M", "₦5M – ₦20M", "Above ₦20M",
];

export const INVESTMENT_TYPES: string[] = [
  "Profit Share", "Fixed Return", "Asset-Backed", "Asset Leasing", "Working Capital",
];

export const INVESTMENT_DURATIONS: string[] = [
  "6 months", "12 months", "18 months", "24 months", "30 months", "36 months",
];

export const DISPUTE_CATEGORIES: string[] = [
  "Milestone Delay", "Payout Delay", "Communication Gap", "Document Issue", "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM CONFIG  (stored in DB; drives KYC, Pro, and referral features)
// ─────────────────────────────────────────────────────────────────────────────

export interface KycTier {
  tier: number;
  label: string;
  limit: string;
  status: "verified" | "in_progress" | "locked";
  requirements: string[];
  description: string;
}

export const KYC_TIERS: KycTier[] = [
  {
    tier: 1,
    label: "Tier 1 — Basic",
    limit: "₦500K/investment",
    status: "verified",
    requirements: ["Valid NIN or BVN", "Email verification", "Phone number"],
    description: "Identity verified. You can invest up to ₦500,000 per opportunity.",
  },
  {
    tier: 2,
    label: "Tier 2 — Enhanced",
    limit: "₦5M/investment",
    status: "in_progress",
    requirements: ["National ID card or Passport", "Utility bill (last 3 months)", "Bank statement"],
    description: "Enhanced due diligence for larger investments up to ₦5 million.",
  },
  {
    tier: 3,
    label: "Tier 3 — Institutional",
    limit: "Unlimited",
    status: "locked",
    requirements: ["CAC registration documents", "Board resolution", "Audited financials (2 years)"],
    description: "Full institutional access with no investment limits.",
  },
];

export interface ProBenefit { icon: string; label: string; desc: string; }
export interface ProPlan    { id: string; label: string; price: number; period: string; saving: string | null; popular: boolean; }

export const PRO_BENEFITS: ProBenefit[] = [
  { icon: "zap",        label: "Early Access",          desc: "Get 24-hour early access to new investment listings" },
  { icon: "bar-chart-2",label: "Advanced Analytics",    desc: "Deep portfolio analysis with risk scores and projections" },
  { icon: "repeat",     label: "Priority Market",       desc: "First pick on Secondary Market listings at par value" },
  { icon: "shield",     label: "Investment Insurance",  desc: "Up to ₦2M coverage on eligible investments" },
  { icon: "headphones", label: "Dedicated Support",     desc: "Priority chat & phone support with 2-hour response SLA" },
];

export const PRO_PLANS: ProPlan[] = [
  { id: "monthly",   label: "Monthly",   price: 5000,  period: "/month",     saving: null,       popular: false },
  { id: "quarterly", label: "Quarterly", price: 12000, period: "/3 months",  saving: "Save 20%", popular: true  },
  { id: "annual",    label: "Annual",    price: 40000, period: "/year",       saving: "Save 33%", popular: false },
];

export interface ReferralStep { step: string; label: string; desc: string; }
export const REFERRAL_HOW_IT_WORKS: ReferralStep[] = [
  { step: "1", label: "Share your code",  desc: "Send your unique referral link or code to friends & family" },
  { step: "2", label: "They sign up",     desc: "Your referral registers and completes KYC verification" },
  { step: "3", label: "Earn ₦5,000",     desc: "You get ₦5,000 in your wallet when they make their first investment" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO / SEED RECORDS  (replace with live DB queries once connected)
// ─────────────────────────────────────────────────────────────────────────────

export interface MockInvestor {
  id: string; name: string; email: string; country: string;
  kyc: string; invested: number; investments: number; joined: string; status: string;
}

export const MOCK_INVESTORS: MockInvestor[] = [
  { id: "1", name: "Adebayo Okafor",  email: "investor@cofund.africa",      country: "Nigeria", kyc: "Tier 2", invested: 2500000, investments: 4, joined: "Jan 2025", status: "active" },
  { id: "2", name: "Chioma Eze",      email: "chioma.eze@gmail.com",        country: "Nigeria", kyc: "Tier 1", invested: 850000,  investments: 2, joined: "Feb 2025", status: "active" },
  { id: "3", name: "Kwame Mensah",    email: "kwame.m@outlook.com",         country: "Ghana",   kyc: "None",   invested: 0,       investments: 0, joined: "Mar 2025", status: "pending_kyc" },
  { id: "4", name: "Fatima Al-Hassan",email: "fatima.h@proton.me",          country: "Nigeria", kyc: "Tier 1", invested: 1200000, investments: 3, joined: "Jan 2025", status: "active" },
  { id: "5", name: "Emeka Obi",       email: "emeka.obi@yahoo.com",         country: "Nigeria", kyc: "Tier 2", invested: 5000000, investments: 7, joined: "Nov 2024", status: "active" },
  { id: "6", name: "Amina Yusuf",     email: "aminayusuf@gmail.com",        country: "Nigeria", kyc: "None",   invested: 0,       investments: 0, joined: "Apr 2025", status: "suspended" },
];

export interface ReferralHistoryItem { id: string; name: string; joined: string; status: string; earned: number; }
export const MOCK_REFERRAL_HISTORY: ReferralHistoryItem[] = [
  { id: "r1", name: "Chukwuemeka O.", joined: "Jun 2, 2026",  status: "invested",    earned: 5000 },
  { id: "r2", name: "Fatima A.",      joined: "May 18, 2026", status: "invested",    earned: 5000 },
  { id: "r3", name: "Tunde B.",       joined: "May 5, 2026",  status: "invested",    earned: 5000 },
  { id: "r4", name: "Ngozi E.",       joined: "Apr 22, 2026", status: "registered",  earned: 0    },
  { id: "r5", name: "Bello M.",       joined: "Apr 10, 2026", status: "invested",    earned: 5000 },
];

export interface RevenueDataPoint { month: string; value: number; label: string; }
export const ADMIN_REVENUE_DATA: RevenueDataPoint[] = [
  { month: "Jan", value: 28, label: "₦28M" },
  { month: "Feb", value: 34, label: "₦34M" },
  { month: "Mar", value: 31, label: "₦31M" },
  { month: "Apr", value: 42, label: "₦42M" },
  { month: "May", value: 38, label: "₦38M" },
  { month: "Jun", value: 48, label: "₦48M" },
];

export interface InvestmentBreakdownItem { label: string; percent: number; color: string; }
export const ADMIN_INVESTMENT_BREAKDOWN: InvestmentBreakdownItem[] = [
  { label: "Profit Share",  percent: 42, color: "#1a5e9a" },
  { label: "Fixed Return",  percent: 28, color: "#2db56e" },
  { label: "Asset-Backed",  percent: 18, color: "#c9860d" },
  { label: "Real Estate",   percent: 12, color: "#7c3aed" },
];

export interface AdminTransaction { type: string; label: string; amount: string; date: string; icon: string; color: string; }
export const ADMIN_RECENT_TRANSACTIONS: AdminTransaction[] = [
  { type: "investment", label: "New investment — Lagos Pharma",          amount: "+₦500,000",     date: "Today 09:14",  icon: "trending-up",  color: "#2db56e" },
  { type: "payout",     label: "Payout — Batch #13",                     amount: "-₦12,400,000",  date: "Yesterday",    icon: "download",     color: "#e03e3e" },
  { type: "fee",        label: "Platform fee — TechBridge Solutions",    amount: "+₦85,000",      date: "Jun 10",       icon: "dollar-sign",  color: "#c9860d" },
  { type: "investment", label: "New investment — GreenHouse Agro",       amount: "+₦1,200,000",   date: "Jun 9",        icon: "trending-up",  color: "#2db56e" },
  { type: "listing",    label: "SME listing fee — Apex Logistics",       amount: "+₦150,000",     date: "Jun 8",        icon: "package",      color: "#7c3aed" },
];

export interface PlatformStat { label: string; value: string; icon: string; color: string; change: string; }
export const ADMIN_PLATFORM_STATS: PlatformStat[] = [
  { label: "Total Users",       value: "1,248",   icon: "users",        color: "#7c3aed", change: "+12 this week" },
  { label: "Active Businesses", value: "87",      icon: "briefcase",    color: "#1a5e9a", change: "+4 this week" },
  { label: "Total Invested",    value: "₦2.4B",   icon: "trending-up",  color: "#2db56e", change: "+₦180M this month" },
  { label: "Platform Revenue",  value: "₦48.2M",  icon: "dollar-sign",  color: "#c9860d", change: "+₦6.1M this month" },
];

export interface PendingAction { type: string; label: string; sub: string; icon: string; color: string; route: string; }
export const ADMIN_PENDING_ACTIONS: PendingAction[] = [
  { type: "kyb",     label: "GreenHouse Agro Ltd",          sub: "Stage 2 KYB — director IDs & BVN submitted, awaiting AML screen",    icon: "shield",         color: "#e08c1a", route: "/(admin)/businesses" },
  { type: "kyb",     label: "TechBridge Solutions",          sub: "Stage 1 eligibility review — CAC cert received",                      icon: "file-text",      color: "#e08c1a", route: "/(admin)/businesses" },
  { type: "brfr",    label: "TechHub Coworking Network",     sub: "BRRF: Orange — missed Q1 milestone, recovery plan requested",         icon: "alert-triangle", color: "#e06030", route: "/(admin)/businesses" },
  { type: "payout",  label: "Investor Payout Batch #14",     sub: "₦12.4M scheduled for escrow release — approve now",                  icon: "dollar-sign",    color: "#2db56e", route: "/(admin)/reports"    },
  { type: "dispute", label: "Dispute: INV-0042",              sub: "Investor raised concern on Lagos Pharma milestone 3",                 icon: "alert-circle",   color: "#e03e3e", route: "/(admin)/disputes"   },
];
