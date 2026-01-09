# Báo cáo Use Case Hệ thống - SportHub

**Ngày tạo:** 09/01/2026  
**Phiên bản:** 1.0

---

## 📋 Tổng quan

Hệ thống SportHub là nền tảng thương mại điện tử chuyên về thiết bị thể thao với đầy đủ chức năng quản lý bán hàng, kho bãi, báo cáo và hỗ trợ khách hàng. Hệ thống phân chia 2 nhóm người dùng chính:

- **ADMIN/STAFF**: Quản trị viên và nhân viên hệ thống
- **CUSTOMER**: Khách hàng (cả thành viên và khách vãng lai)

---

## 👨‍💼 USE CASES - ADMIN/STAFF

### 📊 MODULE 1: TỔNG QUAN (Dashboard)

#### UC-A01: Xem tổng quan hệ thống

**Actor:** Admin, Staff  
**Mô tả:** Xem dashboard tổng hợp số liệu kinh doanh  
**Chức năng chính:**

- Hiển thị thống kê nhanh: Doanh thu ngày, đơn hàng mới, khách hàng mới, sản phẩm hết hàng
- Biểu đồ doanh thu 7 ngày
- Trend tăng/giảm so với kỳ trước
- Giao diện với StatCard hiển thị KPI

**File liên quan:** `components/admin/DashboardHome.tsx`

---

### 🛒 MODULE 2: KINH DOANH

#### UC-A02: Quản lý đơn hàng

**Actor:** Admin, Staff  
**Mô tả:** Xem, tìm kiếm, lọc và xử lý đơn hàng  
**Chức năng chính:**

- Danh sách đơn hàng với phân trang (mặc định 20 đơn/trang)
- Bộ lọc đa chiều:
  - Theo trạng thái: Mới (Pending/PendingConfirmation), Xử lý (Packing), Hoàn tất (Shipping/Completed), Hỗ trợ (Cancelled/DeliveryFailed/ReturnRequested)
  - Theo phương thức thanh toán: COD, VNPay
  - Theo khách hàng (ID)
  - Theo khoảng thời gian (dateFrom, dateTo)
- Tìm kiếm theo mã đơn hàng, tên khách hàng, số điện thoại
- Xác nhận nhanh đơn hàng (chuyển từ PendingConfirmation → Packing)
- Xem chi tiết đơn hàng trong modal
- Cập nhật trạng thái đơn hàng theo workflow:
  - PENDING_PAYMENT → PENDING_CONFIRMATION → PACKING → SHIPPING → COMPLETED
  - Hủy đơn: → CANCELLED (chỉ cho đơn chưa đóng gói)
  - Giao thất bại: → DELIVERY_FAILED
- In phiếu đơn hàng
- Tự động tạo phiếu xuất kho khi chuyển sang SHIPPING
- Tính toán phí ship động: Free nếu > 1tr, 20k (HCM), 35k (HN), 50k (tỉnh khác)

**File liên quan:**

- `components/admin/OrderManager.tsx`
- `components/admin/AdminOrderDetailModal.tsx`
- `services/order.service.ts`

#### UC-A03: Quản lý yêu cầu đổi/trả hàng

**Actor:** Admin, Staff  
**Mô tả:** Xử lý yêu cầu đổi/trả từ khách hàng  
**Chức năng chính:**

- Danh sách yêu cầu với trạng thái:
  - PENDING: Chờ xử lý
  - APPROVED: Đã duyệt
  - REJECTED: Từ chối
  - COMPLETED: Hoàn thành
- Bộ lọc: Pending, Approved, All
- Tìm kiếm theo mã yêu cầu, mã đơn hàng, tên khách hàng
- Xem chi tiết yêu cầu:
  - Thông tin khách hàng
  - Sản phẩm đổi/trả (tên, màu, size, số lượng, giá)
  - Lý do đổi/trả
  - Ảnh chứng minh (evidenceImages)
  - Thông tin ngân hàng (nếu là hoàn tiền)
  - Kiểm tra tồn kho cho yêu cầu đổi size/màu
- Phê duyệt yêu cầu:
  - **REFUND**: Nhập số tiền hoàn, ghi chú admin → Chuyển trạng thái OrderItem thành REFUNDED
  - **EXCHANGE**: Kiểm tra tồn kho variant mới → Tạo SKU mới cho OrderItem → Chuyển trạng thái EXCHANGED
