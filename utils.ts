export const removeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

// ✅ Add missing helper functions
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Mapping trạng thái đơn hàng từ mã sang tiếng Việt
export const ORDER_STATUS_LABELS: Record<string, string> = {
  // Trạng thái chính
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING_CONFIRMATION: "Chờ xác nhận",
  PACKING: "Đang đóng gói",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  DELIVERY_FAILED: "Giao hàng thất bại",
  // Trạng thái đổi/trả
  RETURN_REQUESTED: "Yêu cầu đổi/trả",
  RETURN_PROCESSING: "Đang xử lý đổi/trả",
  RETURN_COMPLETED: "Đã hoàn tất đổi/trả",
  // Legacy status (for old data)
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  DELIVERED: "Đã giao",
  RETURNED: "Đã trả hàng",
};

export const getOrderStatusLabel = (status: string): string => {
  return ORDER_STATUS_LABELS[status] || status;
};

// Mapping trạng thái thanh toán
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: "Đã thanh toán",
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang xử lý",
  PENDING_REFUND: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  PARTIAL_REFUNDED: "Hoàn tiền một phần",
};

export const getPaymentStatusLabel = (status: string): string => {
  return PAYMENT_STATUS_LABELS[status] || status;
};

// Mapping trạng thái yêu cầu đổi/trả
export const RETURN_REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  SHIPPING_BACK: "Đang gửi trả",
  RECEIVED: "Đã nhận hàng",
  COMPLETED: "Hoàn tất",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

export const getReturnRequestStatusLabel = (status: string): string => {
  return RETURN_REQUEST_STATUS_LABELS[status] || status;
};

// ✅ Add formatCurrency helper
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
