// System Repositories (Attributes, SizeGuides, SystemConfig, SystemLog)
import {
  ProductAttribute,
  SizeGuide,
  SystemConfig,
  SystemLog,
  Prisma,
} from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";

// ============================================================================
// Product Attribute Repository
// ============================================================================

export class ProductAttributeRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<ProductAttribute[]> {
    const client = this.getClient(options);
    return client.productAttribute.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<ProductAttribute | null> {
    const client = this.getClient(options);
    return client.productAttribute.findUnique({
      where: { id },
    });
  }

  async findByCode(
    code: string,
    options?: RepositoryOptions
  ): Promise<ProductAttribute | null> {
    const client = this.getClient(options);
    return client.productAttribute.findUnique({
      where: { code },
    });
  }

  async create(
    data: Prisma.ProductAttributeCreateInput,
    options?: RepositoryOptions
  ): Promise<ProductAttribute> {
    const client = this.getClient(options);
    return client.productAttribute.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.ProductAttributeUpdateInput,
    options?: RepositoryOptions
  ): Promise<ProductAttribute> {
    const client = this.getClient(options);
    return client.productAttribute.update({
      where: { id },
      data,
    });
  }

  async delete(
    id: string,
    options?: RepositoryOptions
  ): Promise<ProductAttribute> {
    const client = this.getClient(options);
    return client.productAttribute.delete({
      where: { id },
    });
  }
}

// ============================================================================
// Size Guide Repository
// ============================================================================

export class SizeGuideRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<SizeGuide[]> {
    const client = this.getClient(options);
    return client.sizeGuide.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<SizeGuide | null> {
    const client = this.getClient(options);
    return client.sizeGuide.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.SizeGuideCreateInput,
    options?: RepositoryOptions
  ): Promise<SizeGuide> {
    const client = this.getClient(options);
    return client.sizeGuide.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.SizeGuideUpdateInput,
    options?: RepositoryOptions
  ): Promise<SizeGuide> {
    const client = this.getClient(options);
    return client.sizeGuide.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, options?: RepositoryOptions): Promise<SizeGuide> {
    const client = this.getClient(options);
    return client.sizeGuide.delete({
      where: { id },
    });
  }
}

// ============================================================================
// System Config Repository
// ============================================================================

export class SystemConfigRepository extends BaseRepository {
  async get(options?: RepositoryOptions): Promise<SystemConfig | null> {
    const client = this.getClient(options);
    const configs = await client.systemConfig.findMany({
      take: 1,
      orderBy: { createdAt: "desc" },
    });
    return configs[0] || null;
  }

  async upsert(
    data: Prisma.SystemConfigCreateInput,
    options?: RepositoryOptions
  ): Promise<SystemConfig> {
    const client = this.getClient(options);
    const existing = await this.get(options);

    if (existing) {
      return client.systemConfig.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return client.systemConfig.create({
        data,
      });
    }
  }

  async update(
    id: string,
    data: Prisma.SystemConfigUpdateInput,
    options?: RepositoryOptions
  ): Promise<SystemConfig> {
    const client = this.getClient(options);
    return client.systemConfig.update({
      where: { id },
      data,
    });
  }
}

// ============================================================================
// System Log Repository
// ============================================================================

export class SystemLogRepository extends BaseRepository {
  async findAll(
    limit?: number,
    options?: RepositoryOptions
  ): Promise<SystemLog[]> {
    const client = this.getClient(options);
    return client.systemLog.findMany({
      include: {
        actor: true,
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async findByActor(
    actorId: string,
    limit?: number,
    options?: RepositoryOptions
  ): Promise<SystemLog[]> {
    const client = this.getClient(options);
    return client.systemLog.findMany({
      where: { actorId },
      include: {
        actor: true,
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async create(
    data: Prisma.SystemLogCreateInput,
    options?: RepositoryOptions
  ): Promise<SystemLog> {
    const client = this.getClient(options);
    return client.systemLog.create({
      data,
    });
  }

  async deleteOlderThan(
    date: Date,
    options?: RepositoryOptions
  ): Promise<number> {
    const client = this.getClient(options);
    const result = await client.systemLog.deleteMany({
      where: {
        timestamp: {
          lt: date,
        },
      },
    });
    return result.count;
  }
}

// Export singleton instances
export const productAttributeRepository = new ProductAttributeRepository();
export const sizeGuideRepository = new SizeGuideRepository();
export const systemConfigRepository = new SystemConfigRepository();
export const systemLogRepository = new SystemLogRepository();