- Từ chối yêu cầu: Nhập lý do từ chối → Chuyển trạng thái REJECTED
- Tự động cập nhật trạng thái đơn hàng (Order) thành RETURN_REQUESTED khi có yêu cầu

**File liên quan:**

- `components/admin/ReturnManager.tsx`
- `services/return-request.service.ts`

---

### 📦 MODULE 3: SẢN PHẨM

#### UC-A04: Quản lý sản phẩm & SKU

**Actor:** Admin  
**Mô tả:** CRUD sản phẩm và các biến thể (variants)  
**Chức năng chính:**

- Danh sách sản phẩm với search
- Tạo mới sản phẩm:
  - Thông tin cơ bản: Tên, slug, mô tả, danh mục, thương hiệu
  - Hình ảnh: Thumbnail + Gallery (upload Base64)
  - Giá: Giá gốc, giá khuyến mãi
  - Trạng thái: ACTIVE, INACTIVE, OUT_OF_STOCK
  - Thuộc tính động (ProductAttribute): Loại đinh, Dòng sản phẩm, CLB, Mùa giải, Loại xương...
  - Bảng size (SizeGuide)
  - Miễn phí ship (freeShipping)
  - Cho phép đổi/trả (allowReturns)
  - SEO: Meta title, description, keywords
- Quản lý variants (SKU):
  - Tạo variants theo Size + Color
  - Giá điều chỉnh (priceAdjustment)
  - SKU code tự động
  - Tồn kho ban đầu (stockQuantity)
  - Hình ảnh riêng cho từng variant
- Chỉnh sửa sản phẩm: Cập nhật thông tin và variants
- Xóa sản phẩm: Xóa mềm (chuyển INACTIVE)
- Tự động tạo slug từ tên sản phẩm
- Validate ảnh: Thumbnail bắt buộc, Gallery tối đa 10 ảnh

**File liên quan:**

- `components/admin/ProductManager.tsx`
- `services/product.service.ts`

#### UC-A05: Quản lý bảng size

**Actor:** Admin  
**Mô tả:** Tạo và quản lý bảng hướng dẫn size cho sản phẩm  
**Chức năng chính:**

- Danh sách bảng size
- Tạo mới bảng size:
  - Tên bảng (vd: "Bảng size giày Adidas")
  - Mô tả
  - Cấu hình cột động (columns: key, label)
  - Nhập dữ liệu hàng (rows)
- Thêm/xóa cột động
- Thêm/xóa hàng dữ liệu
- Chỉnh sửa bảng size
- Xóa bảng size
- Tìm kiếm bảng size

**File liên quan:** `components/admin/SizeGuideManager.tsx`

#### UC-A06: Cấu hình sản phẩm (Product Config)

**Actor:** Admin  
**Mô tả:** Quản lý metadata cho sản phẩm (Categories, Brands, Attributes)  
**Chức năng chính:**

- **Quản lý Danh mục (Categories)**:
  - Tạo danh mục cha/con (hierarchical)
  - Upload ảnh danh mục
  - Tạo slug tự động
  - Chỉnh sửa, xóa danh mục
  - Tìm kiếm
- **Quản lý Thương hiệu (Brands)**:
  - CRUD thương hiệu
  - Logo thương hiệu (upload Base64)
  - Mô tả, website
  - Tìm kiếm
- **Quản lý Thuộc tính (Product Attributes)**:
  - Tạo thuộc tính động (vd: Loại đinh, Dòng SP, CLB...)
  - Loại dữ liệu: TEXT, NUMBER, SELECT
  - Giá trị cho SELECT (comma-separated)
  - Đơn vị (unit)
  - Gán thuộc tính vào danh mục con
  - Tìm kiếm, chỉnh sửa, xóa

**File liên quan:**

- `components/admin/ProductConfig.tsx`

---

### 🏭 MODULE 4: QUẢN LÝ KHO

#### UC-A07: Nhập kho

**Actor:** Admin, Staff  
**Mô tả:** Lập phiếu nhập hàng từ nhà cung cấp  
**Chức năng chính:**

