-- Routim shared production-oriented schema.
-- Use the Supabase SQL editor. Never expose a service_role key in the browser.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Routim user',
  email text not null,
  role text not null default 'user' check (role in ('user','owner','moderator')),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'system',
  created_at timestamptz not null default now()
);

-- Existing demo report table is kept compatible with the app.
create table if not exists public.reports (
  id uuid primary key,
  edge_id text not null,
  type text not null,
  location text not null,
  description text not null,
  timestamp timestamptz not null,
  updated_at timestamptz not null,
  photo_name text,
  status text not null default 'unverified',
  confirmations jsonb not null default '[]'::jsonb,
  created_by text not null,
  created_by_user_id uuid references public.profiles(id) on delete set null
);

create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1), 'Routim user');
  insert into public.profiles(id,name,email) values(new.id, display_name, coalesce(new.email,''))
  on conflict (id) do update set name=excluded.name, email=excluded.email;
  insert into public.activity_events(user_id,event_type,title,body,metadata)
  values(new.id,'user_joined','New Routim user joined',display_name || ' created a Routim account.',jsonb_build_object('email',new.email));
  insert into public.notifications(recipient_user_id,title,body,type)
  select id,'New Routim user joined',display_name || ' just created a Routim account.','system'
  from public.profiles where role = 'owner';
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.notify_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_events(user_id,event_type,title,body,metadata)
  values(new.created_by_user_id,'report_created','New barrier report',new.type || ' reported at ' || new.location || '.',jsonb_build_object('report_id',new.id,'edge_id',new.edge_id));
  insert into public.notifications(recipient_user_id,title,body,type)
  select id,'New barrier report',new.type || ' reported at ' || new.location || '.','report'
  from public.profiles where role = 'owner';
  return new;
end;
$$;

drop trigger if exists on_report_created on public.reports;
create trigger on_report_created
after insert on public.reports
for each row execute function public.notify_report();

alter table public.profiles enable row level security;
alter table public.activity_events enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profile self or owner read" on public.profiles;
create policy "profile self or owner read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_owner());
drop policy if exists "profile self update" on public.profiles;
create policy "profile self update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "activity self or owner read" on public.activity_events;
create policy "activity self or owner read" on public.activity_events for select to authenticated using (user_id = auth.uid() or public.is_owner());
drop policy if exists "activity own insert" on public.activity_events;
create policy "activity own insert" on public.activity_events for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "notifications own or owner read" on public.notifications;
create policy "notifications own or owner read" on public.notifications for select to authenticated using (recipient_user_id = auth.uid() or recipient_user_id is null or public.is_owner());
drop policy if exists "notification authenticated insert" on public.notifications;
create policy "notification authenticated insert" on public.notifications for insert to authenticated with check (recipient_user_id = auth.uid() or recipient_user_id is null);

drop policy if exists "reports read" on public.reports;
create policy "reports read" on public.reports for select using (true);
drop policy if exists "reports insert" on public.reports;
create policy "reports insert" on public.reports for insert with check (true);
drop policy if exists "reports update" on public.reports;
create policy "reports update" on public.reports for update using (true) with check (true);

-- IMPORTANT: after creating your owner account, run this once with your real email:
-- update public.profiles set role = 'owner' where email = 'YOUR_OWNER_EMAIL';
