-- Enable Super Admin Access

DO $$
BEGIN
    -- Organizations: Allow Super Admin to view ALL organizations
    -- We use DROP POLICY IF EXISTS to ensure we can re-run this script cleanly if needed.
    DROP POLICY IF EXISTS "Super admins can view all organizations" ON public.organizations;
    
    CREATE POLICY "Super admins can view all organizations"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
      -- Check email safely from the JWT, avoiding direct access to auth.users table
      (auth.jwt() ->> 'email') = 'craig@jobmow.com'
    );

    -- Leads: Restrict view to Super Admin only
    DROP POLICY IF EXISTS "Allow authenticated view of leads" ON public.leads;
    DROP POLICY IF EXISTS "Super admins can view leads" ON public.leads;
    
    CREATE POLICY "Super admins can view leads"
    ON public.leads FOR SELECT
    TO authenticated
    USING (
      -- Check email safely from the JWT
      (auth.jwt() ->> 'email') = 'craig@jobmow.com'
    );
END $$;
