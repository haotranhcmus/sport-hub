// Main API Service - Re-exports all modular services
// This maintains backward compatibility with existing code

import { systemService } from "./system.service";
import { productService } from "./product.service";
import { orderService, setReturnRequestService } from "./order.service";
import { returnRequestService } from "./return-request.service";
import { supabase } from "../lib/supabase";
import { createSystemLog, withUpdatedAt } from "./shared.service";
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
            addresses =
              typeof user.addresses === "string"
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
      .update(withUpdatedAt({ addresses: JSON.stringify(addresses) }))
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return true;
  },

  // Check if phone number is already used by another user
  checkPhoneExists: async (
    phone: string,
    excludeUserId?: string
  ): Promise<boolean> => {
    let query = supabase.from("User").select("id").eq("phone", phone);

    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data && data.length > 0;
  },

  // Update user profile
  updateProfile: async (
    userId: string,
    updates: { fullName?: string; phone?: string }
  ) => {
    const { data, error } = await supabase
      .from("User")
      .update(withUpdatedAt(updates))
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Change password (verify old password first)
  changePassword: async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ) => {
    // Get current user to verify old password
    const { data: user, error: fetchError } = await supabase
      .from("User")
      .select("password")
      .eq("id", userId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    // Verify old password (in real app, should use bcrypt)
    if (user.password !== oldPassword) {
      throw new Error("Mật khẩu cũ không chính xác");
    }

    // Check new password is different from old
    if (oldPassword === newPassword) {
      throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
    }

    // Update password
    const { error: updateError } = await supabase
      .from("User")
      .update(withUpdatedAt({ password: newPassword }))
      .eq("id", userId);

    if (updateError) throw new Error(updateError.message);
    return true;
  },

  // Get user by ID
  getById: async (userId: string) => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
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
      .update(withUpdatedAt(updates))
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
    // Check if category has child categories
    const { data: childCategories } = await supabase
      .from("Category")
      .select("id")
      .eq("parentId", id);
    if (childCategories && childCategories.length > 0) {
      throw new Error(
        `Không thể xóa! Danh mục này có ${childCategories.length} danh mục con. Vui lòng xóa danh mục con trước.`
      );
    }

    // Check if category has products
    const { data: products } = await supabase
      .from("Product")
      .select("id")
      .eq("categoryId", id);
    if (products && products.length > 0) {
      throw new Error(
        `Không thể xóa! Danh mục này có ${products.length} sản phẩm đang sử dụng. Vui lòng chuyển hoặc xóa sản phẩm trước.`
      );
    }

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
      .update(withUpdatedAt(updates))
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
    // Check if brand has products
    const { data: products } = await supabase
      .from("Product")
      .select("id")
      .eq("brandId", id);
    if (products && products.length > 0) {
      throw new Error(
        `Không thể xóa! Thương hiệu này có ${products.length} sản phẩm đang sử dụng. Vui lòng chuyển hoặc xóa sản phẩm trước.`
      );
    }

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
    console.log("🔧 Creating attribute with data:", attrData);
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
    if (error) {
      console.error("❌ Error creating attribute:", error);
      throw new Error(error.message);
    }
    console.log("✅ Attribute created:", data);
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
      .update(withUpdatedAt(updates))
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
      .update(withUpdatedAt(updates))
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
    // Check if size guide is used by categories
    const { data: categories } = await supabase
      .from("Category")
      .select("id")
      .eq("sizeGuideId", id);
    if (categories && categories.length > 0) {
      throw new Error(
        `Không thể xóa! Bảng size này đang được sử dụng bởi ${categories.length} danh mục. Vui lòng gỡ liên kết trước.`
      );
    }

    // Check if size guide is used by products
    const { data: products } = await supabase
      .from("Product")
      .select("id")
      .eq("sizeGuideId", id);
    if (products && products.length > 0) {
      throw new Error(
        `Không thể xóa! Bảng size này đang được sử dụng bởi ${products.length} sản phẩm. Vui lòng gỡ liên kết trước.`
      );
    }

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
    return true;
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
  delete: async (id: string, user: User) => {
    // Check if supplier has stock entries
    const { data: stockEntries } = await supabase
      .from("StockEntry")
      .select("id")
      .eq("supplierId", id);
    if (stockEntries && stockEntries.length > 0) {
      throw new Error(
        `Không thể xóa! Nhà cung cấp này có ${stockEntries.length} phiếu nhập kho. Vui lòng xóa phiếu nhập trước.`
      );
    }

    const { error } = await supabase.from("Supplier").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "DELETE",
        tableName: "Supplier",
        recordId: id,
        description: "Xóa nhà cung cấp",
        actorId: user.id,
        actorName: user.fullName,
      })
    );
    return true;
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
        date: entryData.date || now,
        actorName: user.fullName,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) {
      console.error("❌ [STOCK ENTRY] Error:", error);
      throw new Error(error.message);
    }
    console.log("✅ [STOCK ENTRY] Created:", code);

    // 🔥 UPDATE STOCK QUANTITY FOR EACH VARIANT
    if (entryData.items && entryData.items.length > 0) {
      for (const item of entryData.items) {
        if (item.variantId) {
          try {
            // Get current stock
            const { data: variant } = await supabase
              .from("ProductVariant")
              .select("stockQuantity")
              .eq("id", item.variantId)
              .single();

            if (variant) {
              const newStock =
                (variant.stockQuantity || 0) + (item.quantity || 0);
              const { error: updateError } = await supabase
                .from("ProductVariant")
                .update({
                  stockQuantity: newStock,
                  updatedAt: now,
                })
                .eq("id", item.variantId);

              if (updateError) {
                console.error(
                  `❌ [STOCK UPDATE] Error for variant ${item.variantId}:`,
                  updateError
                );
              } else {
                console.log(
                  `✅ [STOCK UPDATE] Variant ${item.variantId}: ${variant.stockQuantity} -> ${newStock} (+${item.quantity})`
                );
              }
            }
          } catch (stockError: any) {
            console.error(`❌ [STOCK UPDATE] Error:`, stockError.message);
          }
        }
      }
    }

    return data;
  },
  // ✅ Alias for consistency
  createStockEntry: async (entryData: any, user: User) => {
    return inventoryService.saveStockEntry(entryData, user);
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
        date: issueData.date || now,
        actorName: user.fullName,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) {
      console.error("❌ [STOCK ISSUE] Error:", error);
      throw new Error(error.message);
    }
    console.log("✅ [STOCK ISSUE] Created:", code);

    // 🔥 UPDATE STOCK QUANTITY FOR EACH VARIANT (DECREASE)
    if (issueData.items && issueData.items.length > 0) {
      for (const item of issueData.items) {
        if (item.variantId) {
          try {
            // Get current stock
            const { data: variant } = await supabase
              .from("ProductVariant")
              .select("stockQuantity")
              .eq("id", item.variantId)
              .single();

            if (variant) {
              const newStock = Math.max(
                0,
                (variant.stockQuantity || 0) - (item.quantity || 0)
              );
              const { error: updateError } = await supabase
                .from("ProductVariant")
                .update({
                  stockQuantity: newStock,
                  updatedAt: now,
                })
                .eq("id", item.variantId);

              if (updateError) {
                console.error(
                  `❌ [STOCK UPDATE] Error for variant ${item.variantId}:`,
                  updateError
                );
              } else {
                console.log(
                  `✅ [STOCK UPDATE] Variant ${item.variantId}: ${variant.stockQuantity} -> ${newStock} (-${item.quantity})`
                );
              }
            }
          } catch (stockError: any) {
            console.error(`❌ [STOCK UPDATE] Error:`, stockError.message);
          }
        }
      }
    }

    return data;
  },
  // ✅ Alias for consistency
  createStockIssue: async (issueData: any, user: User) => {
    return inventoryService.saveStockIssue(issueData, user);
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
        date: stocktakeData.date || now,
        auditorName: user.fullName, // Fixed: use auditorName instead of actorName
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error) {
      console.error("❌ [STOCKTAKE] Error:", error);
      throw new Error(error.message);
    }
    console.log("✅ [STOCKTAKE] Created:", code);
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
    // Tính date range dựa trên filter
    const now = new Date();
    const days =
      range === "today"
        ? 1
        : range === "7days"
        ? 7
        : range === "month"
        ? 30
        : 365;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Lấy date range cho period trước để tính growth
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    try {
      // Lấy đơn hàng trong kỳ hiện tại
      const { data: currentOrders, error: orderError } = await supabase
        .from("Order")
        .select(
          `
          id, orderCode, totalAmount, shippingFee, status, paymentMethod, createdAt,
          items:OrderItem(id, productId, productName, quantity, unitPrice, thumbnailUrl)
        `
        )
        .gte("createdAt", startDate.toISOString())
        .lte("createdAt", now.toISOString())
        .order("createdAt", { ascending: true });

      if (orderError) throw orderError;

      // Lấy đơn hàng trong kỳ trước để tính growth
      const { data: prevOrders, error: prevError } = await supabase
        .from("Order")
        .select("id, totalAmount")
        .gte("createdAt", prevStartDate.toISOString())
        .lt("createdAt", startDate.toISOString());

      if (prevError) throw prevError;

      // Lấy return requests trong kỳ
      const { data: returnRequests, error: returnError } = await supabase
        .from("ReturnRequest")
        .select("id, refundAmount, status")
        .gte("createdAt", startDate.toISOString())
        .lte("createdAt", now.toISOString());

      if (returnError) throw returnError;

      // Lấy danh sách category
      const { data: categories } = await supabase
        .from("Category")
        .select("id, name");

      // Lấy products với categoryId
      const { data: products } = await supabase
        .from("Product")
        .select("id, categoryId, costPrice, basePrice");

      const productCategoryMap = new Map(
        products?.map((p) => [
          p.id,
          {
            categoryId: p.categoryId,
            costPrice: p.costPrice || p.basePrice * 0.7,
          },
        ]) || []
      );
      const categoryMap = new Map(categories?.map((c) => [c.id, c.name]) || []);

      // Tính metrics
      const orders = currentOrders || [];
      const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      );
      const totalShipping = orders.reduce(
        (sum, o) => sum + (o.shippingFee || 0),
        0
      );
      const netRevenue = totalRevenue - totalShipping;
      const totalOrders = orders.length;

      // Tính profit từ costPrice thực tế
      let totalCost = 0;
      orders.forEach((order: any) => {
        (order.items || []).forEach((item: any) => {
          const productInfo = productCategoryMap.get(item.productId);
          const costPrice = productInfo?.costPrice || item.unitPrice * 0.7;
          totalCost += costPrice * item.quantity;
        });
      });
      const profit = netRevenue - totalCost;

      // Tính prev period metrics
      const prevRevenue = (prevOrders || []).reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      );
      const prevOrderCount = (prevOrders || []).length;

      // Tính growth %
      const revenueGrowth =
        prevRevenue > 0
          ? Math.round(((netRevenue - prevRevenue) / prevRevenue) * 100)
          : 0;
      const ordersGrowth =
        prevOrderCount > 0
          ? Math.round(((totalOrders - prevOrderCount) / prevOrderCount) * 100)
          : 0;

      // Return count và rate
      const returnCount = (returnRequests || []).length;
      const returnRate =
        totalOrders > 0 ? Math.round((returnCount / totalOrders) * 100) : 0;

      // Build chartData - group by date
      const chartDataMap = new Map<
        string,
        { revenue: number; orders: number }
      >();

      // Initialize all dates in range
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
        chartDataMap.set(dateKey, { revenue: 0, orders: 0 });
      }

      // Aggregate order data
      orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const dateKey = orderDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
        const existing = chartDataMap.get(dateKey);
        if (existing) {
          existing.revenue += order.totalAmount || 0;
          existing.orders += 1;
        }
      });

      const chartData = Array.from(chartDataMap.entries()).map(
        ([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
        })
      );

      // Top Products - aggregate from OrderItems
      const productSales = new Map<
        string,
        {
          name: string;
          sold: number;
          revenue: number;
          sku: string;
          thumbnail: string;
        }
      >();
      orders.forEach((order: any) => {
        (order.items || []).forEach((item: any) => {
          const key = item.productId;
          const existing = productSales.get(key) || {
            name: item.productName,
            sold: 0,
            revenue: 0,
            sku: "",
            thumbnail: item.thumbnailUrl || "",
          };
          existing.sold += item.quantity;
          existing.revenue += item.unitPrice * item.quantity;
          productSales.set(key, existing);
        });
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((p, idx) => ({ ...p, rank: idx + 1 }));

      // Category Breakdown
      const categorySales = new Map<string, number>();
      orders.forEach((order: any) => {
        (order.items || []).forEach((item: any) => {
          const productInfo = productCategoryMap.get(item.productId);
          const categoryId = productInfo?.categoryId;
          const categoryName = categoryMap.get(categoryId) || "Khác";
          const existing = categorySales.get(categoryName) || 0;
          categorySales.set(
            categoryName,
            existing + item.unitPrice * item.quantity
          );
        });
      });

      const COLORS = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#ec4899",
      ];
      const categoryBreakdown = Array.from(categorySales.entries())
        .map(([name, value], idx) => ({
          name,
          value,
          color: COLORS[idx % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value);

      // Payment Methods
      const paymentMethods = new Map<
        string,
        { count: number; amount: number }
      >();
      const PAYMENT_LABELS: Record<string, string> = {
        COD: "Tiền mặt (COD)",
        BANK_TRANSFER: "Chuyển khoản",
        MOMO: "MoMo",
        VNPAY: "VNPay",
        CREDIT_CARD: "Thẻ tín dụng",
      };
      const PAYMENT_COLORS: Record<string, string> = {
        COD: "#10b981",
        BANK_TRANSFER: "#3b82f6",
        MOMO: "#ec4899",
        VNPAY: "#06b6d4",
        CREDIT_CARD: "#f59e0b",
      };

      orders.forEach((order: any) => {
        const method = order.paymentMethod || "COD";
        const existing = paymentMethods.get(method) || { count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += order.totalAmount || 0;
        paymentMethods.set(method, existing);
      });

      const paymentData = Array.from(paymentMethods.entries()).map(
        ([method, data]) => ({
          method: PAYMENT_LABELS[method] || method,
          count: data.count,
          amount: data.amount,
          color: PAYMENT_COLORS[method] || "#6b7280",
        })
      );

      return {
        metrics: {
          totalRevenue,
          netRevenue,
          profit,
          totalOrders,
          orderTotal: totalOrders,
          avgOrderValue:
            totalOrders > 0 ? Math.round(netRevenue / totalOrders) : 0,
          returnCount,
          growth: {
            revenue: revenueGrowth,
            profit: revenueGrowth, // Simplified
            orders: ordersGrowth,
          },
          returnRate,
        },
        chartData,
        topProducts,
        categoryBreakdown,
        paymentData,
      };
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      return {
        metrics: {
          totalRevenue: 0,
          netRevenue: 0,
          profit: 0,
          totalOrders: 0,
          orderTotal: 0,
          avgOrderValue: 0,
          returnCount: 0,
          growth: { revenue: 0, profit: 0, orders: 0 },
          returnRate: 0,
        },
        chartData: [],
        topProducts: [],
        categoryBreakdown: [],
        paymentData: [],
      };
    }
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
        costPrice: v.product?.costPrice || v.product?.basePrice || 0, // Use basePrice if costPrice is null
        inventoryValue:
          (v.stockQuantity || 0) *
          (v.product?.costPrice || v.product?.basePrice || 0),
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
