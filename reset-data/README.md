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

### Categories (6)

- Bóng Đá
- Bóng Rổ
- Chạy Bộ
- Tennis & Pickleball
- Cầu Lông
- Gym & Fitness

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

### Product Attributes (14)

1. **Màu sắc** - 12 màu (Tất cả categories)
2. **Size giày** - 10 sizes (Bóng Đá, Bóng Rổ, Chạy Bộ, Tennis, Cầu Lông)
3. **Size áo** - 6 sizes (Tất cả categories)
4. **Size quần** - 6 sizes (Tất cả categories)
5. **Chất liệu giày** - 6 loại (Giày categories)
6. **Chất liệu áo/quần** - 7 loại (Tất cả categories)
7. **Công nghệ đế** - 7 công nghệ (Giày categories)
8. **Loại đế bóng đá** - 5 loại (Chỉ Bóng Đá)
9. **Kiểu cổ giày** - 3 kiểu (Giày categories)
10. **Giới tính** - 3 loại (Tất cả categories)
11. **Độ đệm** - 4 mức (Bóng Rổ, Chạy Bộ, Tennis, Cầu Lông)
12. **Trọng lượng** - 3 mức (Giày categories)
13. **Kiểu áo** - 6 kiểu (Tất cả categories)
14. **Kiểu quần** - 5 kiểu (Tất cả categories)

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
