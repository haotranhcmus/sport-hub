# 📋 TỔNG HỢP BIỂU MẪU HỆ THỐNG SPORTHUB

> **Ngày phân tích:** 14/01/2026  
> **Phạm vi quét:** `pages/`, `components/`, `components/admin/`

---

## 📊 THỐNG KÊ TỔNG QUAN

| Nhóm biểu mẫu | Số lượng |
|---------------|----------|
| Biểu mẫu Admin - Sản phẩm | 6 |
| Biểu mẫu Admin - Kho hàng | 3 |
| Biểu mẫu Admin - Cấu hình | 2 |
| Biểu mẫu Admin - Đơn hàng & Đổi trả | 2 |
| Biểu mẫu Khách hàng | 7 |
| Biểu mẫu Tìm kiếm & Lọc | 2 |
| **TỔNG CỘNG** | **22** |

---

## 🔷 PHẦN 1: BIỂU MẪU ADMIN - QUẢN LÝ SẢN PHẨM

### 1.1 Form Thêm/Sửa Sản phẩm

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Tạo sản phẩm mới / Cập nhật sản phẩm |
| **Loại** | Quản lý sản phẩm |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/ProductManager.tsx` |
| **Component liên quan** | `ProductFormTabs.tsx` |
| **Hành động** | Create / Update |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `name` | text | ✅ | Tên sản phẩm |
| `productCode` | text | ✅ | Mã sản phẩm (Model) |
| `categoryId` | select | ✅ | Danh mục sản phẩm |
| `brandId` | select | ❌ | Thương hiệu |
| `description` | textarea | ❌ | Mô tả chi tiết |
| `basePrice` | number | ✅ | Giá bán (VND) |
| `promotionalPrice` | number | ❌ | Giá khuyến mãi |
| `condition` | text | ✅ | Tình trạng sản phẩm |
| `thumbnailUrl` | file upload | ❌ | Ảnh đại diện |
| `imageUrls` | file upload (multiple) | ❌ | Gallery ảnh (tối đa 8) |
| `status` | select | ✅ | Trạng thái: ACTIVE/INACTIVE |
| `attributes` | dynamic fields | ❌ | Thuộc tính theo danh mục |
| `freeShipping` | checkbox | ❌ | Miễn phí vận chuyển |
| `allowReturn` | checkbox | ❌ | Cho phép đổi trả |
| `returnPeriodDays` | number | ❌ | Số ngày đổi trả |
| `sizeGuideId` | select | ❌ | Bảng size liên kết |

---

### 1.2 Form Quản lý Biến thể SKU

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Bảng cấu hình SKU biến thể |
| **Loại** | Quản lý variants sản phẩm |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/ProductManager.tsx` (VariantEditor section) |
| **Hành động** | Create / Update / Delete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `sku` | text | ✅ | Mã SKU (auto-generate) |
| `color` | select | ✅ | Màu sắc từ attribute |
| `size` | select | ✅ | Kích thước |
| `stockQuantity` | number | ✅ | Số lượng tồn kho (mặc định 0) |
| `costPrice` | number | ❌ | Giá vốn |
| `imageUrl` | file upload | ❌ | Ảnh riêng cho variant |

---

### 1.3 Form Quản lý Danh mục (Category)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thêm danh mục / Cập nhật danh mục |
| **Loại** | Cấu hình sản phẩm |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/ProductConfig.tsx` |
| **Hành động** | Create / Update / Delete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `name` | text | ✅ | Tên danh mục |
| `slug` | text | ✅ | Slug URL (auto-generate từ name) |
| `parentId` | select | ❌ | Danh mục cha |
| `imageUrl` | file upload | ❌ | Ảnh danh mục |
| `description` | text | ❌ | Mô tả / Ghi chú |
| `sizeGuideId` | select | ❌ | Bảng size mặc định |

---

### 1.4 Form Quản lý Thương hiệu (Brand)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thêm thương hiệu / Cập nhật thương hiệu |
| **Loại** | Cấu hình sản phẩm |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/ProductConfig.tsx` |
| **Hành động** | Create / Update / Delete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `name` | text | ✅ | Tên thương hiệu |
| `slug` | text | ✅ | Slug URL |
| `logoUrl` | file upload | ❌ | Logo thương hiệu |
| `country` | text | ❌ | Quốc gia |

