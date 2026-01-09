# Hướng Dẫn Test Luồng Hệ Thống SportHub

**Ngày tạo:** 09/01/2026  
**Phiên bản:** 1.0

---

## 📋 Mục đích

Tài liệu này mô tả chi tiết thứ tự test các luồng nghiệp vụ từ khởi tạo dữ liệu cơ bản đến các tính năng nâng cao của hệ thống SportHub.

---

## 🎯 Nguyên tắc Test

- Test theo thứ tự từ cơ bản đến phức tạp
- Đảm bảo dữ liệu test được chuẩn bị đầy đủ
- Kiểm tra cả happy path và edge cases
- Ghi lại kết quả sau mỗi bước test

---

## 📊 GIAI ĐOẠN 1: KHỞI TẠO DỮ LIỆU CƠ BẢN (ADMIN)

> **⚡ LƯU Ý:** Dữ liệu cơ bản đã được seed tự động! Bạn có thể bỏ qua Bước 1.2 đến 1.6 và chuyển ngay sang **GIAI ĐOẠN 2: QUẢN LÝ SẢN PHẨM**.

### Bước 1.0: Reset Database về Seed Data

**Mục đích:** Nạp dữ liệu cơ bản đã chuẩn bị sẵn

**Các bước thực hiện:**

```bash
# Chạy lệnh reset database
npm run db:reset
# hoặc
npx prisma migrate reset --force
```

**Dữ liệu được tạo tự động:**

✅ **3 danh mục chính** với 9 danh mục con:

- **Bóng Đá:** Giày, Áo, Quần
- **Chạy Bộ:** Giày, Áo, Quần
- **Gym & Fitness:** Giày, Áo, Quần

✅ **7 thương hiệu:** Nike, Adidas, Puma, New Balance, Asics, Mizuno, Under Armour

✅ **3 bảng size:** Giày (10 sizes), Áo (6 sizes), Quần (6 sizes)

✅ **11 thuộc tính hợp lý:**

- **Màu sắc** → Tất cả danh mục
- **Size giày** → CHỈ danh mục giày
- **Size áo** → CHỈ danh mục áo
- **Size quần** → CHỈ danh mục quần
- **Chất liệu giày** → CHỈ giày
- **Chất liệu vải** → CHỈ áo và quần
- **Công nghệ đế** → CHỈ giày
- **Loại đế bóng đá** → CHỈ giày bóng đá
- **Giới tính** → Tất cả
- **Kiểu áo** → CHỈ áo
- **Kiểu quần** → CHỈ quần

✅ **5 nhà cung cấp**

✅ **6 users:** 1 Admin, 3 Customers (có địa chỉ + SĐT), 1 Sales, 1 Warehouse

**Kết quả mong đợi:**

- ✅ Database reset thành công
- ✅ Không có lỗi gán thuộc tính sai danh mục
- ✅ Giày KHÔNG có Size áo/quần
- ✅ Áo KHÔNG có Size giày/quần
- ✅ Quần KHÔNG có Size giày/áo

---

### Bước 1.1: Đăng nhập Admin

**Use Case:** UC-C11  
**Mục đích:** Xác thực quyền admin để truy cập hệ thống

**Các bước test:**

1. Truy cập `/login`
2. Nhập email admin: `admin@sporthub.com`
3. Nhập password: `admin123`
4. Click "Đăng nhập"
5. Kiểm tra redirect về `/admin`
6. Kiểm tra sidebar hiển thị đầy đủ menu admin

**Kết quả mong đợi:**

- ✅ Đăng nhập thành công
- ✅ Hiển thị trang Admin Dashboard
- ✅ Session được lưu

---

### Bước 1.2 đến 1.6: TẠO DỮ LIỆU THỦ CÔNG (Optional - Đã seed tự động)

> **💡 Bỏ qua các bước này nếu đã chạy `npm run db:reset`**

Nếu bạn muốn tạo thêm dữ liệu hoặc tùy chỉnh, có thể thực hiện các bước sau qua Admin UI:

<details>
<summary>Click để xem chi tiết các bước tạo thủ công</summary>

### Bước 1.2: Tạo Danh Mục Sản Phẩm (Đã seed)

**Use Case:** UC-A06 (Categories)  
**Mục đích:** Tạo cấu trúc phân loại sản phẩm

**Các bước test:**

1. Vào menu `Sản phẩm` → `Cấu hình sản phẩm`
2. Chọn tab "Danh mục"
3. Tạo **Danh mục cha:**
   - Tên: "Giày bóng đá"
   - Upload ảnh danh mục
   - Slug tự động: `giay-bong-da`
   - Click "Lưu"
4. Tạo **Danh mục con:**
   - Tên: "Giày sân cỏ tự nhiên"
   - Danh mục cha: "Giày bóng đá"
   - Upload ảnh
   - Click "Lưu"
5. Lặp lại để tạo thêm:
   - "Giày sân cỏ nhân tạo" (con của Giày bóng đá)
   - "Quần áo thể thao" (danh mục cha)
   - "Áo đấu" (con của Quần áo thể thao)
   - "Phụ kiện" (danh mục cha)

**Kết quả mong đợi:**

- ✅ Tạo được ít nhất 3 danh mục cha
- ✅ Mỗi danh mục cha có ít nhất 2 danh mục con
- ✅ Slug được tạo tự động
- ✅ Ảnh danh mục hiển thị đúng
- ✅ Có thể tìm kiếm danh mục

---

### Bước 1.3: Tạo Thương Hiệu

**Use Case:** UC-A06 (Brands)  
**Mục đích:** Tạo danh sách thương hiệu sản phẩm

