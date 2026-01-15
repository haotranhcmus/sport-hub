import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Star,
  RefreshCw,
  Info,
  Image as ImageIcon,
  XCircle,
  AlertTriangle,
  Camera,
  X,
  Minus,
  Plus,
  ChevronDown,
  Landmark,
  Clock,
  UserCheck,
  ExternalLink,
  ClipboardCheck,
  ArrowRightLeft,
  Banknote,
  Upload,
  ChevronRight,
  Eye,
  Trash2,
  Undo2,
  FileText,
  AlertOctagon,
  MessageSquare,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  Order,
  OrderStatus,
  ReturnRequestData,
  Review,
  OrderItem,
  Product,
} from "../types";
import { api } from "../services";
import { useAuth } from "../context/AuthContext";

const RETURN_REASONS = [
  { id: "defective", label: "Sản phẩm lỗi (Rách, hỏng...)" },
  { id: "wrong_item", label: "Giao sai mẫu mã" },
  { id: "wrong_size", label: "Không vừa kích cỡ" },
  { id: "quality", label: "Chất lượng kém" },
  { id: "other", label: "Lý do khác" },
];

const CANCEL_REASONS = [
  { id: "wrong_info", label: "Sai thông tin nhận hàng" },
  { id: "change_mind", label: "Đổi ý, không muốn mua nữa" },
  { id: "cheaper_elsewhere", label: "Tìm thấy chỗ khác rẻ hơn" },
  { id: "payment_issue", label: "Lỗi khi thanh toán" },
  { id: "other", label: "Lý do khác" },
];

