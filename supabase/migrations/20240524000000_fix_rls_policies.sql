-- Fix RLS Policies for Organization Access
-- The previous policies likely assumed auth.uid() = organization_id which is incorrect for multi-user orgs.
-- We need to check if the user is a member of the organization.

-- 1. Enable RLS on all tables (idempotent)
alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.expenses enable row level security;
alter table public.communications enable row level security;
alter table public.organization_members enable row level security;
alter table public.organizations enable row level security;

-- 2. Drop existing incorrect policies to avoid conflicts
-- Generic cleanup for tables we are fixing
drop policy if exists "Users can view customers for their organization" on public.customers;
drop policy if exists "Users can insert customers for their organization" on public.customers;
drop policy if exists "Users can update customers for their organization" on public.customers;
drop policy if exists "Users can delete customers for their organization" on public.customers;

drop policy if exists "Users can view jobs for their organization" on public.jobs;
drop policy if exists "Users can insert jobs for their organization" on public.jobs;
drop policy if exists "Users can update jobs for their organization" on public.jobs;
drop policy if exists "Users can delete jobs for their organization" on public.jobs;

drop policy if exists "Users can view expenses for their organization" on public.expenses;
drop policy if exists "Users can insert expenses for their organization" on public.expenses;
drop policy if exists "Users can delete expenses for their organization" on public.expenses;

drop policy if exists "Users can view communications for their organization" on public.communications;
drop policy if exists "Users can insert communications for their organization" on public.communications;
drop policy if exists "Users can update communications for their organization" on public.communications;
drop policy if exists "Users can delete communications for their organization" on public.communications;

-- Organization Members Policies
drop policy if exists "Users can view their own membership" on public.organization_members;
drop policy if exists "Users can insert their own membership" on public.organization_members;

-- Organizations Policies
drop policy if exists "Users can view their organization" on public.organizations;
drop policy if exists "Users can insert organizations" on public.organizations;
drop policy if exists "Users can update their organization" on public.organizations;


-- 3. Create new correct policies using organization_members lookup

-- Organization Members: Users can see their own memberships
create policy "Users can view their own membership" on public.organization_members
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own membership" on public.organization_members
  for insert
  with check (auth.uid() = user_id);

-- Organizations: Users can view organizations they belong to
create policy "Users can view their organization" on public.organizations
  for select
  using (
    id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );
  
-- Allow creating an organization (anyone authenticated)
create policy "Users can insert organizations" on public.organizations
  for insert
  with check (auth.role() = 'authenticated');

-- Organizations: Users can update organizations they belong to
create policy "Users can update their organization" on public.organizations
  for update
  using (
    id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

-- Customers
create policy "Users can view customers for their organization" on public.customers
  for select
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can insert customers for their organization" on public.customers
  for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can update customers for their organization" on public.customers
  for update
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can delete customers for their organization" on public.customers
  for delete
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

-- Jobs
create policy "Users can view jobs for their organization" on public.jobs
  for select
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can insert jobs for their organization" on public.jobs
  for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can update jobs for their organization" on public.jobs
  for update
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can delete jobs for their organization" on public.jobs
  for delete
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

-- Expenses
create policy "Users can view expenses for their organization" on public.expenses
  for select
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can insert expenses for their organization" on public.expenses
  for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can delete expenses for their organization" on public.expenses
  for delete
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

-- Communications
create policy "Users can view communications for their organization" on public.communications
  for select
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can insert communications for their organization" on public.communications
  for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can update communications for their organization" on public.communications
  for update
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );

create policy "Users can delete communications for their organization" on public.communications
  for delete
  using (
    organization_id in (
      select organization_id from public.organization_members where user_id = auth.uid()
    )
  );
