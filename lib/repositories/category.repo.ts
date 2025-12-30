// Category Repository
import { Category, Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";

export type CategoryWithRelations = Category & {
  parent?: Category | null;
  children?: Category[];
  sizeGuide?: any;
};

export class CategoryRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<CategoryWithRelations[]> {
    const client = this.getClient(options);
    return client.category.findMany({
      include: {
        parent: true,
        children: true,
        sizeGuide: true,
      },
      orderBy: { name: "asc" },
    }) as Promise<CategoryWithRelations[]>;
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<CategoryWithRelations | null> {
    const client = this.getClient(options);
    return client.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        sizeGuide: true,
      },
    }) as Promise<CategoryWithRelations | null>;
  }

  async findBySlug(
    slug: string,
    options?: RepositoryOptions
  ): Promise<CategoryWithRelations | null> {
    const client = this.getClient(options);
    return client.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        sizeGuide: true,
      },
    }) as Promise<CategoryWithRelations | null>;
  }

  async create(
    data: Prisma.CategoryCreateInput,
    options?: RepositoryOptions
  ): Promise<Category> {
    const client = this.getClient(options);
    return client.category.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
    options?: RepositoryOptions
  ): Promise<Category> {
    const client = this.getClient(options);
    return client.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, options?: RepositoryOptions): Promise<Category> {
    const client = this.getClient(options);
    return client.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
