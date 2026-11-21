-- Lịch sử giao hàng từng phần cho hóa đơn.
-- Chạy trong Supabase SQL Editor sau file 0001_init.sql.

create table if not exists public.delivery_records (
  "_id" uuid primary key default gen_random_uuid(),
  "invoiceId" uuid not null references public.invoices("_id") on delete cascade,
  "invoiceNumber" text not null,
  "batchId" uuid not null default gen_random_uuid(),
  "itemIndex" integer not null,
  "materialId" text,
  "materialName" text not null,
  unit text,
  quantity numeric not null check (quantity > 0),
  "deliveredAt" timestamptz not null default now(),
  "deliveredBy" uuid,
  "deliveredByName" text,
  notes text,
  "createdAt" timestamptz not null default now()
);

create index if not exists delivery_records_invoice_idx
  on public.delivery_records ("invoiceId", "deliveredAt" desc);

create index if not exists delivery_records_batch_idx
  on public.delivery_records ("batchId");

alter table public.delivery_records enable row level security;

drop policy if exists "authenticated_all_delivery_records" on public.delivery_records;
create policy "authenticated_all_delivery_records"
  on public.delivery_records
  for all to authenticated
  using (true)
  with check (true);
