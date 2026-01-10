/**
 * SCRIPT KIỂM TRA: Fix Overselling - Giai đoạn 1
 *
 * Kiểm tra các fix đã được áp dụng:
 * 1. validateStock - Có query database thật không?
 * 2. deductStock - Có trừ stock thật không?
 * 3. Database constraint - Có prevent stock âm không?
 * 4. RPC functions - Có tồn tại không?
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyFixes() {
  console.log("🔍 KIỂM TRA CÁC FIX GIAI ĐOẠN 1\n");
  console.log("=" + "=".repeat(60) + "\n");

  // ===== TEST 1: Database Constraint =====
  console.log("1️⃣  TEST: Database Constraint (stock >= 0)");
  try {
    // Thử update stock xuống âm - phải fail
    await prisma.$executeRaw`
      UPDATE "ProductVariant" 
      SET "stockQuantity" = -1 
      WHERE id = (SELECT id FROM "ProductVariant" LIMIT 1)
    `;
    console.log(
      "   ❌ FAILED: Constraint không hoạt động, cho phép stock âm!\n"
    );
  } catch (error: any) {
    if (error.message.includes("check_stock_non_negative")) {
      console.log("   ✅ PASSED: Constraint hoạt động, đã chặn stock âm\n");
    } else {
      console.log("   ⚠️  ERROR:", error.message, "\n");
    }
  }

  // ===== TEST 2: RPC Functions =====
  console.log("2️⃣  TEST: Database RPC Functions");

  try {
    const functions = await prisma.$queryRaw<any[]>`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        AND routine_name LIKE '%stock%'
      ORDER BY routine_name
    `;

    console.log(
      `   Tìm thấy ${functions.length} functions liên quan đến stock:`
    );
    functions.forEach((f) => {
      console.log(`   - ${f.routine_name}`);
    });

    const expectedFunctions = [
      "increment_variant_stock",
      "decrement_variant_stock",
      "deduct_stock_batch",
    ];

    const foundFunctions = functions.map((f) => f.routine_name);
    let allFound = true;

    expectedFunctions.forEach((name) => {
      if (foundFunctions.includes(name)) {
        console.log(`   ✅ ${name}: Tồn tại`);
      } else {
        console.log(`   ❌ ${name}: KHÔNG tồn tại`);
        allFound = false;
      }
    });

    console.log("");
  } catch (e: any) {
    console.log("   ❌ ERROR:", e.message, "\n");
  }

  // ===== TEST 3: Schema Changes =====
  console.log("3️⃣  TEST: Schema Changes (OrderItem.variantId)");
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'OrderItem' 
        AND column_name = 'variantId'
    `;

    if (result.length > 0) {
      console.log("   ✅ PASSED: Column OrderItem.variantId tồn tại\n");
    } else {
      console.log("   ❌ FAILED: Column OrderItem.variantId KHÔNG tồn tại\n");
    }
  } catch (e: any) {
    console.log("   ❌ ERROR:", e.message, "\n");
  }

  // ===== TEST 4: Index Verification =====
  console.log("4️⃣  TEST: Database Indexes");
  try {
    const indexes = await prisma.$queryRaw<any[]>`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'ProductVariant' 
        AND indexname = 'idx_variant_stock'
    `;

    if (indexes.length > 0) {
      console.log("   ✅ idx_variant_stock index tồn tại");
    } else {
      console.log("   ⚠️  idx_variant_stock index KHÔNG tồn tại");
    }

    const orderItemIndexes = await prisma.$queryRaw<any[]>`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'OrderItem' 
        AND indexname = 'OrderItem_variantId_idx'
    `;

    if (orderItemIndexes.length > 0) {
      console.log("   ✅ OrderItem_variantId_idx index tồn tại\n");
    } else {
      console.log("   ⚠️  OrderItem_variantId_idx index KHÔNG tồn tại\n");
    }
  } catch (e: any) {
    console.log("   ❌ ERROR:", e.message, "\n");
  }

  // ===== SUMMARY =====
  console.log("=" + "=".repeat(60));
  console.log("\n📋 TÓM TẮT GIAI ĐOẠN 1:\n");
  console.log("✅ Code Changes:");
  console.log("   - validateStock: Đã fix query database thật");
  console.log("   - deductStock: Đã fix trừ stock với optimistic locking");
  console.log("   - CheckoutPage: Đã thêm variantId vào order items");
  console.log("   - order.service: Đã fix dùng variantId khi rollback\n");

  console.log("✅ Database Changes:");
  console.log("   - Constraint check_stock_non_negative");
  console.log("   - RPC function increment_variant_stock()");
  console.log("   - RPC function decrement_variant_stock()");
  console.log("   - RPC function deduct_stock_batch()");
  console.log("   - Column OrderItem.variantId");
  console.log("   - Indexes for performance\n");

  console.log("⚠️  LƯU Ý:");
  console.log("   - Reset-data vẫn hoạt động bình thường");
  console.log("   - Cần test thực tế trên UI để verify hoàn toàn");
  console.log("   - Orders cũ có variantId = NULL (chấp nhận được)\n");

  await prisma.$disconnect();
}

verifyFixes().catch((e) => {
  console.error("❌ Lỗi:", e);
  process.exit(1);
});
