import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  QrCode,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Landmark,
  CreditCard,
  RefreshCw,
  Lock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services";
import { supabase } from "../lib/supabase";
import { OrderStatus, Order } from "../types";

export const PaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "card">("qr");
  const order: Order = location.state?.order;

  // Mock Card Form State
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    if (!order) {
      navigate("/checkout");
    }
  }, [order, navigate]);

  if (!order) return null;

  const handleSuccess = async () => {
    setLoading(true);
    try {
      console.log("💳 [PAYMENT] Thanh toán thành công, bắt đầu xử lý...");

      // Trừ kho khi thanh toán thành công
      console.log("📦 [PAYMENT] Trừ kho cho đơn hàng");
      const deductResult = await api.products.deductStock(order.items);

      if (deductResult.success) {
        console.log(
          "✅ [PAYMENT] Trừ kho thành công, cập nhật trạng thái đơn hàng"
        );

        // Cập nhật đơn hàng (KHÔNG TẠO MỚI)
        const { error } = await supabase
          .from("Order")
          .update({
            paymentStatus: "PAID",
            status: OrderStatus.PENDING_CONFIRMATION,
            updatedAt: new Date().toISOString(),
          })
          .eq("orderCode", order.orderCode);

        if (error) {
          console.error("❌ [PAYMENT] Lỗi cập nhật đơn hàng:", error);
          throw new Error(error.message);
        }

        console.log(
          "🎉 [PAYMENT] Hoàn tất thanh toán cho đơn hàng:",
          order.orderCode
        );

        alert(
          "Thanh toán thành công! Đang chuyển hướng tới chi tiết đơn hàng..."
        );

        // Xóa giỏ hàng
        clearCart();

        // ĐIỀU HƯỚNG
        navigate(`/orders/${order.orderCode}`);
      } else {
        alert("Lỗi: Không đủ hàng trong kho. Vui lòng liên hệ hỗ trợ.");
      }
    } catch (err: any) {
      console.error("❌ [PAYMENT] Lỗi xử lý thanh toán:", err);
      alert(`Lỗi hệ thống: ${err?.message || "Vui lòng thử lại"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFailure = () => {
    alert("Thanh toán thất bại. Vui lòng thử lại.");
    navigate("/checkout", { state: { order, paymentFailed: true } });
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-secondary p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <ShieldCheck size={120} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black backdrop-blur-md border border-white/20 mb-4 uppercase tracking-[0.2em]">
              <ShieldCheck size={14} /> Cổng thanh toán giả lập
            </div>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">
              Thanh toán trực tuyến
            </h1>
            <p className="text-blue-100 text-sm font-bold opacity-80 uppercase tracking-widest">
              Đơn hàng: {order.orderCode} • {order.totalAmount.toLocaleString()}
              đ
            </p>
          </div>
        </div>

        <div className="bg-orange-50 border-y border-orange-100 p-4 flex items-center justify-center gap-3 text-orange-700">
          <AlertCircle size={20} className="animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest">
            Môi trường TEST - Vui lòng không nhập thông tin thẻ thật
          </span>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
              Chọn phương thức
            </h3>
            <button
              onClick={() => setActiveTab("qr")}
              className={`w-full p-6 rounded-3xl border-2 transition flex items-center gap-4 ${
                activeTab === "qr"
                  ? "border-secondary bg-blue-50/50"
                  : "border-gray-50 hover:border-gray-200"
              }`}
            >
              <div
                className={`p-3 rounded-2xl ${
                  activeTab === "qr"
                    ? "bg-secondary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <QrCode size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase">Quét mã QR</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                  Nhanh chóng & Tiện lợi
                </p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("card")}
              className={`w-full p-6 rounded-3xl border-2 transition flex items-center gap-4 ${
                activeTab === "card"
                  ? "border-secondary bg-blue-50/50"
                  : "border-gray-50 hover:border-gray-200"
              }`}
            >
              <div
                className={`p-3 rounded-2xl ${
                  activeTab === "card"
                    ? "bg-secondary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <CreditCard size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase">Thẻ Quốc tế</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                  Visa, Master, JCB
                </p>
              </div>
            </button>
          </div>

          <div className="lg:col-span-8 bg-gray-50/50 rounded-[40px] border border-gray-100 p-8 md:p-10">
            {activeTab === "qr" ? (
              <div className="flex flex-col items-center space-y-8 animate-in zoom-in-95">
                <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-gray-100 relative">
                  <div className="w-64 h-64 bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                    <QrCode size={180} className="text-gray-800 opacity-20" />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-secondary text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg">
                    DYNAMIC QR
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black uppercase tracking-tight">
                    Quét mã để thanh toán
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">
                    Sử dụng ứng dụng ngân hàng bất kỳ
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                  <button
                    onClick={handleFailure}
                    className="py-4 border border-red-100 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition"
                  >
                    Thanh toán lỗi
                  </button>
                  <button
                    onClick={handleSuccess}
                    disabled={loading}
                    className="py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-700 transition flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      "XÁC NHẬN THÀNH CÔNG"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      Thông tin thẻ
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Số thẻ (VD: 4242...)"
                      className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-secondary/20 font-black text-lg tracking-widest transition"
                      value={cardData.number}
                      onChange={(e) =>
                        setCardData({ ...cardData, number: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Tên trên thẻ"
                      className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-secondary/20 font-black uppercase transition"
                      value={cardData.name}
                      onChange={(e) =>
                        setCardData({ ...cardData, name: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-secondary/20 font-black transition text-center"
                        value={cardData.expiry}
                        onChange={(e) =>
                          setCardData({ ...cardData, expiry: e.target.value })
                        }
                      />
                      <input
                        type="password"
                        placeholder="CVC"
                        maxLength={3}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-secondary/20 font-black transition text-center"
                        value={cardData.cvv}
                        onChange={(e) =>
                          setCardData({ ...cardData, cvv: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSuccess}
                  disabled={loading || !cardData.number}
                  className="w-full h-16 bg-secondary hover:bg-blue-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-30 flex items-center justify-center"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Lock size={20} /> THANH TOÁN NGAY
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-8 flex justify-center border-t border-gray-100">
          <button
            onClick={() => navigate("/checkout")}
            className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest hover:text-gray-800 transition"
          >
            <ArrowLeft size={16} /> Hủy & Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};
