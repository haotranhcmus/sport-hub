-- Grant permissions cho anon role để truy cập schema public
-- Chạy script này trong Supabase SQL Editor

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant select on all sequences
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;

-- Grant INSERT, UPDATE, DELETE for authenticated users (optional)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- Grant INSERT, UPDATE, DELETE for anon users (for demo/development)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO anon;

-- Verify permissions
SELECT grantee, privilege_type, table_schema, table_name
FROM information_schema.table_privileges
WHERE grantee IN ('anon', 'authenticated') 
  AND table_schema = 'public'
ORDER BY table_name, grantee;
