-- 20260224000000_security_and_performance_hardening.sql
-- Security Hardening and Performance Optimization Migration

-- 1. FIX FUNCTION SEARCH PATHS (Security)
-- Prevents search path hijacking by pinning to the 'public' schema.
ALTER FUNCTION public.accept_invitation(text) SET search_path = public;
ALTER FUNCTION public.get_auth_org_ids() SET search_path = public;
ALTER FUNCTION public.get_invite_details(text) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. DROP PERMISSIVE AND REDUNDANT POLICIES (Security & Cleanliness)
-- Remove policies that bypass owner checks or are duplicates.

DROP POLICY IF EXISTS "Allow public communications insertion" ON public.communications;
DROP POLICY IF EXISTS "Allow public customer insertion" ON public.customers;
DROP POLICY IF EXISTS "Allow anonymous embed submissions" ON public.embed_submissions;
DROP POLICY IF EXISTS "Allow authenticated full access to help articles" ON public.help_articles;
DROP POLICY IF EXISTS "Allow public job insertion" ON public.jobs;
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can create an organization" ON public.organizations;
DROP POLICY IF EXISTS "Allow public organization read" ON public.organizations;
DROP POLICY IF EXISTS "Allow public services read" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated full access to platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Allow anonymous ticket submission" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow authenticated users to manage tickets" ON public.support_tickets;

-- Drop redundant "Members can..." vs "Users can..." policies for Expenses
DROP POLICY IF EXISTS "Members can view expenses of their organization" ON public.expenses;
DROP POLICY IF EXISTS "Members can insert expenses for their organization" ON public.expenses;
DROP POLICY IF EXISTS "Users can view expenses for their organization" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses for their organization" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses for their organization" ON public.expenses;

-- Drop redundant "Members can..." vs "Users can..." policies for Services
DROP POLICY IF EXISTS "Members can view services of their organization" ON public.services;

-- 3. OPTIMIZE AND CONSOLIDATE RLS POLICIES (Performance)
-- We wrap auth.uid() in (SELECT auth.uid()) and auth.role() in (SELECT auth.role())
-- to force Postgres to evaluate them once per query rather than once per row.

-- Organization Members
DROP POLICY IF EXISTS "Users can view their own membership" ON public.organization_members;
CREATE POLICY "Users can view their own membership" ON public.organization_members
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own membership" ON public.organization_members;
CREATE POLICY "Users can insert their own membership" ON public.organization_members
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can join organizations" ON public.organization_members;
CREATE POLICY "Users can join organizations" ON public.organization_members
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Organizations
DROP POLICY IF EXISTS "Organizations are viewable by members" ON public.organizations;
CREATE POLICY "Organizations are viewable by members" ON public.organizations
  FOR SELECT USING (id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Organizations can be updated by members" ON public.organizations;
CREATE POLICY "Organizations can be updated by members" ON public.organizations
  FOR UPDATE USING (id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert organizations" ON public.organizations;
CREATE POLICY "Users can insert organizations" ON public.organizations
  FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- Customers
DROP POLICY IF EXISTS "Customers are viewable by organization members" ON public.customers;
CREATE POLICY "Customers are viewable by organization members" ON public.customers
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Customers can be inserted by organization members" ON public.customers;
CREATE POLICY "Customers can be inserted by organization members" ON public.customers
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Customers can be updated by organization members" ON public.customers;
CREATE POLICY "Customers can be updated by organization members" ON public.customers
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Customers can be deleted by organization members" ON public.customers;
CREATE POLICY "Customers can be deleted by organization members" ON public.customers
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

-- Jobs
DROP POLICY IF EXISTS "Jobs are viewable by organization members" ON public.jobs;
CREATE POLICY "Jobs are viewable by organization members" ON public.jobs
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Jobs can be inserted by organization members" ON public.jobs;
CREATE POLICY "Jobs can be inserted by organization members" ON public.jobs
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Jobs can be updated by organization members" ON public.jobs;
CREATE POLICY "Jobs can be updated by organization members" ON public.jobs
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Jobs can be deleted by organization members" ON public.jobs;
CREATE POLICY "Jobs can be deleted by organization members" ON public.jobs
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

-- Expenses
CREATE POLICY "Users can view expenses for their organization" ON public.expenses
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert expenses for their organization" ON public.expenses
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update expenses for their organization" ON public.expenses
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete expenses for their organization" ON public.expenses
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

-- Communications
DROP POLICY IF EXISTS "Users can view communications for their organization" ON public.communications;
CREATE POLICY "Users can view communications for their organization" ON public.communications
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert communications for their organization" ON public.communications;
CREATE POLICY "Users can insert communications for their organization" ON public.communications
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update communications for their organization" ON public.communications;
CREATE POLICY "Users can update communications for their organization" ON public.communications
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete communications for their organization" ON public.communications;
CREATE POLICY "Users can delete communications for their organization" ON public.communications
  FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

-- Services
CREATE POLICY "Users can view services for their organization" ON public.services
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = (SELECT auth.uid())));

-- 4. HARDEN SPECIAL TABLES
-- Support Tickets: Allow anyone to submit, but only Super Admin to manage.
CREATE POLICY "Anyone can submit support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admins can manage all tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'craig@jobmow.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'craig@jobmow.com');

-- Platform Settings: Read is public, edit is Super Admin only.
CREATE POLICY "Super admins can manage platform settings" ON public.platform_settings
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'craig@jobmow.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'craig@jobmow.com');

-- 5. ADD MISSING INDEXES (Performance)
CREATE INDEX IF NOT EXISTS communications_customer_id_idx ON public.communications (customer_id);
CREATE INDEX IF NOT EXISTS communications_job_id_idx ON public.communications (job_id);
CREATE INDEX IF NOT EXISTS communications_organization_id_idx ON public.communications (organization_id);
CREATE INDEX IF NOT EXISTS customers_organization_id_idx ON public.customers (organization_id);
CREATE INDEX IF NOT EXISTS expenses_organization_id_idx ON public.expenses (organization_id);
CREATE INDEX IF NOT EXISTS help_articles_author_id_idx ON public.help_articles (author_id);
CREATE INDEX IF NOT EXISTS invitations_created_by_idx ON public.invitations (created_by);
CREATE INDEX IF NOT EXISTS jobs_customer_id_idx ON public.jobs (customer_id);
CREATE INDEX IF NOT EXISTS jobs_organization_id_idx ON public.jobs (organization_id);
CREATE INDEX IF NOT EXISTS jobs_service_id_idx ON public.jobs (service_id);
CREATE INDEX IF NOT EXISTS leads_converted_job_id_idx ON public.leads (converted_job_id);
CREATE INDEX IF NOT EXISTS organization_members_user_id_idx ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS services_organization_id_idx ON public.services (organization_id);
CREATE INDEX IF NOT EXISTS subscriptions_organization_id_idx ON public.subscriptions (organization_id);

-- 6. CLEANUP DUPLICATE AND UNUSED INDEXES
DROP INDEX IF EXISTS public.idx_embed_submissions_status;
DROP INDEX IF EXISTS public.leads_status_idx;
