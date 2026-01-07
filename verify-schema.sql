-- Verify ProductAttribute table structure
-- Run this in Supabase SQL Editor to confirm categoryIds column exists

SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ProductAttribute'
ORDER BY ordinal_position;
