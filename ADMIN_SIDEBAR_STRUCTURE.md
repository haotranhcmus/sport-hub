# Cấu trúc Sidebar Admin - SportHub

## Tổng quan

Sidebar được tổ chức theo **6 MODULE lớn** để dễ hiểu nghiệp vụ và dễ scale về sau.

---

## 📊 Cấu trúc Module

### 🔹 MODULE 1: Tổng quan

```
📊 Tổng quan
```

- Dashboard chính
- Số liệu nhanh, biểu đồ tổng quan

---

### 🔹 MODULE 2: Kinh doanh

```
🛒 Kinh doanh
   ├─ Đơn hàng
   └─ Đổi / Trả
```

**Breadcrumb examples:**

- `Kinh doanh > Đơn hàng`
- `Kinh doanh > Đổi / Trả`

**Nghiệp vụ:** Quản lý toàn bộ luồng bán hàng từ đơn hàng đến xử lý đổi/trả

---

### 🔹 MODULE 3: Sản phẩm

```
📦 Sản phẩm
   ├─ Sản phẩm & SKU
   ├─ Bảng Size
   └─ Cấu hình sản phẩm
```

**Breadcrumb examples:**

- `Sản phẩm > Sản phẩm & SKU`
- `Sản phẩm > Bảng Size`
- `Sản phẩm > Cấu hình sản phẩm`

**Nghiệp vụ:** Cấu hình và quản lý toàn bộ thông tin sản phẩm

---

### 🔹 MODULE 4: Quản lý kho

```
🏭 Quản lý kho
   ├─ Nhập kho
   ├─ Xuất kho
   ├─ Kiểm kê
   ├─ Báo cáo tồn kho
   └─ Nhà cung cấp
```

**Breadcrumb examples:**

- `Quản lý kho > Nhập kho`
- `Quản lý kho > Xuất kho`
- `Quản lý kho > Kiểm kê`
- `Quản lý kho > Báo cáo tồn kho`
- `Quản lý kho > Nhà cung cấp`

**Nghiệp vụ:** Quản lý toàn bộ hoạt động kho hàng và nhà cung cấp

---

### 🔹 MODULE 5: Báo cáo

```
📈 Báo cáo
   └─ Doanh thu
```

**Breadcrumb example:**

- `Báo cáo > Doanh thu`

**Nghiệp vụ:** Xem báo cáo phân tích doanh thu

**Note:** Báo cáo tồn kho được đặt trong module "Quản lý kho" vì liên quan trực tiếp đến nghiệp vụ kho

---

### 🔹 MODULE 6: Cấu hình

```
⚙️ Cấu hình
   ├─ Website
   ├─ Nhân viên
   └─ Nhật ký
```

**Breadcrumb examples:**

- `Cấu hình > Website`
- `Cấu hình > Nhân viên`
- `Cấu hình > Nhật ký`

**Nghiệp vụ:** Cấu hình hệ thống, quản lý nhân viên và xem nhật ký audit

---

## ✨ Tính năng UX

### 1. **Collapse/Expand Module**

- Mỗi module (trừ Tổng quan) có thể thu gọn/mở rộng
- Click vào tên module để toggle
- Icon chevron hiển thị trạng thái (ChevronDown = mở, ChevronRight = đóng)

### 2. **Auto-expand Active Module**

- Module chứa trang đang active sẽ tự động mở rộng
- VD: Khi vào "Đơn hàng" → module "Kinh doanh" tự động expand

### 3. **Visual Hierarchy**

- Module cha: Font bold, icon 18px
- Submenu item: Font medium, icon 16px, indent bằng padding-left
- Active state: Background blue-10%, text secondary color

### 4. **Breadcrumb Navigation**

- Hiển thị ở top của mỗi trang
- Format: `Module > Submenu`
- Item cuối cùng (active) màu secondary và bold
- Dùng ChevronRight icon làm separator

### 5. **Responsive**

- Mobile: Sidebar dạng overlay với backdrop
- Desktop: Sidebar fixed, luôn hiển thị
- Toggle button chỉ hiển thị trên mobile

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────┐
│  [Avatar] User Name                  [X]│  ← Header (mobile có X)
├─────────────────────────────────────────┤
│  📊 Tổng quan                            │  ← Single item
│                                          │
│  🛒 Kinh doanh               [v]         │  ← Module (expanded)
│      → Đơn hàng                          │  ← Submenu
│      → Đổi / Trả                         │
│                                          │
│  📦 Sản phẩm                 [>]         │  ← Module (collapsed)
│                                          │
│  🏭 Quản lý kho              [v]         │  ← Module (expanded)
│      → Nhập kho                          │
│      → Xuất kho                          │
│      → Kiểm kê                           │
│      → Báo cáo tồn kho                   │
│      → Nhà cung cấp                      │
│                                          │
│  📈 Báo cáo                  [>]         │
│  ⚙️ Cấu hình                 [>]         │
├─────────────────────────────────────────┤
│  🚪 Đăng xuất                            │  ← Footer
└─────────────────────────────────────────┘
```

---

## 🎯 Lợi ích

✅ **Gọn gàng hơn:** Từ 14 items riêng lẻ → 6 modules
✅ **Dễ hiểu nghiệp vụ:** Nhóm theo logic kinh doanh, không phải kỹ thuật
✅ **Dễ onboarding:** Admin mới dễ dàng tìm chức năng
✅ **Dễ scale:** Thêm chức năng mới chỉ cần thêm vào module tương ứng
✅ **Chuẩn TMĐT:** Mô phỏng theo Shopify, KiotViet, Sapo, Haravan

---

## 🔧 Technical Details

### Components

- `SidebarModule`: Component cho module có thể collapse
- `SidebarItem`: Component cho item đơn (như Tổng quan)
- `SidebarSubItem`: Component cho submenu item
- `Breadcrumb`: Component hiển thị breadcrumb path

### State Management

- Mỗi module tự quản lý `isExpanded` state
- `defaultExpanded` prop để tự động mở module khi có submenu active

### Styling

- TailwindCSS với custom classes
- Animation: `animate-in slide-in-from-top-2` khi expand module
- Active state: `bg-secondary/10 text-secondary`

---

## 📝 Future Enhancements

1. **Persist collapse state** trong localStorage
2. **Role-based visibility** - Ẩn module theo quyền user
3. **Search sidebar** - Tìm kiếm nhanh chức năng
4. **Keyboard shortcuts** - Phím tắt cho từng module
5. **Notification badges** - Số đơn hàng mới, sản phẩm hết hàng, etc.

---

_Cập nhật: 2026-01-09_
