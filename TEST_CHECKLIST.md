# 📋 CHECKLIST TEST HỆ THỐNG SPORTHUB

**Version:** 1.0  
**Ngày cập nhật:** 10/01/2026  
**Mục đích:** Hướng dẫn test toàn bộ chức năng hệ thống theo thứ tự từ cấu hình cơ bản đến nghiệp vụ phức tạp

---

## 🔐 BƯỚC 0: CHUẨN BỊ & ĐĂNG NHẬP

### 0.1 Reset Database (Nếu cần)

- [ ] Chạy script reset database: `cd reset-data && ./reset-to-seed.sh`
- [ ] Xác nhận reset thành công (xuất hiện thông báo "✅ RESET DATABASE THÀNH CÔNG")
- [ ] Kiểm tra data seed: 6 Categories, 7 Brands, 5 Suppliers, 14 Attributes

### 0.2 Khởi động Server

- [ ] Chạy `npm run dev`
- [ ] Truy cập http://localhost:3001
- [ ] Không có lỗi console nghiêm trọng

### 0.3 Đăng nhập Admin

- [ ] Truy cập http://localhost:3001/#/login
- [ ] Email: `admin@sporthub.vn` (không cần password)
- [ ] Tự động chuyển về http://localhost:3001/#/admin
- [ ] Hiển thị sidebar với menu đầy đủ

---

## 📦 MODULE 1: CẤU HÌNH SẢN PHẨM (Product Configuration)

**Thứ tự:** Danh mục → Thương hiệu → Bảng Size → Thuộc tính → Nhà cung cấp

### 1.1 Quản lý Danh mục (Categories)

**Đường dẫn:** Admin → Sản phẩm → Cấu hình sản phẩm → Tab "Danh mục"

#### Test CRUD Danh mục cha

- [ ] **Tạo danh mục cha:**

  - Tên: "Bóng chuyền"
  - Slug: tự sinh "bong-chuyen"
  - Danh mục cha: Không chọn (để trống)
  - Nhấn "Lưu"
  - ✅ Kiểm tra: Danh mục xuất hiện trong danh sách

- [ ] **Sửa danh mục cha:**

  - Click icon Edit (✏️) trên "Bóng chuyền"
  - Đổi tên thành "Bóng chuyền nam"
  - Nhấn "Cập nhật"
  - ✅ Kiểm tra: Tên đã thay đổi

- [ ] **Xóa danh mục cha:**
  - Click icon Trash (🗑️) trên "Bóng chuyền nam"
  - Confirm xóa
  - ✅ Kiểm tra: Danh mục biến mất khỏi danh sách

#### Test CRUD Danh mục con

- [ ] **Tạo danh mục con:**

  - Tên: "Giày Tennis"
  - Danh mục cha: Chọn "Tennis" (từ seed data)
  - Nhấn "Lưu"
  - ✅ Kiểm tra: Hiển thị dưới Tennis với indent

- [ ] **Hierarchy check:**
  - ✅ Danh mục con hiển thị dưới danh mục cha
  - ✅ Có icon phân cấp (→) hoặc indent
  - ✅ Số lượng con hiển thị chính xác

### 1.2 Quản lý Thương hiệu (Brands)

**Đường dẫn:** Admin → Sản phẩm → Cấu hình sản phẩm → Tab "Thương hiệu"

- [ ] **Tạo thương hiệu mới:**

  - Tên: "Yonex"
  - Slug: "yonex"
  - Nhấn "Lưu"
  - ✅ Kiểm tra: Brand xuất hiện trong danh sách

- [ ] **Sửa thương hiệu:**

  - Click Edit trên "Yonex"
  - Đổi slug thành "yonex-official"
  - Nhấn "Cập nhật"
  - ✅ Kiểm tra: Slug đã thay đổi

- [ ] **Xóa thương hiệu:**
  - Click Delete
  - Confirm
  - ✅ Kiểm tra: Brand bị xóa

### 1.3 Quản lý Bảng Size (Size Guides)

**Đường dẫn:** Admin → Sản phẩm → Bảng Size

- [ ] **Xem bảng size có sẵn:**

  - ✅ Hiển thị 3 bảng: Giày, Áo, Quần (từ seed)
  - ✅ Mỗi bảng hiển thị số lượng sizes