const handleFileRead = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const OrderDetailPage = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showViewReviewModal, setShowViewReviewModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    images: [] as string[],
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const reviewFileInputRef = useRef<HTMLInputElement>(null);

  // Cancellation States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    reasonId: "",
    otherText: "",
    bankInfo: { bankName: "", accountNumber: "", accountHolder: "" },
  });

  // Return Modal States - PER ITEM
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returningItem, setReturningItem] = useState<OrderItem | null>(null);
  const [returnForm, setReturnForm] = useState({
    type: "exchange" as "exchange" | "refund",
    selectedReasonId: "",
    otherReason: "",
    evidenceImages: [] as string[],
    exchangeToSize: "",
    exchangeToColor: "",
    bankInfo: { bankName: "", accountNumber: "", accountHolder: "" },
  });
  const returnFileInputRef = useRef<HTMLInputElement>(null);

  const isStaff = user && user.role !== "CUSTOMER";

  const fetchOrder = async () => {
    setLoading(true);
    if (code) {
      const found = await api.orders.getDetail(code);
      setOrder(found || location.state?.order);

      // Fetch products for slug lookup
      const allProducts = await api.products.list();
      setProducts(allProducts);
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrder();
  }, [code, location.state]);

  const returnDeadlineStatus = useMemo(() => {
    if (!order || order.status !== OrderStatus.COMPLETED)
      return { eligible: false, message: "" };
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return {
        eligible: false,
        message: "Đã hết thời hạn đổi trả (7 ngày kể từ lúc nhận hàng).",
      };
    }
    return { eligible: true, message: "" };
  }, [order]);

  const canCancelOrder = useMemo(() => {
    if (!order) return false;
    if (order.status === OrderStatus.CANCELLED) return false;
    return (
      order.status === OrderStatus.PENDING_PAYMENT ||
      order.status === OrderStatus.PENDING_CONFIRMATION
    );
  }, [order]);

  const handleCancelSubmit = async () => {
    if (!order) return;
    const { reasonId, otherText, bankInfo } = cancelForm;
    if (!reasonId) {
      alert("Vui lòng chọn lý do hủy đơn.");
      return;
    }
    const reasonLabel =
      CANCEL_REASONS.find((r) => r.id === reasonId)?.label || "";
    const finalReason =
      reasonId === "other"
        ? otherText
        : `${reasonLabel}${otherText ? ": " + otherText : ""}`;
    setCancelling(true);
    try {
      if (order.paymentStatus === "PAID") {
        if (
          !bankInfo.bankName ||
          !bankInfo.accountNumber ||
          !bankInfo.accountHolder
        ) {
          alert(
            "Đơn hàng đã thanh toán. Vui lòng nhập thông tin ngân hàng để hệ thống hoàn tiền."
          );
          setCancelling(false);
          return;
        }
        await api.orders.requestRefundAndCancel(
          order.id,
          finalReason,
          bankInfo
        );
        alert("Yêu cầu hủy đơn và hoàn tiền đã được gửi!");
      } else {
        await api.orders.cancelOrder(order.id, finalReason);
        alert("Đã hủy đơn hàng thành công!");
      }
      setShowCancelModal(false);
      await fetchOrder();
    } catch (err) {
      alert("Lỗi khi xử lý hủy đơn.");
    } finally {
      setCancelling(false);
    }
  };

  const openReviewModal = (item: OrderItem) => {
    setReviewingItem(item);
    setReviewForm({ rating: 5, comment: "", images: [] });
    setShowReviewModal(true);
  };

  const openViewReviewModal = (item: OrderItem) => {
    setReviewingItem(item);
    setShowViewReviewModal(true);
  };

  const handleReviewImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileRead(file);
      setReviewForm((prev) => ({ ...prev, images: [...prev.images, base64] }));
    }
    e.target.value = "";
  };

  const handleSubmitReview = async () => {
    if (!reviewingItem || !order || !user) {
      console.log("❌ Missing data:", { reviewingItem, order, user });
      return;
    }
    if (!reviewForm.comment.trim()) {
      alert("Vui lòng nhập nội dung nhận xét.");
      return;
    }

    console.log("📝 Submitting review:", {
      productId: reviewingItem.productId,
      productName: reviewingItem.productName,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      images: reviewForm.images.length,
      userName: user.fullName,
      orderCode: order.orderCode,
    });

    setSubmittingReview(true);
    try {
      // Step 1: Add review to Product
      console.log("Step 1: Adding review to Product table...");
      await api.products.addReview(
        {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          userName: user.fullName,
          avatarUrl: user.avatarUrl,
          images: reviewForm.images,
        },
        reviewingItem.productId
      );
      console.log("✅ Review added to Product table");

      // Step 2: Mark item as reviewed in Order
      console.log("Step 2: Marking item as reviewed in Order...");
      await api.orders.markAsReviewed(
        order.orderCode,
        reviewingItem.productId,
        {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          images: reviewForm.images,
          createdAt: new Date().toISOString(),
        }
      );
      console.log("✅ Item marked as reviewed in Order");

      setShowReviewModal(false);
      alert("Cảm ơn bạn đã đánh giá sản phẩm!");
      await fetchOrder();
      console.log("✅ Review submitted successfully!");
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      alert(
        "Lỗi khi gửi đánh giá: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelReturn = async () => {
    if (!order) return;

    // ✅ FIX: Get return request ID from order.returnRequests array
    const pendingRequest = order.returnRequests?.find(
      (req: any) => req.status === "PENDING"
    );

    if (!pendingRequest) {
      alert("Không tìm thấy yêu cầu đang chờ xử lý.");
      return;
    }

    setLoading(true);
    setShowCancelConfirm(false);
    try {
      // ✅ FIX: Pass returnRequest.id instead of order.id
      await api.orders.cancelReturnRequest(pendingRequest.id);
      await fetchOrder();
    } catch (err: any) {
      alert(err?.message || "Lỗi khi hủy yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  const openReturnDialog = (item: OrderItem) => {
    // Check if item can be returned
    const productData = products.find((p) => p.id === item.productId);
    if (productData && productData.allowReturn === false) {
      alert("Sản phẩm này không được phép đổi/trả.");
      return;
    }

    // Check if item already has a return request
    if (item.returnStatus && item.returnStatus !== "NONE") {
      alert("Sản phẩm này đã có yêu cầu đổi/trả.");
      return;
    }

    setReturningItem(item);
    setReturnForm({
      type: "exchange",
      selectedReasonId: "",
      otherReason: "",
      evidenceImages: [],
      exchangeToSize: item.size || "",
      exchangeToColor: item.color || "",
      bankInfo: { bankName: "", accountNumber: "", accountHolder: "" },
    });
    setShowReturnModal(true);
  };

  const handleReturnImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileRead(file);
      setReturnForm((prev) => ({
        ...prev,
        evidenceImages: [...prev.evidenceImages, base64],
      }));
    }
    e.target.value = "";
  };

  const handleSubmitReturn = async () => {
    if (!returningItem) return;

    const {
      selectedReasonId,
      otherReason,
      evidenceImages,
      type,
      bankInfo,
      exchangeToSize,
      exchangeToColor,
    } = returnForm;

    // Validation
    if (!selectedReasonId) {
      alert("Vui lòng chọn lý do.");
      return;
    }
    if (evidenceImages.length === 0) {
      alert("Vui lòng tải lên hình ảnh minh chứng.");
      return;
    }
    if (type === "refund" && order?.paymentMethod === "COD") {
      if (
        !bankInfo.bankName ||
        !bankInfo.accountNumber ||
        !bankInfo.accountHolder
      ) {
        alert("Vui lòng nhập thông tin ngân hàng.");
        return;
      }
    }

    const finalReasonLabel =
      RETURN_REASONS.find((r) => r.id === selectedReasonId)?.label || "";
    const finalReason =
      selectedReasonId === "other"
        ? otherReason
        : `${finalReasonLabel}${otherReason ? ": " + otherReason : ""}`;

    setSubmittingReturn(true);
    try {
      // Use NEW API: api.returnRequests.create()
      await api.returnRequests.create({
        orderId: order!.id,
        orderItemId: returningItem.id!,
        type: type,
        reason: finalReason,
        evidenceImages: evidenceImages,
        exchangeToSize: type === "exchange" ? exchangeToSize : undefined,
        exchangeToColor: type === "exchange" ? exchangeToColor : undefined,
        bankInfo:
          type === "refund" && order?.paymentMethod === "COD"
            ? bankInfo
            : undefined,
      });

      alert("Đã gửi yêu cầu đổi/trả thành công! Shop sẽ xử lý trong 24h.");
      setShowReturnModal(false);
      setReturningItem(null);
      await fetchOrder();
    } catch (err: any) {
      alert(err.message || "Lỗi hệ thống.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading && !order)
    return (
      <div className="py-40 text-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
          Đang tải dữ liệu...
        </p>
      </div>
    );

  if (!order)
    return (
      <div className="py-20 text-center px-4">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
          Không tìm thấy đơn hàng
        </h2>
        <Link
          to={isStaff ? "/admin" : "/products"}
          className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase shadow-xl mt-8 inline-block"
        >
          Về trang chính
        </Link>
      </div>
    );

  const getFullStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return {
          label: "Chờ thanh toán",
          color: "text-orange-600",
          bg: "bg-orange-50",
        };
      case OrderStatus.PENDING_CONFIRMATION:
        return {
          label: "Chờ xác nhận",
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
      case OrderStatus.PACKING:
        return {
          label: "Đang đóng gói",
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        };
      case OrderStatus.SHIPPING:
        return {
          label: "Đang giao hàng",
          color: "text-purple-600",
          bg: "bg-purple-50",
        };
      case OrderStatus.COMPLETED:
        return {
          label: "Hoàn tất",
          color: "text-green-600",
          bg: "bg-green-50",
        };
      case OrderStatus.CANCELLED:
        return { label: "Đã hủy", color: "text-red-600", bg: "bg-red-50" };
      case OrderStatus.RETURN_REQUESTED:
        return {
          label: "Chờ duyệt Đổi/Trả",
          color: "text-yellow-700",
          bg: "bg-yellow-50",
        };
      case OrderStatus.RETURN_PROCESSING:
        return {
          label: "Đang đổi/trả",
          color: "text-blue-700",
          bg: "bg-blue-50",
        };
      case OrderStatus.RETURN_COMPLETED:
        return {
          label: "Đã trả hàng",
          color: "text-teal-700",
          bg: "bg-teal-50",
        };
      default:
        return { label: status, color: "text-gray-500", bg: "bg-gray-50" };
    }
  };

  const currentStatusInfo = getFullStatus(order.status);
  const getProductSlug = (item: any) =>
    products.find((p) => p.id === item.productId || p.name === item.productName)
      ?.slug || "";

  // Shopee-style order timeline steps
  const orderSteps = [
    {
      id: OrderStatus.PENDING_CONFIRMATION,
      label: "Đơn Hàng Đã Đặt",
      icon: Package,
    },
    { id: OrderStatus.PACKING, label: "Đã Xác Nhận", icon: ClipboardCheck },
    { id: OrderStatus.SHIPPING, label: "Đã Giao Cho ĐVVC", icon: Truck },
    {
      id: OrderStatus.COMPLETED,
      label: "Đã Nhận Được Hàng",
      icon: CheckCircle2,
    },
    { id: "DONE", label: "Đơn Hàng Hoàn Thành", icon: Star },
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PENDING_CONFIRMATION,
      OrderStatus.PACKING,
      OrderStatus.SHIPPING,
      OrderStatus.COMPLETED,
      "DONE",
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepId as OrderStatus);

    if (order.status === OrderStatus.CANCELLED) return "cancelled";
    if (stepIndex <= currentIndex) return "completed";
    if (stepIndex === currentIndex + 1) return "current";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Shopee style */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">TRỞ LẠI</span>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                MÃ ĐƠN HÀNG. {order.orderCode}
              </span>
              <span className="text-gray-300">|</span>
              <span
                className={`text-sm font-bold uppercase ${currentStatusInfo.color}`}
              >
                {currentStatusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Timeline - Shopee style */}
      {order.status !== OrderStatus.CANCELLED && (
        <div className="bg-gradient-to-r from-green-50 via-white to-green-50 border-b">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between relative">
              {/* Connection line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-6 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
                style={{
                  width:
                    order.status === OrderStatus.COMPLETED
                      ? "100%"
                      : order.status === OrderStatus.SHIPPING
                      ? "75%"
                      : order.status === OrderStatus.PACKING
                      ? "50%"
                      : order.status === OrderStatus.PENDING_CONFIRMATION
                      ? "25%"
                      : "0%",
                }}
              />

              {orderSteps.map((step, idx) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center relative z-10"
                    style={{ flex: 1 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        status === "completed" || status === "current"
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <p
                      className={`text-xs font-medium mt-3 text-center max-w-[100px] ${
                        status === "completed" || status === "current"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {status === "completed" && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(
                          order.updatedAt || order.createdAt
                        ).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Cancelled Banner */}
        {order.status === OrderStatus.CANCELLED && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={32} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">
                Đơn hàng đã bị hủy
              </h3>
              <p className="text-sm text-red-600">
                {order.returnInfo?.reason ||
                  "Đơn hàng đã được hủy theo yêu cầu"}
              </p>
            </div>
          </div>
        )}

        {/* Address & Tracking Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3 flex items-center gap-3">
              <MapPin size={18} className="text-white" />
              <span className="text-white font-bold text-sm">
                Địa Chỉ Nhận Hàng
              </span>
            </div>
            <div className="p-5">
              <div className="flex gap-8">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">
                    {order.customerName}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.customerPhone}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {order.customerAddress}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-teal-600 font-medium">
                    Giao Hàng Nhanh
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {order.orderCode?.slice(-8)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline Detail */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-5 py-3 flex items-center gap-3">
              <Truck size={18} className="text-white" />
              <span className="text-white font-bold text-sm">
                Theo Dõi Đơn Hàng
              </span>
            </div>
            <div className="p-5 max-h-[200px] overflow-y-auto">
              <div className="space-y-4">
                {/* Current status */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold text-green-600">
                      {currentStatusInfo.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(
                        order.updatedAt || order.createdAt
                      ).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                {/* Order placed */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Đơn hàng đã được đặt
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section - Shopee style */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Shop header */}
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={18} className="text-secondary" />
              <span className="font-bold text-gray-800">SportHub</span>
              <button className="text-xs text-secondary hover:underline flex items-center gap-1">
                <MessageSquare size={12} /> Chat
              </button>
              <button className="text-xs text-gray-500 hover:underline flex items-center gap-1">
                <ExternalLink size={12} /> Xem Shop
              </button>
            </div>
          </div>

          {/* Product list */}
          <div className="divide-y">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="px-5 py-4 flex gap-4 hover:bg-gray-50 transition"
              >
                <Link
                  to={
                    getProductSlug(item)
                      ? `/products/${getProductSlug(item)}`
                      : "#"
                  }
                  className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border shrink-0"
                >
                  <img
                    src={item.thumbnailUrl || "https://via.placeholder.com/400"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400?text=Product";
                    }}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={
                      getProductSlug(item)
                        ? `/products/${getProductSlug(item)}`
                        : "#"
                    }
                    className="font-medium text-gray-800 hover:text-secondary transition line-clamp-2"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Phân loại hàng: {item.color} - Size {item.size}
                  </p>
                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                  {/* Return status */}
                  {item.returnStatus && item.returnStatus !== "NONE" && (
                    <span
                      className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        item.returnStatus === "EXCHANGED"
                          ? "bg-green-100 text-green-700"
                          : item.returnStatus === "REFUNDED"
                          ? "bg-blue-100 text-blue-700"
                          : item.returnStatus === "HAS_REQUEST"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.returnStatus === "EXCHANGED"
                        ? "Đã đổi"
                        : item.returnStatus === "REFUNDED"
                        ? "Đã hoàn tiền"
                        : item.returnStatus === "HAS_REQUEST"
                        ? "Đang xử lý đổi/trả"
                        : item.returnStatus}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-400 line-through">
                    {(item.unitPrice * 1.1).toLocaleString()}₫
                  </p>
                  <p className="text-secondary font-medium">
                    {item.unitPrice.toLocaleString()}₫
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary - Shopee style */}
          <div className="border-t bg-amber-50/50">
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-end items-center gap-8 text-sm">
                <span className="text-gray-500">Tổng tiền hàng</span>
                <span className="w-32 text-right">
                  {order.totalAmount.toLocaleString()}₫
                </span>
              </div>
              <div className="flex justify-end items-center gap-8 text-sm">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="w-32 text-right">30.000₫</span>
              </div>
              <div className="flex justify-end items-center gap-8 text-sm">
                <span className="text-gray-500">Giảm giá phí vận chuyển</span>
                <span className="w-32 text-right text-secondary">-30.000₫</span>
              </div>
              <div className="flex justify-end items-center gap-8 pt-3 border-t border-dashed">
                <span className="text-gray-700 font-medium">Thành tiền</span>
                <span className="w-32 text-right text-2xl font-bold text-secondary">
                  {order.totalAmount.toLocaleString()}₫
                </span>
              </div>
            </div>

            {/* Payment method notice */}
            {order.paymentMethod === "COD" &&
              order.paymentStatus !== "PAID" && (
                <div className="mx-5 mb-4 px-4 py-3 bg-amber-100 rounded-lg flex items-center gap-2 text-amber-700">
                  <Info size={16} />
                  <span className="text-sm">
                    Vui lòng thanh toán{" "}
                    <strong>{order.totalAmount.toLocaleString()}₫</strong> khi
                    nhận hàng.
                  </span>
                </div>
              )}

            <div className="px-5 py-4 border-t flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Phương thức Thanh toán
              </span>
              <span className="font-medium text-gray-800">
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Thanh toán Online"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons - Shopee style */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Cảm ơn bạn đã mua hàng tại SportHub!
            </p>
            <div className="flex gap-3">
              {/* Review/Return buttons for completed orders */}
              {order.status === OrderStatus.COMPLETED && !isStaff && (
                <>
                  {order.items.some((item) => !item.isReviewed) && (
                    <button
                      onClick={() => {
                        const unreviewed = order.items.find(
                          (item) => !item.isReviewed
                        );
                        if (unreviewed) openReviewModal(unreviewed);
                      }}
                      className="px-6 py-2.5 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition flex items-center gap-2"
                    >
                      <Star size={16} /> Đánh Giá
                    </button>
                  )}
                  {returnDeadlineStatus.eligible && (
                    <button
                      onClick={() => {
                        const returnable = order.items.find(
                          (item) =>
                            !item.returnStatus || item.returnStatus === "NONE"
                        );
                        if (returnable) openReturnDialog(returnable);
                      }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <RefreshCw size={16} /> Yêu Cầu Đổi/Trả
                    </button>
                  )}
                </>
              )}

              {/* Cancel button */}
              {canCancelOrder && !isStaff && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 transition flex items-center gap-2"
                >
                  <X size={16} /> Hủy Đơn Hàng
                </button>
              )}

              {/* Cancel return request */}
              {order.status === OrderStatus.RETURN_REQUESTED && !isStaff && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 transition flex items-center gap-2"
                >
                  <Trash2 size={16} /> Hủy Yêu Cầu Đổi/Trả
                </button>
              )}

              {/* Mua lại button */}
              <Link
                to="/products"
                className="px-6 py-2.5 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition"
              >
                Mua Lại
              </Link>

              {/* Contact */}
              <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition">
                Liên Hệ Người Bán
              </button>
            </div>
          </div>
        </div>

        {/* Support footer */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            <Smartphone size={14} className="inline mr-2" />
            Cần hỗ trợ? Hotline <strong>1900 1234</strong> - 24/7
          </p>
        </div>
      </div>

      {/* Return Info Card - nếu có */}
      {order.returnInfo && (
        <div
          className={`mt-10 bg-white rounded-[40px] shadow-xl border-4 ${
            order.status === OrderStatus.CANCELLED
              ? "border-red-500"
              : "border-blue-500"
          } overflow-hidden`}
        >
          <div
            className={`${
              order.status === OrderStatus.CANCELLED
                ? "bg-red-500"
                : "bg-blue-500"
            } p-6 flex justify-between items-center text-white`}
          >
            <h3 className="font-black text-lg uppercase flex items-center gap-3">
              <FileText size={24} />
              {order.status === OrderStatus.CANCELLED
                ? "PHIẾU HOÀN TIỀN"
                : "YÊU CẦU ĐỔI TRẢ"}
            </h3>
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
              {order.returnInfo.requestId}
            </span>
          </div>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Hình thức
                </p>
                <div className="flex items-center gap-3 font-black text-gray-800 uppercase">
                  {order.status === OrderStatus.CANCELLED ? (
                    <>
                      <Banknote size={18} className="text-green-500" /> Hoàn
                      tiền hủy đơn
                    </>
                  ) : order.returnInfo.type === "exchange" ? (
                    <>
                      <ArrowRightLeft size={18} className="text-blue-500" /> Đổi
                      size
                    </>
                  ) : (
                    <>
                      <Banknote size={18} className="text-green-500" /> Hoàn
                      tiền
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Trạng thái thanh toán
                </p>
                <div className="flex items-center gap-2 font-black uppercase text-blue-600">
                  {order.paymentStatus === "PENDING_REFUND"
                    ? "Chờ hoàn tiền"
                    : order.paymentStatus === "REFUNDED"
                    ? "Đã hoàn tiền"
                    : "Đã xác nhận"}
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 italic font-medium text-slate-600">
              "{order.returnInfo.reason}"
            </div>
          </div>
        </div>
      )}

      {/* Badge bảo mật */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <ShieldCheck size={16} /> Hệ thống bảo mật SportHub
        </div>
      </div>

      {/* MODAL: VIẾT ĐÁNH GIÁ (REVIEW FORM) */}
      {showReviewModal && reviewingItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-blue-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary text-white rounded-2xl shadow-sm">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Đánh giá sản phẩm
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Bạn cảm thấy sản phẩm thế nào?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <img
                  src={
                    reviewingItem.thumbnailUrl ||
                    "https://via.placeholder.com/56?text=No+Image"
                  }
                  className="w-14 h-14 rounded-xl object-cover"
                  alt=""
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("placeholder")) {
                      target.src =
                        "https://via.placeholder.com/56?text=No+Image";
                    }
                  }}
                />
                <p className="text-xs font-black uppercase text-gray-800 line-clamp-2">
                  {reviewingItem.productName}
                </p>
              </div>

              <div className="text-center space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Chọn số sao
                </p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      className={`transition-all transform hover:scale-125 ${
                        star <= reviewForm.rating
                          ? "text-yellow-400"
                          : "text-gray-200"
                      }`}
                    >
                      <Star
                        size={36}
                        fill={
                          star <= reviewForm.rating ? "currentColor" : "none"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Nhận xét của bạn
                </p>
                <textarea
                  className="w-full border border-gray-100 bg-gray-50 rounded-3xl p-6 outline-none font-medium text-sm h-32 focus:ring-2 focus:ring-secondary/10 transition"
                  placeholder="Chia sẻ trải nghiệm của bạn về chất lượng sản phẩm, dịch vụ giao hàng..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                  Hình ảnh thực tế{" "}
                  <span className="text-secondary">
                    {reviewForm.images.length}/3
                  </span>
                </p>
                <div className="flex gap-3">
                  {reviewForm.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-xl overflow-hidden group"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        onClick={() =>
                          setReviewForm((p) => ({
                            ...p,
                            images: p.images.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {reviewForm.images.length < 3 && (
                    <button
                      onClick={() => reviewFileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-secondary hover:text-secondary transition bg-gray-50"
                    >
                      <Camera size={20} />
                      <span className="text-[8px] font-black uppercase">
                        Tải lên
                      </span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={reviewFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleReviewImageUpload}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-full py-5 bg-secondary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-600 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submittingReview ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  "GỬI ĐÁNH GIÁ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XEM ĐÁNH GIÁ (VIEW REVIEW) */}
      {showViewReviewModal && reviewingItem && reviewingItem.isReviewed && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-green-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 text-white rounded-2xl shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-green-700">
                    Đánh giá của bạn
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Cảm ơn bạn đã đóng góp ý kiến
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <img
                  src={
                    reviewingItem.thumbnailUrl ||
                    "https://via.placeholder.com/56?text=No+Image"
                  }
                  className="w-14 h-14 rounded-xl object-cover"
                  alt=""
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("placeholder")) {
                      target.src =
                        "https://via.placeholder.com/56?text=No+Image";
                    }
                  }}
                />
                <p className="text-xs font-black uppercase text-gray-800 line-clamp-2">
                  {reviewingItem.productName}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={28}
                      fill={
                        i < (reviewingItem.reviewInfo?.rating || 0)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>
                <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {new Date(
                    reviewingItem.reviewInfo?.createdAt || ""
                  ).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 relative">
                <MessageSquare
                  className="absolute -top-3 -left-3 text-green-200"
                  size={32}
                />
                <p className="text-gray-700 font-medium leading-relaxed italic text-center mb-6">
                  "{reviewingItem.reviewInfo?.comment}"
                </p>

                {reviewingItem.reviewInfo?.images &&
                  reviewingItem.reviewInfo.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reviewingItem.reviewInfo.images.map((img, i) => (
                        <div
                          key={i}
                          className="w-20 h-20 rounded-xl overflow-hidden border border-white shadow-sm"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <button
                onClick={() => setShowViewReviewModal(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition"
              >
                ĐÓNG CỬA SỔ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐỔI TRẢ (RETURN/EXCHANGE FORM) */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 my-8">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-yellow-400/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-400 text-yellow-900 rounded-2xl shadow-sm">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    ĐĂNG KÝ ĐỔI TRẢ SẢN PHẨM
                  </h3>
                  <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                    MÃ ĐƠN: {order?.orderCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-10 border-r border-gray-50 space-y-10">
                {/* SECTION 1: Display current item being returned */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    1. Sản phẩm đổi trả
                  </label>
                  {returningItem && (
                    <div className="p-6 bg-gray-50 rounded-3xl border-2 border-gray-100">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            returningItem.thumbnailUrl ||
                            "https://via.placeholder.com/80?text=No+Image"
                          }
                          className="w-20 h-20 rounded-xl object-cover shadow-sm"
                          alt=""
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes("placeholder")) {
                              target.src =
                                "https://via.placeholder.com/80?text=No+Image";
                            }
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-black uppercase text-gray-800 line-clamp-2 mb-2">
                            {returningItem.productName}
                          </h4>
                          <div className="flex gap-3 text-[10px] font-black uppercase text-gray-500">
                            <span className="px-3 py-1 bg-white rounded-lg">
                              {returningItem.color}
                            </span>
                            <span className="px-3 py-1 bg-white rounded-lg">
                              SIZE {returningItem.size}
                            </span>
                            <span className="px-3 py-1 bg-white rounded-lg">
                              SL: {returningItem.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: Return/Exchange Type */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    2. Hình thức mong muốn *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() =>
                        setReturnForm({ ...returnForm, type: "exchange" })
                      }
                      className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition ${
                        returnForm.type === "exchange"
                          ? "border-secondary bg-blue-50 text-secondary"
                          : "border-gray-50 text-gray-400"
                      }`}
                    >
                      <ArrowRightLeft size={32} />
                      <span className="text-[10px] font-black uppercase">
                        Đổi size/màu khác
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        setReturnForm({ ...returnForm, type: "refund" })
                      }
                      className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition ${
                        returnForm.type === "refund"
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-50 text-gray-400"
                      }`}
                    >
                      <Banknote size={32} />
                      <span className="text-[10px] font-black uppercase">
                        Trả hàng hoàn tiền
                      </span>
                    </button>
                  </div>
                </div>

                {/* SECTION 2.5: Exchange Configuration (only if exchange selected) */}
                {returnForm.type === "exchange" &&
                  returningItem &&
                  (() => {
                    // Find product from returningItem
                    const currentProduct = products.find(
                      (p) => p.id === returningItem.productId
                    );

                    // Get unique sizes and colors from product variants
                    const availableSizes = currentProduct
                      ? Array.from(
                          new Set(currentProduct.variants.map((v) => v.size))
                        ).filter(Boolean)
                      : [];
                    const availableColors = currentProduct
                      ? Array.from(
                          new Set(currentProduct.variants.map((v) => v.color))
                        ).filter(Boolean)
                      : [];

                    return (
                      <div className="space-y-4 p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 animate-in slide-in-from-top-4">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                          <ArrowRightLeft size={14} /> Cấu hình sản phẩm muốn
                          đổi
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-blue-500 uppercase ml-1">
                              Size mới
                            </label>
                            <select
                              className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-300"
                              value={returnForm.exchangeToSize}
                              onChange={(e) =>
                                setReturnForm({
                                  ...returnForm,
                                  exchangeToSize: e.target.value,
                                })
                              }
                            >
                              <option value="">-- Giữ nguyên size --</option>
                              {availableSizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-blue-500 uppercase ml-1">
                              Màu mới
                            </label>
                            <select
                              className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-300"
                              value={returnForm.exchangeToColor}
                              onChange={(e) =>
                                setReturnForm({
                                  ...returnForm,
                                  exchangeToColor: e.target.value,
                                })
                              }
                            >
                              <option value="">-- Giữ nguyên màu --</option>
                              {availableColors.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="text-[9px] font-bold text-blue-600/70 leading-relaxed">
                          💡 Chỉ chọn những thuộc tính muốn đổi. Ví dụ: chỉ đổi
                          size thì chỉ chọn Size mới.
                        </p>
                      </div>
                    );
                  })()}
              </div>

              <div className="p-10 bg-gray-50/50 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    3. Lý do đổi trả *
                  </label>
                  <select
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 font-black text-xs uppercase outline-none focus:ring-2 focus:ring-secondary/10"
                    value={returnForm.selectedReasonId}
                    onChange={(e) =>
                      setReturnForm({
                        ...returnForm,
                        selectedReasonId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Chọn lý do --</option>
                    {RETURN_REASONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="w-full border border-gray-100 bg-white rounded-3xl p-5 outline-none font-medium text-sm h-24"
                    placeholder="Mô tả chi tiết tình trạng sản phẩm..."
                    value={returnForm.otherReason}
                    onChange={(e) =>
                      setReturnForm({
                        ...returnForm,
                        otherReason: e.target.value,
                      })
                    }
                  />
                </div>

                {returnForm.type === "refund" &&
                  order?.paymentMethod === "COD" && (
                    <div className="space-y-4 p-6 bg-green-50 rounded-[32px] border border-green-100 animate-in slide-in-from-top-4">
                      <label className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                        <Landmark size={14} /> Tài khoản nhận tiền hoàn
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Tên Ngân hàng"
                          className="bg-white border-none rounded-xl px-4 py-3 text-xs font-black uppercase outline-none"
                          value={returnForm.bankInfo.bankName}
                          onChange={(e) =>
                            setReturnForm({
                              ...returnForm,
                              bankInfo: {
                                ...returnForm.bankInfo,
                                bankName: e.target.value,
                              },
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="Số tài khoản"
                          className="bg-white border-none rounded-xl px-4 py-3 text-xs font-black outline-none"
                          value={returnForm.bankInfo.accountNumber}
                          onChange={(e) =>
                            setReturnForm({
                              ...returnForm,
                              bankInfo: {
                                ...returnForm.bankInfo,
                                accountNumber: e.target.value,
                              },
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="Họ tên chủ tài khoản"
                          className="bg-white border-none rounded-xl px-4 py-3 text-xs font-black uppercase col-span-2 outline-none"
                          value={returnForm.bankInfo.accountHolder}
                          onChange={(e) =>
                            setReturnForm({
                              ...returnForm,
                              bankInfo: {
                                ...returnForm.bankInfo,
                                accountHolder: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                    4. Hình ảnh thực tế minh chứng *
                    <span className="text-secondary font-black">
                      {returnForm.evidenceImages.length}/5
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {returnForm.evidenceImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm group"
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                        <button
                          onClick={() =>
                            setReturnForm((p) => ({
                              ...p,
                              evidenceImages: p.evidenceImages.filter(
                                (_, idx) => idx !== i
                              ),
                            }))
                          }
                          className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {returnForm.evidenceImages.length < 5 && (
                      <button
                        onClick={() => returnFileInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-secondary hover:text-secondary transition bg-white"
                      >
                        <Camera size={20} />
                        <span className="text-[8px] font-black uppercase">
                          Tải lên
                        </span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={returnFileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleReturnImageUpload}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitReturn}
                  disabled={submittingReturn}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submittingReturn ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    "GỬI YÊU CẦU NGAY"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM HỦY YÊU CẦU */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertOctagon size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-4">
              Hủy yêu cầu đổi trả?
            </h3>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm">
              Bạn chắc chắn muốn xóa phiếu yêu cầu này? Đơn hàng sẽ quay trở về
              trạng thái <b>Hoàn tất</b> và bạn có thể tạo lại phiếu mới nếu
              cần.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
              >
                Không hủy
              </button>
              <button
                onClick={handleCancelReturn}
                className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4 text-red-600">
                <AlertOctagon size={24} />
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Hủy đơn hàng
                </h3>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {order?.paymentStatus === "paid" && (
                <div className="p-6 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200 flex gap-4">
                  <Info className="text-orange-600 shrink-0 mt-0.5" size={20} />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-orange-800 uppercase">
                      Lưu ý về hoàn tiền
                    </p>
                    <p className="text-[10px] font-bold text-orange-700/80 leading-relaxed uppercase">
                      Đơn hàng của bạn đã được thanh toán online. Vui lòng cung
                      cấp thông tin ngân hàng chính xác để SportHub thực hiện
                      hoàn trả số tiền{" "}
                      <span className="font-black">
                        {order.totalAmount.toLocaleString()}đ
                      </span>
                      .
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Lý do hủy đơn *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {CANCEL_REASONS.map((reason) => (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() =>
                          setCancelForm({ ...cancelForm, reasonId: reason.id })
                        }
                        className={`px-5 py-4 rounded-2xl text-left text-xs font-black transition-all border-2 ${
                          cancelForm.reasonId === reason.id
                            ? "border-red-500 bg-red-50 text-red-600 shadow-md"
                            : "border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                </div>

                {cancelForm.reasonId === "other" && (
                  <textarea
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-medium text-sm outline-none focus:ring-2 focus:ring-red-500/10 h-24"
                    placeholder="Vui lòng nhập lý do cụ thể..."
                    value={cancelForm.otherText}
                    onChange={(e) =>
                      setCancelForm({
                        ...cancelForm,
                        otherText: e.target.value,
                      })
                    }
                  />
                )}

                {order?.paymentStatus === "PAID" && (
                  <div className="pt-6 border-t border-gray-100 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Landmark size={14} /> Thông tin nhận tiền hoàn
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Tên ngân hàng *
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-black text-sm outline-none focus:ring-2 focus:ring-red-500/10"
                          placeholder="Ví dụ: Vietcombank"
                          value={cancelForm.bankInfo.bankName}
                          onChange={(e) =>
                            setCancelForm({
                              ...cancelForm,
                              bankInfo: {
                                ...cancelForm.bankInfo,
                                bankName: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Số tài khoản *
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-black text-sm outline-none focus:ring-2 focus:ring-red-500/10"
                          placeholder="Nhập số tài khoản"
                          value={cancelForm.bankInfo.accountNumber}
                          onChange={(e) =>
                            setCancelForm({
                              ...cancelForm,
                              bankInfo: {
                                ...cancelForm.bankInfo,
                                accountNumber: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Tên chủ tài khoản (Không dấu) *
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-black text-sm outline-none focus:ring-2 focus:ring-red-500/10 uppercase"
                          placeholder="NGUYEN VAN A"
                          value={cancelForm.bankInfo.accountHolder}
                          onChange={(e) =>
                            setCancelForm({
                              ...cancelForm,
                              bankInfo: {
                                ...cancelForm.bankInfo,
                                accountHolder: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest hover:text-gray-800 transition"
              >
                Không hủy nữa
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={cancelling || !cancelForm.reasonId}
                className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-black uppercase text-xs tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-700 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  "XÁC NHẬN HỦY ĐƠN"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
