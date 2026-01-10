# GIAI ĐOẠN 2: MIGRATE TO SUPABASE STORAGE - HOÀN TẤT ✅

## 📋 TÓM TẮT

Đã migrate hệ thống upload ảnh từ **Base64 encoding** sang **Supabase Storage** (real file upload).

---

## ✅ CÁC THAY ĐỔI

### 1. **lib/storage.ts** (FILE MỚI)

Tạo helper functions cho Supabase Storage:

#### `uploadImage(file, folder)` - Upload ảnh mới

- Generate unique filename: `{timestamp}-{random}.{ext}`
- Upload vào bucket `product-images`
- Return public URL

#### `deleteImage(imageUrl)` - Xóa ảnh cũ

- Extract path from URL
- Delete file from storage
- Không throw error nếu fail (graceful degradation)

#### `replaceImage(oldUrl, newFile, folder)` - Thay thế ảnh

- Upload ảnh mới trước
- Sau đó xóa ảnh cũ
- Đảm bảo data integrity

#### `uploadImages(files[], folder)` - Upload nhiều ảnh

- Batch upload
- Return array of URLs

#### `verifyStorageSetup()` - Kiểm tra bucket

- Verify bucket tồn tại
- Dùng cho health check

---

### 2. **components/admin/ProductManager.tsx**

#### Thay đổi 1: Import storage helper

```tsx
import { uploadImage, replaceImage } from "../../lib/storage";
```

#### Thay đổi 2: `handleMainImageUpload()` - Product thumbnail

**Trước:**

```tsx
const base64 = await handleFileRead(file);
setFormData({ ...formData, thumbnailUrl: base64 });
```

**Sau:**

```tsx
// Validate file type & size
if (!file.type.startsWith("image/")) {
  alert("⚠️ Chỉ chấp nhận file ảnh");
  return;
}

if (file.size > 5 * 1024 * 1024) {
  alert("⚠️ Kích thước file quá lớn (tối đa 5MB)");
  return;
}

// Upload to storage
let imageUrl: string;
if (savedProduct && formData.thumbnailUrl) {
  imageUrl = await replaceImage(formData.thumbnailUrl, file, "products");
} else {
  imageUrl = await uploadImage(file, "products");
}

setFormData({ ...formData, thumbnailUrl: imageUrl });
```

#### Thay đổi 3: `handleSkuImageUpload()` - Variant images

Tương tự như trên, upload vào folder `"variants"`

---

### 3. **components/admin/ProductConfig.tsx**

#### Import storage helper

```tsx
import { uploadImage, replaceImage } from "../../lib/storage";
```

#### `handleImageUpload()` - Brand logos & Category images

**Trước:**

```tsx
const base64 = await handleFileRead(file);
if (activeTab === "brand") setFormData({ ...formData, logoUrl: base64 });
else setFormData({ ...formData, imageUrl: base64 });
```

**Sau:**

```tsx
// Validate file type & size (max 2MB for brands/categories)
if (!file.type.startsWith("image/")) {
  alert("⚠️ Chỉ chấp nhận file ảnh");
  return;
}

if (file.size > 2 * 1024 * 1024) {
  alert("⚠️ Kích thước file quá lớn (tối đa 2MB)");
  return;
}

// Upload to appropriate folder
const folder = activeTab === "brand" ? "brands" : "categories";
const oldUrl = activeTab === "brand" ? formData.logoUrl : formData.imageUrl;

let imageUrl: string;
if (editingItem && oldUrl) {
  imageUrl = await replaceImage(oldUrl, file, folder);
} else {
  imageUrl = await uploadImage(file, folder);
}

// Update form data
if (activeTab === "brand") {
  setFormData({ ...formData, logoUrl: imageUrl });
} else {
  setFormData({ ...formData, imageUrl: imageUrl });
}
```

---

## 📊 SO SÁNH TRƯỚC/SAU

| Feature              | Base64 (Trước)             | Supabase Storage (Sau)  |
| -------------------- | -------------------------- | ----------------------- |
| **Storage location** | PostgreSQL (String column) | Supabase Storage Bucket |
| **File size limit**  | ∞ (lý thuyết)              | 5MB (configurable)      |
| **Database size**    | 📈 Phình to nhanh          | 📊 Nhẹ (chỉ lưu URL)    |
| **Performance**      | 🐌 Chậm (base64 lớn)       | ⚡ Nhanh (CDN)          |
| **File management**  | ❌ Không có                | ✅ Có (delete, replace) |
| **CDN**              | ❌ Không                   | ✅ Có (auto)            |
| **Validation**       | ❌ Không                   | ✅ Type + Size check    |
| **Error handling**   | ❌ Yếu                     | ✅ Try-catch đầy đủ     |

---

## 🗂️ Folder Structure trong Bucket

```
product-images/
├── brands/
│   └── {timestamp}-{random}.{ext}
├── categories/
│   └── {timestamp}-{random}.{ext}
├── products/
│   └── {timestamp}-{random}.{ext}
└── variants/
    └── {timestamp}-{random}.{ext}
```

