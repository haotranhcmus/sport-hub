// Product Service
import { supabase } from "../lib/supabase";
import { ProductStatus } from "../constants/enums";
import { Product, User, CartItem } from "../types";
import { createSystemLog, delay } from "./shared.service";

export const productService = {
  list: async (): Promise<Product[]> => {
    try {
      // ✅ OPTIMIZED: Only select needed fields to reduce data transfer
      const { data, error } = await supabase
        .from("Product")
        .select(
          `
          id,
          productCode,
          name,
          slug,
          description,
          basePrice,
          promotionalPrice,
          thumbnailUrl,
          imageUrls,
          status,
          categoryId,
          brandId,
          totalSold,
          reviewCount,
          averageRating,
          allowReturn,
          freeShipping,
          attributes,
          createdAt,
          category:Category(id, name, slug),
          brand:Brand(id, name, slug),
          variants:ProductVariant(id, sku, color, size, stockQuantity, status)
        `
        )
        .eq("status", "ACTIVE") // ✅ Filter at database level
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("❌ Error fetching products:", error);
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
    try {
      // Kiểm tra từng item trong giỏ hàng
      for (const item of cartItems) {
        const { data: variant, error } = await supabase
          .from("ProductVariant")
          .select("id, stockQuantity, product:Product(name)")
          .eq("id", item.variantId)
          .single();

        if (error || !variant) {
          return {
            valid: false,
            message: `Không tìm thấy sản phẩm trong hệ thống`,
          };
        }

        // Kiểm tra số lượng tồn kho
        if (variant.stockQuantity < item.quantity) {
          return {
            valid: false,
            message: `Sản phẩm "${
              variant.product?.name || "Không xác định"
            }" chỉ còn ${variant.stockQuantity} trong kho, không đủ ${
              item.quantity
            } sản phẩm`,
          };
        }
      }

      return { valid: true, message: "" };
    } catch (err: any) {
      console.error("❌ [VALIDATE STOCK] Error:", err);
      return {
        valid: false,
        message: "Lỗi kiểm tra tồn kho: " + err.message,
      };
    }
  },

  deductStock: async (items: any[]) => {
    try {
      // Sử dụng database transaction để đảm bảo tính nguyên tử
      // QUAN TRỌNG: Tất cả updates phải thành công hoặc tất cả rollback

      for (const item of items) {
        // Bước 1: Kiểm tra và lock row (SELECT FOR UPDATE simulation)
        const { data: currentVariant, error: fetchError } = await supabase
          .from("ProductVariant")
          .select("id, stockQuantity, product:Product(name)")
          .eq("id", item.variantId)
          .single();

        if (fetchError || !currentVariant) {
          throw new Error(`Không tìm thấy variant: ${item.variantId}`);
        }

        // Bước 2: Kiểm tra tồn kho trước khi trừ
        if (currentVariant.stockQuantity < item.quantity) {
          throw new Error(
            `Không đủ hàng: "${
              currentVariant.product?.name || "Không xác định"
            }" (Còn: ${currentVariant.stockQuantity}, Cần: ${item.quantity})`
          );
        }

        // Bước 3: Trừ stock
        const newStock = currentVariant.stockQuantity - item.quantity;
        const { error: updateError } = await supabase
          .from("ProductVariant")
          .update({
            stockQuantity: newStock,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", item.variantId)
          .eq("stockQuantity", currentVariant.stockQuantity); // Optimistic locking

        if (updateError) {
          throw new Error(`Lỗi cập nhật tồn kho: ${updateError.message}`);
        }

        console.log(
          `✅ [DEDUCT STOCK] Variant ${item.variantId}: ${currentVariant.stockQuantity} → ${newStock}`
        );
      }

      return { success: true, message: "Đã trừ kho thành công" };
    } catch (err: any) {
      console.error("❌ [DEDUCT STOCK] Error:", err);
      return {
        success: false,
        message: err.message || "Lỗi trừ kho",
      };
    }
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
      modelCode: productData.modelCode || null,
      name: productData.name,
      slug,
      description: productData.description || "Chưa có mô tả",
      costPrice: productData.costPrice ? Number(productData.costPrice) : null,
      basePrice: Number(productData.basePrice) || 0,
      promotionalPrice: productData.promotionalPrice
        ? Number(productData.promotionalPrice)
        : null,
      thumbnailUrl: productData.thumbnailUrl || "",
      imageUrls: Array.isArray(productData.imageUrls)
        ? productData.imageUrls
        : [], // ✅ Ensure array
      status: productData.status || "ACTIVE",
      categoryId: productData.categoryId,
      brandId: productData.brandId,
      totalSold: 0,
      allowReturn: productData.allowReturn ?? true,
      returnPeriod: productData.returnPeriod || 7,
      freeShipping: productData.freeShipping || false,
      attributes: productData.attributes || {},
      // ✅ FIX: Only set sizeGuideId if it's a valid non-empty string
      // Prevent foreign key constraint violation
      sizeGuideId:
        productData.sizeGuideId && productData.sizeGuideId.trim() !== ""
          ? productData.sizeGuideId
          : null,
      condition: productData.condition || null,
      createdAt: now,
      updatedAt: now,
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
        actionType: "CREATE",
        targetId: data.id,
        description: `Tạo sản phẩm: ${productData.name}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    return data;
  },

  update: async (id: string, updates: any, user: User): Promise<Product> => {
    // ✅ DEBUG: Log imageUrls before update
    console.log("🔍 Product update data:", {
      id,
      imageUrls: updates.imageUrls,
      imageUrlsType: typeof updates.imageUrls,
      imageUrlsLength: updates.imageUrls?.length,
    });

    // ✅ FIX: Ensure imageUrls is properly formatted as array
    const imageUrls = Array.isArray(updates.imageUrls) ? updates.imageUrls : [];

    // ✅ FIX: Clean sizeGuideId to prevent foreign key constraint violation
    const cleanUpdates = {
      ...updates,
      imageUrls, // Explicitly set imageUrls as array
      sizeGuideId:
        updates.sizeGuideId && updates.sizeGuideId.trim() !== ""
          ? updates.sizeGuideId
          : null,
      updatedAt: new Date().toISOString(),
    };

    console.log("📤 Sending to Supabase:", {
      imageUrls: cleanUpdates.imageUrls,
      imageUrlsIsArray: Array.isArray(cleanUpdates.imageUrls),
    });

    // ✅ IMPORTANT: Supabase needs explicit select to return array columns
    const { data, error } = await supabase
      .from("Product")
      .update(cleanUpdates)
      .eq("id", id)
      .select(
        `
        *,
        brand:Brand(*),
        category:Category(*),
        sizeGuide:SizeGuide(*)
      `
      )
      .single();

    if (error) {
      console.error("❌ Supabase update error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Updated product:", {
      id: data.id,
      imageUrls: data.imageUrls,
      imageUrlsLength: data.imageUrls?.length,
    });

    // Log system activity
    await supabase.from("SystemLog").insert(
      createSystemLog({
        actionType: "UPDATE",
        targetId: id,
        description: "Cập nhật sản phẩm",
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    return data as Product;
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

    // ✅ Validate stock quantity > 0
    const invalidStock = variants.filter(
      (v) => !v.stockQuantity || v.stockQuantity <= 0
    );
    if (invalidStock.length > 0) {
      throw new Error(
        `Tồn kho phải lớn hơn 0 cho các SKU: ${invalidStock
          .map((v) => `${v.sku} (${v.stockQuantity || 0})`)
          .join(", ")}`
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
              imageUrl: variant.imageUrl || null,
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
            stockQuantity:
              variant.stockQuantity > 0 ? variant.stockQuantity : 1,
            priceAdjustment: variant.priceAdjustment || 0,
            imageUrl: variant.imageUrl || null,
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
        actionType: "UPDATE",
        targetId: productId,
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
        actionType: "DELETE",
        targetId: variantId,
        description: `Xóa variant ${variantId}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    console.log("✅ [DELETE VARIANT] Success");
  },

  delete: async (productId: string, user: User) => {
    console.log("🗑️ [DELETE PRODUCT] Starting for:", productId);

    // Check if product has orders
    const { data: orderItems } = await supabase
      .from("OrderItem")
      .select("id")
      .eq("productId", productId);

    if (orderItems && orderItems.length > 0) {
      throw new Error(
        `Không thể xóa! Sản phẩm này có ${orderItems.length} đơn hàng. Chỉ có thể ẩn sản phẩm (đổi trạng thái thành INACTIVE).`
      );
    }

    // Delete variants first (CASCADE should handle this, but explicit is safer)
    const { error: variantsError } = await supabase
      .from("ProductVariant")
      .delete()
      .eq("productId", productId);

    if (variantsError) {
      console.error("❌ [DELETE PRODUCT] Variants error:", variantsError);
      throw new Error(`Lỗi xóa variants: ${variantsError.message}`);
    }

    // Delete reviews (CASCADE should handle this too)
    const { error: reviewsError } = await supabase
      .from("Review")
      .delete()
      .eq("productId", productId);

    if (reviewsError) {
      console.error("❌ [DELETE PRODUCT] Reviews error:", reviewsError);
      // Continue anyway, reviews are optional
    }

    // Delete product
    const { error } = await supabase
      .from("Product")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("❌ [DELETE PRODUCT] Error:", error);
      throw new Error(error.message);
    }

    // Log deletion
    await supabase.from("SystemLog").insert(
      createSystemLog({
        actionType: "DELETE",
        targetId: productId,
        description: `Xóa sản phẩm ${productId}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    console.log("✅ [DELETE PRODUCT] Success");
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
