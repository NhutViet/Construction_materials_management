# Chuyển sang Supabase (không cần server backend)

Code đã sẵn sàng: 8 Redux slice **không phải sửa**. Lớp `src/store/AxiosInstance.ts` giờ trỏ tới adapter Supabase.

## 1. Tạo project Supabase (free)

1. Đăng ký https://supabase.com → **New project** (chọn region gần nhất, ví dụ Singapore).
2. Vào **Project Settings → API**, lấy `Project URL` và `anon public key`.

## 2. Tạo schema

Vào **SQL Editor → New query**, dán toàn bộ nội dung `supabase/migrations/0001_init.sql` rồi **Run**.

Sau đó chạy tiếp `supabase/migrations/0002_delivery_history.sql` để tạo bảng lịch sử giao hàng từng phần (`delivery_records`).

Khi chuyển sang cơ chế **chỉ trừ tồn kho lúc giao hàng**, chạy `supabase/migrations/0003_stock_on_delivery.sql`. File này cộng lại phần tồn kho đang bị giữ cho các hóa đơn cũ chưa giao; hóa đơn tạo bằng code mới được đánh dấu riêng nên không bị cộng nhầm, và chạy lại nhiều lần cũng an toàn.

Migration tạo: `profiles`, `materials`, `invoices`, `stock_in`, `notifications`, `delivery_records`, trigger tự tạo profile khi có user mới, RLS cơ bản cho phép client gọi trực tiếp.

> RLS hiện đang là cấu hình prototype: mọi user đã đăng nhập đều thấy mọi bản ghi. Nếu cần phân quyền theo từng user, thêm cột `owner` và đổi policy tương ứng.

## 3. Tạo tài khoản đăng nhập

Vào **Authentication → Users → Add user**, nhập email + password. Trigger sẽ tự tạo row trong `profiles` với `username` = phần trước `@` của email.

Muốn đặt `username`/`fullname` riêng thì thêm user metadata:

```json
{ "username": "admin", "fullname": "Quản lý kho" }
```

Sau đó có thể cập nhật role trong `profiles`:

```sql
update public.profiles set role = 'admin', "fullname" = 'Quản lý kho' where username = 'admin';
```

App hỗ trợ login bằng cả `username` lẫn `email`.

## 4. Cấu hình env cho frontend

```bash
cp .env.example .env
```

Điền:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Chạy `npm run dev`. Khi 2 biến này có mặt, mọi request tự động đi qua Supabase. **Nếu bỏ trống**, app vẫn gọi backend cũ `VITE_API_URL` (mặc định `http://localhost:3000/`) — tiện để so sánh trong lúc migrate.

## 5. Deploy miễn phí

- **Vercel / Cloudflare Pages / Netlify**: import repo, build command `npx vite build`, output `dist`.
- Thêm 2 env var ở trên vào phần Environment Variables của host.
- Không cần chạy server Node nào khác.

## Những gì đã được map

| Nhóm | Cách xử lý |
|---|---|
| Auth | `supabase.auth` + bảng `profiles`, trả đúng `{ user, access_token }` |
| Materials / Invoices / Stock-in / Notifications | PostgREST với tên cột camelCase/`_id` giữ nguyên, trả đúng envelope từng slice (`invoices`, `data`, `{success,message,data}`) |
| Analytics (23 endpoint) | Tính ở client từ dữ liệu thô Supabase, trả đúng shape của `analyticsSlice` kể cả key `_id: {year, month}` |
| Tính tiền hóa đơn, tồn kho | Tính ở adapter: giảm `quantity` vật tư khi tạo hóa đơn, tăng khi nhập kho |
| Notification realtime | Vẫn giữ polling 30s như cũ; có thể đổi sang Supabase Realtime sau |
| Gửi email / export PDF | Hiện trả kết quả giả (các thunk này không đọc response). Muốn gửi thật dùng Resend free tier hoặc Edge Function |
| Tra cứu hóa đơn công khai | Policy anon SELECT trên `invoices`, không cần auth |

## Giới hạn cần biết

- Free tier Supabase có hạn mức và có thể tạm dừng project sau một thời gian không hoạt động; vào dashboard bật lại là dùng tiếp. Kiểm tra chính sách hiện thời tại supabase.com/pricing.
- Analytics tính ở client nên rất hợp dữ liệu vừa và nhỏ. Nếu sau này lên hàng chục nghìn hóa đơn, chuyển dần sang Postgres RPC (`supabase.rpc`) để tính ở server.
- Dùng `anon key` ở frontend là đúng thiết kế Supabase; bảo mật nằm ở RLS, không giấu key.
