// Complete Seed Data - SportHub Management System
// Includes: Users, Categories, Brands, Size Guides, Attributes, Suppliers, System Config
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

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

  await prisma.sizeGuide.create({
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

  await prisma.sizeGuide.create({
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
      code: "mau-sac",
      type: "color",
      values: ["Đen", "Trắng", "Đỏ", "Xanh dương", "Xanh lá", "Vàng"],
      categoryIds: [categoryBongDa.id, categoryBongRo.id, categoryChayBo.id],
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
      code: "size-giay",
      type: "size",
      values: ["39", "40", "41", "42", "43", "44"],
      categoryIds: [categoryBongDa.id, categoryBongRo.id, categoryChayBo.id],
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
      code: "size-ao",
      type: "size",
      values: ["S", "M", "L", "XL", "XXL"],
      categoryIds: [categoryBongDa.id, categoryBongRo.id, categoryChayBo.id],
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
      code: "chat-lieu",
      type: "text",
      values: ["Da thật", "Da tổng hợp", "Vải mesh", "Polyester", "Cotton"],
      categoryIds: [categoryBongDa.id, categoryBongRo.id, categoryChayBo.id],
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
      contactPerson: "Nguyễn Văn A",
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
      contactPerson: "Trần Thị B",
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
      contactPerson: "Lê Văn C",
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
  console.log("\n  ℹ️  Ready to create products through Admin UI");
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
