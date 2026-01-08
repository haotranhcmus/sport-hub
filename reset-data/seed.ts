import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeds/users.seed";
import { seedCategories } from "./seeds/categories.seed";
import { seedBrands } from "./seeds/brands.seed";
import { seedSizeGuides } from "./seeds/size-guides.seed";
import { seedAttributes } from "./seeds/attributes.seed";
import { seedSuppliers } from "./seeds/suppliers.seed";
import { seedSystemConfig } from "./seeds/system-config.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");

  // Clear in reverse dependency order
  await prisma.$executeRaw`TRUNCATE TABLE "SystemLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Stocktake" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ReturnRequest" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "OrderItem" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Order" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Review" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ProductVariant" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Product" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "StockIssue" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "StockEntry" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Supplier" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "_CategoryToProductAttribute" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ProductAttribute" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Category" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "SizeGuide" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Brand" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "SystemConfig" CASCADE`;

  console.log("✅ Cleared existing data");

  // Seed data in order
  const { admin, customer } = await seedUsers(prisma);
  const categories = await seedCategories(prisma);
  await seedBrands(prisma);
  await seedSizeGuides(prisma);
  await seedAttributes(prisma); // Không cần truyền categories nữa
  await seedSuppliers(prisma);
  await seedSystemConfig(prisma);

  console.log("\n📊 Seed Summary:");
  console.log("  👥 Users:");
  console.log(`     ✅ Admin: ${admin.email} (Role: ${admin.role})`);
  console.log(`     ✅ Customer: ${customer.email} (Role: ${customer.role})`);
  console.log(
    "     ✅ Total: 5 users (1 admin, 2 customers, 1 sales, 1 warehouse)"
  );
  console.log(
    "  📁 Categories: 6 (Bóng Đá, Bóng Rổ, Chạy Bộ, Tennis, Cầu Lông, Gym)"
  );
  console.log(
    "  🏷️  Brands: 7 (Nike, Adidas, Puma, New Balance, Asics, Mizuno, Under Armour)"
  );
  console.log("  📏 Size Guides: 3 (Giày, Áo, Quần)");
  console.log(
    "  🎨 Attributes: 14 (Màu sắc, Size, Chất liệu, Công nghệ, v.v.)"
  );
  console.log("  🏭 Suppliers: 5");
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
