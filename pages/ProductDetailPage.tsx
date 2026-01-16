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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f5f5f5]">
        <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-[#f5f5f5]">
        <AlertCircle size={64} className="text-[#3b82f6] mb-6" />
        <h2 className="text-xl font-medium text-gray-800 mb-2">
          {error || "Không tìm thấy sản phẩm"}
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Vui lòng quay lại danh sách sản phẩm để tìm kiếm mẫu khác.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#3b82f6] text-white rounded hover:bg-[#2563eb] transition"
        >
          <ArrowLeft size={18} /> Quay lại cửa hàng
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
    <div className="min-h-screen bg-[#f5f5f5] -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 px-4 sm:px-6 lg:px-8 pt-6 pb-10">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Breadcrumb - SportHub Style */}
        <nav className="text-sm text-gray-500 flex gap-1.5 items-center py-2">
          <Link to="/" className="hover:text-[#3b82f6] transition">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/products" className="hover:text-[#3b82f6] transition">
            Sản phẩm
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-700 truncate max-w-[300px]">
            {product.name}
          </span>
        </nav>

        {/* Main Product Card - SportHub Style */}
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Image Gallery */}
            <div className="lg:col-span-5 p-4">
              <div className="relative aspect-square w-full bg-white border border-gray-100 overflow-hidden group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("placeholder")) {
                      target.src =
                        "https://via.placeholder.com/600?text=No+Image";
                    }
                  }}
                />
                {discountPercent > 0 && (
                  <div className="absolute top-0 right-0 bg-[#3b82f6] text-white text-xs font-bold px-2 py-1">
                    -{discountPercent}%
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {productImages.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 border-2 transition cursor-pointer overflow-hidden flex-shrink-0 ${
                      activeImage === imgUrl
                        ? "border-[#3b82f6]"
                        : "border-gray-200 hover:border-[#3b82f6]"
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

            {/* Product Info - SportHub Style */}
            <div className="lg:col-span-7 p-5 lg:p-6 flex flex-col">
              {/* Title with Badge */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-0.5 rounded-full">
                    Chính hãng
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    SKU: {product.productCode}
                  </span>
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating & Sales */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= 4.8 ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-gray-300">|</span>
                <div className="text-sm">
                  <span className="font-medium border-b border-gray-700">
                    {product.reviews?.length || 0}
                  </span>
                  <span className="text-gray-500 ml-1">Đánh Giá</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="text-sm">
                  <span className="font-medium">{product.totalSold || 0}</span>
                  <span className="text-gray-500 ml-1">Đã Bán</span>
                </div>
              </div>

              {/* Price - SportHub Style */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 py-4 px-5 my-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 flex-wrap">
                  {discountPercent > 0 && (
                    <span className="text-base text-gray-400 line-through">
                      {product.basePrice.toLocaleString()}đ
                    </span>
                  )}
                  <span className="text-3xl font-bold text-blue-600">
                    {finalPrice.toLocaleString()}đ
                  </span>
                  {discountPercent > 0 && (
                    <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Giảm {discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Policies */}
              <div className="flex flex-wrap gap-3 mb-4 text-sm">
                {product.freeShipping && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <Truck size={16} />
                    <span className="font-medium">Miễn phí vận chuyển</span>
                  </div>
                )}
                {product.allowReturn && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                    <RotateCcw size={16} />
                    <span className="font-medium">
                      Đổi trả {product.returnPeriod} ngày
                    </span>
                  </div>
                )}
              </div>

              {isStaff ? (
                <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-center">
                    <Briefcase
                      size={32}
                      className="text-gray-400 mx-auto mb-2"
                    />
                    <p className="font-medium text-gray-700">
                      Giao diện Nhân sự
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Chức năng mua hàng đã bị ẩn
                    </p>
                    <Link
                      to="/admin"
                      className="inline-block mt-3 px-4 py-2 bg-gray-800 text-white rounded text-sm"
                    >
                      Về Quản trị
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Color Selector - SportHub Style */}
                  <div className="flex items-start gap-4 py-4 border-b border-gray-100">
                    <span className="text-gray-500 text-sm w-28 pt-2 shrink-0">
                      Màu Sắc
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((color) => {
                        const isAvailable =
                          availableColorsForSize.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              if (selectedSize) {
                                const variantExists = product.variants?.some(
                                  (v) =>
                                    v.color === color &&
                                    v.size === selectedSize &&
                                    v.stockQuantity > 0
                                );
                                if (!variantExists) {
                                  const availableSize = product.variants?.find(
                                    (v) =>
                                      v.color === color && v.stockQuantity > 0
                                  )?.size;
                                  setSelectedSize(availableSize || "");
                                }
                              }
                            }}
                            className={`px-4 py-2 border text-sm transition rounded-lg ${
                              !isAvailable
                                ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed line-through bg-gray-50"
                                : selectedColor === color
                                ? "border-blue-500 text-blue-600 bg-blue-50 font-medium"
                                : "border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
                            }`}
                            disabled={!isAvailable}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selector - SportHub Style */}
                  <div className="flex items-start gap-4 py-4 border-b border-gray-100">
                    <div className="w-28 shrink-0 flex flex-col gap-1 pt-2">
                      <span className="text-gray-500 text-sm">Kích Cỡ</span>
                      {sizeGuide && (
                        <button
                          onClick={() => setShowSizeGuideModal(true)}
                          className="text-xs text-blue-600 flex items-center gap-1 hover:underline font-medium"
                        >
                          <Ruler size={12} /> Bảng size
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map((size) => {
                        const isAvailable =
                          availableSizesForColor.includes(size);
                        return (
                          <button
                            key={size}
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedSize(size);
                              if (selectedColor) {
                                const variantExists = product.variants?.some(
                                  (v) =>
                                    v.size === size &&
                                    v.color === selectedColor &&
                                    v.stockQuantity > 0
                                );
                                if (!variantExists) {
                                  const availableColor = product.variants?.find(
                                    (v) =>
                                      v.size === size && v.stockQuantity > 0
                                  )?.color;
                                  setSelectedColor(availableColor || "");
                                }
                              }
                            }}
                            className={`min-w-[50px] px-4 py-2 border text-sm transition rounded-lg ${
                              !isAvailable
                                ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed line-through bg-gray-50"
                                : selectedSize === size
                                ? "border-blue-500 text-blue-600 bg-blue-50 font-medium"
                                : "border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity & Stock - SportHub Style */}
                  <div className="flex items-center gap-4 py-4 border-b border-gray-100">
                    <span className="text-gray-500 text-sm w-28 shrink-0">
                      Số Lượng
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={
                            !selectedVariant ||
                            selectedVariant.stockQuantity === 0
                          }
                          className="w-10 h-10 hover:bg-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-50 transition"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            const maxQty = selectedVariant?.stockQuantity || 1;
                            setQuantity(Math.min(Math.max(1, val), maxQty));
                          }}
                          className="w-14 h-10 text-center border-x border-gray-200 outline-none font-medium"
                        />
                        <button
                          onClick={() => {
                            const maxQty = selectedVariant?.stockQuantity || 1;
                            if (quantity < maxQty) setQuantity(quantity + 1);
                          }}
                          disabled={
                            !selectedVariant ||
                            selectedVariant.stockQuantity === 0 ||
                            quantity >= (selectedVariant?.stockQuantity || 0)
                          }
                          className="w-8 h-8 hover:bg-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedVariant ? (
                          selectedVariant.stockQuantity > 0 ? (
                            <>{selectedVariant.stockQuantity} sản phẩm có sẵn</>
                          ) : (
                            <span className="text-[#3b82f6]">Hết hàng</span>
                          )
                        ) : (
                          "Chọn phân loại"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Stock Warning */}
                  {selectedVariant &&
                    selectedVariant.stockQuantity > 0 &&
                    selectedVariant.stockQuantity <= 5 && (
                      <div className="py-3 px-4 bg-[#fff8e6] border border-[#ffc107]/30 flex items-center gap-2 my-4">
                        <AlertCircle
                          className="text-[#f59e0b] shrink-0"
                          size={16}
                        />
                        <p className="text-sm text-[#b45309]">
                          Chỉ còn <b>{selectedVariant.stockQuantity}</b> sản
                          phẩm - Đặt ngay!
                        </p>
                      </div>
                    )}

                  {/* Add to Cart Button - SportHub Style */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        if (!selectedVariant) {
                          alert("Vui lòng chọn màu sắc và kích cỡ!");
                          return;
                        }
                        if (selectedVariant.stockQuantity === 0) {
                          alert(
                            `Phân loại "${selectedColor}/${selectedSize}" đã hết hàng.`
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
                      className={`flex-1 h-12 border-2 font-semibold flex items-center justify-center gap-2 transition-all rounded-lg ${
                        !selectedVariant || selectedVariant.stockQuantity === 0
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md"
                      }`}
                    >
                      <ShoppingCart size={20} />
                      Thêm Vào Giỏ
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedVariant) {
                          alert("Vui lòng chọn màu sắc và kích cỡ!");
                          return;
                        }
                        if (selectedVariant.stockQuantity === 0) {
                          alert(
                            `Phân loại "${selectedColor}/${selectedSize}" đã hết hàng.`
                          );
                          return;
                        }
                        addToCart(product, selectedVariant, quantity, true);
                        navigate("/checkout");
                      }}
                      disabled={
                        !selectedVariant || selectedVariant.stockQuantity === 0
                      }
                      className={`flex-1 h-12 font-semibold transition-all rounded-lg ${
                        !selectedVariant || selectedVariant.stockQuantity === 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-lg"
                      }`}
                    >
                      Mua Ngay
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs - SportHub Style */}
        <div className="border-t border-gray-100 mt-4">
          <div className="flex border-b border-gray-100 bg-[#fafafa] px-5">
            {[
              { id: "info", label: "Chi Tiết Sản Phẩm" },
              {
                id: "reviews",
                label: `Đánh Giá (${product.reviews?.length || 0})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm transition relative ${
                  activeTab === tab.id
                    ? "text-[#3b82f6] bg-white border-b-2 border-[#3b82f6] -mb-[1px]"
                    : "text-gray-600 hover:text-[#3b82f6]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5 bg-[#fafafa]">
            {activeTab === "info" && (
              <div className="bg-white p-5">
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-3 border-b border-gray-100">
                  CHI TIẾT SẢN PHẨM
                </h3>

                {/* Specs Table - SportHub Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                  <div className="flex">
                    <span className="text-gray-500 text-sm w-36 shrink-0">
                      Thương hiệu
                    </span>
                    <span className="text-sm text-[#3b82f6]">
                      {product.brand?.name || "SportHub"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 text-sm w-36 shrink-0">
                      Mã sản phẩm
                    </span>
                    <span className="text-sm">{product.productCode}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 text-sm w-36 shrink-0">
                      Danh mục
                    </span>
                    <span className="text-sm">
                      {product.category?.name || "Thể thao"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 text-sm w-36 shrink-0">
                      Tình trạng
                    </span>
                    <span className="text-sm">
                      {product.condition || "Mới 100% Full box"}
                    </span>
                  </div>
                  {productInfoSpecs.map((spec, i) => (
                    <div key={i} className="flex">
                      <span className="text-gray-500 text-sm w-36 shrink-0">
                        {spec.label}
                      </span>
                      <span className="text-sm">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* Size Guide */}
                {sizeGuide && (
                  <div className="mb-6">
                    <h4 className="text-base font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Ruler size={16} className="text-[#3b82f6]" />
                      BẢNG SIZE
                    </h4>
                    <div className="overflow-x-auto border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {sizeGuide.columns.map((col) => (
                              <th
                                key={col.key}
                                className="px-4 py-3 text-left text-gray-600 font-medium border-b"
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizeGuide.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              {sizeGuide.columns.map((col) => (
                                <td
                                  key={col.key}
                                  className="px-4 py-3 border-b border-gray-100"
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
                )}

                {/* Description */}
                <div>
                  <h4 className="text-base font-medium text-gray-800 mb-3">
                    MÔ TẢ SẢN PHẨM
                  </h4>
                  <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                    <p>{product.description}</p>
                    <p>
                      SportHub cam kết cung cấp sản phẩm chính hãng với các tiêu
                      chuẩn khắt khe nhất, đảm bảo mang đến trải nghiệm tốt nhất
                      cho người dùng trong quá trình vận động và thi đấu chuyên
                      nghiệp.
                    </p>
                    <p>
                      Chất liệu cao cấp được chọn lọc kỹ lưỡng kết hợp cùng
                      những công nghệ tiên tiến nhất hiện nay giúp tối ưu hóa
                      khả năng vận động và bảo vệ cơ thể người sử dụng.
                    </p>
                  </div>
                </div>

                {productInfoSpecs.length === 0 &&
                  !sizeGuide &&
                  !product.description && (
                    <div className="py-12 text-center text-gray-400">
                      <Info size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Thông tin đang được cập nhật...</p>
                    </div>
                  )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-white p-5">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Rating Summary - SportHub Style */}
                  <div className="lg:col-span-1">
                    <div className="bg-[#fffbf8] border border-[#3b82f6]/20 p-5 text-center">
                      <p className="text-4xl font-medium text-[#3b82f6] mb-1">
                        4.8 <span className="text-lg">trên 5</span>
                      </p>
                      <div className="flex text-[#3b82f6] justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={16} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-gray-600 w-12">{star} Sao</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                            <div
                              className="h-full bg-[#3b82f6]"
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

                  {/* Reviews List */}
                  <div className="lg:col-span-3">
                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {paginatedReviews.map((review) => (
                          <div key={review.id} className="py-4">
                            <div className="flex gap-3">
                              <img
                                src={
                                  review.avatarUrl ||
                                  `https://ui-avatars.com/api/?name=${review.userName}&background=ee4d2d&color=fff`
                                }
                                className="w-10 h-10 rounded-full object-cover"
                                alt=""
                              />
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                  {review.userName}
                                </p>
                                <div className="flex text-[#3b82f6] my-1">
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
                                <p className="text-xs text-gray-400 mb-2">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {review.comment}
                                </p>

                                {review.images && review.images.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {review.images.map((img, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setZoomedImage(img)}
                                        className="w-20 h-20 overflow-hidden border border-gray-200 hover:border-[#3b82f6] transition"
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
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <Star
                          size={48}
                          className="mx-auto text-gray-200 mb-4"
                        />
                        <p className="text-gray-500">Chưa có đánh giá nào</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products - SportHub Style */}
      {relatedProducts.length > 0 && (
        <div className="bg-white mt-4 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">
              SẢN PHẨM TƯƠNG TỰ
            </h2>
            <Link
              to="/products"
              className="text-sm text-[#3b82f6] hover:underline"
            >
              Xem Thêm &gt;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setZoomedImage(null)}
        >
          <button className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition">
            <X size={24} />
          </button>
          <div className="max-w-4xl w-full max-h-full flex items-center justify-center">
            <img
              src={zoomedImage}
              className="max-w-full max-h-[85vh] object-contain"
              alt="Zoomed"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Size Guide Modal - SportHub Style */}
      {showSizeGuideModal && sizeGuide && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowSizeGuideModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                Hướng Dẫn Chọn Size
              </h3>
              <button
                onClick={() => setShowSizeGuideModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-600 mb-4">
                {sizeGuide.description ||
                  "Vui lòng đối chiếu các thông số dưới đây để chọn kích cỡ phù hợp nhất."}
              </p>

              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {sizeGuide.columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left text-gray-600 font-medium border-b"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGuide.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {sizeGuide.columns.map((col) => (
                          <td
                            key={col.key}
                            className="px-4 py-3 border-b border-gray-100"
                          >
                            {row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-[#fff8e6] border border-[#ffc107]/30">
                <p className="text-sm text-[#b45309] flex items-start gap-2">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  Mẹo: Nếu số đo của bạn nằm giữa hai kích cỡ, hãy chọn cỡ lớn
                  hơn để thoải mái hơn.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowSizeGuideModal(false)}
                className="w-full py-2.5 bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
