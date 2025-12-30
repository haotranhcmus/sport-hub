// Repository Index - Central export point for all repositories
export * from "./base.repo";
export * from "./product.repo";
export * from "./category.repo";
export * from "./brand.repo";
export * from "./order.repo";
export * from "./user.repo";
export * from "./supplier.repo";
export * from "./inventory.repo";
export * from "./system.repo";

// Re-export singleton instances for convenience
import { productRepository } from "./product.repo";
import { categoryRepository } from "./category.repo";
import { brandRepository } from "./brand.repo";
import { orderRepository } from "./order.repo";
import { userRepository } from "./user.repo";
import { supplierRepository } from "./supplier.repo";
import {
  stockEntryRepository,
  stockIssueRepository,
  stocktakeRepository,
} from "./inventory.repo";
import {
  productAttributeRepository,
  sizeGuideRepository,
  systemConfigRepository,
  systemLogRepository,
} from "./system.repo";

export const repositories = {
  product: productRepository,
  category: categoryRepository,
  brand: brandRepository,
  order: orderRepository,
  user: userRepository,
  supplier: supplierRepository,
  stockEntry: stockEntryRepository,
  stockIssue: stockIssueRepository,
  stocktake: stocktakeRepository,
  productAttribute: productAttributeRepository,
  sizeGuide: sizeGuideRepository,
  systemConfig: systemConfigRepository,
  systemLog: systemLogRepository,
};

export default repositories;
