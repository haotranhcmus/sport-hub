-- Fix Supabase RLS policies để cho phép đọc dữ liệu public
-- Chạy script này trong Supabase SQL Editor

-- Option 1: Tắt RLS hoàn toàn (Dùng cho demo/development)
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SizeGuide" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductAttribute" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "StockEntry" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "StockIssue" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Stocktake" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ReturnRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemLog" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemConfig" DISABLE ROW LEVEL SECURITY;

-- Option 2: Bật RLS nhưng cho phép SELECT cho tất cả (An toàn hơn)
-- Uncomment các dòng dưới nếu muốn dùng option 2 thay vì option 1

-- ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON "Product" FOR SELECT USING (true);

-- ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON "ProductVariant" FOR SELECT USING (true);

-- ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON "Category" FOR SELECT USING (true);

-- ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON "Brand" FOR SELECT USING (true);

-- ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON "Review" FOR SELECT USING (true);

-- Verify RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
