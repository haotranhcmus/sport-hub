# 📋 Hướng Dẫn Quản Trị Hệ Thống

## 🎯 Thứ Tự Setup Dữ Liệu

### 1️⃣ Bảng Size (Size Guides)

- **File:** `SizeGuideManager.tsx`
- **Không phụ thuộc:** Tạo đầu tiên
- **Được dùng bởi:** Category, Product
- **Xóa:** ✅ Kiểm tra Category/Product đang dùng

### 2️⃣ Danh Mục (Categories)

- **File:** `ProductConfig.tsx` - Tab "Danh mục"
- **Phụ thuộc:** SizeGuide (optional)
- **Được dùng bởi:** Product, ProductAttribute
- **Schema:** `name, slug, imageUrl, description, parentId, sizeGuideId`
- **Xóa:** ✅ Kiểm tra danh mục con + sản phẩm đang dùng

### 3️⃣ Thương Hiệu (Brands)

- **File:** `ProductConfig.tsx` - Tab "Thương hiệu"
- **Không phụ thuộc**
- **Được dùng bởi:** Product
- **Schema:** `name, slug, logoUrl, country` (⚠️ KHÔNG có description)
- **Xóa:** ✅ Kiểm tra sản phẩm đang dùng

### 4️⃣ Thuộc Tính (Attributes)

- **File:** `ProductConfig.tsx` - Tab "Thuộc tính"
- **Phụ thuộc:** Category
- **Được dùng bởi:** Product variants
- **Schema:** `name, code, type, values, categoryIds`
- **Loại:**
  - **variant:** Tạo biến thể (màu, size) - BẮT BUỘC có values
  - **info:** Thông tin thêm - optional values

### 5️⃣ Nhà Cung Cấp (Suppliers)

- **File:** `SupplierManager.tsx`
- **Được dùng bởi:** StockEntry

### 6️⃣ Sản Phẩm (Products & Variants)

- **File:** `ProductManager.tsx`
- **Phụ thuộc:** Category, Brand, SizeGuide, Attributes
- **Xóa:** ⚠️ CASCADE xóa variants/reviews. Không xóa nếu có đơn hàng

### 7️⃣ Nhập Kho → 8️⃣ Xuất Kho → 9️⃣ Đơn Hàng → 🔟 Đổi Trả

---

## ⚠️ Lưu Ý Quan Trọng

### Schema Differences

- **Brand:** KHÔNG có `description`
- **Category:** KHÔNG có `logoUrl`, `code`, `type`, `values`, `categoryIds`
- **Attribute:** KHÔNG có `description`, `imageUrl`, `logoUrl`, `parentId`, `sizeGuideId`

### Foreign Keys

- Empty string `""` phải convert sang `null`
- Đã fix: `parentId`, `sizeGuideId` cho Category

### Validation

- ✅ Category: Kiểm tra danh mục con + sản phẩm
- ✅ Brand: Kiểm tra sản phẩm
- ✅ SizeGuide: Kiểm tra Category/Product
- ✅ Attribute variant: Bắt buộc có values

---

## 📝 Kịch Bản Test Nhanh

```
1. Tạo 2 Size Guides
2. Tạo 3 Categories (1 cha + 2 con)
3. Tạo 3 Brands
4. Tạo Attributes: Màu ["Đỏ","Xanh"], Size ["M","L","XL"]
5. Tạo 2 Nhà cung cấp
6. Tạo 5 Products với variants
7. Nhập kho
8. Tạo đơn hàng test
9. Test đổi/trả
```

---

## 🛠️ HƯỚNG DẪN TEST CHI TIẾT

### 6️⃣ TẠO SẢN PHẨM VỚI VARIANTS

**File:** `ProductManager.tsx`

#### Bước 1: Tạo Thông Tin Chung

1. Click **"Thêm sản phẩm mới"**
2. Tab **"Thông tin chung"** - Điền:
   - Tên sản phẩm (VD: "Giày Nike Air Max")
   - Mã sản phẩm (VD: "NIKE-AM-001")
   - Danh mục (chọn từ dropdown)
   - Thương hiệu (chọn từ dropdown)
   - Giá niêm yết (VD: 2500000)
   - Giá vốn (optional, VD: 1500000)
   - Tải ảnh đại diện
   - Mô tả sản phẩm
