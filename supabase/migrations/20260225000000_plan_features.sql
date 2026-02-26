-- 20260225000000_plan_features.sql
-- Migration to support plan-based feature toggles

-- 1. Create plan_features table
CREATE TABLE IF NOT EXISTS public.plan_features (
    plan_level text PRIMARY KEY,
    features jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Add plan_level to organizations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'plan_level') THEN
        ALTER TABLE public.organizations ADD COLUMN plan_level text NOT NULL DEFAULT 'starter';
    END IF;
END $$;

-- 3. Insert default features for each plan
INSERT INTO public.plan_features (plan_level, features)
VALUES 
    ('starter', '{
        "ai_quoting": false,
        "route_optimization": false,
        "sms_notifications": false,
        "unlimited_jobs": false,
        "priority_support": false,
        "custom_integrations": false,
        "fleet_tracking": false,
        "lawn_measurement": false
    }'::jsonb),
    ('pro', '{
        "ai_quoting": true,
        "route_optimization": true,
        "sms_notifications": true,
        "unlimited_jobs": true,
        "priority_support": true,
        "custom_integrations": false,
        "fleet_tracking": false,
        "lawn_measurement": true
    }'::jsonb),
    ('enterprise', '{
        "ai_quoting": true,
        "route_optimization": true,
        "sms_notifications": true,
        "unlimited_jobs": true,
        "priority_support": true,
        "custom_integrations": true,
        "fleet_tracking": true,
        "lawn_measurement": true
    }'::jsonb)
ON CONFLICT (plan_level) DO NOTHING;

-- 4. RLS for plan_features
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to plan_features"
ON public.plan_features FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage plan_features"
ON public.plan_features FOR ALL
TO authenticated
USING ((SELECT auth.jwt() ->> 'email') = 'craig@jobmow.com')
WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'craig@jobmow.com');

-- 5. Helper function to check features (optional, but good for RPCs)
CREATE OR REPLACE FUNCTION public.is_feature_enabled(org_id uuid, feature_name text)
RETURNS boolean AS $$
DECLARE
    enabled boolean;
BEGIN
    SELECT (features->>feature_name)::boolean INTO enabled
    FROM public.plan_features pf
    JOIN public.organizations o ON o.plan_level = pf.plan_level
    WHERE o.id = org_id;
    
    RETURN COALESCE(enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
