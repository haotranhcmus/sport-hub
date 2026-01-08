# Hướng Dẫn Reset Database - SportHub

## Tổng quan

Script `reset-to-seed.sh` giúp reset toàn bộ database về trạng thái ban đầu một cách an toàn với đầy đủ seed data.

## Dữ liệu sau khi reset

### 👥 Users (2)

- **Admin**: `admin@sporthub.vn` (Role: ADMIN)
- **Customer**: `customer@sporthub.vn` (Role: CUSTOMER)

### 📁 Categories (3)

- Bóng Đá
- Bóng Rổ
- Chạy Bộ

### 🏷️ Brands (3)

- Nike (USA)
- Adidas (Germany)
- Puma (Germany)

### 📏 Size Guides (2)

- **Bảng Size Giày**: 39-44
- **Bảng Size Áo**: S, M, L, XL, XXL

### 🎨 Product Attributes (4)

- **Màu sắc**: Đen, Trắng, Đỏ, Xanh dương, Xanh lá, Vàng
- **Size giày**: 39, 40, 41, 42, 43, 44
- **Size áo**: S, M, L, XL, XXL
- **Chất liệu**: Da thật, Da tổng hợp, Vải mesh, Polyester, Cotton

### 🏭 Suppliers (3)

- Công ty TNHH Thể Thao Việt Nam
- Nhà Phân Phối Nike Việt Nam
- Adidas Official Store Vietnam

### ⚙️ System Config (1)

- Cấu hình website cơ bản (VAT, shipping, return policies)

## Cách sử dụng

### Cách 1: Chạy script trực tiếp (Khuyến nghị)

```bash
./reset-to-seed.sh
```

Sau đó nhập `yes` để xác nhận.

### Cách 2: Tự động xác nhận

```bash
echo "yes" | ./reset-to-seed.sh
```

### Cách 3: Chạy từ npm script

```bash
npm run prisma:reset
```

## Quy trình thực hiện

Script sẽ thực hiện các bước sau:

1. **Xác nhận**: Yêu cầu người dùng confirm trước khi xóa data
2. **Kiểm tra môi trường**: Verify file .env và DATABASE_URL
3. **Tắt RLS**: Disable Row Level Security cho Supabase REST API
4. **Reset Database**:
   - Drop tất cả tables
   - Chạy lại migrations
   - Generate Prisma Client
   - Seed data từ `prisma/seed-complete.ts`
5. **Xác nhận kết quả**: Hiển thị thông tin về data đã tạo

## Lưu ý quan trọng

### ⚠️ Cảnh báo

- Script này sẽ **XÓA TOÀN BỘ DỮ LIỆU** hiện tại
- Không thể khôi phục data sau khi reset
- **KHÔNG chạy trên production database**

### ✅ An toàn

- Script yêu cầu xác nhận trước khi thực hiện
- Tự động tắt RLS để tránh lỗi permission
- Generate lại Prisma Client sau migration
- Có validation và error handling

### 🔧 Troubleshooting

#### Lỗi: "permission denied for schema public"

- **Nguyên nhân**: RLS (Row Level Security) chưa được tắt
- **Giải pháp**: Script tự động xử lý, nếu vẫn lỗi chạy thủ công:
  ```bash
  psql "$DATABASE_URL" -f prisma/disable-rls.sql
  ```

#### Lỗi: "Command not found: ./reset-to-seed.sh"

- **Nguyên nhân**: File chưa có quyền thực thi
- **Giải pháp**:
  ```bash
  chmod +x reset-to-seed.sh
  ```

#### Lỗi khi seed data

- **Nguyên nhân**: Schema không khớp với seed file
- **Giải pháp**:
  1. Kiểm tra file `prisma/schema.prisma`
  2. Chạy `npx prisma generate`
  3. Thử lại

## Sau khi reset

### 1. Đăng nhập Admin

- URL: `http://localhost:3001/#/admin`
- Email: `admin@sporthub.vn`
- Password: Bất kỳ (hệ thống không check password)

### 2. Đăng nhập Customer

- URL: `http://localhost:3001/`
- Email: `customer@sporthub.vn`
- Password: Bất kỳ

### 3. Làm mới trình duyệt

Nhấn `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac) để clear cache

### 4. Tạo sản phẩm

Vào Admin Dashboard > Quản lý sản phẩm để thêm sản phẩm mới

## Files liên quan

- `reset-to-seed.sh`: Script reset chính
- `prisma/seed-complete.ts`: File seed data
- `prisma/disable-rls.sql`: Script tắt RLS
- `prisma/schema.prisma`: Database schema
- `package.json`: Chứa npm scripts

## Phát triển

### Cập nhật seed data

Chỉnh sửa file `prisma/seed-complete.ts` để thêm/sửa dữ liệu ban đầu.

### Thêm migration mới

```bash
npx prisma migrate dev --name ten_migration
```

### Test seed riêng lẻ

```bash
npm run prisma:seed
```

## Liên hệ

Nếu gặp vấn đề, tạo issue hoặc liên hệ team phát triển.
