-- ============================================================
--  CoFund Platform — PostgreSQL Database Schema
--  Run this against a fresh Supabase project.
--  After running, delete demo data from constants/mockData.ts
--  and replace with live Supabase queries.
-- ============================================================

-- EXTENSIONS ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  LOOKUP / REFERENCE TABLES
--  These are seeded once and treated as read-only config.
-- ============================================================

CREATE TABLE industries (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE countries (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE investment_goals (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE risk_profiles (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  sub   TEXT,
  icon  TEXT
);

CREATE TABLE experience_levels (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE income_ranges (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE fund_sources (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE business_types (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE years_operating_options (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE annual_revenue_ranges (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE investment_types (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE investment_durations (
  id     SERIAL PRIMARY KEY,
  label  TEXT NOT NULL UNIQUE,
  months INTEGER NOT NULL
);

CREATE TABLE dispute_categories (
  id    SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE kyb_stages (
  stage INTEGER PRIMARY KEY,
  label TEXT NOT NULL
);

CREATE TABLE kyc_tiers (
  tier              INTEGER PRIMARY KEY,
  label             TEXT NOT NULL,
  investment_limit  TEXT NOT NULL,
  description       TEXT,
  requirements      TEXT[] NOT NULL
);

CREATE TABLE pro_plans (
  id        TEXT PRIMARY KEY,
  label     TEXT NOT NULL,
  price_ngn INTEGER NOT NULL,
  period    TEXT NOT NULL,
  saving    TEXT
);

-- ============================================================
--  MAIN DATA TABLES
-- ============================================================

-- Users / Profiles ──────────────────────────────────────────
CREATE TABLE profiles (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT        UNIQUE NOT NULL,
  name              TEXT,
  role              TEXT        NOT NULL CHECK (role IN ('investor', 'business', 'admin')),
  phone             TEXT,
  country           TEXT,
  bio               TEXT,
  avatar            TEXT,
  wallet_balance    NUMERIC(15,2) NOT NULL DEFAULT 0,
  -- investor fields
  investment_goal   TEXT,
  risk_profile      TEXT,
  experience_level  TEXT,
  income_range      TEXT,
  fund_source       TEXT,
  -- business owner fields
  business_name     TEXT,
  cac_number        TEXT,
  business_type     TEXT,
  industry          TEXT,
  years_operating   TEXT,
  annual_revenue    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Businesses ────────────────────────────────────────────────
CREATE TABLE businesses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  industry            TEXT,
  sector              TEXT,
  description         TEXT,
  location            TEXT,
  years_operating     INTEGER,
  employee_count      INTEGER,
  revenue_range       TEXT,
  funding_goal        NUMERIC(15,2),
  amount_raised       NUMERIC(15,2) NOT NULL DEFAULT 0,
  min_investment      NUMERIC(15,2),
  expected_roi        TEXT,
  duration            TEXT,
  trust_score         INTEGER NOT NULL DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  risk_level          TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_category       CHAR(1) CHECK (risk_category IN ('A','B','C','D','E')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('verified','partial','pending')),
  kyb_stage           INTEGER NOT NULL DEFAULT 1 CHECK (kyb_stage BETWEEN 1 AND 5),
  brfr_status         TEXT NOT NULL DEFAULT 'green' CHECK (brfr_status IN ('green','yellow','orange','red')),
  investment_type     TEXT,
  investor_count      INTEGER NOT NULL DEFAULT 0,
  days_left           INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE business_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT,
  update_type TEXT CHECK (update_type IN ('milestone', 'report', 'update')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE business_milestones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed','active','pending')),
  due_date    DATE,
  amount      NUMERIC(15,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Investments ───────────────────────────────────────────────
CREATE TABLE investments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount_invested NUMERIC(15,2) NOT NULL,
  investment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','active','completed','defaulted','cancelled')),
  expected_return NUMERIC(15,2),
  maturity_date   DATE,
  roi_percent     NUMERIC(5,2),
  progress        NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wallet Transactions ───────────────────────────────────────
CREATE TABLE wallet_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','investment','return','fee')),
  amount      NUMERIC(15,2) NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','pending')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disputes ──────────────────────────────────────────────────
CREATE TABLE disputes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference      TEXT UNIQUE NOT NULL,
  business_id    UUID REFERENCES businesses(id) ON DELETE SET NULL,
  investor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  investment_id  UUID REFERENCES investments(id) ON DELETE SET NULL,
  category       TEXT,
  subject        TEXT NOT NULL,
  details        TEXT,
  status         TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open','under_review','resolved','escalated')),
  priority       TEXT NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low','medium','high','critical')),
  evidence_count INTEGER NOT NULL DEFAULT 0,
  response       TEXT,
  assigned_to    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications ─────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  type       TEXT CHECK (type IN ('opportunity','investment','update','return')),
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Secondary Market Listings ─────────────────────────────────
CREATE TABLE market_listings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investment_id    UUID REFERENCES investments(id) ON DELETE SET NULL,
  business_id      UUID REFERENCES businesses(id) ON DELETE SET NULL,
  seller_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  original_amount  NUMERIC(15,2),
  ask_price        NUMERIC(15,2),
  expected_return  NUMERIC(15,2),
  maturity_date    DATE,
  days_to_maturity INTEGER,
  roi_percent      NUMERIC(5,2),
  premium_discount NUMERIC(5,2),
  seller_type      TEXT CHECK (seller_type IN ('retail','institutional')),
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Message Threads ───────────────────────────────────────────
CREATE TABLE message_threads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_id  UUID REFERENCES businesses(id) ON DELETE CASCADE,
  last_message TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
--  SEED DATA — Lookup / Reference Tables
-- ============================================================

INSERT INTO industries (name) VALUES
  ('Agriculture'),('Healthcare'),('Logistics'),('Technology'),
  ('Hospitality'),('Real Estate'),('Manufacturing'),('Retail'),
  ('Energy'),('Education'),('Finance'),('Other');

INSERT INTO countries (name) VALUES
  ('Nigeria'),('Ghana'),('Kenya'),('South Africa'),('Ethiopia'),('Egypt'),
  ('Tanzania'),('Uganda'),('Rwanda'),('Senegal'),('Côte d''Ivoire'),('Cameroon'),
  ('Zambia'),('Zimbabwe'),('Mozambique'),('Botswana'),('Malawi');

INSERT INTO investment_goals (label) VALUES
  ('Grow wealth'),('Passive income'),('Retirement planning'),
  ('Save for future'),('Diversify portfolio');

INSERT INTO risk_profiles (label, sub, icon) VALUES
  ('Conservative', 'Preserve capital, low risk',   'shield'),
  ('Moderate',     'Balanced growth & safety',     'activity'),
  ('Aggressive',   'High growth, higher risk',     'trending-up');

INSERT INTO experience_levels (label) VALUES
  ('First timer'),('1–2 years'),('3–5 years'),('5+ years');

INSERT INTO income_ranges (label) VALUES
  ('Below ₦100k/mo'),('₦100k – ₦500k/mo'),('₦500k – ₦1M/mo'),('Above ₦1M/mo');

INSERT INTO fund_sources (label) VALUES
  ('Salary / Employment'),('Business income'),('Inheritance'),
  ('Savings'),('Investments / Dividends');

INSERT INTO business_types (label) VALUES
  ('Sole Proprietorship'),('Partnership'),('Limited Liability (LLC)'),('NGO / Non-profit');

INSERT INTO years_operating_options (label) VALUES
  ('Less than 1 year'),('1–2 years'),('3–5 years'),('5+ years');

INSERT INTO annual_revenue_ranges (label) VALUES
  ('Below ₦1M'),('₦1M – ₦5M'),('₦5M – ₦20M'),('Above ₦20M');

INSERT INTO investment_types (label) VALUES
  ('Profit Share'),('Fixed Return'),('Asset-Backed'),('Asset Leasing'),('Working Capital');

INSERT INTO investment_durations (label, months) VALUES
  ('6 months',6),('12 months',12),('18 months',18),
  ('24 months',24),('30 months',30),('36 months',36);

INSERT INTO dispute_categories (label) VALUES
  ('Milestone Delay'),('Payout Delay'),('Communication Gap'),('Document Issue'),('Other');

INSERT INTO kyb_stages (stage, label) VALUES
  (1,'Basic Eligibility'),
  (2,'Business Verification (KYB)'),
  (3,'Financial Assessment'),
  (4,'Operational Assessment'),
  (5,'Investment Readiness');

INSERT INTO kyc_tiers (tier, label, investment_limit, description, requirements) VALUES
  (1,'Tier 1 — Basic','₦500K/investment',
   'Identity verified. You can invest up to ₦500,000 per opportunity.',
   ARRAY['Valid NIN or BVN','Email verification','Phone number']),
  (2,'Tier 2 — Enhanced','₦5M/investment',
   'Enhanced due diligence for larger investments up to ₦5 million.',
   ARRAY['National ID card or Passport','Utility bill (last 3 months)','Bank statement']),
  (3,'Tier 3 — Institutional','Unlimited',
   'Full institutional access with no investment limits.',
   ARRAY['CAC registration documents','Board resolution','Audited financials (2 years)']);

INSERT INTO pro_plans (id, label, price_ngn, period, saving) VALUES
  ('monthly',   'Monthly',   5000,  '/month',    NULL),
  ('quarterly', 'Quarterly', 12000, '/3 months', 'Save 20%'),
  ('annual',    'Annual',    40000, '/year',      'Save 33%');

-- ============================================================
--  ROW LEVEL SECURITY (enable after seeding)
-- ============================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_updates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads     ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own row; admins can read all
CREATE POLICY "profiles_self" ON profiles
  USING (auth.uid() = id);

-- Businesses: public read for verified; owners can update their own
CREATE POLICY "businesses_public_read" ON businesses
  FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "businesses_owner_write" ON businesses
  USING (auth.uid() = owner_id);

-- Investments: investors see their own
CREATE POLICY "investments_own" ON investments
  USING (auth.uid() = investor_id);

-- Wallet transactions: own only
CREATE POLICY "wallet_own" ON wallet_transactions
  USING (auth.uid() = profile_id);

-- Disputes: investor or admin can see
CREATE POLICY "disputes_participant" ON disputes
  USING (auth.uid() = investor_id);

-- Notifications: own only
CREATE POLICY "notifications_own" ON notifications
  USING (auth.uid() = profile_id);

-- Market listings: public read
CREATE POLICY "market_listings_read" ON market_listings
  FOR SELECT USING (status = 'active');

-- Message threads: participant only
CREATE POLICY "threads_participant" ON message_threads
  USING (auth.uid() = investor_id OR auth.uid() = business_id);

-- ============================================================
--  DEMO ACCOUNTS (created via Supabase Auth + trigger)
--  investor@cofund.africa  — role: investor
--  business@cofund.africa  — role: business
--  admin@cofund.africa     — role: admin
--  Password: any (demo mode)
-- ============================================================
