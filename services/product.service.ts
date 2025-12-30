// Product Service
import { supabase } from "../lib/supabase";
import { ProductStatus } from "../constants/enums";
import { Product, User, CartItem } from "../types";
import { createSystemLog, delay } from "./shared.service";

export const productService = {
  list: async (): Promise<Product[]> => {
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

    if (error) throw new Error(error.message);
    return data || [];
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
    const slug =
      productData.slug || productData.name.toLowerCase().replace(/ /g, "-");

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
      status: productData.status,
      categoryId: productData.categoryId,
      brandId: productData.brandId,
      allowReturn: productData.allowReturn ?? true,
      returnPeriod: productData.returnPeriod || 7,
      freeShipping: productData.freeShipping || false,
      attributes: productData.attributes || {},
      sizeGuideId: productData.sizeGuideId || null,
      condition: productData.condition || null,
      createdAt: now,
      updatedAt: now,
    };

    const { data, error } = await supabase
      .from("Product")
      .insert(cleanData)
      .select()
      .single();

    if (error) {
      console.error("Product create error:", error);
      throw new Error(error.message);
    }

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
    // Delete existing variants
    await supabase.from("ProductVariant").delete().eq("productId", productId);

    // Insert new variants
    if (variants.length > 0) {
      const now = new Date().toISOString();
      const { error } = await supabase.from("ProductVariant").insert(
        variants.map((v) => ({
          ...v,
          productId,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        }))
      );
      if (error) throw new Error(error.message);
    }

    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "ProductVariant",
        description: `Cập nhật biến thể sản phẩm ${productId}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );
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
