import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Smartphone,
  MapPin,
  ChevronDown,
  CheckCircle,
  CreditCard,
  X,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Clock,
  Save,
  Info,
  Truck,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Order, OrderStatus, UserAddress } from "../types";
import { api } from "../services";

const COD_LIMIT = 10000000; // 10 triệu

export const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, addAddress } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Success States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // OTP States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpExpiryTime, setOtpExpiryTime] = useState(300);
  const timerRef = useRef<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "HCM", // HCM: Nội thành, HN: Ngoại thành, OTHER: Tỉnh khác
    note: "",
    paymentMethod: "COD",
  });

  // Address Book States
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveToAddressBook, setSaveToAddressBook] = useState(isAuthenticated);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  // New Address Form
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Requirement 4: Calculate Shipping Fee
  const calculateShipping = () => {
    const hasFreeShipProduct = items.some((item) => item.product.freeShipping);
    if (totalPrice > 1000000 || hasFreeShipProduct) return 0;
    switch (formData.city) {
      case "HCM":
        return 20000;
      case "HN":
        return 35000;
      default:
        return 50000;
    }
  };

  const shippingFee = calculateShipping();
  const finalTotal = totalPrice + shippingFee;

  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultAddr =
        user.addresses.find((a) => a.isDefault) || user.addresses[0];

      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || defaultAddr?.phone || "",
        address: defaultAddr?.address || "",
      }));

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (showOTPModal) {
      timerRef.current = setInterval(() => {
        setOtpExpiryTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [showOTPModal]);

  // Handle address selection from address book
  const handleSelectAddress = (address: UserAddress) => {
    setFormData((prev) => ({
      ...prev,
      phone: address.phone,
      address: address.address,
    }));
    setSelectedAddressId(address.id);
    setShowAddressBookModal(false);
  };

  // Save current address to address book
  const handleSaveAddress = () => {
    if (!isAuthenticated || !user || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ số điện thoại và địa chỉ");
      return;
    }

    // Check if address already exists
    const existingAddress = user.addresses.find(
      (a) => a.phone === formData.phone && a.address === formData.address
    );

    if (existingAddress) {
      alert("Địa chỉ này đã có trong sổ địa chỉ!");
      return;
    }

    addAddress({
      name: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      isDefault: user.addresses.length === 0,
    });

    alert("✅ Đã lưu địa chỉ vào sổ địa chỉ!");
    setSaveToAddressBook(false);
  };

  // Handle creating new address from modal
  const handleCreateNewAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    await addAddress({
      name: newAddress.name,
      phone: newAddress.phone,
      address: newAddress.address,
      isDefault: user?.addresses.length === 0,
    });

    // Auto-select the newly created address
    setFormData((prev) => ({
      ...prev,
      phone: newAddress.phone,
      address: newAddress.address,
    }));

    // Reset form and close
    setNewAddress({ name: "", phone: "", address: "" });
    setShowNewAddressForm(false);
    setShowAddressBookModal(false);
    
    alert("✅ Đã thêm địa chỉ mới!");
  };

  const startOrderProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.phone ||
      !formData.fullName ||
      !formData.address ||
      !formData.email
    ) {
      alert("Vui lòng điền đầy đủ các thông tin có dấu (*)");
      return;
    }

    setLoading(true);
    try {
      const stockCheck = await api.products.validateStock(items as any);
      if (!stockCheck.valid) {
        alert(stockCheck.message);
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        const res = await api.auth.sendOTP(formData.phone);
        if (res.success) {
          setShowOTPModal(true);
          setOtpExpiryTime(300);
          setOtpError("");
          setOtpValue("");
        } else {
          alert(res.message);
        }
      } else {
        await finalizeOrder();
      }
    } catch (err) {
      alert("Lỗi kết nối hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpExpiryTime <= 0) {
      setOtpError("Mã OTP đã hết hạn.");
      return;
    }
    setOtpLoading(true);
    try {
      const result = await api.auth.verifyOTP(otpValue);
      if (result.valid) {
        setShowOTPModal(false);
        await finalizeOrder();
      } else {
        setOtpError(result.message);
      }
    } catch (err) {
      setOtpError("Lỗi xác thực.");
    } finally {
      setOtpLoading(false);
    }
  };

  const finalizeOrder = async () => {
    setIsProcessingOrder(true);
    // Tạo mã đơn ngẫu nhiên chuyên nghiệp
    const orderCode = `ORD-${Date.now().toString().slice(-6)}${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;

    // Debug mã đơn hàng trong môi trường test
    console.log(
      `%c[TEST ENVIRONMENT] ĐƠN HÀNG MỚI: ${orderCode}`,
      "color: #10b981; font-weight: bold; font-size: 14px;"
    );

    // Fix shorthand OrderStatus.S2 to OrderStatus.PENDING_CONFIRMATION and S1 to PENDING_PAYMENT
    const initialStatus =
      formData.paymentMethod === "COD"
        ? OrderStatus.PENDING_CONFIRMATION
        : OrderStatus.PENDING_PAYMENT;

    const newOrder: Order = {
      id: Date.now().toString(),
      orderCode: orderCode,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      customerNotes: formData.note,
      customerType: isAuthenticated ? "member" : "guest",
      totalAmount: finalTotal,
      shippingFee: shippingFee,
      status: initialStatus,
      paymentMethod: formData.paymentMethod as any,
      paymentStatus: "UNPAID",
      createdAt: new Date().toISOString(),
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.promotionalPrice || i.product.basePrice,
        thumbnailUrl: i.product.thumbnailUrl,
        color: i.variant.color,
        size: i.variant.size,
      })),
    };

    try {
      const finalStockCheck = await api.products.validateStock(items as any);
      if (!finalStockCheck.valid) {
        alert(finalStockCheck.message);
        setIsProcessingOrder(false);
        return;
      }

      console.log("🛒 [CHECKOUT] Bắt đầu tạo đơn hàng:", newOrder.orderCode);

      await api.orders.create(newOrder);

      if (formData.paymentMethod === "COD") {
        console.log("📦 [CHECKOUT] Trừ kho cho đơn hàng COD");
        await api.products.deductStock(newOrder.items);

        // Auto-save address to address book if user is logged in and saveToAddressBook is checked
        if (isAuthenticated && user && saveToAddressBook) {
          const existingAddress = user.addresses.find(
            (a) => a.phone === formData.phone && a.address === formData.address
          );

          if (!existingAddress) {
            addAddress({
              name: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              isDefault: user.addresses.length === 0,
            });
            console.log("📍 [CHECKOUT] Đã lưu địa chỉ vào sổ địa chỉ");
          }
        }

        // Hiển thị Modal thay vì alert
        setSuccessOrder(newOrder);
        setShowSuccessModal(true);
        clearCart();
      } else {
        console.log("💳 [CHECKOUT] Chuyển sang cổng thanh toán online");
        // Không trừ kho ngay, sẽ trừ khi thanh toán thành công
        navigate("/payment-gateway", { state: { order: newOrder } });
      }
    } catch (err: any) {
      console.error("❌ [CHECKOUT] Lỗi tạo đơn hàng:", err);

      // Hiển thị error message chi tiết
      const errorMessage =
        err?.message || err?.toString() || "Lỗi không xác định";
      alert(
        `❌ Lỗi khi tạo đơn hàng:\n\n${errorMessage}\n\nVui lòng kiểm tra console (F12) để xem chi tiết.`
      );
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (items.length === 0 && !isProcessingOrder && !showSuccessModal) {
    navigate("/cart");
    return null;
  }

  const copyOrderCode = () => {
    if (successOrder) {
      navigator.clipboard.writeText(successOrder.orderCode);
      alert("Đã sao chép mã đơn hàng!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">
              Thanh toán
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {isAuthenticated
                ? "Hội viên SportHub"
                : "Mua hàng không cần đăng nhập"}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={startOrderProcess}
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
      >
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h2 className="font-black text-xl mb-8 flex items-center gap-3 uppercase tracking-tight">
              <span className="bg-secondary text-white w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-md font-black">
                1
              </span>
              Thông tin giao hàng
            </h2>

            {/* Quick Address Selection Button */}
            {isAuthenticated && user && user.addresses.length > 0 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowAddressBookModal(true)}
                  className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:border-blue-400 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-blue-900 uppercase">
                        Chọn từ sổ địa chỉ
                      </p>
                      <p className="text-[10px] text-blue-600 mt-0.5">
                        {user.addresses.length} địa chỉ đã lưu
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-blue-500 group-hover:translate-x-1 transition" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField
                label="Họ và tên *"
                required
                value={formData.fullName}
                onChange={(v: any) => setFormData({ ...formData, fullName: v })}
              />
              <InputField
                label="Email (Nhận thông tin đơn hàng) *"
                type="email"
                required
                value={formData.email}
                onChange={(v: any) => setFormData({ ...formData, email: v })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField
                label="Số điện thoại *"
                type="tel"
                required
                value={formData.phone}
                onChange={(v: any) => setFormData({ ...formData, phone: v })}
              />
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Khu vực *
                </label>
                <select
                  className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-secondary/10 transition font-black text-sm cursor-pointer"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                >
                  <option value="HCM">Nội thành TP.HCM (Phí: 20k)</option>
                  <option value="HN">Hà Nội / Ngoại thành (Phí: 35k)</option>
                  <option value="OTHER">Các tỉnh thành khác (Phí: 50k)</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <InputField
                label="Địa chỉ chi tiết (Số nhà, tên đường...) *"
                required
                value={formData.address}
                onChange={(v: any) => setFormData({ ...formData, address: v })}
              />
            </div>

            {/* Save to Address Book Options - Only for authenticated users */}
            {isAuthenticated && user && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveToAddressBook}
                    onChange={(e) => setSaveToAddressBook(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="saveAddress"
                      className="text-xs font-black text-green-900 uppercase cursor-pointer"
                    >
                      Lưu địa chỉ này vào sổ địa chỉ
                    </label>
                    <p className="text-[10px] text-green-700 mt-1">
                      Địa chỉ sẽ được lưu tự động khi đặt hàng thành công
                    </p>
                  </div>
                  {saveToAddressBook && (
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition"
                    >
                      <Save size={14} />
                      Lưu ngay
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Ghi chú đơn hàng
              </label>
              <textarea
                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-secondary/10 transition font-medium text-sm h-24"
                placeholder="VD: Giao giờ hành chính, gọi trước khi đến..."
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h2 className="font-black text-xl mb-8 flex items-center gap-3 uppercase tracking-tight">
              <span className="bg-secondary text-white w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-md font-black">
                2
              </span>
              Thanh toán
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaymentOption
                id="cod"
                icon={<Smartphone />}
                label="Tiền mặt (COD)"
                description="Thanh toán khi nhận hàng"
                selected={formData.paymentMethod === "COD"}
                onSelect={() =>
                  setFormData({ ...formData, paymentMethod: "COD" })
                }
              />
              <PaymentOption
                id="online"
                icon={<CreditCard />}
                label="Chuyển khoản / Thẻ"
                description="Thanh toán qua cổng online"
                selected={formData.paymentMethod === "ONLINE"}
                onSelect={() =>
                  setFormData({ ...formData, paymentMethod: "ONLINE" })
                }
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 sticky top-24">
            <h2 className="font-black text-xl mb-8 uppercase tracking-tight">
              Đơn hàng của bạn
            </h2>
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <img
                    src={
                      item.product.thumbnailUrl ||
                      "https://via.placeholder.com/64"
                    }
                    className="w-16 h-16 rounded-xl object-cover border"
                    alt={item.product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/64?text=No+Image";
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-black text-gray-800 text-[11px] line-clamp-1 uppercase">
                      {item.product.name}
                    </p>
                    <p className="text-[9px] text-gray-400 font-black uppercase">
                      {item.variant.size} • {item.variant.color} x{" "}
                      {item.quantity}
                    </p>
                    <p className="text-xs font-black text-gray-900 mt-1">
                      {(
                        item.product.promotionalPrice || item.product.basePrice
                      ).toLocaleString()}
                      đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Tạm tính</span>
                <span className="text-gray-800">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Truck size={14} /> Phí vận chuyển
                </span>
                <span
                  className={
                    shippingFee === 0 ? "text-green-500" : "text-gray-800"
                  }
                >
                  {shippingFee === 0
                    ? "MIỄN PHÍ"
                    : `+${shippingFee.toLocaleString()}đ`}
                </span>
              </div>
              <div className="flex justify-between items-center py-6 mt-4 border-t border-gray-100">
                <span className="font-black text-gray-800 text-lg uppercase">
                  Tổng cộng
                </span>
                <span className="font-black text-3xl text-red-600 tracking-tighter">
                  {finalTotal.toLocaleString()}đ
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-secondary hover:bg-blue-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-blue-500/30 transition transform active:scale-95 flex justify-center items-center gap-3 text-lg disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="animate-spin" />
              ) : (
                <>
                  <Lock size={20} /> HOÀN TẤT ĐẶT HÀNG
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone size={32} />
              </div>
              <h3 className="text-xl font-black uppercase">
                Xác thực khách hàng
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Vui lòng nhập mã OTP đã gửi tới{" "}
                <b className="text-gray-800">{formData.phone}</b> để xác thực
                thông tin đặt hàng.
              </p>
            </div>
            <input
              type="text"
              maxLength={6}
              autoFocus
              className="w-full text-center text-4xl font-black tracking-[0.5em] border-none bg-gray-50 rounded-2xl py-6 outline-none ring-2 ring-gray-100 focus:ring-secondary/20 transition mb-6"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
            />
            {otpError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {otpError}
              </div>
            )}
            <button
              onClick={handleVerifyOTP}
              disabled={otpValue.length < 6 || otpLoading}
              className="w-full py-5 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition hover:bg-blue-600 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {otpLoading ? (
                <RefreshCw className="animate-spin" />
              ) : (
                "XÁC NHẬN MÃ"
              )}
            </button>
            <p className="mt-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Thời gian:{" "}
              <b className="text-gray-800">
                {Math.floor(otpExpiryTime / 60)}:
                {(otpExpiryTime % 60).toString().padStart(2, "0")}
              </b>
            </p>
            <button
              onClick={() => setShowOTPModal(false)}
              className="w-full mt-6 py-2 text-[10px] font-black text-gray-300 uppercase hover:text-red-500 transition"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS MODAL */}
      {showSuccessModal && successOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={64} />
            </div>

            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-2">
              ĐẶT HÀNG THÀNH CÔNG!
            </h2>
            <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
              Cảm ơn bạn đã tin tưởng SportHub. Đơn hàng của bạn đã được tiếp
              nhận và đang xử lý.
            </p>

            <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 mb-8 relative group">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Mã đơn hàng của bạn
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black text-secondary tracking-tight">
                  {successOrder.orderCode}
                </span>
                <button
                  onClick={copyOrderCode}
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
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800 uppercase">
                    Xác nhận đơn hàng
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">
                    Thông tin chi tiết đã được gửi tới email{" "}
                    <b className="text-gray-700">
                      {successOrder.customerPhone && formData.email}
                    </b>
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 text-secondary rounded-2xl shrink-0">
                  <Smartphone size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800 uppercase">
                    Tra cứu đơn hàng
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">
                    Sử dụng SĐT{" "}
                    <b className="text-gray-700">
                      {successOrder.customerPhone}
                    </b>{" "}
                    và mã đơn này để tra cứu tại mục "Tra cứu đơn hàng".
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/tracking")}
                className="py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition"
              >
                <ExternalLink size={16} /> TRA CỨU NGAY
              </button>
              <button
                onClick={() => navigate("/products")}
                className="py-5 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition"
              >
                TIẾP TỤC MUA SẮM
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Address Book Modal */}
      {showAddressBookModal && isAuthenticated && user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-2xl text-gray-800 uppercase tracking-tight">
                  Sổ địa chỉ
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase mt-1">
                  Chọn địa chỉ giao hàng
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddressBookModal(false);
                  setShowNewAddressForm(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(80vh-200px)]">
              {!showNewAddressForm ? (
                <>
                  {/* Address List */}
                  <div className="space-y-3 mb-6">
                    {user.addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                          selectedAddressId === addr.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-black text-sm text-gray-800">
                                {addr.name}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-black px-2 py-0.5 bg-blue-500 text-white rounded-full">
                                  MẶC ĐỊNH
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 font-bold mb-1">
                              📞 {addr.phone}
                            </p>
                            <p className="text-xs text-gray-500">
                              📍 {addr.address}
                            </p>
                          </div>
                          {selectedAddressId === addr.id && (
                            <CheckCircle size={24} className="text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Add New Address Button */}
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-bold"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xl">+</span>
                    </div>
                    Thêm địa chỉ mới
                  </button>
                </>
              ) : (
                <>
                  {/* New Address Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Tên người nhận *
                      </label>
                      <input
                        type="text"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition font-black text-sm"
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition font-black text-sm"
                        placeholder="VD: 0901234567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Địa chỉ chi tiết *
                      </label>
                      <textarea
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition font-medium text-sm h-24"
                        placeholder="VD: 123 Nguyễn Văn Linh, Quận 7, TP.HCM"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-sm uppercase transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateNewAddress}
                        className="flex-1 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase transition"
                      >
                        Thêm địa chỉ
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  required,
  disabled,
}: any) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-secondary/10 transition font-black text-sm"
    />
  </div>
);

const PaymentOption = ({
  id,
  icon,
  label,
  description,
  selected,
  onSelect,
}: any) => (
  <div
    onClick={onSelect}
    className={`p-6 border-2 rounded-[32px] cursor-pointer transition flex flex-col ${
      selected
        ? "border-secondary bg-blue-50/30"
        : "border-gray-50 bg-white hover:border-gray-100"
    }`}
  >
    <div className="flex gap-4 items-center">
      <div
        className={`p-3 rounded-2xl ${
          selected ? "bg-secondary text-white" : "bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-black text-gray-800 text-sm uppercase leading-none">
          {label}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase leading-tight">
          {description}
        </p>
      </div>
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          selected
            ? "border-secondary bg-secondary text-white"
            : "border-gray-200"
        }`}
      >
        {selected && <CheckCircle size={14} fill="currentColor" />}
      </div>
    </div>
  </div>
);
