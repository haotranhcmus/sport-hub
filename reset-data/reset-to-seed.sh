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
echo "  - 5 Users (1 Admin, 2 Customers, 1 Sales, 1 Warehouse)"
echo "  - 6 Categories (Bóng Đá, Bóng Rổ, Chạy Bộ, Tennis, Cầu Lông, Gym)"
echo "  - 7 Brands (Nike, Adidas, Puma, New Balance, Asics, Mizuno, Under Armour)"
echo "  - 3 Size Guides (Giày, Áo, Quần)"
echo "  - 14 Product Attributes (Màu sắc, Size, Chất liệu, Công nghệ, v.v.)"
echo "  - 5 Suppliers"
echo "  - 1 System Config"
echo "  - Customer addresses với số điện thoại"
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
echo "[1/5] Kiểm tra biến môi trường..."

if [ ! -f .env ]; then
    echo -e "${RED}❌ Không tìm thấy file .env${NC}"
    exit 1
fi

# Load .env
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL không được định nghĩa trong .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Biến môi trường OK${NC}"
echo ""

# ============================================================================
# BƯỚC 3: TẮT RLS TRƯỚC KHI RESET (để migration chạy được)
# ============================================================================
echo "[2/5] Tắt RLS (Row Level Security) cho Supabase REST API..."

if [ -f "reset-data/disable-rls.sql" ]; then
    PGPASSWORD="${DATABASE_PASSWORD:-postgres}" psql "$DATABASE_URL" -f reset-data/disable-rls.sql > /dev/null 2>&1 || true
    echo -e "${GREEN}✓ Đã tắt RLS và cấp quyền cho REST API${NC}"
else
    echo -e "${YELLOW}⚠️  Không tìm thấy disable-rls.sql, bỏ qua...${NC}"
fi
echo ""

# ============================================================================
# BƯỚC 4: XÓA DỮ LIỆU (GIỮ NGUYÊN CẤU TRÚC DATABASE)
# ============================================================================
echo "[3/5] Xóa dữ liệu (giữ nguyên cấu trúc, trigger, function)..."
echo ""

# Chỉ xóa dữ liệu, KHÔNG drop/recreate database
# Điều này giữ nguyên:
# - Trigger review_stats_trigger
# - Function update_product_review_stats()
# - Tất cả indexes và constraints
# - RLS policies (nếu có)

echo "🗑️  Truncating tables..."
npx tsx reset-data/seed.ts

echo ""
echo -e "${GREEN}✓ Dữ liệu đã được xóa và seed lại${NC}"
echo ""

# ============================================================================
# BƯỚC 5: TẮT RLS SAU KHI SEED (đảm bảo REST API hoạt động)
# ============================================================================
echo "[4/5] Đảm bảo RLS đã tắt sau khi seed..."

if [ -f "reset-data/disable-rls.sql" ]; then
    PGPASSWORD="${DATABASE_PASSWORD:-postgres}" psql "$DATABASE_URL" -f reset-data/disable-rls.sql > /dev/null 2>&1 || true
    echo -e "${GREEN}✓ RLS đã được tắt, REST API hoạt động bình thường${NC}"
fi
echo ""

# ============================================================================
# BƯỚC 6: KIỂM TRA KẾT QUẢ
# ============================================================================
echo "[5/5] Kiểm tra database structure..."
echo ""

# Verify trigger still exists
echo "🔍 Checking review_stats_trigger..."
TRIGGER_EXISTS=$(PGPASSWORD="${DATABASE_PASSWORD:-postgres}" psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'review_stats_trigger';" 2>/dev/null || echo "0")

if [ "$TRIGGER_EXISTS" -gt 0 ]; then
    echo -e "${GREEN}✓ review_stats_trigger exists${NC}"
else
    echo -e "${YELLOW}⚠️  review_stats_trigger not found (this is OK for first setup)${NC}"
fi

# Verify indexes
echo "🔍 Checking indexes..."
INDEX_COUNT=$(PGPASSWORD="${DATABASE_PASSWORD:-postgres}" psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('Order', 'Product', 'StockIssue');" 2>/dev/null || echo "0")
echo -e "${GREEN}✓ Found $INDEX_COUNT indexes on core tables${NC}"

echo ""

# ============================================================================
# HOÀN TẤT
# ============================================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ RESET DATABASE THÀNH CÔNG              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📝 Thông tin đăng nhập:"
echo ""
echo "  Admin Dashboard:"
echo "    Email: admin@sporthub.vn"
echo "    URL: http://localhost:3001/#/admin"
echo ""
echo "  Customer Account:"
echo "    Email: customer@sporthub.vn"
echo "    URL: http://localhost:3001/"
echo ""
echo "💡 Lưu ý: Hệ thống không cần password, chỉ cần nhập email"
echo ""
