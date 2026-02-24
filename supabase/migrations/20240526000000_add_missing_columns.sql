-- Add postcode column to customers and jobs tables if missing

-- Customers table check
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'postcode') THEN
        ALTER TABLE public.customers ADD COLUMN postcode text;
    END IF;
END $$;

-- Jobs table check
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'postcode') THEN
        ALTER TABLE public.jobs ADD COLUMN postcode text;
    END IF;
    
    -- Also check for service fields that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'service_id') THEN
        ALTER TABLE public.jobs ADD COLUMN service_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'service_name') THEN
        ALTER TABLE public.jobs ADD COLUMN service_name text;
    END IF;
END $$;

