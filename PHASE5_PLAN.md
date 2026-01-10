# 🚀 GIAI ĐOẠN 5: PERFORMANCE & PRODUCTION OPTIMIZATION

## 📋 TÓM TẮT

Tối ưu hóa hiệu suất, bảo mật và chuẩn bị cho production:

- 🎯 **Database Optimization:** Fix N+1 queries, thêm indexes thiếu
- 🖼️ **Image Optimization:** Resize, compress, thumbnails
- 🔒 **Security Hardening:** Enable RLS policies, API rate limiting
- ⚡ **Performance:** Caching strategies, query optimization

---

## 🔍 CURRENT ISSUES DETECTED

### 1. N+1 Query Problems

**Location:** `services/product.service.ts` line 7-28

```typescript
// ❌ CURRENT: Load toàn bộ relations cho TẤT CẢ products
list: async (): Promise<Product[]> => {
  const { data } = await supabase
    .from("Product")
    .select(
      `
      *,
      category:Category(*),
      brand:Brand(*),
      variants:ProductVariant(*),
      reviews:Review(*)
    `
    )
    .order("createdAt", { ascending: false });
  return data || [];
};
```

**Issues:**

- Load category/brand cho TỪNG product (N queries)
- Load ALL variants cho product list (không cần thiết)
- Load ALL reviews cho product list (chỉ cần count)
- ProductListPage không cần reviews, chỉ cần variants để check stock

**Impact:**

- 100 products → 100+ queries
- Slow page load (~2-3s thay vì <500ms)
- Waste bandwidth (~500KB thay vì ~50KB)

---

### 2. Missing Database Indexes

**Detected missing indexes:**

#### Order Table

```sql
-- ❌ MISSING: Index cho filter by status
@@index([status])

-- ❌ MISSING: Index cho filter by userId
@@index([userId])

-- ❌ MISSING: Composite index cho common query
@@index([userId, status, createdAt])
```

**Current impact:**

- Admin dashboard filter by status: SLOW (full table scan)
- User orders query: SLOW (no userId index)
- Date range queries: SLOW

#### OrderItem Table

```sql
-- ✅ HAS: @@index([variantId]) (added in Phase 1)

-- ❌ MISSING: Index cho filter by orderId
@@index([orderId])
```

#### Review Table

```sql
-- ✅ HAS: @@index([productId]), @@index([rating])

-- ❌ MISSING: Composite index cho common query
@@index([productId, rating, createdAt])
```

---

### 3. Image Upload Issues

**Current implementation:** `lib/storage.ts`

```typescript
// ❌ ISSUES:
// 1. No image compression before upload
// 2. No resize (users upload 4K images → slow load)
// 3. No thumbnail generation
// 4. No CDN caching headers
```

**Impact:**

- Product images: ~2-5MB mỗi ảnh (should be ~200KB)
- Page load slow vì load full-size images
- Bandwidth waste
- Storage costs tăng nhanh

---

### 4. Security Vulnerabilities

**RLS Policies:** DISABLED (development mode)

```sql
-- Current state: ALL TABLES HAVE RLS DISABLED
-- ⚠️ CRITICAL: Anyone can read/write/delete ANY data
```

**API Rate Limiting:** NONE

- No protection against DDoS
- No brute-force protection on login
- API abuse possible

**Input Validation:** MINIMAL

- Some XSS vulnerabilities
- SQL injection risk (using Prisma helps but not 100%)

---

## ✅ OPTIMIZATION PLAN

### **TASK 1: Fix N+1 Queries**

#### 1.1 Optimize Product List Query

**File:** `services/product.service.ts`

```typescript
// ✅ OPTIMIZED:
list: async (): Promise<Product[]> => {
  const { data } = await supabase
    .from("Product")
    .select(
      `
      *,
      category:Category(id, name, slug),
      brand:Brand(id, name, slug),
      variants:ProductVariant(id, sku, stockQuantity, status)
    `
    )
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false });
  return data || [];
};
```

**Benefits:**

- Only load NEEDED fields (không load description, imageUrl của category/brand)
- No reviews loading (ProductListPage không cần)
- Filter ACTIVE products ngay từ database (không filter client-side)
- ~80% reduction in data transfer

---

#### 1.2 Add Review Count Field

**File:** `prisma/schema.prisma`

```prisma
model Product {
  // ... existing fields
  reviewCount Int @default(0)
  averageRating Float @default(0)

  @@index([reviewCount])
  @@index([averageRating])
}
```

**Migration:**