- Danh sách phiếu nhập kho (StockEntry)
- Lập phiếu mới:
  - Chọn nhà cung cấp (active)
  - Chọn sản phẩm + variant
  - Nhập số lượng, giá nhập, ghi chú
  - Thêm nhiều sản phẩm
  - Tính tổng giá trị nhập
- Tạo mã phiếu tự động: `IE-{timestamp}`
- Cập nhật tồn kho (stockQuantity) cho từng variant
- Ghi log nhập kho
- Xem chi tiết phiếu nhập

**File liên quan:**

- `components/admin/StockEntrySystem.tsx`
- `lib/repositories/inventory.repo.ts`

#### UC-A08: Xuất kho

**Actor:** Admin, Staff  
**Mô tả:** Xem lịch sử xuất kho (tự động khi giao hàng)  
**Chức năng chính:**

- Danh sách phiếu xuất (StockIssue)
- Tìm kiếm theo mã phiếu, mã đơn hàng, tên khách
- Xem chi tiết phiếu xuất:
  - Mã phiếu: `SI-{timestamp}`
  - Ngày xuất
  - Khách hàng
  - Danh sách SKU đã xuất (sản phẩm, variant, số lượng)
- Tự động tạo khi đơn hàng chuyển sang SHIPPING
- Tự động trừ tồn kho

**File liên quan:**

- `components/admin/StockIssueSystem.tsx`

#### UC-A09: Kiểm kê kho

**Actor:** Admin  
**Mô tả:** Kiểm tra và điều chỉnh tồn kho thực tế  
**Chức năng chính:**

- Tạo phiếu kiểm kê (Stocktake)
- Nhập số lượng thực tế cho từng SKU
- Tính chênh lệch (variance = actual - system)
- Ghi chú lý do chênh lệch
- Điều chỉnh tồn kho hệ thống theo số liệu thực tế
- Mã phiếu: `STK-{timestamp}`
- Lưu log điều chỉnh

**File liên quan:** `components/admin/InventorySystem.tsx`

#### UC-A10: Báo cáo tồn kho

**Actor:** Admin, Staff  
**Mô tả:** Xem báo cáo phân tích tồn kho và giá trị vốn  
**Chức năng chính:**

- Tổng quan KPI:
  - Tổng SKU
  - Giá trị tồn kho
  - Sản phẩm hết hàng
- Bộ lọc:
  - Theo danh mục
  - Theo thương hiệu
  - Trạng thái tồn kho: Hết, Sắp hết (<10), Tồn nhiều (>100), Tất cả
- Danh sách chi tiết:
  - Sản phẩm, variant (màu, size)
  - Tồn hiện tại
  - Giá vốn trung bình
  - Giá trị tồn
- Sắp xếp theo cột
- Xuất báo cáo Excel (placeholder)
- Link nhanh đến Nhập kho

**File liên quan:** `components/admin/InventorySystem.tsx`

#### UC-A11: Quản lý nhà cung cấp

**Actor:** Admin  
**Mô tả:** CRUD thông tin nhà cung cấp  
**Chức năng chính:**

- Danh sách nhà cung cấp
- Tạo mới:
  - Tên, mã số thuế
  - Người liên hệ, SĐT, email
  - Địa chỉ
  - Trạng thái: ACTIVE, INACTIVE
- Chỉnh sửa thông tin
- Bật/tắt trạng thái (toggle active/inactive)
- Tìm kiếm theo tên, SĐT, người liên hệ

**File liên quan:**

- `components/admin/SupplierManager.tsx`
- `lib/repositories/supplier.repo.ts`

---

### 📈 MODULE 5: BÁO CÁO

#### UC-A12: Báo cáo doanh thu

**Actor:** Admin  
**Mô tả:** Phân tích doanh thu và hiệu suất kinh doanh  
**Chức năng chính:**

- Bộ lọc thời gian: Hôm nay, 7 ngày, Tháng này, Năm nay
- Thống kê tổng quan:
  - Tổng doanh thu
  - Tổng đơn hàng
  - Tổng khách hàng
  - Tỷ lệ hoàn trả
  - Trend tăng/giảm
- Biểu đồ:
  - Doanh thu theo thời gian (Area Chart)
  - Phân tích theo phương thức thanh toán (Pie Chart)
  - Top sản phẩm bán chạy (Bar Chart)
  - Top danh mục (Composed Chart)
