# HƯỚNG DẪN SETUP SUPABASE STORAGE

## 📦 Tạo Storage Bucket

### Bước 1: Truy cập Supabase Dashboard

1. Đăng nhập vào [https://supabase.com](https://supabase.com)
2. Chọn project của bạn
3. Vào menu **Storage** ở sidebar bên trái

### Bước 2: Tạo Bucket Mới

1. Click nút **"New bucket"** hoặc **"Create a new bucket"**
2. Điền thông tin:

   - **Name:** `product-images`
   - **Public bucket:** ☑️ **BẬT** (check vào ô này)
   - **File size limit:** `5 MB` (hoặc tùy chỉnh)
   - **Allowed MIME types:** `image/*` (hoặc để trống cho all types)

3. Click **"Create bucket"**

### Bước 3: Cấu hình RLS Policies (Row Level Security)

Vì bucket là **public**, bạn cần cấu hình policies để:

- ✅ Cho phép **AUTHENTICATED users** upload
- ✅ Cho phép **PUBLIC** đọc ảnh

#### Policy 1: Allow Public Read

1. Trong Storage → Chọn bucket `product-images`
2. Click tab **"Policies"**
3. Click **"New Policy"**
4. Chọn template **"Allow public read access"** hoặc tạo custom:

```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

5. Click **"Review"** → **"Save policy"**

#### Policy 2: Allow Authenticated Upload

1. Click **"New Policy"** lần nữa
2. Tạo policy cho INSERT:

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

3. Click **"Review"** → **"Save policy"**

#### Policy 3: Allow Authenticated Delete

1. Click **"New Policy"** lần nữa
2. Tạo policy cho DELETE:

```sql
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

3. Click **"Review"** → **"Save policy"**

---

## 🔧 Cấu hình Advanced (Tùy chọn)

### Giới hạn File Size

Trong Bucket settings, bạn có thể set:

- **File size limit:** 5 MB (cho products/variants)
- Hoặc 2 MB (cho brands/categories)

### Allowed MIME Types

Để chỉ cho phép ảnh:

```
image/jpeg
image/png
image/webp
image/gif
```

Hoặc dùng wildcard: `image/*`

---

## ✅ Kiểm tra Setup

### Test 1: Verify Bucket Exists

Chạy script trong project:

```bash
npx tsx -e "
import { supabase } from './lib/supabase.ts';
const { data, error } = await supabase.storage.getBucket('product-images');
console.log(data ? '✅ Bucket exists' : '❌ Bucket not found');
process.exit(0);
"
```

### Test 2: Test Upload

1. Vào Admin Dashboard
2. Vào **Cấu hình > Thương hiệu** hoặc **Danh mục**
3. Thử upload 1 ảnh
4. Kiểm tra Console:
   - Nếu thành công: `✅ [BRAND] Image uploaded: https://...`
   - Nếu lỗi: `❌ [BRAND] Upload error: ...`

### Test 3: Check Uploaded Files

1. Vào Storage → `product-images` bucket
2. Sẽ thấy folders: `brands/`, `categories/`, `products/`, `variants/`
3. Click vào folder để xem files đã upload

---

## 🗂️ Cấu trúc Folders

Sau khi upload, bucket sẽ có cấu trúc:

```
product-images/
├── brands/
│   ├── 1736453920123-abc123.jpg
│   └── 1736453921456-def456.png
├── categories/
│   ├── 1736453922789-ghi789.jpg
│   └── 1736453923012-jkl012.webp
├── products/
│   ├── 1736453924345-mno345.jpg
│   └── 1736453925678-pqr678.png
└── variants/
    ├── 1736453926901-stu901.jpg
    └── 1736453927234-vwx234.png
```

Mỗi file được đặt tên theo format: `{timestamp}-{random}.{ext}`

---

## 🚨 Troubleshooting

### Lỗi: "new row violates row-level security policy"

**Nguyên nhân:** Chưa tạo RLS policies cho bucket

**Giải pháp:** Làm theo Bước 3 ở trên để tạo policies

---

### Lỗi: "Bucket not found"

**Nguyên nhân:** Bucket name sai hoặc chưa tạo

**Giải pháp:**

1. Kiểm tra file `lib/storage.ts` → `STORAGE_BUCKET = "product-images"`
2. Đảm bảo bucket name trong Supabase Dashboard khớp chính xác

---

### Lỗi: "File size exceeds limit"

**Nguyên nhân:** File upload lớn hơn limit của bucket

**Giải pháp:**

1. Bucket settings → Tăng File size limit
2. Hoặc compress ảnh trước khi upload

---

### Ảnh upload nhưng không hiển thị

**Nguyên nhân:** Bucket không phải public hoặc thiếu policy read

**Giải pháp:**

1. Bucket settings → Bật **Public bucket**
2. Tạo policy "Allow public read access" (xem Bước 3)

---

## 📋 Checklist Hoàn tất

- [ ] Bucket `product-images` đã được tạo
- [ ] Bucket được set là **Public**
- [ ] Policy "Allow public read access" đã tạo
- [ ] Policy "Allow authenticated uploads" đã tạo
- [ ] Policy "Allow authenticated delete" đã tạo
- [ ] Test upload 1 ảnh thành công
- [ ] Ảnh hiển thị được trên UI

---

## 🎯 Sau khi Setup xong

Quay lại terminal và gõ **"xong"** để tiếp tục test và verification!