---

### 1.5 Form Quản lý Thuộc tính (ProductAttribute)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thêm thuộc tính / Cập nhật thuộc tính |
| **Loại** | Cấu hình sản phẩm |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/ProductConfig.tsx` |
| **Hành động** | Create / Update / Delete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `name` | text | ✅ | Tên thuộc tính |
| `code` | text | ✅ | Mã code (auto-generate) |
| `type` | select | ✅ | Loại: `variant` (sinh SKU) / `info` (thông tin) |
| `values` | text (multiple) | Điều kiện | Bắt buộc nếu type = variant |
| `categoryIds` | multi-select | ❌ | Danh mục áp dụng |

---

### 1.6 Form Quản lý Bảng Size (SizeGuide)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Tạo bảng size mới / Cập nhật bảng size |
| **Loại** | Cấu hình sản phẩm |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/SizeGuideManager.tsx` |
| **Hành động** | Create / Update / Delete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `name` | text | ✅ | Tên bảng size |
| `description` | text | ❌ | Mô tả bảng size |
| `columns` | dynamic array | ✅ | Các cột header (EU, US, CM...) |
| `rows` | dynamic table | ✅ | Dữ liệu các hàng |

---

## 🔷 PHẦN 2: BIỂU MẪU ADMIN - QUẢN LÝ KHO

### 2.1 Form Lập Phiếu Nhập Kho

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Lập phiếu nhập kho mới |
| **Loại** | Nhập kho |
| **Đối tượng sử dụng** | Admin / Nhân viên kho |
| **File** | `components/admin/StockEntrySystem.tsx` |
| **Hành động** | Create |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `supplierId` | select | ✅ | Nhà cung cấp |
| `entryDate` | date | ✅ | Ngày nhập kho |
| `notes` | textarea | ❌ | Ghi chú phiếu nhập |
| `items` | dynamic list | ✅ | Danh sách sản phẩm nhập |
| `items[].productId` | select | ✅ | Sản phẩm |
| `items[].variantId` | select | ✅ | Biến thể SKU |
| `items[].quantity` | number | ✅ | Số lượng nhập |
| `items[].costPrice` | number | ✅ | Giá vốn |

**Lưu ý nghiệp vụ:** 
- Khi lưu phiếu nhập kho, hệ thống tự động cộng `stockQuantity` vào các variant tương ứng
- Cho phép chọn nhiều sản phẩm/biến thể cùng lúc

---

### 2.2 Form Lập Phiếu Xuất Kho

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Lập phiếu xuất kho |
| **Loại** | Xuất kho |
| **Đối tượng sử dụng** | Admin / Nhân viên kho |
| **File** | `components/admin/StockIssueSystem.tsx` |
| **Hành động** | Create |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `issueType` | select | ✅ | Loại xuất: BÁN HÀNG / ĐIỀU CHỈNH / HỦY |
| `relatedOrderId` | select | Điều kiện | Liên kết đơn hàng (nếu xuất bán) |
| `items` | dynamic list | ✅ | Danh sách sản phẩm xuất |
| `items[].variantId` | select | ✅ | Biến thể SKU |
| `items[].quantity` | number | ✅ | Số lượng xuất |
| `notes` | textarea | ❌ | Ghi chú |

**Lưu ý nghiệp vụ:**
- Khi lưu phiếu xuất kho, hệ thống tự động trừ `stockQuantity` từ các variant

---

### 2.3 Form Quản lý Nhà Cung Cấp (Supplier)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thêm nhà cung cấp mới / Cập nhật đối tác |
| **Loại** | Quản lý nhà cung cấp |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/SupplierManager.tsx` |
| **Hành động** | Create / Update / Delete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `name` | text | ✅ | Tên công ty / Đại lý |
| `taxCode` | text | ❌ | Mã số thuế |
| `contactPerson` | text | ❌ | Người liên hệ |
| `phone` | text | ❌ | Số điện thoại |
| `email` | text | ❌ | Email |
| `address` | text | ❌ | Địa chỉ |
| `status` | select | ✅ | Trạng thái: active / inactive |

---

## 🔷 PHẦN 3: BIỂU MẪU ADMIN - CẤU HÌNH HỆ THỐNG

### 3.1 Form Quản lý Nhân viên

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thông tin nhân viên |
| **Loại** | Cấu hình hệ thống |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/SystemAdmin.tsx` (SystemManager) |
| **Hành động** | Create / Update |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `fullName` | text | ✅ | Họ tên nhân viên |
| `email` | text | ✅ | Email (disabled khi edit) |
| `phone` | text | ❌ | Số điện thoại |
| `role` | select | ✅ | Vai trò: ADMIN / SALES / WAREHOUSE |

