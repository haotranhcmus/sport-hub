-- Delete ALL old policies to start fresh
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_0" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_1" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_2" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 1o4ju0s_3" ON storage.objects;

-- Also drop any other variants (in case the names are different)
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname LIKE '%anon%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;
