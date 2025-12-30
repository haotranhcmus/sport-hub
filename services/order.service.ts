// Order Service
import { supabase } from "../lib/supabase";
import { OrderStatus } from "../constants/enums";
import { Order, User, ReturnRequestData, StockIssue } from "../types";

// Circular dependency workaround - will be injected
let returnRequestService: any;

export const setReturnRequestService = (service: any) => {
  returnRequestService = service;
};

export const orderService = {
  list: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
          *,
          items:OrderItem(*)
        `
      )
      .order("createdAt", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getDetail: async (code: string): Promise<Order | null> => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
          *,
          items:OrderItem(*),
          returnRequests:ReturnRequest(*)
        `
      )
      .or(`orderCode.eq.${code},id.eq.${code}`)
      .single();

    if (error) return null;
    return data;
  },

  getPendingIssueOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
          *,
          items:OrderItem(*)
        `
      )
      .eq("status", OrderStatus.PACKING);

    if (error) throw new Error(error.message);
    return data || [];
  },

  trackOrder: async (code: string, phone: string): Promise<Order | null> => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
          *,
          items:OrderItem(*)
        `
      )
      .or(`orderCode.eq.${code},id.eq.${code}`)
      .eq("customerPhone", phone)
      .single();

    if (error) return null;
    return data;
  },

  create: async (orderData: Order): Promise<Order> => {
    const { items, ...orderFields } = orderData as any;
    const now = new Date().toISOString();

    console.log("📦 [ORDER CREATE] Bắt đầu tạo đơn hàng:", {
      orderCode: orderData.orderCode,
      customerName: orderData.customerName,
      totalAmount: orderData.totalAmount,
      itemCount: items?.length || 0,
    });

    const orderInsertData = {
      ...orderFields,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    console.log("📝 [ORDER CREATE] Data gửi đến Order table:", orderInsertData);

    const { data: order, error: orderError } = await supabase
      .from("Order")
      .insert(orderInsertData)
      .select()
      .single();

    if (orderError) {
      console.error("❌ [ORDER CREATE] Lỗi khi tạo Order:", {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
      });
      throw new Error(
        `Lỗi tạo đơn hàng: ${orderError.message}${
          orderError.hint ? " - " + orderError.hint : ""
        }`
      );
    }

    console.log("✅ [ORDER CREATE] Đơn hàng đã tạo:", order.id);

    if (items && items.length > 0) {
      const orderItemsData = items.map((item: any) => ({
        ...item,
        orderId: order.id,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }));

      console.log(
        "📝 [ORDER CREATE] Tạo OrderItems:",
        orderItemsData.length,
        "items"
      );

      const { error: itemsError } = await supabase
        .from("OrderItem")
        .insert(orderItemsData);

      if (itemsError) {
        console.error("❌ [ORDER CREATE] Lỗi khi tạo OrderItems:", {
          code: itemsError.code,
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
        });
        throw new Error(
          `Lỗi tạo chi tiết đơn hàng: ${itemsError.message}${
            itemsError.hint ? " - " + itemsError.hint : ""
          }`
        );
      }

      console.log("✅ [ORDER CREATE] OrderItems đã tạo thành công");
    }

    console.log("🎉 [ORDER CREATE] Hoàn tất đơn hàng:", order.orderCode);
    return order;
  },

  updateOrderStatus: async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) return false;

    const { error } = await supabase
      .from("Order")
      .update({ status: newStatus })
      .eq("id", order.id);

    if (error) throw new Error(error.message);
    return true;
  },

  cancelOrder: async (orderId: string, reason: string): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) return false;

    const notes = (order.customerNotes || "") + "\\nLý do hủy: " + reason;

    const { error } = await supabase
      .from("Order")
      .update({
        status: OrderStatus.CANCELLED,
        customerNotes: notes,
      })
      .eq("id", order.id);

    if (error) throw new Error(error.message);
    return true;
  },

  requestRefundAndCancel: async (
    orderId: string,
    reason: string,
    bankInfo: any
  ): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) return false;

    const { error } = await supabase
      .from("Order")
      .update({
        status: OrderStatus.CANCELLED,
        paymentStatus: "PENDING_REFUND",
        returnInfo: {
          requestId: `REF-${Date.now().toString().slice(-4)}`,
          reason,
          evidenceImages: [],
          status: "pending",
          bankInfo,
        },
      })
      .eq("id", order.id);

    if (error) throw new Error(error.message);
    return true;
  },

  confirmRefund: async (orderId: string): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) return false;

    const { error } = await supabase
      .from("Order")
      .update({ paymentStatus: "REFUNDED" })
      .eq("id", order.id);

    if (error) throw new Error(error.message);
    return true;
  },

  // DEPRECATED: Use returnRequestService.create() instead
  submitReturnRequest: async (
    returnData: ReturnRequestData
  ): Promise<boolean> => {
    console.warn(
      "⚠️ orderService.submitReturnRequest is DEPRECATED. Use returnRequestService.create() instead."
    );

    // Forward to new API
    if (returnRequestService) {
      await returnRequestService.create(returnData);
    }
    return true;
  },

  cancelReturnRequest: async (orderId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("Order")
      .update({
        status: OrderStatus.COMPLETED,
        returnInfo: null,
      })
      .eq("id", orderId);

    if (error) throw new Error(error.message);
    return true;
  },

  updateShippingInfo: async (
    orderId: string,
    info: {
      courierName: string;
      trackingNumber: string;
      deliveryPerson: string;
    },
    user: User
  ): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) return false;

    const { error } = await supabase
      .from("Order")
      .update({
        status: OrderStatus.SHIPPING,
        courierName: info.courierName,
        trackingNumber: info.trackingNumber,
        deliveryPerson: info.deliveryPerson,
      })
      .eq("id", order.id);

    if (error) throw new Error(error.message);

    // Create stock issue
    const stockIssue: StockIssue = {
      id: `iss-${Date.now()}`,
      code: `PXK-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`,
      date: new Date().toISOString(),
      status: "completed",
      warehouseName: "Kho Tổng HCM",
      customerName: order.customerName,
      courierName: info.courierName,
      trackingNumber: info.trackingNumber,
      deliveryPerson: info.deliveryPerson,
      items: order.items.map((i, index) => ({
        id: `it-${Date.now()}-${index}`,
        variantId: i.productId,
        productName: i.productName,
        variantName: `${i.color || "-"}/${i.size || "-"}`,
        sku: `SKU-${i.productId.slice(-5).toUpperCase()}`,
        quantity: i.quantity,
        orderCode: order.orderCode,
      })),
      actorName: user.fullName,
      type: "sales" as const,
      totalAmount: order.totalAmount,
      orderCodes: [order.orderCode],
    } as StockIssue;

    const stockIssueWithTimestamps = {
      ...stockIssue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await supabase.from("StockIssue").insert(stockIssueWithTimestamps);

    return true;
  },

  completeOrder: async (orderId: string): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) return false;

    const { error } = await supabase
      .from("Order")
      .update({
        status: OrderStatus.COMPLETED,
        deliveryDate: new Date().toISOString(),
        paymentStatus:
          order.paymentMethod === "COD" ? "PAID" : order.paymentStatus,
      })
      .eq("id", order.id);

    if (error) throw new Error(error.message);
    return true;
  },

  failOrder: async (orderId: string): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) return false;

    const { error } = await supabase
      .from("Order")
      .update({ status: OrderStatus.DELIVERY_FAILED })
      .eq("id", order.id);

    if (error) throw new Error(error.message);
    return true;
  },

  markAsReviewed: async (
    orderCode: string,
    productId: string,
    info: any
  ): Promise<boolean> => {
    console.log("📊 orderService.markAsReviewed called:", {
      orderCode,
      productId,
      info,
    });

    // Step 1: Find the order
    const order = await orderService.getDetail(orderCode);
    if (!order) {
      console.error("❌ Order not found:", orderCode);
      return false;
    }

    console.log("📊 Order found:", order);

    // Step 2: Find the OrderItem in the separate OrderItem table
    const orderItem = order.items.find((i) => i.productId === productId);
    if (!orderItem) {
      console.error("❌ Product not found in order items:", productId);
      console.log(
        "Available items:",
        order.items.map((i) => ({ id: i.productId, name: i.productName }))
      );
      return false;
    }

    console.log("📊 OrderItem found:", orderItem);

    // Step 3: Update the OrderItem record in database
    const { error } = await supabase
      .from("OrderItem")
      .update({
        isReviewed: true,
        reviewInfo: info,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", orderItem.id);

    if (error) {
      console.error("❌ Error updating OrderItem:", error);
      throw new Error(error.message);
    }
    console.log("✅ OrderItem updated successfully");
    return true;
  },
};
