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

// Danh sách tỉnh thành với phí ship
export const PROVINCES_WITH_SHIPPING: { name: string; shippingFee: number }[] =
  [
    { name: "Hồ Chí Minh", shippingFee: 20000 },
    { name: "Hà Nội", shippingFee: 30000 },
    { name: "Đà Nẵng", shippingFee: 25000 },
    { name: "Bình Dương", shippingFee: 20000 },
    { name: "Đồng Nai", shippingFee: 22000 },
    { name: "Cần Thơ", shippingFee: 28000 },
    { name: "Hải Phòng", shippingFee: 32000 },
    { name: "An Giang", shippingFee: 35000 },
    { name: "Bà Rịa - Vũng Tàu", shippingFee: 25000 },
    { name: "Bắc Giang", shippingFee: 35000 },
    { name: "Bắc Kạn", shippingFee: 40000 },
    { name: "Bạc Liêu", shippingFee: 38000 },
    { name: "Bắc Ninh", shippingFee: 32000 },
    { name: "Bến Tre", shippingFee: 30000 },
    { name: "Bình Định", shippingFee: 30000 },
    { name: "Bình Phước", shippingFee: 28000 },
    { name: "Bình Thuận", shippingFee: 28000 },
    { name: "Cà Mau", shippingFee: 40000 },
    { name: "Cao Bằng", shippingFee: 45000 },
    { name: "Đắk Lắk", shippingFee: 35000 },
    { name: "Đắk Nông", shippingFee: 38000 },
    { name: "Điện Biên", shippingFee: 45000 },
    { name: "Đồng Tháp", shippingFee: 32000 },
    { name: "Gia Lai", shippingFee: 38000 },
    { name: "Hà Giang", shippingFee: 45000 },
    { name: "Hà Nam", shippingFee: 32000 },
    { name: "Hà Tĩnh", shippingFee: 35000 },
    { name: "Hải Dương", shippingFee: 32000 },
    { name: "Hậu Giang", shippingFee: 35000 },
    { name: "Hòa Bình", shippingFee: 35000 },
    { name: "Hưng Yên", shippingFee: 32000 },
    { name: "Khánh Hòa", shippingFee: 30000 },
    { name: "Kiên Giang", shippingFee: 38000 },
    { name: "Kon Tum", shippingFee: 40000 },
    { name: "Lai Châu", shippingFee: 48000 },
    { name: "Lâm Đồng", shippingFee: 32000 },
    { name: "Lạng Sơn", shippingFee: 40000 },
    { name: "Lào Cai", shippingFee: 42000 },
    { name: "Long An", shippingFee: 25000 },
    { name: "Nam Định", shippingFee: 32000 },
    { name: "Nghệ An", shippingFee: 35000 },
    { name: "Ninh Bình", shippingFee: 32000 },
    { name: "Ninh Thuận", shippingFee: 32000 },
    { name: "Phú Thọ", shippingFee: 35000 },
    { name: "Phú Yên", shippingFee: 32000 },
    { name: "Quảng Bình", shippingFee: 35000 },
    { name: "Quảng Nam", shippingFee: 28000 },
    { name: "Quảng Ngãi", shippingFee: 30000 },
    { name: "Quảng Ninh", shippingFee: 35000 },
    { name: "Quảng Trị", shippingFee: 35000 },
    { name: "Sóc Trăng", shippingFee: 35000 },
    { name: "Sơn La", shippingFee: 42000 },
    { name: "Tây Ninh", shippingFee: 25000 },
    { name: "Thái Bình", shippingFee: 32000 },
    { name: "Thái Nguyên", shippingFee: 35000 },
    { name: "Thanh Hóa", shippingFee: 35000 },
    { name: "Thừa Thiên Huế", shippingFee: 30000 },
    { name: "Tiền Giang", shippingFee: 28000 },
    { name: "Trà Vinh", shippingFee: 32000 },
    { name: "Tuyên Quang", shippingFee: 38000 },
    { name: "Vĩnh Long", shippingFee: 30000 },
    { name: "Vĩnh Phúc", shippingFee: 32000 },
    { name: "Yên Bái", shippingFee: 40000 },
  ];

export const getShippingFeeByProvince = (province: string): number => {
  const found = PROVINCES_WITH_SHIPPING.find((p) => p.name === province);
  return found ? found.shippingFee : 35000; // Default 35k
};

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
  baseShippingFee: number; // Phí ship cơ bản
  sameProvinceDiscount: number; // Giảm giá nếu cùng tỉnh (%)
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