- Xuất báo cáo (placeholder)

**File liên quan:**

- `components/admin/BusinessReports.tsx`
- `services/system.service.ts` (getRevenueData API)

---

### ⚙️ MODULE 6: CÁU HÌNH

#### UC-A13: Cấu hình Website

**Actor:** Admin  
**Mô tả:** Quản lý cấu hình hệ thống và banner  
**Chức năng chính:**

- **Cấu hình hệ thống (SystemConfig)**:
  - Tên website
  - Email liên hệ, SĐT
  - Địa chỉ
  - Meta SEO
  - OTP timeout
  - Chỉnh sửa và lưu
- **Quản lý Banner (AppBanner)**:
  - Tạo banner mới: Tiêu đề, mô tả, hình ảnh, link, thứ tự
  - Upload ảnh Base64
  - Bật/tắt banner
  - Xóa banner
  - Sắp xếp hiển thị

**File liên quan:**

- `components/admin/SystemAdmin.tsx`

#### UC-A14: Quản lý nhân viên

**Actor:** Admin  
**Mô tả:** Quản lý tài khoản nhân viên hệ thống  
**Chức năng chính:**

- Danh sách user theo role: ADMIN, STAFF, CUSTOMER
- Bộ lọc theo role
- Tìm kiếm theo tên, email
- Tạo tài khoản staff mới:
  - Email, tên đầy đủ, SĐT
  - Role: ADMIN hoặc STAFF
  - Avatar (upload)
  - Mật khẩu mặc định: "123456"
- Đặt lại mật khẩu
- Khóa/mở khóa tài khoản

**File liên quan:** `components/admin/SystemAdmin.tsx`

#### UC-A15: Nhật ký hệ thống (Audit Logs)

**Actor:** Admin  
**Mô tả:** Xem lịch sử hoạt động của nhân viên  
**Chức năng chính:**

- Danh sách log theo thời gian
- Bộ lọc theo tên nhân viên
- Thông tin log:
  - Thời gian
  - Nhân viên thực hiện (actorId, actorName)
  - Hành động (action): CREATE, UPDATE, DELETE
  - Entity: Product, Order, StockEntry...
  - entityId
  - Metadata (JSON)
- Xem chi tiết log trong modal
- Tự động ghi log cho các thao tác quan trọng

**File liên quan:**

- `components/admin/SystemAdmin.tsx`
- `services/shared.service.ts` (createSystemLog)

---

## 🛍️ USE CASES - CUSTOMER

### 🏠 MODULE: TRANG CHỦ & DANH MỤC

#### UC-C01: Xem trang chủ

**Actor:** Customer (Guest/Member)  
**Mô tả:** Xem tổng quan sản phẩm và danh mục  
**Chức năng chính:**

- Hero banner với CTA
- Danh mục nổi bật (chỉ hiển thị danh mục cha)
- Sản phẩm mới về (4 sản phẩm đầu)
- Navigation: Trang chủ, Sản phẩm, Tra cứu đơn hàng
- Giỏ hàng floating (số lượng badge)
- Đăng nhập/Đăng xuất

**File liên quan:** `pages/HomePage.tsx`

#### UC-C02: Duyệt danh mục sản phẩm

**Actor:** Customer  
**Mô tả:** Xem và lọc sản phẩm theo nhiều tiêu chí  
**Chức năng chính:**

- Hiển thị sản phẩm dạng grid (ProductCard)
- Bộ lọc:
  - Danh mục (cha/con): Nếu chọn cha → hiển thị tất cả con
  - Khoảng giá (slider)
  - Thương hiệu (multi-select)
  - Màu sắc (multi-select)
  - Thuộc tính động: Loại đinh, Dòng SP, CLB, Mùa giải, Loại xương
- Tìm kiếm theo từ khóa (removeAccents)
- Chỉ hiển thị sản phẩm:
  - Trạng thái ACTIVE
  - Còn tồn kho (variant.stockQuantity > 0)
- Sidebar có thể thu gọn (mobile-friendly)
- Reset filter

**File liên quan:** `pages/ProductListPage.tsx`

---

### 📦 MODULE: SẢN PHẨM

#### UC-C03: Xem chi tiết sản phẩm

