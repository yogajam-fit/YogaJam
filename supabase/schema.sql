-- Supabase SQL schema for YogaJam
-- You can copy and paste this into the Supabase SQL Editor

-- 1. Create the admins table
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security (RLS)
alter table public.admins enable row level security;

-- 3. (Optional) Create a policy to allow admins to read the admins table
create policy "Admins can view admins" 
on public.admins 
for select 
to authenticated 
using ( (select auth.jwt()->>'email') = email );

-- 4. Create the reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  event text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Turn on Row Level Security (RLS) for reviews
alter table public.reviews enable row level security;

-- 6. Allow ANYONE (anonymous users) to insert reviews
create policy "Allow anonymous to insert reviews" 
on public.reviews 
for insert 
to anon 
with check (true);

-- 7. Allow admins (authenticated users) to read/update/delete all reviews
create policy "Allow admins to manage all reviews" 
on public.reviews 
for all
to authenticated 
using (true)
with check (true);

-- 8. Create the newsletter_subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null default 'unknown',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Turn on Row Level Security (RLS) for newsletter_subscribers
alter table public.newsletter_subscribers enable row level security;

-- 10. Allow ANYONE (anonymous users) to insert subscribers
create policy "Allow anonymous to insert subscribers" 
on public.newsletter_subscribers 
for insert 
to anon 
with check (true);

-- 11. Allow admins (authenticated users) to read/delete all subscribers
create policy "Allow admins to manage all subscribers" 
on public.newsletter_subscribers 
for all
to authenticated 
using (true)
with check (true);

-- 12. Create the personalized_events table
create table if not exists public.personalized_events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('build_your_own', 'start_planning')),
  status text not null default 'pending',
  name text not null,
  email text not null,
  phone text not null,
  group_size text not null,
  city text not null,
  date_or_timeline text not null,
  event_title text,
  event_type text,
  location_type text,
  vision text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Turn on Row Level Security (RLS) for personalized_events
alter table public.personalized_events enable row level security;

-- 14. Allow ANYONE (anonymous users) to insert personalized events
create policy "Allow anonymous to insert personalized events" 
on public.personalized_events 
for insert 
to anon 
with check (true);

-- 15. Allow admins (authenticated users) to manage personalized events
create policy "Allow admins to manage personalized events" 
on public.personalized_events 
for all
to authenticated 
using (true)
with check (true);

-- 16. Create the events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text not null,
  time text not null,
  price text,
  city text not null,
  location text not null,
  location_url text,
  preview_desc text not null,
  preview_highlight text,
  full_desc text not null,
  image text not null,
  video text,
  qr_code text,
  includes jsonb not null default '[]'::jsonb,
  run_of_show jsonb not null default '[]'::jsonb,
  booking_type text not null check (booking_type in ('platform', 'qr', 'contact')),
  booking_links jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. Turn on Row Level Security (RLS) for events
alter table public.events enable row level security;

-- 18. Allow ANYONE (anonymous users) to select events
create policy "Allow anonymous to select events" 
on public.events 
for select 
to anon 
using (true);

-- 19. Allow admins (authenticated users) to manage events
create policy "Allow admins to manage events" 
on public.events 
for all
to authenticated 
using (true)
with check (true);

-- 20. Setup event-media Storage Bucket
-- NOTE: You must run this SQL manually in your Supabase SQL Editor to create the bucket
insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;

create policy "Allow anonymous to read event-media"
on storage.objects
for select
to anon
using (bucket_id = 'event-media');

create policy "Allow admins to manage event-media"
on storage.objects
for all
to authenticated
using (bucket_id = 'event-media')
with check (bucket_id = 'event-media');

-- 17. Create the booking_requests table
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) not null,
  name text not null,
  email text not null,
  phone text not null,
  tickets integer not null default 1,
  total_amount text,
  verify_method text not null,
  utr_number text,
  screenshot_url text,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on booking_requests
alter table public.booking_requests enable row level security;

-- Policies for booking_requests
create policy "Allow public to insert booking requests"
on public.booking_requests
for insert
to public
with check (true);

create policy "Allow admins to manage booking requests"
on public.booking_requests
for all
to authenticated
using (true)
with check (true);
