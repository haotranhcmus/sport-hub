import { PrismaClient } from "@prisma/client";

export async function seedAttributes(prisma: PrismaClient) {
  console.log("🎨 Creating Product Attributes...");

  // Lấy tất cả danh mục con (có parentId)
  const subcategories = await prisma.category.findMany({
    where: {
      parentId: { not: null },
    },
  });

  // Danh mục GIÀY
  const giaySubcatIds = subcategories
    .filter((c) => c.slug?.includes("giay"))
    .map((c) => c.id);

  // Danh mục ÁO
  const aoSubcatIds = subcategories
    .filter((c) => c.slug?.includes("ao"))
    .map((c) => c.id);

  // Danh mục QUẦN
  const quanSubcatIds = subcategories
    .filter((c) => c.slug?.includes("quan"))
    .map((c) => c.id);

  // Tất cả danh mục (giày + áo + quần)
  const allSubcatIds = [...giaySubcatIds, ...aoSubcatIds, ...quanSubcatIds];

  // 1. MÀU SẮC - Tất cả danh mục (VARIANT - Sinh biến thể)
  await prisma.productAttribute.create({
    data: {
      id: "attr-mau-sac",
      name: "Màu sắc",
      code: "mau-sac",
      type: "variant",
      values: [
        "Đen",
        "Trắng",
        "Đỏ",
        "Xanh dương",
        "Xanh lá",
        "Vàng",
        "Cam",
        "Tím",
        "Hồng",
        "Xám",
      ],
      categoryIds: allSubcatIds,
      categories: {
        connect: allSubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 2. SIZE GIÀY - Chỉ danh mục giày (VARIANT - Sinh biến thể)
  await prisma.productAttribute.create({
    data: {
      id: "attr-size-giay",
      name: "Size giày",
      code: "size-giay",
      type: "variant",
      values: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
      categoryIds: giaySubcatIds,
      categories: {
        connect: giaySubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 3. SIZE ÁO - Chỉ danh mục áo (VARIANT - Sinh biến thể)
  await prisma.productAttribute.create({
    data: {
      id: "attr-size-ao",
      name: "Size áo",
      code: "size-ao",
      type: "variant",
      values: ["XS", "S", "M", "L", "XL", "XXL"],
      categoryIds: aoSubcatIds,
      categories: {
        connect: aoSubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 4. SIZE QUẦN - Chỉ danh mục quần (VARIANT - Sinh biến thể)
  await prisma.productAttribute.create({
    data: {
      id: "attr-size-quan",
      name: "Size quần",
      code: "size-quan",
      type: "variant",
      values: ["XS", "S", "M", "L", "XL", "XXL"],
      categoryIds: quanSubcatIds,
      categories: {
        connect: quanSubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 5. CHẤT LIỆU GIÀY - Chỉ danh mục giày (SPECIFICATION - Thông tin bổ sung)
  await prisma.productAttribute.create({
    data: {
      id: "attr-chat-lieu-giay",
      name: "Chất liệu giày",
      code: "chat-lieu-giay",
      type: "specification",
      values: [
        "Da thật",
        "Da tổng hợp",
        "Vải mesh",
        "Vải canvas",
        "Flyknit",
        "Primeknit",
      ],
      categoryIds: giaySubcatIds,
      categories: {
        connect: giaySubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 6. CHẤT LIỆU VẢI - Chỉ danh mục áo và quần (SPECIFICATION - Thông tin bổ sung)
  const aoQuanSubcatIds = [...aoSubcatIds, ...quanSubcatIds];
  await prisma.productAttribute.create({
    data: {
      id: "attr-chat-lieu-vai",
      name: "Chất liệu vải",
      code: "chat-lieu-vai",
      type: "specification",
      values: [
        "Cotton",
        "Polyester",
        "Nylon",
        "Spandex",
        "Dri-FIT",
        "Climacool",
        "Coolmax",
      ],
      categoryIds: aoQuanSubcatIds,
      categories: {
        connect: aoQuanSubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 7. CÔNG NGHỆ ĐẾ - Chỉ danh mục giày (SPECIFICATION - Thông tin bổ sung)
  await prisma.productAttribute.create({
    data: {
      id: "attr-cong-nghe-de",
      name: "Công nghệ đế",
      code: "cong-nghe-de",
      type: "specification",
      values: [
        "Nike Zoom Air",
        "Nike React",
        "Adidas Boost",
        "Adidas Bounce",
        "Puma NITRO",
        "Asics GEL",
      ],
      categoryIds: giaySubcatIds,
      categories: {
        connect: giaySubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 8. LOẠI ĐẾ BÓNG ĐÁ - Chỉ giày bóng đá (SPECIFICATION - Thông tin bổ sung)
  const giayBongDaId = subcategories.find((c) => c.id === "cat-bd-giay")?.id;
  if (giayBongDaId) {
    await prisma.productAttribute.create({
      data: {
        id: "attr-loai-de-bong-da",
        name: "Loại đế bóng đá",
        code: "loai-de-bong-da",
        type: "specification",
        values: [
          "FG (Sân cỏ tự nhiên)",
          "AG (Sân cỏ nhân tạo)",
          "TF (Sân futsal)",
          "IC (Sân trong nhà)",
        ],
        categoryIds: [giayBongDaId],
        categories: {
          connect: [{ id: giayBongDaId }],
        },
      },
    });
  }

  // 9. GIỚI TÍNH - Tất cả danh mục (SPECIFICATION - Thông tin bổ sung)
  await prisma.productAttribute.create({
    data: {
      id: "attr-gioi-tinh",
      name: "Giới tính",
      code: "gioi-tinh",
      type: "specification",
      values: ["Nam", "Nữ", "Unisex"],
      categoryIds: allSubcatIds,
      categories: {
        connect: allSubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 10. KIỂU ÁO - Chỉ danh mục áo (SPECIFICATION - Thông tin bổ sung)
  await prisma.productAttribute.create({
    data: {
      id: "attr-kieu-ao",
      name: "Kiểu áo",
      code: "kieu-ao",
      type: "specification",
      values: [
        "Áo thun",
        "Áo polo",
        "Áo ba lỗ",
        "Áo dài tay",
        "Áo hoodie",
        "Áo khoác",
      ],
      categoryIds: aoSubcatIds,
      categories: {
        connect: aoSubcatIds.map((id) => ({ id })),
      },
    },
  });

  // 11. KIỂU QUẦN - Chỉ danh mục quần (SPECIFICATION - Thông tin bổ sung)
  await prisma.productAttribute.create({
    data: {
      id: "attr-kieu-quan",
      name: "Kiểu quần",
      code: "kieu-quan",
      type: "specification",
      values: [
        "Quần short",
        "Quần dài",
        "Quần lửng",
        "Quần jogger",
        "Quần tights",
      ],
      categoryIds: quanSubcatIds,
      categories: {
        connect: quanSubcatIds.map((id) => ({ id })),
      },
    },
  });

  console.log("✅ Created 11 product attributes with proper category mapping:");
  console.log("\n🔹 VARIANT ATTRIBUTES (Sinh biến thể):");
  console.log("  - Màu sắc: Tất cả danh mục");
  console.log("  - Size giày: Chỉ giày");
  console.log("  - Size áo: Chỉ áo");
  console.log("  - Size quần: Chỉ quần");
  console.log("\n🔹 SPECIFICATION ATTRIBUTES (Thông tin bổ sung):");
  console.log("  - Chất liệu giày, Công nghệ đế, Loại đế bóng đá: Chỉ giày");
  console.log("  - Chất liệu vải: Áo và quần");
  console.log("  - Kiểu áo: Chỉ áo");
  console.log("  - Kiểu quần: Chỉ quần");
  console.log("  - Giới tính: Tất cả danh mục");
}
