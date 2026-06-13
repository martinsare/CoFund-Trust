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
-- SEED: Insert demo businesses (matches mockData.ts)
-- ============================================================
-- NOTE: Run this AFTER creating users through Auth or
-- replace owner_id NULLs with real UUIDs from your auth.users table.

insert into public.businesses
  (name, industry, sector, description, location, years_operating, employee_count,
   revenue_range, funding_goal, amount_raised, min_investment, expected_roi,
   duration, trust_score, risk_level, risk_category, verification_status,
   kyb_stage, brfr_status, investment_type, investor_count, days_left)
values
  ('Lagos Pharma Distributors','Pharmaceuticals','Healthcare',
   'Leading pharmaceutical distributor serving 200+ pharmacies across Lagos and Ogun states.',
   'Lagos Island, Lagos', 7, 48, '₦180M–₦240M/yr', 25000000, 18750000, 100000,
   '22–28%','18 months', 87, 'low','B','verified', 5,'green','Profit Share', 47, 12),

  ('Abuja Solar Energy Co.','Renewable Energy','Energy',
   'Installing solar micro-grids for commercial and residential clients in FCT.',
   'Wuse 2, Abuja', 4, 22, '₦45M–₦70M/yr', 15000000, 9000000, 50000,
   '30–38%','24 months', 79, 'medium','C','verified', 5,'yellow','Fixed Return', 31, 28),

  ('Kano Agro-Processing Ltd','Agriculture','Agro-processing',
   'Processing and packaging groundnut oil and sesame products for export.',
   'Kano Industrial Estate', 9, 95, '₦320M–₦400M/yr', 40000000, 28000000, 300000,
   '18–24%','12 months', 91, 'low','A','verified', 5,'green','Asset-Backed', 68, 5),

  ('PH Logistics Fleet','Logistics','Transport',
   'B2B last-mile logistics serving e-commerce platforms in Rivers State.',
   'Port Harcourt, Rivers', 5, 35, '₦80M–₦120M/yr', 35000000, 12250000, 100000,
   '25–32%','30 months', 74, 'medium','C','verified', 4,'yellow','Asset Leasing', 24, 45),

  ('Lekki Suites Hotel','Hospitality','Hotels',
   'Boutique business hotel with 42 rooms in Lekki Phase 1.',
   'Lekki Phase 1, Lagos', 6, 62, '₦140M–₦180M/yr', 60000000, 42000000, 500000,
   '16–20%','36 months', 83, 'low','B','verified', 5,'green','Profit Share', 52, 8),

  ('TechHub Coworking Network','Technology','Real Estate',
   'Operating 3 coworking spaces in Lagos with 600+ active members.',
   'Victoria Island, Lagos', 3, 11, '₦18M–₦30M/yr', 20000000, 5000000, 50000,
   '28–35%','18 months', 68, 'high','D','partial', 3,'orange','Profit Share', 14, 60),

  ('GreenHouse Agro Ltd','Agriculture','Horticulture',
   'Hydroponic vegetable farming supplying premium supermarkets and restaurants in Abuja.',
   'Kubwa, Abuja', 2, 14, '₦12M–₦20M/yr', 18000000, 0, 50000,
   '20–26%','24 months', 58, 'high','D','pending', 2,'green','Profit Share', 0, 90),

  ('TechBridge Solutions','Technology','Fintech',
   'B2B payment infrastructure enabling MSME merchants to accept card and mobile payments.',
   'Ikeja, Lagos', 1, 8, '₦5M–₦12M/yr', 12000000, 0, 50000,
   '35–45%','18 months', 52, 'high','E','pending', 1,'green','Fixed Return', 0, 90)
on conflict do nothing;
