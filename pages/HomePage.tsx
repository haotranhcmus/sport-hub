import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services";
import { Category, Product, AppBanner } from "../types";
import { ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "../components/features/product/ProductCard";
import { useProducts } from "../hooks/useProductsQuery";

// Banner Slider Component
const BannerSlider = ({ banners }: { banners: AppBanner[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter((b) => b.isActive && b.imageUrl);

  // Auto slide
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    // Fallback banner
    return (
      <section className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
        <img
          src="https://picsum.photos/1920/600?random=hero"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
          <div className="px-8 md:px-16 max-w-xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Bứt phá giới hạn
            </h1>
            <p className="mb-8 text-lg text-gray-200">
              Bộ sưu tập giày bóng đá mới nhất mùa giải 2025.
            </p>
            <Link
              to="/products"
              className="bg-secondary text-white px-8 py-3 rounded-full font-bold transition inline-flex items-center shadow-lg hover:bg-blue-600"
            >
              Mua ngay <ArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const goToSlide = (index: number) => setCurrentIndex(index);
  const goPrev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
    );
  const goNext = () =>
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);

  return (
    <section className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px] group">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeBanners.map((banner, idx) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            {banner.linkUrl ? (
              <Link to={banner.linkUrl} className="block w-full h-full">
                <img
                  src={banner.imageUrl}
                  alt={`Banner ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <img
                src={banner.imageUrl}
                alt={`Banner ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}

      {/* CTA Overlay (optional - shown if first banner) */}
      {currentIndex === 0 && activeBanners[0] && !activeBanners[0].linkUrl && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center pointer-events-none">
          <div className="px-8 md:px-16 max-w-xl text-white pointer-events-auto">
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-secondary text-white px-8 py-3 rounded-full font-bold transition inline-flex items-center shadow-lg hover:bg-blue-600"
              >
                Mua ngay <ArrowRight className="ml-2" />
              </Link>
              <Link
                to="/tracking"
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-full font-bold transition inline-flex items-center shadow-lg hover:bg-white/20"
              >
                Tra cứu đơn hàng <Search className="ml-2" size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export const HomePage = () => {
  // Use TanStack Query for automatic caching
  const { data: allCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load system config for banners
  const { data: systemConfig } = useQuery({
    queryKey: ["systemConfig"],
    queryFn: () => api.system.getConfig(),
    staleTime: 5 * 60 * 1000,
  });

  // Lọc chỉ lấy danh mục cha (không có parentId)
  const parentCategories = useMemo(
    () => allCategories.filter((cat) => !cat.parentId),
    [allCategories]
  );

  const { data: allProducts = [], isLoading: productsLoading } = useProducts();

  const featuredProducts = useMemo(
    () => allProducts.slice(0, 4),
    [allProducts]
  );

  // Get banners from config
  const banners = systemConfig?.banners || [];

  return (
    <div className="space-y-12">
      {/* Banner Slider */}
      <BannerSlider banners={banners} />

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-primary">Danh mục nổi bật</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {parentCategories.map((cat) => (
            <Link
              to={`/products?category=${cat.id}`}
              key={cat.id}
              className="group"
            >
              <div className="relative rounded-xl overflow-hidden aspect-square mb-3 shadow-md">
                <img
                  src={cat.imageUrl || "https://via.placeholder.com/400"}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400?text=Category";
                  }}
                />
              </div>
              <h3 className="text-center font-bold text-gray-800">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mb-6">
          Sản phẩm mới về
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