- [ ] **Tạo bảng size mới:**

  - Tên: "Găng tay"
  - Thêm sizes: S, M, L, XL
  - Nhấn "Lưu"
  - ✅ Kiểm tra: Bảng mới xuất hiện

- [ ] **Chỉnh sửa bảng size:**
  - Click Edit
  - Thêm size XXL
  - Xóa size S
  - Nhấn "Cập nhật"
  - ✅ Kiểm tra: Thay đổi đã lưu

### 1.4 Quản lý Thuộc tính sản phẩm (Product Attributes)

**Đường dẫn:** Admin → Sản phẩm → Cấu hình sản phẩm → Tab "Thuộc tính"

#### Kiểm tra thuộc tính có sẵn (Seed data)

- [ ] **Variant Attributes (Sinh biến thể):**

  - ✅ Màu sắc (Tất cả danh mục)
  - ✅ Size giày (Chỉ giày)
  - ✅ Size áo (Chỉ áo)
  - ✅ Size quần (Chỉ quần)

- [ ] **Specification Attributes (Thông tin bổ sung):**
  - ✅ Chất liệu giày, Công nghệ đế, Loại đế bóng đá (Chỉ giày)
  - ✅ Chất liệu vải (Áo và quần)
  - ✅ Kiểu áo (Chỉ áo)
  - ✅ Kiểu quần (Chỉ quần)
  - ✅ Giới tính (Tất cả danh mục)

#### Test tạo thuộc tính mới

- [ ] **Tạo Variant Attribute:**

  - Tên: "Size găng tay"
  - Loại: Variant (Sinh biến thể)
  - Values: S, M, L, XL
  - Danh mục: Chọn "Bóng đá" và "Bóng rổ"
  - Nhấn "Lưu"
  - ✅ Kiểm tra: Thuộc tính mới xuất hiện

- [ ] **Tạo Specification Attribute:**

  - Tên: "Chất liệu găng tay"
  - Loại: Specification
  - Values: Da thật, Da tổng hợp, Vải
  - Nhấn "Lưu"
  - ✅ Kiểm tra: Thuộc tính spec mới xuất hiện

- [ ] **Sửa thuộc tính:**
  - Click Edit
  - Thêm value "XXL"
  - Nhấn "Cập nhật"
  - ✅ Kiểm tra: Value mới đã thêm

### 1.5 Quản lý Nhà cung cấp (Suppliers)

**Đường dẫn:** Admin → Quản lý kho → Nhà cung cấp

- [ ] **Xem danh sách suppliers seed:**

  - ✅ Hiển thị 5 suppliers từ seed data
  - ✅ Có tên, email, phone, address

- [ ] **Tạo supplier mới:**

  - Tên: "Nike Vietnam"
  - Email: "nike@vietnam.com"
  - Phone: "0901234567"
  - Address: "Hà Nội"
  - Nhấn "Lưu"
  - ✅ Kiểm tra: Supplier mới xuất hiện

- [ ] **Sửa supplier:**

  - Click Edit
  - Đổi phone thành "0987654321"
  - Nhấn "Cập nhật"
  - ✅ Kiểm tra: Thay đổi đã lưu

- [ ] **Xóa supplier:**
  - Click Delete
  - Confirm
  - ✅ Kiểm tra: Supplier bị xóa

---

## 🎽 MODULE 2: QUẢN LÝ SẢN PHẨM & SKU

**Thứ tự:** Tạo sản phẩm → Upload ảnh → Tạo biến thể → Quản lý tồn kho

### 2.1 Tạo sản phẩm mới

**Đường dẫn:** Admin → Sản phẩm → Sản phẩm & SKU → "THÊM SẢN PHẨM MỚI"

#### Tab "Thông tin chung" - Section "Cơ bản"

- [ ] **Điền thông tin:**
  - Tên sản phẩm: "Áo bóng đá Manchester United"
  - Mã sản phẩm (Model): "MNU-HOME-2024"
  - Danh mục: Chọn "Áo bóng đá" (danh mục con)
  - Thương hiệu: Chọn "Adidas"
  - Giá niêm yết: 500000
  - Giá khuyến mãi: 450000
  - Mô tả: "Áo đấu chính thức mùa giải 2024"