---

### 3.2 Form Cấu hình Website

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Cấu hình thông tin website |
| **Loại** | Cấu hình hệ thống |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/SystemAdmin.tsx` (SystemConfigManager) |
| **Hành động** | Update |

**Danh sách trường nhập liệu:**

| Tab | Tên trường | Kiểu dữ liệu | Ghi chú |
|-----|------------|--------------|---------|
| General | `siteName` | text | Tên website |
| General | `logo` | file upload | Logo |
| General | `hotline` | text | Số hotline |
| General | `email` | text | Email liên hệ |
| General | `address` | text | Địa chỉ |
| Banners | `banners` | file upload (multiple) | Banner trang chủ |
| Params | `vatRate` | number | Tỷ lệ VAT (%) |
| Params | `lowStockThreshold` | number | Ngưỡng cảnh báo tồn kho thấp |
| Params | `returnPeriodDays` | number | Số ngày cho phép đổi trả |

---

## 🔷 PHẦN 4: BIỂU MẪU ADMIN - ĐƠN HÀNG & ĐỔI TRẢ

### 4.1 Form Cập nhật Trạng thái Đơn hàng

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Chi tiết đơn hàng (Modal) |
| **Loại** | Quản lý đơn hàng |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/AdminOrderDetailModal.tsx` |
| **Hành động** | Update status |

**Danh sách trường/action:**

| Tên trường | Kiểu dữ liệu | Ghi chú |
|------------|--------------|---------|
| `status` | button actions | Chuyển trạng thái: PENDING → CONFIRMED → PROCESSING → SHIPPING → COMPLETED |
| `trackingNumber` | text | Mã vận đơn (khi chuyển SHIPPING) |
| `shippingCarrier` | select | Đơn vị vận chuyển |
| `adminNote` | textarea | Ghi chú nội bộ |

---

### 4.2 Form Xử lý Yêu cầu Đổi/Trả

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Chi tiết yêu cầu đổi/trả |
| **Loại** | Quản lý đổi trả |
| **Đối tượng sử dụng** | Admin |
| **File** | `components/admin/ReturnManager.tsx` |
| **Hành động** | Approve / Reject / Complete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Ghi chú |
|------------|--------------|---------|
| `adminNote` | textarea | Ghi chú admin |
| `exchangeVariantId` | select | Variant muốn đổi sang (nếu EXCHANGE) |
| `refundAmount` | number | Số tiền hoàn (nếu REFUND) |

---

## 🔷 PHẦN 5: BIỂU MẪU KHÁCH HÀNG

### 5.1 Form Đăng nhập

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Đăng nhập |
| **Loại** | Xác thực |
| **Đối tượng sử dụng** | Khách hàng / Admin |
| **File** | `pages/LoginPage.tsx` |
| **Hành động** | Submit (Login) |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `email` | text (email) | ✅ | Email đăng nhập |
| `password` | password | ✅ | Mật khẩu |

---

### 5.2 Form Đăng ký

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Đăng ký tài khoản |
| **Loại** | Xác thực |
| **Đối tượng sử dụng** | Khách hàng |
| **File** | `pages/AuthPages.tsx` |
| **Hành động** | Submit (Register) |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `fullName` | text | ✅ | Họ và tên |
| `email` | text (email) | ✅ | Email |
| `phone` | text | ✅ | Số điện thoại |
| `password` | password | ✅ | Mật khẩu |
| `confirmPassword` | password | ✅ | Xác nhận mật khẩu |

---

