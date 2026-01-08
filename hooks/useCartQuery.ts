// React Query Hooks for Cart API
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services";
import { CartItem, Product, ProductVariant } from "../types";

// Query Keys
export const cartKeys = {
  all: ["cart"] as const,
  user: (userId: string) => [...cartKeys.all, userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch user's cart
 * @param userId User ID
 * @returns Cart items with loading/error states
 */
export const useCart = (userId: string | undefined) => {
  return useQuery({
    queryKey: userId ? cartKeys.user(userId) : ["cart", "guest"],
    queryFn: () => (userId ? api.cart.get(userId) : Promise.resolve([])),
    enabled: !!userId, // Only fetch if user is logged in
    staleTime: 1 * 60 * 1000, // 1 minute - cart changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// ============================================================================
// MUTATIONS with Optimistic Updates
// ============================================================================

/**
 * Hook to add item to cart with optimistic update
 */
export const useAddToCart = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product,
      variant,
      quantity,
    }: {
      product: Product;
      variant: ProductVariant;
      quantity: number;
    }) => {
      if (!userId) return null;

      // Get current cart
      const currentCart =
        queryClient.getQueryData<CartItem[]>(cartKeys.user(userId)) || [];

      // Update cart
      const existing = currentCart.find((i) => i.variantId === variant.id);
      let newCart: CartItem[];

      if (existing) {
        newCart = currentCart.map((i) =>
          i.variantId === variant.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        newCart = [
          ...currentCart,
          {
            id: Date.now().toString(),
            variantId: variant.id,
            product,
            variant,
            quantity,
          },
        ];
      }

      // Save to backend
      await api.cart.save(userId, newCart);
      return newCart;
    },

    // Optimistic update - update UI immediately
    onMutate: async ({ product, variant, quantity }) => {
      if (!userId) return;

      const queryKey = cartKeys.user(userId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<CartItem[]>(queryKey);

      // Optimistically update cart
      queryClient.setQueryData<CartItem[]>(queryKey, (old = []) => {
        const existing = old.find((i) => i.variantId === variant.id);
        if (existing) {
          return old.map((i) =>
            i.variantId === variant.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [
          ...old,
          {
            id: Date.now().toString(),
            variantId: variant.id,
            product,
            variant,
            quantity,
          },
        ];
      });

      // Return context for rollback
      return { previousCart };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (userId && context?.previousCart) {
        queryClient.setQueryData(cartKeys.user(userId), context.previousCart);
      }
    },

    // Refetch only on error to sync with server
    // Don't invalidate on success - optimistic update already applied
    onSettled: (data, error) => {
      if (userId && error) {
        // Only refetch if there was an error
        queryClient.invalidateQueries({ queryKey: cartKeys.user(userId) });
      }
    },
  });
};

/**
 * Hook to update cart item quantity
 */
export const useUpdateCartQuantity = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      quantity,
    }: {
      variantId: string;
      quantity: number;
    }) => {
      if (!userId) return null;

      const currentCart =
        queryClient.getQueryData<CartItem[]>(cartKeys.user(userId)) || [];
      const newCart =
        quantity <= 0
          ? currentCart.filter((i) => i.variantId !== variantId)
          : currentCart.map((i) =>
              i.variantId === variantId ? { ...i, quantity } : i
            );

      await api.cart.save(userId, newCart);
      return newCart;
    },

    // Optimistic update
    onMutate: async ({ variantId, quantity }) => {
      if (!userId) return;

      const queryKey = cartKeys.user(userId);
      await queryClient.cancelQueries({ queryKey });

      const previousCart = queryClient.getQueryData<CartItem[]>(queryKey);

      queryClient.setQueryData<CartItem[]>(queryKey, (old = []) => {
        if (quantity <= 0) {
          return old.filter((i) => i.variantId !== variantId);
        }
        return old.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
        );
      });

      return { previousCart };
    },

    onError: (err, variables, context) => {
      if (userId && context?.previousCart) {
        queryClient.setQueryData(cartKeys.user(userId), context.previousCart);
      }
    },

    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: cartKeys.user(userId) });
      }
    },
  });
};

/**
 * Hook to remove item from cart
 */
export const useRemoveFromCart = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variantId: string) => {
      if (!userId) return null;

      const currentCart =
        queryClient.getQueryData<CartItem[]>(cartKeys.user(userId)) || [];
      const newCart = currentCart.filter((i) => i.variantId !== variantId);

      await api.cart.save(userId, newCart);
      return newCart;
    },

    // Optimistic update
    onMutate: async (variantId) => {
      if (!userId) return;

      const queryKey = cartKeys.user(userId);
      await queryClient.cancelQueries({ queryKey });

      const previousCart = queryClient.getQueryData<CartItem[]>(queryKey);

      queryClient.setQueryData<CartItem[]>(queryKey, (old = []) =>
        old.filter((i) => i.variantId !== variantId)
      );

      return { previousCart };
    },

    onError: (err, variables, context) => {
      if (userId && context?.previousCart) {
        queryClient.setQueryData(cartKeys.user(userId), context.previousCart);
      }
    },

    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: cartKeys.user(userId) });
      }
    },
  });
};

/**
 * Hook to clear entire cart
 */
export const useClearCart = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) return null;
      await api.cart.save(userId, []);
      return [];
    },

    onMutate: async () => {
      if (!userId) return;

      const queryKey = cartKeys.user(userId);
      await queryClient.cancelQueries({ queryKey });

      const previousCart = queryClient.getQueryData<CartItem[]>(queryKey);
      queryClient.setQueryData<CartItem[]>(queryKey, []);

      return { previousCart };
    },

    onError: (err, variables, context) => {
      if (userId && context?.previousCart) {
        queryClient.setQueryData(cartKeys.user(userId), context.previousCart);
      }
    },

    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: cartKeys.user(userId) });
      }
    },
  });
};