**Các bước test:**

1. Vào tab "Thương hiệu" trong Cấu hình sản phẩm
2. Click "Thêm thương hiệu"
3. Tạo các thương hiệu:
   - **Adidas:**
     - Tên: "Adidas"
     - Slug: `adidas`
     - Logo: Upload ảnh logo
     - Mô tả: "Thương hiệu thể thao hàng đầu thế giới"
     - Website: `https://www.adidas.com.vn`
   - **Nike:**
     - Tên: "Nike"
     - Logo: Upload
     - Mô tả: "Just Do It"
   - **Puma, Mizuno, Kamito** (tương tự)

**Kết quả mong đợi:**

- ✅ Tạo được ít nhất 5 thương hiệu
- ✅ Logo hiển thị đúng
- ✅ Có thể chỉnh sửa, xóa thương hiệu
- ✅ Tìm kiếm hoạt động

---

### Bước 1.4: Tạo Thuộc Tính Sản Phẩm

**Use Case:** UC-A06 (Attributes)  
**Mục đích:** Tạo các thuộc tính động cho sản phẩm

**Các bước test:**

1. Vào tab "Thuộc tính" trong Cấu hình sản phẩm
2. Tạo các thuộc tính:

   **Loại đinh (SELECT):**

   - Tên: "Loại đinh"
   - Loại: SELECT
   - Giá trị: "TF, FG, AG, IC, Đinh nhỏ"
   - Gán cho danh mục: "Giày sân cỏ tự nhiên", "Giày sân cỏ nhân tạo"

   **Dòng sản phẩm (TEXT):**

   - Tên: "Dòng sản phẩm"
   - Loại: TEXT
   - Gán cho: Tất cả danh mục giày

   **CLB (SELECT):**

   - Tên: "Câu lạc bộ"
   - Loại: SELECT
   - Giá trị: "Manchester United, Real Madrid, Barcelona, PSG, Liverpool"
   - Gán cho: "Áo đấu"

   **Chất liệu (TEXT):**

   - Tên: "Chất liệu"
   - Loại: TEXT
   - Gán cho: "Quần áo thể thao"

**Kết quả mong đợi:**

- ✅ Tạo được ít nhất 5 thuộc tính
- ✅ Thuộc tính được gán đúng danh mục
- ✅ SELECT hiển thị dropdown values
- ✅ TEXT cho phép nhập tự do

---

### Bước 1.5: Tạo Bảng Size

**Use Case:** UC-A05  
**Mục đích:** Tạo hướng dẫn size cho sản phẩm

**Các bước test:**

1. Vào menu `Sản phẩm` → `Bảng size`
2. Click "Tạo bảng size mới"
3. Tạo bảng size giày:
   - Tên: "Bảng size giày Adidas"
   - Mô tả: "Hướng dẫn chọn size giày Adidas"
   - Thêm cột: "Size US", "Size EU", "Size UK", "Chiều dài chân (cm)"
   - Thêm hàng dữ liệu:
     - 7 | 40 | 6.5 | 25
     - 7.5 | 40.5 | 7 | 25.5
     - 8 | 41 | 7.5 | 26
     - ...
4. Tạo thêm bảng size áo đấu

**Kết quả mong đợi:**

- ✅ Bảng size hiển thị đẹp dạng table
- ✅ Có thể thêm/xóa cột động
- ✅ Có thể thêm/xóa hàng
- ✅ Lưu và tìm kiếm bảng size

---

### Bước 1.6: Tạo Nhà Cung Cấp

**Use Case:** UC-A11  
**Mục đích:** Tạo danh sách nhà cung cấp để nhập hàng

**Các bước test:**

1. Vào menu `Quản lý kho` → `Nhà cung cấp`
2. Click "Thêm nhà cung cấp"
3. Tạo các nhà cung cấp:

   **Adidas Vietnam:**

   - Tên: "Adidas Vietnam"
   - Mã số thuế: "0123456789"
   - Người liên hệ: "Nguyễn Văn A"
   - SĐT: "0901234567"
   - Email: "contact@adidas.vn"
   - Địa chỉ: "123 Nguyễn Huệ, Q1, TP.HCM"
   - Trạng thái: ACTIVE

   **Công ty TNHH ABC** (tương tự)

**Kết quả mong đợi:**

- ✅ Tạo được ít nhất 3 nhà cung cấp
- ✅ Có thể toggle ACTIVE/INACTIVE
- ✅ Tìm kiếm theo tên, SĐT
- ✅ Chỉnh sửa thông tin

---

## 📦 GIAI ĐOẠN 2: QUẢN LÝ SẢN PHẨM

### Bước 2.1: Tạo Sản Phẩm với Variants

**Use Case:** UC-A04  
**Mục đích:** Tạo sản phẩm hoàn chỉnh với các biến thể

**Các bước test:**

