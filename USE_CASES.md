# 📘 USE CASE DOCUMENTATION

> **Phân tích bởi:** GitHub Copilot (Senior BA + Senior SE)  
> **Ngày phân tích:** 10/01/2026  
> **Project:** SportHub - Hệ thống bán hàng thể thao

---

## 1. Tổng quan hệ thống

### Mô tả

SportHub là hệ thống E-commerce bán đồ thể thao (chủ yếu giày bóng đá), được xây dựng bằng **React + TypeScript** ở frontend và **Supabase (PostgreSQL)** ở backend. Hệ thống hỗ trợ cả khách vãng lai (guest) và thành viên đăng nhập, với đầy đủ quy trình mua hàng từ duyệt sản phẩm đến thanh toán, đổi/trả hàng.

### Đối tượng người dùng (Roles) - Xác định từ `constants/enums.ts` và `AuthContext.tsx`

| Role          | Mô tả                            | Route chính                                         |
| ------------- | -------------------------------- | --------------------------------------------------- |
| **ADMIN**     | Quản trị viên toàn quyền         | `/admin/*`                                          |
| **SALES**     | Nhân viên bán hàng               | `/admin/*`                                          |
| **WAREHOUSE** | Nhân viên kho                    | `/admin/*`                                          |
| **CUSTOMER**  | Khách hàng đã đăng ký            | `/`, `/products`, `/cart`, `/checkout`, `/profile`  |
| **Guest**     | Khách vãng lai (không đăng nhập) | `/`, `/products`, `/cart`, `/checkout`, `/tracking` |

**Ghi chú:** Logic phân quyền trong `App.tsx`:

- Role khác `CUSTOMER` được tự động redirect sang `/admin`
- Route `/admin` yêu cầu role = `ADMIN` (hardcode trong ProtectedRoute)
- Chưa thấy phân quyền chi tiết cho SALES và WAREHOUSE trong admin

---

## 2. Danh sách module hiện có

Dựa trên routing (`App.tsx`) và Admin Dashboard (`AdminDashboard.tsx`):

### Frontend - Khách hàng

1. **Trang chủ (HomePage)**
2. **Danh sách sản phẩm (ProductListPage)**
3. **Chi tiết sản phẩm (ProductDetailPage)**
4. **Giỏ hàng (CartPage)**
5. **Thanh toán (CheckoutPage)**
6. **Cổng thanh toán online (PaymentGateway)**
7. **Tra cứu đơn hàng (OrderTrackingPage)**
8. **Chi tiết đơn hàng (OrderDetailPage)**
9. **Hồ sơ cá nhân (ProfilePage)**
10. **Đăng nhập/Đăng ký/Quên mật khẩu (AuthPages)**

### Admin Dashboard

1. **Tổng quan (DashboardView)**
2. **Kinh doanh - Đơn hàng (OrderListManager)**
3. **Kinh doanh - Đổi/Trả (ReturnManager)**
4. **Sản phẩm - Quản lý sản phẩm & SKU (ProductManager)**
5. **Sản phẩm - Bảng Size (SizeGuideManager)**
6. **Sản phẩm - Cấu hình (ProductConfigManager)**: Category, Brand, Attribute
7. **Kho - Nhập kho (InventoryManager/StockEntrySystem)**
8. **Kho - Xuất kho (StockIssueManager)**
9. **Kho - Kiểm kê (StocktakeManager)**
10. **Kho - Báo cáo tồn kho (InventoryReportManager)**
11. **Kho - Nhà cung cấp (SupplierManager)**
12. **Báo cáo - Doanh thu (ReportsManager)**
13. **Cấu hình - Website (SystemConfigManager)**
14. **Cấu hình - Nhân viên (SystemManager)**
15. **Cấu hình - Nhật ký (AuditLogsView)**

---

## 3. Use Case theo từng Module

---

### 📦 Module: Xác thực & Phân quyền

#### UC-AUTH-01: Đăng nhập

- **Actor:** Guest
- **Mô tả:** Người dùng đăng nhập vào hệ thống bằng email
- **Trigger:** Click nút "Đăng nhập" tại `/login`
- **Pre-condition:** Tài khoản đã tồn tại trong hệ thống
- **Main flow:**
  1. Nhập email
  2. Gọi API `api.auth.login(email)`
  3. Nếu user tồn tại trong Supabase → lưu vào localStorage + context
  4. Nếu không tồn tại → tạo user guest (không persist)
  5. Redirect dựa trên role (ADMIN/SALES/WAREHOUSE → `/admin`, CUSTOMER → `/`)
- **Post-condition:** User được lưu vào `AuthContext` và `localStorage`
- **Trạng thái:**
  - [x] Đã hoàn chỉnh
  - **⚠️ Lưu ý:** Không có logic kiểm tra mật khẩu - chỉ check email tồn tại

#### UC-AUTH-02: Đăng xuất

