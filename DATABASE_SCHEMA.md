# Database Schema Documentation

## Overview

This document describes the complete database schema for the Sport-Hub e-commerce application. The database uses PostgreSQL via Supabase with Prisma ORM.

**Last Updated:** January 7, 2026 (Updated with ProductAttribute.categoryIds column)

---

## Tables

### 1. SizeGuide

Stores size guide charts for products and categories.

| Column      | Type      | Constraints             | Description                     |
| ----------- | --------- | ----------------------- | ------------------------------- |
| id          | TEXT      | PRIMARY KEY             | Unique identifier (UUID)        |
| name        | TEXT      | NOT NULL                | Name of the size guide          |
| description | TEXT      | NULLABLE                | Optional description            |
| columns     | JSONB     | NOT NULL                | Column definitions (key, label) |
| rows        | JSONB     | NOT NULL                | Row data (size chart values)    |
| createdAt   | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp              |
| updatedAt   | TIMESTAMP | NOT NULL                | Last update timestamp           |

**Relations:**

- Has many `Category` (via sizeGuideId)
- Has many `Product` (via sizeGuideId)

**Indexes:**

- `name`

---

### 2. Category

Product categories with hierarchical structure.

| Column      | Type      | Constraints                  | Description                   |
| ----------- | --------- | ---------------------------- | ----------------------------- |
| id          | TEXT      | PRIMARY KEY                  | Unique identifier (UUID)      |
| name        | TEXT      | NOT NULL                     | Category name                 |
| slug        | TEXT      | UNIQUE, NOT NULL             | URL-friendly slug             |
| imageUrl    | TEXT      | NULLABLE                     | Category image URL            |
| description | TEXT      | NULLABLE                     | Category description          |
| parentId    | TEXT      | NULLABLE, FK → Category(id)  | Parent category for hierarchy |
| sizeGuideId | TEXT      | NULLABLE, FK → SizeGuide(id) | Default size guide            |
| createdAt   | TIMESTAMP | NOT NULL, DEFAULT NOW()      | Creation timestamp            |
| updatedAt   | TIMESTAMP | NOT NULL                     | Last update timestamp         |

**Relations:**

- Belongs to `SizeGuide` (optional)
- Belongs to `Category` as parent (optional, self-reference)
- Has many `Category` as children
- Has many `Product`
- Many-to-many with `ProductAttribute` via `_CategoryToProductAttribute`

**Indexes:**

- `slug` (unique)
- `parentId`
- `sizeGuideId`

---

### 3. Brand

Product brands/manufacturers.

| Column    | Type      | Constraints             | Description              |
| --------- | --------- | ----------------------- | ------------------------ |
| id        | TEXT      | PRIMARY KEY             | Unique identifier (UUID) |
| name      | TEXT      | NOT NULL                | Brand name               |
| slug      | TEXT      | UNIQUE, NOT NULL        | URL-friendly slug        |
| logoUrl   | TEXT      | NULLABLE                | Brand logo URL           |
| country   | TEXT      | NULLABLE                | Country of origin        |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp       |
| updatedAt | TIMESTAMP | NOT NULL                | Last update timestamp    |

**Relations:**

- Has many `Product`

**Indexes:**

- `slug` (unique)

---

### 4. ProductAttribute

Product attributes for variants and information (e.g., color, size, material).

| Column      | Type      | Constraints             | Description                                         |
| ----------- | --------- | ----------------------- | --------------------------------------------------- |
| id          | TEXT      | PRIMARY KEY             | Unique identifier (UUID)                            |
| name        | TEXT      | NOT NULL                | Attribute name (e.g., "Màu sắc")                    |
| code        | TEXT      | UNIQUE, NOT NULL        | Code identifier (e.g., "mau_sac")                   |
| type        | TEXT      | NOT NULL                | "variant" or "info"                                 |
| values      | JSONB     | NOT NULL                | Array of possible values                            |
| categoryIds | JSONB     | DEFAULT '[]'            | **Array of category IDs this attribute applies to** |
| createdAt   | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp                                  |
| updatedAt   | TIMESTAMP | NOT NULL                | Last update timestamp                               |

**Relations:**

- Many-to-many with `Category` via `_CategoryToProductAttribute`

**Indexes:**

- `code` (unique)
- `type`
- `categoryIds` (GIN index for JSON queries)

