import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services";
import { Category, Product } from "../types";
import { ArrowRight, Search } from "lucide-react";
import { ProductCard } from "../components/features/product/ProductCard";
import { useProducts } from "../hooks/useProductsQuery";

export const HomePage = () => {
  // Use TanStack Query for automatic caching
  const { data: allCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.categories.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
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

  return (
    <div className="space-y-12">
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
      </section>

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