**Actor:** Customer  
**Mô tả:** Xem thông tin đầy đủ và thêm vào giỏ hàng  
**Chức năng chủng:**

- Thông tin cơ bản: Tên, giá (gạch giá cũ nếu có khuyến mãi), mô tả
- Gallery ảnh với zoom
- Chọn màu sắc (hiển thị variant còn hàng)
- Chọn size (hiển thị variant còn hàng)
- Nhập số lượng (max = tồn kho)
- Xem bảng size (modal)
- Thông số kỹ thuật (từ ProductAttribute)
- Đánh giá sản phẩm:
  - Điểm trung bình (rating)
  - Danh sách review (phân trang 5/trang)
  - Xem ảnh review
- Sản phẩm liên quan (cùng danh mục)
- Thêm vào giỏ hàng:
  - Validate chọn đủ màu + size
  - Validate số lượng <= tồn kho
  - Toast thông báo
- Badge: "Miễn phí ship", "Cho phép đổi/trả"
- Chính sách đổi/trả, vận chuyển, bảo hành

**File liên quan:**

- `pages/ProductDetailPage.tsx`
- `components/features/product/ProductCard.tsx`

#### UC-C04: Đánh giá sản phẩm

**Actor:** Customer (Authenticated, đã mua hàng)  
**Mô tả:** Viết review sau khi nhận hàng  
**Chức năng chính:**

- Chỉ hiển thị nút Review cho sản phẩm đã mua (trạng thái COMPLETED)
- Modal đánh giá:
  - Chọn số sao (1-5)
  - Nhập nội dung
  - Upload ảnh (tối đa 5 ảnh)
  - Preview ảnh
- Validate: Bắt buộc chọn rating
- Gửi review → Lưu vào DB
- Hiển thị danh sách review dưới sản phẩm
- Chỉ review 1 lần/sản phẩm

**File liên quan:** `pages/OrderDetailPage.tsx` (review modal)

---

### 🛒 MODULE: GIỎ HÀNG & THANH TOÁN

#### UC-C05: Quản lý giỏ hàng

**Actor:** Customer  
**Mô tả:** Thêm, sửa, xóa sản phẩm trong giỏ  
**Chức năng chính:**

- Thêm sản phẩm vào giỏ (từ ProductDetail)
- CartDrawer (sidebar):
  - Danh sách item (thumbnail, tên, màu, size, giá, số lượng)
  - Tăng/giảm số lượng
  - Xóa item
  - Tổng tiền
  - Nút "Thanh toán"
- CartPage:
  - Hiển thị dạng bảng
  - Cập nhật số lượng (validate tồn kho)
  - Xóa item
  - Xóa toàn bộ giỏ
  - Kiểm tra tính khả dụng (isValid):
    - Sản phẩm còn ACTIVE
    - Variant còn tồn kho
    - Số lượng <= tồn kho
  - Hiển thị cảnh báo nếu item không khả dụng
- Đồng bộ giỏ hàng:
  - Guest: LocalStorage
  - Member: Database (CartItem table)
  - Merge giỏ khi đăng nhập

**File liên quan:**

- `pages/CartPage.tsx`
- `components/features/cart/CartDrawer.tsx`
- `context/CartContext.tsx`

#### UC-C06: Thanh toán đơn hàng

**Actor:** Customer  
**Mô tả:** Đặt hàng và thanh toán  
**Chức năng chính:**

- Checkout Form:
  - Thông tin giao hàng: Tên, SĐT, email, địa chỉ, thành phố (HCM/HN/Khác)
  - Ghi chú đơn hàng
  - Sổ địa chỉ (nếu đã đăng nhập):
    - Chọn địa chỉ có sẵn
    - Thêm địa chỉ mới
    - Lưu vào sổ địa chỉ
- Tính phí ship:
  - Miễn phí nếu tổng > 1tr
  - Miễn phí nếu TẤT CẢ sản phẩm có flag freeShipping
  - Nếu không: 20k (HCM), 35k (HN), 50k (Tỉnh khác)
- Phương thức thanh toán:
  - **COD** (Ship COD): Giới hạn 10tr
    - Gửi OTP qua email
    - Nhập OTP để xác nhận (timeout 5 phút)
    - Countdown OTP
  - **VNPay** (Chuyển khoản):
    - Tích hợp VNPay Payment Gateway
    - Redirect sang VNPay
    - Xử lý callback (success/fail)