- **Actor:** User đã đăng nhập
- **Mô tả:** Đăng xuất khỏi hệ thống
- **Trigger:** Click "Đăng xuất"
- **Pre-condition:** Đã đăng nhập
- **Main flow:**
  1. Gọi `logout()` từ AuthContext
  2. Xóa localStorage key `sporthub_user`
  3. Redirect về `/login`
- **Post-condition:** Session bị hủy
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-AUTH-03: Đăng ký tài khoản

- **Actor:** Guest
- **Mô tả:** Tạo tài khoản mới
- **Trigger:** Click "Đăng ký" tại `/register`
- **Pre-condition:** None
- **Main flow:** Không đủ dữ liệu trong code để mô tả chi tiết
- **Trạng thái:**
  - [ ] Mới có UI (`RegisterPage` component)
  - [ ] Chưa có backend - không thấy API `register` trong services

#### UC-AUTH-04: Quên mật khẩu

- **Actor:** Guest
- **Mô tả:** Khôi phục mật khẩu
- **Trigger:** Click "Quên mật khẩu" tại `/forgot-password`
- **Pre-condition:** None
- **Trạng thái:**
  - [ ] Mới có UI (`ForgotPasswordPage` component)
  - [ ] Chưa có backend

---

### 📦 Module: Sản phẩm (Customer-facing)

#### UC-PROD-01: Xem danh sách sản phẩm

- **Actor:** Guest, Customer
- **Mô tả:** Xem và lọc danh sách sản phẩm đang bán
- **Trigger:** Truy cập `/products`
- **Pre-condition:** None
- **Main flow:**
  1. Load danh sách từ API `api.products.list()` (TanStack Query cached)
  2. Chỉ hiển thị sản phẩm `status = ACTIVE` và `stockQuantity > 0`
  3. Hỗ trợ filter: Danh mục (cha/con), Thương hiệu, Khoảng giá, Màu sắc
  4. Hỗ trợ search: Gõ gần đúng không dấu (`removeAccents`)
  5. Filter đặc thù theo category: studType, line, club, season, boneType
- **Post-condition:** Hiển thị danh sách sản phẩm đã lọc
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-PROD-02: Xem chi tiết sản phẩm

- **Actor:** Guest, Customer
- **Mô tả:** Xem thông tin chi tiết sản phẩm, chọn biến thể
- **Trigger:** Click vào sản phẩm hoặc truy cập `/products/:slug`
- **Pre-condition:** Sản phẩm tồn tại và có status ACTIVE
- **Main flow:**
  1. Load chi tiết từ API `api.products.getDetail(slug)`
  2. Hiển thị: Hình ảnh gallery, Giá (gốc + khuyến mãi), Mô tả, Thuộc tính
  3. Chọn màu sắc → Cập nhật size có sẵn
  4. Chọn size → Hiển thị tồn kho variant
  5. Xem bảng size (modal) từ `SizeGuide` liên kết
  6. Xem đánh giá sản phẩm (paginated)
  7. Xem sản phẩm liên quan (cùng category)
- **Post-condition:** Có thể thêm vào giỏ hàng
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-PROD-03: Thêm sản phẩm vào giỏ hàng

- **Actor:** Guest, Customer
- **Mô tả:** Thêm sản phẩm đã chọn vào giỏ
- **Trigger:** Click "Thêm vào giỏ hàng" tại trang chi tiết
- **Pre-condition:** Đã chọn màu, size, variant còn hàng
- **Main flow:**
  1. Validate: variant có `stockQuantity > 0`
  2. Guest: Lưu vào localStorage (key: `sporthub_guest_cart`)
  3. Customer: Lưu vào server qua TanStack Query mutation
  4. Nếu variant đã có trong giỏ → cộng dồn số lượng
  5. Hiển thị toast/notification thành công
- **Post-condition:** Item được thêm vào giỏ hàng
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Giỏ hàng

#### UC-CART-01: Xem giỏ hàng

- **Actor:** Guest, Customer
- **Mô tả:** Xem danh sách sản phẩm trong giỏ
- **Trigger:** Click icon giỏ hàng hoặc truy cập `/cart`
- **Pre-condition:** None
- **Main flow:**
  1. Load items từ localStorage (guest) hoặc server (member)
  2. Validate từng item với dữ liệu sản phẩm mới nhất:
     - Sản phẩm còn kinh doanh?
     - Variant còn hàng?
     - Số lượng yêu cầu <= tồn kho?
  3. Hiển thị warning/error nếu có vấn đề
  4. Tính tổng tiền (đơn giá × số lượng)
- **Post-condition:** Hiển thị giỏ hàng với trạng thái validate
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-CART-02: Cập nhật số lượng

- **Actor:** Guest, Customer
- **Mô tả:** Tăng/giảm số lượng sản phẩm trong giỏ
- **Trigger:** Click nút +/-
- **Pre-condition:** Item có trong giỏ, còn available
- **Main flow:**
  1. Cập nhật quantity
  2. Nếu quantity = 0 → xóa khỏi giỏ
  3. Validate lại với tồn kho thực tế
  4. Sync với server (nếu đã đăng nhập)
