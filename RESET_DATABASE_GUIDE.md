# 🔄 Hướng Dẫn Reset Database & Supabase Setup

## ⚡ Quick Start (TL;DR)

```bash
# Chỉ cần 1 lệnh duy nhất!
./reset-to-seed.sh

# Sau đó:
npm run dev
# → Mở http://localhost:3001
# → Hard refresh: Ctrl+Shift+R
```

**Thế thôi! Script tự động làm ALL:**

- ✅ Reset database + seed data
- ✅ Apply Supabase RLS policies
- ✅ Verify data integrity

**Credentials:**

- Admin: `admin@sporthub.vn` / `admin123`
- Customer: `customer@gmail.com` / `customer123`

---

## 📋 Mục Lục

1. [Reset Database Hoàn Toàn](#1️⃣-reset-database-hoàn-toàn)
2. [Setup Supabase RLS Policies](#2️⃣-setup-supabase-rls-policies) (Tự động!)
3. [Kiểm Tra Kết Quả](#3️⃣-kiểm-tra-kết-quả)
4. [Điều Kiện Xóa Các Entity](#🗑️-điều-kiện-xóa-các-entity) (Mới!)
5. [Troubleshooting](#4️⃣-troubleshooting)
6. [Security Notes](#🔐-security-notes)

---

## 1️⃣ Reset Database Hoàn Toàn

### Mục đích

- Xóa toàn bộ data hiện tại
- Tạo lại schema từ `prisma/schema.prisma`
- Nạp seed data mẫu với logic đúng (attributes phù hợp với từng category)
- **Tự động apply Supabase RLS policies** (mới!)

### ⚡ Cách sử dụng (Siêu đơn giản!)

#### Option A: Chạy Script Tự Động (Khuyến nghị - ALL-IN-ONE)

```bash
# Từ thư mục root của project
./reset-to-seed.sh
```

**Script tự động làm TẤT CẢ:**

- ✅ Drop database và recreate schema
- ✅ Generate Prisma Client
- ✅ Seed realistic data (4 products, 10 variants, 2 orders, etc.)
- ✅ **Grant schema access cho Supabase anon role**
- ✅ **Enable RLS policies tự động**
- ✅ Verify kết quả

**Lưu ý:**

- Script sẽ hỏi xác nhận `yes/no` trước khi xóa data
- Nhập `yes` để tiếp tục, `no` để hủy
- Quá trình mất khoảng **1-2 phút** (bao gồm cả RLS setup)
- **Không cần chạy thêm lệnh SQL nào nữa!**

#### Option B: Chạy Từng Bước Thủ Công

```bash
# Bước 1: Drop database và tạo lại schema
npx prisma db push --force-reset --accept-data-loss

# Bước 2: Generate Prisma Client
npx prisma generate

# Bước 3: Chạy seed data
npx prisma db seed
```

### Kết quả sau khi reset

```
✅ Database seed completed successfully!

📊 Seed Summary:
  ✅ 3 Size Guides
  ✅ 4 Categories (Giày Bóng Đá, Áo Thi Đấu, Găng Tay, Phụ Kiện)
  ✅ 3 Brands (Nike, Adidas, Puma)
  ✅ 10 Product Attributes (logic theo từng category - FIXED!)
     - "Loại đính" CHỈ cho Giày (không còn cho Áo)
     - "Size áo" CHỈ cho Áo Thi Đấu
     - "Size găng" CHỈ cho Găng Tay
     - "Màu sắc" cho tất cả categories
  ✅ 4 Products với attributes hợp lý:
     - Nike Mercurial (Giày) → có "Loại đính", "Size giày"
     - Man United Jersey (Áo) → có "Size áo", "Loại cổ"
     - Adidas Predator GK (Găng) → có "Size găng"
     - SportHub Socks (Phụ kiện) → MOVED từ category Giày!
  ✅ 10 Variants (size/color combinations)
  ✅ 1 Review
  ✅ 2 Users (1 admin, 1 customer)
  ✅ 1 Supplier
  ✅ 2 Orders (1 completed, 1 pending)
  ✅ 1 Return Request (size exchange)
  ✅ 1 System Config
  ✅ RLS Policies (automatically applied!)
```

**🎯 Điểm nổi bật của seed data mới:**

- ✅ Logic đúng: Mỗi attribute chỉ xuất hiện ở category phù hợp
- ✅ Realistic: Products có attributes thực tế (giày không có "loại cổ áo")
- ✅ Complete: Đủ data để test toàn bộ chức năng (orders, returns, reviews)

### Admin Credentials (Sau khi seed)

```
Email: admin@sporthub.vn
Password: admin123
```

---

## 2️⃣ Setup Supabase RLS Policies

### ✅ TỰ ĐỘNG với script `reset-to-seed.sh` (Mới!)

**Kể từ bây giờ, bạn KHÔNG CẦN chạy thủ công nữa!** Script `reset-to-seed.sh` đã tự động apply RLS policies.

### Vấn đề cần giải quyết

Sau khi reset database, **Supabase Row Level Security (RLS)** sẽ chặn tất cả truy cập từ frontend vì:

- Các bảng có RLS enabled nhưng chưa có policies
- `anon` role không có quyền truy cập schema `public`

### Triệu chứng

- UI không hiển thị data (loading mãi hoặc empty state)
- Console log hiển thị lỗi:
  ```
  ❌ Error: permission denied for schema public (code: 42501)
  ❌ GET .../Brand?select=*&order=name.asc 401 (Unauthorized)
  ```

### Giải pháp: Tự động hoặc Thủ công

#### ⚡ Tự động (Đã tích hợp trong script)

```bash
# Chỉ cần chạy script reset, RLS sẽ tự động được apply
./reset-to-seed.sh
```

#### 🔧 Thủ công (Chỉ khi script tự động thất bại)

#### Bước 1: Grant Schema Access

```bash
# Chạy file grant-anon-access.sql
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -f prisma/grant-anon-access.sql
```

**Hoặc copy nội dung file `prisma/grant-anon-access.sql` vào Supabase SQL Editor:**

1. Vào https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Click **"New query"**
3. Paste nội dung file `grant-anon-access.sql`
4. Click **"Run"**

**Nội dung file:**

```sql
-- Grant schema access cho anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant ALL access trên tất cả bảng cho anon role (DEV/TEST only!)
-- ⚠️ WARNING: This is UNSAFE for production! Anon users can modify data.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Set default privileges cho các bảng mới
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
```

#### Bước 2: Enable RLS Policies

```bash
# Chạy file enable-rls-policies.sql
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -f prisma/enable-rls-policies.sql
```

**Hoặc copy nội dung file `prisma/enable-rls-policies.sql` vào Supabase SQL Editor:**

**Nội dung file:**

- Enable RLS trên tất cả 20 bảng
- Tạo public read policies cho Product, Category, Brand, Variants, Reviews, SizeGuide
- Tạo write policies (INSERT/UPDATE/DELETE) cho tất cả bảng
- ⚠️ **Lưu ý:** Config này phù hợp cho **DEVELOPMENT/TESTING**, không an toàn cho production

### Lấy Database URL từ .env

```bash
# Xem DATABASE_URL
cat .env | grep DATABASE_URL

# Format:
# postgresql://postgres.PROJECT_ID:PASSWORD@HOST:5432/postgres
```

### Ví dụ đầy đủ

```bash
# 1. Grant schema access
PGPASSWORD="h6a9o1dz2000hao" psql \
  "postgresql://postgres.mruygxkhfdbegwgaewwb:h6a9o1dz2000hao@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres" \
  -f prisma/grant-anon-access.sql

# 2. Enable RLS policies
PGPASSWORD="h6a9o1dz2000hao" psql \
  "postgresql://postgres.mruygxkhfdbegwgaewwb:h6a9o1dz2000hao@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres" \
  -f prisma/enable-rls-policies.sql
```

---

## 3️⃣ Kiểm Tra Kết Quả

### Kiểm tra RLS đã được enable

```bash
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -c \
  "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('Product', 'Category', 'Brand') ORDER BY tablename;"
```

**Output mong đợi:**

```
 tablename | rowsecurity
-----------+-------------
 Brand     | t
 Category  | t
 Product   | t
```

### Kiểm tra Policies đã được tạo

```bash
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -c \
  "SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('Product', 'Category', 'Brand') ORDER BY tablename, policyname;"
```

**Output mong đợi:**

```
 schemaname | tablename | policyname
------------+-----------+--------------------
 public     | Brand     | Allow all deletes Brand
 public     | Brand     | Allow all inserts Brand
 public     | Brand     | Allow all updates Brand
 public     | Brand     | Public read Brand
 public     | Category  | Allow all deletes Category
 public     | Category  | Allow all inserts Category
 public     | Category  | Allow all updates Category
 public     | Category  | Public read Category
 public     | Product   | Allow all deletes
 public     | Product   | Allow all inserts
 public     | Product   | Allow all updates
 public     | Product   | Public read Product
```

### Test Supabase Query từ code

Tạo file test:

```typescript
// test-supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  const { data, error } = await supabase
    .from("Product")
    .select("*, category:Category(*), brand:Brand(*)")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Success! Products:", data.length);
  }
}

testSupabase();
```

Chạy test:

```bash
npx tsx test-supabase.ts
```

**Output mong đợi:**

```
✅ Success! Products: 3
```

### Kiểm tra UI

1. Khởi động dev server:

   ```bash
   npm run dev
   ```

2. Mở browser: `http://localhost:3001`

3. Click menu **"SẢN PHẨM"**

4. Kiểm tra:
   - ✅ Hiển thị 3 sản phẩm
   - ✅ Mỗi sản phẩm có hình ảnh, tên, giá
   - ✅ Có thể filter theo danh mục, thương hiệu
   - ✅ Không có lỗi 401/403 trong console

---

## 4️⃣ Troubleshooting

### Lỗi 1: `permission denied for schema public`

**Nguyên nhân:** Chưa grant schema access cho `anon` role

**Giải pháp:**

```bash
# Chạy lại grant-anon-access.sql
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -f prisma/grant-anon-access.sql
```

### Lỗi 2: `Error fetching products: 401 (Unauthorized)` hoặc `PATCH .../Category 401`

**Nguyên nhân:** RLS policies chưa được tạo hoặc `anon` role thiếu quyền UPDATE/DELETE

**Giải pháp:**

```bash
# Chạy lại grant-anon-access.sql (đã bao gồm UPDATE/DELETE)
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -f prisma/grant-anon-access.sql

# Chạy lại enable-rls-policies.sql
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -f prisma/enable-rls-policies.sql

# Hard refresh browser
# Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
```

### Lỗi 3: `relation "ProductAttribute" does not exist`

**Nguyên nhân:** Một số bảng trong migration chưa được tạo

**Giải pháp:** Bỏ qua lỗi này, chỉ cần các bảng chính (Product, Category, Brand, etc.) hoạt động là đủ

### Lỗi 4: UI vẫn không hiển thị data sau khi fix RLS

**Giải pháp:**

1. Hard refresh browser: `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)
2. Clear localStorage:
   ```javascript
   // Mở DevTools Console và chạy:
   localStorage.clear();
   location.reload();
   ```
3. Restart dev server:
   ```bash
   # Ctrl+C để stop
   npm run dev
   ```

### Lỗi 5: `P3018: A migration failed to apply`

**Nguyên nhân:** Migration conflict khi chạy `prisma migrate reset`

**Giải pháp:** Dùng `prisma db push` thay vì `migrate reset` (đã được fix trong `reset-to-seed.sh`)

### Lỗi 6: Port 5173 đã được sử dụng

**Giải pháp:** Vite sẽ tự động chuyển sang port khác (3001, 3002, etc.)

```
Port 3000 is in use, trying another one...
➜  Local:   http://localhost:3001/
```

### Lỗi 7: Script báo "VITE_SUPABASE_DATABASE_URL not found in .env"

**Nguyên nhân:** File `.env` thiếu biến `VITE_SUPABASE_DATABASE_URL`

**Giải pháp:**

1. Mở file `.env`
2. Thêm dòng:
   ```
   VITE_SUPABASE_DATABASE_URL="postgresql://postgres.PROJECT_ID:PASSWORD@HOST:5432/postgres"
   ```
3. Copy từ `DATABASE_URL` nếu đã có
4. Chạy lại `./reset-to-seed.sh`

### Lỗi 8: RLS policies không tự động apply

**Triệu chứng:** Script chạy xong nhưng UI vẫn báo 401/403

**Giải pháp:** Chạy thủ công 2 file SQL

```bash
# Lấy DATABASE_URL từ .env
DATABASE_URL=$(grep VITE_SUPABASE_DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | xargs)
PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Chạy 2 file SQL
PGPASSWORD="$PASSWORD" psql "$DATABASE_URL" -f prisma/grant-anon-access.sql
PGPASSWORD="$PASSWORD" psql "$DATABASE_URL" -f prisma/enable-rls-policies.sql

# Hard refresh browser
# Ctrl+Shift+R
```

---

## 📝 Quy Trình Reset Hoàn Chỉnh (All-In-One)

### ⚡ Cách Nhanh Nhất (Khuyến Nghị)

```bash
# Chỉ cần 1 lệnh duy nhất!
./reset-to-seed.sh
```

**Script tự động thực hiện:**

1. ✅ Drop database và tạo lại schema
2. ✅ Generate Prisma Client
3. ✅ Seed data mẫu (4 products, 2 orders, etc.)
4. ✅ Grant schema access cho anon role
5. ✅ Enable RLS policies tự động
6. ✅ Verify kết quả

**Sau khi chạy xong:**

```bash
# Khởi động dev server (nếu chưa chạy)
npm run dev

# Mở browser
# http://localhost:3001

# Hard refresh để clear cache
# Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
```

**Thời gian ước tính:** 1-2 phút

### 🔧 Cách Thủ Công (Nếu script tự động bị lỗi)

```bash
# 1. Reset database và seed data
./reset-to-seed.sh
# Nhập "yes" khi được hỏi

# 2. Nếu RLS policies không tự động apply, chạy thủ công:
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -f prisma/grant-anon-access.sql
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_DATABASE_URL" -f prisma/enable-rls-policies.sql

# 3. Khởi động dev server
npm run dev

# 4. Mở browser và hard refresh
# http://localhost:3001
# Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
```

---

## 🗑️ Điều Kiện Xóa Các Entity

### Validation Rules (Đã được implement trong services)

Hệ thống có validation logic để ngăn việc xóa entities còn đang được sử dụng:

#### 1. **Category (Danh mục)**

**Không thể xóa nếu:**

- Có danh mục con (child categories)
- Có sản phẩm đang thuộc danh mục này

```typescript
// Example error message
"Không thể xóa! Danh mục này có 2 danh mục con và 5 sản phẩm.";
```

**Cách xóa thành công:**

1. Xóa tất cả danh mục con trước
2. Xóa hoặc chuyển tất cả sản phẩm sang danh mục khác
3. Sau đó mới xóa danh mục cha

#### 2. **Brand (Thương hiệu)**

**Không thể xóa nếu:**

- Có sản phẩm đang dùng thương hiệu này

```typescript
// Example error message
"Không thể xóa! Thương hiệu này có 12 sản phẩm.";
```

**Cách xóa thành công:**

1. Xóa tất cả products của brand đó
2. Hoặc đổi brand của products sang brand khác
3. Sau đó mới xóa brand

#### 3. **Product (Sản phẩm)**

**Không thể xóa nếu:**

- Có đơn hàng chứa sản phẩm này

```typescript
// Example error message
"Không thể xóa! Sản phẩm này có 3 đơn hàng. Chỉ có thể ẩn (INACTIVE).";
```

**Cách xóa thành công:**

- ⚠️ Thực tế **KHÔNG NÊN XÓA** product có orders
- Nên đổi status → `INACTIVE` để ẩn khỏi catalog
- Nếu muốn force delete: Xóa tất cả orders chứa product đó trước (không khuyến nghị)

#### 4. **SizeGuide (Bảng size)**

**Không thể xóa nếu:**

- Có category đang dùng size guide này
- Có product đang dùng size guide này

```typescript
// Example error message
"Không thể xóa! Bảng size này được dùng bởi 2 danh mục và 8 sản phẩm.";
```

**Cách xóa thành công:**

1. Đổi size guide của các categories sang bảng khác
2. Đổi size guide của các products sang bảng khác
3. Sau đó mới xóa size guide

#### 5. **Supplier (Nhà cung cấp)**

**Không thể xóa nếu:**

- Có phiếu nhập kho (stock entries) từ supplier này

```typescript
// Example error message
"Không thể xóa! Nhà cung cấp này có 15 phiếu nhập kho.";
```

**Cách xóa thành công:**

1. Xóa tất cả stock entries của supplier
2. Hoặc đổi supplier của các stock entries sang supplier khác
3. Sau đó mới xóa supplier

### Test Deletion Workflow

**Thử nghiệm với seed data:**

```bash
# 1. Login admin
Email: admin@sporthub.vn
Password: admin123

# 2. Vào Admin Panel → Categories
# Thử xóa "Giày Bóng Đá" → Should FAIL (có products)

# 3. Vào Admin Panel → Products
# Thử xóa "Nike Mercurial" → Should FAIL (có orders)

# 4. Vào Admin Panel → Orders
# Xóa order "ORD-250101-001" trước

# 5. Quay lại Products
# Xóa "Nike Mercurial" → Should SUCCESS (không còn orders)

# 6. Quay lại Categories
# Xóa "Giày Bóng Đá" → Should SUCCESS (không còn products)
```

### UI Delete Handler

**ProductManager.tsx** đã có delete handler:

```typescript
const handleDelete = async (productId: string) => {
  const confirmed = window.confirm(
    `Bạn có chắc muốn xóa sản phẩm "${product.name}"?\n\n` +
      `Lưu ý: Không thể xóa nếu sản phẩm đã có đơn hàng.`
  );

  if (!confirmed) return;

  try {
    await api.products.delete(productId, currentUser);
    await refetchProducts();
    alert("Xóa sản phẩm thành công!");
  } catch (error: any) {
    alert(error.message || "Có lỗi xảy ra khi xóa sản phẩm");
  }
};
```

---

## 🔐 Security Notes

### Development vs Production

**Config hiện tại (Development):**

```sql
-- ⚠️ ⚠️ ⚠️ CẢNH BÁO: Cho phép ANONYMOUS users đọc/ghi TẤT CẢ bảng!
-- Điều này CỰC KỲ NGUY HIỂM cho production!
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;

CREATE POLICY "Public read Product" ON "Product"
  FOR SELECT USING (true);

CREATE POLICY "Allow all inserts Category" ON "Category"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all updates Category" ON "Category"
  FOR UPDATE USING (true);
```

**Lý do sử dụng config này:**

- ✅ Dễ dàng develop và test
- ✅ Không cần authentication trong giai đoạn prototype
- ✅ Admin có thể CRUD data ngay lập tức
- ❌ Bất kỳ ai cũng có thể xóa/sửa data
- ❌ Không có audit trail cho các thay đổi
- ❌ KHÔNG an toàn cho production

**Config Production (Cần update):**

```sql
-- ✅ Restrict theo role và ownership
CREATE POLICY "Users read own orders" ON "Order"
  FOR SELECT USING (auth.uid() = "userId" OR auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Admin write products" ON "Product"
  FOR ALL USING (auth.jwt() ->> 'role' IN ('ADMIN', 'WAREHOUSE'));
```

### Checklist trước khi deploy Production

- [ ] Implement proper authentication với Supabase Auth
- [ ] Update RLS policies theo role (ADMIN, CUSTOMER, WAREHOUSE)
- [ ] Restrict write access (INSERT/UPDATE/DELETE) chỉ cho authenticated users
- [ ] Implement rate limiting
- [ ] Enable audit logging cho sensitive operations
- [ ] Review và test tất cả policies

---

## 📚 Tài Liệu Tham Khảo

- [Prisma DB Push](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL GRANT](https://www.postgresql.org/docs/current/sql-grant.html)

---

**Version:** 1.0  
**Date:** January 8, 2026  
**Author:** SportHub Development Team