- Tạo đơn hàng:
  - Mã đơn: `ORD-{timestamp}`
  - Lưu OrderItem cho từng sản phẩm
  - Trạng thái ban đầu:
    - COD: PENDING_CONFIRMATION
    - VNPay: PENDING_PAYMENT
  - Gửi email xác nhận (nếu có email)
- Xóa giỏ hàng sau khi đặt thành công
- Hiển thị modal thành công với mã đơn, thông tin thanh toán

**File liên quan:**

- `pages/CheckoutPage.tsx`
- `pages/PaymentGateway.tsx`
- `services/order.service.ts`

---

### 📦 MODULE: ĐƠN HÀNG

#### UC-C07: Tra cứu đơn hàng (Guest)

**Actor:** Customer (Guest)  
**Mô tả:** Tra cứu đơn hàng bằng mã đơn + SĐT (không cần đăng nhập)  
**Chức năng chính:**

- Form tra cứu: Mã đơn hàng + SĐT
- Kết quả:
  - Thông tin đơn hàng
  - Trạng thái với màu sắc
  - Danh sách sản phẩm
  - Thông tin giao hàng
  - Timeline trạng thái
- Nút xem chi tiết → OrderDetailPage

**File liên quan:** `pages/OrderTrackingPage.tsx`

#### UC-C08: Xem lịch sử đơn hàng (Member)

**Actor:** Customer (Authenticated)  
**Mô tả:** Xem tất cả đơn hàng đã đặt  
**Chức năng chính:**

- Tab "Lịch sử mua hàng" trong Profile
- Danh sách đơn hàng (mới nhất lên đầu)
- Bộ lọc trạng thái:
  - Tất cả
  - Chờ xác nhận
  - Đang xử lý
  - Đang giao
  - Hoàn thành
  - Đã hủy
- Tìm kiếm theo mã đơn, tên sản phẩm
- Thông tin mỗi đơn:
  - Mã đơn, ngày đặt
  - Tổng tiền
  - Trạng thái (badge màu)
  - Số lượng sản phẩm
- Click vào đơn → OrderDetailPage

**File liên quan:** `pages/ProfilePage.tsx`

#### UC-C09: Xem chi tiết đơn hàng

**Actor:** Customer  
**Mô tả:** Xem thông tin đầy đủ và thao tác với đơn hàng  
**Chức năng chính:**

- Thông tin đơn hàng:
  - Mã đơn, ngày đặt, trạng thái
  - Timeline trạng thái
  - Thông tin giao hàng (tên, SĐT, địa chỉ)
  - Phương thức thanh toán
  - Tổng tiền, phí ship
- Danh sách sản phẩm:
  - Thumbnail, tên, màu, size, giá, số lượng
  - Trạng thái OrderItem (PENDING, SHIPPED, REFUNDED, EXCHANGED)
- Các thao tác:
  - **Hủy đơn** (nếu trạng thái PENDING_CONFIRMATION hoặc PACKING):
    - Chọn lý do hủy
    - Xác nhận hủy
  - **Yêu cầu đổi/trả** (nếu trạng thái COMPLETED và trong thời hạn):
    - Chọn sản phẩm cần đổi/trả
    - Chọn loại: REFUND (hoàn tiền) hoặc EXCHANGE (đổi hàng)
    - Nhập lý do
    - Upload ảnh chứng minh (evidenceImages)
    - Nếu REFUND: Nhập thông tin ngân hàng (tên NH, STK, chủ TK)
    - Nếu EXCHANGE: Chọn size/màu mới (validate tồn kho)
    - Gửi yêu cầu → Tạo ReturnRequest
  - **Đánh giá sản phẩm** (nếu COMPLETED):
    - Chọn sản phẩm
    - Modal đánh giá (rating, comment, images)
    - Chỉ đánh giá 1 lần
- In đơn hàng
- Copy mã đơn

**File liên quan:**

- `pages/OrderDetailPage.tsx`
- `services/return-request.service.ts`

---

### 👤 MODULE: TÀI KHOẢN

#### UC-C10: Đăng ký tài khoản

**Actor:** Guest  
**Mô tả:** Tạo tài khoản thành viên mới  
**Chức năng chính:**

