# Hướng Dẫn Tạo Dữ Liệu Test

## Mục Đích

Tài liệu này hướng dẫn tạo dữ liệu test mới để kiểm tra các chức năng quản trị mà **không trùng lặp** với dữ liệu seed hiện có.

## Lưu Ý Quan Trọng

- ⚠️ **KHÔNG** tạo trùng với data đã có trong hệ thống
- ✅ Làm theo đúng thứ tự từ 1 → 5
- 🔄 Sử dụng script `reset-to-seed.sh` để reset về trạng thái ban đầu

---

## Dữ Liệu Seed Hiện Có (KHÔNG tạo trùng)

### Size Guides có sẵn

1. **Bảng size giày đá bóng Nam (EU/US)** - Dành cho giày
2. **Bảng size áo thể thao chuẩn Á** - Dành cho áo

### Categories có sẵn

1. **Giày Bóng Đá** (slug: `giay-bong-da`)
2. **Áo Thi Đấu** (slug: `ao-thi-dau`)
3. **Găng Tay Thủ Môn** (slug: `gang-tay`)

### Brands có sẵn

1. **Nike** (slug: `nike`)
2. **Adidas** (slug: `adidas`)
3. **Puma** (slug: `puma`)

### Attributes có sẵn

1. **Màu sắc**: Đỏ, Đen, Trắng, Xanh, Vàng, Xám, Cam, Tím, Hồng, Xanh lá
2. **Kích cỡ**: 39, 40, 41, 42, 43, S, M, L, XL, Free, 7, 8, 9, 10, 11
3. **Loại đinh**: TF, FG, AG, IC, SG
4. **Chất liệu**: Da thật, Vải dệt Flyknit, Da tổng hợp, Latex, Polyester tái chế, Cotton, Nylon
5. **Loại cổ**: Cổ cao (Dynamic Fit), Cổ thấp
6. **Công nghệ**: Zoom Air, AEROREADY, Flyknit, Dry-FIT, Grip Control, Futurelight, Ultraweave, Grip3, ACC

### Suppliers có sẵn

1. **Công ty TNHH Nike Việt Nam** - Contact: Mr. David, Phone: 028 3824 1234

---

## Thứ Tự Tạo Dữ Liệu Test

### 1️⃣ Tạo 2 Size Guides

**Vào:** Bảng Size → Nhấn "Tạo bảng size mới"

#### Size Guide 1: Bảng size quần thể thao

```
Tên: Bảng size quần thể thao nam
Mô tả: Phù hợp với quần short, quần dài tập luyện

Columns (3 cột):
- Kích cỡ
- Vòng eo (cm)
- Vòng mông (cm)

Rows (4 hàng):
S  | 68-72  | 88-92
M  | 72-76  | 92-96
L  | 76-80  | 96-100
XL | 80-86  | 100-106
```

#### Size Guide 2: Bảng size giày trẻ em

```
Tên: Bảng size giày thể thao trẻ em
Mô tả: Cho trẻ từ 6-14 tuổi

Columns (3 cột):
- Size EU
- Size US
- Dài chân (cm)

Rows (5 hàng):
32 | 1   | 20.0
33 | 2   | 21.0
34 | 2.5 | 21.5
35 | 3   | 22.0
36 | 4   | 23.0
```

---

### 2️⃣ Tạo 3 Categories (1 cha + 2 con)

**Vào:** Sản phẩm & SKU → Cấu hình sản phẩm → Tab "Danh mục"

#### Category Cha

```
Tên: Phụ Kiện Thể Thao
Slug: phu-kien-the-thao
Image URL: https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400
Mô tả: Các phụ kiện hỗ trợ tập luyện
Danh mục cha: (Không chọn - để trống)
Bảng size: (Không chọn)
```

#### Category Con 1

```
Tên: Bình Nước Thể Thao
Slug: binh-nuoc-the-thao
Image URL: https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400
Mô tả: Bình giữ nhiệt, bình shaker
Danh mục cha: Phụ Kiện Thể Thao ⬅️ Chọn category vừa tạo
Bảng size: (Không chọn)
```

#### Category Con 2

```
Tên: Túi Đựng Đồ Thể Thao
Slug: tui-dung-do-the-thao
Image URL: https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400
Mô tả: Balo, túi xách gym
Danh mục cha: Phụ Kiện Thể Thao ⬅️ Chọn category vừa tạo
Bảng size: (Không chọn)
```

---

### 3️⃣ Tạo 3 Brands

**Vào:** Sản phẩm & SKU → Cấu hình sản phẩm → Tab "Thương hiệu"

#### Brand 1

```
Tên: Mizuno
Slug: mizuno
Logo URL: https://upload.wikimedia.org/wikipedia/commons/e/ea/Mizuno_logo.svg
Quốc gia: Nhật Bản
```

#### Brand 2

```
Tên: Under Armour
Slug: under-armour
Logo URL: https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg
Quốc gia: Mỹ
```

#### Brand 3

