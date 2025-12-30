// Supabase Client Configuration
// Direct database access for prototype (bypasses Prisma, works in browser)

import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://mruygxkhfdbegwgaewwb.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Enable session persistence in localStorage
    autoRefreshToken: true, // Auto refresh token before expiry
    detectSessionInUrl: false, // Don't check URL for session (SPA mode)
  },
});

// Helper: Convert snake_case to camelCase for Supabase responses
export const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper: Convert camelCase to snake_case for Supabase inserts/updates
export const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Log connection status
if (import.meta.env.DEV) {
  console.log("🔵 Supabase client initialized");
  console.log("📍 URL:", supabaseUrl);
  console.log("🔑 Key:", supabaseKey ? "✓ Configured" : "✗ Missing");
}