**Important Notes:**

- `categoryIds` is a JSON array field added for direct Supabase querying
- The many-to-many relationship is also maintained via `_CategoryToProductAttribute` table
- Type "variant" = attributes used for creating product variants (color, size)
- Type "info" = informational attributes displayed as specs

---

### 5. Product

Main product catalog.

| Column           | Type               | Constraints                  | Description                             |
| ---------------- | ------------------ | ---------------------------- | --------------------------------------- |
| id               | TEXT               | PRIMARY KEY                  | Unique identifier (UUID)                |
| productCode      | TEXT               | UNIQUE, NOT NULL             | Product code (SKU prefix)               |
| modelCode        | TEXT               | NULLABLE                     | Model/series code                       |
| name             | TEXT               | NOT NULL                     | Product name                            |
| slug             | TEXT               | UNIQUE, NOT NULL             | URL-friendly slug                       |
| description      | TEXT               | NOT NULL                     | Product description                     |
| costPrice        | FLOAT              | NULLABLE                     | Purchase/cost price                     |
| basePrice        | FLOAT              | NOT NULL                     | Regular selling price                   |
| promotionalPrice | FLOAT              | NULLABLE                     | Promotional/sale price                  |
| thumbnailUrl     | TEXT               | NOT NULL                     | Main product image URL                  |
| status           | ENUM ProductStatus | NOT NULL, DEFAULT 'ACTIVE'   | Product status                          |
| categoryId       | TEXT               | NOT NULL, FK → Category(id)  | Product category                        |
| brandId          | TEXT               | NOT NULL, FK → Brand(id)     | Product brand                           |
| totalSold        | INTEGER            | NOT NULL, DEFAULT 0          | Total quantity sold                     |
| allowReturn      | BOOLEAN            | NOT NULL, DEFAULT true       | Return policy enabled                   |
| returnPeriod     | INTEGER            | NOT NULL, DEFAULT 7          | Return period in days                   |
| freeShipping     | BOOLEAN            | NOT NULL, DEFAULT false      | Free shipping flag                      |
| attributes       | JSONB              | NULLABLE                     | Product-specific attributes             |
| sizeGuideId      | TEXT               | NULLABLE, FK → SizeGuide(id) | Product size guide (overrides category) |
| condition        | TEXT               | NULLABLE                     | Product condition description           |
| createdAt        | TIMESTAMP          | NOT NULL, DEFAULT NOW()      | Creation timestamp                      |
| updatedAt        | TIMESTAMP          | NOT NULL                     | Last update timestamp                   |

**Relations:**

- Belongs to `Category`
- Belongs to `Brand`
- Belongs to `SizeGuide` (optional)
- Has many `ProductVariant`
- Has many `Review`
- Has many `OrderItem`

**Indexes:**

- `slug` (unique)
- `productCode` (unique)
- `status`
- `categoryId`
- `brandId`
- `sizeGuideId`

**Enum ProductStatus:**

- DRAFT
- ACTIVE
- INACTIVE
- ARCHIVED

---

### 6. ProductVariant

Product variants (color/size combinations).

| Column          | Type      | Constraints                | Description              |
| --------------- | --------- | -------------------------- | ------------------------ |
| id              | TEXT      | PRIMARY KEY                | Unique identifier (UUID) |
| productId       | TEXT      | NOT NULL, FK → Product(id) | Parent product           |
| sku             | TEXT      | UNIQUE, NOT NULL           | Stock Keeping Unit code  |
| size            | TEXT      | NOT NULL                   | Size value               |
| color           | TEXT      | NOT NULL                   | Color value              |
| stockQuantity   | INTEGER   | NOT NULL, DEFAULT 0        | Available stock          |
| priceAdjustment | FLOAT     | NOT NULL, DEFAULT 0        | Price adjustment (+/-)   |
| imageUrl        | TEXT      | NULLABLE                   | Variant-specific image   |
| status          | TEXT      | NOT NULL, DEFAULT 'active' | "active" or "archived"   |
| createdAt       | TIMESTAMP | NOT NULL, DEFAULT NOW()    | Creation timestamp       |
| updatedAt       | TIMESTAMP | NOT NULL                   | Last update timestamp    |

**Relations:**

- Belongs to `Product` (CASCADE delete)

**Indexes:**

- `sku` (unique)
- `productId`
- `status`

