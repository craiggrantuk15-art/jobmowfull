-- Add missing columns to jobs table to match Job interface
DO $$
BEGIN
    -- address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'address') THEN
        ALTER TABLE public.jobs ADD COLUMN address text;
    END IF;

    -- zone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'zone') THEN
        ALTER TABLE public.jobs ADD COLUMN zone text;
    END IF;

    -- frequency
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'frequency') THEN
        ALTER TABLE public.jobs ADD COLUMN frequency text DEFAULT 'One-off';
    END IF;

    -- lawn_size
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'lawn_size') THEN
        ALTER TABLE public.jobs ADD COLUMN lawn_size text;
    END IF;

    -- property_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'property_type') THEN
        ALTER TABLE public.jobs ADD COLUMN property_type text;
    END IF;

    -- duration_minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'duration_minutes') THEN
        ALTER TABLE public.jobs ADD COLUMN duration_minutes numeric DEFAULT 0;
    END IF;

    -- payment_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'payment_status') THEN
        ALTER TABLE public.jobs ADD COLUMN payment_status text;
    END IF;

    -- completed_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'completed_date') THEN
        ALTER TABLE public.jobs ADD COLUMN completed_date timestamp with time zone;
    END IF;

    -- notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'notes') THEN
        ALTER TABLE public.jobs ADD COLUMN notes text;
    END IF;

    -- lead_source
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'lead_source') THEN
        ALTER TABLE public.jobs ADD COLUMN lead_source text;
    END IF;

    -- payment_method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'payment_method') THEN
        ALTER TABLE public.jobs ADD COLUMN payment_method text;
    END IF;

    -- actual_duration_minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'actual_duration_minutes') THEN
        ALTER TABLE public.jobs ADD COLUMN actual_duration_minutes numeric;
    END IF;

    -- is_timer_running
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'is_timer_running') THEN
        ALTER TABLE public.jobs ADD COLUMN is_timer_running boolean DEFAULT false;
    END IF;

    -- timer_start_time
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'timer_start_time') THEN
        ALTER TABLE public.jobs ADD COLUMN timer_start_time timestamp with time zone;
    END IF;

    -- is_rain_delayed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'is_rain_delayed') THEN
        ALTER TABLE public.jobs ADD COLUMN is_rain_delayed boolean DEFAULT false;
    END IF;
END $$;
