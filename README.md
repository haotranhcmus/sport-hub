# 🏃‍♂️ SportHub - E-commerce Platform for Sports Equipment

> **Đồ án cuối kì** - Hệ thống bán hàng thể thao với quản lý kho, đơn hàng, và hệ thống đổi/trả hàng theo từng sản phẩm.

## 🛠️ Tech Stack

- **Frontend:** React 19.2.3 + TypeScript 5.8.2 + Vite 6.4.1
- **Database:** Supabase PostgreSQL
- **ORM:** Prisma 6.19.1 (migrations) + Supabase JS (runtime queries)
- **Styling:** Tailwind CSS (inline)
- **Charts:** Recharts
- **Icons:** Lucide React

## ✨ Tính năng mới: Hệ thống Đổi/Trả hàng

### 🎯 Kiến trúc Per-Item Return System

- ✅ **Relational Database:** Mỗi sản phẩm có yêu cầu đổi/trả riêng biệt
- ✅ **7 Status Workflow:** PENDING → APPROVED → SHIPPING_BACK → RECEIVED → COMPLETED
- ✅ **Modular Services:** Tách api.ts (1878 lines) thành 7 service modules
- ✅ **Auto Inventory:** Tự động tạo StockEntry/StockIssue khi đổi/trả
- ✅ **Exchange Configuration:** Hỗ trợ đổi size/màu khác nhau

### 📋 Customer Workflow

1. **Tạo yêu cầu:** Mỗi sản phẩm có nút "Đổi/Trả" riêng
2. **Chọn loại:** Exchange (đổi hàng) hoặc Refund (hoàn tiền)
3. **Exchange config:** Nhập size/màu muốn đổi (nếu chọn Exchange)
4. **Upload evidence:** Hình ảnh minh chứng tình trạng sản phẩm
5. **Bank info:** Thông tin tài khoản (nếu chọn Refund)
6. **Track status:** Theo dõi trạng thái qua OrderDetailPage

### 🔧 Admin Workflow

1. **Review:** Xem chi tiết yêu cầu + hình ảnh evidence
2. **Approve/Reject:** Duyệt hoặc từ chối với lý do
3. **Confirm Received:** Xác nhận nhận hàng → **Auto tạo StockEntry**
4. **Complete:** Hoàn tất → **Auto tạo StockIssue** (nếu Exchange)

### 📊 Database Schema Updates

```prisma
// New Enums
enum ReturnType { EXCHANGE, REFUND }
enum ReturnRequestStatus {
  PENDING, APPROVED, SHIPPING_BACK,
  RECEIVED, COMPLETED, REJECTED, CANCELLED
}
enum ItemReturnStatus {
  NONE, HAS_REQUEST, EXCHANGED, REFUNDED, REJECTED
}

// New Table
model ReturnRequest {
  id              String
  requestCode     String    @unique  // RET-123456
  orderId         String
  orderItemId     String    // One request per item
  type            ReturnType
  status          ReturnRequestStatus
  reason          String
  evidenceImages  String[]
  exchangeToSize  String?   // Target size for exchange
  exchangeToColor String?   // Target color for exchange
  bankInfo        Json?     // Refund bank details
  // ... timestamps, admin notes
}

// Updated
model OrderItem {
  returnStatus    ItemReturnStatus @default(NONE)
  returnRequests  ReturnRequest[]
}
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure Supabase
# - Get anon key from Supabase dashboard
# - Update .env file
# - Disable RLS on all tables

# 3. Run Prisma migrations
npx prisma generate
npx prisma db push

# 4. Seed database
npx tsx prisma/seed.ts

# 5. Start development server
npm run dev
```

## 🔑 Default Accounts

After seeding:

- **Admin:** `admin@sporthub.vn` → Redirects to `/admin`
- **Customer:** `customer@test.com` → Stays on homepage

## 📂 Project Structure