- **Post-condition:** Số lượng được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-CART-03: Xóa sản phẩm khỏi giỏ

- **Actor:** Guest, Customer
- **Mô tả:** Xóa một sản phẩm khỏi giỏ hàng
- **Trigger:** Click nút "Xóa"
- **Pre-condition:** Item có trong giỏ
- **Main flow:**
  1. Gọi `removeFromCart(variantId)`
  2. Cập nhật localStorage hoặc server
- **Post-condition:** Item bị xóa
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-CART-04: Xóa toàn bộ giỏ hàng

- **Actor:** Guest, Customer
- **Mô tả:** Xóa tất cả sản phẩm trong giỏ
- **Trigger:** Click "Xóa tất cả"
- **Pre-condition:** Giỏ có ít nhất 1 item
- **Main flow:**
  1. Gọi `clearCart()`
  2. Xóa localStorage hoặc cập nhật server
- **Post-condition:** Giỏ hàng rỗng
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Thanh toán (Checkout)

#### UC-CHECKOUT-01: Đặt hàng COD

- **Actor:** Guest, Customer
- **Mô tả:** Đặt hàng với phương thức thanh toán khi nhận hàng
- **Trigger:** Submit form checkout với paymentMethod = "COD"
- **Pre-condition:** Giỏ hàng hợp lệ (`isValid = true`)
- **Main flow:**
  1. Nhập thông tin: Họ tên, Email, SĐT, Địa chỉ, Khu vực
  2. Guest: Xác thực OTP qua số điện thoại (mock - in console)
  3. Customer: Bypass OTP
  4. Validate tồn kho lần cuối: `api.products.validateStock()`
  5. Tạo đơn hàng: `api.orders.create()` với status = `PENDING_CONFIRMATION`
  6. Trừ kho ngay: `api.products.deductStock()`
  7. Tự động lưu địa chỉ vào sổ (nếu checkbox checked)
  8. Hiển thị modal thành công với mã đơn
- **Post-condition:** Đơn hàng được tạo, kho đã trừ
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-CHECKOUT-02: Đặt hàng Online Payment

- **Actor:** Guest, Customer
- **Mô tả:** Đặt hàng với thanh toán trực tuyến
- **Trigger:** Submit form checkout với paymentMethod = "ONLINE"
- **Pre-condition:** Giỏ hàng hợp lệ
- **Main flow:**
  1. Nhập thông tin giao hàng (giống COD)
  2. Xác thực OTP (nếu guest)
  3. Tạo đơn hàng với status = `PENDING_PAYMENT`
  4. **Không trừ kho ngay**
  5. Redirect đến `/payment-gateway` với order data
- **Post-condition:** Đơn hàng được tạo, chờ thanh toán
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-CHECKOUT-03: Thanh toán qua cổng (Giả lập)

- **Actor:** Guest, Customer
- **Mô tả:** Hoàn tất thanh toán online
- **Trigger:** Ở trang `/payment-gateway`
- **Pre-condition:** Có order trong state
- **Main flow:**
  1. Chọn phương thức: QR Code hoặc Thẻ quốc tế
  2. Click "Xác nhận thành công":
     - Trừ kho: `api.products.deductStock()`
     - Update order: `paymentStatus = PAID`, `status = PENDING_CONFIRMATION`
  3. Hoặc click "Thanh toán lỗi": Redirect về checkout
  4. Hiển thị modal thành công
- **Post-condition:** Đơn hàng chuyển sang trạng thái đã thanh toán
- **Trạng thái:**
  - [x] Đã hoàn chỉnh (Mock - không tích hợp cổng thật)

#### UC-CHECKOUT-04: Tính phí vận chuyển

- **Actor:** System
- **Mô tả:** Tính phí ship dựa trên khu vực và số lượng item
- **Logic thực tế trong code:**
  - Miễn phí nếu tổng đơn > 1.000.000đ
  - Miễn phí cho sản phẩm có `freeShipping = true`
  - Rate: HCM = 20.000đ, HN = 35.000đ, Khác = 50.000đ
  - Item đầu tiên: full rate, các item sau: 50% rate
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Tra cứu & Quản lý đơn hàng (Customer)

#### UC-ORDER-01: Tra cứu đơn hàng (Guest)

- **Actor:** Guest
- **Mô tả:** Tra cứu trạng thái đơn hàng bằng mã đơn + SĐT
- **Trigger:** Truy cập `/tracking` và submit form
- **Pre-condition:** Có mã đơn hàng hợp lệ
- **Main flow:**
  1. Nhập mã đơn hàng + số điện thoại đặt hàng
  2. Gọi API `api.orders.trackOrder(code, phone)`
  3. Hiển thị thông tin đơn: Trạng thái, Items, Timeline
  4. **Realtime:** Subscribe thay đổi đơn hàng qua Supabase Realtime
- **Post-condition:** Hiển thị thông tin đơn hàng
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ORDER-02: Xem lịch sử đơn hàng (Member)

