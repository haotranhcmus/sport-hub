import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../../../types";
import { formatCurrency } from "../../../utils";
import { usePrefetchProduct } from "../../../hooks/useProductsQuery";

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
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100 flex flex-col group"
      onMouseEnter={() => prefetchProduct(product.slug)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
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
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-secondary transition">
          {product.name}
        </h3>
        <div className="mt-auto">
          <div className="flex items-center gap-2">
            {product.promotionalPrice ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(product.promotionalPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.basePrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.basePrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
