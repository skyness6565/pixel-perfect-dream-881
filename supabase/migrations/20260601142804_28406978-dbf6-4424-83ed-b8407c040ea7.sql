-- ROLES
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

-- KYC SUBMISSIONS
create type public.kyc_status as enum ('pending', 'approved', 'rejected');

create table public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  front_path text not null,
  back_path text not null,
  status kyc_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert on public.kyc_submissions to authenticated;
grant all on public.kyc_submissions to service_role;

alter table public.kyc_submissions enable row level security;

create policy "Users can view their own kyc"
on public.kyc_submissions for select to authenticated
using (auth.uid() = user_id);

create policy "Users can submit their own kyc"
on public.kyc_submissions for insert to authenticated
with check (auth.uid() = user_id);

create policy "Admins can view all kyc"
on public.kyc_submissions for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update kyc"
on public.kyc_submissions for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- helper: latest kyc approved?
create or replace function public.is_kyc_approved(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.kyc_submissions
    where user_id = _user_id and status = 'approved'
  )
$$;

-- APPOINTMENTS
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  appointment_date date not null,
  appointment_time text not null,
  age integer,
  country text,
  phone text,
  notes text,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

grant select, insert on public.appointments to authenticated;
grant all on public.appointments to service_role;

alter table public.appointments enable row level security;

create policy "Users can view their own appointments"
on public.appointments for select to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own appointments"
on public.appointments for insert to authenticated
with check (auth.uid() = user_id);

create policy "Admins can view all appointments"
on public.appointments for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- SIGNUP TRIGGER: create profile + default user role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- STORAGE BUCKET for KYC documents (private)
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "Users can upload their own kyc documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'kyc-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own kyc documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'kyc-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Admins can view all kyc documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'kyc-documents'
  and public.has_role(auth.uid(), 'admin')
);