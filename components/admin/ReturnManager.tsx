import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
  Banknote,
  Image as ImageIcon,
  MessageSquare,
  Clock,
  Truck,
  ChevronRight,
  X,
  AlertOctagon,
  Package,
  Info,
  Camera,
  Send,
  Ruler,
} from "lucide-react";
import { api } from "../../services";
import { ReturnRequestStatus, ReturnType } from "../../constants/enums";
import { useAuth } from "../../context/AuthContext";

// Type for return request with joined data
interface ReturnRequestWithDetails {
  id: string;
  requestCode: string;
  orderId: string;
  orderItemId: string;
  type: ReturnType;
  status: ReturnRequestStatus;
  reason: string;
  evidenceImages: string[];
  refundAmount: number | null;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  } | null;
  exchangeToSize: string | null;
  exchangeToColor: string | null;
  adminNotes: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    orderCode: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    totalAmount?: number;
    createdAt?: string;
  };
  orderItem: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    color: string;
    size: string;
    thumbnailUrl: string;
  };
}

export const ReturnManager = () => {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState<ReturnRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "pending" | "approved" | "all"
  >("pending");

  // Detail Modal State
  const [viewingRequest, setViewingRequest] =
    useState<ReturnRequestWithDetails | null>(null);
  const [inventoryStock, setInventoryStock] = useState<number>(0);

  // Rejection State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Approve Notes State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data =
        (await api.returnRequests.list()) as ReturnRequestWithDetails[];
      setRequests(data);
      console.log("📋 [RETURN MANAGER] Loaded", data.length, "return requests");
    } catch (error) {
      console.error("❌ [RETURN MANAGER] Error fetching:", error);
      alert("Lỗi tải danh sách yêu cầu đổi/trả");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.requestCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.order.customerPhone.includes(searchQuery) ||
        req.order.customerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "pending")
        return req.status === ReturnRequestStatus.PENDING;
      if (activeFilter === "approved")
        return req.status === ReturnRequestStatus.APPROVED;
      return true;
    });
  }, [requests, searchQuery, activeFilter]);

  const handleOpenDetail = async (request: ReturnRequestWithDetails) => {
    setViewingRequest(request);

    // For exchange requests, check inventory stock for the target variant
    if (request.type === ReturnType.EXCHANGE && request.exchangeToSize) {
      try {
        const products = await api.products.list();
        const product = products.find(
          (p) => p.id === request.orderItem.productId
        );

        if (product) {
          // Find the target variant based on exchangeToSize and exchangeToColor
          const targetVariant = product.variants.find((v) => {
            const sizeMatch =
              !request.exchangeToSize || v.size === request.exchangeToSize;
            const colorMatch =
              !request.exchangeToColor || v.color === request.exchangeToColor;
            return sizeMatch && colorMatch;
          });

          setInventoryStock(targetVariant?.stockQuantity || 0);
          console.log(
            "📦 [INVENTORY CHECK] Stock:",
            targetVariant?.stockQuantity || 0
          );
        }
      } catch (error) {
        console.error("❌ [INVENTORY CHECK] Error:", error);
        setInventoryStock(0);
      }
    }
  };

  const getStatusBadge = (status: ReturnRequestStatus) => {
    switch (status) {
      case ReturnRequestStatus.PENDING:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case ReturnRequestStatus.APPROVED:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <CheckCircle2 size={12} /> Đã duyệt
          </span>
        );
      case ReturnRequestStatus.SHIPPING_BACK:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <Truck size={12} /> Đang gửi trả
          </span>
        );
      case ReturnRequestStatus.RECEIVED:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-cyan-100 text-cyan-700 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <Package size={12} /> Đã nhận hàng
          </span>
        );
      case ReturnRequestStatus.COMPLETED:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <CheckCircle2 size={12} /> Hoàn tất
          </span>
        );
      case ReturnRequestStatus.REJECTED:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-700 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <XCircle size={12} /> Từ chối
          </span>
        );
      case ReturnRequestStatus.CANCELLED:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-700 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <X size={12} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-700 inline-flex items-center gap-1.5 whitespace-nowrap">
            <Info size={12} /> {status}
          </span>
        );
    }
  };

  const handleApprove = async () => {
    if (!viewingRequest || !currentUser) return;

    // Check inventory stock for exchange
    if (viewingRequest.type === ReturnType.EXCHANGE) {
      if (inventoryStock < viewingRequest.orderItem.quantity) {
        alert(
          `Không thể duyệt! Tồn kho không đủ. Hiện tại: ${inventoryStock}, Cần: ${viewingRequest.orderItem.quantity}`
        );
        return;
      }
    }

    setLoading(true);
    try {
      await api.returnRequests.approve(
        viewingRequest.id,
        approveNotes.trim() || "Đã phê duyệt yêu cầu",
        currentUser
      );

      console.log(
        `%c[EMAIL SYSTEM] Gửi tới: ${viewingRequest.order.customerPhone}@sporthub.vn`,
        "color: #3b82f6; font-weight: bold"
      );
      console.log(
        `Nội dung: Yêu cầu ${viewingRequest.requestCode} đã được DUYỆT. Quý khách vui lòng đóng gói hàng và gửi về kho.`
      );

      alert("Đã phê duyệt yêu cầu đổi/trả thành công!");
      setShowApproveModal(false);
      setViewingRequest(null);
      setApproveNotes("");
      fetchReturns();
    } catch (err: any) {
      console.error("❌ [APPROVE] Error:", err);
      alert(`Lỗi xử lý duyệt phiếu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!viewingRequest || !rejectReason.trim() || !currentUser) return;

    setLoading(true);
    try {
      await api.returnRequests.reject(
        viewingRequest.id,
        rejectReason,
        currentUser
      );

      console.log(
        `%c[NOTIFICATION] Yêu cầu ${viewingRequest.requestCode}: Bị TỪ CHỐI. Lý do: ${rejectReason}`,
        "color: #ef4444; font-weight: bold"
      );

      alert("Đã từ chối yêu cầu đổi/trả.");
      setShowRejectModal(false);
      setViewingRequest(null);
      setRejectReason("");
      fetchReturns();
    } catch (err: any) {
      console.error("❌ [REJECT] Error:", err);
      alert(`Lỗi xử lý: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!viewingRequest || !currentUser) return;

    if (
      !confirm(
        `Xác nhận đã nhận hàng trả về kho?\n\nHệ thống sẽ tự động:\n- Tạo phiếu nhập kho (StockEntry)\n- Cập nhật tồn kho sản phẩm`
      )
    )
      return;

    setLoading(true);
    try {
      await api.returnRequests.confirmReceived(viewingRequest.id, currentUser);

      console.log(
        `%c[WAREHOUSE] Đã nhận hàng trả: ${viewingRequest.requestCode}`,
        "color: #10b981; font-weight: bold"
      );

      alert(
        "✅ Đã xác nhận nhận hàng!\n\u2713 Phiếu nhập kho đã được tạo tự động\n\u2713 Tồn kho đã được cập nhật"
      );
      setViewingRequest(null);
      fetchReturns();
    } catch (err: any) {
      console.error("❌ [CONFIRM RECEIVED] Error:", err);
      alert(`Lỗi xác nhận nhận hàng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!viewingRequest || !currentUser) return;

    const isExchange = viewingRequest.type === ReturnType.EXCHANGE;
    const confirmMessage = isExchange
      ? `Hoàn tất yêu cầu ĐỔI HÀNG?\n\nHệ thống sẽ tự động:\n- Tạo phiếu xuất kho (StockIssue)\n- Xuất hàng đổi cho khách\n- Cập nhật tồn kho`
      : `Hoàn tất yêu cầu TRẢ HÀNG?\n\nHệ thống sẽ đánh dấu hoàn tiền cho khách hàng.`;

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      await api.returnRequests.complete(
        viewingRequest.id,
        undefined,
        currentUser
      );

      console.log(
        `%c[COMPLETE] Hoàn tất: ${viewingRequest.requestCode}`,
        "color: #059669; font-weight: bold"
      );

      const successMessage = isExchange
        ? "✅ Đã hoàn tất đổi hàng!\n\u2713 Phiếu xuất kho đã được tạo\n\u2713 Tồn kho đã được cập nhật"
        : "✅ Đã hoàn tất trả hàng!\n\u2713 Vui lòng thực hiện hoàn tiền cho khách hàng";

      alert(successMessage);
      setViewingRequest(null);
      fetchReturns();
    } catch (err: any) {
      console.error("❌ [COMPLETE] Error:", err);
      alert(`Lỗi hoàn tất: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20 p-6 md:p-8 w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Quản lý Đổi / Trả
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Xử lý khiếu nại và hoàn trả sản phẩm
          </p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${
              activeFilter === "pending"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setActiveFilter("approved")}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${
              activeFilter === "approved"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Đang đổi trả
          </button>
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-slate-900 text-white shadow-lg"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
        <Search className="text-gray-300 ml-2" size={24} />
        <input
          type="text"
          placeholder="Tìm theo mã đơn hoặc SĐT khách hàng..."
          className="flex-1 bg-transparent border-none outline-none font-black text-sm uppercase text-slate-800 placeholder:text-slate-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-10 py-6">Mã yêu cầu / Đơn hàng</th>
                <th className="px-6 py-6">Sản phẩm</th>
                <th className="px-6 py-6">Khách hàng</th>
                <th className="px-6 py-6">Lý do</th>
                <th className="px-6 py-6 text-center">Loại</th>
                <th
                  className="px-6 py-6 text-center"
                  style={{ width: "180px" }}
                >
                  Trạng thái
                </th>
                <th className="px-10 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 transition group"
                  >
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-secondary uppercase tracking-tight">
                        {req.requestCode}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                        Đơn: {req.order.orderCode}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            req.orderItem.thumbnailUrl ||
                            "https://via.placeholder.com/48?text=No+Image"
                          }
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                          alt=""
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes("placeholder")) {
                              target.src =
                                "https://via.placeholder.com/48?text=No+Image";
                            }
                          }}
                        />
                        <div>
                          <p className="text-xs font-black text-gray-800 uppercase line-clamp-1">
                            {req.orderItem.productName}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                            {req.orderItem.color} • SIZE {req.orderItem.size} •
                            SL: {req.orderItem.quantity}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-gray-800 uppercase">
                        {req.order.customerName}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        {req.order.customerPhone}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-gray-600 line-clamp-2 italic max-w-xs">
                        "{req.reason}"
                      </p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${
                          req.type === ReturnType.EXCHANGE
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {req.type === ReturnType.EXCHANGE ? (
                          <ArrowRightLeft size={10} />
                        ) : (
                          <Banknote size={10} />
                        )}
                        {req.type === ReturnType.EXCHANGE
                          ? "Đổi hàng"
                          : "Trả hàng"}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => handleOpenDetail(req)}
                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-xl shadow-sm transition transform hover:scale-110"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-32 text-center text-slate-300 font-black text-xs uppercase tracking-widest italic"
                  >
                    Chưa có yêu cầu nào cần xử lý
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {viewingRequest && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Header - Compact */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    viewingRequest.type === ReturnType.EXCHANGE
                      ? "bg-blue-600"
                      : "bg-green-600"
                  } text-white`}
                >
                  {viewingRequest.type === ReturnType.EXCHANGE ? (
                    <ArrowRightLeft size={22} />
                  ) : (
                    <Banknote size={22} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
                      Yêu cầu: {viewingRequest.requestCode}
                    </h2>
                    {getStatusBadge(viewingRequest.status)}
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">
                    Gắn với đơn hàng:{" "}
                    <span className="text-secondary">{viewingRequest.order.orderCode}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Content - Grid layout horizontal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                {/* Cột trái: Sản phẩm + Lý do */}
                <div className="space-y-4">
                  {/* Sản phẩm đổi trả - Compact */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                      <Package size={12} className="text-secondary" /> Sản phẩm đổi trả
                    </h4>
                    <div className="flex gap-4">
                      <img
                        src={viewingRequest.orderItem.thumbnailUrl || "https://via.placeholder.com/80"}
                        className="w-20 h-20 rounded-xl object-cover border border-gray-100 shadow-sm"
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/80";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black uppercase text-slate-800 truncate">
                          {viewingRequest.orderItem.productName}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="px-2 py-1 bg-gray-50 rounded-lg text-[9px] font-bold uppercase">
                            Màu: {viewingRequest.orderItem.color}
                          </span>
                          <span className="px-2 py-1 bg-gray-50 rounded-lg text-[9px] font-bold uppercase">
                            Size: {viewingRequest.orderItem.size}
                          </span>
                          <span className="px-2 py-1 bg-gray-50 rounded-lg text-[9px] font-bold uppercase">
                            SL: {viewingRequest.orderItem.quantity}
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold">
                            {viewingRequest.orderItem.unitPrice.toLocaleString()}đ / cái
                          </span>
                        </div>

                        {/* Đổi sang (nếu là Exchange) */}
                        {viewingRequest.type === ReturnType.EXCHANGE &&
                          (viewingRequest.exchangeToSize || viewingRequest.exchangeToColor) && (
                            <div className="mt-3 p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                              <p className="text-[8px] font-black text-blue-500 uppercase mb-1.5">
                                <ArrowRightLeft size={10} className="inline mr-1" /> Muốn đổi sang:
                              </p>
                              <div className="flex gap-1.5">
                                {viewingRequest.exchangeToSize && (
                                  <span className="px-2 py-1 bg-white rounded text-[9px] font-bold text-blue-700">
                                    Size: {viewingRequest.exchangeToSize}
                                  </span>
                                )}
                                {viewingRequest.exchangeToColor && (
                                  <span className="px-2 py-1 bg-white rounded text-[9px] font-bold text-blue-700">
                                    Màu: {viewingRequest.exchangeToColor}
                                  </span>
                                )}
                              </div>
                              <p className={`mt-2 text-[9px] font-bold ${inventoryStock >= viewingRequest.orderItem.quantity ? "text-green-600" : "text-red-600"}`}>
                                📦 Tồn kho đích: {inventoryStock} cái {inventoryStock < viewingRequest.orderItem.quantity && "(KHÔNG ĐỦ)"}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Lý do + Hình ảnh */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <MessageSquare size={14} />
                      <h4 className="text-[9px] font-black uppercase tracking-widest">Lý do khiếu nại</h4>
                    </div>
                    <p className="text-sm font-bold text-slate-700 italic border-l-3 border-slate-200 pl-3">
                      "{viewingRequest.reason}"
                    </p>
                    {viewingRequest.evidenceImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {viewingRequest.evidenceImages.map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white shadow-sm">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cột phải: Thông tin khách + Bank */}
                <div className="space-y-4">
                  {/* Thông tin khách hàng */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Info size={12} className="text-secondary" /> Thông tin khách hàng
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Họ tên</p>
                        <p className="font-black text-slate-800 text-sm uppercase">{viewingRequest.order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Điện thoại</p>
                        <p className="font-bold text-slate-600 text-sm">{viewingRequest.order.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Ngày mua</p>
                        <p className="font-bold text-slate-800 text-sm">
                          {new Date(viewingRequest.order.createdAt || "").toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Tổng đơn</p>
                        <p className="font-black text-red-600 text-sm">
                          {viewingRequest.order.totalAmount?.toLocaleString() || "N/A"}đ
                        </p>
                      </div>
                    </div>
                    {viewingRequest.order.customerAddress && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2">
                        <Truck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-blue-800 uppercase leading-relaxed">
                          {viewingRequest.order.customerAddress}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tài khoản hoàn tiền */}
                  {viewingRequest.bankInfo && (
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                      <h4 className="text-[9px] font-black text-green-700 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Banknote size={12} /> Tài khoản hoàn tiền
                      </h4>
                      <div className="bg-white p-3 rounded-xl space-y-1">
                        <p className="text-[10px] font-black text-slate-800 uppercase">
                          {viewingRequest.bankInfo.bankName}
                        </p>
                        <p className="text-sm font-black text-slate-900 tracking-widest">
                          {viewingRequest.bankInfo.accountNumber}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">
                          {viewingRequest.bankInfo.accountHolder}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              {/* Reject button - only for PENDING */}
              {viewingRequest.status === ReturnRequestStatus.PENDING ? (
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-black text-[9px] uppercase hover:bg-red-50 transition"
                >
                  TỪ CHỐI YÊU CẦU
                </button>
              ) : <div />}

              <div className="flex gap-3">
                <button
                  onClick={() => setViewingRequest(null)}
                  className="px-6 py-2.5 font-black text-gray-400 uppercase text-[9px] hover:text-slate-800 transition"
                >
                  Đóng
                </button>

                {/* Approve button - only for PENDING */}
                {viewingRequest.status === ReturnRequestStatus.PENDING && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <CheckCircle2 size={14} /> DUYỆT YÊU CẦU
                  </button>
                )}

                {/* Confirm Received button - only for APPROVED */}
                {viewingRequest.status === ReturnRequestStatus.APPROVED && (
                  <button
                    onClick={handleConfirmReceived}
                    disabled={loading}
                    className="px-8 py-2.5 bg-cyan-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg shadow-cyan-500/30 flex items-center gap-2 hover:bg-cyan-700 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="animate-spin" size={14} />
                    ) : (
                      <Package size={14} />
                    )}
                    XÁC NHẬN NHẬN HÀNG
                  </button>
                )}

                {/* Complete button - only for RECEIVED */}
                {viewingRequest.status === ReturnRequestStatus.RECEIVED && (
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg shadow-green-500/30 flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="animate-spin" size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    HOÀN TẤT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/70 z-[400] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  Phê duyệt yêu cầu
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Xác nhận duyệt yêu cầu đổi/trả này?
                </p>
              </div>
              <textarea
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 outline-none font-medium text-sm h-24 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Ghi chú cho khách hàng (tuỳ chọn)..."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="py-4 bg-gray-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    "XÁC NHẬN DUYỆT"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 z-[400] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <AlertOctagon size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  Từ chối Đổi / Trả
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Vui lòng nhập lý do từ chối để hệ thống thông báo cho khách
                  hàng.
                </p>
              </div>
              <textarea
                autoFocus
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 outline-none font-medium text-sm h-32 focus:ring-2 focus:ring-red-100 transition"
                placeholder="Ví dụ: Sản phẩm đã qua sử dụng..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="py-4 bg-gray-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || loading}
                  className="py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    "XÁC NHẬN TỪ CHỐI"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
