-- ============================================================
-- CoFund Platform — Supabase Schema
-- Run this in your Supabase SQL editor (Database > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  email           text not null unique,
  phone           text default '',
  country         text default 'Nigeria',
  role            text not null check (role in ('investor', 'business', 'admin')) default 'investor',
  wallet_balance  numeric(18, 2) not null default 0,
  avatar          text,
  bio             text,
  date_of_birth   text,
  bvn             text,
  -- Investor fields
  investment_goal        text,
  risk_tolerance         text,
  investment_experience  text,
  income_range           text,
  source_of_funds        text,
  -- Business fields
  business_name   text,
  cac_number      text,
  business_type   text,
  years_operating text,
  annual_revenue  text,
  referral_code   text,
  agreed_to_terms boolean default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Row-level security
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile after Supabase Auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'investor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- BUSINESSES
-- ============================================================
create table if not exists public.businesses (
  id                  uuid primary key default uuid_generate_v4(),
  owner_id            uuid references public.profiles(id) on delete set null,
  name                text not null,
  industry            text not null,
  sector              text not null,
  description         text not null,
  location            text not null,
  years_operating     int not null default 0,
  employee_count      int not null default 0,
  revenue_range       text default '',
  funding_goal        numeric(18, 2) not null,
  amount_raised       numeric(18, 2) not null default 0,
  min_investment      numeric(18, 2) not null,
  expected_roi        text not null,
  duration            text not null,
  trust_score         int not null default 50,
  risk_level          text not null check (risk_level in ('low', 'medium', 'high')) default 'medium',
  risk_category       text not null check (risk_category in ('A','B','C','D','E')) default 'C',
  verification_status text not null check (verification_status in ('verified','partial','pending')) default 'pending',
  kyb_stage           int not null check (kyb_stage between 1 and 5) default 1,
  brfr_status         text not null check (brfr_status in ('green','yellow','orange','red')) default 'green',
  investment_type     text not null,
  investor_count      int not null default 0,
  days_left           int not null default 90,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.businesses enable row level security;

-- Anyone can read active businesses
create policy "Anyone can read active businesses"
  on public.businesses for select
  using (is_active = true);

-- Business owners can update their own
create policy "Owners can update own business"
  on public.businesses for update
  using (auth.uid() = owner_id);

-- Admins can do everything
create policy "Admins have full business access"
  on public.businesses for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.handle_updated_at();


-- ============================================================
-- MILESTONES (escrow-linked funding tranches per business)
-- ============================================================
create table if not exists public.milestones (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  title        text not null,
  description  text default '',
  status       text not null check (status in ('completed','active','pending')) default 'pending',
  due_date     date,
  amount       numeric(18, 2) not null default 0,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.milestones enable row level security;

create policy "Anyone can read milestones"
  on public.milestones for select using (true);

create policy "Admins can manage milestones"
  on public.milestones for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create trigger milestones_updated_at
  before update on public.milestones
  for each row execute function public.handle_updated_at();


-- ============================================================
-- BUSINESS UPDATES (progress posts)
-- ============================================================
create table if not exists public.business_updates (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  author_id    uuid references public.profiles(id) on delete set null,
  title        text not null,
  content      text not null,
  update_type  text not null check (update_type in ('milestone','report','update')) default 'update',
  created_at   timestamptz not null default now()
);

alter table public.business_updates enable row level security;

create policy "Anyone can read business updates"
  on public.business_updates for select using (true);

create policy "Owners and admins can insert updates"
  on public.business_updates for insert
  with check (
    auth.uid() = author_id or
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );


-- ============================================================
-- INVESTMENTS
-- ============================================================
create table if not exists public.investments (
  id              uuid primary key default uuid_generate_v4(),
  investor_id     uuid not null references public.profiles(id) on delete cascade,
  business_id     uuid not null references public.businesses(id) on delete cascade,
  amount          numeric(18, 2) not null,
  platform_fee    numeric(18, 2) not null default 0,
  status          text not null check (status in ('pending','active','completed','defaulted','cancelled')) default 'pending',
  investment_type text not null,
  expected_roi    text not null,
  duration        text not null,
  start_date      date not null default current_date,
  end_date        date,
  returns_paid    numeric(18, 2) not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.investments enable row level security;

create policy "Investors can read own investments"
  on public.investments for select
  using (auth.uid() = investor_id);

create policy "Investors can create investments"
  on public.investments for insert
  with check (auth.uid() = investor_id);

create policy "Admins can read all investments"
  on public.investments for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create trigger investments_updated_at
  before update on public.investments
  for each row execute function public.handle_updated_at();


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  body         text not null,
  type         text not null check (type in ('opportunity','investment','update','return','kyb','brfr')) default 'update',
  is_read      boolean not null default false,
  action_url   text,
  created_at   timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Admins can send notifications to anyone"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );


-- ============================================================
-- HELPFUL VIEWS
-- ============================================================

-- Summary stats per business (for admin dashboard)
create or replace view public.business_stats as
select
  b.id,
  b.name,
  b.kyb_stage,
  b.brfr_status,
  b.verification_status,
  b.trust_score,
  b.amount_raised,
  b.funding_goal,
  round((b.amount_raised / nullif(b.funding_goal, 0)) * 100, 1) as progress_pct,
  count(distinct i.id) as investor_count,
  coalesce(sum(i.amount), 0) as total_invested
from public.businesses b
left join public.investments i on i.business_id = b.id and i.status = 'active'
group by b.id;

-- Platform-level KPIs (for admin dashboard hero card)
create or replace view public.platform_kpis as
select
  count(distinct p.id) filter (where p.role = 'investor') as total_investors,
  count(distinct p.id) filter (where p.role = 'business') as total_businesses,
  count(distinct b.id) filter (where b.verification_status = 'verified') as verified_businesses,
  count(distinct b.id) filter (where b.brfr_status in ('orange','red')) as at_risk_businesses,
  coalesce(sum(i.amount), 0) as total_invested,
  count(distinct i.id) as total_investments
from public.profiles p
left join public.businesses b on true
left join public.investments i on i.status = 'active';


-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================
create table if not exists public.wallet_transactions (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('deposit','withdrawal','investment','return','fee')),
  amount      numeric(18,2) not null,
  description text not null default '',
  status      text not null check (status in ('completed','pending')) default 'completed',
  created_at  timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Users can read own transactions"
  on public.wallet_transactions for select
  using (auth.uid() = profile_id);

create policy "Admins can read all transactions"
  on public.wallet_transactions for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ============================================================
-- DISPUTES
-- ============================================================
create table if not exists public.disputes (
  id             uuid primary key default uuid_generate_v4(),
  reference      text unique not null,
  business_id    uuid references public.businesses(id) on delete set null,
  investor_id    uuid references public.profiles(id) on delete set null,
  investment_id  uuid references public.investments(id) on delete set null,
  category       text not null,
  subject        text not null,
  details        text not null default '',
  status         text not null check (status in ('open','under_review','resolved','escalated')) default 'open',
  priority       text not null check (priority in ('low','medium','high','critical')) default 'medium',
  evidence_count int not null default 0,
  response       text,
  assigned_to    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.disputes enable row level security;

create policy "Investor can read own disputes"
  on public.disputes for select using (auth.uid() = investor_id);

create policy "Investor can create disputes"
  on public.disputes for insert with check (auth.uid() = investor_id);

create policy "Admins have full dispute access"
  on public.disputes for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create trigger disputes_updated_at
  before update on public.disputes
  for each row execute function public.handle_updated_at();


-- ============================================================
-- SECONDARY MARKET LISTINGS
-- ============================================================
create table if not exists public.market_listings (
  id               uuid primary key default uuid_generate_v4(),
  investment_id    uuid references public.investments(id) on delete set null,
  business_id      uuid references public.businesses(id) on delete set null,
  seller_id        uuid references public.profiles(id) on delete set null,
  original_amount  numeric(18,2) not null,
  ask_price        numeric(18,2) not null,
  expected_return  numeric(18,2),
  maturity_date    date,
  days_to_maturity int,
  roi_percent      numeric(5,2),
  premium_discount numeric(5,2) default 0,
  seller_type      text check (seller_type in ('retail','institutional')) default 'retail',
  status           text not null check (status in ('active','sold','cancelled')) default 'active',
  created_at       timestamptz not null default now()
);

alter table public.market_listings enable row level security;

create policy "Anyone can read active listings"
  on public.market_listings for select using (status = 'active');

create policy "Sellers can manage own listings"
  on public.market_listings for all using (auth.uid() = seller_id);


-- ============================================================
-- MESSAGE THREADS
-- ============================================================
create table if not exists public.message_threads (
  id           uuid primary key default uuid_generate_v4(),
  investor_id  uuid references public.profiles(id) on delete cascade,
  business_id  uuid references public.businesses(id) on delete cascade,
  last_message text,
  unread_count int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.message_threads enable row level security;

create policy "Participants can read own threads"
  on public.message_threads for select
  using (auth.uid() = investor_id or auth.uid() = business_id);

create trigger message_threads_updated_at
  before update on public.message_threads
  for each row execute function public.handle_updated_at();


-- ============================================================
-- LOOKUP / REFERENCE TABLES  (required seed data)
-- These drive dropdowns, validation, and KYC logic.
-- They never change after launch — seed once, query forever.
-- ============================================================

create table if not exists public.industries (
  id   serial primary key,
  name text not null unique
);

create table if not exists public.countries (
  id   serial primary key,
  name text not null unique
);

create table if not exists public.investment_goals (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.risk_profiles (
  id    serial primary key,
  label text not null unique,
  sub   text,
  icon  text
);

create table if not exists public.experience_levels (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.income_ranges (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.fund_sources (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.business_types (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.years_operating_options (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.annual_revenue_ranges (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.investment_types (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.investment_durations (
  id     serial primary key,
  label  text not null unique,
  months int not null
);

create table if not exists public.dispute_categories (
  id    serial primary key,
  label text not null unique
);

create table if not exists public.kyb_stages (
  stage int primary key,
  label text not null
);

create table if not exists public.kyc_tiers (
  tier              int primary key,
  label             text not null,
  investment_limit  text not null,
  description       text,
  requirements      text[] not null
);

create table if not exists public.pro_plans (
  id        text primary key,
  label     text not null,
  price_ngn int not null,
  period    text not null,
  saving    text
);


-- ============================================================
-- SEED: Lookup / Reference Data  (run once, keep forever)
-- ============================================================

insert into public.industries (name) values
  ('Agriculture'),('Healthcare'),('Logistics'),('Technology'),
  ('Hospitality'),('Real Estate'),('Manufacturing'),('Retail'),
  ('Energy'),('Education'),('Finance'),('Other')
on conflict do nothing;

insert into public.countries (name) values
  ('Nigeria'),('Ghana'),('Kenya'),('South Africa'),('Ethiopia'),('Egypt'),
  ('Tanzania'),('Uganda'),('Rwanda'),('Senegal'),('Côte d''Ivoire'),('Cameroon'),
  ('Zambia'),('Zimbabwe'),('Mozambique'),('Botswana'),('Malawi')
on conflict do nothing;

insert into public.investment_goals (label) values
  ('Grow wealth'),('Passive income'),('Retirement planning'),
  ('Save for future'),('Diversify portfolio')
on conflict do nothing;

insert into public.risk_profiles (label, sub, icon) values
  ('Conservative', 'Preserve capital, low risk',  'shield'),
  ('Moderate',     'Balanced growth & safety',    'activity'),
  ('Aggressive',   'High growth, higher risk',    'trending-up')
on conflict do nothing;

insert into public.experience_levels (label) values
  ('First timer'),('1–2 years'),('3–5 years'),('5+ years')
on conflict do nothing;

insert into public.income_ranges (label) values
  ('Below ₦100k/mo'),('₦100k – ₦500k/mo'),('₦500k – ₦1M/mo'),('Above ₦1M/mo')
on conflict do nothing;

insert into public.fund_sources (label) values
  ('Salary / Employment'),('Business income'),('Inheritance'),
  ('Savings'),('Investments / Dividends')
on conflict do nothing;

insert into public.business_types (label) values
  ('Sole Proprietorship'),('Partnership'),('Limited Liability (LLC)'),('NGO / Non-profit')
on conflict do nothing;

insert into public.years_operating_options (label) values
  ('Less than 1 year'),('1–2 years'),('3–5 years'),('5+ years')
on conflict do nothing;

insert into public.annual_revenue_ranges (label) values
  ('Below ₦1M'),('₦1M – ₦5M'),('₦5M – ₦20M'),('Above ₦20M')
on conflict do nothing;

insert into public.investment_types (label) values
  ('Profit Share'),('Fixed Return'),('Asset-Backed'),('Asset Leasing'),('Working Capital')
on conflict do nothing;

insert into public.investment_durations (label, months) values
  ('6 months',6),('12 months',12),('18 months',18),
  ('24 months',24),('30 months',30),('36 months',36)
on conflict do nothing;

insert into public.dispute_categories (label) values
  ('Milestone Delay'),('Payout Delay'),('Communication Gap'),('Document Issue'),('Other')
on conflict do nothing;

insert into public.kyb_stages (stage, label) values
  (1,'Basic Eligibility'),
  (2,'Business Verification (KYB)'),
  (3,'Financial Assessment'),
  (4,'Operational Assessment'),
  (5,'Investment Readiness')
on conflict do nothing;

insert into public.kyc_tiers (tier, label, investment_limit, description, requirements) values
  (1, 'Tier 1 — Basic',          '₦500K/investment',
   'Identity verified. You can invest up to ₦500,000 per opportunity.',
   array['Valid NIN or BVN','Email verification','Phone number']),
  (2, 'Tier 2 — Enhanced',       '₦5M/investment',
   'Enhanced due diligence for larger investments up to ₦5 million.',
   array['National ID card or Passport','Utility bill (last 3 months)','Bank statement']),
  (3, 'Tier 3 — Institutional',  'Unlimited',
   'Full institutional access with no investment limits.',
   array['CAC registration documents','Board resolution','Audited financials (2 years)'])
on conflict do nothing;

insert into public.pro_plans (id, label, price_ngn, period, saving) values
  ('monthly',   'Monthly',   5000,  '/month',    null),
  ('quarterly', 'Quarterly', 12000, '/3 months', 'Save 20%'),
  ('annual',    'Annual',    40000, '/year',      'Save 33%')
on conflict do nothing;
