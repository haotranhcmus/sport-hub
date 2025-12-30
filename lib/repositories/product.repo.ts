// Product Repository
import { Product, ProductVariant, Review, Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";
import { ProductStatus } from "../../constants/enums";

export type ProductWithRelations = Product & {
  category?: any;
  brand?: any;
  variants: ProductVariant[];
  reviews?: Review[];
  sizeGuide?: any;
};

export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class ProductRepository extends BaseRepository {
  async findAll(
    filters?: ProductFilters,
    options?: RepositoryOptions
  ): Promise<ProductWithRelations[]> {
    const client = this.getClient(options);
    const where: Prisma.ProductWhereInput = {};

    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.brandId) where.brandId = filters.brandId;
    if (filters?.status) where.status = filters.status as any;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { productCode: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters?.minPrice || filters?.maxPrice) {
      where.basePrice = {};
      if (filters.minPrice) where.basePrice.gte = filters.minPrice;
      if (filters.maxPrice) where.basePrice.lte = filters.maxPrice;
    }

    return client.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: true,
        sizeGuide: true,
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<ProductWithRelations[]>;
  }

  async findBySlug(
    slug: string,
    options?: RepositoryOptions
  ): Promise<ProductWithRelations | null> {
    const client = this.getClient(options);
    return client.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: {
          orderBy: { createdAt: "desc" },
        },
        sizeGuide: true,
      },
    }) as Promise<ProductWithRelations | null>;
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<ProductWithRelations | null> {
    const client = this.getClient(options);
    return client.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: true,
        sizeGuide: true,
      },
    }) as Promise<ProductWithRelations | null>;
  }

  async findByCategory(
    categoryId: string,
    limit?: number,
    options?: RepositoryOptions
  ): Promise<ProductWithRelations[]> {
    const client = this.getClient(options);
    return client.product.findMany({
      where: { categoryId, status: "ACTIVE" },
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: true,
      },
      take: limit,
      orderBy: { totalSold: "desc" },
    }) as Promise<ProductWithRelations[]>;
  }

  async create(
    data: Prisma.ProductCreateInput,
    options?: RepositoryOptions
  ): Promise<Product> {
    const client = this.getClient(options);
    return client.product.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.ProductUpdateInput,
    options?: RepositoryOptions
  ): Promise<Product> {
    const client = this.getClient(options);
    return client.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, options?: RepositoryOptions): Promise<Product> {
    const client = this.getClient(options);
    // Soft delete by setting status to ARCHIVED
    return client.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }

  async incrementSold(
    id: string,
    quantity: number,
    options?: RepositoryOptions
  ): Promise<void> {
    const client = this.getClient(options);
    await client.product.update({
      where: { id },
      data: {
        totalSold: { increment: quantity },
      },
    });
  }

  // Variant operations
  async upsertVariants(
    productId: string,
    variants: Prisma.ProductVariantCreateInput[],
    options?: RepositoryOptions
  ): Promise<void> {
    const client = this.getClient(options);

    // Delete existing variants
    await client.productVariant.deleteMany({
      where: { productId },
    });

    // Create new variants
    if (variants.length > 0) {
      await client.productVariant.createMany({
        data: variants.map((v) => ({
          ...v,
          product: undefined, // Remove relation from createMany
          productId,
        })) as any,
      });
    }
  }

  async updateVariantStock(
    variantId: string,
    quantity: number,
    options?: RepositoryOptions
  ): Promise<void> {
    const client = this.getClient(options);
    await client.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: quantity },
    });
  }

  async deductVariantStock(
    variantId: string,
    quantity: number,
    options?: RepositoryOptions
  ): Promise<void> {
    const client = this.getClient(options);
    await client.productVariant.update({
      where: { id: variantId },
      data: {
        stockQuantity: { decrement: quantity },
      },
    });
  }

  // Review operations
  async addReview(
    data: Prisma.ReviewCreateInput,
    options?: RepositoryOptions
  ): Promise<Review> {
    const client = this.getClient(options);
    return client.review.create({
      data,
    });
  }

  async getReviews(
    productId: string,
    options?: RepositoryOptions
  ): Promise<Review[]> {
    const client = this.getClient(options);
    return client.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const productRepository = new ProductRepository();
