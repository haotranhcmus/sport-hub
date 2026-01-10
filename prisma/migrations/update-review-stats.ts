/**
 * Migration Script: Update Review Stats for Existing Products
 *
 * Populates reviewCount and averageRating fields in Product table
 * based on existing Review data.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateReviewStats() {
  console.log("🔄 Updating review stats for all products...\n");

  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;

    for (const product of products) {
      // Calculate review stats
      const reviews = await prisma.review.findMany({
        where: { productId: product.id },
        select: { rating: true },
      });

      const reviewCount = reviews.length;
      const averageRating =
        reviewCount > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

      // Update product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          reviewCount,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        },
      });

      if (reviewCount > 0) {
        console.log(
          `   ✅ ${
            product.name
          }: ${reviewCount} reviews, avg ${averageRating.toFixed(1)}⭐`
        );
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} products with review stats`);
    console.log(
      `   ${
        products.length - updated
      } products have 0 reviews (skipped logging)\n`
    );
  } catch (error) {
    console.error("❌ Error updating review stats:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateReviewStats();