1. Vào menu `Sản phẩm` → `Quản lý sản phẩm`
2. Click "Thêm sản phẩm"
3. Tạo sản phẩm mẫu:

   **Thông tin cơ bản:**

   - Tên: "Giày Adidas Predator Elite FG"
   - Danh mục: "Giày Bóng Đá"
   - Thương hiệu: "Adidas"
   - Mô tả: Mô tả chi tiết sản phẩm

   **Hình ảnh:**

   - Thumbnail: Upload ảnh chính
   - Gallery: Upload 3-5 ảnh

   **Giá:**

   - Giá gốc: 3.500.000đ
   - Giá khuyến mãi: 2.990.000đ

   **Thuộc tính (CHỈ hiển thị thuộc tính phù hợp với Giày Bóng Đá):**

   - Màu sắc: Đen
   - Size giày: 40, 41, 42, 43
   - Chất liệu giày: Da tổng hợp
   - Công nghệ đế: Adidas Boost
   - Loại đế bóng đá: FG (Sân cỏ tự nhiên)
   - Giới tính: Nam

   > **✅ KIỂM TRA QUAN TRỌNG:** Danh mục "Giày Bóng Đá" KHÔNG hiển thị Size áo, Size quần, Kiểu áo, Kiểu quần

   **Bảng size:** Chọn "Bảng Size Giày"

   **Tùy chọn:**

   - ✅ Miễn phí ship
   - ✅ Cho phép đổi/trả

   **Tạo Variants:**

   - Size 40 + Màu Đen: Giá điều chỉnh 0đ, Tồn kho 10
   - Size 41 + Màu Đen: Giá điều chỉnh 0đ, Tồn kho 15
   - Size 42 + Màu Trắng: Giá điều chỉnh 50.000đ, Tồn kho 12
   - Size 43 + Màu Trắng: Giá điều chỉnh 50.000đ, Tồn kho 8

4. Click "Lưu sản phẩm"
5. **Tạo thêm sản phẩm áo để test:**
   - Tên: "Áo Bóng Đá Nike Dri-FIT"
   - Danh mục: "Áo Bóng Đá"
   - Thuộc tính CHỈ hiển thị: Màu sắc, Size áo, Chất liệu vải, Giới tính, Kiểu áo
   - **KHÔNG hiển thị:** Size giày, Size quần, Chất liệu giày, Công nghệ đế, Loại đế bóng đá
6. Lặp lại để tạo thêm 5-10 sản phẩm khác nhau

   - Mô tả: Mô tả chi tiết sản phẩm

   **Hình ảnh:**

   - Thumbnail: Upload ảnh chính
   - Gallery: Upload 3-5 ảnh

   **Giá:**

   - Giá gốc: 3.500.000đ
   - Giá khuyến mãi: 2.990.000đ

   **Thuộc tính (CHỈ hiển thị thuộc tính phù hợp với Giày Bóng Đá):**

   - Màu sắc: Đen
   - Size giày: 40, 41, 42, 43
   - Chất liệu giày: Da tổng hợp
   - Công nghệ đế: Adidas Boost
   - Loại đế bóng đá: FG (Sân cỏ tự nhiên)
   - Giới tính: Nam

   > **✅ KIỂM TRA QUAN TRỌNG:** Danh mục "Giày Bóng Đá" KHÔNG hiển thị Size áo, Size quần, Kiểu áo, Kiểu quần

   **Bảng size:** Chọn "Bảng Size Giày"

   **Tùy chọn:**

   - ✅ Miễn phí ship
   - ✅ Cho phép đổi/trả

   **Tạo Variants:**

   - Size 40 + Màu Đen: Giá điều chỉnh 0đ, Tồn kho 10
   - Size 41 + Màu Đen: Giá điều chỉnh 0đ, Tồn kho 15
   - Size 42 + Màu Trắng: Giá điều chỉnh 50.000đ, Tồn kho 12
   - Size 43 + Màu Trắng: Giá điều chỉnh 50.000đ, Tồn kho 8

7. Click "Lưu sản phẩm"
8. **Tạo thêm sản phẩm áo để test:**
   - Tên: "Áo Bóng Đá Nike Dri-FIT"
   - Danh mục: "Áo Bóng Đá"
   - Thuộc tính CHỈ hiển thị: Màu sắc, Size áo, Chất liệu vải, Giới tính, Kiểu áo
   - **KHÔNG hiển thị:** Size giày, Size quần, Chất liệu giày, Công nghệ đế, Loại đế bóng đá
9. Lặp lại để tạo thêm 5-10 sản phẩm khác nhau

**Kết quả mong đợi:**

- ✅ Tạo được sản phẩm với đầy đủ thông tin
- ✅ SKU tự động được tạo cho mỗi variant
- ✅ Gallery hiển thị đẹp
- ✅ Variants hiển thị trong bảng
- ✅ Có thể chỉnh sửa sản phẩm
- ✅ Xóa mềm chuyển INACTIVE

---

### Bước 2.2: Kiểm Tra Hiển Thị Sản Phẩm

**Use Case:** UC-C01, UC-C02  
**Mục đích:** Kiểm tra sản phẩm hiển thị đúng cho customer

**Các bước test:**

1. Logout khỏi admin
2. Truy cập trang chủ `/`
3. Kiểm tra:
   - Sản phẩm mới về hiển thị (4 sản phẩm)
   - Danh mục nổi bật (chỉ danh mục cha)
4. Vào trang danh sách sản phẩm
5. Test bộ lọc:
   - Lọc theo danh mục
   - Lọc theo thương hiệu
   - Lọc theo khoảng giá
   - Lọc theo màu sắc
   - Lọc theo thuộc tính động
6. Test tìm kiếm

**Kết quả mong đợi:**

- ✅ Chỉ hiển thị sản phẩm ACTIVE
- ✅ Chỉ hiển thị variant còn hàng
- ✅ Bộ lọc hoạt động đúng
- ✅ Tìm kiếm loại bỏ dấu tiếng Việt
- ✅ ProductCard hiển thị đẹp

---

## 🏭 GIAI ĐOẠN 3: QUẢN LÝ KHO

### Bước 3.1: Nhập Kho

**Use Case:** UC-A07  
**Mục đích:** Nhập hàng từ nhà cung cấp và cập nhật tồn kho