### 5.3 Form Checkout (Đặt hàng)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thông tin đặt hàng |
| **Loại** | Đặt hàng |
| **Đối tượng sử dụng** | Khách hàng / Guest |
| **File** | `pages/CheckoutPage.tsx` |
| **Hành động** | Submit (Place Order) |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `fullName` | text | ✅ | Họ tên người nhận |
| `email` | text (email) | ✅ | Email |
| `phone` | text | ✅ | Số điện thoại |
| `address` | text | ✅ | Địa chỉ giao hàng |
| `city` | select | ✅ | Tỉnh/Thành phố |
| `district` | text | ❌ | Quận/Huyện |
| `ward` | text | ❌ | Phường/Xã |
| `paymentMethod` | radio | ✅ | COD / BANK_TRANSFER / MOMO |
| `notes` | textarea | ❌ | Ghi chú đơn hàng |
| `saveAddress` | checkbox | ❌ | Lưu địa chỉ vào sổ |
| `otp` | text | Điều kiện | OTP xác thực (Guest only) |

**Lưu ý nghiệp vụ:**
- Hệ thống validate tồn kho trước khi đặt hàng
- Nếu biến thể hết hàng, hiển thị cảnh báo và không cho thêm vào giỏ
- Giới hạn số lượng đặt không vượt quá stockQuantity

---

### 5.4 Form Tra cứu Đơn hàng

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Tra cứu đơn hàng |
| **Loại** | Tra cứu |
| **Đối tượng sử dụng** | Guest |
| **File** | `pages/OrderTrackingPage.tsx` |
| **Hành động** | Search |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `orderCode` | text | ✅ | Mã đơn hàng (VD: ORD-2025-XXXXXX) |
| `phone` | text | ✅ | Số điện thoại đặt hàng |

---

### 5.5 Form Yêu cầu Đổi/Trả hàng

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Yêu cầu đổi/trả hàng |
| **Loại** | Đổi trả |
| **Đối tượng sử dụng** | Khách hàng |
| **File** | `pages/OrderDetailPage.tsx` (Return modal) |
| **Hành động** | Submit (Create Return Request) |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `type` | radio | ✅ | EXCHANGE (Đổi hàng) / REFUND (Hoàn tiền) |
| `reason` | select | ✅ | Lý do đổi/trả (danh sách có sẵn) |
| `description` | textarea | ❌ | Mô tả chi tiết |
| `images` | file upload (multiple) | ❌ | Hình ảnh minh chứng |
| `exchangeVariantId` | select | Điều kiện | Variant muốn đổi (nếu EXCHANGE) |

---

### 5.6 Form Đánh giá Sản phẩm

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Đánh giá sản phẩm |
| **Loại** | Đánh giá |
| **Đối tượng sử dụng** | Khách hàng |
| **File** | `pages/OrderDetailPage.tsx` (Review modal) |
| **Hành động** | Submit (Add Review) |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `rating` | number (1-5 stars) | ✅ | Số sao đánh giá |
| `comment` | textarea | ❌ | Nội dung nhận xét |
| `images` | file upload (multiple) | ❌ | Hình ảnh đánh giá |

---

### 5.7 Form Quản lý Sổ Địa chỉ

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thêm địa chỉ mới |
| **Loại** | Quản lý hồ sơ |
| **Đối tượng sử dụng** | Khách hàng |
| **File** | `pages/ProfilePage.tsx` (Address book tab) |
| **Hành động** | Create / Update / Delete |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
|------------|--------------|----------|---------|
| `recipientName` | text | ✅ | Tên người nhận |
| `phone` | text | ✅ | Số điện thoại |
| `address` | text | ✅ | Địa chỉ chi tiết |
| `city` | select | ✅ | Tỉnh/Thành phố |
| `district` | text | ❌ | Quận/Huyện |
| `isDefault` | checkbox | ❌ | Đặt làm mặc định |

---

## 🔷 PHẦN 6: BIỂU MẪU TÌM KIẾM & LỌC

### 6.1 Form Lọc Sản phẩm (Customer)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Bộ lọc sản phẩm |
| **Loại** | Tìm kiếm / Lọc |
| **Đối tượng sử dụng** | Khách hàng / Guest |
| **File** | `pages/ProductListPage.tsx` |
| **Hành động** | Filter (realtime) |

**Danh sách trường nhập liệu:**

