// Supabase Realtime Configuration
// Setup subscriptions for real-time updates

import { supabase } from "./supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

// Channel references
let ordersChannel: RealtimeChannel | null = null;

// ===========================
// ORDER REALTIME SUBSCRIPTION
// ===========================

export interface OrderRealtimeEvent {
  type: "INSERT" | "UPDATE" | "DELETE";
  old: any;
  new: any;
}

type OrderCallback = (event: OrderRealtimeEvent) => void;

/**
 * Subscribe to Order table changes
 * Use this in Admin Dashboard to get real-time notifications of new orders
 */
export const subscribeToOrders = (callback: OrderCallback) => {
  // Unsubscribe if already subscribed
  if (ordersChannel) {
    ordersChannel.unsubscribe();
  }

  // Create new channel
  ordersChannel = supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events: INSERT, UPDATE, DELETE
        schema: "public",
        table: "Order",
      },
      (payload) => {
        console.log("🔔 [REALTIME] Order change:", payload);
        callback({
          type: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
          old: payload.old,
          new: payload.new,
        });
      }
    )
    .subscribe((status) => {
      console.log("📡 [REALTIME] Orders subscription status:", status);
    });

  return ordersChannel;
};

/**
 * Unsubscribe from Order changes
 */
export const unsubscribeFromOrders = () => {
  if (ordersChannel) {
    ordersChannel.unsubscribe();
    ordersChannel = null;
    console.log("🔕 [REALTIME] Unsubscribed from orders");
  }
};

// ===========================
// SPECIFIC ORDER TRACKING
// ===========================

/**
 * Subscribe to a specific order by ID
 * Use this in Order Tracking page for customer to see status updates
 */
export const subscribeToOrderById = (
  orderId: string,
  callback: OrderCallback
) => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE", // Only listen to updates
        schema: "public",
        table: "Order",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        console.log(`🔔 [REALTIME] Order ${orderId} updated:`, payload);
        callback({
          type: "UPDATE",
          old: payload.old,
          new: payload.new,
        });
      }
    )
    .subscribe((status) => {
      console.log(
        `📡 [REALTIME] Order ${orderId} subscription status:`,
        status
      );
    });

  return channel;
};

/**
 * Unsubscribe from specific order
 */
export const unsubscribeFromOrderById = (channel: RealtimeChannel) => {
  channel.unsubscribe();
  console.log("🔕 [REALTIME] Unsubscribed from order");
};

// ===========================
// NOTIFICATION REALTIME
// ===========================

let notificationsChannel: RealtimeChannel | null = null;

export interface NotificationRealtimeEvent {
  type: "INSERT" | "UPDATE" | "DELETE";
  old: any;
  new: any;
}

type NotificationCallback = (event: NotificationRealtimeEvent) => void;

/**
 * Subscribe to notifications for a specific user
 */
export const subscribeToNotifications = (
  userId: string,
  callback: NotificationCallback
) => {
  if (notificationsChannel) {
    notificationsChannel.unsubscribe();
  }

  notificationsChannel = supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Notification",
        filter: `userId=eq.${userId}`,
      },
      (payload) => {
        console.log("🔔 [REALTIME] New notification:", payload);
        callback({
          type: "INSERT",
          old: null,
          new: payload.new,
        });
      }
    )
    .subscribe((status) => {
      console.log("📡 [REALTIME] Notifications subscription:", status);
    });

  return notificationsChannel;
};

export const unsubscribeFromNotifications = () => {
  if (notificationsChannel) {
    notificationsChannel.unsubscribe();
    notificationsChannel = null;
    console.log("🔕 [REALTIME] Unsubscribed from notifications");
  }
};

// ===========================
// CHAT REALTIME
// ===========================

let chatRoomChannel: RealtimeChannel | null = null;
let chatWaitingChannel: RealtimeChannel | null = null;
const chatChannels = new Map<string, RealtimeChannel>();

export interface ChatRealtimeEvent {
  type: "INSERT" | "UPDATE";
  old: any;
  new: any;
}

/**
 * Subscribe to messages in a specific chat room
 */
