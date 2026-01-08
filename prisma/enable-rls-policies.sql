-- Enable Row Level Security (RLS) và tạo policies cho public read access
-- Chạy file này trong Supabase SQL Editor

-- Enable RLS trên tất cả bảng chính
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductAttribute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SizeGuide" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReturnRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockEntryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockIssue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockIssueItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stocktake" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StocktakeItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLIC READ POLICIES (Cho phép đọc công khai)
-- ============================================================================

-- Product: Ai cũng đọc được
CREATE POLICY "Public read Product" ON "Product"
  FOR SELECT USING (true);

-- Category: Ai cũng đọc được
CREATE POLICY "Public read Category" ON "Category"
  FOR SELECT USING (true);

-- Brand: Ai cũng đọc được  
CREATE POLICY "Public read Brand" ON "Brand"
  FOR SELECT USING (true);

-- ProductVariant: Ai cũng đọc được
CREATE POLICY "Public read ProductVariant" ON "ProductVariant"
  FOR SELECT USING (true);

-- ProductAttribute: Ai cũng đọc được
CREATE POLICY "Public read ProductAttribute" ON "ProductAttribute"
  FOR SELECT USING (true);

-- Review: Ai cũng đọc được
CREATE POLICY "Public read Review" ON "Review"
  FOR SELECT USING (true);

-- SizeGuide: Ai cũng đọc được
CREATE POLICY "Public read SizeGuide" ON "SizeGuide"
  FOR SELECT USING (true);

-- SystemConfig: Ai cũng đọc được
CREATE POLICY "Public read SystemConfig" ON "SystemConfig"
  FOR SELECT USING (true);

-- ============================================================================
-- USER-SPECIFIC POLICIES (Chỉ user tự đọc data của mình)
-- ============================================================================

-- User: Chỉ đọc được thông tin của chính mình
-- Note: Trong app này user.id được set thủ công, không dùng auth.uid()
CREATE POLICY "Users can read own data" ON "User"
  FOR SELECT USING (true); -- Tạm thời cho phép đọc tất cả, sau này fix với auth

-- Order: Khách hàng chỉ xem đơn của mình, admin xem tất cả
CREATE POLICY "Users can read own orders" ON "Order"
  FOR SELECT USING (true); -- Tạm thời cho phép đọc tất cả

-- OrderItem: Tương tự Order
CREATE POLICY "Public read OrderItem" ON "OrderItem"
  FOR SELECT USING (true);

-- ReturnRequest: Tương tự Order  
CREATE POLICY "Public read ReturnRequest" ON "ReturnRequest"
  FOR SELECT USING (true);

-- ============================================================================
-- ADMIN/WAREHOUSE POLICIES (Chỉ nhân viên mới đọc được)
-- ============================================================================

-- Supplier: Ai cũng đọc được (cần cho dropdown)
CREATE POLICY "Public read Supplier" ON "Supplier"
  FOR SELECT USING (true);

-- StockEntry: Tạm cho phép đọc tất cả
CREATE POLICY "Public read StockEntry" ON "StockEntry"
  FOR SELECT USING (true);

CREATE POLICY "Public read StockEntryItem" ON "StockEntryItem"
  FOR SELECT USING (true);

-- StockIssue: Tạm cho phép đọc tất cả
CREATE POLICY "Public read StockIssue" ON "StockIssue"
  FOR SELECT USING (true);

CREATE POLICY "Public read StockIssueItem" ON "StockIssueItem"
  FOR SELECT USING (true);

-- Stocktake: Tạm cho phép đọc tất cả
CREATE POLICY "Public read Stocktake" ON "Stocktake"
  FOR SELECT USING (true);

CREATE POLICY "Public read StocktakeItem" ON "StocktakeItem"
  FOR SELECT USING (true);

-- SystemLog: Tạm cho phép đọc tất cả (admin cần xem)
CREATE POLICY "Public read SystemLog" ON "SystemLog"
  FOR SELECT USING (true);

-- ============================================================================
-- WRITE POLICIES (INSERT/UPDATE/DELETE)
-- ============================================================================

-- Tạm thời cho phép tất cả write operations (unsafe, chỉ để dev/test)
-- Sau này cần restrict theo role

CREATE POLICY "Allow all inserts" ON "Product"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all updates" ON "Product"  
  FOR UPDATE USING (true);

CREATE POLICY "Allow all deletes" ON "Product"
  FOR DELETE USING (true);

-- Lặp lại cho các bảng khác cần write access
CREATE POLICY "Allow all inserts Category" ON "Category" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates Category" ON "Category" FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes Category" ON "Category" FOR DELETE USING (true);

CREATE POLICY "Allow all inserts Brand" ON "Brand" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates Brand" ON "Brand" FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes Brand" ON "Brand" FOR DELETE USING (true);

CREATE POLICY "Allow all inserts ProductVariant" ON "ProductVariant" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates ProductVariant" ON "ProductVariant" FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes ProductVariant" ON "ProductVariant" FOR DELETE USING (true);

CREATE POLICY "Allow all inserts Order" ON "Order" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates Order" ON "Order" FOR UPDATE USING (true);

CREATE POLICY "Allow all inserts OrderItem" ON "OrderItem" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all inserts ReturnRequest" ON "ReturnRequest" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates ReturnRequest" ON "ReturnRequest" FOR UPDATE USING (true);

CREATE POLICY "Allow all inserts StockEntry" ON "StockEntry" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all inserts StockEntryItem" ON "StockEntryItem" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all inserts StockIssue" ON "StockIssue" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all inserts StockIssueItem" ON "StockIssueItem" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all inserts SystemLog" ON "SystemLog" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all inserts User" ON "User" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates User" ON "User" FOR UPDATE USING (true);

CREATE POLICY "Allow all inserts SizeGuide" ON "SizeGuide" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates SizeGuide" ON "SizeGuide" FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes SizeGuide" ON "SizeGuide" FOR DELETE USING (true);

CREATE POLICY "Allow all inserts ProductAttribute" ON "ProductAttribute" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates ProductAttribute" ON "ProductAttribute" FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes ProductAttribute" ON "ProductAttribute" FOR DELETE USING (true);

CREATE POLICY "Allow all inserts Supplier" ON "Supplier" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates Supplier" ON "Supplier" FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes Supplier" ON "Supplier" FOR DELETE USING (true);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Tất cả bảng đã enable RLS
-- ✅ Public read access cho Product, Category, Brand, Variants, Reviews, SizeGuide
-- ✅ Public read/write cho Order, User (tạm thời, cần fix sau)
-- ✅ Public read/write cho Stock, Supplier, SystemLog (admin features)
-- ⚠️  LƯU Ý: Đây là config DEVELOPMENT/TESTING, không an toàn cho production
-- ⚠️  Cần implement proper role-based policies sau này
