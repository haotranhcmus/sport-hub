-- Enable UUID extension in PostgreSQL
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mruygxkhfdbegwgaewwb/sql/new

-- Enable uuid-ossp extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify it's enabled
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- Test UUID generation
SELECT gen_random_uuid() AS test_uuid;