#### Tab "Thông tin chung" - Section "Hình ảnh"

- [ ] **Upload ảnh đại diện:**

  - Click vào ô "Tải ảnh chính"
  - Chọn file ảnh (PNG/JPG, max 5MB)
  - ✅ Kiểm tra: Ảnh hiển thị preview
  - ✅ Console log: "✅ [UPLOAD] Success"

- [ ] **Upload gallery images (Danh sách ảnh sản phẩm):**

  - Click "Thư viện ảnh sản phẩm"
  - Chọn 3-5 ảnh cùng lúc
  - ✅ Kiểm tra: Progress bar hiển thị
  - ✅ Kiểm tra: Tất cả ảnh hiển thị trong grid 3-5 columns
  - ✅ Console log: "Uploaded 3 images"

- [ ] **Xóa ảnh trong gallery:**
  - Click icon X trên 1 ảnh
  - ✅ Kiểm tra: Ảnh biến mất khỏi grid

#### Tab "Thông tin chung" - Section "Thông số"

- [ ] **Chọn Specification Attributes:**
  - Chất liệu vải: "Polyester"
  - Kiểu áo: "Áo đấu"
  - Giới tính: "Nam"
  - ✅ Kiểm tra: Dropdown chỉ hiển thị attributes phù hợp với danh mục

#### Tab "Thông tin chung" - Section "Chính sách"

- [ ] **Thiết lập chính sách:**
  - Cho phép đổi trả: Bật
  - Thời gian đổi trả: 7 ngày
  - Miễn phí vận chuyển: Bật
  - Tình trạng: "Mới 100% Full Box"

#### Lưu sản phẩm

- [ ] **Click nút "LƯU":**
  - ✅ Alert: "Lưu thông tin sản phẩm thành công!"
  - ✅ Tự động chuyển sang tab "Quản lý biến thể"

### 2.2 Tạo biến thế SKU

**Tab "Quản lý biến thể"**

#### Tạo SKU tự động

- [ ] **Click "TẠO SKU":**

  - Modal "Tạo cấu hình SKU biến thể" mở ra
  - ✅ Hiển thị 2 variant attributes: Màu sắc, Size áo

- [ ] **Chọn values để sinh biến thể:**

  - Màu sắc: Chọn "Đỏ", "Trắng", "Đen"
  - Size áo: Chọn "S", "M", "L", "XL"
  - ✅ Kiểm tra: Hiển thị số SKU sẽ sinh: "12 SKU" (3 màu × 4 size)

- [ ] **Sinh SKU:**
  - Click "Sinh tự động"
  - ✅ Kiểm tra: Bảng hiển thị 12 dòng
  - ✅ Mỗi dòng có: Ảnh placeholder, Màu, Size, SKU auto (MNU-HOME-2024-ĐỎ-S), Tồn kho = 0

#### Cập nhật thông tin SKU

- [ ] **Upload ảnh cho variant:**

  - Click vào ô ảnh của variant "Đỏ - M"
  - Chọn ảnh màu đỏ
  - ✅ Kiểm tra: Ảnh hiển thị thay vì placeholder

- [ ] **Nhập tồn kho:**

  - Nhập số lượng cho mỗi SKU:
    - Đỏ-S: 10
    - Đỏ-M: 15
    - Đỏ-L: 20
    - ... (tất cả variants)
  - ✅ Kiểm tra: Số lượng > 0

- [ ] **Chỉnh sửa SKU code:**
  - Click vào cell SKU
  - Đổi "MNU-HOME-2024-ĐỎ-S" thành "MNU-ĐỎ-S-2024"
  - ✅ Kiểm tra: SKU đã cập nhật

#### Lưu toàn bộ

- [ ] **Click "CẬP NHẬT" (ở góc trên):**
  - ✅ Validation SKU trùng lặp: Không có lỗi
  - ✅ Validation tồn kho > 0: Tất cả pass
  - ✅ Alert: "✅ Đã lưu toàn bộ sản phẩm và danh sách biến thể!"
  - ✅ Modal đóng lại
  - ✅ Sản phẩm xuất hiện trong danh sách

