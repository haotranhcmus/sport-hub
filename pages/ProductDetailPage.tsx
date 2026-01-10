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
        // Format value - handle arrays and objects
        let displayValue = value as string;
        if (Array.isArray(value)) {
          displayValue = value.join(", ");
        } else if (typeof value === "object" && value !== null) {
          displayValue = JSON.stringify(value);
        }
        return {
          label: attrDef?.name || code,
          value: displayValue,
          type: attrDef?.type || "text",
        };
      })
      .filter((item) => item.value && item.value.toString().trim() !== "");
  }, [product, attributes]);

  const productImages = useMemo(() => {
    if (!product) return [];
    const baseUrl =
      product.thumbnailUrl && product.thumbnailUrl.trim() !== ""
        ? product.thumbnailUrl
        : "https://via.placeholder.com/600?text=No+Image";

    // ✅ NEW: Include imageUrls array (gallery images)
    const galleryImages = product.imageUrls || [];

    // Return thumbnail + all gallery images
    return [baseUrl, ...galleryImages].filter(
      (url) => url && url.trim() !== ""
    );
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
  const uniqueSizes = Array.from(
    new Set(product.variants?.map((v) => v.size))
  ).sort();

  // Get available sizes for selected color (or all sizes with stock if no color selected)
  const availableSizesForColor = selectedColor
    ? product.variants
        ?.filter((v) => v.color === selectedColor && v.stockQuantity > 0)
        .map((v) => v.size) || []
    : product.variants?.filter((v) => v.stockQuantity > 0).map((v) => v.size) ||
      [];

  // Get available colors for selected size (or all colors with stock if no size selected)
  const availableColorsForSize = selectedSize
    ? product.variants
        ?.filter((v) => v.size === selectedSize && v.stockQuantity > 0)
        .map((v) => v.color) || []
    : product.variants
        ?.filter((v) => v.stockQuantity > 0)
        .map((v) => v.color) || [];

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-6 md:p-8 bg-gray-50 flex flex-col items-center sticky top-0 h-fit">
            <div className="relative aspect-square w-full max-w-[500px] bg-white rounded-[32px] shadow-sm overflow-hidden border border-gray-100 group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-6 group-hover:scale-110 transition duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("placeholder")) {
                    target.src =
                      "https://via.placeholder.com/600?text=No+Image";
                  }
                }}
              />
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-black px-4 py-1.5 rounded-full shadow-xl">
                  -{discountPercent}%
                </div>
              )}
              {product.freeShipping && (
                <div className="absolute bottom-4 left-4 bg-blue-500 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-xl uppercase tracking-widest flex items-center gap-2">
                  <Truck size={14} /> Freeship
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              {productImages.map((imgUrl, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl border-2 transition cursor-pointer overflow-hidden transform active:scale-90 ${
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

          <div className="p-6 md:p-8 space-y-6 flex flex-col">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">
                  Chính hãng 100%
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  MÃ: {product.productCode}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
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
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-red-600 tracking-tighter">
                  {finalPrice.toLocaleString()}đ
                </span>
                {discountPercent > 0 && (
                  <span className="text-lg text-gray-300 line-through font-bold mb-1">
                    {product.basePrice.toLocaleString()}đ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {product.freeShipping && (
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Truck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Miễn phí vận chuyển
                    </span>
                  </div>
                )}
                {product.allowReturn && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <RotateCcw size={14} />
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
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                      Màu sắc:{" "}
                      <b className="text-gray-800 ml-1">{selectedColor}</b>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((color) => {
                        // Check if this color is available (considering selected size)
                        const isAvailable =
                          availableColorsForSize.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              // Only reset size if current size is not available with new color
                              if (selectedSize) {
                                const variantExists = product.variants?.some(
                                  (v) =>
                                    v.color === color &&
                                    v.size === selectedSize &&
                                    v.stockQuantity > 0
                                );
                                if (!variantExists) {
                                  // Try to find a size that works with this color
                                  const availableSize = product.variants?.find(
                                    (v) =>
                                      v.color === color && v.stockQuantity > 0
                                  )?.size;
                                  setSelectedSize(availableSize || "");
                                }
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                              !isAvailable
                                ? "opacity-40 border-gray-100 text-gray-400 cursor-not-allowed line-through"
                                : selectedColor === color
                                ? "border-secondary bg-secondary text-white shadow-xl shadow-blue-500/20"
                                : "border-gray-100 hover:border-gray-200 text-gray-500"
                            }`}
                            disabled={!isAvailable}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
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
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map((size) => {
                        // Check if this size is available (considering selected color)
                        const isAvailable =
                          availableSizesForColor.includes(size);
                        return (
                          <button
                            key={size}
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedSize(size);
                              // Only reset color if current color is not available with new size
                              if (selectedColor) {
                                const variantExists = product.variants?.some(
                                  (v) =>
                                    v.size === size &&
                                    v.color === selectedColor &&
                                    v.stockQuantity > 0
                                );
                                if (!variantExists) {
                                  // Try to find a color that works with this size
                                  const availableColor = product.variants?.find(
                                    (v) =>
                                      v.size === size && v.stockQuantity > 0
                                  )?.color;
                                  setSelectedColor(availableColor || "");
                                }
                              }
                            }}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl text-sm font-black transition-all border-2 ${
                              !isAvailable
                                ? "opacity-30 bg-gray-50 border-gray-100 cursor-not-allowed line-through"
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

                <div className="pt-4 space-y-3 mt-auto">
                  {/* Stock Status Banner */}
                  {selectedVariant && selectedVariant.stockQuantity === 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
                      <AlertCircle
                        className="text-red-500 shrink-0 mt-0.5"
                        size={20}
                      />
                      <div>
                        <p className="text-sm font-black text-red-700 uppercase tracking-tight">
                          Tạm hết hàng
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Phân loại "{selectedColor} / {selectedSize}" hiện đã
                          hết hàng. Vui lòng chọn phân loại khác hoặc quay lại
                          sau.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Low Stock Warning */}
                  {selectedVariant &&
                    selectedVariant.stockQuantity > 0 &&
                    selectedVariant.stockQuantity <= 5 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2 animate-in fade-in">
                        <AlertCircle
                          className="text-orange-500 shrink-0"
                          size={16}
                        />
                        <p className="text-xs font-bold text-orange-700">
                          Chỉ còn{" "}
                          <span className="text-orange-900">
                            {selectedVariant.stockQuantity}
                          </span>{" "}
                          sản phẩm - Đặt ngay!
                        </p>
                      </div>
                    )}

                  <div className="flex items-center gap-4">
                    {/* Quantity Selector - Disabled when out of stock */}
                    <div
                      className={`flex items-center rounded-xl p-1 h-12 ${
                        selectedVariant?.stockQuantity === 0
                          ? "bg-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-gray-100"
                      }`}
                    >
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={
                          !selectedVariant ||
                          selectedVariant.stockQuantity === 0
                        }
                        className="w-10 h-full hover:bg-white rounded-lg flex items-center justify-center text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-black text-lg text-gray-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          // Limit quantity to stock
                          const maxQty = selectedVariant?.stockQuantity || 1;
                          if (quantity < maxQty) {
                            setQuantity(quantity + 1);
                          }
                        }}
                        disabled={
                          !selectedVariant ||
                          selectedVariant.stockQuantity === 0 ||
                          quantity >= (selectedVariant?.stockQuantity || 0)
                        }
                        className="w-10 h-full hover:bg-white rounded-lg flex items-center justify-center text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs font-bold">
                      {selectedVariant ? (
                        selectedVariant.stockQuantity > 0 ? (
                          <div className="space-y-1">
                            <span className="text-green-500 flex items-center gap-2 uppercase tracking-widest">
                              <ShieldCheck size={16} /> Còn hàng
                            </span>
                            <span className="text-gray-400 text-[10px]">
                              Tồn kho: {selectedVariant.stockQuantity}
                            </span>
                          </div>
                        ) : (
                          <span className="text-red-500 flex items-center gap-2 uppercase tracking-widest">
                            <AlertCircle size={16} /> Hết hàng
                          </span>
                        )
                      ) : (
                        <span className="text-orange-400 animate-pulse">
                          Vui lòng chọn phân loại
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      if (!selectedVariant) {
                        alert("Vui lòng chọn màu sắc và kích cỡ!");
                        return;
                      }
                      if (selectedVariant.stockQuantity === 0) {
                        alert(
                          `Phân loại "${selectedColor} / ${selectedSize}" đã hết hàng. Vui lòng chọn phân loại khác.`
                        );
                        return;
                      }
                      if (quantity > selectedVariant.stockQuantity) {
                        alert(
                          `Số lượng tối đa có thể đặt là ${selectedVariant.stockQuantity}`
                        );
                        setQuantity(selectedVariant.stockQuantity);
                        return;
                      }
                      addToCart(product, selectedVariant, quantity);
                    }}
                    disabled={
                      !selectedVariant || selectedVariant.stockQuantity === 0
                    }
                    className={`w-full h-14 rounded-[20px] font-black text-base flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                      !selectedVariant || selectedVariant.stockQuantity === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-secondary hover:bg-blue-600 text-white shadow-2xl shadow-blue-500/30"
                    }`}
                  >
                    {!selectedVariant ? (
                      <>
                        <AlertCircle size={22} /> CHỌN PHÂN LOẠI
                      </>
                    ) : selectedVariant.stockQuantity === 0 ? (
                      <>
                        <AlertCircle size={22} /> TẠM HẾT HÀNG
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={22} /> THÊM VÀO GIỎ
                      </>
                    )}
                  </button>

                  {/* Notify when back in stock - for out of stock items */}
                  {selectedVariant && selectedVariant.stockQuantity === 0 && (
                    <button className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-secondary hover:text-secondary transition flex items-center justify-center gap-2">
                      <RefreshCw size={16} />
                      Thông báo khi có hàng
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="flex border-b border-gray-100 bg-white overflow-x-auto no-scrollbar px-6 md:px-8">
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
                className={`px-6 py-5 font-black text-xs uppercase tracking-widest transition relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-secondary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-secondary"
                    : "text-gray-400 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 md:p-10">
            {activeTab === "info" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* CỘT TRÁI: THÔNG SỐ KỸ THUẬT + SIZE GUIDE */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">
                        <Info size={18} />
                      </div>
                      <h4 className="text-base font-black uppercase tracking-tight text-gray-800">
                        Thông số kỹ thuật
                      </h4>
                    </div>
                    <div className="space-y-1 bg-gray-50 rounded-2xl p-4">
                      <SpecRow
                        label="Thương hiệu"
                        value={product.brand?.name || "SportHub"}
                      />
                      <SpecRow
                        label="Mã sản phẩm"
                        value={product.productCode}
                      />
                      <SpecRow
                        label="Danh mục"
                        value={product.category?.name || "Thể thao"}
                      />
                      <SpecRow
                        label="Trạng thái"
                        value={product.condition || "Mới 100% Full box"}
                      />
                      {/* Hiển thị TẤT CẢ thuộc tính bổ sung */}
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

                  {/* HƯỚNG DẪN CHỌN SIZE */}
                  {sizeGuide && (
                    <div className="animate-in fade-in duration-700">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-secondary rounded-xl">
                          <TableIcon size={18} />
                        </div>
                        <div>
                          <h4 className="text-base font-black uppercase tracking-tight text-gray-800">
                            Bảng size
                          </h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {sizeGuide.name}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                {sizeGuide.columns.map((col) => (
                                  <th
                                    key={col.key}
                                    className="px-4 py-3 text-[9px] font-black text-secondary uppercase tracking-[0.2em]"
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
                                      className="px-4 py-3 text-sm font-black text-gray-700"
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

                      <div className="mt-4 flex items-start gap-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <Info
                          className="text-secondary shrink-0 mt-0.5"
                          size={14}
                        />
                        <p className="text-[9px] font-bold text-blue-800 leading-relaxed uppercase">
                          Mẹo: Nếu chân bạn bè hoặc dày, hãy tăng 0.5-1 size để
                          thoải mái hơn.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CỘT PHẢI: MÔ TẢ CHI TIẾT */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">
                      <AlignLeft size={18} />
                    </div>
                    <h4 className="text-base font-black uppercase tracking-tight text-gray-800">
                      Mô tả chi tiết
                    </h4>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-base text-gray-600 leading-relaxed font-medium italic mb-6 border-l-4 border-secondary pl-5 bg-gray-50 py-4 rounded-r-xl">
                      "{product.description}"
                    </p>
                    <div className="space-y-3 text-sm text-gray-700 leading-loose">
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
                    <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 col-span-2">
                      <Info size={32} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Thông tin đang được cập nhật...
                      </p>
                    </div>
                  )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI: TỔNG QUAN ĐÁNH GIÁ */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 space-y-6">
                    <div className="text-center bg-gray-50 p-6 rounded-2xl">
                      <p className="text-5xl font-black text-gray-900 mb-2">
                        4.8
                      </p>
                      <div className="flex text-yellow-400 justify-center mb-2">
                        <Star size={18} fill="currentColor" />{" "}
                        <Star size={18} fill="currentColor" />{" "}
                        <Star size={18} fill="currentColor" />{" "}
                        <Star size={18} fill="currentColor" />{" "}
                        <Star size={18} fill="currentColor" />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {product.reviews?.length || 0} Nhận xét
                      </p>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 w-4">
                            {star}
                          </span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary"
                              style={{
                                width:
                                  star === 5
                                    ? "85%"
                                    : star === 4
                                    ? "10%"
                                    : "5%",
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI: DANH SÁCH ĐÁNH GIÁ */}
                <div className="lg:col-span-2">
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {paginatedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-100 pb-6 last:border-0"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  review.avatarUrl ||
                                  `https://ui-avatars.com/api/?name=${review.userName}`
                                }
                                className="w-10 h-10 rounded-full border border-gray-100 object-cover"
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

                          <div className="pl-13 space-y-3">
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                              "{review.comment}"
                            </p>

                            {review.images && review.images.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {review.images.map((img, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setZoomedImage(img)}
                                    className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:scale-105 transition transform"
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
                    <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Star size={48} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        Chưa có đánh giá nào.
                      </p>
                    </div>
                  )}
                </div>
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
