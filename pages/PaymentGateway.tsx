import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  Copy,
  Smartphone,
  Mail,
  Info,
  Truck,
  Timer,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services";
import { supabase } from "../lib/supabase";
import { OrderStatus, Order } from "../types";

export const PaymentGateway = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "card">("qr");
  const order: Order = location.state?.order;

  // Reserve Stock States
  const [isStockReserved, setIsStockReserved] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Mock Card Form State
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Hàm giữ chỗ (reserve stock)
  const reserveStock = useCallback(async () => {
    if (!order || isStockReserved) return;

    try {
      console.log(
        "🔒 [PAYMENT] Giữ chỗ tồn kho cho đơn hàng:",
        order.orderCode
      );

      // Trừ kho tạm thời (đánh dấu là reserved)
      const result = await api.products.deductStock(order.items);

      if (result.success) {
        setIsStockReserved(true);
        console.log("✅ [PAYMENT] Đã giữ chỗ tồn kho thành công");

        // Cập nhật đơn hàng thành RESERVED
        await supabase
          .from("Order")
          .update({
            paymentStatus: "RESERVED",
            updatedAt: new Date().toISOString(),
          })
          .eq("orderCode", order.orderCode);

        // Invalidate cache để cập nhật tồn kho trên UI
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        setReserveError(result.message || "Không đủ hàng trong kho");
        console.error("❌ [PAYMENT] Không thể giữ chỗ:", result.message);
      }
    } catch (err: any) {
      console.error("❌ [PAYMENT] Lỗi giữ chỗ:", err);
      setReserveError(err.message || "Lỗi hệ thống");
    }
  }, [order, isStockReserved, queryClient]);

  // Hàm hoàn lại tồn kho (release stock)
  const releaseStock = useCallback(async () => {
    if (!order || !isStockReserved) return;

    try {
      console.log(
        "🔓 [PAYMENT] Hoàn lại tồn kho cho đơn hàng:",
        order.orderCode
      );

      // Cộng lại tồn kho
      for (const item of order.items) {
        const { data: currentVariant } = await supabase
          .from("ProductVariant")
          .select("stockQuantity")
          .eq("id", item.variantId)
          .single();

        if (currentVariant) {
          await supabase
            .from("ProductVariant")
            .update({
              stockQuantity: currentVariant.stockQuantity + item.quantity,
              updatedAt: new Date().toISOString(),
            })
            .eq("id", item.variantId);
        }
      }

      // Cập nhật đơn hàng thành CANCELLED
      await supabase
        .from("Order")
        .update({
          status: OrderStatus.CANCELLED,
          paymentStatus: "CANCELLED",
          updatedAt: new Date().toISOString(),
        })
        .eq("orderCode", order.orderCode);

      console.log("✅ [PAYMENT] Đã hoàn lại tồn kho thành công");

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsStockReserved(false);
    } catch (err) {
      console.error("❌ [PAYMENT] Lỗi hoàn lại tồn kho:", err);
    }
  }, [order, isStockReserved, queryClient]);

  // Kiểm tra đơn hàng và giữ chỗ khi vào trang
  useEffect(() => {
    if (!order) {
      navigate("/checkout", { replace: true });
      return;
    }

    // Kiểm tra nếu đơn hàng đã thanh toán hoặc hủy
    const checkOrderStatus = async () => {
      const { data } = await supabase
        .from("Order")
        .select("paymentStatus, status")
        .eq("orderCode", order.orderCode)
        .single();

      if (
        data?.paymentStatus === "PAID" ||
        data?.status === OrderStatus.CANCELLED
      ) {
        console.log(
          "⚠️ [PAYMENT] Đơn hàng đã thanh toán hoặc hủy, chuyển hướng..."
        );
        navigate("/products", { replace: true });
        return;
      }

      // Giữ chỗ tồn kho
      reserveStock();
    };

    checkOrderStatus();
  }, [order, navigate, reserveStock]);

  // Timer đếm ngược
  useEffect(() => {
    if (!isStockReserved || paymentCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Hết thời gian - hoàn lại tồn kho và chuyển hướng
          clearInterval(timer);
          releaseStock().then(() => {
            alert("⏰ Hết thời gian thanh toán! Đơn hàng đã bị hủy.");
            navigate("/checkout", { replace: true });
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStockReserved, paymentCompleted, releaseStock, navigate]);

  // Xử lý khi đóng tab/thoát trang (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStockReserved && !paymentCompleted) {
        e.preventDefault();
        e.returnValue = "Bạn có chắc muốn thoát? Đơn hàng sẽ bị hủy.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isStockReserved, paymentCompleted]);

  // Format thời gian
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!order) return null;

  const handleSuccess = async () => {
    if (!isStockReserved) {
      alert("Lỗi: Chưa giữ chỗ tồn kho. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    try {
      console.log("💳 [PAYMENT] Thanh toán thành công, xác nhận đơn hàng...");

      // Đã trừ kho khi reserve, giờ chỉ cần cập nhật trạng thái
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

      // Đánh dấu đã thanh toán xong (để không chạy release khi thoát)
      setPaymentCompleted(true);

      // 📧 Giả lập gửi email xác nhận thanh toán online
      const emailContent = {
        to:
          order.customerType === "member"
            ? "member@example.com"
            : order.customerPhone + "@guest.sporthub.vn",
        subject: `[SportHub] Thanh toán thành công - Đơn hàng #${order.orderCode}`,
        body: `
═══════════════════════════════════════════════════════════════════
            📧 EMAIL XÁC NHẬN THANH TOÁN ONLINE - SPORTHUB
═══════════════════════════════════════════════════════════════════

Xin chào ${order.customerName},

Thanh toán của bạn đã được xử lý thành công!

📋 THÔNG TIN ĐƠN HÀNG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mã đơn hàng: ${order.orderCode}
Phương thức: Thanh toán online
Trạng thái: ✅ ĐÃ THANH TOÁN

💰 TỔNG THANH TOÁN: ${order.totalAmount?.toLocaleString()}đ

📦 SẢN PHẨM:
${order.items
  .map(
    (item: any, i: number) =>
      `  ${i + 1}. ${item.productName} (${item.color} - ${item.size}) x${
        item.quantity
      }`
  )
  .join("\\n")}

🔗 XEM CHI TIẾT ĐƠN HÀNG:
${window.location.origin}/#/orders/${order.orderCode}

═══════════════════════════════════════════════════════════════════
Cảm ơn bạn đã tin tưởng SportHub!
═══════════════════════════════════════════════════════════════════
        `.trim(),
      };

      console.log("📧 [EMAIL SERVICE] Đang gửi email xác nhận thanh toán...");
      console.log(
        "═══════════════════════════════════════════════════════════════════"
      );
      console.log("📬 TO:", emailContent.to);
      console.log("📌 SUBJECT:", emailContent.subject);
      console.log(
        "───────────────────────────────────────────────────────────────────"
      );
      console.log(emailContent.body);
      console.log(
        "═══════════════════════════════════════════════════════════════════"
      );
      console.log("✅ [EMAIL SERVICE] Email đã được gửi thành công!");

      // Invalidate products cache để cập nhật tồn kho trên UI
      queryClient.invalidateQueries({ queryKey: ["products"] });

      // Xóa giỏ hàng
      clearCart();

      // Hiển thị modal thành công
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("❌ [PAYMENT] Lỗi xử lý thanh toán:", err);
      alert(`Lỗi hệ thống: ${err?.message || "Vui lòng thử lại"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFailure = async () => {
    // Hoàn lại tồn kho khi thanh toán thất bại
    await releaseStock();
    alert("Thanh toán thất bại. Đơn hàng đã được hủy.");
    navigate("/checkout", { replace: true });
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    // Hoàn lại tồn kho
    await releaseStock();
    navigate("/checkout", { replace: true });
  };

  // Hiển thị lỗi nếu không thể giữ chỗ
  if (reserveError) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-[40px] shadow-2xl p-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase mb-4">
            Không thể thanh toán
          </h2>
          <p className="text-gray-500 mb-8">{reserveError}</p>
          <button
            onClick={() => navigate("/checkout", { replace: true })}
            className="px-8 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

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
            {/* Timer hiển thị */}
            <div
              className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black ${
                timeLeft <= 60 ? "bg-red-500/80 animate-pulse" : "bg-white/20"
              }`}
            >
              <Timer size={16} />
              <span>Thời gian còn lại: {formatTime(timeLeft)}</span>
            </div>
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
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest hover:text-red-600 transition"
          >
            <X size={16} /> Hủy thanh toán
          </button>
        </div>
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 uppercase mb-3">
              Hủy thanh toán?
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Nếu hủy, đơn hàng sẽ bị hủy và tồn kho sẽ được hoàn lại. Bạn có
              thể đặt lại đơn hàng mới sau đó.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition"
              >
                Tiếp tục thanh toán
              </button>
              <button
                onClick={confirmCancel}
                className="py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={64} />
            </div>

            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-2">
              THANH TOÁN THÀNH CÔNG!
            </h2>
            <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
              Đơn hàng của bạn đã được thanh toán và đang được xử lý.
            </p>

            <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 mb-8 relative group">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Mã đơn hàng của bạn
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black text-secondary tracking-tight">
                  {order.orderCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderCode);
                    alert("Đã sao chép mã đơn hàng!");
                  }}
                  className="p-2 text-gray-300 hover:text-secondary transition"
                  title="Sao chép"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-6 text-left mb-10">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 text-secondary rounded-2xl shrink-0">
                  <Smartphone size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800 uppercase">
                    Tra cứu đơn hàng
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">
                    Dùng mã đơn hàng trên tại trang{" "}
                    <b className="text-gray-700">"Tra cứu đơn hàng"</b>
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 text-secondary rounded-2xl shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800 uppercase">
                    Thời gian giao hàng
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">
                    Dự kiến <b className="text-gray-700">2-5 ngày làm việc</b>{" "}
                    tùy khu vực
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 text-secondary rounded-2xl shrink-0">
                  <Info size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800 uppercase">
                    Chính sách đổi trả
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">
                    Miễn phí đổi trả trong{" "}
                    <b className="text-gray-700">7 ngày</b> nếu sản phẩm lỗi
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/", { replace: true })}
                className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition"
              >
                Về trang chủ
              </button>
              <button
                onClick={() =>
                  navigate(`/orders/${order.orderCode}`, { replace: true })
                }
                className="py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-500/20"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
