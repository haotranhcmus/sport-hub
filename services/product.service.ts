// Product Service
import { supabase } from "../lib/supabase";
import { ProductStatus } from "../constants/enums";
import { Product, User, CartItem } from "../types";
import { createSystemLog, delay } from "./shared.service";

export const productService = {
  list: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from("Product")
        .select(
          `
          *,
          category:Category(*),
          brand:Brand(*),
          variants:ProductVariant(*),
          reviews:Review(*)
        `
        )
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("❌ Error fetching products:", error);
        // Return empty array instead of throwing
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("❌ Exception fetching products:", err);
      return [];
    }
  },

  getDetail: async (slug: string): Promise<Product> => {
    const { data, error } = await supabase
      .from("Product")
      .select(
        `
          *,
          category:Category(*),
          brand:Brand(*),
          variants:ProductVariant(*),
          reviews:Review(*)
        `
      )
      .eq("slug", slug)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  validateStock: async (cartItems: CartItem[]) => {
    await delay(300);
    return { valid: true, message: "" };
  },

  deductStock: async (items: any[]) => {
    return { success: true, message: "" };
  },

  getRelated: async (categoryId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("Product")
      .select(
        `
          *,
          category:Category(*),
          brand:Brand(*),
          variants:ProductVariant(*)
        `
      )
      .eq("categoryId", categoryId)
      .eq("status", ProductStatus.ACTIVE)
      .limit(4);

    if (error) throw new Error(error.message);
    return data || [];
  },

  addReview: async (reviewData: any, productId: string) => {
    console.log("📊 API.products.addReview called:", {
      reviewData,
      productId,
    });
    const now = new Date().toISOString();
    const review = {
      id: `rev-${Date.now()}`,
      productId,
      ...reviewData,
      createdAt: now,
      updatedAt: now,
    };

    console.log("📊 Inserting review:", review);
    const { data, error } = await supabase
      .from("Review")
      .insert(review)
      .select()
      .single();

    if (error) {
      console.error("❌ Error inserting review:", error);
      throw new Error(error.message);
    }
    console.log("✅ Review inserted successfully:", data);
    return data;
  },

  create: async (productData: any, user: User): Promise<Product> => {
    console.log("📦 [PRODUCT CREATE] Starting with data:", {
      name: productData.name,
      productCode: productData.productCode,
      categoryId: productData.categoryId,
      brandId: productData.brandId,
    });

    const slug =
      productData.slug ||
      productData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Generate UUID and timestamps client-side
    const productId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Clean and validate data before insert
    const cleanData = {
      id: productId,
      productCode: productData.productCode,
      name: productData.name,
      slug,
      description: productData.description || "Chưa có mô tả",
      basePrice: Number(productData.basePrice) || 0,
      promotionalPrice: productData.promotionalPrice
        ? Number(productData.promotionalPrice)
        : null,
      thumbnailUrl: productData.thumbnailUrl || "",
      status: productData.status || "ACTIVE",
      categoryId: productData.categoryId,
      brandId: productData.brandId,
      totalSold: 0,
      allowReturn: productData.allowReturn ?? true,
      returnPeriod: productData.returnPeriod || 7,
      freeShipping: productData.freeShipping || false,
      attributes: productData.attributes || {},
      sizeGuideId: productData.sizeGuideId || null,
      condition: productData.condition || null,
    };

    console.log("📦 [PRODUCT CREATE] Clean data:", cleanData);

    const { data, error } = await supabase
      .from("Product")
      .insert(cleanData)
      .select()
      .single();

    if (error) {
      console.error("❌ [PRODUCT CREATE] Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ [PRODUCT CREATE] Success:", data.id);

    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "CREATE",
        tableName: "Product",
        recordId: data.id,
        description: `Tạo sản phẩm: ${productData.name}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    return data;
  },

  update: async (id: string, updates: any, user: User): Promise<Product> => {
    const { data, error } = await supabase
      .from("Product")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "Product",
        recordId: id,
        description: "Cập nhật sản phẩm",
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    return data;
  },

  saveVariants: async (productId: string, variants: any[], user: User) => {
    // ✅ FIX: Use UPSERT logic instead of DELETE ALL + INSERT
    // This preserves existing variants and their stock data

    const now = new Date().toISOString();

    // UUID regex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Validate SKU uniqueness within the batch
    const skus = variants.map((v) => v.sku);
    const duplicates = skus.filter((sku, idx) => skus.indexOf(sku) !== idx);
    if (duplicates.length > 0) {
      throw new Error(
        `SKU trùng lặp trong danh sách: ${duplicates.join(", ")}`
      );
    }

    let successCount = 0;
    let errorMessages: string[] = [];

    for (const variant of variants) {
      try {
        // ✅ FIX: Check if variant has valid UUID (not temporary ID like v-timestamp-0)
        const isExisting = variant.id && uuidRegex.test(variant.id);

        if (isExisting) {
          // UPDATE existing variant
          console.log("🔄 [VARIANT UPDATE]", variant.sku, "ID:", variant.id);
          const { error } = await supabase
            .from("ProductVariant")
            .update({
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              stockQuantity: variant.stockQuantity,
              priceAdjustment: variant.priceAdjustment,
              imageUrl: variant.imageUrl,
              status: variant.status,
              updatedAt: now,
            })
            .eq("id", variant.id);

          if (error) {
            console.error("❌ [VARIANT UPDATE] Error:", error);
            errorMessages.push(`${variant.sku}: ${error.message}`);
          } else {
            successCount++;
          }
        } else {
          // INSERT new variant
          console.log(
            "➕ [VARIANT INSERT]",
            variant.sku,
            "TempID:",
            variant.id
          );
          const { error } = await supabase.from("ProductVariant").insert({
            id: crypto.randomUUID(),
            productId: productId,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stockQuantity: variant.stockQuantity || 0,
            priceAdjustment: variant.priceAdjustment || 0,
            imageUrl: variant.imageUrl || "",
            status: variant.status || "active",
            createdAt: now,
            updatedAt: now,
          });

          if (error) {
            console.error("❌ [VARIANT INSERT] Error:", error);
            errorMessages.push(`${variant.sku}: ${error.message}`);
          } else {
            successCount++;
          }
        }
      } catch (err: any) {
        errorMessages.push(`${variant.sku}: ${err.message}`);
      }
    }

    // Log to SystemLog (non-blocking)
    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "ProductVariant",
        description: `Lưu ${successCount}/${variants.length} biến thể - ${productId}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    if (errorMessages.length > 0) {
      console.error("❌ [SAVE VARIANTS] Errors:", errorMessages);
      throw new Error(
        `Lỗi lưu ${errorMessages.length}/${
          variants.length
        } biến thể:\n${errorMessages.join("\n")}`
      );
    }

    console.log(
      `✅ [SAVE VARIANTS] Saved ${successCount}/${variants.length} variants`
    );
  },

  deleteVariant: async (variantId: string, user: User) => {
    console.log("🗑️ [DELETE VARIANT] Starting:", variantId);

    // Check if variant is referenced in any orders
    const { data: orderItems } = await supabase
      .from("OrderItem")
      .select("id")
      .eq("variantId", variantId)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      throw new Error(
        "Không thể xóa variant đã có trong đơn hàng. Vui lòng đổi trạng thái thành 'archived' thay vì xóa."
      );
    }

    // Safe to delete
    const { error } = await supabase
      .from("ProductVariant")
      .delete()
      .eq("id", variantId);

    if (error) {
      console.error("❌ [DELETE VARIANT] Error:", error);
      throw new Error(error.message);
    }

    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "DELETE",
        tableName: "ProductVariant",
        recordId: variantId,
        description: `Xóa variant ${variantId}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    console.log("✅ [DELETE VARIANT] Success");
  },

  getSizeGuide: async (productId: string) => {
    const { data: product } = await supabase
      .from("Product")
      .select("sizeGuideId, category:Category(sizeGuideId)")
      .eq("id", productId)
      .single();

    if (!product) return null;

    const sizeGuideId =
      product.sizeGuideId || (product.category as any)?.sizeGuideId;
    if (!sizeGuideId) return null;

    const { data } = await supabase
      .from("SizeGuide")
      .select("*")
      .eq("id", sizeGuideId)
      .single();

    return data;
  },
};
