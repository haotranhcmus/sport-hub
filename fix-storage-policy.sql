-- Solution: Create a permissive policy that allows everything
-- This works without needing to disable RLS

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_0" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_1" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_2" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_3" ON storage.objects;

-- Create ONE permissive policy for product-images bucket
-- This allows ANYONE (authenticated, anon, service_role) to do EVERYTHING
CREATE POLICY "Allow all operations on product-images"
ON storage.objects
FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Verify
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
