
create type communication_type as enum ('SMS', 'EMAIL', 'CALL', 'SYSTEM');

create table public.communications (
  id uuid not null default gen_random_uuid (),
  organization_id uuid not null default auth.uid (),
  customer_id uuid not null,
  job_id uuid null,
  type communication_type not null,
  subject text not null,
  body text not null,
  sent_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint communications_pkey primary key (id),
  constraint communications_customer_id_fkey foreign key (customer_id) references customers (id) on delete cascade,
  constraint communications_job_id_fkey foreign key (job_id) references jobs (id) on delete set null,
  constraint communications_organization_id_fkey foreign key (organization_id) references organizations (id) on delete cascade
);

alter table public.communications enable row level security;

create policy "Users can view communications for their organization" on public.communications
  for select
  using (auth.uid() = organization_id);

create policy "Users can insert communications for their organization" on public.communications
  for insert
  with check (auth.uid() = organization_id);

create policy "Users can update communications for their organization" on public.communications
  for update
  using (auth.uid() = organization_id);

create policy "Users can delete communications for their organization" on public.communications
  for delete
  using (auth.uid() = organization_id);
