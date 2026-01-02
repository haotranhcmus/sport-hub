// React Query Hooks for Products API
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services";
import { Product } from "../types";

// Query Keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch all products with caching
 * @returns Products list with loading/error states
 */
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => api.products.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes - products don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

/**
 * Hook to fetch single product detail
 * @param slug Product slug
 * @returns Product detail with loading/error states
 */
export const useProductDetail = (slug: string) => {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => api.products.getDetail(slug),
    enabled: !!slug, // Only run if slug exists
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// MUTATIONS (for admin operations)
// ============================================================================

/**
 * Hook to create new product (admin)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.products.create(data),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

/**
 * Hook to update product (admin)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and specific detail
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to delete product (admin)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// ============================================================================
// OPTIMISTIC UPDATES HELPERS
// ============================================================================

/**
 * Prefetch product detail for instant navigation
 */
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(slug),
      queryFn: () => api.products.getDetail(slug),
      staleTime: 5 * 60 * 1000,
    });
  };
};