3. Click **"TIẾP TỤC & TẠO BIẾN THỂ"** → Lưu thông tin chung

#### Bước 2: Tạo Biến Thể (Variants)

1. Tab **"Quản lý biến thể"** tự động mở
2. Click **"+ TẠO BIẾN THỂ TỰ ĐỘNG"**
3. Chọn giá trị thuộc tính:
   - **Màu:** Tick chọn ["Đỏ", "Xanh", "Trắng"]
   - **Size:** Tick chọn ["M", "L", "XL"]
4. Click **"Tạo biến thể ngay"**
5. Hệ thống tự động tạo **9 variants** (3 màu × 3 size):
   ```
   NIKE-AM-001-DO-M-001
   NIKE-AM-001-DO-L-002
   NIKE-AM-001-DO-XL-003
   NIKE-AM-001-XANH-M-004
   ... (total 9 variants)
   ```
6. Tùy chỉnh từng variant (optional):
   - **Giá điều chỉnh:** +50000 cho size XL
   - **Tải ảnh riêng:** Cho từng màu
   - **Trạng thái:** active/inactive
7. Click **"LƯU TẤT CẢ BIẾN THỂ"**

#### Lưu Ý

- ⚠️ **Tồn kho ban đầu = 0** → Cần nhập kho
- ✅ SKU tự động tạo: `{ProductCode}-{ColorCode}-{Size}-{Index}`
- ✅ Kiểm tra duplicate: Không tạo variant trùng màu+size
- ❌ **Không xóa được sản phẩm** nếu có đơn hàng

---

### 7️⃣ NHẬP KHO (STOCK ENTRY)

**File:** `StockEntrySystem.tsx`

#### Bước 1: Lập Phiếu Nhập

1. Vào **"Quản lý Nhập kho"**
2. Click **"+ Lập phiếu mới"**
3. Chọn **Nhà cung cấp** từ dropdown
4. Click **"+ TÌM CHỌN SẢN PHẨM"**

#### Bước 2: Thêm Sản Phẩm

1. Modal mở → Tìm kiếm sản phẩm (theo tên/mã)
2. Click mũi tên **▼** để mở rộng → Hiện variants
3. Click **"+"** bên cạnh variant cần nhập
4. Variant được thêm vào danh sách
5. Điều chỉnh:
   - **Số lượng:** Nhập số lượng nhập kho
   - **Đơn giá vốn:** Tự động = `costPrice` hoặc `basePrice * 0.6`
   - **Thành tiền:** Tự động tính = `quantity × unitCost`
6. Click **"x"** để xóa item nếu nhập nhầm

#### Bước 3: Xác Nhận Nhập

1. Kiểm tra **Tổng giá trị** ở sidebar
2. Click **"XÁC NHẬN NHẬP KHO"**
3. Hệ thống tự động:
   - Tạo `StockEntry` với mã phiếu (VD: `SE-171234`)
   - Cập nhật `ProductVariant.stockQuantity += quantity`
   - Tạo `SystemLog` cho audit trail

#### Xem Lịch Sử

- Bảng hiển thị: Mã phiếu, Thời gian, NCC, Nhân viên, Tổng giá trị
- Click **icon mắt** để xem chi tiết phiếu

---

### 8️⃣ TẠO ĐƠN HÀNG TEST

**File:** `CheckoutPage.tsx`

#### A. Phía Khách Hàng (Customer Flow)

##### Bước 1: Thêm Sản Phẩm Vào Giỏ

1. Vào trang **"Sản phẩm"**
2. Click vào sản phẩm → Trang chi tiết
3. Chọn **Màu + Size**
4. Nhập **Số lượng**
5. Click **"THÊM VÀO GIỎ"**
6. Kiểm tra icon giỏ hàng (số lượng items)

##### Bước 2: Thanh Toán

1. Click icon **Giỏ hàng** → CartDrawer mở
2. Click **"THANH TOÁN NGAY"** → Chuyển sang `/checkout`
3. Điền thông tin:
   - **Họ tên:** VD "Nguyễn Văn A"
   - **Email:** VD "nguyenvana@gmail.com"
   - **SĐT:** VD "0988123456"
   - **Địa chỉ:** VD "123 Lê Lợi, Q.1"
   - **Khu vực:** Chọn HCM/HN/OTHER
   - **Ghi chú:** Optional