- **Actor:** Customer
- **Mô tả:** Xem danh sách đơn hàng đã đặt
- **Trigger:** Vào Profile → Tab "Lịch sử mua hàng"
- **Pre-condition:** Đã đăng nhập
- **Main flow:**
  1. Load danh sách đơn từ API `api.orders.list()`
  2. Filter theo tab: Tất cả, Chờ xác nhận, Đóng gói, Giao hàng, Hoàn tất, Đã hủy, Đổi/Trả
  3. Auto-refresh mỗi 30 giây
- **Post-condition:** Hiển thị danh sách đơn
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ORDER-03: Xem chi tiết đơn hàng

- **Actor:** Guest, Customer
- **Mô tả:** Xem chi tiết một đơn hàng cụ thể
- **Trigger:** Truy cập `/orders/:code` hoặc click từ danh sách
- **Pre-condition:** Đơn hàng tồn tại
- **Main flow:**
  1. Load chi tiết từ API `api.orders.getDetail(code)`
  2. Load danh sách sản phẩm để link đến trang chi tiết
  3. Hiển thị: Thông tin khách, Items, Trạng thái, Timeline
  4. Hiển thị nút actions tùy theo trạng thái đơn
- **Post-condition:** Hiển thị đầy đủ thông tin đơn hàng
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ORDER-04: Hủy đơn hàng (Customer)

- **Actor:** Customer, Guest
- **Mô tả:** Hủy đơn hàng đang chờ xử lý
- **Trigger:** Click "Hủy đơn hàng" tại trang chi tiết
- **Pre-condition:**
  - Status = `PENDING_PAYMENT` hoặc `PENDING_CONFIRMATION`
  - Đơn hàng < 30 phút (nếu PENDING_CONFIRMATION)
- **Main flow:**
  1. Chọn lý do hủy từ danh sách có sẵn
  2. Nếu đã thanh toán online: Yêu cầu nhập thông tin ngân hàng hoàn tiền
  3. Gọi API `api.orders.cancelOrder()` hoặc `api.orders.requestRefundAndCancel()`
  4. Hoàn kho nếu đơn COD đã confirm
  5. Cập nhật status = `CANCELLED`
- **Post-condition:** Đơn hàng bị hủy, kho được hoàn (nếu đã trừ)
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Đánh giá sản phẩm

#### UC-REVIEW-01: Viết đánh giá sản phẩm

- **Actor:** Customer
- **Mô tả:** Đánh giá sản phẩm đã mua sau khi nhận hàng
- **Trigger:** Click "Đánh giá" tại trang chi tiết đơn hàng (status = COMPLETED)
- **Pre-condition:** Đơn hàng đã hoàn tất, item chưa được đánh giá
- **Main flow:**
  1. Mở modal đánh giá cho item cụ thể
  2. Chọn số sao (1-5)
  3. Nhập nội dung nhận xét
  4. Upload hình ảnh (optional, base64)
  5. Submit:
     - Gọi `api.products.addReview()` → thêm vào bảng Review
     - Gọi `api.orders.markAsReviewed()` → đánh dấu item đã review
- **Post-condition:** Review được lưu, item không thể review lần nữa
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-REVIEW-02: Xem đánh giá đã viết

- **Actor:** Customer
- **Mô tả:** Xem lại đánh giá đã viết cho sản phẩm
- **Trigger:** Click icon xem tại item đã đánh giá
- **Pre-condition:** Item đã được đánh giá (`isReviewed = true`)
- **Main flow:**
  1. Mở modal hiển thị review info từ `OrderItem.reviewInfo`
- **Post-condition:** Hiển thị nội dung đánh giá
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Đổi/Trả hàng (Customer)

#### UC-RETURN-01: Yêu cầu đổi/trả hàng

- **Actor:** Customer
- **Mô tả:** Gửi yêu cầu đổi hoặc trả hàng cho item đã mua
- **Trigger:** Click "Đổi/Trả" tại item trong đơn hàng đã hoàn tất
- **Pre-condition:**
  - Đơn hàng status = `COMPLETED`
  - Trong vòng 7 ngày kể từ ngày đặt
  - Sản phẩm có `allowReturn = true`
  - Item chưa có request đổi/trả
- **Main flow:**
  1. Chọn loại: Đổi hàng (EXCHANGE) hoặc Hoàn tiền (REFUND)
  2. Chọn lý do từ danh sách
  3. Upload ảnh chứng minh (bắt buộc)
  4. **Nếu đổi:** Chọn size/màu mới muốn đổi sang
  5. **Nếu hoàn tiền:** Nhập thông tin ngân hàng
  6. Submit → `api.returnRequests.create()`
  7. Cập nhật `OrderItem.returnStatus = HAS_REQUEST`
  8. Cập nhật `Order.status = RETURN_REQUESTED`
- **Post-condition:** Yêu cầu đổi/trả được tạo, chờ admin duyệt
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Quản lý hồ sơ (Profile)

#### UC-PROFILE-01: Quản lý sổ địa chỉ