---

## 🔒 Validations Added

### File Type Check

```tsx
if (!file.type.startsWith("image/")) {
  alert("⚠️ Chỉ chấp nhận file ảnh");
  return;
}
```

### File Size Limits

- **Products/Variants:** Max 5MB
- **Brands/Categories:** Max 2MB

### Loading States

- Show loading spinner khi upload
- Disable buttons khi đang xử lý
- Hiển thị error messages rõ ràng

---

## ⚙️ SETUP REQUIRED

### ⚠️ QUAN TRỌNG: BẠN PHẢI THỰC HIỆN

Đọc file **`SUPABASE_STORAGE_SETUP.md`** để:

1. **Tạo bucket** `product-images` trên Supabase Dashboard
2. **Bật Public bucket**
3. **Tạo RLS Policies:**
   - Allow public read
   - Allow authenticated upload
   - Allow authenticated delete

**Không setup = không upload được ảnh!**

---

## 📋 FILES MODIFIED

**New Files:**

- ✅ `lib/storage.ts` - Storage helper functions
- ✅ `SUPABASE_STORAGE_SETUP.md` - Setup guide

**Modified Files:**

- ✅ `components/admin/ProductManager.tsx`
  - `handleMainImageUpload()` - Use Storage
  - `handleSkuImageUpload()` - Use Storage
- ✅ `components/admin/ProductConfig.tsx`
  - `handleImageUpload()` - Use Storage

---

## 🧪 TESTING CHECKLIST

### Sau khi setup Supabase Storage:

- [ ] **Test 1:** Upload product thumbnail

  - Vào Admin → Sản phẩm → Tạo mới
  - Upload ảnh đại diện
  - Check console log: `✅ [PRODUCT] Image uploaded: https://...`
  - Verify ảnh hiển thị trong form

- [ ] **Test 2:** Upload variant image

  - Tạo variants cho sản phẩm
  - Upload ảnh riêng cho từng variant
  - Check console log: `✅ [VARIANT] Image uploaded: https://...`

- [ ] **Test 3:** Upload brand logo

  - Vào Cấu hình → Thương hiệu → Tạo mới
  - Upload logo
  - Check console: `✅ [BRAND] Image uploaded: https://...`

- [ ] **Test 4:** Upload category image

  - Vào Cấu hình → Danh mục → Tạo mới
  - Upload ảnh danh mục
  - Check console: `✅ [CATEGORY] Image uploaded: https://...`

- [ ] **Test 5:** Replace existing image

  - Edit product/brand/category đã có ảnh
  - Upload ảnh mới
  - Verify ảnh cũ bị xóa khỏi Storage
  - Verify ảnh mới hiển thị

- [ ] **Test 6:** File validation
  - Thử upload file không phải ảnh (.txt, .pdf)
  - Phải hiện: "⚠️ Chỉ chấp nhận file ảnh"
- [ ] **Test 7:** Size validation

  - Upload file > 5MB
  - Phải hiện: "⚠️ Kích thước file quá lớn"

- [ ] **Test 8:** Check Storage bucket
  - Vào Supabase Dashboard → Storage
  - Kiểm tra có folders: brands/, categories/, products/, variants/
  - Kiểm tra files trong folders

---

## 🎯 BENEFITS

### Performance

- ✅ Database nhẹ hơn (không lưu Base64)
- ✅ Page load nhanh hơn
- ✅ CDN auto caching

### Management

- ✅ Dễ xóa ảnh cũ
- ✅ File organization rõ ràng
- ✅ Có thể browse files trực tiếp

### Scalability

- ✅ Không giới hạn số lượng ảnh (chỉ bị giới hạn bởi Supabase plan)
- ✅ Easy to migrate storage provider nếu cần

### Developer Experience

- ✅ Clear error messages
- ✅ Type safety với TypeScript
- ✅ Reusable helper functions

---

## 🚧 KNOWN LIMITATIONS

### 1. Cần Manual Setup

- Phải tạo bucket trên Supabase Dashboard
- Không tự động tạo qua code

### 2. Network Dependent

- Upload chậm nếu internet yếu
- Base64 không phụ thuộc network

### 3. Cost

- Supabase Storage có giới hạn free tier
- Vượt quota → phải trả tiền

---

## 📈 NEXT STEPS (Future)

### Giai đoạn 3: Image Optimization (Optional)

- [ ] Install `sharp` package
- [ ] Add image resize before upload (max 1200x1200)
- [ ] Add JPEG compression (quality 80%)
- [ ] Generate thumbnails automatically

### Giai đoạn 4: Advanced Features (Optional)

- [ ] Multiple image upload for products (gallery)
- [ ] Drag & drop upload UI
- [ ] Image cropping tool
- [ ] Progressive image loading

---

**Ngày hoàn thành:** 09/01/2026  
**Status:** ⚠️ **WAITING FOR SUPABASE SETUP**

**Action Required:** Làm theo `SUPABASE_STORAGE_SETUP.md` rồi test!
