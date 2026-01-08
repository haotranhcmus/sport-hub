# Fix: "Could not find the 'categoryIds' column" Error

## Vấn đề

Lỗi: `Could not find the 'categoryIds' column of 'ProductAttribute' in the schema cache`

## Nguyên nhân

- Prisma Client được generate với schema cũ có field `categoryIds`
- Database thực tế KHÔNG có column `categoryIds`
- Cache mismatch giữa generated Prisma Client và database schema

## Giải pháp

### Cách 1: Chạy script reset (Khuyến nghị)

Script reset đã được update để tự động fix vấn đề này:

```bash
./reset-to-seed.sh
```

Script sẽ:

1. Xóa Prisma Client cache (`node_modules/.prisma`)
2. Reset database
3. Chạy migrations
4. Generate Prisma Client mới
5. Seed data

### Cách 2: Fix thủ công

Nếu không muốn reset toàn bộ database:

```bash
# Bước 1: Xóa Prisma Client cache
rm -rf node_modules/.prisma

# Bước 2: Generate lại Prisma Client
npx prisma generate

# Bước 3: Restart dev server
npm run dev
```

### Cách 3: Reset Prisma Client cache khi gặp lỗi

Thêm vào script của bạn:

```bash
# Trước khi chạy app
rm -rf node_modules/.prisma
npx prisma generate
```

## Verify fix thành công

### Kiểm tra database schema:

```bash
source .env
psql "$DATABASE_URL" -c "\d \"ProductAttribute\""
```

Kết quả đúng sẽ KHÔNG có column `categoryIds`:

```
 id        | text      | not null
 name      | text      | not null
 code      | text      | not null
 type      | text      | not null
 values    | jsonb     | not null
 createdAt | timestamp | not null
 updatedAt | timestamp | not null
```

### Test Prisma Client:

```bash
npx tsx -e "import { PrismaClient } from '@prisma/client'; \
const p = new PrismaClient(); \
p.productAttribute.findMany().then(r => console.log('✅ OK, found', r.length, 'attributes')).finally(() => p.\$disconnect())"
```

Kết quả: `✅ OK, found 4 attributes`

## Ngăn chặn lỗi trong tương lai

### 1. Luôn generate Prisma Client sau khi pull code

Thêm vào workflow:

```bash
git pull
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

### 2. Update package.json scripts

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "dev": "prisma generate && vite",
    "reset": "./reset-to-seed.sh"
  }
}
```

### 3. Gitignore Prisma cache

Đảm bảo `.gitignore` có:

```
node_modules/
.prisma/
```

## Technical Details

### Tại sao xảy ra lỗi này?

1. **Schema được update**: File `prisma/schema.prisma` được sửa để xóa field `categoryIds`
2. **Migration chưa chạy**: Database vẫn giữ cấu trúc cũ HOẶC đã update nhưng Prisma Client chưa regenerate
3. **Cache conflict**: Generated Prisma Client (trong `node_modules/.prisma`) vẫn chứa code cho field `categoryIds`
4. **Runtime error**: Khi query, Prisma Client tìm column không tồn tại

### Cấu trúc đúng của ProductAttribute

```prisma
model ProductAttribute {
  id         String     @id @default(uuid())
  name       String
  code       String     @unique
  type       String
  values     Json
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  categories Category[] @relation("CategoryToProductAttribute")

  @@index([code])
  @@index([type])
}
```

**Quan trọng**: KHÔNG có field `categoryIds`. Relation với Category được quản lý qua many-to-many table `_CategoryToProductAttribute`.

## Liên hệ

Nếu vẫn gặp lỗi sau khi thử các cách trên, kiểm tra:

1. Xem log chi tiết: `npx prisma validate`
2. Kiểm tra migrations: `npx prisma migrate status`
3. Xem database schema: `psql "$DATABASE_URL" -c "\d \"ProductAttribute\""`
