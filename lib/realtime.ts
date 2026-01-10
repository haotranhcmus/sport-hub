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
// CLEANUP
// ===========================

/**
 * Cleanup all subscriptions
 * Call this when component unmounts
 */
export const cleanupRealtimeSubscriptions = () => {
  unsubscribeFromOrders();
  // Add other cleanup here if needed
};
