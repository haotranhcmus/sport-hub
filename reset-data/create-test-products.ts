import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestProducts() {
  console.log("🧪 Creating test products for Phase 3 verification...\n");

  // Delete existing test products first
  await prisma.product.deleteMany({
    where: {
      productCode: {
        startsWith: "TEST-",
      },
    },
  });

  // Get category and brand
  const category = await prisma.category.findFirst({
    where: { slug: "giay-bong-da" },
  });

  const brand = await prisma.brand.findFirst({
    where: { slug: "nike" },
  });

  if (!category || !brand) {
    console.error("❌ Category or Brand not found. Run seed.ts first!");
    return;
  }

  // Product 1: Giày có freeShipping
  const product1 = await prisma.product.create({
    data: {
      productCode: "TEST-FREESHIP-001",
      modelCode: "FS001",
      name: "Giày Test FreeShip",
      slug: "giay-test-freeship",
      description: "Sản phẩm test có miễn phí ship",
      basePrice: 500000,
      promotionalPrice: 450000,
      thumbnailUrl: "https://via.placeholder.com/400",
      categoryId: category.id,
      brandId: brand.id,
      freeShipping: true, // ✅ Miễn phí ship
      allowReturn: true,
      returnPeriod: 7,
      status: "ACTIVE",
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "FS001-RED-42",
      productId: product1.id,
      color: "Đỏ",
      size: "42",
      imageUrl: "https://via.placeholder.com/400",
      stockQuantity: 50,
    },
  });

  console.log("✅ Created Product 1: Giày FreeShip (freeShipping = true)");

  // Product 2: Áo KHÔNG freeShipping
  const product2 = await prisma.product.create({
    data: {
      productCode: "TEST-NORMAL-002",
      modelCode: "NM002",
      name: "Áo Test Thường",
      slug: "ao-test-thuong",
      description: "Sản phẩm test KHÔNG miễn phí ship",
      basePrice: 300000,
      thumbnailUrl: "https://via.placeholder.com/400",
      categoryId: category.id,
      brandId: brand.id,
      freeShipping: false, // ❌ Có phí ship
      allowReturn: true,
      returnPeriod: 7,
      status: "ACTIVE",
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "NM002-BLK-M",
      productId: product2.id,
      color: "Đen",
      size: "M",
      imageUrl: "https://via.placeholder.com/400",
      stockQuantity: 100,
    },
  });

  console.log("✅ Created Product 2: Áo Thường (freeShipping = false)");

  // Product 3: Quần KHÔNG freeShipping
  const product3 = await prisma.product.create({
    data: {
      productCode: "TEST-NORMAL-003",
      modelCode: "NM003",
      name: "Quần Test Thường",
      slug: "quan-test-thuong",
      description: "Sản phẩm test KHÔNG miễn phí ship",
      basePrice: 200000,
      thumbnailUrl: "https://via.placeholder.com/400",
      categoryId: category.id,
      brandId: brand.id,
      freeShipping: false, // ❌ Có phí ship
      allowReturn: true,
      returnPeriod: 7,
      status: "ACTIVE",
    },
  });

  await prisma.productVariant.create({
    data: {
      sku: "NM003-BLU-L",
      productId: product3.id,
      color: "Xanh",
      size: "L",
      imageUrl: "https://via.placeholder.com/400",
      stockQuantity: 80,
    },
  });

  console.log("✅ Created Product 3: Quần Thường (freeShipping = false)");

  console.log("\n📊 Test Products Summary:");
  console.log("  🟢 Product 1: Giày FreeShip - 450,000đ (FREE SHIP)");
  console.log("  🔴 Product 2: Áo Thường - 300,000đ (CÓ PHÍ SHIP)");
  console.log("  🔴 Product 3: Quần Thường - 200,000đ (CÓ PHÍ SHIP)");
  console.log("\n🧪 TEST SCENARIOS:");
  console.log("  1️⃣ Mua 1 Giày FreeShip → Phí ship: 0đ");
  console.log("  2️⃣ Mua 1 Áo Thường (HCM) → Phí ship: 20,000đ");
  console.log("  3️⃣ Mua Giày + Áo (HCM) → Phí ship: 20,000đ (chỉ áo)");
  console.log("  4️⃣ Mua Áo + Quần (HCM) → Phí ship: 30,000đ (20k + 10k)");
  console.log("  5️⃣ Mua Giày + Áo + Quần (HCM) → Phí ship: 30,000đ");

  await prisma.$disconnect();
}

createTestProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