---

### 7. Review

Product reviews and ratings.

| Column    | Type      | Constraints                | Description              |
| --------- | --------- | -------------------------- | ------------------------ |
| id        | TEXT      | PRIMARY KEY                | Unique identifier (UUID) |
| productId | TEXT      | NOT NULL, FK → Product(id) | Product being reviewed   |
| userName  | TEXT      | NOT NULL                   | Reviewer name            |
| rating    | INTEGER   | NOT NULL                   | Rating (1-5)             |
| comment   | TEXT      | NOT NULL                   | Review text              |
| avatarUrl | TEXT      | NULLABLE                   | Reviewer avatar          |
| images    | JSONB     | NULLABLE                   | Review images array      |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW()    | Creation timestamp       |
| updatedAt | TIMESTAMP | NOT NULL                   | Last update timestamp    |

**Relations:**

- Belongs to `Product` (CASCADE delete)

**Indexes:**

- `productId`
- `rating`

---

### 8. User

System users (customers, admins, staff).

| Column     | Type          | Constraints                  | Description              |
| ---------- | ------------- | ---------------------------- | ------------------------ |
| id         | TEXT          | PRIMARY KEY                  | Unique identifier (UUID) |
| email      | TEXT          | UNIQUE, NOT NULL             | Email address            |
| fullName   | TEXT          | NOT NULL                     | Full name                |
| phone      | TEXT          | NULLABLE                     | Phone number             |
| role       | ENUM UserRole | NOT NULL, DEFAULT 'CUSTOMER' | User role                |
| status     | TEXT          | NOT NULL, DEFAULT 'active'   | "active" or "locked"     |
| staffId    | TEXT          | UNIQUE, NULLABLE             | Staff ID (for employees) |
| idCard     | TEXT          | NULLABLE                     | ID card number           |
| position   | TEXT          | NULLABLE                     | Job position             |
| department | TEXT          | NULLABLE                     | Department               |
| avatarUrl  | TEXT          | NULLABLE                     | Profile picture URL      |
| joinDate   | TIMESTAMP     | NULLABLE                     | Employment start date    |
| addresses  | JSONB         | NULLABLE                     | Array of saved addresses |
| createdAt  | TIMESTAMP     | NOT NULL, DEFAULT NOW()      | Creation timestamp       |
| updatedAt  | TIMESTAMP     | NOT NULL                     | Last update timestamp    |

**Relations:**

- Has many `Order`
- Has many `SystemLog`

**Indexes:**

- `email` (unique)
- `role`
- `staffId` (unique)

**Enum UserRole:**

- ADMIN
- SALES
- WAREHOUSE
- CUSTOMER

---

### 9. Order

Customer orders.

| Column          | Type               | Constraints                         | Description                   |
| --------------- | ------------------ | ----------------------------------- | ----------------------------- |
| id              | TEXT               | PRIMARY KEY                         | Unique identifier (UUID)      |
| orderCode       | TEXT               | UNIQUE, NOT NULL                    | Order number                  |
| userId          | TEXT               | NULLABLE, FK → User(id)             | Customer user (if registered) |
| customerName    | TEXT               | NOT NULL                            | Customer name                 |
| customerPhone   | TEXT               | NOT NULL                            | Customer phone                |
| customerAddress | TEXT               | NOT NULL                            | Delivery address              |
| customerNotes   | TEXT               | NULLABLE                            | Customer notes/requests       |
| customerType    | TEXT               | NOT NULL, DEFAULT 'guest'           | "guest" or "registered"       |
| totalAmount     | FLOAT              | NOT NULL                            | Total order amount            |
| shippingFee     | FLOAT              | NOT NULL, DEFAULT 0                 | Shipping fee                  |
| status          | ENUM OrderStatus   | NOT NULL, DEFAULT 'PENDING_PAYMENT' | Order status                  |
| paymentMethod   | ENUM PaymentMethod | NOT NULL, DEFAULT 'COD'             | Payment method                |
| paymentStatus   | ENUM PaymentStatus | NOT NULL, DEFAULT 'PENDING'         | Payment status                |
| deliveryDate    | TIMESTAMP          | NULLABLE                            | Expected/actual delivery date |
| courierName     | TEXT               | NULLABLE                            | Courier service name          |
| trackingNumber  | TEXT               | NULLABLE                            | Tracking number               |
| deliveryPerson  | TEXT               | NULLABLE                            | Delivery person name          |
| createdAt       | TIMESTAMP          | NOT NULL, DEFAULT NOW()             | Creation timestamp            |
| updatedAt       | TIMESTAMP          | NOT NULL                            | Last update timestamp         |

