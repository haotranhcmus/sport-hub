// Supplier Repository
import { Supplier, Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";

export class SupplierRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<Supplier[]> {
    const client = this.getClient(options);
    return client.supplier.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findActive(options?: RepositoryOptions): Promise<Supplier[]> {
    const client = this.getClient(options);
    return client.supplier.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<Supplier | null> {
    const client = this.getClient(options);
    return client.supplier.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.SupplierCreateInput,
    options?: RepositoryOptions
  ): Promise<Supplier> {
    const client = this.getClient(options);
    return client.supplier.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.SupplierUpdateInput,
    options?: RepositoryOptions
  ): Promise<Supplier> {
    const client = this.getClient(options);
    return client.supplier.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: string,
    options?: RepositoryOptions
  ): Promise<Supplier> {
    const client = this.getClient(options);
    return client.supplier.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string, options?: RepositoryOptions): Promise<Supplier> {
    const client = this.getClient(options);
    return client.supplier.delete({
      where: { id },
    });
  }
}

export const supplierRepository = new SupplierRepository();