export const subscribeToChatRoom = (
  roomId: string,
  callback: (event: ChatRealtimeEvent) => void
) => {
  if (chatRoomChannel) {
    chatRoomChannel.unsubscribe();
  }

  chatRoomChannel = supabase
    .channel(`chat-room-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ChatMessage",
        filter: `roomId=eq.${roomId}`,
      },
      (payload) => {
        console.log("💬 [REALTIME] New message:", payload);
        callback({
          type: "INSERT",
          old: null,
          new: payload.new,
        });
      }
    )
    .subscribe((status) => {
      console.log(`📡 [REALTIME] Chat room ${roomId} subscription:`, status);
    });

  return chatRoomChannel;
};

export const unsubscribeFromChatRoom = () => {
  if (chatRoomChannel) {
    chatRoomChannel.unsubscribe();
    chatRoomChannel = null;
    console.log("🔕 [REALTIME] Unsubscribed from chat room");
  }
};

/**
 * Subscribe to new chat requests (for staff)
 */
export const subscribeToWaitingChats = (
  callback: (event: ChatRealtimeEvent) => void
) => {
  if (chatWaitingChannel) {
    chatWaitingChannel.unsubscribe();
  }

  chatWaitingChannel = supabase
    .channel("waiting-chats")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ChatRoom",
      },
      (payload) => {
        console.log("💬 [REALTIME] Chat room change:", payload);
        callback({
          type: payload.eventType as "INSERT" | "UPDATE",
          old: payload.old,
          new: payload.new,
        });
      }
    )
    .subscribe((status) => {
      console.log("📡 [REALTIME] Waiting chats subscription:", status);
    });

  return chatWaitingChannel;
};

export const unsubscribeFromWaitingChats = () => {
  if (chatWaitingChannel) {
    chatWaitingChannel.unsubscribe();
    chatWaitingChannel = null;
    console.log("🔕 [REALTIME] Unsubscribed from waiting chats");
  }
};

// ===========================
// CHAT HELPER ALIASES
// ===========================

/**
 * Subscribe to messages in a chat room (with multiple room support)
 * @returns unsubscribe function
 */
export const subscribeToChatMessages = (
  roomId: string,
  callback: (message: any) => void
) => {
  // Unsubscribe from existing channel for this room if any
  const existing = chatChannels.get(roomId);
  if (existing) {
    existing.unsubscribe();
    chatChannels.delete(roomId);
  }

  const channel = supabase
    .channel(`chat-messages-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ChatMessage",
        filter: `roomId=eq.${roomId}`,
      },
      (payload) => {
        console.log("💬 [REALTIME] New message in room:", roomId, payload);
        callback(payload.new);
      }
    )
    .subscribe((status) => {
      console.log(`📡 [REALTIME] Chat messages ${roomId}:`, status);
    });

  chatChannels.set(roomId, channel);

  return () => {
    channel.unsubscribe();
    chatChannels.delete(roomId);
  };
};

/**
 * Subscribe to chat room changes (for staff dashboard)
 */
export const subscribeToChatRooms = (callback: (room: any) => void) => {
  const channel = supabase
    .channel("chat-rooms-all")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ChatRoom",
      },
      (payload) => {
        console.log("💬 [REALTIME] Chat room change:", payload);
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          callback(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log("📡 [REALTIME] Chat rooms subscription:", status);
    });

  return () => {
    channel.unsubscribe();
  };
};

/**
 * Unsubscribe from a specific chat room
 */
export const unsubscribeFromChat = (roomId: string) => {
  const channel = chatChannels.get(roomId);
  if (channel) {
    channel.unsubscribe();
    chatChannels.delete(roomId);
    console.log("🔕 [REALTIME] Unsubscribed from chat:", roomId);
  }
};

// ===========================
// CLEANUP
// ===========================

/**
 * Cleanup all subscriptions
 * Call this when component unmounts
 */
export const cleanupRealtimeSubscriptions = () => {
  unsubscribeFromOrders();
  unsubscribeFromNotifications();
  unsubscribeFromChatRoom();
  unsubscribeFromWaitingChats();
  // Cleanup all chat channels
  chatChannels.forEach((channel) => channel.unsubscribe());
  chatChannels.clear();
};
