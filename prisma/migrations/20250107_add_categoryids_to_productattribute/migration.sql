-- Add categoryIds column to ProductAttribute table
-- This allows direct querying without joining the _CategoryToProductAttribute table
-- when using Supabase client

ALTER TABLE "ProductAttribute" ADD COLUMN "categoryIds" JSONB DEFAULT '[]'::jsonb;

-- Populate categoryIds from the join table
UPDATE "ProductAttribute" AS pa
SET "categoryIds" = (
  SELECT COALESCE(jsonb_agg("A"), '[]'::jsonb)
  FROM "_CategoryToProductAttribute"
  WHERE "B" = pa.id
);

-- Create index for better query performance
CREATE INDEX "ProductAttribute_categoryIds_idx" ON "ProductAttribute" USING GIN ("categoryIds");
