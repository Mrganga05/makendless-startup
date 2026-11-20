-- MAKENDLESS: tables for Start a Project leads and the referral program.
-- Run once in Supabase -> SQL Editor. Then add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.
-- Row Level Security is ON with no public policies: only the website's server (service role key) can read or write.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  whatsapp text not null,
  referral_code text,
  footage_link text,
  notes text,
  selections jsonb not null default '[]',
  extras jsonb not null default '[]',
  combo text,
  combo_saving integer not null default 0,
  video_discount integer not null default 0,
  referral_discount integer not null default 0,
  one_time_total integer not null default 0,
  monthly_total integer not null default 0,
  has_custom boolean not null default false,
  total_text text,
  est_delivery text,
  requirements jsonb not null default '{}',
  checklist jsonb not null default '[]',
  page text,
  status text not null default 'new'
);

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  code text not null unique,
  name text not null,
  whatsapp text not null unique
);

create table if not exists public.referral_uses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  code text not null references public.referral_codes(code),
  lead_id uuid references public.leads(id) on delete set null,
  referred_name text not null,
  referred_whatsapp text not null unique, -- each new client can use a referral discount once
  discount integer not null default 500,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  referrer_credit integer not null default 0, -- becomes 500 only when the team marks the project as paid
  paid_at timestamptz
);

alter table public.leads enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_uses enable row level security;
