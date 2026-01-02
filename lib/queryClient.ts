// TanStack Query Client Configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Caching strategy
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (renamed from cacheTime)
      
      // Refetch strategy
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Refetch when component mounts
      refetchOnReconnect: true, // Refetch when reconnect to internet
      
      // Retry strategy
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Error handling
      throwOnError: false, // Don't throw errors globally
    },
    mutations: {
      // Retry strategy for mutations
      retry: 1, // Only retry once for mutations
      retryDelay: 1000,
      
      // Error handling
      throwOnError: false,
    },
  },
});
