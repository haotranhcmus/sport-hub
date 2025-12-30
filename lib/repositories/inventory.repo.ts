// Inventory Repositories (StockEntry, StockIssue, Stocktake)
import { StockEntry, StockIssue, Stocktake, Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";

// ============================================================================
// Stock Entry Repository
// ============================================================================

export class StockEntryRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<StockEntry[]> {
    const client = this.getClient(options);
    return client.stockEntry.findMany({
      include: {
        supplier: true,
      },
      orderBy: { date: "desc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<StockEntry | null> {
    const client = this.getClient(options);
    return client.stockEntry.findUnique({
      where: { id },
      include: {
        supplier: true,
      },
    });
  }

  async findByCode(
    code: string,
    options?: RepositoryOptions
  ): Promise<StockEntry | null> {
    const client = this.getClient(options);
    return client.stockEntry.findUnique({
      where: { code },
      include: {
        supplier: true,
      },
    });
  }

  async create(
    data: Prisma.StockEntryCreateInput,
    options?: RepositoryOptions
  ): Promise<StockEntry> {
    const client = this.getClient(options);
    return client.stockEntry.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.StockEntryUpdateInput,
    options?: RepositoryOptions
  ): Promise<StockEntry> {
    const client = this.getClient(options);
    return client.stockEntry.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: string,
    options?: RepositoryOptions
  ): Promise<StockEntry> {
    const client = this.getClient(options);
    return client.stockEntry.update({
      where: { id },
      data: { status },
    });
  }
}

// ============================================================================
// Stock Issue Repository
// ============================================================================

export class StockIssueRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<StockIssue[]> {
    const client = this.getClient(options);
    return client.stockIssue.findMany({
      orderBy: { date: "desc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<StockIssue | null> {
    const client = this.getClient(options);
    return client.stockIssue.findUnique({
      where: { id },
    });
  }

  async findByCode(
    code: string,
    options?: RepositoryOptions
  ): Promise<StockIssue | null> {
    const client = this.getClient(options);
    return client.stockIssue.findUnique({
      where: { code },
    });
  }

  async create(
    data: Prisma.StockIssueCreateInput,
    options?: RepositoryOptions
  ): Promise<StockIssue> {
    const client = this.getClient(options);
    return client.stockIssue.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.StockIssueUpdateInput,
    options?: RepositoryOptions
  ): Promise<StockIssue> {
    const client = this.getClient(options);
    return client.stockIssue.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: string,
    options?: RepositoryOptions
  ): Promise<StockIssue> {
    const client = this.getClient(options);
    return client.stockIssue.update({
      where: { id },
      data: { status },
    });
  }
}

// ============================================================================
// Stocktake Repository
// ============================================================================

export class StocktakeRepository extends BaseRepository {
  async findAll(options?: RepositoryOptions): Promise<Stocktake[]> {
    const client = this.getClient(options);
    return client.stocktake.findMany({
      orderBy: { date: "desc" },
    });
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<Stocktake | null> {
    const client = this.getClient(options);
    return client.stocktake.findUnique({
      where: { id },
    });
  }

  async findByCode(
    code: string,
    options?: RepositoryOptions
  ): Promise<Stocktake | null> {
    const client = this.getClient(options);
    return client.stocktake.findUnique({
      where: { code },
    });
  }

  async create(
    data: Prisma.StocktakeCreateInput,
    options?: RepositoryOptions
  ): Promise<Stocktake> {
    const client = this.getClient(options);
    return client.stocktake.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.StocktakeUpdateInput,
    options?: RepositoryOptions
  ): Promise<Stocktake> {
    const client = this.getClient(options);
    return client.stocktake.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: string,
    options?: RepositoryOptions
  ): Promise<Stocktake> {
    const client = this.getClient(options);
    return client.stocktake.update({
      where: { id },
      data: { status },
    });
  }
}

// Export singleton instances
export const stockEntryRepository = new StockEntryRepository();
export const stockIssueRepository = new StockIssueRepository();
export const stocktakeRepository = new StocktakeRepository();