**Relations:**

- Belongs to `User` (optional)
- Has many `OrderItem` (CASCADE delete)
- Has many `ReturnRequest` (CASCADE delete)

**Indexes:**

- `orderCode` (unique)
- `userId`
- `status`
- `paymentStatus`
- `customerPhone`
- `createdAt`

**Enum OrderStatus:**

- PENDING_PAYMENT
- PENDING_CONFIRMATION
- PACKING
- SHIPPING
- COMPLETED
- CANCELLED
- DELIVERY_FAILED
- RETURN_REQUESTED
- RETURN_PROCESSING
- RETURN_COMPLETED

**Enum PaymentMethod:**

- COD (Cash on Delivery)
- ONLINE

**Enum PaymentStatus:**

- PAID
- UNPAID
- PENDING
- PENDING_REFUND
- REFUNDED
- PARTIAL_REFUNDED

---

### 10. OrderItem

Items within an order.

| Column       | Type                  | Constraints                | Description              |
| ------------ | --------------------- | -------------------------- | ------------------------ |
| id           | TEXT                  | PRIMARY KEY                | Unique identifier (UUID) |
| orderId      | TEXT                  | NOT NULL, FK → Order(id)   | Parent order             |
| productId    | TEXT                  | NOT NULL, FK → Product(id) | Product reference        |
| productName  | TEXT                  | NOT NULL                   | Product name snapshot    |
| quantity     | INTEGER               | NOT NULL                   | Quantity ordered         |
| unitPrice    | FLOAT                 | NOT NULL                   | Price per unit           |
| color        | TEXT                  | NULLABLE                   | Variant color            |
| size         | TEXT                  | NULLABLE                   | Variant size             |
| thumbnailUrl | TEXT                  | NULLABLE                   | Product image snapshot   |
| isReviewed   | BOOLEAN               | NOT NULL, DEFAULT false    | Has customer reviewed    |
| reviewInfo   | JSONB                 | NULLABLE                   | Review data if reviewed  |
| returnStatus | ENUM ItemReturnStatus | NOT NULL, DEFAULT 'NONE'   | Return status            |
| createdAt    | TIMESTAMP             | NOT NULL, DEFAULT NOW()    | Creation timestamp       |
| updatedAt    | TIMESTAMP             | NOT NULL                   | Last update timestamp    |

**Relations:**

- Belongs to `Order` (CASCADE delete)
- Belongs to `Product`
- Has many `ReturnRequest` (CASCADE delete)

**Indexes:**

- `orderId`
- `productId`
- `returnStatus`

**Enum ItemReturnStatus:**

- NONE
- REQUESTED
- APPROVED
- REJECTED
- COMPLETED

---

### 11. ReturnRequest

Product return/exchange requests.

| Column          | Type                     | Constraints                  | Description                    |
| --------------- | ------------------------ | ---------------------------- | ------------------------------ |
| id              | TEXT                     | PRIMARY KEY                  | Unique identifier (UUID)       |
| requestCode     | TEXT                     | UNIQUE, NOT NULL             | Request number                 |
| orderId         | TEXT                     | NOT NULL, FK → Order(id)     | Parent order                   |
| orderItemId     | TEXT                     | NOT NULL, FK → OrderItem(id) | Item being returned            |
| type            | ENUM ReturnType          | NOT NULL                     | "REFUND" or "EXCHANGE"         |
| status          | ENUM ReturnRequestStatus | NOT NULL, DEFAULT 'PENDING'  | Request status                 |
| reason          | TEXT                     | NOT NULL                     | Return reason                  |
| evidenceImages  | TEXT[]                   | ARRAY                        | Evidence photo URLs            |
| refundAmount    | FLOAT                    | NULLABLE                     | Refund amount (for REFUND)     |
| bankInfo        | JSONB                    | NULLABLE                     | Bank account info (for REFUND) |
| exchangeToSize  | TEXT                     | NULLABLE                     | New size (for EXCHANGE)        |
| exchangeToColor | TEXT                     | NULLABLE                     | New color (for EXCHANGE)       |
| newOrderId      | TEXT                     | NULLABLE                     | New order ID (for EXCHANGE)    |
| adminNotes      | TEXT                     | NULLABLE                     | Admin processing notes         |
| processedBy     | TEXT                     | NULLABLE                     | Admin user ID                  |
| processedAt     | TIMESTAMP                | NULLABLE                     | Processing timestamp           |
| createdAt       | TIMESTAMP                | NOT NULL, DEFAULT NOW()      | Creation timestamp             |
| updatedAt       | TIMESTAMP                | NOT NULL                     | Last update timestamp          |