**Các bước test:**

1. Đăng nhập admin
2. Vào `Quản lý kho` → `Nhập kho`
3. Click "Lập phiếu mới"
4. Chọn nhà cung cấp: "Adidas Vietnam"
5. Click "Thêm sản phẩm"
6. Tìm và chọn sản phẩm "Giày Adidas Predator Elite FG"
7. Chọn variant: Size 40 - Màu Đen
8. Nhập:
   - Số lượng: 50
   - Đơn giá vốn: 1.800.000đ
   - Ghi chú: "Đợt nhập tháng 1/2026"
9. Thêm thêm 2-3 sản phẩm khác
10. Kiểm tra tổng tiền
11. Click "Xác nhận nhập kho"

**Kết quả mong đợi:**

- ✅ Tạo phiếu nhập với mã `IE-{timestamp}`
- ✅ Tồn kho variant được cộng thêm 50
- ✅ Hiển thị trong danh sách phiếu nhập
- ✅ Xem chi tiết phiếu nhập đầy đủ

---

### Bước 3.2: Kiểm Tra Báo Cáo Tồn Kho

**Use Case:** UC-A10  
**Mục đích:** Xem tổng quan tồn kho sau khi nhập

**Các bước test:**

1. Vào `Quản lý kho` → `Báo cáo tồn kho`
2. Kiểm tra KPI:
   - Tổng SKU
   - Giá trị tồn kho
   - Sản phẩm hết hàng
3. Test bộ lọc:
   - Theo danh mục
   - Theo thương hiệu
   - Trạng thái tồn kho (Sắp hết, Tồn nhiều)
4. Kiểm tra chi tiết từng variant

**Kết quả mong đợi:**

- ✅ KPI tính toán chính xác
- ✅ Giá vốn trung bình đúng
- ✅ Giá trị tồn = tồn kho × giá vốn
- ✅ Bộ lọc hoạt động

---

### Bước 3.3: Kiểm Kê Kho (Optional)

**Use Case:** UC-A09  
**Mục đích:** Điều chỉnh tồn kho thực tế

**Các bước test:**

1. Vào `Quản lý kho` → `Kiểm kê`
2. Tạo phiếu kiểm kê mới
3. Chọn variant cần kiểm kê
4. Nhập số lượng thực tế (khác với hệ thống)
5. Ghi chú lý do chênh lệch
6. Xác nhận điều chỉnh

**Kết quả mong đợi:**

- ✅ Tạo phiếu `STK-{timestamp}`
- ✅ Tồn kho được cập nhật theo thực tế
- ✅ Hiển thị variance
- ✅ Lưu log điều chỉnh

---

## 🛒 GIAI ĐOẠN 4: LUỒNG MUA HÀNG (CUSTOMER)

### Bước 4.1: Đăng Ký Tài Khoản

**Use Case:** UC-C10  
**Mục đích:** Tạo tài khoản customer

**Các bước test:**

1. Logout admin
2. Vào `/register`
3. Nhập thông tin:
   - Email: `customer1@test.com`
   - Tên đầy đủ: "Nguyễn Văn Khách"
   - SĐT: `0901234567`
   - Mật khẩu: `123456`
4. Click "Đăng ký"

**Kết quả mong đợi:**

- ✅ Tài khoản được tạo với role CUSTOMER
- ✅ Tự động đăng nhập
- ✅ Redirect về trang chủ
- ✅ Avatar mặc định được tạo

---

### Bước 4.2: Xem Chi Tiết Sản Phẩm

**Use Case:** UC-C03  
**Mục đích:** Kiểm tra trang chi tiết sản phẩm

**Các bước test:**

1. Click vào sản phẩm "Giày Adidas Predator Elite FG"
2. Kiểm tra hiển thị:
   - Gallery ảnh với zoom
   - Tên, giá (gạch giá cũ nếu có sale)
   - Mô tả sản phẩm
   - Badge: "Miễn phí ship", "Cho phép đổi/trả"
3. Chọn màu: Đen
4. Chọn size: 40
5. Kiểm tra tồn kho hiển thị
6. Nhập số lượng: 2
7. Click "Xem bảng size"
8. Kiểm tra thông số kỹ thuật (ProductAttribute)
9. Scroll xuống xem phần review (nếu có)
10. Xem sản phẩm liên quan

**Kết quả mong đợi:**

- ✅ Gallery đẹp, zoom được
- ✅ Chỉ hiển thị size/màu còn hàng
- ✅ Validate số lượng <= tồn kho
- ✅ Bảng size hiển thị modal
- ✅ Thuộc tính hiển thị đúng

---

### Bước 4.3: Thêm Vào Giỏ Hàng

**Use Case:** UC-C05  
**Mục đích:** Test giỏ hàng

**Các bước test:**

1. Click "Thêm vào giỏ hàng"
2. Kiểm tra toast thông báo
3. Kiểm tra badge số lượng trên icon giỏ hàng
4. Click icon giỏ hàng → mở CartDrawer
5. Kiểm tra CartDrawer:
   - Thumbnail sản phẩm
   - Tên, màu, size
   - Giá, số lượng
   - Tổng tiền
6. Tăng/giảm số lượng
7. Thêm thêm 2-3 sản phẩm khác vào giỏ
8. Vào trang `/cart`
9. Kiểm tra CartPage:
   - Hiển thị dạng bảng
   - Cập nhật số lượng
   - Xóa item
   - Kiểm tra item không hợp lệ (nếu hết hàng)

**Kết quả mong đợi:**

