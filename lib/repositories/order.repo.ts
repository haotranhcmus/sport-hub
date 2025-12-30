// Order Repository
import { Order, OrderItem, Prisma } from "@prisma/client";
import { BaseRepository, RepositoryOptions } from "./base.repo";
import { OrderStatus } from "../../constants/enums";

export type OrderWithRelations = Order & {
  user?: any;
  items: OrderItem[];
};

export interface OrderFilters {
  status?: OrderStatus;
  userId?: string;
  customerPhone?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class OrderRepository extends BaseRepository {
  async findAll(
    filters?: OrderFilters,
    options?: RepositoryOptions
  ): Promise<OrderWithRelations[]> {
    const client = this.getClient(options);
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) where.status = filters.status as any;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.customerPhone) where.customerPhone = filters.customerPhone;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    return client.order.findMany({
      where,
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<OrderWithRelations[]>;
  }

  async findById(
    id: string,
    options?: RepositoryOptions
  ): Promise<OrderWithRelations | null> {
    const client = this.getClient(options);
    return client.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
      },
    }) as Promise<OrderWithRelations | null>;
  }

  async findByOrderCode(
    orderCode: string,
    options?: RepositoryOptions
  ): Promise<OrderWithRelations | null> {
    const client = this.getClient(options);
    return client.order.findUnique({
      where: { orderCode },
      include: {
        user: true,
        items: true,
      },
    }) as Promise<OrderWithRelations | null>;
  }

  async findByUserPhoneAndCode(
    phone: string,
    orderCode: string,
    options?: RepositoryOptions
  ): Promise<OrderWithRelations | null> {
    const client = this.getClient(options);
    return client.order.findFirst({
      where: {
        customerPhone: phone,
        orderCode: orderCode,
      },
      include: {
        user: true,
        items: true,
      },
    }) as Promise<OrderWithRelations | null>;
  }

  async findByStatus(
    status: OrderStatus,
    options?: RepositoryOptions
  ): Promise<OrderWithRelations[]> {
    const client = this.getClient(options);
    return client.order.findMany({
      where: { status: status as any },
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<OrderWithRelations[]>;
  }

  async create(
    data: Prisma.OrderCreateInput,
    options?: RepositoryOptions
  ): Promise<Order> {
    const client = this.getClient(options);
    return client.order.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.OrderUpdateInput,
    options?: RepositoryOptions
  ): Promise<Order> {
    const client = this.getClient(options);
    return client.order.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    options?: RepositoryOptions
  ): Promise<Order> {
    const client = this.getClient(options);
    return client.order.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: string,
    options?: RepositoryOptions
  ): Promise<Order> {
    const client = this.getClient(options);
    return client.order.update({
      where: { id },
      data: { paymentStatus: paymentStatus as any },
    });
  }

  async updateReturnInfo(
    id: string,
    returnInfo: any,
    options?: RepositoryOptions
  ): Promise<Order> {
    const client = this.getClient(options);
    return client.order.update({
      where: { id },
      data: { returnInfo },
    });
  }

  async updateShippingInfo(
    id: string,
    info: {
      courierName: string;
      trackingNumber: string;
      deliveryPerson: string;
    },
    options?: RepositoryOptions
  ): Promise<Order> {
    const client = this.getClient(options);
    return client.order.update({
      where: { id },
      data: {
        courierName: info.courierName,
        trackingNumber: info.trackingNumber,
        deliveryPerson: info.deliveryPerson,
      },
    });
  }

  // OrderItem operations
  async createOrderWithItems(
    orderData: Prisma.OrderCreateInput,
    items: Prisma.OrderItemCreateInput[],
    options?: RepositoryOptions
  ): Promise<Order> {
    const client = this.getClient(options);
    return client.order.create({
      data: {
        ...orderData,
        items: {
          create: items as any,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async updateItemReview(
    orderId: string,
    productId: string,
    reviewInfo: any,
    options?: RepositoryOptions
  ): Promise<void> {
    const client = this.getClient(options);
    const order = await client.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Order not found");

    const item = order.items.find((i: any) => i.productId === productId);
    if (!item) throw new Error("Order item not found");

    await client.orderItem.update({
      where: { id: item.id },
      data: {
        isReviewed: true,
        reviewInfo,
      },
    });
  }

  async delete(id: string, options?: RepositoryOptions): Promise<Order> {
    const client = this.getClient(options);
    return client.order.delete({
      where: { id },
    });
  }
}

export const orderRepository = new OrderRepository();
