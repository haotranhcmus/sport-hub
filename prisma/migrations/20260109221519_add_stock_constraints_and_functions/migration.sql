-- =====================================================
-- MIGRATION: Add Stock Constraints and Functions
-- Purpose: Prevent overselling and add atomic stock operations
-- Date: 2026-01-09
-- =====================================================

-- =====================================================
-- PART 1: Add Database Constraint for Stock
-- =====================================================

-- Add constraint to ensure stock quantity never goes negative
-- This prevents database-level overselling
ALTER TABLE "ProductVariant" 
ADD CONSTRAINT check_stock_non_negative 
CHECK ("stockQuantity" >= 0);

-- Add index on stockQuantity for faster stock queries
CREATE INDEX IF NOT EXISTS idx_variant_stock 
ON "ProductVariant"("stockQuantity");

-- =====================================================
-- PART 2: Create Stock Management Functions
-- =====================================================

-- Function 1: Increment Stock (for cancellations/returns)
CREATE OR REPLACE FUNCTION increment_variant_stock(
  variant_id TEXT,
  quantity INT
) RETURNS VOID AS $$
BEGIN
  UPDATE "ProductVariant"
  SET "stockQuantity" = "stockQuantity" + quantity,
      "updatedAt" = NOW()
  WHERE id = variant_id;
  
  -- Log the operation
  RAISE NOTICE 'Incremented stock for variant % by %', variant_id, quantity;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Decrement Stock (for orders) with validation
CREATE OR REPLACE FUNCTION decrement_variant_stock(
  variant_id TEXT,
  quantity INT
) RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT "stockQuantity" INTO current_stock
  FROM "ProductVariant"
  WHERE id = variant_id
  FOR UPDATE;
  
  -- Check if enough stock available
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Variant % not found', variant_id;
  END IF;
  
  IF current_stock < quantity THEN
    RAISE NOTICE 'Insufficient stock for variant %: available=%, needed=%', variant_id, current_stock, quantity;
    RETURN FALSE;
  END IF;
  
  -- Deduct stock
  UPDATE "ProductVariant"
  SET "stockQuantity" = "stockQuantity" - quantity,
      "updatedAt" = NOW()
  WHERE id = variant_id;
  
  RAISE NOTICE 'Decremented stock for variant % by %', variant_id, quantity;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Batch Stock Deduction (for orders with multiple items)
-- This ensures atomic stock deduction for entire order
CREATE OR REPLACE FUNCTION deduct_stock_batch(
  items JSONB
) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  item JSONB;
  variant_id TEXT;
  quantity INT;
  current_stock INT;
BEGIN
  -- Process each item
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    variant_id := item->>'variantId';
    quantity := (item->>'quantity')::INT;
    
    -- Lock and check stock
    SELECT "stockQuantity" INTO current_stock
    FROM "ProductVariant"
    WHERE id = variant_id
    FOR UPDATE;
    
    IF current_stock IS NULL THEN
      success := FALSE;
      message := 'Variant ' || variant_id || ' not found';
      RETURN NEXT;
      RETURN;
    END IF;
    
    IF current_stock < quantity THEN
      success := FALSE;
      message := 'Insufficient stock for variant ' || variant_id || ': available=' || current_stock || ', needed=' || quantity;
      RETURN NEXT;
      RETURN;
    END IF;
    
    -- Deduct stock
    UPDATE "ProductVariant"
    SET "stockQuantity" = "stockQuantity" - quantity,
        "updatedAt" = NOW()
    WHERE id = variant_id;
  END LOOP;
  
  success := TRUE;
  message := 'Stock deducted successfully';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 3: Add Comments for Documentation
-- =====================================================

COMMENT ON CONSTRAINT check_stock_non_negative ON "ProductVariant" 
IS 'Ensures stock quantity never goes below 0 to prevent overselling';

COMMENT ON FUNCTION increment_variant_stock IS 
'Safely increments stock quantity for a variant (used in returns/cancellations)';

COMMENT ON FUNCTION decrement_variant_stock IS 
'Safely decrements stock quantity with row locking to prevent race conditions';

COMMENT ON FUNCTION deduct_stock_batch IS 
'Atomically deducts stock for multiple items in a single transaction';
