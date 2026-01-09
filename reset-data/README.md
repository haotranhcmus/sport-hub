# Reset Data Scripts

Thư mục này chứa tất cả các script và seed data để reset database về trạng thái ban đầu.

## 📁 Cấu trúc

```
reset-data/
├── seeds/                    # Các module seed data
│   ├── users.seed.ts        # Seed users với addresses & phone
│   ├── categories.seed.ts   # Seed categories
│   ├── brands.seed.ts       # Seed brands
│   ├── size-guides.seed.ts  # Seed size guides
│   ├── attributes.seed.ts   # Seed product attributes (14 attributes)
│   ├── suppliers.seed.ts    # Seed suppliers
│   └── system-config.seed.ts # Seed system config
├── seed.ts                  # Main seed file (gọi tất cả seeds)
├── reset-to-seed.sh         # Script reset database
├── check-seed-data.sh       # Script kiểm tra seed data
└── disable-rls.sql          # SQL để tắt RLS cho Supabase
```

## 🚀 Sử dụng

### Reset Database

```bash
# Từ thư mục gốc của project
./reset-data/reset-to-seed.sh

# Hoặc dùng npm script
npm run db:reset
```

### Kiểm tra Seed Data

```bash
# Kiểm tra seed data đã nạp thành công chưa
./reset-data/check-seed-data.sh
```

## 📊 Seed Data

### Users (5)

- **Admin**: admin@sporthub.vn (Role: ADMIN)
- **Customer 1**: customer@sporthub.vn (Role: CUSTOMER) - 3 địa chỉ
- **Customer 2**: nguyen.van.b@gmail.com (Role: CUSTOMER) - 1 địa chỉ
- **Sales**: sales@sporthub.vn (Role: SALES)
- **Warehouse**: warehouse@sporthub.vn (Role: WAREHOUSE)

Tất cả users đều có số điện thoại. Customers có sổ địa chỉ với thông tin đầy đủ.

### Categories (3)

- Bóng Đá (Giày, Áo, Quần)
- Chạy Bộ (Giày, Áo, Quần)
- Gym & Fitness (Giày, Áo, Quần)

### Brands (7)

- Nike (USA)
- Adidas (Germany)
- Puma (Germany)
- New Balance (USA)
- Asics (Japan)
- Mizuno (Japan)
- Under Armour (USA)

### Size Guides (3)

- Bảng Size Giày (10 sizes: 36-45)
- Bảng Size Áo (6 sizes: XS-XXL)
- Bảng Size Quần (6 sizes: XS-XXL)

### Product Attributes (11)

**Phân loại theo chức năng:**

#### 🔹 VARIANT ATTRIBUTES (Sinh biến thể - 4 thuộc tính):

1. **Màu sắc** - 10 màu (`type: variant`) → Tất cả danh mục
2. **Size giày** - 10 sizes (`type: variant`) → CHỈ Giày Bóng Đá, Giày Chạy Bộ, Giày Gym
3. **Size áo** - 6 sizes (`type: variant`) → CHỈ Áo Bóng Đá, Áo Chạy Bộ, Áo Gym
4. **Size quần** - 6 sizes (`type: variant`) → CHỈ Quần Bóng Đá, Quần Chạy Bộ, Quần Gym

#### 🔹 SPECIFICATION ATTRIBUTES (Thông tin bổ sung - 7 thuộc tính):

5. **Chất liệu giày** - 6 loại (`type: specification`) → CHỈ giày
6. **Chất liệu vải** - 7 loại (`type: specification`) → CHỈ áo và quần
7. **Công nghệ đế** - 6 công nghệ (`type: specification`) → CHỈ giày
8. **Loại đế bóng đá** - 4 loại (`type: specification`) → CHỈ Giày Bóng Đá
9. **Giới tính** - 3 loại (`type: specification`) → Tất cả danh mục
10. **Kiểu áo** - 6 kiểu (`type: specification`) → CHỈ áo
11. **Kiểu quần** - 5 kiểu (`type: specification`) → CHỈ quần

**✅ Đảm bảo:**

- **VARIANT attributes** dùng để sinh SKU/variants (Size × Màu sắc)
- **SPECIFICATION attributes** chỉ hiển thị thông tin, không sinh variant
- Giày KHÔNG có Size áo/quần
- Áo KHÔNG có Size giày/quần
- Quần KHÔNG có Size giày/áo
- Mỗi thuộc tính chỉ gán cho danh mục phù hợp

### Suppliers (5)

- Thể Thao Việt Nam (TTVN)
- Nike Vietnam
- Adidas Vietnam
- Puma Vietnam
- Asics Vietnam

### System Config (1)

- VAT: 8%
- Return period: 7 ngày
- Free shipping threshold: 500,000 VND

## 🔧 Thêm Seed Data Mới

1. Tạo file mới trong `seeds/` (ví dụ: `products.seed.ts`)
2. Export function `seedProducts(prisma: PrismaClient)`
3. Import và gọi trong `seed.ts`

```typescript
// seeds/products.seed.ts
import { PrismaClient } from "@prisma/client";

export async function seedProducts(prisma: PrismaClient) {
  console.log("📦 Creating Products...");
  // ... seed logic
  console.log("✅ Created products");
}

// seed.ts
import { seedProducts } from "./seeds/products.seed";

async function main() {
  // ... existing seeds
  await seedProducts(prisma);
}
```

## ⚠️ Lưu ý

- Script reset sẽ **XÓA TOÀN BỘ DỮ LIỆU** hiện tại
- Luôn backup database trước khi reset (nếu cần)
- RLS (Row Level Security) sẽ bị tắt để REST API hoạt động
- Prisma Client cache được clear tự động để tránh lỗi schema mismatch

## 🐛 Troubleshooting

### Lỗi "categoryIds column not found"

- Đã được fix tự động trong script reset
- Prisma cache được clear trước khi reset

### Lỗi "permission denied"

- Kiểm tra RLS đã tắt: `./reset-data/check-seed-data.sh`
- Chạy lại `psql "$DATABASE_URL" -f reset-data/disable-rls.sql`

### Seed data không hiển thị

- Kiểm tra với: `./reset-data/check-seed-data.sh`
- Kiểm tra biến môi trường trong `.env`
