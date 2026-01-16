import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  Plus,
  Edit3,
  User,
  Phone,
  Home,
} from "lucide-react";
import { Order, OrderStatus, UserAddress } from "../types";
import { api } from "../services";

// Vietnam location data (for shipping calculation)
const PROVINCES = [
  { code: "01", name: "Hà Nội" },
  { code: "79", name: "TP. Hồ Chí Minh" },
  { code: "48", name: "Đà Nẵng" },
  { code: "31", name: "Hải Phòng" },
  { code: "92", name: "Cần Thơ" },
  { code: "74", name: "Bình Dương" },
  { code: "75", name: "Đồng Nai" },
  { code: "77", name: "Bà Rịa - Vũng Tàu" },
  { code: "89", name: "An Giang" },
  { code: "26", name: "Vĩnh Phúc" },
];

const DISTRICTS: Record<string, { code: string; name: string }[]> = {
  "01": [
    { code: "001", name: "Ba Đình" },
    { code: "002", name: "Hoàn Kiếm" },
    { code: "003", name: "Tây Hồ" },
    { code: "004", name: "Long Biên" },
    { code: "005", name: "Cầu Giấy" },
    { code: "006", name: "Đống Đa" },
    { code: "007", name: "Hai Bà Trưng" },
    { code: "008", name: "Hoàng Mai" },
    { code: "009", name: "Thanh Xuân" },
  ],
  "79": [
    { code: "760", name: "Quận 1" },
    { code: "761", name: "Quận 3" },
    { code: "770", name: "Bình Thạnh" },
    { code: "771", name: "Gò Vấp" },
    { code: "772", name: "Phú Nhuận" },
    { code: "773", name: "Tân Bình" },
    { code: "774", name: "Tân Phú" },
    { code: "775", name: "Thủ Đức" },
    { code: "776", name: "Bình Tân" },
  ],
};

const WARDS: Record<string, { code: string; name: string }[]> = {
  "760": [
    { code: "26734", name: "Phường Bến Nghé" },
    { code: "26737", name: "Phường Bến Thành" },
    { code: "26740", name: "Phường Cầu Kho" },
  ],
  "770": [
    { code: "26830", name: "Phường 1" },
    { code: "26833", name: "Phường 2" },
    { code: "26836", name: "Phường 3" },
  ],
  "001": [
    { code: "00001", name: "Phường Phúc Xá" },
    { code: "00004", name: "Phường Trúc Bạch" },
  ],
};

const COD_LIMIT = 10000000; // 10 triệu

