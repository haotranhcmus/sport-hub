import { PrismaClient } from "@prisma/client";

export async function seedBrands(prisma: PrismaClient) {
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

  await prisma.brand.create({
    data: {
      id: "brand-new-balance",
      name: "New Balance",
      slug: "new-balance",
      country: "USA",
    },
  });

  await prisma.brand.create({
    data: {
      id: "brand-asics",
      name: "Asics",
      slug: "asics",
      country: "Japan",
    },
  });

  await prisma.brand.create({
    data: {
      id: "brand-mizuno",
      name: "Mizuno",
      slug: "mizuno",
      country: "Japan",
    },
  });

  await prisma.brand.create({
    data: {
      id: "brand-under-armour",
      name: "Under Armour",
      slug: "under-armour",
      country: "USA",
    },
  });

  console.log("✅ Created 7 brands");
}
