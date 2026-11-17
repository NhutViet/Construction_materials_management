-- Schema Supabase cho Inventory Management System.
-- Chạy trong Supabase SQL Editor (hoặc `supabase db push`).
-- Tên cột được quote để giữ nguyên camelCase / `_id` mà frontend đang dùng.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  fullname text,
  email text not null,
  "phoneNumber" text,
  "bankNumber" text,
  "bankName" text,
  role text not null default 'staff',
  "createdAt" timestamptz not null default now()
);

-- Tự tạo profile khi có user mới đăng ký qua Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, fullname, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'fullname', split_part(new.email, '@', 1)),
    new.email
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- materials
create table if not exists public.materials (
  "_id" uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Khác',
  price numeric not null default 0,
  "importCost" numeric not null default 0,
  quantity numeric not null default 0,
  unit text not null default '',
  supplier text,
  description text,
  "minStock" numeric not null default 10,
  "maxStock" numeric not null default 0,
  location text,
  "userId" uuid,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- ---------------------------------------------------------------- invoices
create table if not exists public.invoices (
  "_id" uuid primary key default gen_random_uuid(),
  "invoiceNumber" text not null unique,
  "customerId" text,
  "customerName" text not null,
  "customerPhone" text,
  "customerAddress" text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  "taxRate" numeric not null default 0,
  "taxAmount" numeric not null default 0,
  "discountRate" numeric not null default 0,
  "discountAmount" numeric not null default 0,
  "totalAmount" numeric not null default 0,
  status text not null default 'pending',
  "paymentMethod" text not null default 'cash',
  "paymentStatus" text not null default 'unpaid',
  "paidAmount" numeric not null default 0,
  "remainingAmount" numeric not null default 0,
  notes text,
  "deliveryDate" timestamptz,
  "createdBy" uuid,
  "approvedBy" uuid,
  "approvedAt" timestamptz,
  "isDeleted" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists invoices_created_idx on public.invoices ("createdAt" desc);
create index if not exists invoices_status_idx on public.invoices (status, "paymentStatus");
create index if not exists invoices_phone_idx on public.invoices ("customerPhone");

-- ---------------------------------------------------------------- stock_in
create table if not exists public.stock_in (
  "_id" uuid primary key default gen_random_uuid(),
  "stockInNumber" text not null unique,
  "userId" uuid,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  "taxRate" numeric not null default 0,
  "taxAmount" numeric not null default 0,
  "discountRate" numeric not null default 0,
  "discountAmount" numeric not null default 0,
  "totalAmount" numeric not null default 0,
  "paymentStatus" text not null default 'unpaid',
  "paidAmount" numeric not null default 0,
  "remainingAmount" numeric not null default 0,
  "paymentNotes" text,
  status text not null default 'pending',
  supplier text,
  "supplierPhone" text,
  "supplierAddress" text,
  notes text,
  "receivedDate" timestamptz,
  "createdBy" uuid,
  "approvedBy" uuid,
  "approvedAt" timestamptz,
  "isDeleted" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists stock_in_created_idx on public.stock_in ("createdAt" desc);

-- ---------------------------------------------------------------- notifications
create table if not exists public.notifications (
  "_id" uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'system',
  priority text not null default 'medium',
  status text not null default 'unread',
  "userId" jsonb,
  "relatedEntityId" text,
  "relatedEntityType" text,
  metadata jsonb,
  "isAutoGenerated" boolean not null default false,
  "expiresAt" timestamptz,
  "readAt" timestamptz,
  "isDeleted" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists notifications_status_idx on public.notifications (status, "createdAt" desc);

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.invoices enable row level security;
alter table public.stock_in enable row level security;
alter table public.notifications enable row level security;

-- Cho phép đọc profiles khi chưa đăng nhập (cần để login bằng username)
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles for select to anon using (true);

-- Người đã đăng nhập có toàn quyền trên các bảng nghiệp vụ.
-- Lưu ý: đây là cấu hình prototype; nếu cần phân quyền theo user,
-- thêm cột owner và đổi USING thành (owner = auth.uid()).
drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['materials','invoices','stock_in','notifications'] loop
    execute format('drop policy if exists %I on public.%I', 'authenticated_all_' || t, t);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', 'authenticated_all_' || t, t);
  end loop;
end $$;

-- Cho phép khách tra cứu hóa đơn công khai (/invoices/public/search)
drop policy if exists "invoices_public_read" on public.invoices;
create policy "invoices_public_read" on public.invoices for select to anon using ("isDeleted" = false);

-- Realtime cho thông báo (tuỳ dùng; adapter hiện vẫn giữ polling)
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;
