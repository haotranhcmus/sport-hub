import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  Hash,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { api } from "../services";
import { OrderStatus } from "../types";
import { useNavigate } from "react-router-dom";
import { getOrderStatusLabel } from "../utils";
import {
  subscribeToOrderById,
  unsubscribeFromOrderById,
  OrderRealtimeEvent,
} from "../lib/realtime";
import {
  ToastNotification,
  useToast,
} from "../components/common/ToastNotification";

export const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast notifications
  const { toasts, removeToast, info, success } = useToast();

  // Setup realtime subscription when order is found
  useEffect(() => {
    if (!result?.id) return;

    console.log(
      "📡 [TRACKING] Setting up realtime for order:",
      result.orderCode
    );

    const handleOrderUpdate = (event: OrderRealtimeEvent) => {
      if (event.type === "UPDATE") {
        const updatedOrder = event.new;
        console.log("🔄 [TRACKING] Order updated:", updatedOrder);

        // Show notification for status change
        if (updatedOrder.status !== result.status) {
          const oldStatus = getOrderStatusLabel(result.status);
          const newStatus = getOrderStatusLabel(updatedOrder.status);
          success(`Đơn hàng chuyển từ "${oldStatus}" → "${newStatus}"`, 7000);
        }

        // Update order in UI
        setResult(updatedOrder);
      }
    };

    const channel = subscribeToOrderById(result.id, handleOrderUpdate);

    return () => {
      console.log("🔕 [TRACKING] Cleaning up realtime subscription...");
      unsubscribeFromOrderById(channel);
    };
  }, [result?.id, success]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !phone.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin tra cứu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const order = await api.orders.trackOrder(orderCode.trim(), phone.trim());
      if (order) {
        setResult(order);
      } else {
        setError(
          "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Mã đơn và Số điện thoại đặt hàng."
        );
      }
    } catch (err) {
      setError("Có lỗi xảy ra trong quá trình tra cứu.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: OrderStatus) => {
    const label = getOrderStatusLabel(status);
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return { label, css: "bg-orange-100 text-orange-700" };
      case OrderStatus.PENDING_CONFIRMATION:
        return { label, css: "bg-blue-100 text-blue-700" };
      case OrderStatus.PACKING:
        return { label, css: "bg-indigo-100 text-indigo-700" };
      case OrderStatus.SHIPPING:
        return { label, css: "bg-purple-100 text-purple-700" };
      case OrderStatus.COMPLETED:
        return { label, css: "bg-green-100 text-green-700" };
      case OrderStatus.CANCELLED:
        return { label, css: "bg-red-100 text-red-700" };
      case OrderStatus.DELIVERY_FAILED:
        return { label, css: "bg-rose-100 text-rose-700" };
      case OrderStatus.RETURN_REQUESTED:
        return { label, css: "bg-yellow-100 text-yellow-800" };
      default:
        return { label: status, css: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tight mb-3">
          Tra cứu đơn hàng
        </h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">
          Dành cho khách vãng lai và thành viên. Vui lòng nhập thông tin dưới
          đây để theo dõi trạng thái đơn hàng của bạn.
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 mb-10">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end"
        >
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Smartphone size={14} /> Số điện thoại đặt hàng
            </label>
            <input
              type="tel"
              required
              placeholder="Nhập SĐT..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10 transition"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Hash size={14} /> Mã đơn hàng (VD: ORD-...)
            </label>
            <input
              type="text"
              required
              placeholder="Nhập mã đơn..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-black text-sm uppercase outline-none focus:ring-2 focus:ring-secondary/10 transition"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  <Search size={18} /> TÌM KIẾM
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="text-[11px] font-black uppercase tracking-tight">
              {error}
            </span>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95">
          <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Package size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  Kết quả tra cứu
                </p>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {result.orderCode}
                </h2>
              </div>
            </div>
            {(() => {
              const statusInfo = getStatusDisplay(result.status);
              return (
                <div
                  className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-inner ${statusInfo.css}`}
                >
                  {statusInfo.label}
                </div>
              );
            })()}
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">
                  Thông tin khách hàng
                </h3>
                <div className="space-y-1">
                  <p className="font-black text-gray-800 text-lg uppercase tracking-tight">
                    {result.customerName}
                  </p>
                  <p className="text-sm font-bold text-gray-500">
                    {result.customerPhone}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                    <MapPin
                      size={16}
                      className="text-secondary shrink-0 mt-0.5"
                    />{" "}
                    {result.customerAddress}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">
                  Thời gian & Hình thức
                </h3>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-600 flex items-center gap-3">
                    <Calendar size={18} className="text-gray-300" /> Ngày đặt:{" "}
                    {new Date(result.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm font-bold text-gray-600 flex items-center gap-3">
                    <ShieldCheck size={18} className="text-gray-300" /> Thanh
                    toán:{" "}
                    <span className="uppercase">
                      {result.paymentMethod === "COD"
                        ? "Tiền mặt (COD)"
                        : "Online"}
                    </span>
                  </p>
                  <p className="text-sm font-black text-red-600 uppercase tracking-tighter">
                    Tổng tiền: {result.totalAmount.toLocaleString()}đ
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-secondary rounded-xl">
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-800 uppercase">
                    Yêu cầu hỗ trợ?
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                    Hotline 1900 1234 phục vụ 24/7
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/orders/${result.orderCode}`)}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition flex items-center gap-3 group"
              >
                XEM CHI TIẾT ĐƠN HÀNG{" "}
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <ShieldCheck size={16} /> Hệ thống tra cứu bảo mật SportHub
        </div>
      </div>
    </div>
  );
};
