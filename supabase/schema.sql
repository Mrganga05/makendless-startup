-- MAKENDLESS database: the ONE file to run. Supabase -> SQL Editor -> New query -> paste all -> Run.
-- Works on a brand-new project AND on an existing one (it only adds what is missing and keeps every row).
-- Safe to run again at any time. Last change: 2026-11-23 (lead notes, "Proposal" status, password login, tighter security).
--
-- Security: Row Level Security is ON for every table and there are NO public policies.
-- Only the website's own server can read or write, using the secret service role key kept in Vercel.
-- The public forms and /admin both go through that server, which checks every request.

create extension if not exists pgcrypto;

-- ---------- team ----------
create table if not exists public.team_members (
  email text primary key,
  name text not null default '',
  role text not null default 'Member' check (role in ('Admin', 'Member')),
  active boolean not null default true,
  whatsapp text not null default '',
  created_at timestamptz not null default now()
);
alter table public.team_members add column if not exists whatsapp text not null default '';
insert into public.team_members (email, name, role, active) values ('makendlessofficial@gmail.com', 'MAKENDLESS', 'Admin', true)
  on conflict (email) do nothing;
update public.team_members set role = 'Admin', active = true where email = 'makendlessofficial@gmail.com';

-- ---------- leads: every website form, the chatbot, and hand-added leads ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  whatsapp text default '',
  email text,
  business_name text,
  client_type text,
  source_page text,
  form text not null default 'Start a Project',  -- Start a Project / Contact brief / Referral / GROW waitlist / Chatbot / Added by hand / Imported
  lead_source text not null default 'Website',
  selections jsonb not null default '{}',       -- {items:[{service,option,qty,price,unit}], extras:[...]}
  combo_applied text,
  video_discount integer not null default 0,
  referral_code text,
  referral_discount integer not null default 0,
  estimated_total integer not null default 0,
  estimated_monthly integer not null default 0,
  total_text text,
  has_custom boolean not null default false,
  est_delivery text,
  requirements jsonb not null default '{}',
  checklist jsonb not null default '[]',
  footage_link text,
  extra_notes text,
  budget text,
  timing text,
  status text not null default 'New',
  lost_reason text,
  notes text not null default '',
  assigned_to text,
  project_id uuid,
  team_notes jsonb not null default '[]',
  activity jsonb not null default '[]',
  advance_paid boolean not null default false,
  advance_amount integer,
  advance_date date,
  balance_paid boolean not null default false,
  balance_amount integer,
  balance_date date,
  ip_hash text
);
alter table public.leads alter column whatsapp set default '';
alter table public.leads alter column whatsapp drop not null;
alter table public.leads add column if not exists form text not null default 'Start a Project';
alter table public.leads add column if not exists lead_source text not null default 'Website';
alter table public.leads add column if not exists lost_reason text;
alter table public.leads add column if not exists project_id uuid;
alter table public.leads add column if not exists notes text not null default '';

-- statuses: New / Contacted / Proposal / Won / Lost (older names are moved over)
alter table public.leads drop constraint if exists leads_status_check;
update public.leads set status = case
  when status in ('Price confirmed', 'Quote sent') then 'Proposal'
  when status in ('Advance paid', 'In progress', 'Delivered', 'Fully paid') then 'Won'
  when status in ('New', 'Contacted', 'Proposal', 'Won', 'Lost') then status
  else 'New' end
  where status not in ('New', 'Contacted', 'Proposal', 'Won', 'Lost');
alter table public.leads add constraint leads_status_check check (status in ('New', 'Contacted', 'Proposal', 'Won', 'Lost'));
update public.leads set form = 'Contact brief' where source_page = '/contact' and form = 'Start a Project';
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_referral_code_idx on public.leads (referral_code);

-- ---------- referrals ----------
create table if not exists public.referral_codes (
  code text primary key,
  referrer_name text not null,
  referrer_whatsapp text not null unique,
  created_at timestamptz not null default now(),
  credits_earned integer not null default 0,
  credits_used integer not null default 0,
  ip_hash text
);
create table if not exists public.referral_uses (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.referral_codes(code),
  new_client_name text not null,
  new_client_whatsapp text not null unique,   -- one referral discount per client
  lead_id uuid references public.leads(id) on delete set null,
  status text not null default 'Pending' check (status in ('Pending', 'Paid')),
  created_at timestamptz not null default now()
);

