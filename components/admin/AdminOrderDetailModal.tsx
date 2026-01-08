import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  MapPin,
  Smartphone,
  CreditCard,
  Clock,
  CheckCircle,
  Send,
  Info,
  ShieldCheck,
  RefreshCw,
  Truck,
  Banknote,
  MessageSquare,
  ClipboardCheck,
  AlertOctagon,
  Calendar,
  AlertCircle,
  CheckCircle2,
  User,
  Landmark,
  RotateCcw,
  // Fix: Added missing AlertTriangle icon import
  AlertTriangle,
} from "lucide-react";
import { Order, OrderStatus } from "../../types";
import { api } from "../../services";
import { useAuth } from "../../context/AuthContext";
import { getOrderStatusLabel } from "../../utils/helpers";

interface Props {
  order: Order;
  onClose: () => void;
  onRefresh: () => void;
}

export const AdminOrderDetailModal: React.FC<Props> = ({
  order: initialOrder,
  onClose,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [loading, setLoading] = useState(false);

  // UI State for Custom Confirmations
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverForm, setHandoverForm] = useState({
    courierName: "",
    trackingNumber: "",
    deliveryPerson: "",
  });
  const [showSuccessConfirm, setShowSuccessConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  // Sync local state when prop changes
  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const getStatusInfo = (status: OrderStatus) => {
    const label = getOrderStatusLabel(status);
    switch (status) {
      // Fix shorthand OrderStatus members S1-S10
      case OrderStatus.PENDING_PAYMENT:
        return { label, color: "text-orange-600", bg: "bg-orange-50" };
      case OrderStatus.PENDING_CONFIRMATION:
        return { label, color: "text-blue-600", bg: "bg-blue-50" };
      case OrderStatus.PACKING:
        return { label, color: "text-indigo-600", bg: "bg-indigo-50" };
      case OrderStatus.SHIPPING:
        return { label, color: "text-purple-600", bg: "bg-purple-50" };
      case OrderStatus.COMPLETED:
        return { label, color: "text-green-600", bg: "bg-green-50" };
      case OrderStatus.CANCELLED:
        return { label, color: "text-red-600", bg: "bg-red-50" };
      case OrderStatus.DELIVERY_FAILED:
        return { label, color: "text-rose-600", bg: "bg-rose-50" };
      case OrderStatus.RETURN_REQUESTED:
        return { label, color: "text-yellow-700", bg: "bg-yellow-50" };
      case OrderStatus.RETURN_PROCESSING:
        return { label, color: "text-blue-700", bg: "bg-blue-50" };
      case OrderStatus.RETURN_COMPLETED:
        return { label, color: "text-teal-700", bg: "bg-teal-50" };
      default:
        return { label: status, color: "text-gray-500", bg: "bg-gray-50" };
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Fix shorthand S3 to PACKING
      const success = await api.orders.updateOrderStatus(
        order.id,
        OrderStatus.PACKING
      );
      if (success) {
        setShowApproveConfirm(false);
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi duyệt đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHandoverConfirm = async () => {
    if (
      !handoverForm.courierName ||
      !handoverForm.trackingNumber ||
      !handoverForm.deliveryPerson
    ) {
      alert("Vui lòng nhập đủ thông tin vận chuyển và nhân viên giao hàng.");
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      const success = await api.orders.updateShippingInfo(
        order.id,
        handoverForm,
        user
      );
      if (success) {
        setShowHandoverModal(false);
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi vận chuyển:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDelivery = async () => {
    setLoading(true);
    try {
      const success = await api.orders.completeOrder(order.id);
      if (success) {
        setShowSuccessConfirm(false);
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi hoàn tất đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    setLoading(true);
    try {
      const success = await api.orders.cancelOrder(order.id, cancelReason);
      if (success) {
        setShowCancelForm(false);
        setCancelReason("");
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi hủy đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRefund = async () => {
    setLoading(true);
    try {
      const success = await api.orders.confirmRefund(order.id);
      if (success) {
        setShowRefundConfirm(false);
        alert("Đã xác nhận hoàn tiền thành công!");
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi hoàn tiền:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusUI = getStatusInfo(order.status);
  const isGuest = order.customerType === "guest";
  // Fix shorthand S6 to CANCELLED
  const needsRefund =
    order.status === OrderStatus.CANCELLED &&
    (order.paymentStatus === "PAID" ||
      order.paymentStatus === "PENDING_REFUND");

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in">
      <div className="bg-white rounded-[40px] w-[95vw] max-w-[1800px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl">
              <Package size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                  {order.orderCode}
                </h2>
                <span
                  className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    isGuest
                      ? "bg-orange-500 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {isGuest ? "Khách vãng lai" : "Thành viên"}
                </span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition disabled:opacity-30"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cột trái */}
            <div className="lg:col-span-8 space-y-8">
              {/* Status Banner */}
              <div
                className={`${statusUI.bg} ${statusUI.color} p-8 rounded-[32px] border border-current/10 flex items-center justify-between relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Trạng thái vận hành
                  </p>
                  <h3 className="text-3xl font-black uppercase tracking-tight mt-1">
                    {statusUI.label}
                  </h3>
                  {/* Fix shorthand S4 to SHIPPING */}
                  {order.status === OrderStatus.SHIPPING &&
                    order.trackingNumber && (
                      <div className="mt-4 flex flex-col gap-2 bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <Truck size={20} />
                          <div>
                            <p className="text-[10px] font-black uppercase opacity-60">
                              Đơn vị: {order.courierName}
                            </p>
                            <p className="text-sm font-black uppercase">
                              Vận đơn: {order.trackingNumber}
                            </p>
                          </div>
                        </div>
                        {order.deliveryPerson && (
                          <div className="flex items-center gap-4 border-t border-white/10 pt-2">
                            <User size={16} />
                            <p className="text-[10px] font-black uppercase">
                              Người giao: {order.deliveryPerson}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </div>
                <ShieldCheck
                  size={120}
                  className="absolute -right-8 -bottom-8 opacity-10 rotate-12"
                />
              </div>

              {/* Refund Information Section */}
              {needsRefund && order.returnInfo?.bankInfo && (
                <div className="bg-red-50 p-8 rounded-[32px] border-2 border-dashed border-red-200 space-y-6 animate-pulse-slow">
                  <div className="flex items-center gap-4 text-red-600">
                    <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg">
                      <RotateCcw size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight">
                        Yêu cầu hoàn tiền (ONLINE)
                      </h4>
                      <p className="text-[10px] font-bold uppercase opacity-70">
                        Khách hàng đã hủy đơn và cần nhận lại tiền
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-red-100 space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Ngân hàng
                      </p>
                      <p className="font-black text-slate-800 uppercase">
                        {order.returnInfo.bankInfo.bankName}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-red-100 space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Chủ tài khoản
                      </p>
                      <p className="font-black text-slate-800 uppercase">
                        {order.returnInfo.bankInfo.accountHolder}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-red-100 space-y-2 md:col-span-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Số tài khoản
                      </p>
                      <p className="text-2xl font-black text-secondary tracking-[0.2em]">
                        {order.returnInfo.bankInfo.accountNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white/50 rounded-2xl text-red-700">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p className="text-[11px] font-bold leading-relaxed uppercase">
                      Vui lòng thực hiện chuyển khoản hoàn tiền:{" "}
                      <span className="font-black text-red-600">
                        {order.totalAmount.toLocaleString()}đ
                      </span>{" "}
                      trước khi nhấn xác nhận.
                    </p>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-3">
                    <ClipboardCheck size={16} className="text-secondary" /> Danh
                    mục hàng hóa
                  </h4>
                  <span className="text-[10px] font-black text-gray-400 uppercase">
                    {order.items.length} mặt hàng
                  </span>
                </div>
                <div className="p-0 divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-6 flex items-center gap-6 hover:bg-gray-50/50 transition"
                    >
                      <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-1 flex-shrink-0">
                        <img
                          src={
                            item.thumbnailUrl || "https://picsum.photos/200/200"
                          }
                          className="w-full h-full object-contain"
                          alt=""
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase text-slate-800">
                          {item.productName}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                          Màu:{" "}
                          <span className="text-secondary">
                            {item.color || "N/A"}
                          </span>{" "}
                          • Size:{" "}
                          <span className="text-primary">
                            {item.size || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-800">
                          {item.unitPrice.toLocaleString()}đ
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-8 bg-slate-50 border-t border-gray-100 flex justify-between items-end">
                  <div className="text-right ml-auto">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      Tổng cộng thanh toán
                    </p>
                    <p className="text-4xl font-black text-red-600 tracking-tighter">
                      {order.totalAmount.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-8 shadow-sm">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 mb-6">
                    <MapPin size={18} className="text-secondary" /> Thông tin
                    giao nhận
                  </h4>
                  <div className="space-y-4">
                    <p className="font-black text-slate-800 uppercase text-lg leading-tight">
                      {order.customerName}
                    </p>
                    <p className="font-black text-slate-800 flex items-center gap-2">
                      <Smartphone size={16} className="text-gray-300" />{" "}
                      {order.customerPhone}
                    </p>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-bold text-gray-600 leading-relaxed shadow-inner">
                      {order.customerAddress}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 mb-6">
                    <CreditCard size={18} className="text-secondary" /> Thanh
                    toán
                  </h4>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-700">
                      {order.paymentMethod === "COD"
                        ? "Thanh toán COD"
                        : "Thanh toán Online"}
                    </p>
                    <div
                      className={`px-4 py-2 rounded-xl inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "PENDING_REFUND"
                          ? "bg-orange-100 text-orange-700"
                          : order.paymentStatus === "REFUNDED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {order.paymentStatus === "PAID" ? (
                        <CheckCircle size={14} />
                      ) : order.paymentStatus === "REFUNDED" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                      {order.paymentStatus === "PAID"
                        ? "Đã thanh toán"
                        : order.paymentStatus === "PENDING_REFUND"
                        ? "Chờ hoàn tiền"
                        : order.paymentStatus === "REFUNDED"
                        ? "Đã hoàn tiền"
                        : "Chưa thanh toán"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-slate-400">
            <ShieldCheck size={20} />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Hệ thống CSKH SportHub Pro v3.5
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {needsRefund && (
              <button
                onClick={() => setShowRefundConfirm(true)}
                disabled={loading}
                className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-700 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <>
                    <CheckCircle2 size={16} /> XÁC NHẬN ĐÃ HOÀN TIỀN
                  </>
                )}
              </button>
            )}

            {/* Fix shorthand OrderStatus members S1, S2 */}
            {(order.status === OrderStatus.PENDING_PAYMENT ||
              order.status === OrderStatus.PENDING_CONFIRMATION) && (
              <button
                onClick={() => setShowCancelForm(true)}
                disabled={loading}
                className="px-6 py-4 bg-white border border-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "HỦY ĐƠN HÀNG"
                )}
              </button>
            )}

            {/* Fix shorthand S2 to PENDING_CONFIRMATION */}
            {order.status === OrderStatus.PENDING_CONFIRMATION && (
              <button
                onClick={() => setShowApproveConfirm(true)}
                disabled={loading}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <>
                    <CheckCircle size={16} /> DUYỆT ĐƠN & ĐÓNG GÓI
                  </>
                )}
              </button>
            )}

            {/* Fix shorthand S3 to PACKING */}
            {order.status === OrderStatus.PACKING && (
              <button
                onClick={() => setShowHandoverModal(true)}
                disabled={loading}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={16} /> BÀN GIAO VẬN CHUYỂN
              </button>
            )}

            {/* Fix shorthand S4 to SHIPPING */}
            {order.status === OrderStatus.SHIPPING && (
              <button
                onClick={() => setShowSuccessConfirm(true)}
                disabled={loading}
                className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-700 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <>
                    <CheckCircle size={16} /> GIAO THÀNH CÔNG
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-8 py-4 bg-white border border-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Banknote size={48} />
            </div>
            <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight mb-2">
              Xác nhận hoàn tiền?
            </h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              Hành động này xác nhận bạn đã chuyển tiền thành công cho khách
              hàng theo thông tin ngân hàng được cung cấp.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowRefundConfirm(false)}
                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={loading}
                className="py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "XÁC NHẬN HOÀN TIỀN"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight mb-2">
              Duyệt đơn hàng?
            </h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              Trạng thái đơn sẽ được chuyển sang "Đang đóng gói".
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition flex items-center justify-center gap-2"
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
      )}

      {/* Custom Success Delivery Confirmation Modal */}
      {showSuccessConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black uppercase text-slate-800 tracking-tight mb-2">
              Giao hàng thành công?
            </h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              Xác nhận khách đã nhận hàng. Đơn hàng sẽ chuyển sang trạng thái
              "Hoàn tất".
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowSuccessConfirm(false)}
                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleSuccessDelivery}
                disabled={loading}
                className="py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "XÁC NHẬN HOÀN TẤT"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Cancel Form Modal */}
      {showCancelForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertOctagon size={32} />
              </div>
              <h3 className="text-xl font-black uppercase text-slate-800 tracking-tight">
                Hủy đơn hàng
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Hành động này không thể hoàn tác
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Lý do hủy đơn *
                </label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-medium text-sm outline-none focus:ring-2 focus:ring-red-500/10 h-32"
                  placeholder="Nhập lý do hủy đơn..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-10">
              <button
                onClick={() => setShowCancelForm(false)}
                className="py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loading || !cancelReason.trim()}
                className="py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "XÁC NHẬN HỦY"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-black uppercase text-slate-800 tracking-tight">
                Bàn giao Shipper
              </h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Đơn vị vận chuyển *
                  </label>
                  <select
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                    value={handoverForm.courierName}
                    onChange={(e) =>
                      setHandoverForm({
                        ...handoverForm,
                        courierName: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    <option value="Giao Hàng Nhanh (GHN)">
                      Giao Hàng Nhanh (GHN)
                    </option>
                    <option value="Viettel Post">Viettel Post</option>
                    <option value="Giao Hàng Tiết Kiệm (GHTK)">
                      Giao Hàng Tiết Kiệm (GHTK)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Nhân viên giao hàng *
                  </label>
                  <input
                    type="text"
                    placeholder="Tên nhân viên..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                    value={handoverForm.deliveryPerson}
                    onChange={(e) =>
                      setHandoverForm({
                        ...handoverForm,
                        deliveryPerson: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Mã vận đơn *
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã vận đơn..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                  value={handoverForm.trackingNumber}
                  onChange={(e) =>
                    setHandoverForm({
                      ...handoverForm,
                      trackingNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-10">
              <button
                onClick={() => setShowHandoverModal(false)}
                className="py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest"
              >
                Hủy
              </button>
              <button
                onClick={handleHandoverConfirm}
                disabled={loading}
                className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "XÁC NHẬN"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