- Form đăng ký: Email, tên đầy đủ, SĐT, mật khẩu
- Validate:
  - Email hợp lệ và chưa tồn tại
  - SĐT 10 số
  - Mật khẩu >= 6 ký tự
- Tạo tài khoản với role CUSTOMER
- Avatar mặc định từ UI Avatars
- Tự động đăng nhập sau khi đăng ký
- Merge giỏ hàng từ LocalStorage

**File liên quan:** `pages/AuthPages.tsx`

#### UC-C11: Đăng nhập

**Actor:** Guest  
**Mô tả:** Đăng nhập vào hệ thống  
**Chức năng chính:**

- Form đăng nhập: Email + Password
- Xác thực Supabase Auth
- Lấy thông tin user từ DB
- Lưu session (AuthContext)
- Redirect:
  - ADMIN/STAFF → `/admin`
  - CUSTOMER → Trang trước đó hoặc `/`
- Merge giỏ hàng (LocalStorage → Database)

**File liên quan:**

- `pages/LoginPage.tsx`
- `context/AuthContext.tsx`

#### UC-C12: Quản lý thông tin cá nhân

**Actor:** Customer (Authenticated)  
**Mô tả:** Xem và cập nhật thông tin tài khoản  
**Chức năng chính:**

- Tab "Thông tin cá nhân" trong Profile
- Hiển thị: Email, tên, SĐT, avatar
- Chỉnh sửa:
  - Tên đầy đủ
  - Số điện thoại
  - Upload avatar mới (Base64)
- Đổi mật khẩu:
  - Nhập mật khẩu cũ
  - Nhập mật khẩu mới (>= 6 ký tự)
  - Xác nhận mật khẩu
  - Validate và cập nhật

**File liên quan:** `pages/ProfilePage.tsx`

#### UC-C13: Quản lý sổ địa chỉ

**Actor:** Customer (Authenticated)  
**Mô tả:** CRUD địa chỉ giao hàng  
**Chức năng chính:**

- Tab "Sổ địa chỉ" trong Profile
- Danh sách địa chỉ đã lưu
- Thêm địa chỉ mới:
  - Tên người nhận
  - Số điện thoại
  - Địa chỉ chi tiết
- Chỉnh sửa địa chỉ
- Xóa địa chỉ
- Chọn địa chỉ khi checkout

**File liên quan:** `pages/ProfilePage.tsx`

#### UC-C14: Đăng xuất

**Actor:** Customer (Authenticated)  
**Mô tả:** Đăng xuất khỏi hệ thống  
**Chức năng chính:**

- Clear session (AuthContext)
- Logout Supabase
- Xóa giỏ hàng (nếu không lưu DB)
- Redirect về `/`

**File liên quan:** `context/AuthContext.tsx`

---

### 🔍 MODULE: TÌM KIẾM

#### UC-C15: Tìm kiếm sản phẩm

**Actor:** Customer  
**Mô tả:** Tìm kiếm nhanh sản phẩm từ header  
**Chức năng chính:**

- Search bar với autocomplete
- Gợi ý sản phẩm khi gõ (real-time)
- Loại bỏ dấu tiếng Việt (removeAccents)
- Hiển thị tối đa 5 gợi ý
- Click vào gợi ý → ProductDetailPage
- Enter → ProductListPage với query

**File liên quan:** `components/layout/Layout.tsx`

---

## 🎯 TỔNG KẾT USE CASES

### Thống kê Use Cases

| Loại Use Case           | Số lượng  |
| ----------------------- | --------- |
| **Admin/Staff**         | **15 UC** |
| - Tổng quan             | 1         |
| - Kinh doanh            | 2         |
| - Sản phẩm              | 3         |
| - Quản lý kho           | 5         |
| - Báo cáo               | 1         |
| - Cấu hình              | 3         |
| **Customer**            | **15 UC** |
| - Trang chủ & Danh mục  | 2         |
| - Sản phẩm              | 2         |
| - Giỏ hàng & Thanh toán | 2         |
| - Đơn hàng              | 3         |
| - Tài khoản             | 5         |
| - Tìm kiếm              | 1         |
| **TỔNG**                | **30 UC** |

---

## 🔐 PHÂN QUYỀN USE CASE