-- ---------- GROW waitlist ----------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  interest text not null default 'GROW',
  created_at timestamptz not null default now(),
  ip_hash text,
  unique (email, interest)
);

-- older referral sign-ups and waitlist emails also appear as leads (added once)
insert into public.leads (created_at, name, whatsapp, form, lead_source, status, source_page)
  select c.created_at, c.referrer_name, c.referrer_whatsapp, 'Referral', 'Website', 'New', '/#refer'
  from public.referral_codes c
  where not exists (select 1 from public.leads l where l.form = 'Referral' and l.whatsapp = c.referrer_whatsapp);
insert into public.leads (created_at, name, whatsapp, email, form, lead_source, status, source_page)
  select w.created_at, w.email, '', w.email, 'GROW waitlist', 'Website', 'New', '/grow'
  from public.waitlist w
  where not exists (select 1 from public.leads l where l.form = 'GROW waitlist' and l.email = w.email);

-- ---------- projects and payments ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid,
  client text not null,
  client_whatsapp text not null default '',
  studio text not null default '',
  services text not null default '',
  price integer not null default 0,
  delivery_date date,
  assigned_to text,
  team_payout integer not null default 0,
  payout_done boolean not null default false,
  payout_date date,
  status text not null default 'Not started' check (status in ('Not started', 'In progress', 'In review', 'Delivered', 'Paid')),
  referral_code text,
  notes text not null default ''
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  date date not null default current_date,
  amount integer not null,
  kind text not null default 'Advance' check (kind in ('Advance', 'Balance', 'Other')),
  method text not null default 'UPI' check (method in ('UPI', 'Payment link', 'Cash', 'Bank transfer'))
);

-- ---------- expenses ----------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date not null default current_date,
  item text not null,
  category text not null default 'Other' check (category in ('Software & tools', 'Ads & marketing', 'Domain & hosting', 'Equipment', 'Registration & legal', 'Other')),
  amount integer not null default 0,
  paid_by text not null default '',
  notes text not null default ''
);

-- ---------- safety: trash, activity log, backups ----------
create table if not exists public.trash (
  id uuid primary key default gen_random_uuid(),
  deleted_at timestamptz not null default now(),
  deleted_by text not null default '',
  entity text not null,
  entity_id text not null,
  label text not null default '',
  data jsonb not null
);
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  action text not null,
  entity text not null,
  entity_id text not null default '',
  old_value jsonb,
  new_value jsonb
);
create index if not exists activity_log_entity_id_idx on public.activity_log (entity_id, created_at);
create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data jsonb not null
);

-- ---------- website content and settings ----------
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);
insert into public.app_settings (key, value) values
  ('alert_email', 'makendlessofficial@gmail.com'), ('monthly_target', '100000'), ('whatsapp', ''), ('email', ''),
  ('referral_reward', '500'), ('referral_min', '2000')
  on conflict (key) do nothing;

-- ---------- security: RLS on everywhere, no public or logged-in direct access ----------
alter table public.team_members enable row level security;
alter table public.leads enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_uses enable row level security;
alter table public.waitlist enable row level security;
alter table public.app_settings enable row level security;
alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.trash enable row level security;
alter table public.activity_log enable row level security;
alter table public.backups enable row level security;
alter table public.site_content enable row level security;

-- policies from the first version: removed, so nobody can reach the tables with a public key or a team login directly
drop policy if exists "public can add leads" on public.leads;
drop policy if exists "public can add referral codes" on public.referral_codes;
drop policy if exists "public can join waitlist" on public.waitlist;
drop policy if exists "team reads leads" on public.leads;
drop policy if exists "team updates leads" on public.leads;
drop policy if exists "team reads codes" on public.referral_codes;
drop policy if exists "team updates codes" on public.referral_codes;
drop policy if exists "team reads uses" on public.referral_uses;
drop policy if exists "team updates uses" on public.referral_uses;
drop policy if exists "team reads waitlist" on public.waitlist;
drop policy if exists "team reads team" on public.team_members;
drop policy if exists "admins manage team" on public.team_members;
drop policy if exists "team reads settings" on public.app_settings;
drop policy if exists "admins manage settings" on public.app_settings;
drop function if exists public.is_team_member();
drop function if exists public.is_team_admin();

select 'MAKENDLESS database is ready' as result;
