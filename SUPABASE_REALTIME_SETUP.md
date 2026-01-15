# Hướng dẫn cấu hình Supabase Realtime cho Chat

## 🔴 Vấn đề hiện tại

Chat không realtime vì Supabase Realtime cần được bật cho các tables cần theo dõi.

## ✅ Các bước cấu hình

### Bước 1: Đăng nhập Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn

### Bước 2: Bật Realtime cho tables ChatRoom và ChatMessage

#### Cách 1: Qua giao diện (Khuyến nghị)

1. Vào **Database** → **Replication**
2. Tìm đến section **"Tables currently enabled for realtime"**
3. Click **"Add table"** hoặc toggle ON cho các tables:
   - `ChatRoom`
   - `ChatMessage`
   - `Notification` (nếu muốn notification realtime)

#### Cách 2: Chạy SQL (Nhanh hơn)

Vào **SQL Editor** và chạy lệnh sau:

```sql
-- Bật Realtime cho ChatRoom
ALTER PUBLICATION supabase_realtime ADD TABLE "ChatRoom";

-- Bật Realtime cho ChatMessage
ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage";

-- Bật Realtime cho Notification (tùy chọn)
ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";

-- Kiểm tra các tables đã bật realtime
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Bước 3: Cấu hình Row Level Security (RLS)

Realtime chỉ hoạt động nếu user có quyền SELECT trên row. Chạy SQL sau:

```sql
-- Cho phép user đọc tin nhắn trong room của họ
CREATE POLICY "Users can read their chat messages" ON "ChatMessage"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "ChatRoom"
    WHERE "ChatRoom".id = "ChatMessage"."roomId"
    AND (
      "ChatRoom"."customerId" = auth.uid()::text
      OR "ChatRoom"."staffId" = auth.uid()::text
    )
  )
  OR
  -- Admin/Staff có thể đọc tất cả
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "User".id = auth.uid()::text
    AND "User".role IN ('ADMIN', 'SALES')
  )
);

-- Cho phép user đọc room của họ
CREATE POLICY "Users can read their chat rooms" ON "ChatRoom"
FOR SELECT USING (
  "customerId" = auth.uid()::text
  OR "staffId" = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "User".id = auth.uid()::text
    AND "User".role IN ('ADMIN', 'SALES')
  )
);
```

**Lưu ý:** Nếu bạn đang dùng `anon` key và RLS đã được disable, bạn có thể bỏ qua bước này.

### Bước 4: Kiểm tra hoạt động

1. Mở Console trình duyệt (F12 → Console)
2. Bạn sẽ thấy log:
   ```
   🔌 [ADMIN CHAT] Setting up realtime subscriptions...
   📡 [REALTIME] Chat rooms subscription: SUBSCRIBED
   ```
3. Nếu thấy `SUBSCRIBED` → Realtime đã hoạt động

### Bước 5: Troubleshooting

#### Nếu vẫn không realtime:

1. **Kiểm tra Publication:**

   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```

   Phải thấy `ChatRoom` và `ChatMessage`

2. **Kiểm tra WebSocket:**

   - Mở Network tab → WS
   - Tìm connection đến `realtime-dev.supabase.io`
   - Status phải là "101 Switching Protocols"

3. **Kiểm tra Console errors:**

   - Nếu thấy "Policy denied" → RLS chưa đúng
   - Nếu thấy "Table not in publication" → Bước 2 chưa xong

4. **Restart Supabase client:**
   - Hard refresh trình duyệt (Ctrl+Shift+R)

---

## 📝 Trả lời câu hỏi: Có nên lưu lại đoạn chat không?

### ✅ **CÓ, nên lưu lại đoạn chat** vì:

1. **Lịch sử hỗ trợ**: Khi khách hàng quay lại, nhân viên có thể xem lại các vấn đề trước đó để hỗ trợ tốt hơn

2. **Giải quyết tranh chấp**: Nếu có khiếu nại về đơn hàng, đổi trả, bạn có bằng chứng về những gì đã trao đổi

3. **Đào tạo nhân viên**: Dùng các cuộc chat thực tế để training nhân viên mới

4. **Phân tích chất lượng**: Đánh giá chất lượng hỗ trợ, thời gian phản hồi, satisfaction

5. **Pháp lý**: Trong một số ngành (tài chính, y tế), việc lưu trữ giao tiếp là bắt buộc

### 💡 **Best practice:**

- Lưu vĩnh viễn hoặc ít nhất 1-2 năm
- Đánh dấu trạng thái `RESOLVED` khi hoàn thành (đã làm)
- Cho phép export nếu cần

---

## 🔧 Tình trạng hiện tại của code

Code đã được cài đặt đầy đủ realtime subscriptions trong:

- `AdminChatDashboard.tsx` - Dùng `supabase.channel()` trực tiếp
- `CustomerChatWidget.tsx` - Dùng `subscribeToChatMessages()` từ `realtime.ts`

**Chỉ cần bật Realtime ở Supabase Dashboard (Bước 2) là sẽ hoạt động!**