- ✅ Toast hiển thị thành công
- ✅ Badge cập nhật đúng
- ✅ CartDrawer hiển thị đầy đủ
- ✅ Tăng/giảm số lượng validate tồn kho
- ✅ Xóa item hoạt động
- ✅ Tổng tiền tính đúng

---

### Bước 4.4: Quản Lý Sổ Địa Chỉ

**Use Case:** UC-C13  
**Mục đích:** Tạo địa chỉ giao hàng

**Các bước test:**

1. Vào `/profile`
2. Chọn tab "Sổ địa chỉ"
3. Click "Thêm địa chỉ"
4. Nhập:
   - Tên người nhận: "Nguyễn Văn Khách"
   - SĐT: `0901234567`
   - Địa chỉ: "123 Lê Lợi, P.Bến Thành, Q1, TP.HCM"
5. Lưu địa chỉ
6. Thêm 1-2 địa chỉ nữa

**Kết quả mong đợi:**

- ✅ Địa chỉ được lưu
- ✅ Có thể chỉnh sửa
- ✅ Có thể xóa địa chỉ

---

### Bước 4.5: Thanh Toán COD

**Use Case:** UC-C06  
**Mục đích:** Test thanh toán ship COD

**Các bước test:**

1. Vào giỏ hàng, click "Thanh toán"
2. Trang checkout:
   - Chọn địa chỉ từ sổ địa chỉ
   - Hoặc nhập thông tin mới
   - Chọn thành phố: TP.HCM
   - Ghi chú đơn hàng (optional)
3. Kiểm tra tính phí ship:
   - Nếu tổng > 1tr → Free
   - Nếu tất cả SP có freeShipping → Free
   - Ngược lại: 20k (HCM)
4. Chọn phương thức thanh toán: COD
5. Click "Đặt hàng"
6. Nhập OTP từ email (kiểm tra email)
7. Confirm OTP
8. Kiểm tra modal thành công

**Kết quả mong đợi:**

- ✅ Địa chỉ được fill tự động
- ✅ Phí ship tính đúng logic
- ✅ OTP gửi về email
- ✅ Countdown 5 phút
- ✅ Đơn hàng được tạo với status PENDING_CONFIRMATION
- ✅ Giỏ hàng được xóa
- ✅ Modal hiển thị mã đơn
- ✅ Có thể copy mã đơn

---

### Bước 4.6: Thanh Toán VNPay (Optional)

**Use Case:** UC-C06  
**Mục đích:** Test thanh toán qua VNPay

**Các bước test:**

1. Thêm sản phẩm vào giỏ
2. Vào checkout
3. Chọn phương thức: VNPay
4. Click "Đặt hàng"
5. Kiểm tra redirect sang VNPay
6. Thanh toán trên VNPay (test sandbox)
7. Kiểm tra callback về hệ thống
8. Kiểm tra status đơn hàng

**Kết quả mong đợi:**

- ✅ Redirect đúng sang VNPay
- ✅ Callback xử lý success/fail
- ✅ Status: PENDING_PAYMENT → PENDING_CONFIRMATION
- ✅ Thông tin thanh toán được lưu

---

### Bước 4.7: Tra Cứu Đơn Hàng (Guest)

**Use Case:** UC-C07  
**Mục đích:** Test tra cứu không cần đăng nhập

**Các bước test:**

1. Logout
2. Vào `/order-tracking`
3. Nhập:
   - Mã đơn hàng: `ORD-xxxxx`
   - Số điện thoại: `0901234567`
4. Click "Tra cứu"
5. Kiểm tra kết quả:
   - Thông tin đơn hàng
   - Trạng thái với màu sắc
   - Timeline trạng thái
   - Danh sách sản phẩm
   - Thông tin giao hàng

**Kết quả mong đợi:**

- ✅ Tìm được đơn hàng
- ✅ Hiển thị đầy đủ thông tin
- ✅ Timeline đẹp
- ✅ Có nút xem chi tiết

---

### Bước 4.8: Xem Lịch Sử Đơn Hàng

**Use Case:** UC-C08  
**Mục đích:** Test xem đơn hàng khi đã đăng nhập

**Các bước test:**

1. Đăng nhập lại customer
2. Vào `/profile`
3. Chọn tab "Lịch sử mua hàng"
4. Kiểm tra danh sách đơn
5. Test bộ lọc:
   - Tất cả
   - Chờ xác nhận
   - Đang xử lý
   - Hoàn thành
6. Tìm kiếm theo mã đơn
7. Click vào 1 đơn hàng

**Kết quả mong đợi:**

- ✅ Hiển thị tất cả đơn của user
- ✅ Mới nhất lên đầu
- ✅ Bộ lọc hoạt động
- ✅ Tìm kiếm đúng
- ✅ Click vào → OrderDetailPage

---

## 📋 GIAI ĐOẠN 5: XỬ LÝ ĐƠN HÀNG (ADMIN)

### Bước 5.1: Quản Lý Đơn Hàng

**Use Case:** UC-A02  
**Mục đích:** Admin xử lý đơn hàng

**Các bước test:**

1. Đăng nhập admin
2. Vào `Kinh doanh` → `Quản lý đơn hàng`
3. Kiểm tra danh sách đơn
4. Test bộ lọc:
   - Theo trạng thái (Mới, Xử lý, Hoàn tất, Hỗ trợ)
   - Theo phương thức thanh toán
   - Theo thời gian
5. Tìm kiếm đơn hàng
6. Click "Xác nhận nhanh" đơn PENDING_CONFIRMATION
7. Xem chi tiết đơn hàng trong modal
8. Cập nhật trạng thái theo workflow:
   - PENDING_CONFIRMATION → PACKING
   - PACKING → SHIPPING (tự động tạo phiếu xuất kho)
   - SHIPPING → COMPLETED

