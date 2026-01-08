-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN     "categoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
