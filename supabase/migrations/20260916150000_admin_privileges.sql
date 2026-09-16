-- ============================================================================
-- Migration: 20260916150000_admin_privileges.sql
-- Description: Enables comprehensive admin privileges:
--  1. Global templates library (is_global on templates table + RLS)
--  2. Admin RLS read access to all clients, templates, and template_fields for tailor inspection
--  3. Admin RLS write access to users (plan management and role provisioning)
--  4. Expanded admin_audit_log action types
-- ============================================================================

-- 1. Add is_global flag to templates
alter table public.templates
  add column if not exists is_global boolean not null default false;

create index if not exists templates_is_global_idx on public.templates (is_global);

-- 2. Expand admin_audit_log action check constraint
alter table public.admin_audit_log
  drop constraint if exists admin_audit_log_action_check;

alter table public.admin_audit_log
  add constraint admin_audit_log_action_check
  check (action in (
    'suspend',
    'reactivate',
    'change_plan',
    'promote_admin',
    'demote_admin',
    'create_global_template',
    'delete_global_template'
  ));

-- 3. RLS for Clients: allow admins to inspect all client records
create policy "admins can view all clients"
  on public.clients for select
  using (public.is_admin());

-- 4. RLS for Templates:
-- Allow tailors to read global templates, and admins to manage all templates
create policy "tailors can read global templates"
  on public.templates for select
  using (is_global = true);

create policy "admins can manage all templates"
  on public.templates for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5. RLS for Template Fields:
-- Allow tailors to read global template fields, and admins to manage all fields
create policy "tailors can read global template fields"
  on public.template_fields for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = public.template_fields.template_id
        and t.is_global = true
    )
  );

create policy "admins can manage all template fields"
  on public.template_fields for all
  using (public.is_admin())
  with check (public.is_admin());

-- 6. RLS for Users:
-- Allow admins to update plan and role columns for tailors
drop policy if exists "admins can update account status" on public.users;

create policy "admins can update user profiles"
  on public.users for update
  using (public.is_admin())
  with check (public.is_admin());

comment on column public.templates.is_global is
  'When true, template is a system-wide default visible to all tailors.';

-- 7. Update admin_tailor_stats RPC to include role and list all users for admin review
drop function if exists public.admin_tailor_stats();

create or replace function public.admin_tailor_stats()
returns table (
  tailor_id           uuid,
  name                text,
  role                text,
  status              text,
  plan                text,
  client_count        bigint,
  template_count      bigint,
  measurement_count   bigint,
  last_activity       timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    u.id,
    u.name,
    u.role,
    u.status,
    u.plan,
    (select count(*) from public.clients c where c.tailor_id = u.id),
    (select count(*) from public.templates t where t.tailor_id = u.id and t.deleted_at is null),
    (select count(*) from public.measurements m where m.tailor_id = u.id),
    (select max(m.created_at) from public.measurements m where m.tailor_id = u.id)
  from public.users u
  where public.is_admin();
$$;

revoke execute on function public.admin_tailor_stats() from public;
grant execute on function public.admin_tailor_stats() to authenticated;