4. Chọn **Phương thức thanh toán:**
   - **COD:** Giới hạn ≤ 10 triệu
   - **ONLINE:** Không giới hạn
5. Click **"XÁC NHẬN ĐẶT HÀNG"**

##### Bước 3: Xác Thực OTP (Nếu Online Payment)

1. Modal OTP hiện ra
2. Nhập mã OTP: **"123456"** (mã test cố định)
3. Click **"XÁC NHẬN"**
4. Đợi 2s → Modal thành công hiện ra
5. Click **"XEM CHI TIẾT ĐƠN HÀNG"** → Chuyển sang `/orders/{id}`

##### Bước 4: Theo Dõi Đơn

- Vào **"Tài khoản"** → Tab **"Đơn hàng của tôi"**
- Trạng thái ban đầu:
  - COD: `PENDING_CONFIRMATION` (Chờ xác nhận)
  - ONLINE: `PACKING` (Đang đóng gói)
- Auto-refresh: 30s hoặc click **"Làm mới"**

#### B. Phía Admin (Order Processing)

##### Admin Xử Lý Đơn (File: `OrderManager.tsx`, `AdminOrderDetailModal.tsx`)

1. Vào **ADMIN** → **"Quản lý đơn hàng"**
2. Đơn mới hiển thị với status badge
3. Click vào đơn → Modal chi tiết mở
4. **Workflow xử lý:**
   - **PENDING_CONFIRMATION** → Click "Xác nhận" → `PACKING`
   - **PACKING** → Click "Hoàn tất đóng gói" → `SHIPPING`
   - **SHIPPING** → Điền thông tin vận chuyển → `COMPLETED`
   - Có thể **Hủy đơn** ở bất kỳ bước nào → `CANCELLED`

##### Thông Tin Hiển Thị

- Mã đơn, Ngày tạo, Khách hàng (Tên + SĐT)
- Danh sách sản phẩm (Tên, Màu/Size, SL, Giá)
- Tổng tiền, Phí ship, Thanh toán (COD/ONLINE)
- Trạng thái hiện tại + Timeline

---

### 9️⃣ TEST ĐỔI/TRẢ HÀNG (RETURN REQUEST)

**Files:** `OrderDetailPage.tsx` (Customer), `ReturnManager.tsx` (Admin), `return-request.service.ts`

#### A. Khách Hàng Tạo Yêu Cầu Đổi/Trả

##### Điều Kiện

- ✅ Đơn hàng phải ở trạng thái `COMPLETED`
- ✅ Sản phẩm chưa có yêu cầu đổi/trả nào
- ❌ Không thể tạo nếu đã có request `PENDING/APPROVED/RECEIVED`

##### Bước Tạo Request

1. Vào **"Tài khoản"** → Tab **"Đơn hàng của tôi"**
2. Click đơn hàng có status **"HOÀN TẤT"**
3. Tại item cần đổi/trả → Click **"Yêu cầu đổi/trả"**
4. Modal mở → Chọn loại:
   - **🔄 Đổi sản phẩm (EXCHANGE):**
     - Chọn size mới
     - Chọn màu mới (nếu cần)
   - **💰 Hoàn tiền (REFUND):**
     - Điền thông tin ngân hàng
     - Tên ngân hàng, Số TK, Chủ TK
5. Điền **Lý do đổi/trả** (bắt buộc)
6. Tải ảnh minh chứng (optional, tối đa 3 ảnh)
7. Click **"GỬI YÊU CẦU"**
8. Hệ thống tự động:
   - Tạo `ReturnRequest` với status `PENDING`
   - Cập nhật `OrderItem.returnStatus = HAS_REQUEST`
   - Cập nhật `Order.status = RETURN_REQUESTED`

##### Theo Dõi Request

- Badge hiển thị: **"ĐANG ĐỔI/TRẢ"** (màu xanh dương)
- Click vào đơn → Xem chi tiết request
- Có thể **"Hủy yêu cầu"** nếu status = `PENDING`

#### B. Admin Xử Lý Yêu Cầu Đổi/Trả

**File:** `ReturnManager.tsx`

##### Workflow Xử Lý (3 Bước)

