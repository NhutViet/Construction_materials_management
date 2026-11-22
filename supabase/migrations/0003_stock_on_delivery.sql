-- 0003: Chuyển sang cơ chế "chỉ trừ tồn kho khi giao hàng".
--
-- Bối cảnh: trước đây adapter Supabase trừ tồn kho ngay khi tạo hóa đơn.
-- Bây giờ tồn kho chỉ bị trừ khi ghi nhận giao hàng.
--
-- File này xử lý dữ liệu cũ: cộng lại phần hàng của các hóa đơn CHƯA giao,
-- vì phần đó đã bị trừ sẵn lúc tạo đơn. Chạy đúng MỘT LẦN sau khi deploy code mới.
-- Có bảng app_migrations để chạy lại nhiều lần cũng không bị cộng trùng.

create table if not exists public.app_migrations (
  id text primary key,
  "appliedAt" timestamptz not null default now()
);

alter table public.app_migrations enable row level security;

do $$
declare
  already_applied boolean;
begin
  select exists(
    select 1 from public.app_migrations where id = '0003_stock_on_delivery'
  ) into already_applied;

  if already_applied then
    raise notice 'Migration 0003 đã chạy trước đó, bỏ qua.';
    return;
  end if;

  with undelivered as (
    select
      (item->>'materialId')::uuid as material_id,
      sum(
        coalesce((item->>'quantity')::numeric, 0)
        - coalesce((item->>'deliveredQuantity')::numeric, 0)
      ) as quantity
    from public.invoices i
    cross join lateral jsonb_array_elements(i.items) item
    where coalesce(item->>'materialId', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    group by 1
  )
  update public.materials m
  set quantity = m.quantity + u.quantity,
      "updatedAt" = now()
  from undelivered u
  where m."_id" = u.material_id
    and u.quantity <> 0;

  insert into public.app_migrations (id) values ('0003_stock_on_delivery');
  raise notice 'Đã cộng lại tồn kho cho phần chưa giao của các hóa đơn cũ.';
end $$;
