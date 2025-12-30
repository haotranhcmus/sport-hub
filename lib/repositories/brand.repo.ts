// Brand Repository
import { Brand, Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";

export class BrandRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<Brand[]> {
    const client = this.getClient(options);
    return client.brand.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<Brand | null> {
    const client = this.getClient(options);
    return client.brand.findUnique({
      where: { id },
    });
  }

  async findBySlug(
    slug: string,
    options?: RepositoryOptions
  ): Promise<Brand | null> {
    const client = this.getClient(options);
    return client.brand.findUnique({
      where: { slug },
    });
  }

  async create(
    data: Prisma.BrandCreateInput,
    options?: RepositoryOptions
  ): Promise<Brand> {
    const client = this.getClient(options);
    return client.brand.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.BrandUpdateInput,
    options?: RepositoryOptions
  ): Promise<Brand> {
    const client = this.getClient(options);
    return client.brand.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, options?: RepositoryOptions): Promise<Brand> {
    const client = this.getClient(options);
    return client.brand.delete({
      where: { id },
    });
  }
}

export const brandRepository = new BrandRepository();
