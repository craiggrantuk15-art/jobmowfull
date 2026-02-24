
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'lead_magnet' or 'founders_waitlist'
  name text not null,
  email text not null,
  business_name text,
  crew_size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Basic RLS policies
alter table leads enable row level security;

-- Allow public insert (for the forms)
create policy "Allow public insert to leads"
on leads for insert
to public
with check (true);

-- Allow admins to view (for the super admin dashboard)
-- Note: Adjust this based on your actual auth logic. 
-- For now, assuming authenticated users can view, or specific super admin checks.
create policy "Allow authenticated view of leads"
on leads for select
to authenticated
using (true);
