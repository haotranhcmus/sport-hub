import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services";
import {
  Product,
  ProductVariant,
  ProductStatus,
  Review,
  SizeGuide,
  ProductAttribute,
} from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProductDetail, useProducts } from "../hooks/useProductsQuery";
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Info,
  ChevronRight,
  X,
  ChevronLeft,
  Camera,
  UserX,
  Briefcase,
  RotateCcw,
  Ruler,
  Table as TableIcon,
  AlignLeft,
} from "lucide-react";
import { ProductCard } from "../components/features/product/ProductCard";

const SpecRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between border-b border-gray-50 py-5 transition hover:bg-gray-50/30 px-2">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </span>
    <span
      className={`text-sm font-black text-right max-w-[60%] ${
        highlight ? "text-secondary" : "text-gray-800"
      }`}
    >
      {value}
    </span>
  </div>
);

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Use TanStack Query for product detail with caching
  const {
    data: product = null,
    isLoading: loading,
    error: queryError,
  } = useProductDetail(slug || "");

  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  const [error, setError] = useState("");
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);

  // Fetch all products for related products
  const { data: allProducts = [] } = useProducts();
  const relatedProducts = useMemo(
    () =>
      product
        ? allProducts
            .filter(
              (p) =>
                p.categoryId === product.categoryId &&
                p.id !== product.id &&
                p.status === ProductStatus.ACTIVE
            )
            .slice(0, 4)
        : [],
    [product, allProducts]
  );

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 5;

  const isStaff = user && user.role !== "CUSTOMER";

  // Validate product status
  useEffect(() => {
    if (product) {
      if (
        product.status === ProductStatus.DRAFT ||
        product.status === ProductStatus.INACTIVE ||
        product.status === ProductStatus.ARCHIVED
      ) {
        setError("Sản phẩm này hiện không còn kinh doanh.");
      } else {
        setError("");
        const validUrl =
          product.thumbnailUrl && product.thumbnailUrl.trim() !== ""
            ? product.thumbnailUrl
            : "https://via.placeholder.com/600?text=No+Image";
        setActiveImage(validUrl);
      }
    }
  }, [product]);

  // Fetch size guide and attributes when product loads
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!product?.id) return;

      try {
        const [sg, attrs] = await Promise.all([
          api.products.getSizeGuide(product.id),
          api.attributes.list(),
        ]);
        setSizeGuide(sg);
        setAttributes(attrs);

        if (product.variants && product.variants.length > 0) {
          const availableVariant =
            product.variants.find((v) => v.stockQuantity > 0) ||
            product.variants[0];
          setSelectedColor(availableVariant.color);
          setSelectedSize(availableVariant.size);
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
        // Set default values on error
        setAttributes([]);
        setSizeGuide(null);
      }
    };

    fetchMetadata().catch((err) => {
      console.error("Unhandled error in fetchMetadata:", err);
    });
  }, [product?.id]);

  const selectedVariant = useMemo(() => {
    return (
      product?.variants?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) || null
    );
  }, [selectedColor, selectedSize, product]);

  const currentPrice = product
    ? product.promotionalPrice || product.basePrice
    : 0;
  const finalPrice = product
    ? currentPrice + (selectedVariant?.priceAdjustment || 0)
    : 0;
  const discountPercent = product?.promotionalPrice
    ? Math.round(
        ((product.basePrice - product.promotionalPrice) / product.basePrice) *
          100
      )
    : 0;

  const paginatedReviews = useMemo(() => {
    if (!product?.reviews) return [];
    const sorted = [...product.reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const start = (reviewPage - 1) * reviewsPerPage;
    return sorted.slice(start, start + reviewsPerPage);
  }, [product, reviewPage]);

  const productInfoSpecs = useMemo(() => {
    if (!product || !product.attributes) return [];
    return Object.entries(product.attributes)
      .map(([code, value]) => {
        const attrDef = attributes.find((a) => a.code === code);
        return {
          label: attrDef?.name || code,
          value: value as string,
          isInfo: attrDef?.type === "info",
        };
      })
      .filter((item) => item.isInfo);
  }, [product, attributes]);

  const productImages = useMemo(() => {
    if (!product) return [];
    const baseUrl =
      product.thumbnailUrl && product.thumbnailUrl.trim() !== ""
        ? product.thumbnailUrl
        : "https://via.placeholder.com/600?text=No+Image";

    // Only create variants if it's a valid HTTP URL, not base64
    if (baseUrl.startsWith("http")) {
      return [
        baseUrl,
        `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}v=2`,
        `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}v=3`,
      ];
    }
    // If it's base64 or other format, just return single image
    return [baseUrl];
  }, [product]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {error || "Không tìm thấy trang"}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Vui lòng quay lại danh sách sản phẩm để tìm kiếm mẫu khác.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 px-8 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition"
        >
          <ArrowLeft size={20} /> Quay lại cửa hàng
        </button>
      </div>
    );

  const uniqueColors = Array.from(
    new Set(product.variants?.map((v) => v.color))
  );
  const availableSizesForColor =
    product.variants
      ?.filter((v) => v.color === selectedColor && v.stockQuantity > 0)
      .map((v) => v.size) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <nav className="text-xs font-bold text-gray-400 flex gap-2 items-center uppercase tracking-widest">
        <Link to="/" className="hover:text-secondary transition">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link to="/products" className="hover:text-secondary transition">
          Sản phẩm
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-800 truncate max-w-[250px]">
          {product.name}
        </span>
      </nav>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-6 p-6 md:p-12 bg-gray-50 flex flex-col items-center">
            <div className="relative aspect-square w-full bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-100 group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-8 group-hover:scale-110 transition duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("placeholder")) {
                    target.src =
                      "https://via.placeholder.com/600?text=No+Image";
                  }
                }}
              />
              {discountPercent > 0 && (
                <div className="absolute top-6 left-6 bg-red-600 text-white text-sm font-black px-4 py-1.5 rounded-full shadow-xl">
                  -{discountPercent}%
                </div>
              )}
              {product.freeShipping && (
                <div className="absolute bottom-6 left-6 bg-blue-500 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-xl uppercase tracking-widest flex items-center gap-2">
                  <Truck size={14} /> Freeship
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-8">
              {productImages.map((imgUrl, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-2xl border-2 transition cursor-pointer overflow-hidden transform active:scale-90 ${
                    activeImage === imgUrl
                      ? "border-secondary ring-4 ring-secondary/10"
                      : "border-white hover:border-gray-200"
                  }`}
                >
                  <img
                    src={imgUrl}
                    className="w-full h-full object-cover"
                    alt={`view-${i}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("placeholder")) {
                        target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 p-6 md:p-12 space-y-8 flex flex-col">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">
                  Chính hãng 100%
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  MÃ: {product.productCode}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= 4.8 ? "currentColor" : "none"}
                    />
                  ))}
                  <span className="text-gray-900 font-black ml-2 text-sm">
                    4.8
                  </span>
                </div>
                <span className="text-gray-200">|</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Đã bán: <b className="text-gray-800">{product.totalSold}</b>
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-red-600 tracking-tighter">
                  {finalPrice.toLocaleString()}đ
                </span>
                {discountPercent > 0 && (
                  <span className="text-lg text-gray-300 line-through font-bold mb-1">
                    {product.basePrice.toLocaleString()}đ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2">
                {product.freeShipping && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Truck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Miễn phí vận chuyển
                    </span>
                  </div>
                )}
                {product.allowReturn && (
                  <div className="flex items-center gap-2 text-green-600">
                    <RotateCcw size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Đổi trả: {product.returnPeriod} ngày
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {isStaff ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 space-y-4">
                <Briefcase size={48} className="text-slate-300" />
                <div className="text-center">
                  <p className="font-black text-slate-800 uppercase tracking-tight">
                    Giao diện Nhân sự
                  </p>
                  <p className="text-xs text-slate-500 font-medium max-w-[250px] mt-1 italic">
                    Bạn đang truy cập với vai trò {user?.role.toUpperCase()}.
                    Chức năng mua hàng và giỏ hàng đã bị ẩn.
                  </p>
                </div>
                <Link
                  to="/admin"
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  Về trang Quản trị
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                      Màu sắc:{" "}
                      <b className="text-gray-800 ml-1">{selectedColor}</b>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {uniqueColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            setSelectedSize("");
                          }}
                          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all border-2 ${
                            selectedColor === color
                              ? "border-secondary bg-secondary text-white shadow-xl shadow-blue-500/20"
                              : "border-gray-100 hover:border-gray-200 text-gray-500"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Kích cỡ:{" "}
                        <b className="text-gray-800 ml-1">
                          {selectedSize || "Chọn size"}
                        </b>
                      </h4>
                      {sizeGuide && (
                        <button
                          onClick={() => setShowSizeGuideModal(true)}
                          className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-2 hover:underline"
                        >
                          <Ruler size={14} /> Hướng dẫn chọn size
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {Array.from(new Set(product.variants?.map((v) => v.size)))
                        .sort()
                        .map((size) => {
                          const isAvailable =
                            availableSizesForColor.includes(size);
                          return (
                            <button
                              key={size}
                              disabled={!isAvailable}
                              onClick={() => setSelectedSize(size)}
                              className={`w-14 h-14 flex items-center justify-center rounded-2xl text-sm font-black transition-all border-2 ${
                                !isAvailable
                                  ? "opacity-20 bg-gray-50 border-gray-100 cursor-not-allowed"
                                  : selectedSize === size
                                  ? "border-primary bg-primary text-white shadow-xl"
                                  : "border-gray-100 hover:border-primary text-gray-600"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-4 mt-auto">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 h-14">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-full hover:bg-white rounded-xl flex items-center justify-center text-gray-400"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-black text-lg text-gray-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-full hover:bg-white rounded-xl flex items-center justify-center text-gray-400"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs font-bold">
                      {selectedVariant ? (
                        selectedVariant.stockQuantity > 0 ? (
                          <span className="text-green-500 flex items-center gap-2 uppercase tracking-widest">
                            <ShieldCheck size={16} /> Sẵn sàng giao hàng
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-2 uppercase tracking-widest">
                            <AlertCircle size={16} /> Tạm hết hàng
                          </span>
                        )
                      ) : (
                        <span className="text-orange-400 animate-pulse">
                          Vui lòng chọn phân loại
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      product &&
                      selectedVariant &&
                      addToCart(product, selectedVariant, quantity)
                    }
                    disabled={
                      !selectedVariant || selectedVariant.stockQuantity === 0
                    }
                    className="w-full h-16 bg-secondary hover:bg-blue-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-30 transform active:scale-95"
                  >
                    <ShoppingCart size={24} />{" "}
                    {!selectedVariant || selectedVariant.stockQuantity > 0
                      ? "THÊM VÀO GIỎ"
                      : "TẠM HẾT HÀNG"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="flex border-b border-gray-100 bg-white overflow-x-auto no-scrollbar px-6 md:px-12">
            {[
              { id: "info", label: "Thông tin sản phẩm" },
              {
                id: "reviews",
                label: `Đánh giá (${product.reviews?.length || 0})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-6 font-black text-xs uppercase tracking-widest transition relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-secondary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-secondary"
                    : "text-gray-400 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-8 md:p-12 min-h-[400px]">
            {activeTab === "info" && (
              <div className="max-w-5xl space-y-16">
                {/* PHẦN 1: THÔNG SỐ KỸ THUẬT */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 text-gray-800 rounded-xl">
                      <Info size={20} />
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-gray-800">
                      Thông số kỹ thuật
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
                    <SpecRow
                      label="Thương hiệu"
                      value={product.brand?.name || "SportHub"}
                    />
                    <SpecRow label="Mã sản phẩm" value={product.productCode} />
                    <SpecRow
                      label="Danh mục"
                      value={product.category?.name || "Thể thao"}
                    />
                    <SpecRow
                      label="Trạng thái"
                      value={product.condition || "Mới 100% Full box"}
                    />
                    {productInfoSpecs.map((spec, i) => (
                      <SpecRow
                        key={i}
                        label={spec.label}
                        value={spec.value}
                        highlight
                      />
                    ))}
                  </div>
                </div>

                {/* PHẦN 2: HƯỚNG DẪN CHỌN SIZE */}
                {sizeGuide && (
                  <div className="pt-10 border-t border-gray-100 animate-in fade-in duration-700">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-blue-50 text-secondary rounded-xl">
                        <TableIcon size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-tight text-gray-800">
                          Thông số chọn kích cỡ
                        </h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {sizeGuide.name}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              {sizeGuide.columns.map((col) => (
                                <th
                                  key={col.key}
                                  className="px-6 py-5 text-[10px] font-black text-secondary uppercase tracking-[0.2em]"
                                >
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {sizeGuide.rows.map((row, i) => (
                              <tr
                                key={i}
                                className="hover:bg-gray-50/50 transition duration-200"
                              >
                                {sizeGuide.columns.map((col) => (
                                  <td
                                    key={col.key}
                                    className="px-6 py-5 text-sm font-black text-gray-700"
                                  >
                                    {row[col.key]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <Info
                        className="text-secondary shrink-0 mt-0.5"
                        size={16}
                      />
                      <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">
                        Mẹo: Đối với giày bóng đá, nếu chân bạn bè hoặc dày, hãy
                        cân nhắc tăng thêm 0.5 - 1 size so với thông số chuẩn để
                        có cảm giác thoải mái nhất.
                      </p>
                    </div>
                  </div>
                )}

                {/* PHẦN 3: MÔ TẢ CHI TIẾT SẢN PHẨM */}
                <div className="pt-10 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-gray-100 text-gray-800 rounded-xl">
                      <AlignLeft size={20} />
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-gray-800">
                      Mô tả chi tiết sản phẩm
                    </h4>
                  </div>
                  <div className="max-w-4xl prose prose-slate">
                    <p className="text-lg text-gray-600 leading-relaxed font-medium italic mb-8 border-l-4 border-secondary pl-6">
                      "{product.description}"
                    </p>
                    <div className="space-y-4 text-gray-700 leading-loose">
                      <p>
                        SportHub cam kết cung cấp sản phẩm chính hãng với các
                        tiêu chuẩn khắt khe nhất, đảm bảo mang đến trải nghiệm
                        tốt nhất cho người dùng trong quá trình vận động và thi
                        đấu chuyên nghiệp.
                      </p>
                      <p>
                        Chất liệu cao cấp được chọn lọc kỹ lưỡng kết hợp cùng
                        những công nghệ tiên tiến nhất hiện nay giúp tối ưu hóa
                        khả năng vận động và bảo vệ cơ thể người sử dụng.
                      </p>
                      <p>
                        Thiết kế hiện đại, ôm sát bàn chân (đối với giày) hoặc
                        tôn dáng (đối với quần áo) tạo sự tự tin tối đa trên sân
                        đấu cũng như trong các hoạt động hàng ngày.
                      </p>
                    </div>
                  </div>
                </div>

                {productInfoSpecs.length === 0 &&
                  !sizeGuide &&
                  !product.description && (
                    <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                      <Info size={32} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Thông tin đang được cập nhật...
                      </p>
                    </div>
                  )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-8 rounded-[32px]">
                  <div className="text-center md:border-r border-gray-200 md:pr-12">
                    <p className="text-5xl font-black text-gray-900 mb-2">
                      4.8
                    </p>
                    <div className="flex text-yellow-400 justify-center mb-2">
                      <Star size={20} fill="currentColor" />{" "}
                      <Star size={20} fill="currentColor" />{" "}
                      <Star size={20} fill="currentColor" />{" "}
                      <Star size={20} fill="currentColor" />{" "}
                      <Star size={20} fill="currentColor" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {product.reviews?.length || 0} Nhận xét
                    </p>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-400 w-4">
                          {star}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary"
                            style={{
                              width:
                                star === 5 ? "85%" : star === 4 ? "10%" : "5%",
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-8">
                    {paginatedReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-100 pb-8"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                review.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${review.userName}`
                              }
                              className="w-12 h-12 rounded-full border border-gray-100 object-cover"
                              alt=""
                            />
                            <div>
                              <p className="font-black text-gray-800 text-sm">
                                {review.userName}
                              </p>
                              <div className="flex text-yellow-400 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    fill={
                                      i < review.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {new Date(review.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>

                        <div className="pl-16 space-y-4">
                          <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            "{review.comment}"
                          </p>

                          {review.images && review.images.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {review.images.map((img, i) => (
                                <button
                                  key={i}
                                  onClick={() => setZoomedImage(img)}
                                  className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:scale-105 transition transform"
                                >
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                    alt={`review-img-${i}`}
                                  />
                                </button>
                              ))}
                            </div>
                          )}

                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2">
                            Sản phẩm: {review.productName || product.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                    <Star size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                      Chưa có đánh giá nào.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
              Mẫu tương tự
            </h2>
            <Link
              to="/products"
              className="text-xs font-black text-secondary hover:underline uppercase tracking-widest"
            >
              Xem thêm
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {zoomedImage && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10 backdrop-blur-xl bg-black/80 animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <button className="absolute top-10 right-10 p-4 text-white hover:bg-white/10 rounded-full transition">
            <X size={32} />
          </button>
          <div className="max-w-4xl w-full max-h-full flex items-center justify-center p-4">
            <img
              src={zoomedImage}
              className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
              alt="Zoomed Review"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {showSizeGuideModal && sizeGuide && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in"
          onClick={() => setShowSizeGuideModal(false)}
        >
          <div
            className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary text-white rounded-2xl shadow-xl">
                  <Ruler size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Hướng dẫn chọn size
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {sizeGuide.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSizeGuideModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="prose prose-slate max-w-none">
                <p className="text-sm font-medium text-gray-600 leading-relaxed italic border-l-4 border-secondary pl-4">
                  "
                  {sizeGuide.description ||
                    "Vui lòng đối chiếu các thông số dưới đây để chọn kích cỡ phù hợp nhất."}
                  "
                </p>
              </div>

              <div className="bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        {sizeGuide.columns.map((col) => (
                          <th
                            key={col.key}
                            className="px-6 py-5 text-[10px] font-black text-secondary uppercase tracking-[0.2em]"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sizeGuide.rows.map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-white transition duration-200"
                        >
                          {sizeGuide.columns.map((col) => (
                            <td
                              key={col.key}
                              className="px-6 py-5 text-sm font-black text-gray-800"
                            >
                              {row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 bg-blue-50 border-2 border-dashed border-secondary/20 rounded-3xl flex gap-4">
                <Info className="text-secondary shrink-0" size={20} />
                <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">
                  Mẹo chọn size: Nếu số đo của bạn nằm giữa hai kích cỡ, hãy
                  chọn cỡ lớn hơn để có cảm giác thoải mái nhất hoặc cỡ nhỏ hơn
                  nếu bạn thích cảm giác ôm sát.
                </p>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button
                onClick={() => setShowSizeGuideModal(false)}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition active:scale-95"
              >
                ĐÃ HIỂU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
