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

  // Alias for list
  getAll: async (): Promise<Order[]> => {
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

  cancelOrder: async (
    orderId: string,
    reason: string,
    userId?: string
  ): Promise<boolean> => {
    const order = await orderService.getDetail(orderId);
    if (!order) throw new Error("Đơn hàng không tồn tại");

    console.log("🔄 [CANCEL ORDER] Checking order:", {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      paymentMethod: order.paymentMethod,
    });

    // ✅ VALIDATION: Check trạng thái được phép hủy
    const CANCELLABLE_STATUSES = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PENDING_CONFIRMATION,
    ];

    if (!CANCELLABLE_STATUSES.includes(order.status as any)) {
      throw new Error(
        `Không thể hủy đơn hàng ở trạng thái "${order.status}". ` +
          `Vui lòng liên hệ CSKH để được hỗ trợ.`
      );
    }

    // ✅ VALIDATION: Check thời gian (30 phút kể từ tạo đơn)
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const MAX_CANCEL_TIME = 30 * 60 * 1000; // 30 minutes

    if (
      order.status === OrderStatus.PENDING_CONFIRMATION &&
      orderAge > MAX_CANCEL_TIME
    ) {
      throw new Error(
        "Đơn hàng đã quá thời gian cho phép hủy (30 phút). Vui lòng liên hệ CSKH."
      );
    }

    try {
      // ✅ STEP 1: Hoàn kho (nếu đã trừ - chỉ COD mới trừ ngay)
      if (
        order.paymentMethod === "COD" &&
        order.status === OrderStatus.PENDING_CONFIRMATION
      ) {
        console.log("📦 [CANCEL ORDER] Hoàn kho cho đơn COD");
        // Hoàn từng item
        for (const item of order.items) {
          const { error: stockError } = await supabase.rpc(
            "increment_variant_stock",
            {
              variant_id: item.productId, // TODO: Cần lưu variantId
              quantity: item.quantity,
            }
          );
          if (stockError) {
            console.error(
              "⚠️ [CANCEL ORDER] Stock rollback error:",
              stockError
            );
            // Không throw, chỉ log để admin xử lý manual
          }
        }
      }

      // ✅ STEP 2: Update order status
      const notes = `${order.customerNotes || ""}\nLý do hủy: ${reason}`;
      const { error } = await supabase
        .from("Order")
        .update({
          status: OrderStatus.CANCELLED,
          customerNotes: notes,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw new Error(error.message);

      // ✅ STEP 3: Log hệ thống
      try {
        await supabase.from("SystemLog").insert({
          id: crypto.randomUUID(),
          action: "CANCEL_ORDER",
          tableName: "Order",
          recordId: order.id,
          description: `Hủy đơn hàng ${order.orderCode}. Lý do: ${reason}`,
          actorId: userId || "customer",
          actorName: order.customerName,
          createdAt: new Date().toISOString(),
        });
      } catch (logError) {
        console.error("⚠️ [CANCEL ORDER] Log error:", logError);
        // Không throw, log không quan trọng bằng cancel
      }

      console.log("✅ [CANCEL ORDER] Success:", order.orderCode);
      return true;
    } catch (error) {
      console.error("❌ [CANCEL ORDER] Error:", error);
      throw error;
    }
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

  cancelReturnRequest: async (
    requestId: string,
    reason?: string
  ): Promise<boolean> => {
    console.log("🔄 [CANCEL RETURN] Checking request:", requestId);

    // Step 1: Get return request
    const { data: request, error: fetchError } = await supabase
      .from("ReturnRequest")
      .select("*, order:Order(*)")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      console.error("❌ [CANCEL RETURN] Request not found:", fetchError);
      throw new Error("Yêu cầu đổi/trả không tồn tại");
    }

    console.log("📋 [CANCEL RETURN] Request status:", request.status);

    // ✅ VALIDATION: Chỉ cho hủy khi PENDING
    if (request.status !== "PENDING") {
      throw new Error(
        `Không thể hủy yêu cầu đã được ${request.status}. ` +
          `Vui lòng liên hệ CSKH để được hỗ trợ.`
      );
    }

    try {
      // Step 2: Update ReturnRequest status
      const { error: updateError } = await supabase
        .from("ReturnRequest")
        .update({
          status: "CANCELLED",
          adminNotes: reason
            ? `Khách hàng hủy: ${reason}`
            : "Khách hàng hủy yêu cầu",
          updatedAt: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) {
        console.error("❌ [CANCEL RETURN] Update error:", updateError);
        throw new Error(updateError.message);
      }

      // Step 3: Update OrderItem.returnStatus về NONE
      const { error: itemError } = await supabase
        .from("OrderItem")
        .update({ returnStatus: "NONE" })
        .eq("id", request.orderItemId);

      if (itemError) {
        console.error("❌ [CANCEL RETURN] Item update error:", itemError);
        // Không throw, vì đã cancel request thành công
      }

      // Step 4: Log hệ thống
      try {
        await supabase.from("SystemLog").insert({
          id: crypto.randomUUID(),
          action: "CANCEL_RETURN_REQUEST",
          tableName: "ReturnRequest",
          recordId: requestId,
          description: `Hủy yêu cầu ${request.requestCode}${
            reason ? `. Lý do: ${reason}` : ""
          }`,
          actorId: "customer",
          actorName: request.order?.customerName || "Unknown",
          createdAt: new Date().toISOString(),
        });
      } catch (logError) {
        console.error("⚠️ [CANCEL RETURN] Log error:", logError);
      }

      console.log("✅ [CANCEL RETURN] Success:", request.requestCode);
      return true;
    } catch (error) {
      console.error("❌ [CANCEL RETURN] Error:", error);
      throw error;
    }
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