- **Actor:** Customer
- **Mô tả:** Thêm/sửa/xóa địa chỉ giao hàng
- **Trigger:** Vào Profile → Tab "Sổ địa chỉ"
- **Pre-condition:** Đã đăng nhập
- **Main flow:**
  1. Xem danh sách địa chỉ đã lưu
  2. Thêm địa chỉ mới: `addAddress()`
  3. Đặt địa chỉ mặc định: `setDefaultAddress()`
  4. Xóa địa chỉ: `removeAddress()`
  5. Sync với database: `api.users.updateAddresses()`
- **Post-condition:** Địa chỉ được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-PROFILE-02: Xem thông tin cá nhân

- **Actor:** Customer, Staff
- **Mô tả:** Xem và cập nhật thông tin tài khoản
- **Trigger:** Vào Profile → Tab "Thông tin cá nhân"
- **Pre-condition:** Đã đăng nhập
- **Main flow:**
  1. Hiển thị: Họ tên, Email, SĐT, Avatar
  2. **Staff:** Hiển thị thêm: Mã NV, CCCD, Chức vụ, Phòng ban, Ngày gia nhập
- **Post-condition:** Hiển thị thông tin
- **Trạng thái:**
  - [x] Đã hoàn chỉnh (View only)
  - [ ] Chưa có chức năng cập nhật trong code

#### UC-PROFILE-03: Đổi mật khẩu

- **Actor:** Customer, Staff
- **Mô tả:** Thay đổi mật khẩu tài khoản
- **Trigger:** Vào Profile → Tab "Đổi mật khẩu"
- **Pre-condition:** Đã đăng nhập
- **Trạng thái:**
  - [ ] Mới có UI (Tab "Đổi mật khẩu" trong ProfilePage)
  - [ ] Chưa có backend logic (không có API change password)

---

### 📦 Module: Admin - Quản lý đơn hàng

#### UC-ADMIN-ORDER-01: Xem danh sách đơn hàng

- **Actor:** ADMIN
- **Mô tả:** Xem và quản lý tất cả đơn hàng
- **Trigger:** Vào Admin → Kinh doanh → Đơn hàng
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Load danh sách từ `api.orders.list()` (TanStack Query)
  2. **Realtime:** Subscribe qua Supabase Realtime → notification đơn mới
  3. Filter theo tab: Tất cả, Mới, Đang xử lý, Hoàn tất, Hỗ trợ
  4. Filter thêm: Phương thức thanh toán, Loại khách, Ngày
  5. Pagination: 20 items/page
- **Post-condition:** Hiển thị danh sách đơn hàng
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-ORDER-02: Cập nhật trạng thái đơn hàng

- **Actor:** ADMIN
- **Mô tả:** Chuyển trạng thái đơn hàng qua các bước
- **Trigger:** Click nút action tại danh sách hoặc modal chi tiết
- **Pre-condition:** Đơn hàng ở trạng thái hợp lệ để chuyển
- **Main flow:**
  1. Quick confirm: PENDING_CONFIRMATION → PACKING
  2. Mở modal chi tiết để cập nhật:
     - PACKING → SHIPPING (nhập thông tin vận chuyển)
     - SHIPPING → COMPLETED hoặc DELIVERY_FAILED
  3. Gọi `api.orders.updateOrderStatus()`
- **Post-condition:** Trạng thái đơn hàng được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-ORDER-03: Xem chi tiết đơn hàng (Admin)

- **Actor:** ADMIN
- **Mô tả:** Xem đầy đủ thông tin đơn hàng trong modal
- **Trigger:** Click vào một đơn hàng trong danh sách
- **Pre-condition:** None
- **Main flow:**
  1. Mở `AdminOrderDetailModal`
  2. Hiển thị: Thông tin khách, Items, Trạng thái, Return requests (nếu có)
  3. Các action tùy trạng thái đơn
- **Post-condition:** Hiển thị modal chi tiết
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Admin - Quản lý Đổi/Trả

#### UC-ADMIN-RETURN-01: Xem danh sách yêu cầu đổi/trả

- **Actor:** ADMIN
- **Mô tả:** Xem và xử lý các yêu cầu đổi/trả hàng
- **Trigger:** Vào Admin → Kinh doanh → Đổi/Trả
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Load danh sách từ `api.returnRequests.list()`
  2. Filter: Chờ duyệt (PENDING), Đã duyệt (APPROVED), Tất cả
  3. Search theo mã request, mã đơn, SĐT, tên khách
- **Post-condition:** Hiển thị danh sách requests
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-RETURN-02: Duyệt yêu cầu đổi/trả

- **Actor:** ADMIN
- **Mô tả:** Phê duyệt yêu cầu đổi/trả
- **Trigger:** Click "Duyệt" tại request đang PENDING
- **Pre-condition:** Request status = PENDING
- **Main flow:**
  1. Mở modal xem chi tiết request
  2. **Nếu EXCHANGE:** Kiểm tra tồn kho variant muốn đổi sang
  3. Nhập ghi chú admin
  4. Click "Phê duyệt" → `api.returnRequests.approve()`
  5. Cập nhật status = APPROVED