```
Tên: Asics
Slug: asics
Logo URL: https://upload.wikimedia.org/wikipedia/commons/4/40/Asics_Logo.svg
Quốc gia: Nhật Bản
```

---

### 4️⃣ Tạo Attributes

**Vào:** Sản phẩm & SKU → Cấu hình sản phẩm → Tab "Thuộc tính"

#### Attribute 1: Màu

```
Tên thuộc tính: Màu
Mã code: mau
Loại: Biến thể (variant) ⬅️ Quan trọng!
Danh mục áp dụng:
  - Phụ Kiện Thể Thao
  - Bình Nước Thể Thao
  - Túi Đựng Đồ Thể Thao
Giá trị (mỗi dòng 1 giá trị):
Đỏ
Xanh
```

#### Attribute 2: Size

```
Tên thuộc tính: Size
Mã code: size
Loại: Biến thể (variant) ⬅️ Quan trọng!
Danh mục áp dụng:
  - Túi Đựng Đồ Thể Thao
Giá trị (mỗi dòng 1 giá trị):
M
L
XL
```

---

### 5️⃣ Tạo 2 Nhà Cung Cấp

**Vào:** Hàng hóa & Kho → Nhà cung cấp → Nhấn "Thêm nhà cung cấp"

#### Supplier 1

```
Tên nhà cung cấp: Công ty Cổ phần Thể thao Vân Anh
Người liên hệ: Bà Nguyễn Thị Vân Anh
Số điện thoại: 0908 123 456
Email: vananh@sportvn.com
Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM
Trạng thái: Đang hoạt động
```

#### Supplier 2

```
Tên nhà cung cấp: Công ty TNHH Thương mại Hoàng Phát
Người liên hệ: Ông Trần Hoàng Phát
Số điện thoại: 028 6271 8899
Email: info@hoangphat.vn
Địa chỉ: 456 Trần Hưng Đạo, Quận 5, TP.HCM
Trạng thái: Đang hoạt động
```

---

## Reset Về Trạng Thái Ban Đầu

Khi muốn xóa toàn bộ dữ liệu test và quay về seed data gốc:

```bash
# Chạy script reset
./reset-to-seed.sh
```

Script sẽ:

1. ✅ Drop toàn bộ database
2. ✅ Tạo lại schema từ migration
3. ✅ Chạy seed data gốc
4. ✅ Khôi phục về trạng thái ban đầu

---

## Kiểm Tra Sau Khi Tạo

### ✅ Checklist

- [ ] 2 Size Guides mới (tổng cộng 4 bảng size)
- [ ] 3 Categories mới: 1 cha + 2 con (tổng cộng 6 categories)
- [ ] 3 Brands mới (tổng cộng 6 brands)
- [ ] 2 Attributes mới: Màu [Đỏ, Xanh], Size [M, L, XL] (tổng cộng 8 attributes)
- [ ] 2 Suppliers mới (tổng cộng 3 suppliers)

### 🔍 Kiểm tra Delete Validation

**Test Category Delete:**

```
❌ Thử xóa "Phụ Kiện Thể Thao" (cha)
→ Phải báo lỗi: "Không thể xóa danh mục có danh mục con"

✅ Xóa "Bình Nước Thể Thao" (con, không có sản phẩm)
→ Phải xóa được
```

**Test Brand Delete:**

```
✅ Xóa "Mizuno" (chưa có sản phẩm)
→ Phải xóa được

❌ Thử xóa "Nike" (có sản phẩm từ seed)
→ Phải báo lỗi: "Không thể xóa thương hiệu đang có sản phẩm"
```

**Test Size Guide Delete:**

```
✅ Xóa bảng size vừa tạo (chưa gán cho category/product)
→ Phải xóa được và UI refresh ngay lập tức
→ SystemLog phải ghi nhận thao tác DELETE
```

---

## Troubleshooting

### Lỗi: "Could not find column..."

- Kiểm tra đã điền đúng tên trường chưa
- Đảm bảo không để trống các trường bắt buộc (name, slug)

### Size Guide không hiển thị khi chọn Category

- Phải tạo Size Guide **trước** rồi mới tạo Category
- Refresh lại trang nếu cần

### Attribute không áp dụng được cho Category

- Kiểm tra đã chọn đúng category trong "Danh mục áp dụng"
- Đảm bảo category đã được tạo trước

### SystemLog lỗi 400 Bad Request

- Đã fix trong phiên bản mới nhất
- Đảm bảo đang dùng code sau khi fix `createSystemLog`

---

## Lưu Ý Bảo Mật

⚠️ **Script reset-to-seed.sh CHỈ dùng trong môi trường DEV**

- ❌ KHÔNG chạy trên production
- ❌ KHÔNG commit file `.env` lên git
- ✅ Luôn backup database trước khi test

---

## Tác Giả & Cập Nhật

- **Phiên bản:** 1.0
- **Ngày tạo:** 07/01/2026
- **Cập nhật:** Sau khi fix SystemLog field mapping issue
