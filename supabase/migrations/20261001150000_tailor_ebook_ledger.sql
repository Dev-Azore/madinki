-- ============================================================================
-- Tailor E-Book / Job Order Ledger Migration
-- Version: 1.0
-- Digitizes physical tailor ledger notebooks (e.g. Kano style order books)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: ledger_entries
-- Tracks individual job orders recorded in the tailor's e-book ledger.
-- ----------------------------------------------------------------------------
create table public.ledger_entries (
  id                uuid primary key default gen_random_uuid(),
  tailor_id         uuid not null references public.users (id) on delete cascade,
  client_id         uuid references public.clients (id) on delete set null,
  client_name       text not null,
  client_phone      text,
  entry_date        date not null default current_date,
  delivery_date     date,
  sets_count        integer not null default 1 check (sets_count >= 0),
  style_type        text default 'Plain',
  embroidery_work   text default 'Plain',
  agbada_count      integer not null default 0 check (agbada_count >= 0),
  deposit_amount    numeric(12, 2) not null default 0.00 check (deposit_amount >= 0),
  total_amount      numeric(12, 2) not null default 0.00 check (total_amount >= 0),
  status            text not null default 'started' check (status in ('started', 'in_progress', 'ready', 'delivered')),
  notes             text,
  custom_fields     jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.ledger_entries is 'Tailor job orders ledger mirroring physical tailor notebooks.';

create index ledger_entries_tailor_id_idx on public.ledger_entries (tailor_id);
create index ledger_entries_client_id_idx on public.ledger_entries (client_id);
create index ledger_entries_date_idx on public.ledger_entries (tailor_id, entry_date desc);
create index ledger_entries_status_idx on public.ledger_entries (tailor_id, status);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at maintenance
-- ----------------------------------------------------------------------------
create trigger ledger_entries_set_updated_at
  before update on public.ledger_entries
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: ledger_settings
-- Stores customizable column configurations per tailor
-- ----------------------------------------------------------------------------
create table public.ledger_settings (
  id                uuid primary key default gen_random_uuid(),
  tailor_id         uuid not null unique references public.users (id) on delete cascade,
  columns_config    jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.ledger_settings is 'User-customized column preferences and visible fields for the tailor e-book.';

create index ledger_settings_tailor_id_idx on public.ledger_settings (tailor_id);

create trigger ledger_settings_set_updated_at
  before update on public.ledger_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row-Level Security
-- ----------------------------------------------------------------------------
alter table public.ledger_entries enable row level security;
alter table public.ledger_settings enable row level security;

-- ledger_entries policies
create policy "tailors manage own ledger entries"
  on public.ledger_entries for all
  using (tailor_id = auth.uid())
  with check (tailor_id = auth.uid());

create policy "admins can view all ledger entries"
  on public.ledger_entries for select
  using (public.is_admin());

-- ledger_settings policies
create policy "tailors manage own ledger settings"
  on public.ledger_settings for all
  using (tailor_id = auth.uid())
  with check (tailor_id = auth.uid());

create policy "admins can view all ledger settings"
  on public.ledger_settings for select
  using (public.is_admin());