### 2.3 Kiểm tra sản phẩm đã tạo

- [ ] **Danh sách sản phẩm:**

  - ✅ Hiển thị "Áo bóng đá Manchester United"
  - ✅ Thumbnail: Ảnh đại diện
  - ✅ Giá: 450,000đ (giá KM)
  - ✅ Số variants: 12 SKU

- [ ] **Edit sản phẩm:**

  - Click Edit (✏️)
  - ✅ Modal mở với đầy đủ thông tin
  - ✅ Tab "Thông tin chung" - Section "Hình ảnh": Gallery hiển thị đủ ảnh đã upload
  - ✅ Tab "Quản lý biến thể": 12 variants với ảnh, tồn kho đã nhập

- [ ] **Xem trên trang Customer:**
  - Truy cập http://localhost:3001/#/products
  - ✅ Sản phẩm xuất hiện trong danh sách
  - Click vào sản phẩm
  - ✅ Trang chi tiết hiển thị:
    - Gallery slideshow (thumbnail + imageUrls)
    - Chọn màu và size
    - Giá khuyến mãi
    - Nút "Thêm vào giỏ"

---

## 📦 MODULE 3: QUẢN LÝ KHO HÀNG

**Thứ tự:** Nhập kho → Xuất kho → Kiểm kê → Báo cáo tồn kho

### 3.1 Nhập kho (Stock Entry)

**Đường dẫn:** Admin → Quản lý kho → Nhập kho → "TẠO PHIẾU NHẬP MỚI"

- [ ] **Tạo phiếu nhập:**

  - Chọn nhà cung cấp: "Nike Vietnam"
  - Ghi chú: "Nhập hàng tháng 1/2026"
  - Click "Tiếp tục"

- [ ] **Thêm sản phẩm vào phiếu:**

  - Search: "Manchester United"
  - Chọn variant: "Đỏ - M"
  - Số lượng nhập: 50
  - Giá nhập: 300000
  - Click "Thêm vào phiếu"
  - ✅ Kiểm tra: Variant xuất hiện trong bảng

- [ ] **Thêm nhiều variants:**

  - Thêm "Đỏ - L": 40 chiếc
  - Thêm "Trắng - M": 30 chiếc
  - ✅ Kiểm tra: Tổng tiền tự động tính

- [ ] **Lưu phiếu nhập:**

  - Click "Lưu phiếu nhập"
  - ✅ Alert: "✅ Lưu phiếu nhập thành công!"
  - ✅ Tồn kho tăng:
    - Đỏ-M: 15 → 65
    - Đỏ-L: 20 → 60
    - Trắng-M: 15 → 45

- [ ] **Kiểm tra lại phiếu nhập:**
  - Quay lại danh sách phiếu nhập
  - ✅ Phiếu mới xuất hiện với status "COMPLETED"
  - Click xem chi tiết
  - ✅ Hiển thị đầy đủ thông tin: Supplier, items, total

### 3.2 Xuất kho (Stock Issue)

**Đường dẫn:** Admin → Quản lý kho → Xuất kho → "TẠO PHIẾU XUẤT MỚI"

- [ ] **Tạo phiếu xuất:**

  - Loại xuất: "SALE" (Bán hàng)
  - Ghi chú: "Xuất bán khách lẻ"
  - Click "Tiếp tục"

- [ ] **Thêm sản phẩm xuất:**

  - Search: "Manchester United"
  - Chọn "Đỏ - M"
  - Số lượng xuất: 10
  - Click "Thêm"
  - ✅ Kiểm tra: Variant xuất hiện

- [ ] **Lưu phiếu xuất:**

  - Click "Lưu phiếu xuất"
  - ✅ Alert: "✅ Lưu phiếu xuất thành công!"
  - ✅ Tồn kho giảm: Đỏ-M: 65 → 55

- [ ] **Test validation tồn kho:**
  - Tạo phiếu xuất mới
  - Thử xuất "Đỏ - M": 100 (nhiều hơn tồn)
  - ✅ Lỗi: "Tồn kho không đủ"

### 3.3 Kiểm kê (Stock Count)