- **Post-condition:** Request được duyệt
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-RETURN-03: Từ chối yêu cầu đổi/trả

- **Actor:** ADMIN
- **Mô tả:** Từ chối yêu cầu đổi/trả
- **Trigger:** Click "Từ chối" tại request đang PENDING
- **Pre-condition:** Request status = PENDING
- **Main flow:**
  1. Mở modal từ chối
  2. Nhập lý do từ chối (bắt buộc)
  3. Gọi `api.returnRequests.reject()`
  4. Cập nhật status = REJECTED
- **Post-condition:** Request bị từ chối
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Admin - Quản lý Sản phẩm

#### UC-ADMIN-PROD-01: Xem danh sách sản phẩm

- **Actor:** ADMIN
- **Mô tả:** Xem tất cả sản phẩm trong hệ thống
- **Trigger:** Vào Admin → Sản phẩm → Sản phẩm & SKU
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Load từ `api.products.list()` (TanStack Query)
  2. Hiển thị: Tên, Mã, Phân loại, Số variant, Trạng thái
  3. Search theo tên hoặc mã sản phẩm
- **Post-condition:** Hiển thị danh sách sản phẩm
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-PROD-02: Thêm sản phẩm mới

- **Actor:** ADMIN
- **Mô tả:** Tạo sản phẩm mới với đầy đủ thông tin và variants
- **Trigger:** Click "Thêm sản phẩm mới"
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Mở modal `ProductFormTabs`
  2. Tab 1 - Thông tin cơ bản: Mã SP, Tên, Category, Brand, Giá
  3. Tab 2 - Nội dung: Mô tả, Ảnh đại diện, Gallery
  4. Tab 3 - Biến thể: Thêm variants (Màu, Size, SKU, Tồn kho)
  5. Tab 4 - Chính sách: Cho phép đổi trả, Thời hạn, Freeship
  6. Upload ảnh lên Supabase Storage
  7. Submit → `api.products.create()`
  8. Log hệ thống: SystemLog action = CREATE
- **Post-condition:** Sản phẩm mới được tạo
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-PROD-03: Sửa sản phẩm

- **Actor:** ADMIN
- **Mô tả:** Cập nhật thông tin sản phẩm
- **Trigger:** Click icon sửa tại sản phẩm
- **Pre-condition:** Sản phẩm tồn tại
- **Main flow:**
  1. Mở modal với dữ liệu sản phẩm đã có
  2. Chỉnh sửa các field
  3. Submit → `api.products.update()`
  4. Log hệ thống: SystemLog action = UPDATE
- **Post-condition:** Sản phẩm được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-PROD-04: Xóa sản phẩm

- **Actor:** ADMIN
- **Mô tả:** Xóa sản phẩm khỏi hệ thống
- **Trigger:** Click icon xóa tại sản phẩm
- **Pre-condition:** Sản phẩm không có đơn hàng liên quan
- **Main flow:**
  1. Hiển thị confirm dialog
  2. Gọi `api.products.delete()`
  3. Log hệ thống: SystemLog action = DELETE
- **Post-condition:** Sản phẩm bị xóa (hoặc lỗi nếu có đơn hàng)
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Admin - Cấu hình sản phẩm

#### UC-ADMIN-CONFIG-01: Quản lý Danh mục (Category)

- **Actor:** ADMIN
- **Mô tả:** CRUD danh mục sản phẩm (hỗ trợ cây phân cấp)
- **Trigger:** Vào Admin → Sản phẩm → Cấu hình sản phẩm → Tab Danh mục
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Xem danh sách category (hiển thị parent-child)
  2. Thêm: Tên, Slug (auto-gen), Ảnh, Mô tả, Parent, SizeGuide liên kết
  3. Sửa: Cập nhật thông tin
  4. Xóa: Kiểm tra không có child category và không có sản phẩm
- **Post-condition:** Category được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-CONFIG-02: Quản lý Thương hiệu (Brand)

- **Actor:** ADMIN
- **Mô tả:** CRUD thương hiệu sản phẩm
- **Trigger:** Vào Tab Thương hiệu trong Cấu hình
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Xem danh sách brand
  2. Thêm: Tên, Slug, Logo URL, Quốc gia
  3. Sửa/Xóa với validation (không xóa nếu có sản phẩm)
- **Post-condition:** Brand được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-CONFIG-03: Quản lý Thuộc tính (ProductAttribute)

- **Actor:** ADMIN
- **Mô tả:** CRUD thuộc tính sản phẩm động
- **Trigger:** Vào Tab Thuộc tính trong Cấu hình
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Xem danh sách attribute
  2. Thêm: Tên, Code, Type (variant/info), Values (list)
  3. Gán attribute cho categories
  4. Sửa/Xóa
- **Post-condition:** Attribute được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-CONFIG-04: Quản lý Bảng Size (SizeGuide)

