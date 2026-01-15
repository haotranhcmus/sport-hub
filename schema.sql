-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Brand (
  id text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  logoUrl text,
  country text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Brand_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Category (
  id text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  imageUrl text,
  description text,
  parentId text,
  sizeGuideId text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Category_pkey PRIMARY KEY (id),
  CONSTRAINT Category_parentId_fkey FOREIGN KEY (parentId) REFERENCES public.Category(id),
  CONSTRAINT Category_sizeGuideId_fkey FOREIGN KEY (sizeGuideId) REFERENCES public.SizeGuide(id)
);
CREATE TABLE public.Order (
  id text NOT NULL,
  orderCode text NOT NULL,
  userId text,
  customerName text NOT NULL,
  customerPhone text NOT NULL,
  customerAddress text NOT NULL,
  customerNotes text,
  customerType text NOT NULL DEFAULT 'guest'::text,
  totalAmount double precision NOT NULL,
  shippingFee double precision NOT NULL DEFAULT 0,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING_PAYMENT'::"OrderStatus",
  paymentMethod USER-DEFINED NOT NULL DEFAULT 'COD'::"PaymentMethod",
  paymentStatus USER-DEFINED NOT NULL DEFAULT 'PENDING'::"PaymentStatus",
  deliveryDate timestamp without time zone,
  courierName text,
  trackingNumber text,
  deliveryPerson text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Order_pkey PRIMARY KEY (id),
  CONSTRAINT Order_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.OrderItem (
  id text NOT NULL,
  orderId text NOT NULL,
  productId text NOT NULL,
  variantId text,
  productName text NOT NULL,
  quantity integer NOT NULL,
  unitPrice double precision NOT NULL,
  shippingFee double precision NOT NULL DEFAULT 0,
  color text,
  size text,
  thumbnailUrl text,
  isReviewed boolean NOT NULL DEFAULT false,
  reviewInfo jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  returnStatus USER-DEFINED NOT NULL DEFAULT 'NONE'::"ItemReturnStatus",
  CONSTRAINT OrderItem_pkey PRIMARY KEY (id),
  CONSTRAINT OrderItem_orderId_fkey FOREIGN KEY (orderId) REFERENCES public.Order(id),
  CONSTRAINT OrderItem_productId_fkey FOREIGN KEY (productId) REFERENCES public.Product(id)
);
CREATE TABLE public.Product (
  id text NOT NULL,
  productCode text NOT NULL,
  modelCode text,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  costPrice double precision,
  basePrice double precision NOT NULL,
  promotionalPrice double precision,
  thumbnailUrl text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'ACTIVE'::"ProductStatus",
  categoryId text NOT NULL,
  brandId text NOT NULL,
  totalSold integer NOT NULL DEFAULT 0,
  reviewCount integer NOT NULL DEFAULT 0,
  averageRating double precision NOT NULL DEFAULT 0,
  allowReturn boolean NOT NULL DEFAULT true,
  returnPeriod integer NOT NULL DEFAULT 7,
  freeShipping boolean NOT NULL DEFAULT false,
  attributes jsonb,
  sizeGuideId text,
  condition text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  imageUrls ARRAY DEFAULT ARRAY[]::text[],
  CONSTRAINT Product_pkey PRIMARY KEY (id),
  CONSTRAINT Product_brandId_fkey FOREIGN KEY (brandId) REFERENCES public.Brand(id),
  CONSTRAINT Product_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES public.Category(id),
  CONSTRAINT Product_sizeGuideId_fkey FOREIGN KEY (sizeGuideId) REFERENCES public.SizeGuide(id)
);
CREATE TABLE public.ProductAttribute (
  id text NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  type text NOT NULL,
  values jsonb NOT NULL,
  categoryIds ARRAY DEFAULT ARRAY[]::text[],
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT ProductAttribute_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ProductVariant (
  id text NOT NULL,
  productId text NOT NULL,
  sku text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  stockQuantity integer NOT NULL DEFAULT 0,
  priceAdjustment double precision NOT NULL DEFAULT 0,
  imageUrl text,
  status text NOT NULL DEFAULT 'active'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT ProductVariant_pkey PRIMARY KEY (id),
  CONSTRAINT ProductVariant_productId_fkey FOREIGN KEY (productId) REFERENCES public.Product(id)
);
CREATE TABLE public.ReturnRequest (
  id text NOT NULL,
  requestCode text NOT NULL,
  orderId text NOT NULL,
  orderItemId text NOT NULL,
  type USER-DEFINED NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::"ReturnRequestStatus",
  reason text NOT NULL,
  evidenceImages ARRAY,
  refundAmount double precision,
  bankInfo jsonb,
  exchangeToSize text,
  exchangeToColor text,
  newOrderId text,
  adminNotes text,
  processedBy text,
  processedAt timestamp without time zone,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT ReturnRequest_pkey PRIMARY KEY (id),
  CONSTRAINT ReturnRequest_orderId_fkey FOREIGN KEY (orderId) REFERENCES public.Order(id),
  CONSTRAINT ReturnRequest_orderItemId_fkey FOREIGN KEY (orderItemId) REFERENCES public.OrderItem(id)
);
CREATE TABLE public.Review (
  id text NOT NULL,
  productId text NOT NULL,
  userName text NOT NULL,
  rating integer NOT NULL,
  comment text NOT NULL,
  avatarUrl text,
  images jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Review_pkey PRIMARY KEY (id),
  CONSTRAINT Review_productId_fkey FOREIGN KEY (productId) REFERENCES public.Product(id)
);
CREATE TABLE public.SizeGuide (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  columns jsonb NOT NULL,
  rows jsonb NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT SizeGuide_pkey PRIMARY KEY (id)
);
CREATE TABLE public.StockEntry (
  id text NOT NULL,
  code text NOT NULL,
  supplierId text NOT NULL,
  supplierName text NOT NULL,
  date timestamp without time zone NOT NULL,
  totalAmount double precision NOT NULL,
  status text NOT NULL DEFAULT 'completed'::text,
  items jsonb NOT NULL,
  actorName text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT StockEntry_pkey PRIMARY KEY (id),
  CONSTRAINT StockEntry_supplierId_fkey FOREIGN KEY (supplierId) REFERENCES public.Supplier(id)
);
CREATE TABLE public.StockIssue (
  id text NOT NULL,
  code text NOT NULL,
  date timestamp without time zone NOT NULL,
  status text NOT NULL DEFAULT 'completed'::text,
  items jsonb NOT NULL,
  actorName text NOT NULL,
  type text NOT NULL DEFAULT 'sales'::text,
  totalAmount double precision NOT NULL,
  orderCodes jsonb,
  warehouseName text,
  customerName text,
  courierName text,
  trackingNumber text,
  deliveryPerson text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT StockIssue_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Stocktake (
  id text NOT NULL,
  code text NOT NULL,
  date timestamp without time zone NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text,
  items jsonb NOT NULL,
  totalDiscrepancy integer NOT NULL DEFAULT 0,
  auditorName text NOT NULL,
  scope text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Stocktake_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Supplier (
  id text NOT NULL,
  name text NOT NULL,
  taxCode text,
  contactPerson text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  status text NOT NULL DEFAULT 'active'::text,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Supplier_pkey PRIMARY KEY (id)
);
CREATE TABLE public.SystemConfig (
  id text NOT NULL,
  websiteTitle text NOT NULL,
  logoUrl text NOT NULL,
  hotline text NOT NULL,
  contactEmail text NOT NULL,
  address text NOT NULL,
  vatRate double precision NOT NULL DEFAULT 8,
  lowStockThreshold integer NOT NULL DEFAULT 5,
  returnPeriodDays integer NOT NULL DEFAULT 7,
  banners jsonb NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT SystemConfig_pkey PRIMARY KEY (id)
);
CREATE TABLE public.SystemLog (
  id text NOT NULL,
  actorId text NOT NULL,
  actorName text NOT NULL,
  actionType USER-DEFINED NOT NULL,
  targetId text NOT NULL,
  oldValue jsonb,
  newValue jsonb,
  ipAddress text NOT NULL,
  description text NOT NULL,
  timestamp timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT SystemLog_pkey PRIMARY KEY (id),
  CONSTRAINT SystemLog_actorId_fkey FOREIGN KEY (actorId) REFERENCES public.User(id)
);
CREATE TABLE public.User (
  id text NOT NULL,
  email text NOT NULL,
  fullName text NOT NULL,
  phone text,
  role USER-DEFINED NOT NULL DEFAULT 'CUSTOMER'::"UserRole",
  status text NOT NULL DEFAULT 'active'::text,
  staffId text,
  idCard text,
  position text,
  department text,
  avatarUrl text,
  joinDate timestamp without time zone,
  addresses jsonb,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT User_pkey PRIMARY KEY (id)
);
CREATE TABLE public._CategoryToProductAttribute (
  A text NOT NULL,
  B text NOT NULL,
  CONSTRAINT _CategoryToProductAttribute_pkey PRIMARY KEY (A, B),
  CONSTRAINT _CategoryToProductAttribute_A_fkey FOREIGN KEY (A) REFERENCES public.Category(id),
  CONSTRAINT _CategoryToProductAttribute_B_fkey FOREIGN KEY (B) REFERENCES public.ProductAttribute(id)
);