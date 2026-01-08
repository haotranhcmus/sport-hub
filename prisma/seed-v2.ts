// Prisma Seed File - Complete Implementation
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function for days ago
const daysAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================================================
  // 1. Clear existing data (dev only)
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
  // 2. Seed Size Guides
  // ============================================================================
  console.log("📏 Seeding Size Guides...");

  const sizeGuide1 = await prisma.sizeGuide.create({
    data: {
      id: "sg1",
      name: "Bảng size giày đá bóng Nam (EU/US)",
      description: "Dành cho các dòng sản phẩm giày bóng đá của Nike, Adidas.",
      columns: [
        { key: "eu", label: "Size EU" },
        { key: "us", label: "Size US" },
        { key: "cm", label: "Dài chân (cm)" },
      ],
      rows: [
        { eu: "39", us: "6.5", cm: "24.5" },
        { eu: "40", us: "7", cm: "25.0" },
        { eu: "41", us: "8", cm: "26.0" },
        { eu: "42", us: "8.5", cm: "26.5" },
        { eu: "43", us: "9.5", cm: "27.5" },
      ],
    },
  });

  const sizeGuide2 = await prisma.sizeGuide.create({
    data: {
      id: "sg2",
      name: "Bảng size áo thể thao chuẩn Á",
      description: "Phù hợp với thể trạng người Việt Nam.",
      columns: [
        { key: "size", label: "Kích cỡ" },
        { key: "height", label: "Chiều cao (cm)" },
        { key: "weight", label: "Cân nặng (kg)" },
      ],
      rows: [
        { size: "S", height: "155-160", weight: "45-55" },
        { size: "M", height: "160-168", weight: "55-65" },
        { size: "L", height: "168-175", weight: "65-75" },
        { size: "XL", height: "175-182", weight: "75-85" },
      ],
    },
  });

  console.log(`✅ Created ${2} size guides`);

  // ============================================================================
  // 3. Seed Categories
  // ============================================================================
  console.log("📂 Seeding Categories...");

  const category1 = await prisma.category.create({
    data: {
      id: "c1",
      name: "Giày Bóng Đá",
      slug: "giay-bong-da",
      imageUrl:
        "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=400&auto=format&fit=crop",
      sizeGuideId: "sg1",
    },
  });

  const category2 = await prisma.category.create({
    data: {
      id: "c2",
      name: "Áo Thi Đấu",
      slug: "ao-thi-dau",
      imageUrl:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop",
      sizeGuideId: "sg2",
    },
  });

  const category3 = await prisma.category.create({
    data: {
      id: "c3",
      name: "Găng Tay Thủ Môn",
      slug: "gang-tay",
      imageUrl:
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=400&auto=format&fit=crop",
    },
  });

  console.log(`✅ Created ${3} categories`);

  // ============================================================================
  // 4. Seed Brands
  // ============================================================================
  console.log("🏷️  Seeding Brands...");

  const brand1 = await prisma.brand.create({
    data: {
      id: "b1",
      name: "Nike",
      slug: "nike",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
      country: "USA",
    },
  });

  const brand2 = await prisma.brand.create({
    data: {
      id: "b2",
      name: "Adidas",
      slug: "adidas",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
      country: "Germany",
    },
  });

  const brand3 = await prisma.brand.create({
    data: {
      id: "b3",
      name: "Puma",
      slug: "puma",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_complete_logo.svg",
      country: "Germany",
    },
  });

  console.log(`✅ Created ${3} brands`);

  // ============================================================================
  // 5. Seed Product Attributes
  // ============================================================================
  console.log("🎨 Seeding Product Attributes...");

  await prisma.productAttribute.createMany({
    data: [
      {
        id: "attr-1",
        name: "Màu sắc",
        code: "mau_sac",
        type: "variant",
        values: [
          "Đỏ",
          "Đen",
          "Trắng",
          "Xanh",
          "Vàng",
          "Xám",
          "Cam",
          "Tím",
          "Hồng",
          "Xanh lá",
        ],
        categoryIds: ["c1", "c2"], // Giày bóng đá, Áo thi đấu
      },
      {
        id: "attr-2",
        name: "Kích cỡ",
        code: "kich_co",
        type: "variant",
        values: [
          "39",
          "40",
          "41",
          "42",
          "43",
          "S",
          "M",
          "L",
          "XL",
          "Free",
          "7",
          "8",
          "9",
          "10",
          "11",
        ],
        categoryIds: ["c1", "c2", "c3"], // All categories
      },
      {
        id: "attr-3",
        name: "Loại đinh",
        code: "loai_dinh",
        type: "info",
        values: ["TF", "FG", "AG", "IC", "SG"],
        categoryIds: ["c1"], // Giày bóng đá
      },
      {
        id: "attr-4",
        name: "Chất liệu",
        code: "chat_lieu",
        type: "info",
        values: [
          "Da thật",
          "Vải dệt Flyknit",
          "Da tổng hợp",
          "Latex",
          "Polyester tái chế",
          "Cotton",
          "Nylon",
        ],
        categoryIds: ["c1", "c2", "c3"], // All categories
      },
      {
        id: "attr-5",
        name: "Loại cổ",
        code: "loai_co",
        type: "info",
        values: ["Cổ cao (Dynamic Fit)", "Cổ thấp"],
        categoryIds: ["c1"], // Giày bóng đá
      },
      {
        id: "attr-6",
        name: "Công nghệ",
        code: "cong_nghe",
        type: "info",
        values: [
          "Zoom Air",
          "AEROREADY",
          "Flyknit",
          "Dry-FIT",
          "Grip Control",
          "Futurelight",
          "Ultraweave",
          "Grip3",
          "ACC",
        ],
        categoryIds: ["c1", "c2", "c3"], // All categories
      },
    ],
  });

  console.log(`✅ Created ${6} product attributes`);

  // ============================================================================
  // 6. Seed Products with Variants and Reviews
  // ============================================================================
  console.log("📦 Seeding Products...");

  // Product 1: Nike Mercurial Vapor 15
  const product1 = await prisma.product.create({
    data: {
      id: "p1",
      productCode: "NK-MV15-001",
      modelCode: "NK-MV15-001",
      name: "Nike Mercurial Vapor 15 Elite TF",
      slug: "nike-mercurial-vapor-15-elite-tf",
      description: "Dòng sản phẩm cao cấp nhất dành cho sân cỏ nhân tạo.",
      basePrice: 5500000,
      promotionalPrice: 4950000,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
      status: "ACTIVE",
      categoryId: "c1",
      brandId: "b1",
      totalSold: 120,
      allowReturn: true,
      returnPeriod: 30,
      freeShipping: true,
      sizeGuideId: "sg1",
      attributes: {
        loai_dinh: "TF",
        chat_lieu: "Vải dệt Flyknit",
        loai_co: "Cổ thấp",
        cong_nghe: "Zoom Air",
      },
      variants: {
        create: [
          {
            id: "v1",
            sku: "NIKE-MV15-TF-40-RED",
            size: "40",
            color: "Đỏ",
            stockQuantity: 10,
            priceAdjustment: 0,
            status: "active",
          },
          {
            id: "v2",
            sku: "NIKE-MV15-TF-41-RED",
            size: "41",
            color: "Đỏ",
            stockQuantity: 5,
            priceAdjustment: 0,
            status: "active",
          },
        ],
      },
      reviews: {
        create: [
          {
            id: "r1",
            userName: "Nguyễn Văn Hải",
            rating: 5,
            comment: "Giày đi rất êm, bám sân tốt.",
            avatarUrl: "https://i.pravatar.cc/150?u=h",
            createdAt: new Date("2025-02-01T10:00:00Z"),
          },
          {
            id: "r2",
            userName: "Trần Minh Tâm",
            rating: 4,
            comment: "Màu sắc đẹp, size hơi chật một chút so với bình thường.",
            avatarUrl: "https://i.pravatar.cc/150?u=t",
            createdAt: new Date("2025-02-05T14:30:00Z"),
          },
        ],
      },
    },
  });

  // Product 2: Man Utd Jersey
  const product2 = await prisma.product.create({
    data: {
      id: "p2",
      productCode: "AD-MU-001",
      modelCode: "AD-MU-001",
      name: "Áo Man Utd 2024/25 Home Jersey",
      slug: "ao-man-utd-2024-home",
      description: "Mẫu áo thi đấu sân nhà mới nhất của Quỷ Đỏ.",
      basePrice: 1200000,
      promotionalPrice: 950000,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
      status: "ACTIVE",
      categoryId: "c2",
      brandId: "b2",
      totalSold: 450,
      allowReturn: true,
      returnPeriod: 14,
      sizeGuideId: "sg2",
      variants: {
        create: [
          {
            id: "v5",
            sku: "MU-H-M",
            size: "M",
            color: "Đỏ",
            stockQuantity: 30,
            priceAdjustment: 0,
            status: "active",
          },
        ],
      },
    },
  });

  // Product 3: Socks (for return test)
  const product3 = await prisma.product.create({
    data: {
      id: "p3",
      productCode: "SOCK-001",
      modelCode: "SOCK-001",
      name: "Tất bóng đá chống trượt SportHub Pro",
      slug: "tat-bong-da-chong-truot",
      description: "Sản phẩm vệ sinh cá nhân, không hỗ trợ đổi trả.",
      basePrice: 150000,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=400",
      status: "ACTIVE",
      categoryId: "c1",
      brandId: "b1",
      totalSold: 1000,
      allowReturn: false,
      variants: {
        create: [
          {
            id: "v10",
            sku: "SOCK-BLK",
            size: "Free",
            color: "Đen",
            stockQuantity: 100,
            priceAdjustment: 0,
            status: "active",
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${3} products with variants and reviews`);

  // ============================================================================
  // 7. Seed Users (Admin + Customer)
  // ============================================================================
  console.log("👤 Seeding Users...");

  const adminUser = await prisma.user.create({
    data: {
      id: "adm-01",
      email: "admin@sporthub.vn",
      fullName: "Nguyễn Quản Trị",
      role: "ADMIN",
      status: "active",
      staffId: "ADMIN-001",
      phone: "0999888777",
      addresses: [
        {
          id: "addr-admin-1",
          name: "Nguyễn Quản Trị",
          phone: "0999888777",
          address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
          label: "Nhà riêng",
          isDefault: true,
        },
        {
          id: "addr-admin-2",
          name: "Nguyễn Quản Trị",
          phone: "0999888777",
          address: "456 Trần Hưng Đạo, Phường Cầu Kho, Quận 1, TP.HCM",
          label: "Văn phòng",
          isDefault: false,
        },
      ],
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      id: "usr-01",
      email: "customer@example.com",
      fullName: "Hội viên SportHub",
      role: "CUSTOMER",
      status: "active",
      phone: "0901234567",
      addresses: [
        {
          id: "addr-cust-1",
          name: "Hội viên SportHub",
          phone: "0901234567",
          address: "456 Nguyễn Huệ, Phường Bến Thành, Quận 1, TP.HCM",
          label: "Nhà riêng",
          isDefault: true,
        },
        {
          id: "addr-cust-2",
          name: "Hội viên SportHub",
          phone: "0901234567",
          address: "789 Pasteur, Phường Bến Nghé, Quận 1, TP.HCM",
          label: "Công ty",
          isDefault: false,
        },
        {
          id: "addr-cust-3",
          name: "Trần Thị Mai",
          phone: "0987654321",
          address: "101 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP.HCM",
          label: "Nhà bố mẹ",
          isDefault: false,
        },
        {
          id: "addr-cust-4",
          name: "Hội viên SportHub",
          phone: "0901234567",
          address: "202 Hai Bà Trưng, Phường Tân Định, Quận 3, TP.HCM",
          label: "Giao hàng nhanh",
          isDefault: false,
        },
      ],
    },
  });

  console.log(
    `✅ Created ${2} users (1 admin with 2 addresses, 1 customer with 4 addresses)`
  );

  // ============================================================================
  // 8. Seed Suppliers
  // ============================================================================
  console.log("🏢 Seeding Suppliers...");

  const supplier1 = await prisma.supplier.create({
    data: {
      id: "s1",
      name: "Công ty TNHH Nike Việt Nam",
      contactPerson: "Mr. David",
      phone: "028 3824 1234",
      status: "active",
    },
  });

  console.log(`✅ Created ${1} supplier`);

  // ============================================================================
  // 9. Seed Orders
  // ============================================================================
  console.log("🛒 Seeding Orders...");

  // Order 1: Refund request
  await prisma.order.create({
    data: {
      id: "refund-demo-001",
      orderCode: "ORD-REFUND-2025",
      user: { connect: { id: "usr-01" } },
      customerName: "Nguyễn Hoàng Nam",
      customerPhone: "0912345678",
      customerAddress: "456 Lê Lợi, Quận 1, TP.HCM",
      customerType: "member",
      totalAmount: 4950000,
      shippingFee: 0,
      status: "CANCELLED",
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING_REFUND",
      createdAt: daysAgo(1),
      items: {
        create: [
          {
            productId: "p1",
            productName: "Nike Mercurial Vapor 15 Elite TF",
            quantity: 1,
            unitPrice: 4950000,
            color: "Đỏ",
            size: "40",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
          },
        ],
      },
    },
  });

  // Order 2: Exchange request
  await prisma.order.create({
    data: {
      id: "ret-001",
      orderCode: "ORD-RET-EXCHANGE",
      user: { connect: { id: "usr-01" } },
      customerName: "Trần Anh Tuấn",
      customerPhone: "0988123456",
      customerAddress: "789 CMT8, Quận 10, TP.HCM",
      customerType: "member",
      totalAmount: 4950000,
      shippingFee: 0,
      status: "RETURN_REQUESTED",
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      createdAt: daysAgo(2),
    },
  });

  await prisma.orderItem.create({
    data: {
      id: "oi-ret-001",
      orderId: "ret-001",
      productId: "p1",
      productName: "Nike Mercurial Vapor 15 Elite TF",
      quantity: 1,
      unitPrice: 4950000,
      color: "Đỏ",
      size: "40",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
    },
  });

  // Order 3: Refund with bank info
  await prisma.order.create({
    data: {
      id: "ret-002",
      orderCode: "ORD-RET-REFUND",
      customerName: "Lê Thị Hoa",
      customerPhone: "0905667788",
      customerAddress: "123 Phan Xích Long, Phú Nhuận, TP.HCM",
      customerType: "guest",
      totalAmount: 950000,
      shippingFee: 30000,
      status: "RETURN_REQUESTED",
      paymentMethod: "COD",
      paymentStatus: "PAID",
      createdAt: daysAgo(3),
    },
  });

  await prisma.orderItem.create({
    data: {
      id: "oi-ret-002",
      orderId: "ret-002",
      productId: "p2",
      productName: "Áo Man Utd 2024/25 Home Jersey",
      quantity: 1,
      unitPrice: 950000,
      color: "Đỏ",
      size: "M",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600",
    },
  });

  // Order 4: Return processing
  await prisma.order.create({
    data: {
      id: "ret-003",
      orderCode: "ORD-RET-PROCESSING",
      user: { connect: { id: "usr-01" } },
      customerName: "Phạm Văn Nam",
      customerPhone: "0944001122",
      customerAddress: "456 Võ Văn Kiệt, Quận 1, TP.HCM",
      customerType: "member",
      totalAmount: 150000,
      shippingFee: 20000,
      status: "RETURN_PROCESSING",
      paymentMethod: "COD",
      paymentStatus: "PAID",
      createdAt: daysAgo(5),
    },
  });

  await prisma.orderItem.create({
    data: {
      id: "oi-ret-003",
      orderId: "ret-003",
      productId: "p3",
      productName: "Tất bóng đá chống trượt SportHub Pro",
      quantity: 1,
      unitPrice: 150000,
      color: "Đen",
      size: "Free",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=400",
    },
  });

  // Order 5: Guest order
  await prisma.order.create({
    data: {
      id: "order-1",
      orderCode: "ORD-88271",
      user: { connect: { id: "usr-01" } },
      customerName: "Hội viên SportHub",
      customerPhone: "0901234567",
      customerAddress: "789 CMT8, Quận 10, TP.HCM",
      customerType: "member",
      totalAmount: 950000,
      shippingFee: 30000,
      status: "COMPLETED",
      paymentMethod: "COD",
      paymentStatus: "PAID",
      createdAt: daysAgo(10),
      items: {
        create: [
          {
            productId: "p2",
            productName: "Áo Man Utd 2024/25 Home Jersey",
            quantity: 1,
            unitPrice: 950000,
            color: "Đỏ",
            size: "M",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600",
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${5} orders with items`);

  // ============================================================================
  // 10. Seed Return Requests
  // ============================================================================
  console.log("🔄 Seeding Return Requests...");

  // Return Request 1: Exchange request (pending)
  await prisma.returnRequest.create({
    data: {
      id: "rr-001",
      requestCode: "RET-001234",
      orderId: "ret-001",
      orderItemId: "oi-ret-001",
      type: "EXCHANGE",
      status: "PENDING",
      reason: "Giày bị chật ngang, mình muốn đổi lên size 41 cùng mẫu.",
      evidenceImages: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=200",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200",
      ],
      exchangeToSize: "41",
      exchangeToColor: "Đỏ",
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  });

  // Return Request 2: Refund request (pending)
  await prisma.returnRequest.create({
    data: {
      id: "rr-002",
      requestCode: "RET-005678",
      orderId: "ret-002",
      orderItemId: "oi-ret-002",
      type: "REFUND",
      status: "PENDING",
      reason:
        "Áo bị lỗi đường chỉ ở cổ áo rất mất thẩm mỹ. Mình muốn trả hàng hoàn tiền.",
      evidenceImages: [
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200",
      ],
      refundAmount: 950000,
      bankInfo: {
        bankName: "Vietcombank (VCB)",
        accountNumber: "1022998844",
        accountHolder: "LE THI HOA",
      },
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
  });

  // Return Request 3: Exchange (approved)
  await prisma.returnRequest.create({
    data: {
      id: "rr-003",
      requestCode: "RET-009988",
      orderId: "ret-003",
      orderItemId: "oi-ret-003",
      type: "EXCHANGE",
      status: "APPROVED",
      reason: "Nhầm màu, mình muốn đổi sang màu trắng.",
      evidenceImages: [],
      exchangeToSize: "Free",
      exchangeToColor: "Trắng",
      adminNotes: "Đã duyệt, chờ khách gửi hàng về.",
      processedBy: "usr-admin",
      processedAt: daysAgo(4),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(4),
    },
  });

  console.log("✅ Created 3 return requests");

  // ============================================================================
  // 11. Seed System Config
  // ============================================================================
  console.log("⚙️  Seeding System Config...");

  await prisma.systemConfig.create({
    data: {
      websiteTitle: "SportHub - Đồ thể thao chính hãng",
      logoUrl:
        "https://ui-avatars.com/api/?name=SportHub&background=0f172a&color=fff",
      hotline: "1900 1234",
      contactEmail: "support@sporthub.vn",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      vatRate: 8,
      lowStockThreshold: 5,
      returnPeriodDays: 7,
      banners: [],
    },
  });

  console.log("✅ Created system config");

  // ============================================================================
  // Summary
  // ============================================================================
  console.log("\n📊 Seed Summary:");
  console.log("  ✅ 2 Size Guides");
  console.log("  ✅ 3 Categories");
  console.log("  ✅ 3 Brands");
  console.log("  ✅ 6 Product Attributes");
  console.log("  ✅ 3 Products (with 4 variants, 2 reviews)");
  console.log("  ✅ 2 Users (1 admin, 1 customer)");
  console.log("  ✅ 1 Supplier");
  console.log("  ✅ 5 Orders (various statuses)");
  console.log("  ✅ 3 Return Requests");
  console.log("  ✅ 1 System Config");
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
