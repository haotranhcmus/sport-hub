// Return Request Service
import { supabase } from "../lib/supabase";
import {
  ReturnRequestStatus,
  ItemReturnStatus,
  ReturnType,
  OrderStatus,
} from "../constants/enums";
import { ReturnRequestData, User } from "../types";
import { createSystemLog, withUpdatedAt } from "./shared.service";

export const returnRequestService = {
  // Customer creates a return/exchange request for ONE item
  create: async (returnData: ReturnRequestData) => {
    const now = new Date().toISOString();
    const requestCode = `RET-${Date.now().toString().slice(-6)}`;

    console.log("🔄 [RETURN REQUEST CREATE] Starting:", {
      orderId: returnData.orderId,
      orderItemId: returnData.orderItemId,
      type: returnData.type,
      reason: returnData.reason,
    });

    // Step 1: Create ReturnRequest record
    const returnRequestData = {
      id: crypto.randomUUID(),
      requestCode,
      orderId: returnData.orderId,
      orderItemId: returnData.orderItemId,
      type: returnData.type.toUpperCase() as ReturnType,
      status: ReturnRequestStatus.PENDING,
      reason: returnData.reason,
      evidenceImages: returnData.evidenceImages || [],
      refundAmount: returnData.type === "refund" ? 0 : null,
      bankInfo: returnData.bankInfo || null,
      exchangeToSize: returnData.exchangeToSize || null,
      exchangeToColor: returnData.exchangeToColor || null,
      createdAt: now,
      updatedAt: now,
    };

    const { data: returnRequest, error: createError } = await supabase
      .from("ReturnRequest")
      .insert(returnRequestData)
      .select()
      .single();

    if (createError) {
      console.error("❌ [RETURN REQUEST CREATE] Error:", createError);
      throw new Error(`Lỗi tạo yêu cầu đổi/trả: ${createError.message}`);
    }

    console.log("✅ [RETURN REQUEST CREATE] Created:", returnRequest.id);

    // Step 2: Update OrderItem status
    const { error: updateError } = await supabase
      .from("OrderItem")
      .update({
        returnStatus: ItemReturnStatus.HAS_REQUEST,
        updatedAt: now,
      })
      .eq("id", returnData.orderItemId);

    if (updateError) {
      console.error(
        "❌ [RETURN REQUEST CREATE] Error updating OrderItem:",
        updateError
      );
    }

    // Step 3: Update Order status
    const { error: orderUpdateError } = await supabase
      .from("Order")
      .update({
        status: OrderStatus.RETURN_REQUESTED,
        updatedAt: now,
      })
      .eq("id", returnData.orderId);

    if (orderUpdateError) {
      console.error(
        "❌ [RETURN REQUEST CREATE] Error updating Order:",
        orderUpdateError
      );
    }

    console.log("🎉 [RETURN REQUEST CREATE] Complete:", requestCode);
    return returnRequest;
  },

  list: async (filters?: {
    status?: ReturnRequestStatus;
    type?: ReturnType;
    orderId?: string;
  }) => {
    let query = supabase
      .from("ReturnRequest")
      .select(
        `
          *,
          order:Order(orderCode, customerName, customerPhone, customerAddress, totalAmount, createdAt),
          orderItem:OrderItem(productId, productName, quantity, unitPrice, color, size, thumbnailUrl)
        `
      )
      .order("createdAt", { ascending: false });

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.orderId) query = query.eq("orderId", filters.orderId);

    const { data, error } = await query;

    if (error) {
      console.error("❌ [RETURN REQUEST LIST] Error:", error);
      throw new Error(error.message);
    }

    console.log(
      "📋 [RETURN REQUEST LIST] Found:",
      data?.length || 0,
      "requests"
    );
    return data || [];
  },

  getDetail: async (requestId: string) => {
    const { data, error } = await supabase
      .from("ReturnRequest")
      .select(
        `
          *,
          order:Order(
            orderCode, 
            customerName, 
            customerPhone, 
            customerAddress,
            totalAmount,
            createdAt
          ),
          orderItem:OrderItem(
            productId,
            productName, 
            quantity, 
            unitPrice, 
            color, 
            size,
            thumbnailUrl
          )
        `
      )
      .eq("id", requestId)
      .single();

    if (error) {
      console.error("❌ [RETURN REQUEST DETAIL] Error:", error);
      return null;
    }

    return data;
  },

  getByOrder: async (orderId: string) => {
    const { data, error } = await supabase
      .from("ReturnRequest")
      .select(
        `
          *,
          orderItem:OrderItem(productName, quantity, unitPrice, color, size)
        `
      )
      .eq("orderId", orderId)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("❌ [RETURN REQUEST BY ORDER] Error:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  approve: async (requestId: string, adminNotes: string, user: User) => {
    const now = new Date().toISOString();

    console.log("✅ [RETURN REQUEST APPROVE] Starting:", requestId);

    const { data, error } = await supabase
      .from("ReturnRequest")
      .update({
        status: ReturnRequestStatus.APPROVED,
        adminNotes,
        processedBy: user.fullName,
        processedAt: now,
        updatedAt: now,
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("❌ [RETURN REQUEST APPROVE] Error:", error);
      throw new Error(error.message);
    }

    // Update Order status to RETURN_PROCESSING
    await supabase
      .from("Order")
      .update({
        status: OrderStatus.RETURN_PROCESSING,
        updatedAt: now,
      })
      .eq("id", data.orderId);

    console.log("✅ [RETURN REQUEST APPROVE] Success:", data.requestCode);

    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "ReturnRequest",
        recordId: requestId,
        description: `Duyệt yêu cầu đổi/trả: ${data.requestCode}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    return data;
  },

  reject: async (requestId: string, reason: string, user: User) => {
    const now = new Date().toISOString();

    console.log("❌ [RETURN REQUEST REJECT] Starting:", requestId);

    const { data, error } = await supabase
      .from("ReturnRequest")
      .update({
        status: ReturnRequestStatus.REJECTED,
        adminNotes: reason,
        processedBy: user.fullName,
        processedAt: now,
        updatedAt: now,
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("❌ [RETURN REQUEST REJECT] Error:", error);
      throw new Error(error.message);
    }

    await supabase
      .from("OrderItem")
      .update({
        returnStatus: ItemReturnStatus.REJECTED,
        updatedAt: now,
      })
      .eq("id", data.orderItemId);

    console.log("✅ [RETURN REQUEST REJECT] Success:", data.requestCode);

    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "ReturnRequest",
        recordId: requestId,
        description: `Từ chối yêu cầu đổi/trả: ${data.requestCode}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    return data;
  },

  confirmReceived: async (requestId: string, user: User) => {
    const now = new Date().toISOString();

    console.log("📦 [RETURN REQUEST RECEIVED] Starting:", requestId);

    // Get full request details including order item info
    const returnRequest = await returnRequestService.getDetail(requestId);
    if (!returnRequest) {
      throw new Error("Return request not found");
    }

    // Update return request status
    const { data, error } = await supabase
      .from("ReturnRequest")
      .update({
        status: ReturnRequestStatus.RECEIVED,
        updatedAt: now,
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("❌ [RETURN REQUEST RECEIVED] Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ [RETURN REQUEST RECEIVED] Success:", data.requestCode);

    // AUTO CREATE STOCK ENTRY (Inventory In)
    try {
      const stockEntryCode = `PNK-RET-${Date.now().toString().slice(-6)}`;
      const stockEntryItem = {
        productId: returnRequest.orderItem.productId,
        productName: returnRequest.orderItem.productName,
        color: returnRequest.orderItem.color,
        size: returnRequest.orderItem.size,
        quantity: returnRequest.orderItem.quantity,
        unitPrice: returnRequest.orderItem.unitPrice,
        totalPrice:
          returnRequest.orderItem.quantity * returnRequest.orderItem.unitPrice,
      };

      await supabase.from("StockEntry").insert({
        id: crypto.randomUUID(),
        code: stockEntryCode,
        supplierId: "RETURN-SYSTEM",
        supplierName: `Trả hàng từ KH: ${returnRequest.order.customerName}`,
        date: now,
        totalAmount: stockEntryItem.totalPrice,
        status: "completed",
        items: [stockEntryItem],
        actorName: user.fullName,
        createdAt: now,
        updatedAt: now,
      });

      console.log(
        "✅ [AUTO STOCK ENTRY] Created:",
        stockEntryCode,
        "for",
        returnRequest.orderItem.productName
      );

      // Update product variant stock
      const { data: variants } = await supabase
        .from("ProductVariant")
        .select("*")
        .eq("productId", returnRequest.orderItem.productId);

      if (variants && variants.length > 0) {
        const targetVariant = variants.find(
          (v) =>
            v.color === returnRequest.orderItem.color &&
            v.size === returnRequest.orderItem.size
        );

        if (targetVariant) {
          await supabase
            .from("ProductVariant")
            .update({
              stockQuantity:
                targetVariant.stockQuantity + returnRequest.orderItem.quantity,
              updatedAt: now,
            })
            .eq("id", targetVariant.id);

          console.log(
            "✅ [AUTO STOCK UPDATE] Increased stock for variant:",
            targetVariant.id
          );
        }
      }
    } catch (stockError: any) {
      console.error("❌ [AUTO STOCK ENTRY] Error:", stockError.message);
      // Don't throw - allow the return request to complete even if stock update fails
    }

    // Update Order status - still in RETURN_PROCESSING
    await supabase
      .from("Order")
      .update({
        status: OrderStatus.RETURN_PROCESSING,
        updatedAt: now,
      })
      .eq("id", returnRequest.orderId);

    await supabase.from("SystemLog").insert(
      createSystemLog({
        action: "UPDATE",
        tableName: "ReturnRequest",
        recordId: requestId,
        description: `Xác nhận đã nhận hàng trả: ${data.requestCode}`,
        actorId: user.id,
        actorName: user.fullName,
      })
    );

    return data;
  },

  complete: async (
    requestId: string,
    exchangeOrderId?: string,
    user?: User
  ) => {
    const now = new Date().toISOString();

    console.log("🎉 [RETURN REQUEST COMPLETE] Starting:", requestId);

    const returnRequest = await returnRequestService.getDetail(requestId);
    if (!returnRequest) {
      throw new Error("Return request not found");
    }

    const updateData: any = {
      status: ReturnRequestStatus.COMPLETED,
      updatedAt: now,
    };

    if (exchangeOrderId) {
      updateData.newOrderId = exchangeOrderId;
    }

    const { data, error } = await supabase
      .from("ReturnRequest")
      .update(updateData)
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("❌ [RETURN REQUEST COMPLETE] Error:", error);
      throw new Error(error.message);
    }

    const finalStatus =
      returnRequest.type === ReturnType.EXCHANGE
        ? ItemReturnStatus.EXCHANGED
        : ItemReturnStatus.REFUNDED;

    await supabase
      .from("OrderItem")
      .update({
        returnStatus: finalStatus,
        updatedAt: now,
      })
      .eq("id", returnRequest.orderItemId);

    // Update Order status to RETURN_COMPLETED
    await supabase
      .from("Order")
      .update({
        status: OrderStatus.RETURN_COMPLETED,
        updatedAt: now,
      })
      .eq("id", returnRequest.orderId);

    // AUTO CREATE STOCK ISSUE for EXCHANGE (Inventory Out)
    if (returnRequest.type === ReturnType.EXCHANGE && user) {
      try {
        const stockIssueCode = `PXK-EXCH-${Date.now().toString().slice(-6)}`;

        // Determine the target variant based on exchange preferences
        const targetSize =
          returnRequest.exchangeToSize || returnRequest.orderItem.size;
        const targetColor =
          returnRequest.exchangeToColor || returnRequest.orderItem.color;

        const stockIssueItem = {
          productId: returnRequest.orderItem.productId,
          productName: returnRequest.orderItem.productName,
          color: targetColor,
          size: targetSize,
          quantity: returnRequest.orderItem.quantity,
          unitPrice: returnRequest.orderItem.unitPrice,
          totalPrice:
            returnRequest.orderItem.quantity *
            returnRequest.orderItem.unitPrice,
        };

        await supabase.from("StockIssue").insert({
          id: crypto.randomUUID(),
          code: stockIssueCode,
          date: now,
          status: "completed",
          items: [stockIssueItem],
          actorName: user.fullName,
          type: "exchange",
          totalAmount: stockIssueItem.totalPrice,
          orderCodes: [returnRequest.order.orderCode],
          customerName: returnRequest.order.customerName,
          courierName: "Đổi hàng nội bộ",
          createdAt: now,
          updatedAt: now,
        });

        console.log(
          "✅ [AUTO STOCK ISSUE] Created:",
          stockIssueCode,
          "for exchange"
        );

        // Update product variant stock (decrease)
        const { data: variants } = await supabase
          .from("ProductVariant")
          .select("*")
          .eq("productId", returnRequest.orderItem.productId);

        if (variants && variants.length > 0) {
          const targetVariant = variants.find(
            (v) => v.color === targetColor && v.size === targetSize
          );

          if (targetVariant) {
            await supabase
              .from("ProductVariant")
              .update({
                stockQuantity: Math.max(
                  0,
                  targetVariant.stockQuantity - returnRequest.orderItem.quantity
                ),
                updatedAt: now,
              })
              .eq("id", targetVariant.id);

            console.log(
              "✅ [AUTO STOCK UPDATE] Decreased stock for variant:",
              targetVariant.id
            );
          }
        }
      } catch (stockError: any) {
        console.error("❌ [AUTO STOCK ISSUE] Error:", stockError.message);
        // Don't throw - allow the return request to complete even if stock update fails
      }
    }

    console.log("✅ [RETURN REQUEST COMPLETE] Success:", data.requestCode);

    return data;
  },

  cancel: async (requestId: string) => {
    const now = new Date().toISOString();

    console.log("🚫 [RETURN REQUEST CANCEL] Starting:", requestId);

    const { data: existing } = await supabase
      .from("ReturnRequest")
      .select("status, orderItemId")
      .eq("id", requestId)
      .single();

    if (!existing || existing.status !== ReturnRequestStatus.PENDING) {
      throw new Error("Chỉ có thể hủy yêu cầu đang chờ xử lý");
    }

    const { data, error } = await supabase
      .from("ReturnRequest")
      .update({
        status: ReturnRequestStatus.CANCELLED,
        updatedAt: now,
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("❌ [RETURN REQUEST CANCEL] Error:", error);
      throw new Error(error.message);
    }

    await supabase
      .from("OrderItem")
      .update({
        returnStatus: ItemReturnStatus.NONE,
        updatedAt: now,
      })
      .eq("id", existing.orderItemId);

    console.log("✅ [RETURN REQUEST CANCEL] Success:", data.requestCode);
    return data;
  },
};
