# 🧪 HƯỚNG DẪN TEST REALTIME - PHASE 4

## 📋 Chuẩn bị

**Server đang chạy:** http://localhost:3001/

**Yêu cầu:**

- 2 trình duyệt (hoặc 1 normal + 1 incognito)
- 1 tài khoản admin (email: admin@sporthub.com, pass: admin123)
- 1 tài khoản customer (hoặc checkout không cần đăng nhập)

## ✅ TEST SCENARIO 1: Admin nhận thông báo đơn hàng mới

### Bước 1: Mở Admin Dashboard

1. Trình duyệt 1: Truy cập http://localhost:3001/login
2. Đăng nhập admin: admin@sporthub.com / admin123
3. Vào trang Admin Dashboard (click biểu tượng admin)
4. Chuyển sang tab "Quản lý đơn hàng"
5. **LƯU Ý:** Badge số đếm ở tab "Đơn mới" (góc trên bên phải)

### Bước 2: Tạo đơn hàng mới

1. Trình duyệt 2 (incognito): Truy cập http://localhost:3001/
2. Thêm sản phẩm vào giỏ hàng
3. Checkout với thông tin:
   - Họ tên: Nguyễn Test Realtime
   - Số điện thoại: 0912345678
   - Email: testrealtime@test.com
   - Địa chỉ: 123 Test Street, District 1, Ho Chi Minh City
4. Hoàn tất đặt hàng

### Bước 3: Kiểm tra Admin Dashboard

**✅ Kết quả mong đợi:**

- Toast notification xuất hiện: "Đơn hàng mới: ORD-XXXXXX - Nguyễn Test Realtime"
- Badge counter ở tab "Đơn mới" **tăng lên +1** (với hiệu ứng ping màu xanh)
- Đơn hàng mới xuất hiện trong danh sách **KHÔNG CẦN refresh trang**
- Toast tự động biến mất sau 5 giây

### Bước 4: Reset Badge

1. Click vào tab "Đơn mới"
2. **✅ Badge counter reset về 0**

---

## ✅ TEST SCENARIO 2: Customer nhận thông báo cập nhật trạng thái

### Bước 1: Customer tra cứu đơn hàng

1. Trình duyệt 2: Sau khi đặt hàng xong, lưu lại **mã đơn hàng** (ORD-XXXXXX)
2. Truy cập trang "Tra cứu đơn hàng" (menu header)
3. Nhập:
   - Mã đơn hàng: ORD-XXXXXX
   - Email: testrealtime@test.com
4. Click "Tra cứu"
5. **Để trang này MỞ, KHÔNG refresh**

### Bước 2: Admin cập nhật trạng thái

1. Trình duyệt 1 (Admin Dashboard):
2. Tìm đơn hàng vừa tạo (ORD-XXXXXX)
3. Click "Chi tiết"
4. Đổi trạng thái từ **"Chờ xác nhận"** → **"Đang đóng gói"**
5. Click "Cập nhật"

### Bước 3: Kiểm tra Customer Tracking Page

**✅ Kết quả mong đợi:**

- Toast notification xuất hiện: "Đơn hàng chuyển từ 'Chờ xác nhận' → 'Đang đóng gói'"
- Trạng thái đơn hàng **tự động cập nhật** từ "Chờ xác nhận" → "Đang đóng gói"
- Timeline cập nhật **KHÔNG CẦN refresh trang**
- Toast tự động biến mất sau 5 giây

### Bước 4: Thử nhiều thay đổi liên tiếp

1. Admin: Đổi tiếp "Đang đóng gói" → "Đang giao hàng"
2. Admin: Đổi tiếp "Đang giao hàng" → "Đã giao hàng"
3. **✅ Customer thấy 2 toast liên tiếp, trạng thái cập nhật realtime**

---

## ✅ TEST SCENARIO 3: Nhiều đơn hàng cùng lúc

### Bước 1: Tạo 3 đơn hàng liên tiếp

1. Trình duyệt 2: Tạo đơn hàng 1 (khách A)
2. Trình duyệt 3 (hoặc xóa cookies): Tạo đơn hàng 2 (khách B)
3. Trình duyệt 4 (hoặc xóa cookies): Tạo đơn hàng 3 (khách C)

### Bước 2: Kiểm tra Admin

**✅ Kết quả mong đợi:**

- 3 toast notifications xuất hiện **chồng lên nhau** (stacked)
- Badge counter: **+3**
- Tất cả 3 đơn hàng xuất hiện trong danh sách
- Toast tự động dismiss lần lượt

---

## 🐛 Các lỗi có thể gặp & Cách fix

### Lỗi 1: Toast không xuất hiện

**Nguyên nhân:** Realtime subscription chưa kết nối
**Kiểm tra:**

```javascript
// Mở DevTools Console (F12)
// Sẽ thấy log:
"Subscribed to orders realtime"; // Admin
"Subscribed to order updates: ORD-XXXXXX"; // Customer
```

**Fix:** Refresh trang, đảm bảo đã đăng nhập

### Lỗi 2: Badge không tăng

**Nguyên nhân:** Đang ở tab "Đơn mới" khi có đơn mới
**Fix:** Chuyển sang tab khác, badge sẽ hiển thị khi quay lại

### Lỗi 3: Customer không nhận được cập nhật

**Nguyên nhân:** Chưa tra cứu đơn hàng (subscription chỉ kích hoạt khi tìm thấy order)
**Fix:** Đảm bảo đã nhập đúng mã đơn hàng + email và click "Tra cứu"

### Lỗi 4: Toast không tự động biến mất

**Nguyên nhân:** Lỗi trong useToast hook
**Kiểm tra:** Xem Console có lỗi JavaScript không
**Fix:** Có thể dismiss thủ công bằng cách click vào toast

---

## 📊 Console Logs để Debug

**Admin Dashboard (OrderManager.tsx):**

```
✅ Subscribed to orders realtime
✅ New order event: { id: "...", orderCode: "ORD-...", customer: "..." }
✅ Order updated: { id: "...", status: "PACKING" }
```

**Customer Tracking (OrderTrackingPage.tsx):**

```
✅ Subscribed to order updates: ORD-XXXXXX
✅ Order status changed: PENDING_CONFIRMATION -> PACKING
✅ Unsubscribed from order: ORD-XXXXXX
```

---

## ✅ Checklist Hoàn tất Testing

- [ ] Admin nhận được toast khi có đơn mới
- [ ] Badge counter tăng đúng số lượng
- [ ] Badge reset khi click tab "Đơn mới"
- [ ] Đơn hàng xuất hiện không cần refresh
- [ ] Customer nhận toast khi trạng thái thay đổi
- [ ] Trạng thái đơn hàng tự động cập nhật
- [ ] Nhiều toast có thể hiển thị cùng lúc
- [ ] Toast tự động dismiss sau 5 giây
- [ ] Console không có lỗi JavaScript
- [ ] Realtime subscription cleanup khi unmount

---

## 🎯 Kết luận

Nếu tất cả checklist đều ✅ → **Phase 4 hoàn tất thành công!**

Nếu có lỗi → Xem phần "Các lỗi có thể gặp" hoặc kiểm tra Console logs.
