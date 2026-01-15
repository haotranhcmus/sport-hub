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
import { getOrderStatusLabel } from "../../utils";

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

  // Get status step for timeline
  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
      case OrderStatus.PENDING_CONFIRMATION:
        return 1;
      case OrderStatus.PACKING:
        return 2;
      case OrderStatus.SHIPPING:
        return 3;
      case OrderStatus.COMPLETED:
        return 4;
      case OrderStatus.CANCELLED:
      case OrderStatus.DELIVERY_FAILED:
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep(order.status);
  const isCancelled =
    order.status === OrderStatus.CANCELLED ||
    order.status === OrderStatus.DELIVERY_FAILED;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-gray-100 rounded-lg w-[95vw] max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
        {/* Shopee-style Header */}
        <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-lg">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">
                  {order.orderCode}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    isGuest
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {isGuest ? "Khách vãng lai" : "Thành viên"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Status Banner - Shopee style */}
          <div
            className={`rounded-lg p-6 ${
              isCancelled
                ? "bg-red-50 border border-red-100"
                : "bg-gradient-to-r from-orange-50 to-orange-100/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  TRẠNG THÁI VẬN HÀNH
                </p>
                <h3
                  className={`text-2xl font-bold ${
                    isCancelled ? "text-red-600" : "text-orange-600"
                  }`}
                >
                  {statusUI.label}
                </h3>
              </div>
              {order.status === OrderStatus.SHIPPING &&
                order.trackingNumber && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Đơn vị: {order.courierName}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Mã vận đơn: {order.trackingNumber}
                    </p>
                    {order.deliveryPerson && (
                      <p className="text-xs text-gray-500">
                        Người giao: {order.deliveryPerson}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Refund Section */}
              {needsRefund && order.returnInfo?.bankInfo && (
                <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                  <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center gap-2">
                    <RotateCcw size={16} className="text-red-500" />
                    <span className="font-medium text-red-700">
                      Yêu cầu hoàn tiền (Thanh toán Online)
                    </span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Ngân hàng</p>
                        <p className="font-medium text-gray-800">
                          {order.returnInfo.bankInfo.bankName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Chủ tài khoản
                        </p>
                        <p className="font-medium text-gray-800">
                          {order.returnInfo.bankInfo.accountHolder}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Số tài khoản</p>
                      <p className="text-xl font-bold text-orange-600 tracking-wider">
                        {order.returnInfo.bankInfo.accountNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg text-orange-700">
                      <AlertTriangle size={16} />
                      <p className="text-xs">
                        Hoàn tiền:{" "}
                        <strong>₫{order.totalAmount.toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Section */}
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClipboardCheck size={16} className="text-orange-500" />
                    <span className="text-sm font-medium">
                      DANH MỤC HÀNG HÓA
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {order.items.length} mặt hàng
                  </span>
                </div>
                <div className="divide-y">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex items-center gap-4 hover:bg-gray-50 transition"
                    >
                      <div className="w-16 h-16 bg-gray-50 border rounded overflow-hidden flex-shrink-0">
                        <img
                          src={
                            item.thumbnailUrl || "https://picsum.photos/200/200"
                          }
                          className="w-full h-full object-contain"
                          alt=""
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Màu:{" "}
                          <span className="text-orange-500">
                            {item.color || "N/A"}
                          </span>{" "}
                          • Size:{" "}
                          <span className="text-blue-500">
                            {item.size || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">
                          ₫{item.unitPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Total */}
                <div className="px-5 py-4 bg-gray-50 border-t flex justify-end items-center gap-4">
                  <span className="text-sm text-gray-500">
                    TỔNG CỘNG THANH TOÁN
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₫{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-white rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2 text-gray-500 pb-3 border-b">
                  <MapPin size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">
                    THÔNG TIN GIAO NHẬN
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="font-bold text-gray-800">
                    {order.customerName}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Smartphone size={14} className="text-gray-400" />
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border">
                    {order.customerAddress}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2 text-gray-500 pb-3 border-b">
                  <CreditCard size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">THANH TOÁN</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    {order.paymentMethod === "COD"
                      ? "THANH TOÁN COD"
                      : "THANH TOÁN ONLINE"}
                  </p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-50 text-green-600"
                        : order.paymentStatus === "PENDING_REFUND"
                        ? "bg-orange-50 text-orange-600"
                        : order.paymentStatus === "REFUNDED"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {order.paymentStatus === "PAID" ? (
                      <>
                        <CheckCircle size={12} /> ĐÃ THANH TOÁN
                      </>
                    ) : order.paymentStatus === "REFUNDED" ? (
                      <>
                        <CheckCircle2 size={12} /> ĐÃ HOÀN TIỀN
                      </>
                    ) : order.paymentStatus === "PENDING_REFUND" ? (
                      <>
                        <Clock size={12} /> CHỜ HOÀN TIỀN
                      </>
                    ) : (
                      <>
                        <Clock size={12} /> CHƯA THANH TOÁN
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Shopee style */}
        <div className="bg-white border-t px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <ShieldCheck size={16} />
            <span className="text-xs">HỆ THỐNG CSKH SPORTHUB PRO V3.5</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {needsRefund && (
              <button
                onClick={() => setShowRefundConfirm(true)}
                disabled={loading}
                className="px-6 py-2.5 bg-orange-500 text-white rounded font-medium text-sm hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <>
                    <CheckCircle2 size={14} /> XÁC NHẬN ĐÃ HOÀN TIỀN
                  </>
                )}
              </button>
            )}

            {(order.status === OrderStatus.PENDING_PAYMENT ||
              order.status === OrderStatus.PENDING_CONFIRMATION) && (
              <button
                onClick={() => setShowCancelForm(true)}
                disabled={loading}
                className="px-5 py-2.5 border border-red-200 text-red-500 rounded font-medium text-sm hover:bg-red-50 transition disabled:opacity-50"
              >
                HỦY ĐƠN HÀNG
              </button>
            )}

            {order.status === OrderStatus.PENDING_CONFIRMATION && (
              <button
                onClick={() => setShowApproveConfirm(true)}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-500 text-white rounded font-medium text-sm hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <>
                    <CheckCircle size={14} /> DUYỆT ĐƠN & ĐÓNG GÓI
                  </>
                )}
              </button>
            )}

            {order.status === OrderStatus.PACKING && (
              <button
                onClick={() => setShowHandoverModal(true)}
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-500 text-white rounded font-medium text-sm hover:bg-indigo-600 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={14} /> BÀN GIAO VẬN CHUYỂN
              </button>
            )}

            {order.status === OrderStatus.SHIPPING && (
              <button
                onClick={() => setShowSuccessConfirm(true)}
                disabled={loading}
                className="px-6 py-2.5 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <>
                    <CheckCircle size={14} /> GIAO THÀNH CÔNG
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded font-medium text-sm hover:bg-gray-50 transition"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      </div>

      {/* Refund Confirmation Modal - Shopee style */}
      {showRefundConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-xl p-6 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Xác nhận hoàn tiền?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Hành động này xác nhận bạn đã chuyển tiền thành công cho khách
              hàng.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRefundConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded font-medium text-sm hover:bg-gray-200 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={loading}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded font-medium text-sm hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal - Shopee style */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-xl p-6 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Duyệt đơn hàng?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Trạng thái đơn sẽ được chuyển sang "Đang đóng gói".
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded font-medium text-sm hover:bg-gray-200 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded font-medium text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "Xác nhận duyệt"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Delivery Confirmation Modal - Shopee style */}
      {showSuccessConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-xl p-6 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Giao hàng thành công?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Xác nhận khách đã nhận hàng. Đơn hàng sẽ chuyển sang trạng thái
              "Hoàn tất".
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccessConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded font-medium text-sm hover:bg-gray-200 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleSuccessDelivery}
                disabled={loading}
                className="flex-1 py-2.5 bg-green-500 text-white rounded font-medium text-sm hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "Xác nhận hoàn tất"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Form Modal - Shopee style */}
      {showCancelForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl p-6 animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertOctagon size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Hủy đơn hàng</h3>
              <p className="text-xs text-gray-400 mt-1">
                Hành động này không thể hoàn tác
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Lý do hủy đơn *
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 h-24 resize-none"
                  placeholder="Nhập lý do hủy đơn..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCancelForm(false)}
                className="flex-1 py-2.5 text-gray-500 font-medium text-sm hover:bg-gray-50 rounded transition"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loading || !cancelReason.trim()}
                className="flex-1 py-2.5 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "Xác nhận hủy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Modal - Shopee style */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl p-6 animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Bàn giao vận chuyển
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Đơn vị vận chuyển *
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500"
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
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Nhân viên giao hàng *
                  </label>
                  <input
                    type="text"
                    placeholder="Tên nhân viên..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500"
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
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Mã vận đơn *
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã vận đơn..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500"
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
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHandoverModal(false)}
                className="flex-1 py-2.5 text-gray-500 font-medium text-sm hover:bg-gray-50 rounded transition"
              >
                Hủy
              </button>
              <button
                onClick={handleHandoverConfirm}
                disabled={loading}
                className="flex-1 py-2.5 bg-indigo-500 text-white rounded font-medium text-sm hover:bg-indigo-600 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
