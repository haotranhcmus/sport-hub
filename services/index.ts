// Main API Service - Re-exports all modular services
// This maintains backward compatibility with existing code

import { systemService } from "./system.service";
import { productService } from "./product.service";
import { orderService, setReturnRequestService } from "./order.service";
import { returnRequestService } from "./return-request.service";
import { supabase } from "../lib/supabase";
import { createSystemLog } from "./shared.service";
import {
  User,
  CartItem,
  Category,
  Brand,
  ProductAttribute,
  SizeGuide,
  Supplier,
  StockEntry,
  StockIssue,
  Stocktake,
} from "../types";

// Inject returnRequestService into orderService to avoid circular dependency
setReturnRequestService(returnRequestService);

// In-memory cart storage
const MEMBER_CARTS: Record<string, CartItem[]> = {};

// Auth service (simple, inline)
const authService = {
  login: async (email: string): Promise<User> => {
    try {
      const { data: user, error } = await supabase
        .from("User")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("❌ [LOGIN] Supabase error:", error);
      }

      if (user) {
        console.log("✅ [LOGIN] User found:", user.email, "Role:", user.role);
        
        // Safely parse addresses
        let addresses = [];
        if (user.addresses) {
          try {
            addresses = typeof user.addresses === 'string' 
              ? JSON.parse(user.addresses) 
              : user.addresses;
          } catch (e) {
            console.error("❌ [LOGIN] Failed to parse addresses:", e);
            addresses = [];
          }
        }

        return {
          ...user,
          role: user.role, // ADMIN/SALES/WAREHOUSE/CUSTOMER
          addresses,
        };
      }

      console.log("⚠️ [LOGIN] User not found, creating guest user");
      return {
        id: "usr-01",
        email,
        fullName: "Hội viên SportHub",
        role: "CUSTOMER",
        phone: "",
        addresses: [],
      };
    } catch (error) {
      console.error("❌ [LOGIN] Unexpected error:", error);
      throw error;
    }
  },
  sendOTP: async (contact: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    sessionStorage.setItem("checkout_otp", otp);
    sessionStorage.setItem("checkout_otp_time", Date.now().toString());

    console.log("╔════════════════════════════════════════╗");
    console.log("║          MÃ OTP XÁC THỰC              ║");
    console.log("╠════════════════════════════════════════╣");
    console.log(`║  Số điện thoại: ${contact.padEnd(20)} ║`);
    console.log(`║  Mã OTP: ${otp}                       ║`);
    console.log(`║  Hiệu lực: 5 phút                     ║`);
    console.log("╚════════════════════════════════════════╝");

    return {
      success: true,
      message: "OTP đã được gửi đến " + contact,
    };
  },
  verifyOTP: async (otp: string) => {
    const storedOTP = sessionStorage.getItem("checkout_otp");
    const otpTime = sessionStorage.getItem("checkout_otp_time");

    if (!storedOTP || !otpTime) {
      return { valid: false, message: "Mã OTP không tồn tại" };
    }

    const elapsed = Date.now() - parseInt(otpTime);
    if (elapsed > 5 * 60 * 1000) {
      sessionStorage.removeItem("checkout_otp");
      sessionStorage.removeItem("checkout_otp_time");
      return { valid: false, message: "Mã OTP đã hết hạn" };
    }

    if (otp === storedOTP) {
      sessionStorage.removeItem("checkout_otp");
      sessionStorage.removeItem("checkout_otp_time");
      console.log("✅ Xác thực OTP thành công!");
      return { valid: true, message: "" };
    }

    return { valid: false, message: "Mã OTP không chính xác" };
  },
};

// User service
const userService = {
  updateAddresses: async (userId: string, addresses: any[]) => {
    const { error } = await supabase
      .from("User")
      .update({ addresses: JSON.stringify(addresses) })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return true;
  },
};

// Cart service (in-memory)
const cartService = {
  get: async (id: string) => [...(MEMBER_CARTS[id] || [])],
  save: async (id: string, items: any) => {
    MEMBER_CARTS[id] = [...items];
  },
};