```sql
-- Add fields
ALTER TABLE "Product"
ADD COLUMN "reviewCount" INT DEFAULT 0,
ADD COLUMN "averageRating" FLOAT DEFAULT 0;

-- Create indexes
CREATE INDEX "Product_reviewCount_idx" ON "Product"("reviewCount");
CREATE INDEX "Product_averageRating_idx" ON "Product"("averageRating");

-- Update existing data
UPDATE "Product" p
SET
  "reviewCount" = (SELECT COUNT(*) FROM "Review" WHERE "productId" = p.id),
  "averageRating" = (SELECT AVG(rating) FROM "Review" WHERE "productId" = p.id);
```

**Trigger for auto-update:**

```sql
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Product"
  SET
    "reviewCount" = (SELECT COUNT(*) FROM "Review" WHERE "productId" = NEW."productId"),
    "averageRating" = (SELECT COALESCE(AVG(rating), 0) FROM "Review" WHERE "productId" = NEW."productId")
  WHERE id = NEW."productId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Review"
FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();
```

---

### **TASK 2: Add Missing Indexes**

**File:** `prisma/schema.prisma`

```prisma
model Order {
  // ... existing fields

  @@index([status])
  @@index([userId])
  @@index([createdAt])
  @@index([userId, status, createdAt]) // Composite for common query
}

model OrderItem {
  // ... existing fields

  @@index([orderId])
  @@index([variantId]) // Already exists
}

model Review {
  // ... existing fields

  @@index([productId, rating, createdAt])
}

model StockEntry {
  @@index([date])
  @@index([status])
}

model StockIssue {
  @@index([date])
  @@index([actorName])
}
```

**Migration command:**

```bash
npx prisma db push
```

**Expected performance gain:**

- Order queries: 10x faster
- Admin dashboard: 5x faster
- Product list with filters: 3x faster

---

### **TASK 3: Image Optimization**

#### 3.1 Client-side Image Compression

**New file:** `lib/imageOptimizer.ts`

```typescript
export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<{ original: File; thumbnail?: File }> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    generateThumbnail = true,
    thumbnailSize = 400,
  } = options;

  // Load image
  const img = await createImageBitmap(file);

  // Calculate dimensions
  let width = img.width;
  let height = img.height;
  const ratio = Math.min(maxWidth / width, maxHeight / height);

  if (ratio < 1) {
    width *= ratio;
    height *= ratio;
  }

  // Create canvas and resize
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality)
  );

  const optimized = new File([blob], file.name, { type: "image/jpeg" });

  // Generate thumbnail
  if (generateThumbnail) {
    const thumbCanvas = document.createElement("canvas");
    const thumbRatio = Math.min(thumbnailSize / width, thumbnailSize / height);
    thumbCanvas.width = width * thumbRatio;
    thumbCanvas.height = height * thumbRatio;
    const thumbCtx = thumbCanvas.getContext("2d")!;
    thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);

    const thumbBlob = await new Promise<Blob>((resolve) =>
      thumbCanvas.toBlob((b) => resolve(b!), "image/jpeg", 0.7)
    );

    const thumbnail = new File(
      [thumbBlob],
      file.name.replace(/\.[^.]+$/, "_thumb.jpg"),
      { type: "image/jpeg" }
    );

    return { original: optimized, thumbnail };
  }

  return { original: optimized };
}
```

#### 3.2 Update Upload Functions

**File:** `lib/storage.ts` - Add before upload:

```typescript
import { optimizeImage } from "./imageOptimizer";

export async function uploadProductImage(file: File, productId: string) {
  // ✅ NEW: Optimize before upload
  const { original, thumbnail } = await optimizeImage(file, {
    maxWidth: 1920,
    quality: 0.85,
    generateThumbnail: true,
  });

  // Upload optimized image
  const path = `products/${productId}/${Date.now()}_${original.name}`;
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(path, original, {
      cacheControl: "3600", // ✅ NEW: CDN cache 1 hour
      upsert: false,
    });

  if (error) throw error;

  // Upload thumbnail
  if (thumbnail) {
    const thumbPath = path.replace(/\.[^.]+$/, "_thumb.jpg");
    await supabase.storage.from("product-images").upload(thumbPath, thumbnail, {
      cacheControl: "3600",
    });
  }

  return supabase.storage.from("product-images").getPublicUrl(path).data
    .publicUrl;
}
```

---

### **TASK 4: Enable RLS Policies**

#### 4.1 Product & Category (Public Read)

**File:** `prisma/enable-rls-production.sql`

```sql
-- Enable RLS on tables
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;

-- Public read for active products
CREATE POLICY "Public can view active products"
ON "Product" FOR SELECT
TO anon, authenticated
USING (status = 'ACTIVE');

-- Admin can do everything
CREATE POLICY "Admin full access to products"
ON "Product" FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  )
);

-- Categories: Public read
CREATE POLICY "Public can view categories"
ON "Category" FOR SELECT
TO anon, authenticated
USING (true);

-- Brands: Public read
CREATE POLICY "Public can view brands"
ON "Brand" FOR SELECT
TO anon, authenticated
USING (true);
```

