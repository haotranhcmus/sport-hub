import { PrismaClient } from "@prisma/client";

export async function seedSystemConfig(prisma: PrismaClient) {
  console.log("⚙️  Creating System Config...");

  await prisma.systemConfig.create({
    data: {
      websiteTitle: "SportHub - Cửa hàng thể thao chuyên nghiệp",
      logoUrl: "/logo.png",
      hotline: "1900-xxxx",
      contactEmail: "support@sporthub.vn",
      address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      vatRate: 8,
      lowStockThreshold: 5,
      returnPeriodDays: 7,
      banners: [
        {
          id: "banner-1",
          image: "/banners/banner-1.jpg",
          title: "Giảm giá 20% toàn bộ giày Nike",
          link: "/products?brand=nike",
          order: 1,
        },
        {
          id: "banner-2",
          image: "/banners/banner-2.jpg",
          title: "Bộ sưu tập mới Adidas",
          link: "/products?brand=adidas",
          order: 2,
        },
      ],
    },
  });

  console.log("✅ Created system config");
}
