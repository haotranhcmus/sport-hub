// Base Repository Types and Utilities
import { PrismaClient } from "@prisma/client";
import prisma from "../prisma";

export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface RepositoryOptions {
  tx?: PrismaTransaction;
}

export abstract class BaseRepository {
  protected get db(): PrismaClient | PrismaTransaction {
    return prisma;
  }

  protected getClient(
    options?: RepositoryOptions
  ): PrismaClient | PrismaTransaction {
    return options?.tx || prisma;
  }
}

// Common pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common filter types
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export interface SearchFilter {
  query?: string;
}