#### 4.2 User & Order (Owner Access)

```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own profile"
ON "User" FOR SELECT
TO authenticated
USING (id = auth.uid() OR role = 'ADMIN');

-- Users can only view their own orders
CREATE POLICY "Users can view own orders"
ON "Order" FOR SELECT
TO authenticated
USING (
  "userId" = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Admin can create orders for anyone
CREATE POLICY "Admin can manage all orders"
ON "Order" FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
```

---

### **TASK 5: API Rate Limiting**

**New file:** `lib/rateLimiter.ts`

```typescript
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);
```

**Usage in API calls:**

```typescript
// services/index.ts
import { rateLimit } from "../lib/rateLimiter";

export const api = {
  login: async (email: string, password: string) => {
    const limiter = rateLimit(`login:${email}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
    });

    if (!limiter.allowed) {
      throw new Error(
        `Too many login attempts. Try again in ${Math.ceil(
          (limiter.resetTime - Date.now()) / 1000
        )} seconds`
      );
    }

    // ... existing login logic
  },
};
```

---

## 📊 EXPECTED PERFORMANCE GAINS

| Metric                  | Before       | After       | Improvement |
| ----------------------- | ------------ | ----------- | ----------- |
| Product List Load Time  | ~2-3s        | ~400ms      | **7.5x**    |
| Database Queries (list) | ~150 queries | ~15 queries | **10x**     |
| Image Size (avg)        | 2-5MB        | 200-400KB   | **10x**     |
| Page Load Bandwidth     | ~50MB        | ~5MB        | **10x**     |
| Admin Dashboard Load    | ~1.5s        | ~300ms      | **5x**      |
| Database Index Hits     | 20%          | 95%         | **4.75x**   |

---

## 🛡️ SECURITY IMPROVEMENTS

| Feature                | Before | After      | Risk Reduction |
| ---------------------- | ------ | ---------- | -------------- |
| RLS Policies           | ❌ OFF | ✅ ON      | **CRITICAL**   |
| API Rate Limiting      | ❌ NO  | ✅ YES     | **HIGH**       |
| Data Exposure          | ❌ ALL | ✅ LIMITED | **HIGH**       |
| Brute Force Protection | ❌ NO  | ✅ YES     | **MEDIUM**     |

---

## 📝 IMPLEMENTATION ORDER

1. **Phase 5.1:** Add missing database indexes (15 min)
2. **Phase 5.2:** Fix N+1 queries in product service (30 min)
3. **Phase 5.3:** Add review count/rating fields + triggers (30 min)
4. **Phase 5.4:** Implement image optimization (45 min)
5. **Phase 5.5:** Enable RLS policies (45 min)
6. **Phase 5.6:** Add API rate limiting (30 min)

**Total estimated time:** ~3 hours

---

## 🧪 TESTING PLAN

### Performance Testing

- [ ] Measure product list load time (before/after)
- [ ] Check database query count in DevTools
- [ ] Verify image compression works
- [ ] Test CDN caching headers

### Security Testing

- [ ] Verify RLS policies block unauthorized access
- [ ] Test rate limiter blocks excessive requests
- [ ] Verify admin-only endpoints protected

### Functionality Testing

- [ ] Product list displays correctly with optimizations
- [ ] Images load faster with compression
- [ ] Review counts update automatically
- [ ] Orders filtered correctly with new indexes

---

## ⚠️ DEPLOYMENT NOTES

### Database Migrations

```bash
# 1. Add indexes and fields
npx prisma db push

# 2. Run review stats migration
npx tsx prisma/migrations/update-review-stats.ts

# 3. Enable RLS policies
psql $DATABASE_URL -f prisma/enable-rls-production.sql
```

### Environment Variables

```env
# Add to .env
VITE_ENABLE_RLS=true
VITE_RATE_LIMIT_ENABLED=true
```

### Rollback Plan

```sql
-- Disable RLS if issues
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
-- ... etc
```

---

## ✅ SUCCESS CRITERIA

- [ ] Product list loads in <500ms
- [ ] Database queries reduced by >80%
- [ ] Images compressed to <500KB
- [ ] RLS policies enabled and working
- [ ] Rate limiting prevents abuse
- [ ] No TypeScript errors
- [ ] All existing features work correctly
- [ ] Performance metrics verified

---

**Status:** Ready to implement  
**Priority:** HIGH (critical for production)  
**Risk Level:** MEDIUM (RLS may break some queries, need thorough testing)
