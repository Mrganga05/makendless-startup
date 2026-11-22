-- MAKENDLESS control room upgrade (2026-11-22). Run ONCE after schema.sql:
-- Supabase -> SQL Editor -> New query -> paste all -> Run. Safe to run again.
-- All new tables have Row Level Security ON with no public policies: only the website's server
-- (service role key, kept secret in Vercel) can read or write them. /admin goes through that server.

-- ---------- team ----------
alter table public.team_members add column if not exists whatsapp text not null default '';
update public.team_members set role = 'Admin', active = true where email = 'makendlessofficial@gmail.com';

-- ---------- leads: every website form + hand-added leads ----------
alter table public.leads alter column whatsapp set default '';
alter table public.leads alter column whatsapp drop not null;
alter table public.leads add column if not exists form text not null default 'Start a Project';
alter table public.leads add column if not exists lead_source text not null default 'Website';
alter table public.leads add column if not exists lost_reason text;
alter table public.leads add column if not exists project_id uuid;
alter table public.leads drop constraint if exists leads_status_check;
update public.leads set status = case
  when status in ('Price confirmed') then 'Quote sent'
  when status in ('Advance paid', 'In progress', 'Delivered', 'Fully paid') then 'Won'
  when status in ('New', 'Contacted', 'Quote sent', 'Won', 'Lost') then status
  else 'New' end;
alter table public.leads add constraint leads_status_check check (status in ('New', 'Contacted', 'Quote sent', 'Won', 'Lost'));
update public.leads set form = 'Contact brief' where source_page = '/contact' and form = 'Start a Project';

-- old referral sign-ups and GROW waitlist emails become leads too (once)
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
create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data jsonb not null
);

-- ---------- website content (prices, services, packs, FAQ, work, reviews) ----------
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- settings ----------
insert into public.app_settings (key, value) values
  ('monthly_target', '100000'), ('whatsapp', ''), ('email', ''), ('referral_reward', '500'), ('referral_min', '2000')
  on conflict (key) do nothing;

alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.trash enable row level security;
alter table public.activity_log enable row level security;
alter table public.backups enable row level security;
alter table public.site_content enable row level security;
