// React Query Hooks for Order API
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services";
import { Order } from "../types";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters?: any) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  user: (userId: string) => [...orderKeys.all, "user", userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch all orders (admin)
 */
export const useOrders = () => {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      console.log("🔍 [useOrders] Fetching all orders...");
      try {
        const data = await api.orders.getAll();
        console.log(
          "✅ [useOrders] Fetched orders:",
          data?.length || 0,
          "orders"
        );
        console.log("📦 [useOrders] Sample data:", data?.slice(0, 2));
        return data;
      } catch (error) {
        console.error("❌ [useOrders] Error fetching orders:", error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch user's orders
 */
export const useUserOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: userId ? orderKeys.user(userId) : ["orders", "guest"],
    queryFn: () =>
      userId ? api.orders.getByUser(userId) : Promise.resolve([]),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch single order detail
 */
export const useOrderDetail = (orderId: string | undefined) => {
  return useQuery({
    queryKey: orderId
      ? orderKeys.detail(orderId)
      : ["orders", "detail", "none"],
    queryFn: () =>
      orderId ? api.orders.getDetail(orderId) : Promise.resolve(null),
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to create order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: any) => api.orders.create(orderData),
    onSuccess: (_, variables) => {
      // Invalidate orders list and user orders
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.user(variables.userId),
        });
      }
    },
  });
};

/**
 * Hook to update order status (admin)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.orders.updateStatus(orderId, status),
    onSuccess: (_, variables) => {
      // Invalidate all orders and specific order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
    },
  });
};

/**
 * Hook to cancel order (customer)
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => api.orders.cancel(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
};
