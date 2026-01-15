// Notification Service
import { supabase } from "../lib/supabase";

export type NotificationType =
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPING"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "RETURN_APPROVED"
  | "RETURN_REJECTED"
  | "PAYMENT_RECEIVED"
  | "PROMOTION"
  | "SYSTEM"
  | "CHAT_MESSAGE"
  | "LOW_STOCK"
  | "NEW_ORDER"
  | "NEW_RETURN";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const notificationService = {
  // Create a single notification
  create: async (notification: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    actionUrl?: string;
  }): Promise<Notification> => {
    const { data, error } = await supabase
      .from("Notification")
      .insert({
        id: crypto.randomUUID(),
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || null,
        actionUrl: notification.actionUrl || null,
        isRead: false,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [NOTIFICATION] Create error:", error);
      throw new Error(error.message);
    }

    console.log("✅ [NOTIFICATION] Created:", data.id);
    return data;
  },

  // Notify all admins
  notifyAllAdmins: async (notification: {
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    actionUrl?: string;
  }): Promise<void> => {
    // Get all admin users
    const { data: admins, error: adminError } = await supabase
      .from("User")
      .select("id")
      .in("role", ["ADMIN", "SALES"]);

    if (adminError) {
      console.error("❌ [NOTIFICATION] Get admins error:", adminError);
      return;
    }

    if (!admins || admins.length === 0) return;

    // Create notifications for all admins
    const now = new Date().toISOString();
    const notifications = admins.map((admin) => ({
      id: crypto.randomUUID(),
      userId: admin.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || null,
      actionUrl: notification.actionUrl || null,
      isRead: false,
      createdAt: now,
    }));

    const { error } = await supabase.from("Notification").insert(notifications);
    if (error) {
      console.error("❌ [NOTIFICATION] Bulk create error:", error);
    } else {
      console.log(`✅ [NOTIFICATION] Notified ${admins.length} admins`);
    }
  },

  // Get user's notifications
  getUserNotifications: async (
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number }
  ): Promise<Notification[]> => {
    let query = supabase
      .from("Notification")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq("isRead", false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ [NOTIFICATION] Get error:", error);
      return [];
    }

    return data || [];
  },

  // Get unread count
  getUnreadCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from("Notification")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
      .eq("isRead", false);

    if (error) {
      console.error("❌ [NOTIFICATION] Count error:", error);
      return 0;
    }

    return count || 0;
  },

  // Mark as read
  markAsRead: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from("Notification")
      .update({ isRead: true })
      .eq("id", notificationId);

    if (error) {
      console.error("❌ [NOTIFICATION] Mark read error:", error);
    }
  },

  // Mark all as read
  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from("Notification")
      .update({ isRead: true })
      .eq("userId", userId)
      .eq("isRead", false);

    if (error) {
      console.error("❌ [NOTIFICATION] Mark all read error:", error);
    }
  },

  // Delete a notification
  delete: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from("Notification")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("❌ [NOTIFICATION] Delete error:", error);
    }
  },

  // Delete old notifications (cleanup)
  deleteOldNotifications: async (daysOld: number = 30): Promise<void> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from("Notification")
      .delete()
      .lt("createdAt", cutoffDate.toISOString());

    if (error) {
      console.error("❌ [NOTIFICATION] Cleanup error:", error);
    }
  },
};

// Helper functions to create common notifications
export const NotificationHelpers = {
  // New order notification for admins
  newOrder: (orderCode: string, customerName: string, amount: number) =>
    notificationService.notifyAllAdmins({
      type: "NEW_ORDER",
      title: "Đơn hàng mới",
      message: `Đơn ${orderCode} từ ${customerName} - ${amount.toLocaleString()}đ`,
      actionUrl: `/admin/orders?code=${orderCode}`,
      data: { orderCode },
    }),

  // Order status update for customer
  orderStatusUpdate: (
    userId: string,
    orderCode: string,
    status: "confirmed" | "shipping" | "delivered" | "cancelled"
  ) => {
    const statusMessages = {
      confirmed: {
        type: "ORDER_CONFIRMED" as NotificationType,
        title: "Đơn hàng đã xác nhận",
        message: `Đơn hàng ${orderCode} đang được xử lý`,
      },
      shipping: {
        type: "ORDER_SHIPPING" as NotificationType,
        title: "Đang giao hàng",
        message: `Đơn hàng ${orderCode} đang trên đường đến bạn`,
      },
      delivered: {
        type: "ORDER_DELIVERED" as NotificationType,
        title: "Giao hàng thành công",
        message: `Đơn hàng ${orderCode} đã được giao`,
      },
      cancelled: {
        type: "ORDER_CANCELLED" as NotificationType,
        title: "Đơn hàng đã hủy",
        message: `Đơn hàng ${orderCode} đã bị hủy`,
      },
    };

    const config = statusMessages[status];
    return notificationService.create({
      userId,
      type: config.type,
      title: config.title,
      message: config.message,
      actionUrl: `/orders/${orderCode}`,
      data: { orderCode },
    });
  },

  // Return request status for customer
  returnRequestStatus: (
    userId: string,
    requestCode: string,
    approved: boolean
  ) =>
    notificationService.create({
      userId,
      type: approved ? "RETURN_APPROVED" : "RETURN_REJECTED",
      title: approved
        ? "Yêu cầu đổi/trả được duyệt"
        : "Yêu cầu đổi/trả bị từ chối",
      message: approved
        ? `Yêu cầu ${requestCode} đã được duyệt`
        : `Yêu cầu ${requestCode} không được chấp nhận`,
      actionUrl: `/profile?tab=returns`,
      data: { requestCode },
    }),

  // Low stock alert for admins
  lowStock: (productName: string, sku: string, quantity: number) =>
    notificationService.notifyAllAdmins({
      type: "LOW_STOCK",
      title: "Cảnh báo tồn kho thấp",
      message: `${productName} (${sku}) chỉ còn ${quantity} sản phẩm`,
      actionUrl: `/admin/inventory?sku=${sku}`,
      data: { sku, quantity },
    }),

  // Chat message notification
  chatMessage: (
    userId: string,
    senderName: string,
    roomId: string,
    preview: string
  ) =>
    notificationService.create({
      userId,
      type: "CHAT_MESSAGE",
      title: "Tin nhắn mới",
      message: `${senderName}: ${preview.substring(0, 50)}${
        preview.length > 50 ? "..." : ""
      }`,
      actionUrl: `/chat/${roomId}`,
      data: { roomId },
    }),

  // New chat request for admins
  newChatRequest: (customerName: string, roomId: string) =>
    notificationService.notifyAllAdmins({
      type: "CHAT_MESSAGE",
      title: "Yêu cầu hỗ trợ mới",
      message: `${customerName} đang chờ hỗ trợ`,
      actionUrl: `/admin?tab=chat`,
      data: { roomId },
    }),

  // New return request for admins
  newReturnRequest: (
    orderCode: string,
    customerName: string,
    requestId: string
  ) =>
    notificationService.notifyAllAdmins({
      type: "NEW_RETURN",
      title: "Yêu cầu đổi/trả mới",
      message: `${customerName} yêu cầu đổi/trả đơn ${orderCode}`,
      actionUrl: `/admin?tab=returns`,
      data: { requestId, orderCode },
    }),
};