| Use Case                  |    Guest     | Customer | Staff | Admin |
| ------------------------- | :----------: | :------: | :---: | :---: |
| UC-C01 đến UC-C15         | ✅ (hạn chế) |    ✅    |  ✅   |  ✅   |
| UC-A01                    |      ❌      |    ❌    |  ✅   |  ✅   |
| UC-A02 đến UC-A08, UC-A10 |      ❌      |    ❌    |  ✅   |  ✅   |
| UC-A09, UC-A11 đến UC-A15 |      ❌      |    ❌    |  ❌   |  ✅   |

**Ghi chú:**

- Guest: Chỉ xem sản phẩm, thêm giỏ hàng, tra cứu đơn (UC-C07)
- Customer: Full quyền khách hàng
- Staff: Xem dashboard, xử lý đơn hàng, quản lý kho
- Admin: Full quyền hệ thống

---

## 📊 LUỒNG NGHIỆP VỤ QUAN TRỌNG

### 1. Luồng Mua hàng (Happy Path)

```
UC-C02 (Duyệt SP)
→ UC-C03 (Xem chi tiết)
→ UC-C05 (Thêm giỏ hàng)
→ UC-C06 (Thanh toán)
→ [Admin] UC-A02 (Xử lý đơn)
→ UC-C09 (Theo dõi đơn)
```

### 2. Luồng Đổi/Trả hàng

```
UC-C09 (Yêu cầu đổi/trả)
→ [Admin] UC-A03 (Duyệt yêu cầu)
→ [System] Cập nhật OrderItem status
→ [Customer] Nhận thông báo
```

### 3. Luồng Quản lý kho

```
UC-A07 (Nhập kho)
→ [System] Cập nhật tồn kho
→ [Customer] UC-C03 (Mua hàng)
→ [Admin] UC-A02 (Duyệt đơn)
→ [System] UC-A08 (Tự động xuất kho)
→ UC-A10 (Báo cáo tồn kho)
```

### 4. Luồng Thanh toán VNPay

```
UC-C06 (Chọn VNPay)
→ [System] Tạo order PENDING_PAYMENT
→ [VNPay] Payment Gateway
→ [Callback] Cập nhật PENDING_CONFIRMATION
→ UC-A02 (Admin xử lý)
```

---

## 🛠️ CÔNG NGHỆ VÀ KIẾN TRÚC

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: TanStack Query + Context API
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **UI**: TailwindCSS + Lucide Icons
- **Charts**: Recharts
- **Payment**: VNPay Integration

### Các Pattern áp dụng

- **Repository Pattern**: `lib/repositories/*.repo.ts`
- **Service Layer**: `services/*.service.ts`
- **Custom Hooks**: `hooks/use*.ts`
- **Context API**: `context/*.tsx`
- **Component Composition**: Tách component nhỏ, tái sử dụng

### Database Schema Highlights

- **User**: id, email, fullName, role (ADMIN/STAFF/CUSTOMER)
- **Product**: Hierarchical categories, dynamic attributes
- **ProductVariant**: SKU với color + size
- **Order**: OrderStatus workflow
- **OrderItem**: ItemReturnStatus (PENDING/SHIPPED/REFUNDED/EXCHANGED)
- **ReturnRequest**: Đổi/trả với evidenceImages, bankInfo
- **StockEntry/StockIssue**: Nhập/xuất kho
- **Stocktake**: Kiểm kê
- **SystemLog**: Audit trail

---

## 📝 KẾT LUẬN

Hệ thống SportHub là một nền tảng TMĐT hoàn chỉnh với:

- **30 Use Cases** bao phủ toàn bộ nghiệp vụ
- **Quản lý kho** chuyên nghiệp (Nhập/Xuất/Kiểm kê)
- **Hệ thống đổi/trả** linh hoạt
- **Báo cáo phân tích** chi tiết
- **UX tối ưu** cho cả admin và customer
- **Security**: Role-based access, audit logs
- **Scalability**: Module-based architecture

Hệ thống sẵn sàng triển khai production và mở rộng thêm tính năng như:

- Loyalty program
- Marketing automation
- Multi-warehouse
- Advanced analytics
- Mobile app

---

**Người tạo báo cáo:** GitHub Copilot  
**Ngày cập nhật:** 09/01/2026  
**Phiên bản hệ thống:** 1.0