| Tên trường | Kiểu dữ liệu | Ghi chú |
|------------|--------------|---------|
| `search` | text | Tìm kiếm theo tên (hỗ trợ không dấu) |
| `categoryId` | select/checkbox | Lọc theo danh mục |
| `brandId` | checkbox (multiple) | Lọc theo thương hiệu |
| `priceRange` | range slider | Khoảng giá |
| `colors` | checkbox (multiple) | Lọc theo màu sắc |
| `sortBy` | select | Sắp xếp: Mới nhất, Giá tăng/giảm, Bán chạy |

---

### 6.2 Form Tìm kiếm Admin (Đa năng)

| Thuộc tính | Chi tiết |
|------------|----------|
| **Tên biểu mẫu** | Thanh tìm kiếm Admin |
| **Loại** | Tìm kiếm |
| **Đối tượng sử dụng** | Admin |
| **Files** | Nhiều file trong `components/admin/` |
| **Hành động** | Search (realtime) |

**Áp dụng cho các màn hình:**
- Danh sách sản phẩm: Tìm theo tên, mã SP
- Danh sách đơn hàng: Tìm theo mã đơn, SĐT, tên khách
- Danh sách đổi/trả: Tìm theo mã request, mã đơn
- Phiếu nhập kho: Tìm theo mã phiếu, NCC
- Phiếu xuất kho: Tìm theo mã phiếu, mã đơn hàng
- Nhật ký hệ thống: Lọc theo tên nhân viên

---

## 📋 TỔNG KẾT

### Ma trận Biểu mẫu theo Đối tượng sử dụng

| Biểu mẫu | Admin | Nhân viên Kho | Khách hàng | Guest |
|----------|:-----:|:-------------:|:----------:|:-----:|
| Thêm/Sửa Sản phẩm | ✅ | ❌ | ❌ | ❌ |
| Quản lý Variants | ✅ | ❌ | ❌ | ❌ |
| Quản lý Danh mục | ✅ | ❌ | ❌ | ❌ |
| Quản lý Thương hiệu | ✅ | ❌ | ❌ | ❌ |
| Quản lý Thuộc tính | ✅ | ❌ | ❌ | ❌ |
| Quản lý Bảng Size | ✅ | ❌ | ❌ | ❌ |
| Phiếu Nhập Kho | ✅ | ✅ | ❌ | ❌ |
| Phiếu Xuất Kho | ✅ | ✅ | ❌ | ❌ |
| Quản lý NCC | ✅ | ❌ | ❌ | ❌ |
| Quản lý Nhân viên | ✅ | ❌ | ❌ | ❌ |
| Cấu hình Website | ✅ | ❌ | ❌ | ❌ |
| Xử lý Đơn hàng | ✅ | ❌ | ❌ | ❌ |
| Xử lý Đổi/Trả | ✅ | ❌ | ❌ | ❌ |
| Đăng nhập | ✅ | ✅ | ✅ | ❌ |
| Đăng ký | ❌ | ❌ | ✅ | ✅ |
| Checkout | ❌ | ❌ | ✅ | ✅ |
| Tra cứu Đơn hàng | ❌ | ❌ | ❌ | ✅ |
| Yêu cầu Đổi/Trả | ❌ | ❌ | ✅ | ❌ |
| Đánh giá SP | ❌ | ❌ | ✅ | ❌ |
| Sổ Địa chỉ | ❌ | ❌ | ✅ | ❌ |

---

### Ghi chú quan trọng

1. **Validation nghiệp vụ quan trọng:**
   - **Tồn kho:** Kiểm tra stockQuantity trước khi thêm vào giỏ/đặt hàng
   - **Đổi/Trả:** Chỉ cho phép trong vòng 7 ngày từ ngày nhận hàng
   - **Nhập kho:** Auto-cộng stockQuantity sau khi lưu phiếu
   - **Xuất kho:** Auto-trừ stockQuantity sau khi lưu phiếu

2. **File upload:**
   - Sử dụng Supabase Storage
   - Hỗ trợ: JPG, PNG, WebP
   - Giới hạn: Tối đa 5MB/file

3. **Các biểu mẫu chưa hoàn thiện backend:**
   - Form Quên mật khẩu
   - Form Đổi mật khẩu (trong Profile)

---

*Tài liệu được tạo tự động từ phân tích source code*
