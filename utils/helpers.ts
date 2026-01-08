import { OrderStatus } from "../constants/enums";

export const removeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

export const slugify = (str: string): string => {
  return removeAccents(str)
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + "đ";
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

export const getOrderStatusLabel = (status: OrderStatus | string): string => {
  const statusMap: Record<string, string> = {
    [OrderStatus.PENDING_PAYMENT]: "Chờ thanh toán",
    [OrderStatus.PENDING_CONFIRMATION]: "Chờ xác nhận",
    [OrderStatus.PACKING]: "Đang đóng gói",
    [OrderStatus.SHIPPING]: "Đang giao hàng",
    [OrderStatus.COMPLETED]: "Hoàn tất",
    [OrderStatus.CANCELLED]: "Đã hủy",
    [OrderStatus.DELIVERY_FAILED]: "Giao thất bại",
    [OrderStatus.RETURN_REQUESTED]: "Yêu cầu đổi/trả",
    [OrderStatus.RETURN_PROCESSING]: "Đang đổi/trả",
    [OrderStatus.RETURN_COMPLETED]: "Đã trả hàng",
  };
  return statusMap[status] || status;
};