**Kết quả mong đợi:**

- ✅ Danh sách hiển thị đầy đủ
- ✅ Bộ lọc chính xác
- ✅ Xác nhận nhanh hoạt động
- ✅ Modal chi tiết đầy đủ thông tin
- ✅ Workflow chuyển trạng thái đúng
- ✅ Tự động tạo phiếu xuất khi SHIPPING
- ✅ Tự động trừ tồn kho

---

### Bước 5.2: Kiểm Tra Xuất Kho Tự Động

**Use Case:** UC-A08  
**Mục đích:** Xác nhận xuất kho tự động

**Các bước test:**

1. Vào `Quản lý kho` → `Xuất kho`
2. Tìm phiếu xuất mới tạo (mã `SI-xxx`)
3. Xem chi tiết phiếu xuất
4. Kiểm tra:
   - Ngày xuất
   - Khách hàng
   - Danh sách SKU
   - Số lượng xuất
5. Vào `Báo cáo tồn kho`
6. Kiểm tra tồn kho đã giảm

**Kết quả mong đợi:**

- ✅ Phiếu xuất được tạo tự động
- ✅ Thông tin chính xác
- ✅ Tồn kho giảm đúng số lượng

---

### Bước 5.3: In Phiếu Đơn Hàng

**Use Case:** UC-A02  
**Mục đích:** Test in phiếu

**Các bước test:**

1. Vào chi tiết đơn hàng
2. Click "In phiếu"
3. Kiểm tra PDF/print preview

**Kết quả mong đợi:**

- ✅ Hiển thị print view
- ✅ Đầy đủ thông tin
- ✅ Format đẹp

---

## 🔄 GIAI ĐOẠN 6: ĐỔI/TRẢ HÀNG

### Bước 6.1: Customer Yêu Cầu Đổi/Trả

**Use Case:** UC-C09  
**Mục đích:** Test tạo yêu cầu đổi/trả

**Điều kiện:** Đơn hàng đã COMPLETED

**Các bước test:**

1. Admin chuyển đơn hàng sang COMPLETED
2. Đăng nhập customer
3. Vào chi tiết đơn hàng
4. Click "Yêu cầu đổi/trả"
5. Test **REFUND** (hoàn tiền):
   - Chọn sản phẩm cần trả
   - Chọn loại: Hoàn tiền
   - Lý do: "Sản phẩm bị lỗi"
   - Upload ảnh chứng minh (2-3 ảnh)
   - Nhập thông tin ngân hàng:
     - Tên ngân hàng: "Vietcombank"
     - Số tài khoản: "1234567890"
     - Chủ tài khoản: "Nguyễn Văn Khách"
   - Gửi yêu cầu
6. Tạo yêu cầu **EXCHANGE** (đổi hàng):
   - Chọn sản phẩm khác
   - Chọn loại: Đổi hàng
   - Lý do: "Đổi size"
   - Upload ảnh
   - Chọn size/màu mới (kiểm tra tồn kho)
   - Gửi yêu cầu

**Kết quả mong đợi:**

- ✅ Chỉ hiển thị cho đơn COMPLETED
- ✅ Upload ảnh được (tối đa 5)
- ✅ Validate thông tin ngân hàng (REFUND)
- ✅ Validate tồn kho variant mới (EXCHANGE)
- ✅ Tạo ReturnRequest thành công
- ✅ Status đơn hàng → RETURN_REQUESTED

---

### Bước 6.2: Admin Xử Lý Yêu Cầu Đổi/Trả

**Use Case:** UC-A03  
**Mục đích:** Test duyệt/từ chối yêu cầu

**Các bước test:**

1. Đăng nhập admin
2. Vào `Kinh doanh` → `Yêu cầu đổi/trả`
3. Test bộ lọc: Pending, Approved, All
4. Tìm kiếm yêu cầu
5. Click xem chi tiết yêu cầu REFUND
6. Kiểm tra:
   - Thông tin khách hàng
   - Sản phẩm đổi/trả
   - Lý do, ảnh chứng minh
   - Thông tin ngân hàng
7. **Phê duyệt REFUND:**
   - Nhập số tiền hoàn: 2.990.000đ
   - Ghi chú admin: "Đã chuyển khoản"
   - Click "Phê duyệt"
8. Xem chi tiết yêu cầu EXCHANGE
9. Kiểm tra tồn kho variant mới
10. **Phê duyệt EXCHANGE:**
    - Xác nhận variant mới
    - Ghi chú
    - Click "Phê duyệt"
11. Test **từ chối yêu cầu:**
    - Chọn 1 yêu cầu
    - Nhập lý do từ chối
    - Click "Từ chối"

**Kết quả mong đợi:**

- ✅ Danh sách yêu cầu đầy đủ
- ✅ Bộ lọc, tìm kiếm chính xác
- ✅ Chi tiết yêu cầu đầy đủ
- ✅ REFUND: Chuyển OrderItem → REFUNDED
- ✅ EXCHANGE: Tạo SKU mới, chuyển → EXCHANGED
- ✅ REJECT: Chuyển → REJECTED
- ✅ Ghi chú admin được lưu

---

### Bước 6.3: Kiểm Tra Trạng Thái OrderItem

**Use Case:** UC-C09  
**Mục đích:** Xác nhận trạng thái được cập nhật

**Các bước test:**