export const CheckoutPage = () => {
  const queryClient = useQueryClient();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, addAddress } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // System Config for shipping calculation
  const [systemConfig, setSystemConfig] = useState<{
    storeProvinceCode: string;
    baseShippingFee: number;
    sameProvinceDiscount: number;
    freeShippingThreshold: number;
  } | null>(null);

  // Load system config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await api.system.getConfig();
        setSystemConfig({
          storeProvinceCode: config.storeProvinceCode || "79",
          baseShippingFee: config.baseShippingFee || 30000,
          sameProvinceDiscount: config.sameProvinceDiscount || 30,
          freeShippingThreshold: config.freeShippingThreshold || 1000000,
        });
      } catch (err) {
        // Default values if config fails to load
        setSystemConfig({
          storeProvinceCode: "79",
          baseShippingFee: 30000,
          sameProvinceDiscount: 30,
          freeShippingThreshold: 1000000,
        });
      }
    };
    loadConfig();
  }, []);

  // Calculate shipping fee based on province and system config
  const calculateShippingByProvince = (
    customerProvinceCode?: string
  ): number => {
    if (!systemConfig) return 30000; // Default if config not loaded
    if (!customerProvinceCode) return systemConfig.baseShippingFee;

    // Same province as store - apply discount
    if (customerProvinceCode === systemConfig.storeProvinceCode) {
      return Math.round(
        systemConfig.baseShippingFee *
          (1 - systemConfig.sameProvinceDiscount / 100)
      );
    }

    // Different province - full shipping fee
    return systemConfig.baseShippingFee;
  };

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

  // Selected Address State (Shopee style - only select from address book)
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Order form state
  const [orderNote, setOrderNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // New Address Form State
  const [newAddressForm, setNewAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    city: "",
    district: "",
    ward: "",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {}
  );

  // Get districts for selected province
  const availableDistricts = newAddressForm.provinceCode
    ? DISTRICTS[newAddressForm.provinceCode] || []
    : [];
  // Get wards for selected district
  const availableWards = newAddressForm.districtCode
    ? WARDS[newAddressForm.districtCode] || []
    : [];

  // Calculate shipping based on selected address and system config
  const calculateShipping = () => {
    // Free shipping if total exceeds threshold from system config
    const freeThreshold = systemConfig?.freeShippingThreshold || 1000000;
    if (totalPrice >= freeThreshold) return 0;

    // Calculate number of items that need shipping fee
    const itemsNeedShipping = items.filter(
      (item) => !item.product.freeShipping
    );

    // If no items need shipping, return 0
    if (itemsNeedShipping.length === 0) return 0;

    // Get base rate from selected address province (with same-province discount)
    const baseRate = calculateShippingByProvince(selectedAddress?.provinceCode);

    // Calculate total shipping: base rate for first item, 50% for additional items
    const firstItemFee = baseRate;
    const additionalItemsFee =
      (itemsNeedShipping.length - 1) * (baseRate * 0.5);
    return Math.round(firstItemFee + additionalItemsFee);
  };

  // Calculate shipping fee for each item
  const calculateItemShipping = (item: any) => {
    // Free if total order > 1 million
    if (totalPrice > 1000000) return 0;

    // Free if product has freeShipping flag
    if (item.product.freeShipping) return 0;

    // Get items needing shipping
    const itemsNeedShipping = items.filter((i) => !i.product.freeShipping);
    const itemIndex = itemsNeedShipping.findIndex(
      (i) => i.variantId === item.variantId
    );

    if (itemIndex === -1) return 0;

    // Get base rate from selected address province
    const baseRate = calculateShippingByProvince(selectedAddress?.provinceCode);

    // First item pays full, others pay 50%
    return itemIndex === 0 ? baseRate : baseRate * 0.5;
  };

  const shippingFee = calculateShipping();
  const finalTotal = totalPrice + shippingFee;

  // Initialize with default address on mount
  useEffect(() => {
    if (isAuthenticated && user && user.addresses.length > 0) {
      const defaultAddr =
        user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr);
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

  // Handle address selection
  const handleSelectAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  // Handle province change in new address form
  const handleProvinceChange = (code: string) => {
    const province = PROVINCES.find((p) => p.code === code);
    setNewAddressForm({
      ...newAddressForm,
      provinceCode: code,
      city: province?.name || "",
      districtCode: "",
      district: "",
      wardCode: "",
      ward: "",
    });
    setAddressErrors({ ...addressErrors, province: "" });
  };

  // Handle district change
  const handleDistrictChange = (code: string) => {
    const district = availableDistricts.find((d) => d.code === code);
    setNewAddressForm({
      ...newAddressForm,
      districtCode: code,
      district: district?.name || "",
      wardCode: "",
      ward: "",
    });
    setAddressErrors({ ...addressErrors, district: "" });
  };

  // Handle ward change
  const handleWardChange = (code: string) => {
    const ward = availableWards.find((w) => w.code === code);
    setNewAddressForm({
      ...newAddressForm,
      wardCode: code,
      ward: ward?.name || "",
    });
    setAddressErrors({ ...addressErrors, ward: "" });
  };

  // Validate new address form
  const validateNewAddress = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newAddressForm.name.trim())
      errors.name = "Vui lòng nhập tên người nhận";
    if (!newAddressForm.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(newAddressForm.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
    if (!newAddressForm.provinceCode)
      errors.province = "Vui lòng chọn Tỉnh/Thành phố";
    if (!newAddressForm.districtCode)
      errors.district = "Vui lòng chọn Quận/Huyện";
    if (!newAddressForm.wardCode) errors.ward = "Vui lòng chọn Phường/Xã";
    if (!newAddressForm.address.trim())
      errors.address = "Vui lòng nhập địa chỉ chi tiết";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new address and select it
  const handleCreateNewAddress = async () => {
    if (!validateNewAddress()) return;

    const newAddr: UserAddress = {
      id: crypto.randomUUID(),
      name: newAddressForm.name,
      phone: newAddressForm.phone,
      address: newAddressForm.address,
      city: newAddressForm.city,
      district: newAddressForm.district,
      ward: newAddressForm.ward,
      provinceCode: newAddressForm.provinceCode,
      districtCode: newAddressForm.districtCode,
      wardCode: newAddressForm.wardCode,
      isDefault: !user?.addresses.length,
    };

    await addAddress(newAddr);
    setSelectedAddress(newAddr);

    // Reset form
    setNewAddressForm({
      name: "",
      phone: "",
      address: "",
      provinceCode: "",
      districtCode: "",
      wardCode: "",
      city: "",
      district: "",
      ward: "",
    });
    setShowNewAddressForm(false);
    setShowAddressModal(false);
  };

  // Get full address string
  const getFullAddress = (addr: UserAddress) => {
    const parts = [addr.address, addr.ward, addr.district, addr.city].filter(
      Boolean
    );
    return parts.join(", ");
  };

  const startOrderProcess = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate selected address (Shopee style - must select from address book)
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng từ sổ địa chỉ");
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

      // For guest users, require OTP verification
      if (!isAuthenticated) {
        const res = await api.auth.sendOTP(selectedAddress.phone);
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
    // Validate address completely
    if (
      !selectedAddress ||
      !selectedAddress.name?.trim() ||
      !selectedAddress.phone?.trim()
    ) {
      alert(
        "Thông tin địa chỉ không hợp lệ. Vui lòng kiểm tra lại tên và số điện thoại."
      );
      setIsProcessingOrder(false);
      return;
    }

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
      paymentMethod === "COD"
        ? OrderStatus.PENDING_CONFIRMATION
        : OrderStatus.PENDING_PAYMENT;

    const fullAddress = getFullAddress(selectedAddress);

    const newOrder: Order = {
      id: Date.now().toString(),
      orderCode: orderCode,
      customerName: selectedAddress.name,
      customerPhone: selectedAddress.phone,
      customerAddress: fullAddress,
      customerNotes: orderNote,
      customerType: isAuthenticated ? "member" : "guest",
      totalAmount: finalTotal,
      shippingFee: shippingFee,
      status: initialStatus,
      paymentMethod: paymentMethod as any,
      paymentStatus: "UNPAID",
      createdAt: new Date().toISOString(),
      items: items.map((i) => ({
        productId: i.product.id,
        variantId: i.variantId, // ✅ Thêm variantId để track variant cụ thể
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.promotionalPrice || i.product.basePrice,
        shippingFee: calculateItemShipping(i), // ✅ Tính phí ship cho từng item
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

      if (paymentMethod === "COD") {
        console.log("📦 [CHECKOUT] Trừ kho cho đơn hàng COD");
        await api.products.deductStock(newOrder.items);

        // 📧 Giả lập gửi email xác nhận đơn hàng
        const emailContent = {
          to: isAuthenticated
            ? user?.email
            : selectedAddress?.email || "guest@example.com",
          subject: `[SportHub] Xác nhận đơn hàng #${newOrder.orderCode}`,
          body: `
═══════════════════════════════════════════════════════════════════
                    📧 EMAIL XÁC NHẬN ĐƠN HÀNG - SPORTHUB
═══════════════════════════════════════════════════════════════════

Xin chào ${newOrder.customerName},

Cảm ơn bạn đã đặt hàng tại SportHub! Đơn hàng của bạn đã được tiếp nhận.

📋 THÔNG TIN ĐƠN HÀNG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mã đơn hàng: ${newOrder.orderCode}
Ngày đặt: ${new Date(newOrder.createdAt).toLocaleString("vi-VN")}
Phương thức thanh toán: ${
            newOrder.paymentMethod === "COD"
              ? "Thanh toán khi nhận hàng (COD)"
              : "Thanh toán online"
          }

📦 SẢN PHẨM:
${newOrder.items
  .map(
    (item: any, i: number) =>
      `  ${i + 1}. ${item.productName}
     Phân loại: ${item.color} - ${item.size}
     Số lượng: ${item.quantity}
     Đơn giá: ${item.unitPrice?.toLocaleString()}đ
     Thành tiền: ${((item.unitPrice || 0) * item.quantity).toLocaleString()}đ`
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phí vận chuyển: ${newOrder.shippingFee?.toLocaleString()}đ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 TỔNG THANH TOÁN: ${newOrder.totalAmount?.toLocaleString()}đ

📍 ĐỊA CHỈ GIAO HÀNG:
${newOrder.customerName}
${newOrder.customerPhone}
${newOrder.customerAddress}

🔗 XEM CHI TIẾT ĐƠN HÀNG:
${window.location.origin}/#/orders/${newOrder.orderCode}

📱 TRA CỨU ĐƠN HÀNG:
Sử dụng SĐT ${newOrder.customerPhone} và mã đơn ${newOrder.orderCode} 
để tra cứu tại: ${window.location.origin}/#/tracking

═══════════════════════════════════════════════════════════════════
Cảm ơn bạn đã tin tưởng SportHub!
Hotline hỗ trợ: 1900 1234 (24/7)
═══════════════════════════════════════════════════════════════════
          `.trim(),
        };

        console.log("📧 [EMAIL SERVICE] Đang gửi email xác nhận đơn hàng...");
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
    navigate("/products");
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
            to="/products"
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
        <div className="lg:col-span-2 space-y-6">
          {/* SHOPEE-STYLE: Địa chỉ giao hàng Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header with gradient like Shopee */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1"></div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-red-500" />
                <h2 className="font-black text-lg text-gray-800 uppercase tracking-tight">
                  Địa Chỉ Nhận Hàng
                </h2>
              </div>

              {/* Selected Address Display - Shopee style */}
              {selectedAddress ? (
                <div
                  onClick={() => setShowAddressModal(true)}
                  className="cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-gray-800 text-base">
                          {selectedAddress.name}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600 font-semibold">
                          (+84) {selectedAddress.phone?.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {getFullAddress(selectedAddress)}
                      </p>
                      {selectedAddress.isDefault && (
                        <span className="inline-block mt-2 px-2 py-0.5 border border-red-500 text-red-500 text-[10px] font-bold uppercase">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="text-blue-500 hover:text-blue-600 text-sm font-bold uppercase tracking-wide flex items-center gap-1 opacity-60 group-hover:opacity-100 transition"
                    >
                      Thay đổi
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Shipping Fee Preview */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Truck size={16} className="text-green-500" />
                      <span>Phí vận chuyển:</span>
                    </div>
                    <span
                      className={`font-black ${
                        shippingFee === 0 ? "text-green-500" : "text-gray-800"
                      }`}
                    >
                      {shippingFee === 0
                        ? "MIỄN PHÍ"
                        : `${shippingFee.toLocaleString()}đ`}
                    </span>
                  </div>
                </div>
              ) : (
                /* No Address Selected - Prompt to add */
                <div
                  onClick={() => setShowAddressModal(true)}
                  className="cursor-pointer p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-red-300 hover:bg-red-50/30 transition group"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-100 transition">
                    <Plus
                      size={32}
                      className="text-gray-400 group-hover:text-red-500 transition"
                    />
                  </div>
                  <p className="text-sm font-bold text-gray-600 group-hover:text-red-600 transition">
                    {user?.addresses.length
                      ? "Chọn địa chỉ giao hàng"
                      : "Thêm địa chỉ giao hàng"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                    Bấm để {user?.addresses.length ? "chọn" : "thêm"} địa chỉ
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Products Section - Shopee style */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-black text-lg text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck size={20} className="text-red-500" />
                Sản Phẩm
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item) => {
                const itemShipping = calculateItemShipping(item);
                return (
                  <div key={item.variantId} className="p-4 flex gap-4">
                    <img
                      src={
                        item.product.thumbnailUrl ||
                        "https://via.placeholder.com/80"
                      }
                      className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                      alt={item.product.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Phân loại: {item.variant.color}, {item.variant.size}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-red-500 font-black">
                          {(
                            item.product.promotionalPrice ||
                            item.product.basePrice
                          ).toLocaleString()}
                          đ
                        </span>
                        <span className="text-gray-500 text-sm">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Note */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <MessageSquare size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Lưu ý cho Người bán..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method - Shopee style */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="font-black text-lg mb-6 uppercase tracking-tight flex items-center gap-2">
              <CreditCard size={20} className="text-red-500" />
              Phương Thức Thanh Toán
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaymentOption
                id="cod"
                icon={<Smartphone />}
                label="Thanh toán khi nhận hàng"
                description="COD - Tiền mặt"
                selected={paymentMethod === "COD"}
                onSelect={() => setPaymentMethod("COD")}
              />
              <PaymentOption
                id="online"
                icon={<CreditCard />}
                label="Chuyển khoản / Thẻ"
                description="Thanh toán online"
                selected={paymentMethod === "ONLINE"}
                onSelect={() => setPaymentMethod("ONLINE")}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <h2 className="font-black text-lg mb-6 uppercase tracking-tight">
              Chi tiết thanh toán
            </h2>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng tiền hàng</span>
                <span className="text-gray-800 font-bold">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Truck size={14} /> Phí vận chuyển
                </span>
                <span
                  className={`font-bold ${
                    shippingFee === 0 ? "text-green-500" : "text-gray-800"
                  }`}
                >
                  {shippingFee === 0
                    ? "Miễn phí"
                    : `${shippingFee.toLocaleString()}đ`}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <span className="text-gray-800 font-bold">Tổng thanh toán</span>
                <span className="font-black text-2xl text-red-500">
                  {finalTotal.toLocaleString()}đ
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedAddress}
              className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-500/30 transition transform active:scale-95 flex justify-center items-center gap-3 text-base disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {loading ? <RefreshCw className="animate-spin" /> : "Đặt hàng"}
            </button>

            {!selectedAddress && (
              <p className="text-center text-red-500 text-xs mt-3 font-bold">
                Vui lòng chọn địa chỉ giao hàng
              </p>
            )}
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
                <b className="text-gray-800">{selectedAddress?.phone}</b> để xác
                thực thông tin đặt hàng.
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
              {/* Thông báo email - khác nhau cho member và guest */}
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-50 text-secondary rounded-2xl shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800 uppercase">
                    {isAuthenticated
                      ? "Xác nhận đơn hàng"
                      : "📧 Email xác nhận đã gửi"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">
                    {isAuthenticated ? (
                      <>
                        Thông tin chi tiết đã được gửi tới email{" "}
                        <b className="text-gray-700">{user?.email || ""}</b>
                      </>
                    ) : (
                      <>
                        Hệ thống đã gửi email xác nhận đến{" "}
                        <b className="text-gray-700">
                          {successOrder.guestEmail ||
                            selectedAddress?.email ||
                            "email của bạn"}
                        </b>
                        . Vui lòng kiểm tra hộp thư (kể cả Spam).
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Link xem chi tiết đơn hàng cho guest */}
              {!isAuthenticated && (
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0">
                    <ExternalLink size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-800 uppercase">
                      🔗 Xem chi tiết đơn hàng
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-relaxed mb-2">
                      Nhấn vào link bên dưới hoặc sao chép để xem đơn hàng:
                    </p>
                    <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                      <code className="text-[9px] text-gray-600 flex-1 break-all">
                        {`${window.location.origin}/#/orders/${successOrder.orderCode}`}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/#/orders/${successOrder.orderCode}`
                          );
                          alert("Đã sao chép link!");
                        }}
                        className="p-1.5 text-gray-400 hover:text-secondary transition shrink-0"
                        title="Sao chép link"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
              {!isAuthenticated ? (
                <button
                  onClick={() => navigate(`/orders/${successOrder.orderCode}`)}
                  className="py-5 bg-secondary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                >
                  <ExternalLink size={16} /> XEM ĐƠN HÀNG
                </button>
              ) : (
                <button
                  onClick={() => navigate("/tracking")}
                  className="py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition"
                >
                  <ExternalLink size={16} /> TRA CỨU NGAY
                </button>
              )}
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

      {/* Address Selection Modal - SportHub Style */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50">
              <div>
                <h3 className="font-black text-xl text-gray-800">
                  Địa Chỉ Của Tôi
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Chọn địa chỉ nhận hàng
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setShowNewAddressForm(false);
                }}
                className="p-2 hover:bg-white/80 rounded-xl transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {!showNewAddressForm ? (
                <>
                  {/* Address List */}
                  <div className="space-y-3 mb-6">
                    {user?.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                          selectedAddress?.id === addr.id
                            ? "border-red-500 bg-red-50/50"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              selectedAddress?.id === addr.id
                                ? "border-red-500 bg-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedAddress?.id === addr.id && (
                              <CheckCircle2 size={12} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800">
                                {addr.name}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-600 text-sm">
                                (+84) {addr.phone?.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {getFullAddress(addr)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 border border-red-500 text-red-500 text-[10px] font-bold">
                                  Mặc định
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Address Button */}
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-red-400 hover:bg-red-50/30 transition flex items-center justify-center gap-2 text-gray-600 hover:text-red-500"
                  >
                    <Plus size={20} />
                    <span className="font-bold">Thêm Địa Chỉ Mới</span>
                  </button>
                </>
              ) : (
                /* New Address Form - Shopee style with province/district/ward */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={newAddressForm.name}
                        onChange={(e) => {
                          setNewAddressForm({
                            ...newAddressForm,
                            name: e.target.value,
                          });
                          setAddressErrors({ ...addressErrors, name: "" });
                        }}
                        className={`w-full border rounded-xl px-4 py-3 outline-none text-sm ${
                          addressErrors.name
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-red-400"
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {addressErrors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {addressErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={newAddressForm.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setNewAddressForm({
                            ...newAddressForm,
                            phone: value,
                          });
                          setAddressErrors({ ...addressErrors, phone: "" });
                        }}
                        maxLength={11}
                        className={`w-full border rounded-xl px-4 py-3 outline-none text-sm ${
                          addressErrors.phone
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-red-400"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {addressErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {addressErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">
                        Tỉnh/Thành phố
                      </label>
                      <select
                        value={newAddressForm.provinceCode}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-3 outline-none text-sm appearance-none bg-white ${
                          addressErrors.province
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-red-400"
                        }`}
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {PROVINCES.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {addressErrors.province && (
                        <p className="text-red-500 text-xs mt-1">
                          {addressErrors.province}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">
                        Quận/Huyện
                      </label>
                      <select
                        value={newAddressForm.districtCode}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={!newAddressForm.provinceCode}
                        className={`w-full border rounded-xl px-3 py-3 outline-none text-sm appearance-none bg-white disabled:opacity-50 ${
                          addressErrors.district
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-red-400"
                        }`}
                      >
                        <option value="">Chọn quận/huyện</option>
                        {availableDistricts.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      {addressErrors.district && (
                        <p className="text-red-500 text-xs mt-1">
                          {addressErrors.district}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">
                        Phường/Xã
                      </label>
                      <select
                        value={newAddressForm.wardCode}
                        onChange={(e) => handleWardChange(e.target.value)}
                        disabled={!newAddressForm.districtCode}
                        className={`w-full border rounded-xl px-3 py-3 outline-none text-sm appearance-none bg-white disabled:opacity-50 ${
                          addressErrors.ward
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-red-400"
                        }`}
                      >
                        <option value="">Chọn phường/xã</option>
                        {availableWards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                      {addressErrors.ward && (
                        <p className="text-red-500 text-xs mt-1">
                          {addressErrors.ward}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Địa chỉ cụ thể
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.address}
                      onChange={(e) => {
                        setNewAddressForm({
                          ...newAddressForm,
                          address: e.target.value,
                        });
                        setAddressErrors({ ...addressErrors, address: "" });
                      }}
                      className={`w-full border rounded-xl px-4 py-3 outline-none text-sm ${
                        addressErrors.address
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-red-400"
                      }`}
                      placeholder="Số nhà, tên đường..."
                    />
                    {addressErrors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {addressErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAddressForm(false);
                        setNewAddressForm({
                          name: "",
                          phone: "",
                          address: "",
                          provinceCode: "",
                          districtCode: "",
                          wardCode: "",
                          city: "",
                          district: "",
                          ward: "",
                        });
                        setAddressErrors({});
                      }}
                      className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm transition"
                    >
                      Trở Lại
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewAddress}
                      className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition"
                    >
                      Hoàn Thành
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with confirm button */}
            {!showNewAddressForm && selectedAddress && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition"
                >
                  Xác Nhận
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    className={`p-4 border-2 rounded-2xl cursor-pointer transition ${
      selected
        ? "border-red-500 bg-red-50/30"
        : "border-gray-100 bg-white hover:border-red-200"
    }`}
  >
    <div className="flex gap-3 items-center">
      <div
        className={`p-2 rounded-xl ${
          selected ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-red-500 bg-red-500" : "border-gray-300"
        }`}
      >
        {selected && <CheckCircle2 size={12} className="text-white" />}
      </div>
    </div>
  </div>
);
