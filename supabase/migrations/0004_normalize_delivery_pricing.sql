-- 0004: Chuẩn hoá lại giá trị các hóa đơn đã bị điều chỉnh giá theo cách cũ.
--
-- Cách cũ: khi giá vật tư tăng, toàn bộ số lượng bị tính lại theo giá mới
-- (5 đã giao + 5 còn lại đều thành giá mới).
--
-- Cách mới: phần đã giao giữ giá gốc, chỉ phần còn lại nhận giá mới.
-- File này tính lại deliveredAmount/totalPrice cho từng item và tổng tiền hóa đơn.
-- Chạy lại nhiều lần cũng an toàn.

-- Bước 1: chuẩn hoá từng item.
with normalized as (
  select
    i."_id",
    jsonb_agg(
      item || jsonb_build_object(
        'deliveredAmount',
        round(
          coalesce((item->>'deliveredQuantity')::numeric, 0)
          * coalesce((item->>'originalUnitPrice')::numeric, (item->>'unitPrice')::numeric, 0),
          2
        ),
        'originalUnitPrice',
        coalesce((item->>'originalUnitPrice')::numeric, (item->>'unitPrice')::numeric, 0),
        'originalTotalPrice',
        coalesce(
          (item->>'originalTotalPrice')::numeric,
          coalesce((item->>'originalUnitPrice')::numeric, (item->>'unitPrice')::numeric, 0)
          * coalesce((item->>'quantity')::numeric, 0)
        ),
        'totalPrice',
        round(
          coalesce((item->>'deliveredQuantity')::numeric, 0)
          * coalesce((item->>'originalUnitPrice')::numeric, (item->>'unitPrice')::numeric, 0)
          + greatest(
              0,
              coalesce((item->>'quantity')::numeric, 0)
              - coalesce((item->>'deliveredQuantity')::numeric, 0)
            )
          * coalesce((item->>'unitPrice')::numeric, 0),
          2
        )
      )
      order by ordinality
    ) as items
  from public.invoices i
  cross join lateral jsonb_array_elements(i.items) with ordinality as t(item, ordinality)
  group by i."_id"
)
update public.invoices i
set items = n.items
from normalized n
where i."_id" = n."_id";

-- Bước 2: tính lại tổng tiền, tiền còn lại và trạng thái thanh toán.
with recalculated as (
  select
    i."_id",
    coalesce(sum((item->>'totalPrice')::numeric), 0) as subtotal,
    coalesce(i."taxRate", 0) as tax_rate,
    coalesce(i."discountRate", 0) as discount_rate,
    coalesce(i."paidAmount", 0) as paid_amount
  from public.invoices i
  cross join lateral jsonb_array_elements(i.items) item
  group by i."_id", i."taxRate", i."discountRate", i."paidAmount"
)
update public.invoices i
set subtotal = r.subtotal,
    "taxAmount" = round(r.subtotal * r.tax_rate / 100, 2),
    "discountAmount" = round(r.subtotal * r.discount_rate / 100, 2),
    "totalAmount" = round(
      r.subtotal
      + round(r.subtotal * r.tax_rate / 100, 2)
      - round(r.subtotal * r.discount_rate / 100, 2),
      2
    ),
    "remainingAmount" = greatest(
      0,
      round(
        r.subtotal
        + round(r.subtotal * r.tax_rate / 100, 2)
        - round(r.subtotal * r.discount_rate / 100, 2),
        2
      ) - r.paid_amount
    ),
    "paymentStatus" = case
      when r.paid_amount >= round(
        r.subtotal
        + round(r.subtotal * r.tax_rate / 100, 2)
        - round(r.subtotal * r.discount_rate / 100, 2),
        2
      ) then 'paid'
      when r.paid_amount > 0 then 'partial'
      else 'unpaid'
    end,
    "updatedAt" = now()
from recalculated r
where i."_id" = r."_id";
