#!/bin/bash

# ============================================================================
# SCRIPT KIỂM TRA SEED DATA - SportHub Management System
# ============================================================================
# Sử dụng Supabase REST API để kiểm tra seed data đã được nạp thành công
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         KIỂM TRA SEED DATA - SportHub System          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Không tìm thấy file .env${NC}"
    exit 1
fi

export $(cat .env | grep -v '^#' | xargs)

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env${NC}"
    exit 1
fi

API_URL="${VITE_SUPABASE_URL}/rest/v1"
HEADERS="apikey: ${VITE_SUPABASE_ANON_KEY}"

echo "🔍 Đang kiểm tra dữ liệu..."
echo ""

# Check Users
echo "👥 Users:"
curl -s -H "$HEADERS" "${API_URL}/User?select=email,fullName,role,phone" | jq -r '.[] | "  - \(.email) (\(.fullName)) - Role: \(.role) - Phone: \(.phone // "N/A")"'
echo ""

# Check Categories
echo "📁 Categories:"
curl -s -H "$HEADERS" "${API_URL}/Category?select=name,slug" | jq -r '.[] | "  - \(.name) (\(.slug))"'
echo ""

# Check Brands
echo "🏷️  Brands:"
curl -s -H "$HEADERS" "${API_URL}/Brand?select=name,country" | jq -r '.[] | "  - \(.name) (\(.country))"'
echo ""

# Check Size Guides
echo "📏 Size Guides:"
curl -s -H "$HEADERS" "${API_URL}/SizeGuide?select=name" | jq -r '.[] | "  - \(.name)"'
echo ""

# Check Attributes
echo "🎨 Product Attributes:"
curl -s -H "$HEADERS" "${API_URL}/ProductAttribute?select=name,code,type" | jq -r '.[] | "  - \(.name) (\(.code)) - Type: \(.type)"'
echo ""

# Check Suppliers
echo "🏭 Suppliers:"
curl -s -H "$HEADERS" "${API_URL}/Supplier?select=name,phone,email" | jq -r '.[] | "  - \(.name) - Phone: \(.phone) - Email: \(.email)"'
echo ""

# Check counts
echo "📊 Tổng quan:"
USER_COUNT=$(curl -s -H "$HEADERS" "${API_URL}/User?select=count" -H "Prefer: count=exact" | jq -r '.[0].count // 0')
CATEGORY_COUNT=$(curl -s -H "$HEADERS" "${API_URL}/Category?select=count" -H "Prefer: count=exact" | jq -r '.[0].count // 0')
BRAND_COUNT=$(curl -s -H "$HEADERS" "${API_URL}/Brand?select=count" -H "Prefer: count=exact" | jq -r '.[0].count // 0')
ATTR_COUNT=$(curl -s -H "$HEADERS" "${API_URL}/ProductAttribute?select=count" -H "Prefer: count=exact" | jq -r '.[0].count // 0')
SUPPLIER_COUNT=$(curl -s -H "$HEADERS" "${API_URL}/Supplier?select=count" -H "Prefer: count=exact" | jq -r '.[0].count // 0')

echo "  ✅ Users: $USER_COUNT"
echo "  ✅ Categories: $CATEGORY_COUNT"
echo "  ✅ Brands: $BRAND_COUNT"
echo "  ✅ Attributes: $ATTR_COUNT"
echo "  ✅ Suppliers: $SUPPLIER_COUNT"
echo ""

echo -e "${GREEN}✓ Kiểm tra hoàn tất!${NC}"
