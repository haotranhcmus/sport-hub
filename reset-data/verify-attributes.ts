import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyAttributes() {
  console.log("🔍 Kiểm tra thuộc tính sản phẩm...\n");

  // Lấy tất cả attributes
  const attributes = await prisma.productAttribute.findMany({
    orderBy: { name: "asc" },
  });

  console.log("🎨 Thuộc tính sản phẩm:\n");

  // Phân loại theo type
  const variantAttrs = attributes.filter((a) => a.type === "variant");
  const specAttrs = attributes.filter((a) => a.type === "specification");

  console.log("🔹 VARIANT ATTRIBUTES (Sinh biến thể):");
  console.log(`   Total: ${variantAttrs.length} thuộc tính\n`);
  
  variantAttrs.forEach((attr) => {
    console.log(`   ✅ ${attr.name} (${attr.code})`);
    console.log(`      Type: ${attr.type}`);
    console.log(`      Values: ${attr.values.join(", ")}`);
    console.log(`      Gán cho ${attr.categoryIds.length} danh mục\n`);
  });

  console.log("🔹 SPECIFICATION ATTRIBUTES (Thông tin bổ sung):");
  console.log(`   Total: ${specAttrs.length} thuộc tính\n`);
  
  specAttrs.forEach((attr) => {
    console.log(`   ✅ ${attr.name} (${attr.code})`);
    console.log(`      Type: ${attr.type}`);
    console.log(`      Values: ${attr.values.join(", ")}`);
    console.log(`      Gán cho ${attr.categoryIds.length} danh mục\n`);
  });

  // Kiểm tra logic
  console.log("\n🔍 KIỂM TRA LOGIC:\n");

  // Kiểm tra có bao nhiêu variant attributes
  if (variantAttrs.length === 4) {
    console.log(`✅ Đúng 4 VARIANT attributes (Màu sắc + 3 loại Size)`);
  } else {
    console.log(`❌ SAI! Cần 4 VARIANT attributes, hiện có ${variantAttrs.length}`);
  }

  // Kiểm tra có bao nhiêu specification attributes
  if (specAttrs.length === 7) {
    console.log(`✅ Đúng 7 SPECIFICATION attributes`);
  } else {
    console.log(`❌ SAI! Cần 7 SPECIFICATION attributes, hiện có ${specAttrs.length}`);
  }

  // Kiểm tra không có type khác
  const otherTypes = attributes.filter(
    (a) => a.type !== "variant" && a.type !== "specification"
  );
  if (otherTypes.length === 0) {
    console.log(`✅ Không có thuộc tính với type không hợp lệ`);
  } else {
    console.log(`❌ Có ${otherTypes.length} thuộc tính với type không hợp lệ:`);
    otherTypes.forEach((a) => console.log(`   - ${a.name}: type="${a.type}"`));
  }

  console.log("\n✅ Kiểm tra hoàn tất!\n");

  await prisma.$disconnect();
}

verifyAttributes().catch((e) => {
  console.error(e);
  process.exit(1);
});
