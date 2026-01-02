// React Query Hooks for Inventory & Supplier APIs
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const inventoryKeys = {
  all: ["inventory"] as const,
  stockEntries: () => [...inventoryKeys.all, "stockEntries"] as const,
  issueEntries: () => [...inventoryKeys.all, "issueEntries"] as const,
  stocktakes: () => [...inventoryKeys.all, "stocktakes"] as const,
};

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
};

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
};

export const attributeKeys = {
  all: ["attributes"] as const,
  lists: () => [...attributeKeys.all, "list"] as const,
};

export const sizeGuideKeys = {
  all: ["sizeGuides"] as const,
  lists: () => [...sizeGuideKeys.all, "list"] as const,
};

// ============================================================================
// INVENTORY QUERIES
// ============================================================================

export const useStockEntries = () => {
  return useQuery({
    queryKey: inventoryKeys.stockEntries(),
    queryFn: () => api.inventory.getStockEntries(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useIssueEntries = () => {
  return useQuery({
    queryKey: inventoryKeys.issueEntries(),
    queryFn: () => api.inventory.getIssueEntries(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useStocktakes = () => {
  return useQuery({
    queryKey: inventoryKeys.stocktakes(),
    queryFn: () => api.inventory.getStocktakes(),
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================================================
// INVENTORY MUTATIONS
// ============================================================================

export const useCreateStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.inventory.createStockEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockEntries() });
      // Also invalidate products as stock changed
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCreateIssueEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.inventory.createIssueEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.issueEntries() });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useSaveStocktake = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, user }: { data: any; user: any }) =>
      api.inventory.saveStocktake(data, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stocktakes() });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ============================================================================
// SUPPLIER QUERIES
// ============================================================================

export const useSuppliers = () => {
  return useQuery({
    queryKey: supplierKeys.lists(),
    queryFn: () => api.suppliers.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes - suppliers rarely change
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.suppliers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

// ============================================================================
// METADATA QUERIES (Categories, Brands, Attributes, Size Guides)
// ============================================================================

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => api.categories.list(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: brandKeys.lists(),
    queryFn: () => api.brands.list(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useAttributes = () => {
  return useQuery({
    queryKey: attributeKeys.lists(),
    queryFn: () => api.attributes.list(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useSizeGuides = () => {
  return useQuery({
    queryKey: sizeGuideKeys.lists(),
    queryFn: () => api.sizeGuides.list(),
    staleTime: 10 * 60 * 1000,
  });
};