**BƯỚC 1: DUYỆT YÊU CẦU (APPROVE)**

1. Vào **ADMIN** → **"Quản lý Đổi/Trả"**
2. Tab **"Chờ duyệt"** → Danh sách requests với status `PENDING`
3. Click vào request → Modal chi tiết
4. Kiểm tra:
   - Thông tin khách hàng
   - Sản phẩm cần đổi/trả
   - Lý do + Ảnh minh chứng
   - **Tồn kho (nếu EXCHANGE):** Hiển thị số lượng có sẵn
5. Quyết định:
   - **Phê duyệt:** Click "Phê duyệt" → Nhập ghi chú → Xác nhận
   - **Từ chối:** Click "Từ chối" → Nhập lý do → Xác nhận
6. Sau approve:
   - `ReturnRequest.status = APPROVED`
   - `Order.status = RETURN_PROCESSING`
   - Email/SMS gửi tới khách: "Vui lòng gửi hàng về kho"

**BƯỚC 2: XÁC NHẬN NHẬN HÀNG (CONFIRM RECEIVED)**

1. Khi kho nhận được hàng trả về
2. Vào request → Click **"Xác nhận đã nhận hàng"**
3. Xác nhận popup
4. Hệ thống tự động:
   - `ReturnRequest.status = RECEIVED`
   - Tạo `StockEntry` (phiếu nhập kho trả về)
   - Cập nhật `ProductVariant.stockQuantity += returnedQty`
   - Ghi log: `"Nhập kho hàng đổi trả - {requestCode}"`

**BƯỚC 3: HOÀN TẤT (COMPLETE)**

1. Click **"Hoàn tất đổi/trả"** (màu xanh lá)
2. Xác nhận popup
3. Hệ thống tự động:

   **Nếu REFUND:**

   - `ReturnRequest.status = COMPLETED`
   - `Order.status = RETURN_COMPLETED`
   - Cập nhật `refundAmount` = giá trị hoàn
   - Console log: "💰 Hoàn tiền {amount}đ vào TK {bankInfo}"

   **Nếu EXCHANGE:**

   - `ReturnRequest.status = COMPLETED`
   - `Order.status = RETURN_COMPLETED`
   - Tạo `StockIssue` (phiếu xuất kho sản phẩm mới)
   - Giảm tồn kho sản phẩm đổi: `stockQuantity -= exchangeQty`
   - Ghi log: "Xuất kho đổi hàng - {requestCode}"

4. Badge customer thay đổi: **"ĐÃ HOÀN TẤT"** (màu xanh lá)

##### Kiểm Tra Kết Quả

- **Inventory (Tồn kho):**
  - Item trả về: `stockQuantity` tăng
  - Item đổi mới: `stockQuantity` giảm
- **StockEntry:** Có phiếu nhập từ "RETURN-{requestCode}"
- **StockIssue:** Có phiếu xuất cho "EXCHANGE-{requestCode}"
- **SystemLog:** Audit trail đầy đủ
- **Order Status:** `RETURN_COMPLETED`

#### Các Trường Hợp Đặc Biệt

**Case 1: Tồn Kho Không Đủ (Exchange)**

- Admin approve → Alert: "Không thể duyệt! Tồn kho không đủ. Hiện tại: 0, Cần: 1"
- Phải chờ nhập kho trước

**Case 2: Khách Hủy Request**

- Chỉ được hủy khi status = `PENDING`
- Click "Hủy yêu cầu" → `status = CANCELLED`
- `OrderItem.returnStatus = null`

**Case 3: Admin Từ Chối**

- `ReturnRequest.status = REJECTED`
- `OrderItem.returnStatus = REJECTED`
- Khách nhận thông báo từ chối + lý do

---

## 📊 Tóm Tắt Status Flow

### Return Request Status

```
PENDING → APPROVED → RECEIVED → COMPLETED
   ↓          ↓
CANCELLED  REJECTED
```

### Order Status (During Return)

```
RETURN_REQUESTED → RETURN_PROCESSING → RETURN_COMPLETED
```

### OrderItem Return Status

```
null → HAS_REQUEST → (giữ nguyên) / REJECTED / (null if cancelled)
```

---

**Version:** 2.0 | **Date:** Jan 7, 2026 | **Updated:** Complete workflow guide