**Đường dẫn:** Admin → Quản lý kho → Kiểm kê → "TẠO PHIẾU KIỂM MỚI"

- [ ] **Tạo phiếu kiểm kê:**

  - Tên: "Kiểm kê tháng 1/2026"
  - Phạm vi: "ALL" (Toàn kho)
  - Click "Bắt đầu kiểm kê"

- [ ] **Nhập số lượng thực tế:**

  - Hệ thống load tất cả variants
  - Nhập số thực tế cho "Đỏ - M": 50 (trong khi system: 55)
  - ✅ Hiển thị chênh lệch: -5
  - Nhập lý do: "Hàng hư"

- [ ] **Hoàn tất kiểm kê:**

  - Click "Hoàn tất kiểm kê"
  - ✅ Alert: "✅ Kiểm kê thành công!"
  - ✅ Tồn kho điều chỉnh: Đỏ-M: 55 → 50

- [ ] **Xem báo cáo kiểm kê:**
  - Click vào phiếu kiểm vừa tạo
  - ✅ Hiển thị: Số lượng hệ thống, thực tế, chênh lệch, lý do

### 3.4 Báo cáo tồn kho

**Đường dẫn:** Admin → Quản lý kho → Báo cáo tồn kho

- [ ] **Xem tổng quan:**

  - ✅ Hiển thị tổng giá trị tồn kho
  - ✅ Số SKU tồn kho
  - ✅ Cảnh báo hàng sắp hết (< 10)

- [ ] **Lọc theo sản phẩm:**

  - Search: "Manchester United"
  - ✅ Hiển thị tất cả variants
  - ✅ Số lượng tồn chính xác

- [ ] **Export báo cáo:**
  - Click "Export Excel"
  - ✅ File tải về thành công

---

## 🛒 MODULE 4: NGHIỆP VỤ BÁN HÀNG

**Thứ tự:** Khách duyệt sản phẩm → Thêm giỏ hàng → Checkout → Thanh toán → Xử lý đơn hàng

### 4.1 Quy trình mua hàng (Customer Flow)

#### Đăng xuất Admin, đăng nhập Customer

- [ ] **Logout admin:**

  - Click "Đăng xuất"
  - Redirect về trang login

- [ ] **Login customer:**
  - Email: `customer@sporthub.vn`
  - ✅ Redirect về trang chủ (không phải admin)

#### Duyệt sản phẩm

- [ ] **Trang chủ:**

  - ✅ Hiển thị danh sách sản phẩm
  - ✅ Banner slideshow (nếu có)
  - Click "Sản phẩm" menu

- [ ] **Trang danh sách sản phẩm:**

  - ✅ Hiển thị tất cả sản phẩm active
  - ✅ Filter theo category
  - ✅ Filter theo brand
  - ✅ Search hoạt động

- [ ] **Trang chi tiết sản phẩm:**
  - Click vào "Áo bóng đá Manchester United"
  - ✅ Gallery slideshow (ảnh đại diện + imageUrls)
  - ✅ Chọn màu: Đỏ, Trắng, Đen
  - ✅ Chọn size: S, M, L, XL
  - ✅ Giá khuyến mãi hiển thị
  - ✅ Thông tin spec: Chất liệu, Kiểu áo, Giới tính

#### Thêm vào giỏ hàng

- [ ] **Add to cart:**

  - Chọn màu: Đỏ
  - Chọn size: M
  - Số lượng: 2
  - Click "Thêm vào giỏ"
  - ✅ Toast: "✅ Đã thêm vào giỏ hàng!"
  - ✅ Icon giỏ hàng: Badge số 2

- [ ] **Thêm nhiều sản phẩm:**

  - Quay lại danh sách
  - Thêm 1 sản phẩm khác
  - ✅ Badge tăng lên

- [ ] **Xem giỏ hàng:**
  - Click icon giỏ hàng
  - ✅ Drawer mở ra
  - ✅ Hiển thị 2 items
  - ✅ Ảnh, tên, màu, size, giá
  - ✅ Tổng tiền chính xác

#### Checkout

- [ ] **Từ giỏ hàng:**

  - Click "Thanh toán"
  - Redirect đến `/checkout`