- **Actor:** ADMIN
- **Mô tả:** Tạo và quản lý bảng hướng dẫn chọn size
- **Trigger:** Vào Admin → Sản phẩm → Bảng Size
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Xem danh sách size guide
  2. Thêm: Tên, Mô tả, Columns (tùy chỉnh), Rows (dữ liệu)
  3. Liên kết với Category hoặc Product
  4. Xóa: Kiểm tra không có category/product đang dùng
- **Post-condition:** SizeGuide được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Admin - Quản lý Kho

#### UC-ADMIN-INV-01: Lập phiếu nhập kho

- **Actor:** ADMIN
- **Mô tả:** Tạo phiếu nhập hàng từ nhà cung cấp
- **Trigger:** Vào Admin → Kho → Nhập kho → Click "Lập phiếu mới"
- **Pre-condition:** Có ít nhất 1 supplier và 1 product
- **Main flow:**
  1. Chọn nhà cung cấp
  2. Chọn ngày nhập
  3. Thêm items: Chọn sản phẩm → chọn variant → nhập số lượng, giá vốn
  4. Submit → `api.inventory.saveStockEntry()`
  5. Cập nhật `ProductVariant.stockQuantity` tự động
  6. Tạo mã phiếu: PNK-YYYY-XXXXXX
- **Post-condition:** Phiếu nhập được tạo, tồn kho tăng
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-INV-02: Xem lịch sử nhập kho

- **Actor:** ADMIN
- **Mô tả:** Xem danh sách phiếu nhập đã lập
- **Trigger:** Vào Admin → Kho → Nhập kho
- **Pre-condition:** None
- **Main flow:**
  1. Load từ `api.inventory.getStockEntries()` (TanStack Query)
  2. Hiển thị: Mã phiếu, Thời gian, NCC, Người lập, Tổng giá trị
  3. Click để xem chi tiết phiếu
- **Post-condition:** Hiển thị danh sách phiếu nhập
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-INV-03: Xem lịch sử xuất kho

- **Actor:** ADMIN
- **Mô tả:** Xem danh sách phiếu xuất (tự động tạo khi có đơn hàng)
- **Trigger:** Vào Admin → Kho → Xuất kho
- **Pre-condition:** None
- **Main flow:**
  1. Load từ `api.inventory.getIssueEntries()`
  2. Hiển thị: Mã phiếu, Mã đơn hàng, Ngày xuất, Khách hàng, SL xuất
  3. Click để xem chi tiết + bản in
- **Post-condition:** Hiển thị danh sách phiếu xuất
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-INV-04: Kiểm kê kho (Stocktake)

- **Actor:** ADMIN
- **Mô tả:** Thực hiện kiểm kê và điều chỉnh tồn kho
- **Trigger:** Vào Admin → Kho → Kiểm kê
- **Pre-condition:** None
- **Main flow:**
  1. Tạo phiên kiểm kê mới
  2. Chọn phạm vi: Toàn bộ / Theo category
  3. Nhập số lượng thực tế cho từng variant
  4. Hệ thống tính chênh lệch
  5. Duyệt → Cập nhật tồn kho thực tế
- **Post-condition:** Tồn kho được điều chỉnh
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-INV-05: Xem báo cáo tồn kho

- **Actor:** ADMIN
- **Mô tả:** Phân tích giá trị tồn kho và cảnh báo sắp hết
- **Trigger:** Vào Admin → Kho → Báo cáo tồn kho
- **Pre-condition:** None
- **Main flow:**
  1. Load từ `api.reports.getInventoryData()`
  2. Hiển thị metrics: Tổng giá trị, SP sắp hết, Tổng số lượng
  3. Danh sách variant với tồn kho, giá vốn, giá trị tồn
  4. Highlight item lowStock → Quick action "Lập phiếu nhập"
- **Post-condition:** Hiển thị báo cáo
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-INV-06: Quản lý nhà cung cấp

- **Actor:** ADMIN
- **Mô tả:** CRUD nhà cung cấp
- **Trigger:** Vào Admin → Kho → Nhà cung cấp
- **Pre-condition:** None
- **Main flow:**
  1. Xem danh sách supplier
  2. Thêm: Tên, MST, Người liên hệ, SĐT, Email, Địa chỉ
  3. Toggle trạng thái: Đang hợp tác / Ngừng hoạt động
  4. Sửa thông tin
  5. Xóa: Kiểm tra không có phiếu nhập kho
- **Post-condition:** Supplier được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Admin - Báo cáo doanh thu

#### UC-ADMIN-REPORT-01: Xem báo cáo doanh thu

- **Actor:** ADMIN
- **Mô tả:** Phân tích doanh thu, lợi nhuận, đơn hàng
- **Trigger:** Vào Admin → Báo cáo → Doanh thu
- **Pre-condition:** None
- **Main flow:**
  1. Load từ `api.reports.getRevenueData({ range })`
  2. Filter theo thời gian: Hôm nay, 7 ngày, Tháng này, Năm nay
  3. Hiển thị metrics: Doanh thu thuần, Lợi nhuận gộp, Số đơn, Tỷ lệ hoàn
  4. Charts: Area chart doanh thu, Bar chart đơn hàng
  5. Top sản phẩm bán chạy
  6. Phân bổ theo category
