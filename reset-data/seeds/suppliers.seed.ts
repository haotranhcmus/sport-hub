import { PrismaClient } from "@prisma/client";

export async function seedSuppliers(prisma: PrismaClient) {
  console.log("🏭 Creating Suppliers...");

  await prisma.supplier.create({
    data: {
      id: "supplier-ttvn",
      name: "Thể Thao Việt Nam (TTVN)",
      contactPerson: "Nguyễn Văn A",
      phone: "0912345678",
      email: "contact@ttvn.vn",
      address: "123 Lê Văn Việt, Q.9, TP.HCM",
      taxCode: "0123456789",
    },
  });

  await prisma.supplier.create({
    data: {
      id: "supplier-nike-vn",
      name: "Nike Vietnam",
      contactPerson: "Trần Thị B",
      phone: "0923456789",
      email: "contact@nike.vn",
      address: "456 Nguyễn Văn Linh, Q.7, TP.HCM",
      taxCode: "0234567890",
    },
  });

  await prisma.supplier.create({
    data: {
      id: "supplier-adidas-vn",
      name: "Adidas Vietnam",
      contactPerson: "Lê Văn C",
      phone: "0934567890",
      email: "contact@adidas.vn",
      address: "789 Võ Văn Kiệt, Q.5, TP.HCM",
      taxCode: "0345678901",
    },
  });

  await prisma.supplier.create({
    data: {
      id: "supplier-puma-vn",
      name: "Puma Vietnam",
      contactPerson: "Phạm Thị D",
      phone: "0945678901",
      email: "contact@puma.vn",
      address: "321 Trường Chinh, Q.Tân Bình, TP.HCM",
      taxCode: "0456789012",
    },
  });

  await prisma.supplier.create({
    data: {
      id: "supplier-asics-vn",
      name: "Asics Vietnam",
      contactPerson: "Hoàng Văn E",
      phone: "0956789012",
      email: "contact@asics.vn",
      address: "654 Cách Mạng Tháng 8, Q.10, TP.HCM",
      taxCode: "0567890123",
    },
  });

  console.log("✅ Created 5 suppliers");
}