- [ ] **Điền thông tin:**

  - Họ tên: "Nguyễn Văn A"
  - Email: "nguyenvana@gmail.com"
  - Số điện thoại: "0901234567"
  - Địa chỉ: "123 Nguyễn Huệ, Q1, TP.HCM"
  - ✅ Tổng tiền hiển thị
  - ✅ Phí ship (nếu có)

- [ ] **Chọn phương thức thanh toán:**
  - Chọn "COD" (Tiền mặt)
  - Click "Đặt hàng"
  - ✅ Alert: "✅ Đặt hàng thành công!"
  - ✅ Redirect đến trang "Đơn hàng của tôi"

### 4.2 Quản lý đơn hàng (Admin)

#### Xem danh sách đơn hàng

- [ ] **Đăng nhập lại Admin:**

  - Email: `admin@sporthub.vn`
  - Vào Admin → Kinh doanh → Đơn hàng

- [ ] **Kiểm tra đơn mới:**
  - ✅ Đơn vừa tạo xuất hiện
  - ✅ Status: "PENDING"
  - ✅ Tổng tiền chính xác
  - ✅ Thông tin khách hàng đầy đủ

#### Xử lý đơn hàng

- [ ] **Xem chi tiết đơn:**

  - Click vào đơn hàng
  - ✅ Modal hiển thị:
    - Thông tin khách
    - Danh sách sản phẩm
    - Tổng tiền
    - Timeline trạng thái

- [ ] **Xác nhận đơn hàng:**

  - Click "Xác nhận"
  - ✅ Status: PENDING → CONFIRMED
  - ✅ Timeline cập nhật

- [ ] **Đóng gói:**

  - Click "Đóng gói"
  - ✅ Status: CONFIRMED → PROCESSING
  - ✅ Tồn kho giảm (Đỏ-M: 50 → 48)

- [ ] **Giao hàng:**

  - Click "Giao hàng"
  - ✅ Status: PROCESSING → SHIPPING

- [ ] **Hoàn tất:**
  - Click "Hoàn tất"
  - ✅ Status: SHIPPING → COMPLETED
  - ✅ Đơn chuyển sang tab "Hoàn tất"

#### Test hủy đơn

- [ ] **Tạo đơn mới:**

  - Đăng nhập customer
  - Tạo thêm 1 đơn hàng mới

- [ ] **Hủy đơn (Admin):**
  - Vào admin
  - Click "Hủy đơn"
  - Nhập lý do: "Khách yêu cầu hủy"
  - ✅ Status: → CANCELLED
  - ✅ Tồn kho hoàn lại (nếu đã trừ)

---

## 🔄 MODULE 5: ĐỔI TRẢ HÀNG

**Đường dẫn:** Admin → Kinh doanh → Đổi / Trả

### 5.1 Tạo yêu cầu đổi trả

#### Khách hàng tạo yêu cầu

- [ ] **Đăng nhập customer:**

  - Vào "Hồ sơ" → "Lịch sử mua hàng"
  - Click vào đơn đã COMPLETED

- [ ] **Yêu cầu đổi trả:**
  - Click "Yêu cầu đổi trả"
  - Chọn sản phẩm cần trả
  - Lý do: "Sai size"
  - Loại: "REFUND" (Hoàn tiền)
  - Upload ảnh bằng chứng (nếu có)
  - Click "Gửi yêu cầu"
  - ✅ Alert: "✅ Đã gửi yêu cầu đổi trả!"

### 5.2 Xử lý yêu cầu đổi trả (Admin)

- [ ] **Xem danh sách:**

  - Admin → Đổi / Trả
  - ✅ Yêu cầu mới xuất hiện với status "PENDING"

- [ ] **Duyệt yêu cầu:**

  - Click "Duyệt"
  - ✅ Status: PENDING → APPROVED
  - ✅ Email thông báo gửi cho khách (nếu có)

- [ ] **Nhận hàng trả:**

  - Click "Đã nhận hàng"
  - ✅ Status: APPROVED → RECEIVED
  - ✅ Tồn kho tăng lại

- [ ] **Hoàn tiền:**

  - Click "Hoàn tiền"
  - ✅ Status: RECEIVED → REFUNDED
  - ✅ Ghi log hoàn tiền

