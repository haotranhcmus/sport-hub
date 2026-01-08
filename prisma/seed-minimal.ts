// Minimal Seed Data - Only Essential Data
// No sample products - Admin can create their own






















































































































































echo ""echo -e "${YELLOW}💡 Lưu ý: Hệ thống không cần password, chỉ cần nhập email${NC}"echo ""echo -e "    URL: ${BLUE}http://localhost:3001/${NC}"echo -e "    Email: ${GREEN}customer@sporthub.vn${NC}"echo -e "  Customer Account:"echo ""echo -e "    URL: ${BLUE}http://localhost:3001/#/admin${NC}"echo -e "    Email: ${GREEN}admin@sporthub.vn${NC}"echo -e "  Admin Dashboard:"echo ""echo -e "${BLUE}📝 Thông tin đăng nhập:${NC}"echo ""echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"echo -e "${GREEN}║              ✅ RESET DATABASE THÀNH CÔNG              ║${NC}"echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"# ============================================================================# HOÀN THÀNH# ============================================================================echo ""echo -e "  Suppliers: ${GREEN}${SUPPLIER_COUNT}${NC}"echo -e "  Brands: ${GREEN}${BRAND_COUNT}${NC}"echo -e "  Categories: ${GREEN}${CATEGORY_COUNT}${NC}"echo -e "  Users: ${GREEN}${USER_COUNT}${NC}"SUPPLIER_COUNT=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c 'SELECT COUNT(*) FROM "Supplier";' 2>/dev/null | xargs)BRAND_COUNT=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c 'SELECT COUNT(*) FROM "Brand";' 2>/dev/null | xargs)CATEGORY_COUNT=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c 'SELECT COUNT(*) FROM "Category";' 2>/dev/null | xargs)USER_COUNT=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c 'SELECT COUNT(*) FROM "User";' 2>/dev/null | xargs)# Count records in key tablesecho ""echo -e "${BLUE}[4/4]${NC} Kiểm tra kết quả..."# ============================================================================# BƯỚC 5: XÁC NHẬN KẾT QUẢ# ============================================================================echo ""echo -e "${GREEN}✓ Database đã được reset thành công${NC}"echo ""fi    exit 1    echo -e "${RED}❌ Reset database thất bại${NC}"if [ $? -ne 0 ]; thennpx prisma migrate reset --forceecho ""echo -e "${BLUE}[3/4]${NC} Reset database và chạy migrations..."# ============================================================================# BƯỚC 4: RESET DATABASE VỚI PRISMA# ============================================================================echo ""fi    echo -e "${YELLOW}⚠️  Không thể tắt RLS (có thể đã tắt rồi)${NC}"else    echo -e "${GREEN}✓ Đã tắt RLS và cấp quyền cho REST API${NC}"if [ $? -eq 0 ]; thenPGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f prisma/disable-rls.sql > /dev/null 2>&1# Run disable RLS scriptDB_PASS=$(echo $DATABASE_URL | sed -n 's/.*\/\/.*:\(.*\)@.*/\1/p')DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\(.*\):.*/\1/p')DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)/\1/p')DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')# Extract database credentials from DATABASE_URLecho -e "${BLUE}[2/4]${NC} Tắt RLS (Row Level Security) cho Supabase REST API..."# ============================================================================# BƯỚC 3: TẮT RLS (ROW LEVEL SECURITY)# ============================================================================echo ""echo -e "${GREEN}✓ Biến môi trường OK${NC}"fi    exit 1    echo -e "${RED}❌ DATABASE_URL không được định nghĩa trong .env${NC}"if [ -z "$DATABASE_URL" ]; thenexport $(cat .env | grep -v '^#' | xargs)# Load .env filefi    exit 1    echo -e "${RED}❌ Không tìm thấy file .env${NC}"if [ ! -f .env ]; thenecho -e "${BLUE}[1/4]${NC} Kiểm tra biến môi trường..."# ============================================================================# BƯỚC 2: KIỂM TRA BIẾN MÔI TRƯỜNG# ============================================================================echo ""echo -e "${GREEN}✓ Đã xác nhận. Bắt đầu reset database...${NC}"echo ""fi    exit 1    echo -e "${RED}❌ Đã hủy thao tác reset database${NC}"if [ "$confirm" != "yes" ]; thenread -p "Bạn có chắc chắn muốn tiếp tục? (yes/no): " confirmecho ""echo "  - 1 System Config"echo "  - 3 Suppliers"echo "  - 4 Attributes (Màu sắc, Size, Chất liệu)"echo "  - 2 Size Guides (Giày, Áo)"echo "  - 3 Brands (Nike, Adidas, Puma)"echo "  - 3 Categories (Bóng Đá, Bóng Rổ, Chạy Bộ)"echo "  - 2 Users (Admin + Customer)"echo "Dữ liệu sẽ được reset về trạng thái ban đầu với:"echo ""echo -e "${YELLOW}⚠️  CẢNH BÁO: Script này sẽ XÓA TOÀN BỘ DỮ LIỆU hiện tại!${NC}"# ============================================================================# BƯỚC 1: XÁC NHẬN# ============================================================================echo ""echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"echo -e "${BLUE}║     RESET DATABASE - SportHub Management System       ║${NC}"echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"NC='\033[0m' # No ColorBLUE='\033[0;34m'YELLOW='\033[1;33m'GREEN='\033[0;32m'RED='\033[0;31m'# Colors for outputset -e  # Exit on error# ============================================================================# 5. Seed data với categories, brands, suppliers, attributes# 4. Chạy migrations# 3. Reset database về trạng thái ban đầu# 2. Tắt RLS (Row Level Security) để Supabase REST API hoạt động# 1. Xác nhận với người dùng trước khi reset# Script này sẽ:# ============================================================================# SCRIPT RESET DATABASE AN TOÀN# ============================================================================import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting minimal database seed...");

  // ============================================================================
  // 1. Clear existing data
  // ============================================================================
  console.log("🗑️  Clearing existing data...");

  await prisma.systemLog.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.stockEntry.deleteMany();
  await prisma.stockIssue.deleteMany();
  await prisma.stocktake.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.sizeGuide.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

  console.log("✅ Cleared existing data");

  // ============================================================================
  // 2. Create Users
  // ============================================================================
  console.log("👤 Creating Users...");

  // Admin User
  await prisma.user.create({
    data: {
      id: "admin-001",
      email: "admin@sporthub.vn",
      fullName: "Quản Trị Viên",
      phone: "0999888777",
      role: "ADMIN",
      status: "active",
      staffId: "ADMIN-001",
      addresses: [
        {
          id: "addr-admin-1",
          name: "Quản Trị Viên",
          phone: "0999888777",
          address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
          label: "Văn phòng",
          isDefault: true,
        },
      ],
    },
  });

  // Customer User
  await prisma.user.create({
    data: {
      id: "customer-001",
      email: "customer@sporthub.vn",
      fullName: "Khách Hàng Demo",
      phone: "0912345678",
      role: "CUSTOMER",
      status: "active",
      addresses: [
        {
          id: "addr-customer-1",
          name: "Khách Hàng Demo",
          phone: "0912345678",
          address: "456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
          label: "Nhà riêng",
          isDefault: true,
        },
      ],
    },
  });

  console.log("✅ Created admin and customer users");

  // ============================================================================
  // 3. Create Categories
  // ============================================================================
  console.log("📁 Creating Categories...");

  const categoryBongDa = await prisma.category.create({
    data: {
      id: "cat-bong-da",
      name: "Bóng Đá",
      slug: "bong-da",
      description: "Dụng cụ và trang phục bóng đá",
    },
  });

  const categoryBongRo = await prisma.category.create({
    data: {
      id: "cat-bong-ro",
      name: "Bóng Rổ",
      slug: "bong-ro",
      description: "Dụng cụ và trang phục bóng rổ",
    },
  });

  const categoryChayBo = await prisma.category.create({
    data: {
      id: "cat-chay-bo",
      name: "Chạy Bộ",
      slug: "chay-bo",
      description: "Giày và phụ kiện chạy bộ",
    },
  });

  console.log("✅ Created 3 categories");

  // ============================================================================
  // 4. Create Brands
  // ============================================================================
  console.log("🏷️  Creating Brands...");

  await prisma.brand.create({
    data: {
      id: "brand-nike",
      name: "Nike",
      slug: "nike",
      country: "USA",
    },
  });

  await prisma.brand.create({
    data: {
      id: "brand-adidas",
      name: "Adidas",
      slug: "adidas",
      country: "Germany",
    },
  });

  await prisma.brand.create({
    data: {
      id: "brand-puma",
      name: "Puma",
      slug: "puma",
      country: "Germany",
    },
  });

  console.log("✅ Created 3 brands");

  // ============================================================================
  // 5. Create Size Guides
  // ============================================================================
  console.log("📏 Creating Size Guides...");

  const sizeGuideGiay = await prisma.sizeGuide.create({
    data: {
      id: "sg-giay",
      name: "Bảng Size Giày",
      description: "Hướng dẫn chọn size giày thể thao",
      columns: ["Size", "Chiều dài bàn chân (cm)", "Phù hợp"],
      rows: [
        { size: "39", length: "24.5-25", fit: "Nữ S, Nam XS" },
        { size: "40", length: "25-25.5", fit: "Nữ M, Nam S" },
        { size: "41", length: "25.5-26", fit: "Nữ L, Nam M" },
        { size: "42", length: "26-26.5", fit: "Nam M-L" },
        { size: "43", length: "26.5-27", fit: "Nam L" },
        { size: "44", length: "27-27.5", fit: "Nam XL" },
      ],
    },
  });

  const sizeGuideAo = await prisma.sizeGuide.create({
    data: {
      id: "sg-ao",
      name: "Bảng Size Áo",
      description: "Hướng dẫn chọn size áo thể thao",
      columns: ["Size", "Chiều cao (cm)", "Cân nặng (kg)"],
      rows: [
        { size: "S", height: "155-165", weight: "45-55" },
        { size: "M", height: "165-172", weight: "55-65" },
        { size: "L", height: "172-178", weight: "65-75" },
        { size: "XL", height: "178-185", weight: "75-85" },
        { size: "XXL", height: "185+", weight: "85+" },
      ],
    },
  });

  console.log("✅ Created 2 size guides");

  // ============================================================================
  // 6. Create Product Attributes
  // ============================================================================
  console.log("🎨 Creating Product Attributes...");

  // Màu sắc
  await prisma.productAttribute.create({
    data: {
      id: "attr-mau-sac",
      name: "Màu sắc",
      type: "color",
      values: ["Đen", "Trắng", "Đỏ", "Xanh dương", "Xanh lá", "Vàng"],
      categories: {
        connect: [
          { id: categoryBongDa.id },
          { id: categoryBongRo.id },
          { id: categoryChayBo.id },
        ],
      },
    },
  });

  // Kích thước giày
  await prisma.productAttribute.create({
    data: {
      id: "attr-size-giay",
      name: "Size giày",
      type: "size",
      values: ["39", "40", "41", "42", "43", "44"],
      categories: {
        connect: [
          { id: categoryBongDa.id },
          { id: categoryBongRo.id },
          { id: categoryChayBo.id },
        ],
      },
    },
  });

  // Kích thước áo
  await prisma.productAttribute.create({
    data: {
      id: "attr-size-ao",
      name: "Size áo",
      type: "size",
      values: ["S", "M", "L", "XL", "XXL"],
      categories: {
        connect: [
          { id: categoryBongDa.id },
          { id: categoryBongRo.id },
          { id: categoryChayBo.id },
        ],
      },
    },
  });

  // Chất liệu
  await prisma.productAttribute.create({
    data: {
      id: "attr-chat-lieu",
      name: "Chất liệu",
      type: "text",
      values: ["Da thật", "Da tổng hợp", "Vải mesh", "Polyester", "Cotton"],
      categories: {
        connect: [
          { id: categoryBongDa.id },
          { id: categoryBongRo.id },
          { id: categoryChayBo.id },
        ],
      },
    },
  });

  console.log("✅ Created 4 product attributes");

  // ============================================================================
  // 7. Create Suppliers
  // ============================================================================
  console.log("🏭 Creating Suppliers...");

  await prisma.supplier.create({
    data: {
      id: "supplier-001",
      name: "Công ty TNHH Thể Thao Việt Nam",
      code: "TTVN",
      phone: "0283123456",
      email: "contact@thethaovn.com",
      address: "123 Lê Văn Việt, Quận 9, TP.HCM",
      taxCode: "0123456789",
      status: "active",
    },
  });

  await prisma.supplier.create({
    data: {
      id: "supplier-002",
      name: "Nhà Phân Phối Nike Việt Nam",
      code: "NIKE-VN",
      phone: "0283234567",
      email: "sales@nikevn.com",
      address: "456 Nguyễn Trãi, Quận 5, TP.HCM",
      taxCode: "0987654321",
      status: "active",
    },
  });

  await prisma.supplier.create({
    data: {
      id: "supplier-003",
      name: "Adidas Official Store Vietnam",
      code: "ADIDAS-VN",
      phone: "0283345678",
      email: "info@adidasvn.com",
      address: "789 Võ Văn Tần, Quận 3, TP.HCM",
      taxCode: "0123987654",
      status: "active",
    },
  });

  console.log("✅ Created 3 suppliers");

  // ============================================================================
  // 8. Create System Config
  // ============================================================================
  console.log("⚙️  Creating System Config...");

  await prisma.systemConfig.create({
    data: {
      id: "config-001",
      websiteTitle: "SportHub - Hệ Thống Quản Lý Đồ Thể Thao",
      logoUrl: "/logo.png",
      hotline: "1900-xxxx",
      contactEmail: "support@sporthub.vn",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
      vatRate: 8,
      lowStockThreshold: 5,
      returnPeriodDays: 7,
      banners: [],
    },
  });

  console.log("✅ Created system config");

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n📊 Seed Summary:");
  console.log("  👥 Users:");
  console.log("     ✅ Admin: admin@sporthub.vn (Role: ADMIN)");
  console.log("     ✅ Customer: customer@sporthub.vn (Role: CUSTOMER)");
  console.log("  📁 Categories: 3 (Bóng Đá, Bóng Rổ, Chạy Bộ)");
  console.log("  🏷️  Brands: 3 (Nike, Adidas, Puma)");
  console.log("  📏 Size Guides: 2 (Giày, Áo)");
  console.log("  🎨 Attributes: 4 (Màu sắc, Size giày, Size áo, Chất liệu)");
  console.log("  🏭 Suppliers: 3");
  console.log("  ⚙️  System Config: 1");
  console.log(
    "\n  ℹ️  Ready to create products through Admin UI"
  );
  console.log("\n✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
