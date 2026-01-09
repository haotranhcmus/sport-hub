import { PrismaClient } from "@prisma/client";

export async function seedCategories(prisma: PrismaClient) {
  console.log("📁 Creating Categories...");

  // 1. Bóng Đá
  const categoryBongDa = await prisma.category.create({
    data: {
      id: "cat-bong-da",
      name: "Bóng Đá",
      slug: "bong-da",
      description: "Giày và trang phục bóng đá",
    },
  });

  // Danh mục con Bóng Đá
  await prisma.category.createMany({
    data: [
      {
        id: "cat-bd-giay",
        name: "Giày Bóng Đá",
        slug: "giay-bong-da",
        description: "Giày đá bóng chuyên nghiệp",
        parentId: "cat-bong-da",
      },
      {
        id: "cat-bd-ao",
        name: "Áo Bóng Đá",
        slug: "ao-bong-da",
        description: "Áo thi đấu và tập luyện",
        parentId: "cat-bong-da",
      },
      {
        id: "cat-bd-quan",
        name: "Quần Bóng Đá",
        slug: "quan-bong-da",
        description: "Quần đá bóng chuyên dụng",
        parentId: "cat-bong-da",
      },
    ],
  });

  // 2. Chạy Bộ
  const categoryChayBo = await prisma.category.create({
    data: {
      id: "cat-chay-bo",
      name: "Chạy Bộ",
      slug: "chay-bo",
      description: "Giày và trang phục chạy bộ",
    },
  });

  // Danh mục con Chạy Bộ
  await prisma.category.createMany({
    data: [
      {
        id: "cat-cb-giay",
        name: "Giày Chạy Bộ",
        slug: "giay-chay-bo",
        description: "Giày chạy bộ chuyên nghiệp",
        parentId: "cat-chay-bo",
      },
      {
        id: "cat-cb-ao",
        name: "Áo Chạy Bộ",
        slug: "ao-chay-bo",
        description: "Áo tập luyện và thi đấu",
        parentId: "cat-chay-bo",
      },
      {
        id: "cat-cb-quan",
        name: "Quần Chạy Bộ",
        slug: "quan-chay-bo",
        description: "Quần chạy bộ chuyên dụng",
        parentId: "cat-chay-bo",
      },
    ],
  });

  // 3. Gym & Fitness
  const categoryGym = await prisma.category.create({
    data: {
      id: "cat-gym",
      name: "Gym & Fitness",
      slug: "gym-fitness",
      description: "Trang phục và giày tập gym",
    },
  });

  // Danh mục con Gym & Fitness
  await prisma.category.createMany({
    data: [
      {
        id: "cat-gym-giay",
        name: "Giày Tập Gym",
        slug: "giay-tap-gym",
        description: "Giày tập gym và fitness",
        parentId: "cat-gym",
      },
      {
        id: "cat-gym-ao",
        name: "Áo Tập Gym",
        slug: "ao-tap-gym",
        description: "Áo tập gym và fitness",
        parentId: "cat-gym",
      },
      {
        id: "cat-gym-quan",
        name: "Quần Tập Gym",
        slug: "quan-tap-gym",
        description: "Quần tập gym chuyên dụng",
        parentId: "cat-gym",
      },
    ],
  });

  console.log("✅ Created 3 main categories with 9 subcategories");

  return {
    categoryBongDa,
    categoryChayBo,
    categoryGym,
  };
}
