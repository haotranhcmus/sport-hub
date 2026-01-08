import { PrismaClient } from "@prisma/client";

export async function seedSizeGuides(prisma: PrismaClient) {
  console.log("📏 Creating Size Guides...");

  await prisma.sizeGuide.create({
    data: {
      id: "sg-giay",
      name: "Bảng Size Giày",
      description: "Hướng dẫn chọn size giày thể thao",
      columns: ["Size", "Chiều dài bàn chân (cm)", "Phù hợp"],
      rows: [
        { size: "36", length: "23-23.5", fit: "Nữ XS" },
        { size: "37", length: "23.5-24", fit: "Nữ S" },
        { size: "38", length: "24-24.5", fit: "Nữ M" },
        { size: "39", length: "24.5-25", fit: "Nữ L, Nam XS" },
        { size: "40", length: "25-25.5", fit: "Nữ XL, Nam S" },
        { size: "41", length: "25.5-26", fit: "Nam M" },
        { size: "42", length: "26-26.5", fit: "Nam M-L" },
        { size: "43", length: "26.5-27", fit: "Nam L" },
        { size: "44", length: "27-27.5", fit: "Nam XL" },
        { size: "45", length: "27.5-28", fit: "Nam XXL" },
      ],
    },
  });

  await prisma.sizeGuide.create({
    data: {
      id: "sg-ao",
      name: "Bảng Size Áo",
      description: "Hướng dẫn chọn size áo thể thao",
      columns: ["Size", "Chiều cao (cm)", "Cân nặng (kg)"],
      rows: [
        { size: "XS", height: "150-160", weight: "40-50" },
        { size: "S", height: "155-165", weight: "45-55" },
        { size: "M", height: "165-172", weight: "55-65" },
        { size: "L", height: "172-178", weight: "65-75" },
        { size: "XL", height: "178-185", weight: "75-85" },
        { size: "XXL", height: "185+", weight: "85+" },
      ],
    },
  });

  await prisma.sizeGuide.create({
    data: {
      id: "sg-quan",
      name: "Bảng Size Quần",
      description: "Hướng dẫn chọn size quần thể thao",
      columns: ["Size", "Vòng eo (cm)", "Vòng mông (cm)"],
      rows: [
        { size: "XS", waist: "60-65", hip: "80-85" },
        { size: "S", waist: "65-70", hip: "85-90" },
        { size: "M", waist: "70-75", hip: "90-95" },
        { size: "L", waist: "75-80", hip: "95-100" },
        { size: "XL", waist: "80-85", hip: "100-105" },
        { size: "XXL", waist: "85-90", hip: "105-110" },
      ],
    },
  });

  console.log("✅ Created 3 size guides");
}