- **Post-condition:** Hiển thị dashboard báo cáo
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

### 📦 Module: Admin - Cấu hình hệ thống

#### UC-ADMIN-SYS-01: Quản lý nhân viên

- **Actor:** ADMIN
- **Mô tả:** CRUD tài khoản nhân viên
- **Trigger:** Vào Admin → Cấu hình → Nhân viên
- **Pre-condition:** Role = ADMIN
- **Main flow:**
  1. Xem danh sách employees (role != CUSTOMER)
  2. Thêm: Họ tên, Email, SĐT, Role (SALES/WAREHOUSE)
  3. Sửa thông tin
  4. Khóa/Mở khóa tài khoản
- **Post-condition:** Employee được cập nhật
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-SYS-02: Xem nhật ký hệ thống

- **Actor:** ADMIN
- **Mô tả:** Xem lịch sử các hành động trong hệ thống
- **Trigger:** Vào Admin → Cấu hình → Nhật ký
- **Pre-condition:** None
- **Main flow:**
  1. Load từ `api.system.getLogs()`
  2. Hiển thị: Thời gian, Nhân viên, Hành động (CREATE/UPDATE/DELETE), Nội dung
  3. Filter theo tên nhân viên
  4. Click để xem JSON chi tiết
- **Post-condition:** Hiển thị audit logs
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

#### UC-ADMIN-SYS-03: Cấu hình website

- **Actor:** ADMIN
- **Mô tả:** Cấu hình thông tin chung website
- **Trigger:** Vào Admin → Cấu hình → Website
- **Pre-condition:** None
- **Main flow:**
  1. Xem/Sửa: Tên website, Logo, Hotline, Email, Địa chỉ
  2. Cấu hình: VAT rate, Low stock threshold, Return period
  3. Quản lý banners trang chủ
- **Post-condition:** Config được lưu vào SystemConfig
- **Trạng thái:**
  - [x] Đã hoàn chỉnh

---

## 4. Các use case chưa hoàn chỉnh / tiềm ẩn

| Component/File                 | Trạng thái      | Thiếu                                                                   |
| ------------------------------ | --------------- | ----------------------------------------------------------------------- |
| `RegisterPage`                 | Chỉ có UI       | Không có API `register` trong services                                  |
| `ForgotPasswordPage`           | Chỉ có UI       | Không có API reset password                                             |
| `ChangePassword` (ProfilePage) | Chỉ có UI tab   | Không có logic/API đổi mật khẩu                                         |
| **Phân quyền SALES/WAREHOUSE** | Không implement | Admin dashboard chỉ check role = ADMIN, không phân biệt SALES/WAREHOUSE |
| **Xác thực mật khẩu**          | Không implement | Login chỉ check email tồn tại, không verify password                    |
| **Email notifications**        | Không implement | Có field email trong checkout nhưng không gửi email thật                |
| **Tích hợp payment gateway**   | Mock only       | PaymentGateway là giả lập, không kết nối cổng thanh toán thật           |
| **Export Excel**               | UI button only  | Nút "Xuất báo cáo" chỉ hiển thị alert                                   |
| **OTP verification**           | Mock only       | OTP được in ra console, không gửi SMS thật                              |

### TODO/Comments tìm thấy trong code:

- `services/index.ts`: `// PLACEHOLDER SERVICES - To be implemented later`
- Nhiều console.log debug → cần cleanup trước production

---

## 5. Ghi chú & giới hạn phân tích

### Phạm vi đã quét:

- ✅ `App.tsx` - Routing và Protected Routes
- ✅ `types.ts`, `constants/enums.ts` - Type definitions
- ✅ `prisma/schema.prisma` - Database schema (PostgreSQL)
- ✅ `context/` - AuthContext, CartContext
- ✅ `services/` - Tất cả API services
- ✅ `pages/` - Tất cả pages
- ✅ `components/admin/` - Tất cả admin components
- ✅ `lib/realtime.ts` - Supabase Realtime subscriptions
- ✅ `hooks/` - Custom hooks (TanStack Query)

### Phần không thể kết luận đầy đủ:

- **Backend deployment/config**: Chỉ có Supabase client config, không có server-side code
- **Authentication flow**: Không có Supabase Auth setup, chỉ có simple email lookup
- **File upload actual flow**: Upload ảnh dùng Supabase Storage nhưng không thấy bucket config
- **RLS policies**: Có các file SQL nhưng không verify actual implementation
- **Performance optimizations**: Có TanStack Query caching nhưng không benchmark

### Công nghệ sử dụng:

- **Frontend:** React 18, TypeScript, TailwindCSS, TanStack Query, React Router v6
- **Backend:** Supabase (PostgreSQL + Realtime + Storage)
- **ORM:** Prisma (chỉ schema, client qua Supabase SDK)
- **Build:** Vite
- **Charts:** Recharts

---

_Document được tạo tự động bởi phân tích source code. Không chứa suy đoán hoặc thông tin ngoài code._