// PLACEHOLDER SERVICES - To be implemented later
const categoryService = {
  list: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("Category")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data || [];
  },
  create: async (categoryData: any, user: User) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("Category")
      .insert({
        ...categoryData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "CREATE",
        tableName: "Category",
        recordId: data.id,
        description: `Tạo danh mục: ${categoryData.name}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  update: async (id: string, updates: any, user: User) => {
    const { data, error } = await supabase
      .from("Category")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "Category",
        recordId: id,
        description: "Cập nhật danh mục",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  delete: async (id: string, user: User) => {
    const { error } = await supabase.from("Category").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "DELETE",
        tableName: "Category",
        recordId: id,
        description: "Xóa danh mục",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
  },
};

const brandService = {
  list: async (): Promise<Brand[]> => {
    const { data, error } = await supabase
      .from("Brand")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data || [];
  },
  create: async (brandData: any, user: User) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("Brand")
      .insert({
        ...brandData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "CREATE",
        tableName: "Brand",
        recordId: data.id,
        description: `Tạo thương hiệu: ${brandData.name}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  update: async (id: string, updates: any, user: User) => {
    const { data, error } = await supabase
      .from("Brand")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "Brand",
        recordId: id,
        description: "Cập nhật thương hiệu",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  delete: async (id: string, user: User) => {
    const { error } = await supabase.from("Brand").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "DELETE",
        tableName: "Brand",
        recordId: id,
        description: "Xóa thương hiệu",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
  },
};

const attributeService = {
  list: async (): Promise<ProductAttribute[]> => {
    const { data, error } = await supabase
      .from("ProductAttribute")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data || [];
  },
  create: async (attrData: any, user: User) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("ProductAttribute")
      .insert({
        ...attrData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "CREATE",
        tableName: "ProductAttribute",
        recordId: data.id,
        description: `Tạo thuộc tính: ${attrData.name}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  update: async (id: string, updates: any, user: User) => {
    const { data, error } = await supabase
      .from("ProductAttribute")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "ProductAttribute",
        recordId: id,
        description: "Cập nhật thuộc tính",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  delete: async (id: string, user: User) => {
    const { error } = await supabase
      .from("ProductAttribute")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "DELETE",
        tableName: "ProductAttribute",
        recordId: id,
        description: "Xóa thuộc tính",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
  },
};

const sizeGuideService = {
  list: async (): Promise<SizeGuide[]> => {
    const { data, error } = await supabase
      .from("SizeGuide")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data || [];
  },
  getDetail: async (id: string) => {
    const { data, error } = await supabase
      .from("SizeGuide")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },
  create: async (guideData: any, user: User) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("SizeGuide")
      .insert({
        ...guideData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "CREATE",
        tableName: "SizeGuide",
        recordId: data.id,
        description: `Tạo bảng size: ${guideData.name}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  update: async (id: string, updates: any, user: User) => {
    const { data, error } = await supabase
      .from("SizeGuide")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "SizeGuide",
        recordId: id,
        description: "Cập nhật bảng size",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return data;
  },
  delete: async (id: string, user: User) => {
    const { error } = await supabase.from("SizeGuide").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "DELETE",
        tableName: "SizeGuide",
        recordId: id,
        description: "Xóa bảng size",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
  },
};

// Supplier, Inventory, Report, Employee services are simple wrappers
// For brevity, I'll create minimal implementations

const supplierService = {
  list: async (): Promise<Supplier[]> => {
    const { data, error } = await supabase
      .from("Supplier")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data || [];
  },
  create: async (supplierData: any, user: User) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("Supplier")
      .insert({
        ...supplierData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  update: async (id: string, updates: any, user: User) => {
    const { data, error } = await supabase
      .from("Supplier")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

const inventoryService = {
  getStockEntries: async (): Promise<StockEntry[]> => {
    const { data, error } = await supabase
      .from("StockEntry")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
  saveStockEntry: async (entryData: any, user: User) => {
    const now = new Date().toISOString();
    const code = `PNK-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-6)}`;
    const { data, error } = await supabase
      .from("StockEntry")
      .insert({
        ...entryData,
        id: crypto.randomUUID(),
        code,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  getStockIssues: async (): Promise<StockIssue[]> => {
    const { data, error } = await supabase
      .from("StockIssue")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
  // Alias for getStockIssues
  getIssueEntries: async (): Promise<StockIssue[]> => {
    const { data, error } = await supabase
      .from("StockIssue")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
  saveStockIssue: async (issueData: any, user: User) => {
    const now = new Date().toISOString();
    const code = `PXK-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-6)}`;
    const { data, error } = await supabase
      .from("StockIssue")
      .insert({
        ...issueData,
        id: crypto.randomUUID(),
        code,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  getStocktakes: async (): Promise<Stocktake[]> => {
    const { data, error } = await supabase
      .from("Stocktake")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
  saveStocktake: async (stocktakeData: any, user: User) => {
    const now = new Date().toISOString();
    const code = `KK-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-6)}`;
    const { data, error } = await supabase
      .from("Stocktake")
      .insert({
        ...stocktakeData,
        id: crypto.randomUUID(),
        code,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

const reportService = {
  getSalesReport: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from("Order")
      .select("*")
      .gte("createdAt", startDate)
      .lte("createdAt", endDate);
    if (error) throw new Error(error.message);
    return data || [];
  },

  getRevenueData: async ({ range }: { range: string }) => {
    // Mock data for revenue analytics
    const now = new Date();
    const chartData = [];
    const days =
      range === "today"
        ? 1
        : range === "7days"
        ? 7
        : range === "month"
        ? 30
        : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      chartData.push({
        date: date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        revenue: Math.floor(Math.random() * 50000000) + 10000000,
        orders: Math.floor(Math.random() * 50) + 10,
      });
    }

    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
    const profit = Math.floor(totalRevenue * 0.3); // 30% profit margin

    return {
      metrics: {
        totalRevenue,
        netRevenue: totalRevenue,
        profit,
        totalOrders,
        orderTotal: totalOrders,
        avgOrderValue: totalRevenue / totalOrders,
        returnCount: Math.floor(Math.random() * 5) + 1, // 1-5%
        growth: {
          revenue: Math.floor(Math.random() * 30) + 5,
          profit: Math.floor(Math.random() * 25) + 3,
          orders: Math.floor(Math.random() * 20) + 3,
        },
        returnRate: Math.floor(Math.random() * 5) + 1,
      },
      chartData,
      topProducts: [
        {
          name: "Áo Manchester United Home 24/25",
          sold: 120,
          revenue: 15000000,
        },
        { name: "Giày Nike Mercurial", sold: 89, revenue: 12000000 },
        { name: "Áo Real Madrid Away", sold: 75, revenue: 9000000 },
      ],
      categoryBreakdown: [
        { name: "Áo đấu", value: 45, color: "#3b82f6" },
        { name: "Giày", value: 30, color: "#10b981" },
        { name: "Phụ kiện", value: 25, color: "#f59e0b" },
      ],
      paymentData: [
        {
          method: "Chuyển khoản",
          count: 120,
          amount: 180000000,
          color: "#3b82f6",
        },
        { method: "Tiền mặt", count: 45, amount: 67500000, color: "#10b981" },
        { method: "Ví điện tử", count: 30, amount: 45000000, color: "#f59e0b" },
      ],
    };
  },

  getInventoryData: async (filters: any) => {
    try {
      const { data: variants, error } = await supabase
        .from("ProductVariant")
        .select("*, product:Product(*)")
        .eq("status", "active");

      if (error) throw error;

      const list = (variants || []).map((v: any) => ({
        productName: v.product?.name || "Unknown",
        sku: v.sku,
        size: v.size,
        color: v.color,
        stockQuantity: v.stockQuantity || 0,
        costPrice: v.product?.costPrice || 0,
        inventoryValue: (v.stockQuantity || 0) * (v.product?.costPrice || 0),
        thumbnail: v.imageUrl || v.product?.thumbnailUrl,
        isLowStock: (v.stockQuantity || 0) < 10,
      }));

      const totalValue = list.reduce(
        (sum: number, item: any) => sum + item.inventoryValue,
        0
      );
      const lowStockCount = list.filter((item: any) => item.isLowStock).length;
      const totalItems = list.reduce(
        (sum: number, item: any) => sum + item.stockQuantity,
        0
      );

      return {
        metrics: {
          totalValue,
          lowStockCount,
          totalItems,
        },
        list,
      };
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      return {
        metrics: { totalValue: 0, lowStockCount: 0, totalItems: 0 },
        list: [],
      };
    }
  },
};

const employeeService = {
  list: async () => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .order("fullName");
    if (error) throw new Error(error.message);
    return data || [];
  },
  create: async (userData: any, currentUser: User) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("User")
      .insert({
        ...userData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  update: async (id: string, updates: any, currentUser: User) => {
    const { data, error } = await supabase
      .from("User")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

// Export unified API object (backward compatible)
export const api = {
  system: systemService,
  products: productService,
  orders: orderService,
  returnRequests: returnRequestService,
  auth: authService,
  users: userService,
  categories: categoryService,
  brands: brandService,
  attributes: attributeService,
  sizeGuides: sizeGuideService,
  cart: cartService,
  suppliers: supplierService,
  reports: reportService,
  employees: employeeService,
  inventory: inventoryService,
};

// Export individual services for direct import
export {
  systemService,
  productService,
  orderService,
  returnRequestService,
  authService,
  userService,
  categoryService,
  brandService,
  attributeService,
  sizeGuideService,
  cartService,
  supplierService,
  reportService,
  employeeService,
  inventoryService,
};
