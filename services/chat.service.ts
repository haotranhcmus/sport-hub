// Chat Service
import { supabase } from "../lib/supabase";
import { NotificationHelpers } from "./notification.service";

export type ChatStatus = "WAITING" | "ACTIVE" | "RESOLVED" | "CLOSED";
export type MessageType = "TEXT" | "IMAGE" | "SYSTEM" | "ORDER_INFO";

export interface ChatRoom {
  id: string;
  customerId: string;
  staffId?: string;
  orderCode?: string;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  // Joined data
  customer?: { id: string; fullName: string; avatarUrl?: string };
  staff?: { id: string; fullName: string; avatarUrl?: string };
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: MessageType;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  // Joined
  sender?: { id: string; fullName: string; avatarUrl?: string };
}

export const chatService = {
  // ========================================
  // ROOM MANAGEMENT
  // ========================================

  // Create a new chat room (customer initiates)
  createRoom: async (
    customerId: string,
    orderCode?: string
  ): Promise<ChatRoom> => {
    // Check if there's an existing open room for this customer
    const { data: existingRoom } = await supabase
      .from("ChatRoom")
      .select("*")
      .eq("customerId", customerId)
      .in("status", ["WAITING", "ACTIVE"])
      .single();

    if (existingRoom) {
      console.log("📢 [CHAT] Returning existing room:", existingRoom.id);
      return existingRoom;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("ChatRoom")
      .insert({
        id: crypto.randomUUID(),
        customerId,
        orderCode: orderCode || null,
        status: "WAITING",
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [CHAT] Create room error:", error);
      throw new Error(error.message);
    }

    console.log("✅ [CHAT] Room created:", data.id);

    // 🔔 Notify admins about new chat request
    try {
      // Fetch customer name
      const { data: customer } = await supabase
        .from("User")
        .select("fullName")
        .eq("id", customerId)
        .single();

      await NotificationHelpers.newChatRequest(
        customer?.fullName || "Khách hàng",
        data.id
      );
      console.log("🔔 [CHAT] Đã gửi thông báo cho admin");
    } catch (notifyError) {
      console.error("⚠️ [CHAT] Lỗi gửi thông báo:", notifyError);
    }

    return data;
  },

  // Staff accepts a waiting room
  acceptRoom: async (roomId: string, staffId: string): Promise<ChatRoom> => {
    const { data, error } = await supabase
      .from("ChatRoom")
      .update({
        staffId,
        status: "ACTIVE",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", roomId)
      .eq("status", "WAITING") // Only accept if still waiting
      .select(
        `
        *,
        customer:User!ChatRoom_customerId_fkey(id, fullName, avatarUrl)
      `
      )
      .single();

    if (error) {
      console.error("❌ [CHAT] Accept room error:", error);
      throw new Error(error.message);
    }

    // Send system message
    await chatService.sendMessage({
      roomId,
      senderId: staffId,
      content: "Nhân viên hỗ trợ đã tham gia cuộc trò chuyện",
      type: "SYSTEM",
    });

    console.log("✅ [CHAT] Room accepted:", data.id);
    return data;
  },

  // Close/Resolve a room
  closeRoom: async (
    roomId: string,
    status: "RESOLVED" | "CLOSED" = "CLOSED"
  ): Promise<void> => {
    const { error } = await supabase
      .from("ChatRoom")
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", roomId);

    if (error) {
      console.error("❌ [CHAT] Close room error:", error);
      throw new Error(error.message);
    }

    console.log("✅ [CHAT] Room closed:", roomId);
  },

  // Get waiting rooms (for staff dashboard)
  getWaitingRooms: async (): Promise<ChatRoom[]> => {
    const { data, error } = await supabase
      .from("ChatRoom")
      .select(
        `
        *,
        customer:User!ChatRoom_customerId_fkey(id, fullName, avatarUrl)
      `
      )
      .eq("status", "WAITING")
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("❌ [CHAT] Get waiting rooms error:", error);
      return [];
    }

    return data || [];
  },

  // Get active rooms for a staff member
  getStaffRooms: async (staffId: string): Promise<ChatRoom[]> => {
    const { data, error } = await supabase
      .from("ChatRoom")
      .select(
        `
        *,
        customer:User!ChatRoom_customerId_fkey(id, fullName, avatarUrl)
      `
      )
      .eq("staffId", staffId)
      .in("status", ["ACTIVE", "RESOLVED"])
      .order("updatedAt", { ascending: false });

    if (error) {
      console.error("❌ [CHAT] Get staff rooms error:", error);
      return [];
    }

    return data || [];
  },

  // Get customer's chat rooms
  getCustomerRooms: async (customerId: string): Promise<ChatRoom[]> => {
    const { data, error } = await supabase
      .from("ChatRoom")
      .select(
        `
        *,
        staff:User!ChatRoom_staffId_fkey(id, fullName, avatarUrl)
      `
      )
      .eq("customerId", customerId)
      .order("updatedAt", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ [CHAT] Get customer rooms error:", error);
      return [];
    }

    return data || [];
  },

  // Get room by ID
  getRoom: async (roomId: string): Promise<ChatRoom | null> => {
    const { data, error } = await supabase
      .from("ChatRoom")
      .select(
        `
        *,
        customer:User!ChatRoom_customerId_fkey(id, fullName, avatarUrl, email, phone),
        staff:User!ChatRoom_staffId_fkey(id, fullName, avatarUrl)
      `
      )
      .eq("id", roomId)
      .single();

    if (error) {
      console.error("❌ [CHAT] Get room error:", error);
      return null;
    }

    return data;
  },

  // ========================================
  // MESSAGE MANAGEMENT
  // ========================================

  // Send a message
  sendMessage: async (message: {
    roomId: string;
    senderId: string;
    content: string;
    type?: MessageType;
    imageUrl?: string;
  }): Promise<ChatMessage> => {
    const { data, error } = await supabase
      .from("ChatMessage")
      .insert({
        id: crypto.randomUUID(),
        roomId: message.roomId,
        senderId: message.senderId,
        content: message.content,
        type: message.type || "TEXT",
        imageUrl: message.imageUrl || null,
        isRead: false,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [CHAT] Send message error:", error);
      throw new Error(error.message);
    }

    // Update room's updatedAt
    await supabase
      .from("ChatRoom")
      .update({ updatedAt: new Date().toISOString() })
      .eq("id", message.roomId);

    return data;
  },

  // Get messages in a room
  getMessages: async (
    roomId: string,
    options?: { limit?: number; before?: string }
  ): Promise<ChatMessage[]> => {
    let query = supabase
      .from("ChatMessage")
      .select(
        `
        *,
        sender:User!ChatMessage_senderId_fkey(id, fullName, avatarUrl)
      `
      )
      .eq("roomId", roomId)
      .order("createdAt", { ascending: true });

    if (options?.before) {
      query = query.lt("createdAt", options.before);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ [CHAT] Get messages error:", error);
      return [];
    }

    return data || [];
  },

  // Mark messages as read
  markMessagesAsRead: async (roomId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from("ChatMessage")
      .update({ isRead: true })
      .eq("roomId", roomId)
      .neq("senderId", userId) // Don't mark own messages
      .eq("isRead", false);

    if (error) {
      console.error("❌ [CHAT] Mark read error:", error);
    }
  },

  // Get unread count for a room
  getUnreadCount: async (roomId: string, userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from("ChatMessage")
      .select("*", { count: "exact", head: true })
      .eq("roomId", roomId)
      .neq("senderId", userId)
      .eq("isRead", false);

    if (error) {
      console.error("❌ [CHAT] Unread count error:", error);
      return 0;
    }

    return count || 0;
  },

  // ========================================
  // QUICK REPLIES (For Staff)
  // ========================================

  quickReplies: [
    "Xin chào! Tôi có thể giúp gì cho bạn?",
    "Vui lòng cho tôi biết mã đơn hàng của bạn.",
    "Để tôi kiểm tra thông tin cho bạn nhé.",
    "Cảm ơn bạn đã liên hệ! Có vấn đề gì khác không?",
    "Đơn hàng của bạn đang được xử lý.",
    "Xin lỗi vì sự bất tiện này. Chúng tôi sẽ hỗ trợ bạn ngay.",
    "Vui lòng đợi trong giây lát.",
    "Cảm ơn bạn đã kiên nhẫn chờ đợi!",
  ],
};
