import { PrismaClient } from "@prisma/client";

export async function seedUsers(prisma: PrismaClient) {
  console.log("👤 Creating Users...");

  // Admin User
  const admin = await prisma.user.create({
    data: {
      id: "user-admin",
      email: "admin@sporthub.vn",
      fullName: "Nguyễn Văn Admin",
      phone: "0912345678",
      role: "ADMIN",
      staffId: "STAFF001",
      position: "Quản trị viên hệ thống",
      department: "IT",
      joinDate: new Date("2024-01-01"),
    },
  });

  // Customer User with addresses
  const customer = await prisma.user.create({
    data: {
      id: "user-customer",
      email: "customer@sporthub.vn",
      fullName: "Trần Thị Khách Hàng",
      phone: "0987654321",
      role: "CUSTOMER",
      addresses: [
        {
          id: "addr-1",
          fullName: "Trần Thị Khách Hàng",
          phone: "0987654321",
          address: "123 Nguyễn Huệ",
          ward: "Phường Bến Nghé",
          district: "Quận 1",
          city: "TP. Hồ Chí Minh",
          isDefault: true,
        },
        {
          id: "addr-2",
          fullName: "Trần Thị Khách Hàng",
          phone: "0987654321",
          address: "456 Lê Lợi",
          ward: "Phường Bến Thành",
          district: "Quận 1",
          city: "TP. Hồ Chí Minh",
          isDefault: false,
        },
        {
          id: "addr-3",
          fullName: "Công ty ABC",
          phone: "0912345678",
          address: "789 Trần Hưng Đạo",
          ward: "Phường Cầu Kho",
          district: "Quận 1",
          city: "TP. Hồ Chí Minh",
          isDefault: false,
        },
      ],
    },
  });

  // Additional Customer 2
  await prisma.user.create({
    data: {
      id: "user-customer-2",
      email: "nguyen.van.b@gmail.com",
      fullName: "Nguyễn Văn B",
      phone: "0901234567",
      role: "CUSTOMER",
      addresses: [
        {
          id: "addr-4",
          fullName: "Nguyễn Văn B",
          phone: "0901234567",
          address: "12 Hai Bà Trưng",
          ward: "Phường Tân Định",
          district: "Quận 1",
          city: "TP. Hồ Chí Minh",
          isDefault: true,
        },
      ],
    },
  });

  // Customer 3 - user@gmail.com
  await prisma.user.create({
    data: {
      id: "user-customer-3",
      email: "user@gmail.com",
      fullName: "Phạm Minh Khách",
      phone: "0909123456",
      role: "CUSTOMER",
      addresses: [
        {
          id: "addr-5",
          fullName: "Phạm Minh Khách",
          phone: "0909123456",
          address: "100 Đường 3/2",
          ward: "Phường 11",
          district: "Quận 10",
          city: "TP. Hồ Chí Minh",
          isDefault: true,
        },
        {
          id: "addr-6",
          fullName: "Phạm Minh Khách",
          phone: "0909123456",
          address: "250 Cách Mạng Tháng 8",
          ward: "Phường 10",
          district: "Quận 3",
          city: "TP. Hồ Chí Minh",
          isDefault: false,
        },
        {
          id: "addr-7",
          fullName: "Phạm Minh Khách (Văn phòng)",
          phone: "0909123456",
          address: "55 Nguyễn Thị Minh Khai",
          ward: "Phường 6",
          district: "Quận 3",
          city: "TP. Hồ Chí Minh",
          isDefault: false,
        },
      ],
    },
  });

  // Sales Staff
  await prisma.user.create({
    data: {
      id: "user-sales",
      email: "sales@sporthub.vn",
      fullName: "Lê Văn Kinh Doanh",
      phone: "0923456789",
      role: "SALES",
      staffId: "STAFF002",
      position: "Nhân viên bán hàng",
      department: "Sales",
      joinDate: new Date("2024-03-15"),
    },
  });

  // Warehouse Staff
  await prisma.user.create({
    data: {
      id: "user-warehouse",
      email: "warehouse@sporthub.vn",
      fullName: "Phạm Thị Kho",
      phone: "0934567890",
      role: "WAREHOUSE",
      staffId: "STAFF003",
      position: "Nhân viên kho",
      department: "Warehouse",
      joinDate: new Date("2024-02-01"),
    },
  });

  console.log(
    "✅ Created 6 users (1 admin, 3 customers, 1 sales, 1 warehouse)"
  );

  return {
    admin,
    customer,
  };
}
