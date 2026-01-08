// Test script to verify address book data
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifying Address Book Data...\n");

  const users = await prisma.user.findMany({
    select: {
      email: true,
      fullName: true,
      phone: true,
      addresses: true,
    },
    orderBy: {
      email: "asc",
    },
  });

  for (const user of users) {
    console.log(`📧 ${user.email} - ${user.fullName}`);
    console.log(`📱 Phone: ${user.phone}`);

    if (user.addresses && Array.isArray(user.addresses)) {
      console.log(`📍 ${user.addresses.length} addresses saved:`);

      user.addresses.forEach((addr: any, index: number) => {
        console.log(
          `\n   ${index + 1}. ${addr.label || "No label"} ${
            addr.isDefault ? "⭐ (Default)" : ""
          }`
        );
        console.log(`      Name: ${addr.name}`);
        console.log(`      Phone: ${addr.phone}`);
        console.log(`      Address: ${addr.address}`);
        console.log(`      ID: ${addr.id}`);
      });
    } else {
      console.log(`📍 No addresses saved`);
    }

    console.log("\n" + "=".repeat(60) + "\n");
  }

  console.log("✅ Verification complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