**Relations:**

- Belongs to `Order` (CASCADE delete)
- Belongs to `OrderItem` (CASCADE delete)

**Indexes:**

- `requestCode` (unique)
- `orderId`
- `orderItemId`
- `status`

**Enum ReturnType:**

- REFUND
- EXCHANGE

**Enum ReturnRequestStatus:**

- PENDING
- APPROVED
- REJECTED
- PROCESSING
- COMPLETED
- CANCELLED

---

### 12. Supplier

Inventory suppliers.

| Column        | Type      | Constraints                | Description              |
| ------------- | --------- | -------------------------- | ------------------------ |
| id            | TEXT      | PRIMARY KEY                | Unique identifier (UUID) |
| name          | TEXT      | NOT NULL                   | Supplier name            |
| taxCode       | TEXT      | NULLABLE                   | Tax ID number            |
| contactPerson | TEXT      | NOT NULL                   | Contact person name      |
| phone         | TEXT      | NOT NULL                   | Contact phone            |
| email         | TEXT      | NULLABLE                   | Contact email            |
| address       | TEXT      | NULLABLE                   | Supplier address         |
| status        | TEXT      | NOT NULL, DEFAULT 'active' | "active" or "inactive"   |
| createdAt     | TIMESTAMP | NOT NULL, DEFAULT NOW()    | Creation timestamp       |
| updatedAt     | TIMESTAMP | NOT NULL                   | Last update timestamp    |

**Relations:**

- Has many `StockEntry`

**Indexes:** None

---

### 13. StockEntry

Inventory receiving records.

| Column       | Type      | Constraints                   | Description              |
| ------------ | --------- | ----------------------------- | ------------------------ |
| id           | TEXT      | PRIMARY KEY                   | Unique identifier (UUID) |
| code         | TEXT      | NOT NULL                      | Entry code               |
| supplierId   | TEXT      | NOT NULL, FK → Supplier(id)   | Supplier                 |
| supplierName | TEXT      | NOT NULL                      | Supplier name snapshot   |
| date         | TIMESTAMP | NOT NULL                      | Entry date               |
| totalAmount  | FLOAT     | NOT NULL                      | Total cost               |
| status       | TEXT      | NOT NULL, DEFAULT 'completed' | Entry status             |
| items        | JSONB     | NOT NULL                      | Array of items received  |
| actorName    | TEXT      | NOT NULL                      | Staff who created entry  |
| createdAt    | TIMESTAMP | NOT NULL, DEFAULT NOW()       | Creation timestamp       |
| updatedAt    | TIMESTAMP | NOT NULL                      | Last update timestamp    |

**Relations:**

- Belongs to `Supplier`

**Indexes:** None

---

### 14. StockIssue

Inventory outgoing records.

| Column         | Type      | Constraints                   | Description              |
| -------------- | --------- | ----------------------------- | ------------------------ |
| id             | TEXT      | PRIMARY KEY                   | Unique identifier (UUID) |
| code           | TEXT      | NOT NULL                      | Issue code               |
| date           | TIMESTAMP | NOT NULL                      | Issue date               |
| status         | TEXT      | NOT NULL, DEFAULT 'completed' | Issue status             |
| items          | JSONB     | NOT NULL                      | Array of items issued    |
| actorName      | TEXT      | NOT NULL                      | Staff who created issue  |
| type           | TEXT      | NOT NULL, DEFAULT 'sales'     | Issue type               |
| totalAmount    | FLOAT     | NOT NULL                      | Total value              |
| orderCodes     | JSONB     | NULLABLE                      | Related order codes      |
| warehouseName  | TEXT      | NULLABLE                      | Warehouse name           |
| customerName   | TEXT      | NULLABLE                      | Customer name            |
| courierName    | TEXT      | NULLABLE                      | Courier name             |
| trackingNumber | TEXT      | NULLABLE                      | Tracking number          |
| deliveryPerson | TEXT      | NULLABLE                      | Delivery person          |
| createdAt      | TIMESTAMP | NOT NULL, DEFAULT NOW()       | Creation timestamp       |
| updatedAt      | TIMESTAMP | NOT NULL                      | Last update timestamp    |

