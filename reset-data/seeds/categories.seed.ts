import { PrismaClient } from "@prisma/client";

export async function seedCategories(prisma: PrismaClient) {
  console.log("📁 Creating Categories...");

  // Bóng Đá
  const categoryBongDa = await prisma.category.create({
    data: {
      id: "cat-bong-da",
      name: "Bóng Đá",
      slug: "bong-da",
      description: "Giày và phụ kiện bóng đá",
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
      {
        id: "cat-bd-balo",
        name: "Balo & Túi",
        slug: "balo-tui-bong-da",
        description: "Balo và túi đựng dụng cụ",
        parentId: "cat-bong-da",
      },
      {
        id: "cat-bd-phukien",
        name: "Phụ Kiện",
        slug: "phu-kien-bong-da",
        description: "Găng tay thủ môn, tất, băng đội...",
        parentId: "cat-bong-da",
      },
    ],
  });

  // Bóng Rổ
  const categoryBongRo = await prisma.category.create({
    data: {
      id: "cat-bong-ro",
      name: "Bóng Rổ",
      slug: "bong-ro",
      description: "Giày và phụ kiện bóng rổ",
    },
  });

  // Danh mục con Bóng Rổ
  await prisma.category.createMany({
    data: [
      {
        id: "cat-br-giay",
        name: "Giày Bóng Rổ",
        slug: "giay-bong-ro",
        description: "Giày bóng rổ chuyên nghiệp",
        parentId: "cat-bong-ro",
      },
      {
        id: "cat-br-ao",
        name: "Áo Bóng Rổ",
        slug: "ao-bong-ro",
        description: "Áo thi đấu và tập luyện",
        parentId: "cat-bong-ro",
      },
      {
        id: "cat-br-quan",
        name: "Quần Bóng Rổ",
        slug: "quan-bong-ro",
        description: "Quần bóng rổ chuyên dụng",
        parentId: "cat-bong-ro",
      },
      {
        id: "cat-br-balo",
        name: "Balo & Túi",
        slug: "balo-tui-bong-ro",
        description: "Balo và túi đựng dụng cụ",
        parentId: "cat-bong-ro",
      },
      {
        id: "cat-br-phukien",
        name: "Phụ Kiện",
        slug: "phu-kien-bong-ro",
        description: "Băng đầu, tất, bảo vệ...",
        parentId: "cat-bong-ro",
      },
    ],
  });

  // Chạy Bộ
  const categoryChayBo = await prisma.category.create({
    data: {
      id: "cat-chay-bo",
      name: "Chạy Bộ",
      slug: "chay-bo",
      description: "Giày và phụ kiện chạy bộ",
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
      {
        id: "cat-cb-dongho",
        name: "Đồng Hồ Thể Thao",
        slug: "dong-ho-the-thao",
        description: "Đồng hồ GPS, smartwatch",
        parentId: "cat-chay-bo",
      },
      {
        id: "cat-cb-phukien",
        name: "Phụ Kiện",
        slug: "phu-kien-chay-bo",
        description: "Túi đeo, băng tay, mũ...",
        parentId: "cat-chay-bo",
      },
    ],
  });

  // Tennis & Pickleball
  const categoryTennisPickleball = await prisma.category.create({
    data: {
      id: "cat-tennis-pickleball",
      name: "Tennis & Pickleball",
      slug: "tennis-pickleball",
      description: "Giày và phụ kiện tennis, pickleball",
    },
  });

  // Danh mục con Tennis & Pickleball
  await prisma.category.createMany({
    data: [
      {
        id: "cat-tn-giay",
        name: "Giày Tennis",
        slug: "giay-tennis",
        description: "Giày tennis chuyên nghiệp",
        parentId: "cat-tennis-pickleball",
      },
      {
        id: "cat-tn-vot",
        name: "Vợt Tennis",
        slug: "vot-tennis",
        description: "Vợt tennis các loại",
        parentId: "cat-tennis-pickleball",
      },
      {
        id: "cat-tn-ao",
        name: "Áo Tennis",
        slug: "ao-tennis",
        description: "Áo thi đấu tennis",
        parentId: "cat-tennis-pickleball",
      },
      {
        id: "cat-tn-quan",
        name: "Quần Tennis",
        slug: "quan-tennis",
        description: "Quần tennis chuyên dụng",
        parentId: "cat-tennis-pickleball",
      },
      {
        id: "cat-tn-phukien",
        name: "Phụ Kiện",
        slug: "phu-kien-tennis",
        description: "Túi vợt, băng cổ tay, mũ...",
        parentId: "cat-tennis-pickleball",
      },
    ],
  });

  // Cầu Lông
  const categoryCauLong = await prisma.category.create({
    data: {
      id: "cat-cau-long",
      name: "Cầu Lông",
      slug: "cau-long",
      description: "Giày và phụ kiện cầu lông",
    },
  });

  // Danh mục con Cầu Lông
  await prisma.category.createMany({
    data: [
      {
        id: "cat-cl-giay",
        name: "Giày Cầu Lông",
        slug: "giay-cau-long",
        description: "Giày cầu lông chuyên nghiệp",
        parentId: "cat-cau-long",
      },
      {
        id: "cat-cl-vot",
        name: "Vợt Cầu Lông",
        slug: "vot-cau-long",
        description: "Vợt cầu lông các loại",
        parentId: "cat-cau-long",
      },
      {
        id: "cat-cl-ao",
        name: "Áo Cầu Lông",
        slug: "ao-cau-long",
        description: "Áo thi đấu cầu lông",
        parentId: "cat-cau-long",
      },
      {
        id: "cat-cl-quan",
        name: "Quần Cầu Lông",
        slug: "quan-cau-long",
        description: "Quần cầu lông chuyên dụng",
        parentId: "cat-cau-long",
      },
      {
        id: "cat-cl-phukien",
        name: "Phụ Kiện",
        slug: "phu-kien-cau-long",
        description: "Túi vợt, cầu, quấn cán...",
        parentId: "cat-cau-long",
      },
    ],
  });

  // Gym & Fitness
  const categoryGym = await prisma.category.create({
    data: {
      id: "cat-gym",
      name: "Gym & Fitness",
      slug: "gym-fitness",
      description: "Trang phục và phụ kiện tập gym",
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
      {
        id: "cat-gym-dungcu",
        name: "Dụng Cụ Tập",
        slug: "dung-cu-tap-gym",
        description: "Tạ tay, dây kháng lực...",
        parentId: "cat-gym",
      },
      {
        id: "cat-gym-phukien",
        name: "Phụ Kiện",
        slug: "phu-kien-gym",
        description: "Găng tay, đai lưng, bình nước...",
        parentId: "cat-gym",
      },
    ],
  });

  console.log("✅ Created 6 main categories with 30 subcategories");

  return {
    categoryBongDa,
    categoryBongRo,
    categoryChayBo,
    categoryTennisPickleball,
    categoryCauLong,
    categoryGym,
  };
}
