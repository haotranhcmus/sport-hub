import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../../../types";
import { formatCurrency } from "../../../utils";
import { usePrefetchProduct } from "../../../hooks/useProductsQuery";
import { Star } from "lucide-react";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const prefetchProduct = usePrefetchProduct();

  const discount = product.promotionalPrice
    ? Math.round(
        ((product.basePrice - product.promotionalPrice) / product.basePrice) *
          100
      )
    : 0;

  const imageUrl =
    product.thumbnailUrl && product.thumbnailUrl.trim() !== ""
      ? product.thumbnailUrl
      : "https://via.placeholder.com/400x400?text=No+Image";

  return (
    <Link
      to={`/products/${product.slug}`}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-blue-400 flex flex-col group"
      onMouseEnter={() => prefetchProduct(product.slug)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (
              target.src !== "https://via.placeholder.com/400x400?text=No+Image"
            ) {
              target.src = "https://via.placeholder.com/400x400?text=No+Image";
            }
          }}
        />
        {/* Discount Badge - SportHub Style */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            -{discount}%
          </div>
        )}
        {/* Free Shipping Badge */}
        {product.freeShipping && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-medium rounded-full">
              Free Ship
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 flex-grow flex flex-col">
        {/* Product Name */}
        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 leading-snug min-h-[40px] font-medium">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-blue-600 font-bold text-base">
                {(product.promotionalPrice || product.basePrice)
                  .toLocaleString()
                  .replace(/,/g, ".")}
                đ
              </span>
              {product.promotionalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {product.basePrice.toLocaleString().replace(/,/g, ".")}đ
                </span>
              )}
            </div>
          </div>

          {/* Rating & Sold */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star size={12} fill="#f59e0b" className="text-amber-500" />
              <span className="font-medium text-gray-700">4.8</span>
            </div>
            <span>Đã bán {product.totalSold || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