**Relations:** None

**Indexes:** None

---

### 15. Stocktake

Inventory audit/count records.

| Column           | Type      | Constraints               | Description              |
| ---------------- | --------- | ------------------------- | ------------------------ |
| id               | TEXT      | PRIMARY KEY               | Unique identifier (UUID) |
| code             | TEXT      | NOT NULL                  | Stocktake code           |
| date             | TIMESTAMP | NOT NULL                  | Audit date               |
| status           | TEXT      | NOT NULL, DEFAULT 'draft' | "draft" or "completed"   |
| items            | JSONB     | NOT NULL                  | Array of counted items   |
| totalDiscrepancy | INTEGER   | NOT NULL, DEFAULT 0       | Total discrepancy count  |
| auditorName      | TEXT      | NOT NULL                  | Auditor name             |
| scope            | TEXT      | NOT NULL                  | Audit scope              |
| createdAt        | TIMESTAMP | NOT NULL, DEFAULT NOW()   | Creation timestamp       |
| updatedAt        | TIMESTAMP | NOT NULL                  | Last update timestamp    |

**Relations:** None

**Indexes:** None

---

### 16. SystemConfig

Global system configuration.

| Column            | Type      | Constraints             | Description               |
| ----------------- | --------- | ----------------------- | ------------------------- |
| id                | TEXT      | PRIMARY KEY             | Unique identifier (UUID)  |
| websiteTitle      | TEXT      | NOT NULL                | Website title             |
| logoUrl           | TEXT      | NOT NULL                | Logo URL                  |
| hotline           | TEXT      | NOT NULL                | Hotline number            |
| contactEmail      | TEXT      | NOT NULL                | Contact email             |
| address           | TEXT      | NOT NULL                | Business address          |
| vatRate           | FLOAT     | NOT NULL, DEFAULT 8     | VAT percentage            |
| lowStockThreshold | INTEGER   | NOT NULL, DEFAULT 5     | Low stock alert threshold |
| returnPeriodDays  | INTEGER   | NOT NULL, DEFAULT 7     | Default return period     |
| banners           | JSONB     | NOT NULL                | Homepage banner array     |
| createdAt         | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp        |
| updatedAt         | TIMESTAMP | NOT NULL                | Last update timestamp     |

**Relations:** None

**Indexes:** None

---

### 17. SystemLog

System activity audit log.

| Column      | Type                 | Constraints             | Description               |
| ----------- | -------------------- | ----------------------- | ------------------------- |
| id          | TEXT                 | PRIMARY KEY             | Unique identifier (UUID)  |
| actorId     | TEXT                 | NOT NULL, FK → User(id) | User who performed action |
| actorName   | TEXT                 | NOT NULL                | User name snapshot        |
| actionType  | ENUM SystemLogAction | NOT NULL                | Action type               |
| targetId    | TEXT                 | NOT NULL                | Target record ID          |
| oldValue    | JSONB                | NULLABLE                | Previous value            |
| newValue    | JSONB                | NULLABLE                | New value                 |
| ipAddress   | TEXT                 | NOT NULL                | IP address                |
| description | TEXT                 | NOT NULL                | Action description        |
| timestamp   | TIMESTAMP            | NOT NULL, DEFAULT NOW() | Action timestamp          |

**Relations:**

- Belongs to `User`

**Indexes:** None

**Enum SystemLogAction:**

- CREATE
- UPDATE
- DELETE
- LOGIN
- APPROVE
- REJECT
- PAYMENT
- STOCK_CHANGE
- STOCK_ADJUST

---

### 18. \_CategoryToProductAttribute

Many-to-many join table (managed by Prisma).

| Column | Type | Constraints                                   | Description         |
| ------ | ---- | --------------------------------------------- | ------------------- |
| A      | TEXT | PRIMARY KEY (A, B), FK → Category(id)         | Category ID         |
| B      | TEXT | PRIMARY KEY (A, B), FK → ProductAttribute(id) | ProductAttribute ID |