- [ ] **Test từ chối:**
  - Tạo yêu cầu mới
  - Click "Từ chối"
  - Nhập lý do: "Quá thời gian đổi trả"
  - ✅ Status: PENDING → REJECTED

---

## 📊 MODULE 6: BÁO CÁO & THỐNG KÊ

**Đường dẫn:** Admin → Báo cáo → Doanh thu

### 6.1 Dashboard tổng quan

- [ ] **Vào Dashboard:**

  - Admin → Tổng quan
  - ✅ Hiển thị 4 stat cards:
    - Doanh thu ngày
    - Đơn hàng mới
    - Khách hàng mới
    - Cảnh báo

- [ ] **Biểu đồ:**
  - ✅ Bar chart doanh thu 7 ngày
  - ✅ Data chính xác

### 6.2 Báo cáo doanh thu

- [ ] **Chọn khoảng thời gian:**

  - Click "7 Ngày"
  - ✅ Data reload
  - Click "Tháng này"
  - ✅ Data thay đổi

- [ ] **Xem chi tiết:**

  - ✅ Tổng doanh thu
  - ✅ Tổng đơn hàng
  - ✅ Đơn hàng trung bình
  - ✅ Tỷ lệ hủy đơn

- [ ] **Top sản phẩm:**
  - ✅ Hiển thị sản phẩm bán chạy
  - ✅ Số lượng bán
  - ✅ Doanh thu

---

## ⚙️ MODULE 7: CẤU HÌNH HỆ THỐNG

**Đường dẫn:** Admin → Cấu hình → Website

### 7.1 Thông tin chung

- [ ] **Cấu hình website:**
  - Tên website: "SportHub Vietnam"
  - Slogan: "Thiết bị thể thao chính hãng"
  - Email: "support@sporthub.vn"
  - Phone: "1900xxxx"
  - Click "Lưu cấu hình"
  - ✅ Alert: "✅ Lưu thành công!"

### 7.2 Banners

- [ ] **Upload banner:**
  - Tab "Banners"
  - Upload 3 ảnh banner
  - ✅ Preview hiển thị
  - Click "Lưu"
  - ✅ Banner xuất hiện trên trang chủ

### 7.3 Quản lý nhân viên

**Đường dẫn:** Admin → Cấu hình → Nhân viên

- [ ] **Xem danh sách:**

  - ✅ Hiển thị tất cả users
  - ✅ Filter theo role: ADMIN, CUSTOMER, SALES, WAREHOUSE

- [ ] **Tạo nhân viên mới:**

  - Họ tên: "Nguyễn Văn B"
  - Email: "sales01@sporthub.vn"
  - Role: SALES
  - Click "Tạo"
  - ✅ User mới xuất hiện

- [ ] **Đổi role:**
  - Click Edit
  - Đổi role SALES → WAREHOUSE
  - ✅ Thay đổi đã lưu

### 7.4 Nhật ký hệ thống

**Đường dẫn:** Admin → Cấu hình → Nhật ký

- [ ] **Xem logs:**

  - ✅ Hiển thị tất cả actions
  - ✅ User thực hiện
  - ✅ Thời gian
  - ✅ Action type: CREATE, UPDATE, DELETE

- [ ] **Filter logs:**
  - Filter theo user
  - Filter theo action type
  - ✅ Data lọc chính xác

---

## ✅ CHECKLIST TỔNG HỢP

### Cấu hình cơ bản (Setup)

- [ ] Database đã reset và seed thành công
- [ ] 6 Categories, 7 Brands, 5 Suppliers, 14 Attributes tồn tại
- [ ] Đăng nhập admin thành công

### Cấu hình sản phẩm (Product Config)

- [ ] Tạo/Sửa/Xóa danh mục cha thành công
- [ ] Tạo/Sửa/Xóa danh mục con thành công
- [ ] Tạo/Sửa/Xóa thương hiệu thành công
- [ ] Tạo/Sửa bảng size thành công
- [ ] Tạo variant attribute thành công
- [ ] Tạo specification attribute thành công
- [ ] Tạo/Sửa/Xóa supplier thành công

### Quản lý sản phẩm (Product Management)