1. Đăng nhập customer
2. Vào chi tiết đơn hàng
3. Kiểm tra trạng thái OrderItem:
   - Item đã REFUNDED: Hiển thị "Đã hoàn tiền"
   - Item đã EXCHANGED: Hiển thị "Đã đổi hàng" + SKU mới

**Kết quả mong đợi:**

- ✅ Trạng thái hiển thị đúng
- ✅ Có thể thấy SKU mới (EXCHANGE)

---

## ⭐ GIAI ĐOẠN 7: ĐÁNH GIÁ SẢN PHẨM

### Bước 7.1: Customer Đánh Giá

**Use Case:** UC-C04  
**Mục đích:** Test tính năng review

**Điều kiện:** Đơn hàng COMPLETED

**Các bước test:**

1. Đăng nhập customer
2. Vào chi tiết đơn hàng COMPLETED
3. Click "Đánh giá" trên 1 sản phẩm
4. Modal đánh giá:
   - Chọn số sao: 5 ⭐
   - Nhập nội dung: "Sản phẩm rất tốt, giao hàng nhanh"
   - Upload ảnh review (2-3 ảnh)
5. Click "Gửi đánh giá"
6. Vào trang chi tiết sản phẩm
7. Kiểm tra review hiển thị

**Kết quả mong đợi:**

- ✅ Chỉ hiển thị cho sản phẩm đã mua
- ✅ Bắt buộc chọn rating
- ✅ Upload ảnh được (max 5)
- ✅ Review được lưu
- ✅ Hiển thị trên trang sản phẩm
- ✅ Chỉ review 1 lần/sản phẩm

---

## 📊 GIAI ĐOẠN 8: BÁO CÁO & PHÂN TÍCH

### Bước 8.1: Dashboard Tổng Quan

**Use Case:** UC-A01  
**Mục đích:** Kiểm tra dashboard admin

**Các bước test:**

1. Đăng nhập admin
2. Vào trang Dashboard
3. Kiểm tra StatCard:
   - Doanh thu ngày
   - Đơn hàng mới
   - Khách hàng mới
   - Sản phẩm hết hàng
4. Kiểm tra biểu đồ doanh thu 7 ngày
5. Kiểm tra trend tăng/giảm

**Kết quả mong đợi:**

- ✅ KPI tính toán chính xác
- ✅ Biểu đồ hiển thị đẹp
- ✅ Trend so sánh đúng
- ✅ Dữ liệu real-time

---

### Bước 8.2: Báo Cáo Doanh Thu

**Use Case:** UC-A12  
**Mục đích:** Test báo cáo chi tiết

**Các bước test:**

1. Vào `Báo cáo` → `Báo cáo doanh thu`
2. Test bộ lọc thời gian:
   - Hôm nay
   - 7 ngày
   - Tháng này
   - Năm nay
3. Kiểm tra thống kê:
   - Tổng doanh thu
   - Tổng đơn hàng
   - Tổng khách hàng
   - Tỷ lệ hoàn trả
4. Kiểm tra biểu đồ:
   - Doanh thu theo thời gian (Area Chart)
   - Phân tích theo PT thanh toán (Pie Chart)
   - Top sản phẩm bán chạy (Bar Chart)
   - Top danh mục (Composed Chart)

**Kết quả mong đợi:**

- ✅ Bộ lọc hoạt động
- ✅ Số liệu chính xác
- ✅ Biểu đồ đẹp, dễ đọc
- ✅ Trend hiển thị

---

## ⚙️ GIAI ĐOẠN 9: CẤU HÌNH HỆ THỐNG

### Bước 9.1: Cấu Hình Website

**Use Case:** UC-A13  
**Mục đích:** Test quản lý cấu hình

**Các bước test:**

1. Vào `Cấu hình` → `Cấu hình Website`
2. Tab "Cấu hình hệ thống":
   - Sửa tên website
   - Email liên hệ
   - SĐT, địa chỉ
   - Meta SEO
   - OTP timeout
   - Click "Lưu"
3. Tab "Quản lý Banner":
   - Tạo banner mới
   - Upload ảnh
   - Nhập tiêu đề, mô tả, link
   - Thứ tự hiển thị
   - Bật/tắt banner
   - Xóa banner

**Kết quả mong đợi:**

- ✅ Cấu hình được lưu
- ✅ Banner hiển thị trên trang chủ
- ✅ Sắp xếp thứ tự
- ✅ Toggle active/inactive

---

### Bước 9.2: Quản Lý Nhân Viên

**Use Case:** UC-A14  
**Mục đích:** Test CRUD nhân viên

**Các bước test:**

1. Vào `Cấu hình` → `Quản lý nhân viên`
2. Bộ lọc theo role: ADMIN, STAFF, CUSTOMER
3. Tìm kiếm user
4. Tạo tài khoản staff:
   - Email: `staff1@sporthub.com`
   - Tên: "Nguyễn Văn Staff"
   - SĐT: `0909999999`
   - Role: STAFF
   - Upload avatar
   - Click "Tạo"
5. Đặt lại mật khẩu
6. Khóa/mở khóa tài khoản

**Kết quả mong đợi:**

- ✅ Tạo được tài khoản STAFF
- ✅ Mật khẩu mặc định: "123456"
- ✅ Có thể reset password
- ✅ Toggle active/inactive

---

### Bước 9.3: Nhật Ký Hệ Thống

**Use Case:** UC-A15  
**Mục đích:** Test audit logs

**Các bước test:**

1. Vào `Cấu hình` → `Nhật ký hệ thống`
2. Kiểm tra danh sách log
3. Bộ lọc theo nhân viên
4. Xem chi tiết log:
   - Thời gian
   - Nhân viên
   - Hành động (CREATE, UPDATE, DELETE)
   - Entity (Product, Order...)
   - Metadata