```
├── components/
│   ├── admin/
│   │   ├── ReturnManager.tsx    # NEW: Return request management
│   │   ├── OrderManager.tsx
│   │   └── ... (12 admin modules)
│   ├── features/
│   │   ├── cart/CartDrawer.tsx
│   │   └── product/ProductCard.tsx
│   └── layout/Layout.tsx
├── context/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── repositories/           # (deprecated)
├── pages/
│   ├── OrderDetailPage.tsx     # UPDATED: Per-item return UI
│   ├── AdminDashboard.tsx
│   └── ... (10 pages)
├── prisma/
│   ├── schema.prisma           # UPDATED: ReturnRequest table
│   ├── seed.ts
│   └── migrations/
│       ├── 20251229_initial_schema/
│       └── 20251230_add_return_request_table/  # NEW
├── services/                   # REFACTORED: Modular architecture
│   ├── index.ts                # Main export (backward compatible)
│   ├── shared.service.ts       # Shared utilities
│   ├── system.service.ts       # System config & logs
│   ├── product.service.ts      # Product operations
│   ├── order.service.ts        # Order management
│   └── return-request.service.ts  # NEW: Return/Exchange API
└── types/
    └── index.ts                # Type definitions
```

## 🎯 Features

### Customer Features

- 🛒 Product browsing & filtering (by category, brand, price)
- 🔍 Advanced search with filters
- 🛍️ Shopping cart with real-time stock validation
- 💳 Checkout with OTP verification
- 📦 Order tracking with timeline
- ⭐ Product reviews (5-star rating + comments)
- 🔁 **NEW: Per-item return/exchange requests**
  - Individual return button for each product
  - Exchange size/color configuration
  - Evidence image upload
  - Real-time status tracking

### Admin Features

- 📊 **Dashboard:** Revenue, orders, inventory metrics
- 📦 **Product Manager:** CRUD products, variants, attributes
- 🎫 **Order Manager:** Process orders, update shipping, view details
- 🔄 **NEW: Return Manager:**
  - Review return requests with evidence images
  - Approve/Reject workflow
  - Confirm received → Auto create StockEntry
  - Complete → Auto create StockIssue (for exchanges)
  - 7-status tracking system
- 📋 **Inventory System:** Stock entries, issues, stocktakes
- 👥 **Supplier Manager:** Manage suppliers
- 📏 **Size Guide Manager:** Configure size charts
- 🔐 **System Admin:** Config, logs, employee management
- 📈 **Business Reports:** Revenue & inventory analytics

## 🗃️ Database Schema

**16 Tables:**

- `User` - Users (admin, customer, sales, warehouse)
- `Product`, `ProductVariant`, `Review` - Product catalog
- `Category`, `Brand`, `ProductAttribute`, `SizeGuide` - Product metadata
- `Order`, `OrderItem` - Order management
- `Supplier` - Supplier information
- `StockEntry`, `StockIssue`, `Stocktake` - Warehouse operations
- `SystemConfig`, `SystemLog` - System configuration & audit logs

**Enums:**

- `UserRole`: ADMIN, SALES, WAREHOUSE, CUSTOMER
- `ProductStatus`: DRAFT, ACTIVE, OUT_OF_STOCK, DISCONTINUED
- `OrderStatus`: PENDING, CONFIRMED, PACKING, SHIPPING, COMPLETED, CANCELLED, etc.
- `PaymentMethod`: COD, BANK_TRANSFER, VNPAY, MOMO
- `PaymentStatus`: PENDING, PAID, FAILED, REFUNDED
- `StockEntryType`: PURCHASE, RETURN, ADJUSTMENT

## 📜 Scripts

```bash
# Development
npm run dev              # Start dev server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create/apply migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Verification
npx tsx scripts/verify-supabase-data.ts  # Verify seed data
bash scripts/setup-supabase.sh           # Show setup guide
bash scripts/quick-start.sh              # Auto setup
```

## 🔧 Troubleshooting

### "PrismaClient in browser" error

✅ **Fixed:** Replaced with Supabase REST API

### "Invalid API key"

1. Get anon key from Supabase dashboard
2. Update `.env` VITE_SUPABASE_KEY
3. Restart dev server

### Admin login redirects to customer page

✅ **Fixed:** Role normalization (ADMIN → admin)

### No data in database

Run: `npm run prisma:seed`

### RLS policy errors

Disable RLS: Run `prisma/disable-rls.sql` in Supabase SQL Editor

## 📝 Migration History

**Phase 1-5:** Mock data → Prisma + PostgreSQL (COMPLETED)
**Phase 6:** Prisma → Supabase REST API (COMPLETED)

- Reason: Prisma cannot run in browser (Vite SPA)
- Solution: Direct Supabase queries via `@supabase/supabase-js`

See: [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)

## 🤝 Contributing

This is a university project. For setup issues, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## 📄 License

MIT License - Educational purposes only
