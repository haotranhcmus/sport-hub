# 📝 HƯỚNG DẪN CÀI ĐẶT DỰ ÁN - SportHub

## ✅ TÓM TẮT NHANH
**Có, chỉ cần 3 bước:**
1. Tạo file `.env` và paste nội dung
2. Chạy `npm install`
3. Chạy `npm run dev`

---

## 📋 YÊU CẦU HỆ THỐNG

- **Node.js:** Version 18.x trở lên ([Download tại đây](https://nodejs.org/))
- **npm:** Version 8.x trở lên (đi kèm Node.js)
- **Git:** Để clone repository
- **Trình duyệt:** Chrome, Firefox, Safari, hoặc Edge (phiên bản mới nhất)

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT CHI TIẾT

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd đồ-án-cuối-kì
```

### Bước 2: Tạo file `.env`

Tạo file `.env` trong thư mục gốc của dự án và paste nội dung sau:

```env
# =====================================================
# SUPABASE CLIENT CONFIGURATION
# =====================================================
VITE_SUPABASE_URL=https://mruygxkhfdbegwgaewwb.supabase.co
VITE_SUPABASE_KEY=<ANON_KEY_ĐƯỢC_CUNG_CẤP>

# =====================================================
# DATABASE CONNECTION (Cho Prisma - Optional)
# =====================================================
# Chỉ cần nếu muốn chạy migrations hoặc seed
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@db.mruygxkhfdbegwgaewwb.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://<USERNAME>:<PASSWORD>@db.mruygxkhfdbegwgaewwb.supabase.co:5432/postgres"

# =====================================================
# API KEYS (Optional)
# =====================================================
GEMINI_API_KEY=your_gemini_api_key_here
```

**LƯU Ý QUAN TRỌNG:**
- File `.env` đã được thêm vào `.gitignore` nên sẽ **KHÔNG** được push lên GitHub
- Bạn cần cung cấp nội dung file `.env` riêng cho người clone dự án
- `VITE_SUPABASE_KEY` là **anon key** (public key) - an toàn để dùng trên frontend
- `DATABASE_URL` và `DIRECT_URL` chỉ cần nếu muốn chạy Prisma migrations

### Bước 3: Cài đặt Dependencies

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả packages trong `package.json`:
- React 19.2.3
- TypeScript 5.8.2
- Vite 6.2.0
- Supabase JS 2.89.0
- TanStack Query 5.90.15
- Recharts 3.6.0
- Lucide React (icons)
- Prisma 6.2.0
- ... và các dependencies khác

### Bước 4: Chạy Development Server

```bash
npm run dev
```

Dự án sẽ chạy tại: **http://localhost:3000**

---

## 🔑 TÀI KHOẢN MẶC ĐỊNH

Sau khi dự án chạy, bạn có thể đăng nhập với:

### Admin Account
- **Email:** `admin@sporthub.vn`
- **Password:** Bất kỳ (không check password trong dev mode)
- **Redirect:** Tự động chuyển đến `/admin`

### Customer Account
- **Email:** `customer@test.com`
- **Password:** Bất kỳ
- **Redirect:** Ở lại trang homepage

---

## 📦 CÁC LỆNH HỮU ÍCH

### Development
```bash
npm run dev              # Chạy dev server
npm run build            # Build production
npm run preview          # Preview production build
```

### Prisma (Optional - chỉ khi cần làm việc với database schema)
```bash
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Chạy migrations
npm run prisma:studio    # Mở Prisma Studio (GUI)
npm run prisma:seed      # Seed database với dữ liệu mẫu
```

---

## 🎯 CẤU TRÚC DỰ ÁN

```
đồ-án-cuối-kì/
├── components/          # React components
│   ├── admin/          # Admin dashboard modules
│   ├── features/       # Feature components (cart, product)
│   └── layout/         # Layout components
├── context/            # React Context (Auth, Cart)
├── hooks/              # Custom React hooks
├── lib/                # Libraries & utilities
│   ├── supabase.ts    # Supabase client config
│   └── repositories/  # Database repositories (deprecated)
├── pages/              # Page components
├── prisma/             # Prisma schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── services/           # API service layer
│   ├── index.ts       # Main export
│   ├── order.service.ts
│   ├── product.service.ts
│   ├── return-request.service.ts
│   └── ...
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── .env                # Environment variables (KHÔNG commit)
├── .env.example        # Template cho .env
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── vite.config.ts      # Vite config
```

---

## ⚠️ TROUBLESHOOTING

### Lỗi: "Cannot find module '@supabase/supabase-js'"
**Giải pháp:** Chạy lại `npm install`

### Lỗi: "VITE_SUPABASE_URL is not defined"
**Giải pháp:** Kiểm tra file `.env` đã tạo đúng chưa và có prefix `VITE_`

### Lỗi: Port 3000 đã được sử dụng
**Giải pháp:** 
- Tắt ứng dụng đang chạy ở port 3000
- Hoặc đổi port trong `vite.config.ts`:
```ts
export default defineConfig({
  server: {
    port: 3001, // Đổi sang port khác
  },
})
```

### Lỗi: "Prisma Client not generated"
**Giải pháp:** Chạy `npm run prisma:generate`

### Database connection failed
**Giải pháp:** 
- Kiểm tra `DATABASE_URL` và `DIRECT_URL` trong `.env`
- Đảm bảo Supabase project đang chạy
- Kiểm tra credentials (username, password)

---

## 🔐 BẢO MẬT

**QUAN TRỌNG:** Khi push lên GitHub:

1. ✅ File `.env` đã có trong `.gitignore` - **KHÔNG BAO GIỜ** commit file này
2. ✅ File `.env.example` và `.env.supabase.example` chỉ chứa template
3. ⚠️ Cung cấp nội dung `.env` riêng qua:
   - Email
   - Chat riêng
   - Document chia sẻ nội bộ
   - **KHÔNG** post public

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra lại các bước trong `TROUBLESHOOTING`
2. Xem log lỗi trong terminal
3. Kiểm tra browser console (F12)
4. Đọc lại `README.md` để hiểu rõ hơn về dự án

---

## ✨ TÍNH NĂNG CHÍNH

- 🛒 **E-commerce đầy đủ:** Sản phẩm, giỏ hàng, checkout, thanh toán
- 📦 **Quản lý đơn hàng:** Theo dõi trạng thái, cập nhật vận chuyển
- 🔄 **Hệ thống đổi/trả:** Per-item return requests với 7 trạng thái
- 📊 **Dashboard Admin:** Thống kê doanh thu, tồn kho, báo cáo
- 🏪 **Quản lý kho:** Nhập/xuất kho tự động khi đổi/trả hàng
- 👥 **Quản lý nhà cung cấp:** CRUD suppliers
- 📏 **Size Guide:** Bảng size động cho từng danh mục
- 🔐 **Phân quyền:** Admin, Sales, Warehouse, Customer

**Happy Coding! 🚀**