**Relations:**

- Links `Category` ↔ `ProductAttribute`

**Note:** This table is automatically managed by Prisma for the many-to-many relationship. The `ProductAttribute.categoryIds` JSON field provides a denormalized copy for easier Supabase client queries.

---

## Key Relationships Summary

```
SizeGuide
├── Category (1-to-many)
└── Product (1-to-many)

Category
├── Category (self-reference, hierarchical)
├── Product (1-to-many)
└── ProductAttribute (many-to-many via _CategoryToProductAttribute)

Brand
└── Product (1-to-many)

Product
├── ProductVariant (1-to-many, CASCADE)
├── Review (1-to-many, CASCADE)
└── OrderItem (1-to-many)

User
├── Order (1-to-many)
└── SystemLog (1-to-many)

Order
├── OrderItem (1-to-many, CASCADE)
└── ReturnRequest (1-to-many, CASCADE)

OrderItem
└── ReturnRequest (1-to-many, CASCADE)

Supplier
└── StockEntry (1-to-many)
```

---

## Important Notes

### 1. Denormalized Fields

- **ProductAttribute.categoryIds**: JSON array added for Supabase client compatibility. Should be kept in sync with `_CategoryToProductAttribute` table.
- **OrderItem fields**: Contains snapshot data (productName, thumbnailUrl) to preserve historical order information even if product is modified.
- **StockEntry/StockIssue/Stocktake.items**: JSONB arrays containing denormalized product data for inventory tracking.

### 2. Cascade Deletes

- Deleting a `Product` will CASCADE delete all its `ProductVariant` and `Review` records
- Deleting an `Order` will CASCADE delete all `OrderItem` and `ReturnRequest` records
- Deleting an `OrderItem` will CASCADE delete its `ReturnRequest` records

### 3. Timestamps

- All tables have `createdAt` (auto-set on creation) and `updatedAt` (must be manually updated via application code or triggers)
- Supabase REST API does NOT automatically update `updatedAt` - application must set this explicitly

### 4. UUIDs

- All primary keys use TEXT type containing UUIDs generated via `crypto.randomUUID()` or `uuid()` function

### 5. Enums

Custom enum types defined in PostgreSQL:

- ProductStatus
- OrderStatus
- UserRole
- PaymentMethod
- PaymentStatus
- SystemLogAction
- ReturnType
- ReturnRequestStatus
- ItemReturnStatus

---

## Query Examples

### Get all attributes for a category

```sql
SELECT * FROM "ProductAttribute"
WHERE "categoryIds" @> '["c1"]'::jsonb;
```

### Get product with all relations

```sql
SELECT p.*,
       json_agg(DISTINCT pv.*) as variants,
       json_agg(DISTINCT r.*) as reviews
FROM "Product" p
LEFT JOIN "ProductVariant" pv ON pv."productId" = p.id
LEFT JOIN "Review" r ON r."productId" = p.id
WHERE p.id = 'product-id'
GROUP BY p.id;
```

### Get order with items and return requests

```sql
SELECT o.*,
       json_agg(DISTINCT oi.*) as items,
       json_agg(DISTINCT rr.*) as return_requests
FROM "Order" o
LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
LEFT JOIN "ReturnRequest" rr ON rr."orderId" = o.id
WHERE o.id = 'order-id'
GROUP BY o.id;
```

---

## Migration History

1. **20251229110635_initial_schema**: Initial database schema creation
2. **20251230_add_return_request_table**: Added ReturnRequest table (duplicate, rolled back)
3. **20251230124330_add_return_request_table**: Added ReturnRequest table with proper fields
4. **20250107_add_categoryids_to_productattribute**: Added `categoryIds` JSONB column to ProductAttribute for Supabase compatibility

---

## Maintenance Checklist

- [ ] When updating ProductAttribute categories via admin panel, ensure both `categoryIds` field AND `_CategoryToProductAttribute` join table are updated
- [ ] Always include `updatedAt` when performing UPDATE operations via Supabase client
- [ ] Before deleting categories, check for associated products
- [ ] Regularly backup the database before schema migrations
- [ ] Keep `ProductAttribute.categoryIds` in sync with join table data

---

**End of Database Schema Documentation**
