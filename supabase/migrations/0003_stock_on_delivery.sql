-- 0003: Chuyển sang cơ chế "chỉ trừ tồn kho khi giao hàng".
--
-- Bối cảnh: trước đây adapter Supabase trừ tồn kho ngay khi tạo hóa đơn.
-- Bây giờ tồn kho chỉ bị trừ khi ghi nhận giao hàng.
--
-- File này cộng lại phần hàng CHƯA GIAO của các hóa đơn cũ (đã bị trừ sẵn lúc tạo đơn).
-- Hóa đơn tạo bằng code mới có dấu "stockDeductedAtCreation": false trong từng item
-- nên sẽ không bị cộng lại. Chạy lại nhiều lần cũng an toàn.

do $$
begin
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
      and coalesce((item->>'stockDeductedAtCreation')::boolean, true) = true
    group by 1
  )
  update public.materials m
  set quantity = m.quantity + u.quantity,
      "updatedAt" = now()
  from undelivered u
  where m."_id" = u.material_id
    and u.quantity <> 0;

  -- Đánh dấu các item cũ đã được xử lý để lần chạy sau không cộng trùng.
  update public.invoices i
  set items = (
    select jsonb_agg(
      case
        when coalesce((item->>'stockDeductedAtCreation')::boolean, true)
          then item || '{"stockDeductedAtCreation": false}'::jsonb
        else item
      end
      order by ordinality
    )
    from jsonb_array_elements(i.items) with ordinality as t(item, ordinality)
  )
  where exists (
    select 1
    from jsonb_array_elements(i.items) item
    where coalesce((item->>'stockDeductedAtCreation')::boolean, true) = true
  );

  raise notice 'Đã cộng lại tồn kho cho phần chưa giao của các hóa đơn cũ.';
end $$;
