# Hướng dẫn cấu hình Supabase Realtime cho Đơn hàng

## Mục đích
Khi có đơn hàng mới hoặc cập nhật, admin sẽ thấy ngay lập tức mà không cần refresh trang.

## Bước 1: Bật Realtime cho bảng Order

### Cách 1: Qua Supabase Dashboard

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Database** → **Replication**
4. Trong phần **Tables**, tìm bảng `Order`
5. Bật toggle để enable realtime cho bảng này
6. Đảm bảo các cột sau được bật cho replication:
   - `id`
   - `orderCode`
   - `status`
   - `customerName`
   - `totalAmount`
   - `createdAt`
   - `updatedAt`

### Cách 2: Chạy SQL (Khuyến nghị)

Vào **SQL Editor** và chạy:

```sql
-- Bật Realtime cho bảng Order
ALTER PUBLICATION supabase_realtime ADD TABLE "Order";

-- Kiểm tra xem đã bật chưa
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## Bước 2: Kiểm tra RLS Policies

Realtime chỉ hoạt động nếu user có quyền SELECT trên bảng. Chạy SQL sau:

```sql
-- Đảm bảo policy cho phép admin đọc orders
CREATE POLICY IF NOT EXISTS "Allow admin to read all orders" 
ON "Order"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User" 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'SALES', 'WAREHOUSE')
  )
);

-- Hoặc tạm thời cho phép tất cả (DEV only)
-- CREATE POLICY "Allow all select on Order" ON "Order" FOR SELECT USING (true);
```

## Bước 3: Verify Realtime đang hoạt động

### Test trong Console

Mở DevTools (F12) → Console, bạn sẽ thấy log khi có đơn hàng:

```
📡 [REALTIME] Orders subscription status: SUBSCRIBED
🔔 [REALTIME] Order change: {eventType: 'INSERT', ...}
```

### Nếu không thấy log

1. Kiểm tra Supabase URL và Anon Key đúng chưa
2. Đảm bảo đã bật realtime cho bảng Order
3. Kiểm tra RLS không block SELECT

## Bước 4: Kiểm tra cấu hình Supabase

Trong file `lib/supabase.ts`, đảm bảo có config realtime:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

## Troubleshooting

### Đơn hàng mới không tự động hiện
1. Mở DevTools → Network → WS (WebSocket)
2. Tìm connection đến Supabase realtime
3. Kiểm tra messages gửi/nhận

### Lỗi "subscription error"
- Kiểm tra Supabase project còn active không
- Kiểm tra quota realtime connections (free tier: 200 concurrent)

### Chỉ INSERT hoạt động, UPDATE không
- Đảm bảo trong SQL có `event: "*"` hoặc liệt kê cả `UPDATE`
- Kiểm tra trigger không block

## Code Reference

File: `lib/realtime.ts`

```typescript
// Subscribe to all Order changes
export const subscribeToOrders = (callback: OrderCallback) => {
  ordersChannel = supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      {
        event: "*", // INSERT, UPDATE, DELETE
        schema: "public",
        table: "Order",
      },
      (payload) => {
        callback({
          type: payload.eventType,
          old: payload.old,
          new: payload.new,
        });
      }
    )
    .subscribe();
  
  return ordersChannel;
};
```

## Kết quả mong đợi

✅ Khi khách đặt hàng → Admin thấy toast "Đơn hàng mới: ORD-XXX"  
✅ Danh sách đơn hàng tự động cập nhật  
✅ Badge số đơn mới tăng lên  
✅ Khi cập nhật trạng thái → Toast "Đơn hàng XXX đã cập nhật"
