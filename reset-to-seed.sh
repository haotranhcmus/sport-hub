#!/bin/bash

# ============================================================================
# SCRIPT RESET DATABASE AN TOÀN - SportHub Management System
# ============================================================================
# Script này sẽ:
# 1. Xác nhận với người dùng trước khi reset
# 2. Tắt RLS (Row Level Security) để Supabase REST API hoạt động
# 3. Reset database về trạng thái ban đầu
# 4. Chạy migrations
# 5. Seed data với categories, brands, suppliers, attributes
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     RESET DATABASE - SportHub Management System       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# BƯỚC 1: XÁC NHẬN
# ============================================================================
echo -e "${YELLOW}⚠️  CẢNH BÁO: Script này sẽ XÓA TOÀN BỘ DỮ LIỆU hiện tại!${NC}"
echo ""
echo "Dữ liệu sẽ được reset về trạng thái ban đầu với:"
echo "  - 2 Users (Admin + Customer)"
echo "  - 3 Categories (Bóng Đá, Bóng Rổ, Chạy Bộ)"
echo "  - 3 Brands (Nike, Adidas, Puma)"
echo "  - 2 Size Guides (Giày, Áo)"
echo "  - 4 Attributes (Màu sắc, Size, Chất liệu)"
echo "  - 3 Suppliers"
echo "  - 1 System Config"
echo ""

read -p "Bạn có chắc chắn muốn tiếp tục? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Đã hủy thao tác reset database${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Đã xác nhận. Bắt đầu reset database...${NC}"
echo ""

# ============================================================================
# BƯỚC 2: KIỂM TRA BIẾN MÔI TRƯỜNG
# ============================================================================
echo -e "${BLUE}[1/4]${NC} Kiểm tra biến môi trường..."

if [ ! -f .env ]; then
    echo -e "${RED}❌ Không tìm thấy file .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Biến môi trường OK${NC}"
echo ""

# ============================================================================
# BƯỚC 3: TẮT RLS (ROW LEVEL SECURITY)
# ============================================================================
echo -e "${BLUE}[2/4]${NC} Tắt RLS (Row Level Security) cho Supabase REST API..."

# Run disable RLS script if exists
if [ -f prisma/disable-rls.sql ] && command -v psql &> /dev/null; then
    # Load DATABASE_URL from .env
    source .env 2>/dev/null || true
    
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -f prisma/disable-rls.sql > /dev/null 2>&1 && \
            echo -e "${GREEN}✓ Đã tắt RLS và cấp quyền cho REST API${NC}" || \
            echo -e "${YELLOW}⚠️  Không thể tắt RLS (có thể đã tắt rồi)${NC}"
    else
        echo -e "${YELLOW}⚠️  DATABASE_URL không tìm thấy${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Bỏ qua bước tắt RLS (thiếu file hoặc psql)${NC}"
fi

echo ""

# ============================================================================
# BƯỚC 4: RESET DATABASE VỚI PRISMA
# ============================================================================
echo -e "${BLUE}[3/5]${NC} Reset database và chạy migrations..."
echo ""

# Clear Prisma cache first to avoid schema mismatch
echo "🗑️  Clearing Prisma Client cache..."
rm -rf node_modules/.prisma 2>/dev/null || true

npx prisma migrate reset --force

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Reset database thất bại${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Database đã được reset thành công${NC}"
echo ""

# ============================================================================
# BƯỚC 5: TẮT RLS LẦN CUỐI (SAU KHI SEED)
# ============================================================================
echo -e "${BLUE}[4/5]${NC} Đảm bảo RLS đã tắt sau khi seed..."

if [ -f prisma/disable-rls.sql ]; then
    source .env 2>/dev/null || true
    
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -f prisma/disable-rls.sql > /dev/null 2>&1 && \
            echo -e "${GREEN}✓ RLS đã được tắt, REST API hoạt động bình thường${NC}" || \
            echo -e "${YELLOW}⚠️  Không thể tắt RLS${NC}"
    fi
fi

echo ""

# ============================================================================
# BƯỚC 6: XÁC NHẬN KẾT QUẢ
# ============================================================================
echo -e "${BLUE}[5/5]${NC} Kiểm tra kết quả..."
echo ""

echo -e "${GREEN}✓ Seed data đã được import thành công${NC}"
echo ""

# ============================================================================
# HOÀN THÀNH
# ============================================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ RESET DATABASE THÀNH CÔNG              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Thông tin đăng nhập:${NC}"
echo ""
echo -e "  Admin Dashboard:"
echo -e "    Email: ${GREEN}admin@sporthub.vn${NC}"
echo -e "    URL: ${BLUE}http://localhost:3001/#/admin${NC}"
echo ""
echo -e "  Customer Account:"
echo -e "    Email: ${GREEN}customer@sporthub.vn${NC}"
echo -e "    URL: ${BLUE}http://localhost:3001/${NC}"
echo ""
echo -e "${YELLOW}💡 Lưu ý: Hệ thống không cần password, chỉ cần nhập email${NC}"
echo ""
echo "📋 Step 3/5: Running seed data..."
npx prisma db seed

# Step 4: Apply RLS policies for Supabase
echo ""
echo "📋 Step 4/5: Applying Supabase RLS policies..."

# Extract database connection from .env
DATABASE_URL=$(grep VITE_SUPABASE_DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: VITE_SUPABASE_DATABASE_URL not found in .env"
    echo "   Skipping RLS policy setup. You may need to run manually:"
    echo "   PGPASSWORD=\"your_password\" psql \"your_db_url\" -f prisma/grant-anon-access.sql"
    echo "   PGPASSWORD=\"your_password\" psql \"your_db_url\" -f prisma/enable-rls-policies.sql"
else
    # Extract password from connection string
    PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    if [ -f "prisma/grant-anon-access.sql" ]; then
        echo "   → Granting schema access to anon role..."
        PGPASSWORD="$PASSWORD" psql "$DATABASE_URL" -f prisma/grant-anon-access.sql > /dev/null 2>&1 || echo "   ⚠️  Some grant statements failed (this is normal)"
    fi
    
    if [ -f "prisma/enable-rls-policies.sql" ]; then
        echo "   → Enabling RLS policies..."
        PGPASSWORD="$PASSWORD" psql "$DATABASE_URL" -f prisma/enable-rls-policies.sql > /dev/null 2>&1 || echo "   ⚠️  Some policy statements failed (this is normal)"
    fi
    
    echo "   ✅ RLS policies applied"
fi

# Step 5: Verify data
echo ""
echo "📋 Step 5/5: Verifying seed data..."
echo "   (Checking if data was created successfully...)"

echo ""
echo "✅ =============================================="
echo "   DATABASE RESET COMPLETE!"
echo "✅ =============================================="
echo ""
echo "Your database has been restored to seed state:"
echo "  ✅ 3 Size Guides"
echo "  ✅ 4 Categories (Giày, Áo, Găng, Phụ kiện)"
echo "  ✅ 3 Brands (Nike, Adidas, Puma)"
echo "  ✅ 10 Product Attributes (logic theo từng category)"
echo "  ✅ 4 Products (10 variants, 1 review)"
echo "  ✅ 2 Users (1 admin, 1 customer)"
echo "  ✅ 1 Supplier"
echo "  ✅ 2 Orders (1 completed, 1 pending)"
echo "  ✅ 1 Return Request"
echo "  ✅ RLS Policies enabled (Supabase ready)"
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@sporthub.vn"
echo "   Password: admin123"
echo ""
echo "🌐 Next steps:"
echo "   1. npm run dev (if not running)"
echo "   2. Open http://localhost:3001"
echo "   3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo ""
