-- Add variantId column to OrderItem table
-- This allows proper tracking of which variant was ordered
ALTER TABLE "OrderItem" 
ADD COLUMN "variantId" TEXT;

-- Add index for faster variant lookup
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- Note: Existing orders will have NULL variantId
-- New orders will populate this field
