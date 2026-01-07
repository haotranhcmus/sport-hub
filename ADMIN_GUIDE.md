# 📋 Hướng Dẫn Quản Trị Hệ Thống

## 🎯 Thứ Tự Setup Dữ Liệu

### 1️⃣ Bảng Size (Size Guides)
- **File:** `SizeGuideManager.tsx`
- **Không phụ thuộc:** Tạo đầu tiên
- **Được dùng bởi:** Category, Product
- **Xóa:** ✅ Kiểm tra Category/Product đang dùng

### 2️⃣ Danh Mục (Categories)
- **File:** `ProductConfig.tsx` - Tab "Danh mục"
- **Phụ thuộc:** SizeGuide (optional)
- **Được dùng bởi:** Product, ProductAttribute
- **Schema:** `name, slug, imageUrl, description, parentId, sizeGuideId`
- **Xóa:** ✅ Kiểm tra danh mục con + sản phẩm đang dùng

### 3️⃣ Thương Hiệu (Brands)
- **File:** `ProductConfig.tsx` - Tab "Thương hiệu"
- **Không phụ thuộc**
- **Được dùng bởi:** Product
- **Schema:** `name, slug, logoUrl, country` (⚠️ KHÔNG có description)
- **Xóa:** ✅ Kiểm tra sản phẩm đang dùng

### 4️⃣ Thuộc Tính (Attributes)
- **File:** `ProductConfig.tsx` - Tab "Thuộc tính"
- **Phụ thuộc:** Category
- **Được dùng bởi:** Product variants
- **Schema:** `name, code, type, values, categoryIds`
- **Loại:** 
  - **variant:** Tạo biến thể (màu, size) - BẮT BUỘC có values
  - **info:** Thông tin thêm - optional values

### 5️⃣ Nhà Cung Cấp (Suppliers)
- **File:** `SupplierManager.tsx`
- **Được dùng bởi:** StockEntry

### 6️⃣ Sản Phẩm (Products & Variants)
- **File:** `ProductManager.tsx`
- **Phụ thuộc:** Category, Brand, SizeGuide, Attributes
- **Xóa:** ⚠️ CASCADE xóa variants/reviews. Không xóa nếu có đơn hàng

### 7️⃣ Nhập Kho → 8️⃣ Xuất Kho → 9️⃣ Đơn Hàng → 🔟 Đổi Trả

---

## ⚠️ Lưu Ý Quan Trọng

### Schema Differences
- **Brand:** KHÔNG có `description`
- **Category:** KHÔNG có `logoUrl`, `code`, `type`, `values`, `categoryIds`
- **Attribute:** KHÔNG có `description`, `imageUrl`, `logoUrl`, `parentId`, `sizeGuideId`

### Foreign Keys
- Empty string `""` phải convert sang `null`
- Đã fix: `parentId`, `sizeGuideId` cho Category

### Validation
- ✅ Category: Kiểm tra danh mục con + sản phẩm
- ✅ Brand: Kiểm tra sản phẩm
- ✅ SizeGuide: Kiểm tra Category/Product
- ✅ Attribute variant: Bắt buộc có values

---

## 📝 Kịch Bản Test Nhanh

```
1. Tạo 2 Size Guides
2. Tạo 3 Categories (1 cha + 2 con)
3. Tạo 3 Brands
4. Tạo Attributes: Màu ["Đỏ","Xanh"], Size ["M","L","XL"]
5. Tạo 2 Nhà cung cấp
6. Tạo 5 Products với variants
7. Nhập kho
8. Tạo đơn hàng test
9. Test đổi/trả
```

**Version:** 1.0 | **Date:** Jan 7, 2026
