-- Fix: Add categoryIds column to ProductAttribute table
-- Run this in Supabase SQL Editor

-- Check if column exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ProductAttribute' 
        AND column_name = 'categoryIds'
    ) THEN
        -- Add the column
        ALTER TABLE "ProductAttribute" 
        ADD COLUMN "categoryIds" JSONB DEFAULT '[]'::jsonb;
        
        -- Populate from join table
        UPDATE "ProductAttribute" AS pa
        SET "categoryIds" = (
            SELECT COALESCE(jsonb_agg("A"), '[]'::jsonb)
            FROM "_CategoryToProductAttribute"
            WHERE "B" = pa.id
        );
        
        -- Create index
        CREATE INDEX IF NOT EXISTS "ProductAttribute_categoryIds_idx" 
        ON "ProductAttribute" USING GIN ("categoryIds");
        
        RAISE NOTICE 'Column categoryIds added successfully to ProductAttribute';
    ELSE
        RAISE NOTICE 'Column categoryIds already exists in ProductAttribute';
    END IF;
END $$;
