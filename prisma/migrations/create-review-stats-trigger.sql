-- Trigger to auto-update Product.reviewCount and Product.averageRating
-- when Review is inserted, updated, or deleted

CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  product_id_to_update TEXT;
BEGIN
  -- Determine which product to update
  IF (TG_OP = 'DELETE') THEN
    product_id_to_update := OLD."productId";
  ELSE
    product_id_to_update := NEW."productId";
  END IF;

  -- Update Product stats
  UPDATE "Product"
  SET 
    "reviewCount" = (
      SELECT COUNT(*) 
      FROM "Review" 
      WHERE "productId" = product_id_to_update
    ),
    "averageRating" = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) 
      FROM "Review" 
      WHERE "productId" = product_id_to_update
    )
  WHERE id = product_id_to_update;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS review_stats_trigger ON "Review";

-- Create trigger
CREATE TRIGGER review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Review"
FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();

-- Test trigger
SELECT 'Trigger created successfully!' AS status;