**Kết quả mong đợi:**

- ✅ Log được tạo tự động
- ✅ Thông tin đầy đủ
- ✅ Bộ lọc hoạt động
- ✅ Chi tiết metadata

---

## 🎯 GIAI ĐOẠN 10: KIỂM TRA TỔNG HỢP

### Bước 10.1: Kiểm Tra Responsive

**Mục đích:** Test trên các thiết bị

**Các bước test:**

1. Test trên Desktop (1920px)
2. Test trên Tablet (768px)
3. Test trên Mobile (375px)
4. Kiểm tra:
   - Menu navigation
   - Sidebar filter
   - Product grid
   - Cart drawer
   - Admin tables

**Kết quả mong đợi:**

- ✅ Responsive tốt trên mọi thiết bị
- ✅ Mobile menu hoạt động
- ✅ Sidebar có thể thu gọn

---

### Bước 10.2: Kiểm Tra Performance

**Mục đích:** Test hiệu năng

**Các bước test:**

1. Test tốc độ load trang
2. Test tìm kiếm sản phẩm (nhiều kết quả)
3. Test bộ lọc nhiều điều kiện
4. Test phân trang
5. Test upload ảnh

**Kết quả mong đợi:**

- ✅ Load nhanh
- ✅ Tìm kiếm real-time
- ✅ Bộ lọc mượt mà
- ✅ Upload ảnh nhanh

---

### Bước 10.3: Kiểm Tra Security

**Mục đích:** Test bảo mật

**Các bước test:**

1. Test role-based access:
   - CUSTOMER không vào được `/admin`
   - STAFF không thực hiện được thao tác Admin-only
2. Test session timeout
3. Test XSS, SQL injection (input validation)

**Kết quả mong đợi:**

- ✅ Phân quyền chính xác
- ✅ Redirect về login khi hết session
- ✅ Input được validate

---

## ✅ CHECKLIST TỔNG HỢP

### Dữ liệu cơ bản

- [ ] **Reset database về seed data** (`npm run db:reset`)
- [ ] ✅ 3 danh mục cha, mỗi danh mục có 3 con (Giày, Áo, Quần)
- [ ] ✅ 7 thương hiệu
- [ ] ✅ 3 bảng size
- [ ] ✅ 11 thuộc tính được gán ĐÚNG danh mục
- [ ] ✅ 5 nhà cung cấp
- [ ] ✅ 6 users (1 admin, 3 customers, 1 sales, 1 warehouse)

### Sản phẩm

- [ ] Tạo ít nhất 10 sản phẩm
- [ ] Mỗi sản phẩm có ít nhất 5 variants
- [ ] Upload đầy đủ ảnh (thumbnail + gallery)
- [ ] Gán thuộc tính động
- [ ] Gán bảng size

### Kho hàng

- [ ] Nhập kho ít nhất 3 phiếu
- [ ] Kiểm tra tồn kho sau nhập
- [ ] Test kiểm kê kho (optional)

### Đơn hàng

- [ ] Tạo ít nhất 5 đơn hàng (COD + VNPay)
- [ ] Test các trạng thái đơn hàng
- [ ] Test xuất kho tự động
- [ ] Test hủy đơn

### Đổi/trả

- [ ] Tạo yêu cầu REFUND
- [ ] Tạo yêu cầu EXCHANGE
- [ ] Admin duyệt/từ chối
- [ ] Kiểm tra trạng thái OrderItem

### Review

- [ ] Đánh giá ít nhất 3 sản phẩm
- [ ] Upload ảnh review
- [ ] Kiểm tra hiển thị

### Báo cáo

- [ ] Kiểm tra Dashboard
- [ ] Kiểm tra Báo cáo doanh thu
- [ ] Kiểm tra Báo cáo tồn kho

### Cấu hình

- [ ] Cấu hình website
- [ ] Tạo banner
- [ ] Tạo tài khoản staff
- [ ] Kiểm tra audit logs

---

## 📝 TEMPLATE GHI CHÚ KẾT QUẢ TEST

```markdown
### [Tên Use Case]

**Ngày test:** DD/MM/YYYY
**Người test:** [Tên]

#### Kết quả:

- [ ] PASS
- [ ] FAIL

#### Lỗi phát hiện (nếu có):

1. [Mô tả lỗi 1]
2. [Mô tả lỗi 2]

#### Ghi chú:

[Ghi chú thêm]
```

---

## 🎉 KẾT LUẬN

Sau khi hoàn thành tất cả các bước test theo thứ tự trên, hệ thống SportHub sẽ được đảm bảo:

✅ **Dữ liệu đầy đủ:** Categories, Brands, Attributes, Products, Suppliers  
✅ **Luồng nghiệp vụ hoạt động:** Nhập kho → Bán hàng → Xuất kho → Đổi/trả  
✅ **Tính năng đầy đủ:** Review, Báo cáo, Cấu hình  
✅ **UX/UI tốt:** Responsive, Performance, Security

Hệ thống sẵn sàng cho Production! 🚀

---

**Tài liệu tham khảo:**

- `SYSTEM_USE_CASES.md` - Chi tiết 30 Use Cases
- `DATABASE_SCHEMA.md` - Cấu trúc database
- `SETUP.md` - Hướng dẫn setup

**Liên hệ hỗ trợ:**

- Email: support@sporthub.com
- Hotline: 1900-xxxx

---

_Tài liệu này được tạo tự động bởi GitHub Copilot - Ngày 09/01/2026_