- [ ] Tạo sản phẩm mới với đầy đủ thông tin
- [ ] Upload ảnh đại diện thành công
- [ ] Upload gallery images (3-5 ảnh) thành công
- [ ] **imageUrls hiển thị đầy đủ khi edit sản phẩm**
- [ ] Tạo 12 variants (3 màu × 4 size) thành công
- [ ] Upload ảnh cho variant thành công
- [ ] Nhập tồn kho cho variants thành công
- [ ] Lưu toàn bộ product + variants thành công
- [ ] Sản phẩm hiển thị trên trang customer

### Quản lý kho (Inventory)

- [ ] Tạo phiếu nhập kho, tồn kho tăng
- [ ] Tạo phiếu xuất kho, tồn kho giảm
- [ ] Validation tồn kho khi xuất hoạt động
- [ ] Kiểm kê, điều chỉnh tồn kho thành công
- [ ] Báo cáo tồn kho hiển thị chính xác

### Nghiệp vụ bán hàng (Sales)

- [ ] Customer duyệt sản phẩm thành công
- [ ] Thêm vào giỏ hàng thành công
- [ ] Checkout và đặt hàng thành công
- [ ] Admin xem được đơn hàng mới
- [ ] Xác nhận → Đóng gói → Giao hàng → Hoàn tất
- [ ] Tồn kho giảm khi đơn PROCESSING
- [ ] Hủy đơn, tồn kho hoàn lại

### Đổi trả (Returns)

- [ ] Customer tạo yêu cầu đổi trả
- [ ] Admin duyệt yêu cầu
- [ ] Nhận hàng, tồn kho tăng lại
- [ ] Hoàn tiền thành công
- [ ] Từ chối yêu cầu thành công

### Báo cáo (Reports)

- [ ] Dashboard hiển thị stats chính xác
- [ ] Biểu đồ doanh thu 7 ngày hoạt động
- [ ] Filter thời gian: Hôm nay, 7 ngày, Tháng này
- [ ] Top sản phẩm bán chạy hiển thị

### Cấu hình hệ thống (System Config)

- [ ] Lưu thông tin website thành công
- [ ] Upload banner thành công
- [ ] Tạo nhân viên mới thành công
- [ ] Nhật ký ghi log đầy đủ

---

## 🐛 BUG TRACKING

### Critical Bugs (Ưu tiên cao)

- [ ] imageUrls không lưu/mất sau khi save → **ĐÃ FIX** (dùng Supabase select thay vì Prisma)
- [ ] Tồn kho không giảm khi đơn hàng processing
- [ ] Giỏ hàng reset sau refresh

### Medium Bugs (Ưu tiên trung bình)

- [ ] Search không tìm theo tiếng Việt không dấu
- [ ] Filter category không sync với URL
- [ ] Image upload timeout với file > 3MB

### Low Bugs (Ưu tiên thấp)

- [ ] Toast notification đè lên navbar
- [ ] Mobile menu không đóng sau click
- [ ] Console warning về React keys

---

## 📝 GHI CHÚ

**Thứ tự test được thiết kế theo:**

1. **Bottom-up approach:** Cấu hình cơ sở trước (categories, brands, attributes)
2. **Dependencies:** Sản phẩm cần categories/brands → Variants cần products → Orders cần products/variants
3. **Business flow:** Nhập kho → Bán hàng → Đổi trả
4. **Admin-first:** Setup admin trước, customer sau

**Môi trường test:**

- Browser: Chrome/Edge/Firefox
- Node: v18+
- Database: PostgreSQL (Supabase)
- Port: 3001

**Accounts:**

- Admin: `admin@sporthub.vn`
- Customer: `customer@sporthub.vn`
- Sales: `sales@sporthub.vn` (seed data)
- Warehouse: `warehouse@sporthub.vn` (seed data)

**Console logs quan trọng:**

- `✅ [UPLOAD] Success` - Upload ảnh thành công
- `🔍 FormData before save` - Kiểm tra imageUrls trước khi lưu
- `✅ Updated product` - Sản phẩm đã cập nhật
- `📤 Sending to Supabase` - Data gửi lên DB

---

**Version History:**

- v1.0 (10/01/2026): Initial checklist
