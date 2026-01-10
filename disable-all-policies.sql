-- Disable RLS completely on storage.objects for product-images bucket
-- This allows anyone (authenticated or not) to upload/read/update/delete

-- First, drop all existing policies on storage.objects
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Disable RLS on storage.objects table (WARNING: This makes storage public!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
