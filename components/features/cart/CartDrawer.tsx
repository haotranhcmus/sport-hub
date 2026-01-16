import React from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";

export const CartDrawer = () => {
  const {
    isOpen,
    closeCart,
    items,
    removeFromCart,
    updateQuantity,
    totalPrice,
    isValid,
  } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    closeCart();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-black flex items-center gap-3 text-gray-800 uppercase tracking-tight">
            <ShoppingBag className="text-secondary" />
            GIỎ HÀNG{" "}
            <span className="text-gray-400 text-xs font-bold tracking-widest">
              ({items.length})
            </span>
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-6 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center animate-bounce">
                <ShoppingBag size={48} className="text-gray-200" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                  Trống không
                </p>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  Bắt đầu chọn đồ ngay nào!
                </p>
              </div>
              <button
                onClick={() => handleNavigate("/products")}
                className="px-8 py-3 bg-secondary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
              >
                MUA SẮM NGAY
              </button>
            </div>
          ) : (
            items.map((item: any) => {
              const price =
                item.product?.promotionalPrice || item.product?.basePrice || 0;
              const priceAdjustment = item.variant?.priceAdjustment || 0;
              const finalPrice = price + priceAdjustment;

              return (
                <div
                  key={item.variantId}
                  className={`flex gap-4 p-4 rounded-2xl border transition ${
                    !item.isAvailable
                      ? "bg-red-50/50 border-red-100"
                      : "border-gray-50 hover:shadow-md"
                  }`}
                >
                  <div className="w-20 h-20 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={
                        item.product.thumbnailUrl ||
                        "https://via.placeholder.com/80?text=No+Image"
                      }
                      alt={item.product.name}
                      className={`w-full h-full object-cover ${
                        !item.isAvailable ? "grayscale" : ""
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("placeholder")) {
                          target.src =
                            "https://via.placeholder.com/80?text=No+Image";
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className={`font-black text-sm line-clamp-1 ${
                          !item.isAvailable ? "text-gray-400" : "text-gray-800"
                        }`}
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest">
                        {item.variant.color} / SIZE {item.variant.size}
                      </p>
                      {(item.error || item.warning) && (
                        <p className="text-[8px] font-bold text-red-500 mt-1 uppercase tracking-tighter flex items-center gap-1">
                          <AlertTriangle size={10} />{" "}
                          {item.error || item.warning}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
                        <button
                          disabled={!item.isAvailable}
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="p-1 hover:bg-white rounded text-gray-400 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-black min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          disabled={!item.isAvailable}
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="p-1 hover:bg-white rounded text-gray-400 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-black ${
                            !item.isAvailable
                              ? "text-gray-400"
                              : "text-secondary"
                          }`}
                        >
                          {(finalPrice * item.quantity).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-gray-200 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-gray-50 space-y-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Tổng tạm tính:
              </span>
              <span className="text-2xl font-black text-red-600 tracking-tighter">
                {totalPrice.toLocaleString()}đ
              </span>
            </div>
            <button
              disabled={!isValid}
              onClick={() => handleNavigate("/checkout")}
              className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 flex justify-center items-center gap-2 hover:bg-blue-600 transition disabled:opacity-30 disabled:shadow-none"
            >
              THANH TOÁN <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
