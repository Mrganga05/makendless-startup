-- MAKENDLESS database. Run once: Supabase -> SQL Editor -> New query -> paste all -> Run.
-- Security: Row Level Security is ON for every table.
--   * The public website (anon key) may only INSERT new leads, referral codes and waitlist emails. It can never read, change or delete.
--   * Logged-in team members (listed in team_members, active) can read and update.
--   * The website's own server uses the service role key (kept secret in Vercel) for referral checks and the /admin dashboard.

create extension if not exists pgcrypto;

create table if not exists public.team_members (
  email text primary key,
  name text not null default '',
  role text not null default 'Member' check (role in ('Admin', 'Member')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.team_members (email, name, role, active) values ('makendlessofficial@gmail.com', 'MAKENDLESS', 'Admin', true)
  on conflict (email) do nothing;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  whatsapp text not null,
  email text,
  business_name text,
  client_type text,
  source_page text,
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
  requirements jsonb not null default '{}',     -- per service
  checklist jsonb not null default '[]',
  footage_link text,
  extra_notes text,
  budget text,
  timing text,
  status text not null default 'New' check (status in ('New','Contacted','Price confirmed','Advance paid','In progress','Delivered','Fully paid','Lost')),
  assigned_to text,
  team_notes jsonb not null default '[]',       -- [{author, body, at}]
  activity jsonb not null default '[]',         -- [{actor, action, at}]
  advance_paid boolean not null default false,
  advance_amount integer,
  advance_date date,
  balance_paid boolean not null default false,
  balance_amount integer,
  balance_date date,
  ip_hash text
);

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

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  interest text not null default 'GROW',
  created_at timestamptz not null default now(),
  ip_hash text,
  unique (email, interest)
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null
);
insert into public.app_settings (key, value) values ('alert_email', 'makendlessofficial@gmail.com') on conflict (key) do nothing;

-- helpers: is the signed-in user an active team member / admin?
create or replace function public.is_team_member() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where lower(email) = lower(auth.jwt() ->> 'email') and active);
$$;
create or replace function public.is_team_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where lower(email) = lower(auth.jwt() ->> 'email') and active and role = 'Admin');
$$;

alter table public.team_members enable row level security;
alter table public.leads enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_uses enable row level security;
alter table public.waitlist enable row level security;
alter table public.app_settings enable row level security;

-- public website: add rows only
create policy "public can add leads" on public.leads for insert to anon, authenticated with check (true);
create policy "public can add referral codes" on public.referral_codes for insert to anon, authenticated with check (true);
create policy "public can join waitlist" on public.waitlist for insert to anon, authenticated with check (true);
-- team: read and update
create policy "team reads leads" on public.leads for select to authenticated using (public.is_team_member());
create policy "team updates leads" on public.leads for update to authenticated using (public.is_team_member());
create policy "team reads codes" on public.referral_codes for select to authenticated using (public.is_team_member());
create policy "team updates codes" on public.referral_codes for update to authenticated using (public.is_team_member());
create policy "team reads uses" on public.referral_uses for select to authenticated using (public.is_team_member());
create policy "team updates uses" on public.referral_uses for update to authenticated using (public.is_team_member());
create policy "team reads waitlist" on public.waitlist for select to authenticated using (public.is_team_member());
create policy "team reads team" on public.team_members for select to authenticated using (public.is_team_member());
create policy "admins manage team" on public.team_members for all to authenticated using (public.is_team_admin()) with check (public.is_team_admin());
create policy "team reads settings" on public.app_settings for select to authenticated using (public.is_team_member());
create policy "admins manage settings" on public.app_settings for all to authenticated using (public.is_team_admin()) with check (public.is_team_admin());
