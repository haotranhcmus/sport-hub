import {
  ProductStatus,
  OrderStatus,
  SystemLogAction,
  PaymentStatus,
  ReturnType,
  ReturnRequestStatus,
  ItemReturnStatus,
} from "../constants/enums";

export interface SizeGuideColumn {
  key: string;
  label: string;
}

export interface SizeGuide {
  id: string;
  name: string;
  description?: string;
  columns: SizeGuideColumn[]; // Các cột động: EU, CM, US...
  rows: Record<string, string>[]; // Dữ liệu từng dòng
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
  name: string; // Tên người nhận
  phone: string; // Số điện thoại
  address: string; // Địa chỉ chi tiết
  city?: string; // Tỉnh/Thành phố
  district?: string; // Quận/Huyện
  ward?: string; // Phường/Xã
  provinceCode?: string; // Mã tỉnh (for API)
  districtCode?: string; // Mã quận
  wardCode?: string; // Mã phường
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  parentId?: string;
  sizeGuideId?: string; // ID bảng size mặc định cho danh mục
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
  type: "variant" | "specification" | "info";
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
  imageUrls?: string[]; // ✅ NEW: Gallery images for product detail page
  status: ProductStatus;
  categoryId: string;
  brandId: string;
  category?: Category;
  brand?: Brand;
  variants: ProductVariant[];
  totalSold: number;
  reviewCount: number; // ✅ NEW: Cached review count
  averageRating: number; // ✅ NEW: Cached average rating
  allowReturn?: boolean;
  returnPeriod?: number;
  freeShipping?: boolean;
  attributes?: Record<string, string | boolean>;
  reviews?: Review[];
  createdAt?: string;
  sizeGuideId?: string; // Bảng size riêng cho sản phẩm (ghi đè danh mục)
  condition?: string; // Tình trạng sản phẩm (VD: Mới 100% full box)
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
  password?: string;
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
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingFee?: number; // Phí ship cho item này
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
  returnStatus?: ItemReturnStatus;
  returnRequests?: ReturnRequest[];
}

export interface ReturnRequest {
  id: string;
  requestCode: string;
  orderId: string;
  orderItemId: string;
  type: ReturnType;
  status: ReturnRequestStatus;
  reason: string;
  evidenceImages: string[];

  // Refund info
  refundAmount?: number;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };

  // Exchange info
  exchangeToSize?: string;
  exchangeToColor?: string;
  newOrderId?: string;

  // Admin processing
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;

  createdAt: string;
  updatedAt: string;
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
  isReadyToShip?: boolean;
  courierName?: string;
  trackingNumber?: string;
  memberStats?: {
    successfulOrders: number;
  };
  returnRequests?: ReturnRequest[];

  // DEPRECATED - Keep for backward compatibility
  returnInfo?: {
    requestId: string;
    reason: string;
    evidenceImages: string[];
    status: "pending" | "approved" | "rejected";
    shopFeedback?: string;
    refundAmount?: number;
    type?: "exchange" | "refund";
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
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
  note: string;
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
}

export interface StockIssue {
  id: string;
  code: string;
  date: string;
  status: "completed" | "cancelled";
  items: StockIssueItem[];
  actorName: string;
  type: "sales" | "other";
  reason?: string;
  totalAmount: number;
  orderCodes?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  reason?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface AppBanner {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
  order: number;
}

export interface ShippingZone {
  provinceCode: string;
  provinceName: string;
  fee: number;
}

export interface SystemConfig {
  id?: number;
  websiteTitle: string;
  logoUrl: string;
  hotline: string;
  contactEmail: string;
  // Store Address - for shipping calculation
  storeAddress: string;
  storeProvinceCode: string;
  storeProvinceName: string;
  storeDistrictCode?: string;
  storeDistrictName?: string;
  // Shipping Configuration
  baseShippingFee: number; // Phí ship khác tỉnh
  sameProvinceFee: number; // Phí ship cùng tỉnh (giá trực tiếp)
  sameProvinceDiscount: number; // Legacy: Giảm giá nếu cùng tỉnh (%)
  freeShippingThreshold: number; // Miễn phí ship nếu đơn > X VNĐ
  // Tax & Policies
  vatRate: number;
  lowStockThreshold: number;
  returnPeriodDays: number;
  // Banners
  banners: AppBanner[];
  // Social Links
  facebookUrl?: string;
  zaloUrl?: string;
  instagramUrl?: string;
}
