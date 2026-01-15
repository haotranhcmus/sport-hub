import React from "react";
import { useCart } from "../context/CartContext";
import {
  Trash2,
  ArrowLeft,
  AlertTriangle,
  XCircle,
  Info,
  ShoppingCart,
  Ticket,
  ChevronRight,
  Store,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const CartPage = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
    isValid,
    syncLoading,
  } = useCart();
  const navigate = useNavigate();

  if (syncLoading)
    return (
      <div className="py-40 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Đang đồng bộ giỏ hàng...</p>
      </div>
    );

  if (items.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-lg shadow-sm">
        <div className="w-28 h-28 bg-orange-50 text-orange-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={56} strokeWidth={1} />
        </div>
        <h2 className="text-xl text-gray-700 mb-3">
          Giỏ hàng của bạn còn trống
        </h2>
        <p className="text-gray-400 mb-8 text-sm">Hãy mua sắm ngay!</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-sm font-medium hover:bg-orange-600 transition"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Shopee-style Header */}
      <div className="bg-white border-b border-gray-100 mb-4 rounded-t-sm">
        <div className="px-5 py-4 grid grid-cols-12 gap-4 items-center text-sm text-gray-500">
          <div className="col-span-5 flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 accent-orange-500"
              checked
              readOnly
            />
            <span>Sản Phẩm</span>
          </div>
          <div className="col-span-2 text-center">Đơn Giá</div>
          <div className="col-span-2 text-center">Số Lượng</div>
          <div className="col-span-2 text-center">Số Tiền</div>
          <div className="col-span-1 text-center">Thao Tác</div>
        </div>
      </div>

      {/* Shop Section - Shopee style */}
      <div className="bg-white rounded-sm shadow-sm mb-4">
        {/* Shop header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <input
            type="checkbox"
            className="w-4 h-4 accent-orange-500"
            checked
            readOnly
          />
          <Store size={16} className="text-orange-500" />
          <span className="font-medium text-gray-800">
            SportHub Official Store
          </span>
          <span className="text-orange-500 text-xs border border-orange-500 px-1.5 py-0.5 rounded-sm">
            Mall
          </span>
        </div>

        {/* Cart Items */}
        {items.map((item: any) => {
          const price = item.product.promotionalPrice || item.product.basePrice;
          const finalPrice = price + item.variant.priceAdjustment;

          return (
            <div
              key={item.variantId}
              className={`px-5 py-4 border-b border-gray-50 grid grid-cols-12 gap-4 items-center ${
                !item.isAvailable ? "bg-gray-50" : ""
              }`}
            >
              {/* Product Info */}
              <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-orange-500"
                  checked={item.isAvailable}
                  readOnly
                />
                <div className="w-20 h-20 flex-shrink-0 border border-gray-200 rounded overflow-hidden bg-white">
                  <img
                    src={
                      item.product.thumbnailUrl ||
                      "https://via.placeholder.com/150"
                    }
                    alt={item.product.name}
                    className={`w-full h-full object-cover ${
                      !item.isAvailable ? "grayscale opacity-60" : ""
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm line-clamp-2 ${
                      !item.isAvailable ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {item.product.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {item.variant.color}, Size {item.variant.size}
                    </span>
                  </div>
                  {/* Error/Warning */}
                  {item.error ? (
                    <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <XCircle size={12} /> {item.error}
                    </div>
                  ) : item.warning ? (
                    <div className="mt-1 text-xs text-orange-500 flex items-center gap-1">
                      <AlertTriangle size={12} /> {item.warning}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Unit Price */}
              <div className="col-span-4 md:col-span-2 text-center">
                <span className="md:hidden text-xs text-gray-400 block mb-1">
                  Đơn giá
                </span>
                <span
                  className={`text-sm ${
                    !item.isAvailable ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  ₫{finalPrice.toLocaleString()}
                </span>
              </div>

              {/* Quantity */}
              <div className="col-span-4 md:col-span-2 flex justify-center">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    disabled={!item.isAvailable || item.quantity <= 1}
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed border-r border-gray-300"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    disabled={!item.isAvailable}
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed border-l border-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="col-span-2 md:col-span-2 text-center">
                <span className="md:hidden text-xs text-gray-400 block mb-1">
                  Thành tiền
                </span>
                <span
                  className={`text-sm font-medium ${
                    !item.isAvailable ? "text-gray-400" : "text-orange-500"
                  }`}
                >
                  ₫{(finalPrice * item.quantity).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 md:col-span-1 text-center">
                <button
                  onClick={() => removeFromCart(item.variantId)}
                  className="text-gray-400 hover:text-orange-500 text-sm transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          );
        })}

        {/* Voucher Section */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-500">
            <Ticket size={18} />
            <span className="text-sm">Voucher của Shop</span>
          </div>
          <button className="text-blue-500 text-sm flex items-center gap-1 hover:text-blue-600">
            Chọn Voucher <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Sticky Footer - Shopee style */}
      <div className="bg-white rounded-sm shadow-sm sticky bottom-0 z-10">
        {/* Warning if invalid */}
        {!isValid && (
          <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
            <AlertTriangle size={18} className="text-orange-500" />
            <p className="text-sm text-orange-700">
              Có sản phẩm đã hết hàng hoặc ngừng kinh doanh. Vui lòng xóa để
              tiếp tục thanh toán.
            </p>
          </div>
        )}

        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-500"
                checked
                readOnly
              />
              <span className="text-sm text-gray-600">
                Chọn Tất Cả ({items.length})
              </span>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-orange-500 transition"
            >
              Xóa
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Tổng thanh toán ({items.length} Sản phẩm):
                </span>
                <span className="text-2xl font-medium text-orange-500">
                  ₫{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              disabled={!isValid}
              onClick={() => navigate("/checkout")}
              className="px-12 py-3 bg-orange-500 text-white font-medium rounded-sm hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Mua Hàng
            </button>
          </div>
        </div>

        {/* Continue shopping link */}
        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <Link
            to="/products"
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};
