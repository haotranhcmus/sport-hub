import {
  ProductStatus,
  OrderStatus,
  SystemLogAction,
  PaymentStatus,
} from "./constants/enums";

export { ProductStatus, OrderStatus };
export type { SystemLogAction, PaymentStatus };

export interface SizeGuideColumn {
  key: string;
  label: string;
}

export interface SizeGuide {
  id: string;
  name: string;
  description?: string;
  columns: SizeGuideColumn[];
  rows: Record<string, string>[];
  createdAt: string;
}

export interface SystemLog {
  id: string;
  actorId: string;
  actorName: string;
  actionType: SystemLogAction;
  targetId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  timestamp: string;
  description: string;
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  parentId?: string;
  sizeGuideId?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  country?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  code: string;
  categoryIds: string[];
  values: string[];
  type: "variant" | "info";
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  priceAdjustment: number;
  imageUrl?: string;
  status: "active" | "archived";
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  avatarUrl?: string;
  images?: string[];
  productName?: string;
}

export interface Product {
  id: string;
  productCode: string;
  modelCode?: string;
  name: string;
  slug: string;
  description: string;
  costPrice?: number;
  basePrice: number;
  promotionalPrice?: number;
  thumbnailUrl: string;
  status: ProductStatus;
  categoryId: string;
  brandId: string;
  category?: Category;
  brand?: Brand;
  variants: ProductVariant[];
  totalSold: number;
  allowReturn?: boolean;
  returnPeriod?: number;
  freeShipping?: boolean;
  attributes?: Record<string, string | boolean>;
  reviews?: Review[];
  createdAt?: string;
  sizeGuideId?: string;
  condition?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "CUSTOMER" | "SALES" | "WAREHOUSE";
  phone?: string;
  avatarUrl?: string;
  addresses: UserAddress[];
  status?: "active" | "locked";
  staffId?: string;
  idCard?: string;
  department?: string;
  position?: string;
  joinDate?: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  thumbnailUrl?: string;
  color?: string;
  size?: string;
  isReviewed?: boolean;
  reviewInfo?: {
    rating: number;
    comment: string;
    createdAt: string;
    images?: string[];
  };
}

export interface ReturnRequestData {
  orderId: string;
  orderItemId: string;
  type: "exchange" | "refund";
  reason: string;
  evidenceImages: string[];
  exchangeToSize?: string;
  exchangeToColor?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerType: "member" | "guest";
  customerNotes?: string;
  totalAmount: number;
  shippingFee: number;
  status: OrderStatus;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: PaymentStatus;
  createdAt: string;
  deliveryDate?: string;
  courierName?: string;
  trackingNumber?: string;
  deliveryPerson?: string;
  returnInfo?: {
    requestId: string;
    reason: string;
    evidenceImages: string[];
    status: "pending" | "approved" | "rejected";
    type?: "exchange" | "refund";
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
    /* Added items property to track products involved in a return or exchange request */
    items?: Array<{
      productId: string;
      productName: string;
      quantity: number;
    }>;
  };
  items: OrderItem[];
}

export interface Supplier {
  id: string;
  name: string;
  taxCode?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  status: "active" | "inactive";
}

export interface StockEntryItem {
  id: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export interface StockEntry {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  date: string;
  totalAmount: number;
  status: "completed" | "cancelled" | "draft";
  items: StockEntryItem[];
  actorName: string;
}

export interface StockIssueItem {
  id: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  orderCode?: string;
  size?: string;
  color?: string;
}

export interface StockIssue {
  id: string;
  code: string;
  date: string;
  status: "completed" | "cancelled";
  items: StockIssueItem[];
  actorName: string;
  type: "sales" | "other";
  totalAmount: number;
  orderCodes?: string[];
  // Bổ sung thông tin chi tiết cho phiếu xuất bán hàng
  warehouseName?: string;
  customerName?: string;
  courierName?: string;
  trackingNumber?: string;
  deliveryPerson?: string;
}

export interface StocktakeItem {
  id: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  systemStock: number;
  actualStock: number;
  discrepancy: number;
}

export interface Stocktake {
  id: string;
  code: string;
  date: string;
  status: "draft" | "completed";
  items: StocktakeItem[];
  totalDiscrepancy: number;
  auditorName: string;
  scope: string;
}

export interface ReturnRequest {
  id: string;
  orderCode: string;
  customerName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AppBanner {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
  order: number;
}

export interface SystemConfig {
  websiteTitle: string;
  logoUrl: string;
  hotline: string;
  contactEmail: string;
  address: string;
  vatRate: number;
  lowStockThreshold: number;
  returnPeriodDays: number;
  banners: AppBanner[];
}
