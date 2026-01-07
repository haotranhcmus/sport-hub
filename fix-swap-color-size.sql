-- Script to swap color and size values in ProductVariant table
-- Run this if your color and size data are swapped

BEGIN;

-- Create temporary column to store color values
ALTER TABLE "ProductVariant" ADD COLUMN temp_color TEXT;

-- Copy color to temp
UPDATE "ProductVariant" SET temp_color = color;

-- Swap: color = size
UPDATE "ProductVariant" SET color = size;

-- Swap: size = temp_color (original color)
UPDATE "ProductVariant" SET size = temp_color;

-- Remove temporary column
ALTER TABLE "ProductVariant" DROP COLUMN temp_color;

COMMIT;

-- Verify the swap
SELECT id, sku, size, color, "stockQuantity" 
FROM "ProductVariant" 
LIMIT 10;
