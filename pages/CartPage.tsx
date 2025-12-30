import React from "react";
import { useCart } from "../context/CartContext";
import { Trash2, ArrowLeft, AlertTriangle, XCircle, Info } from "lucide-react";
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
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Đang đồng bộ giỏ hàng...
        </p>
      </div>
    );

  if (items.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-[40px] shadow-sm border border-gray-100 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-4">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">
          Hãy khám phá bộ sưu tập mới nhất và chọn cho mình những món đồ ưng ý
          nhé.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-10 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition"
        >
          <ArrowLeft size={16} />
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
      {/* Left Column: Items */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hidden md:grid grid-cols-12 gap-4">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Thành tiền</div>
          </div>

          {items.map((item: any) => {
            const price =
              item.product.promotionalPrice || item.product.basePrice;
            const finalPrice = price + item.variant.priceAdjustment;

            return (
              <div
                key={item.variantId}
                className={`p-6 border-b last:border-0 border-gray-50 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative transition ${
                  !item.isAvailable ? "bg-red-50/30" : ""
                }`}
              >
                <div className="col-span-12 md:col-span-6 flex gap-6">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <img
                      src={
                        item.product.thumbnailUrl ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item.product.name}
                      className={`w-full h-full object-cover ${
                        !item.isAvailable ? "grayscale" : ""
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3
                      className={`font-black text-gray-800 text-base line-clamp-1 ${
                        !item.isAvailable ? "text-gray-400" : ""
                      }`}
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {item.variant.color} / SIZE {item.variant.size}
                    </p>

                    {/* Warnings/Errors */}
                    {item.error ? (
                      <div className="mt-2 text-[10px] font-black text-red-600 flex items-center gap-1 uppercase tracking-tighter">
                        <XCircle size={12} /> {item.error}
                      </div>
                    ) : item.warning ? (
                      <div className="mt-2 text-[10px] font-black text-orange-500 flex items-center gap-1 uppercase tracking-tighter">
                        <AlertTriangle size={12} /> {item.warning}
                      </div>
                    ) : null}

                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-1 hover:underline md:hidden"
                    >
                      <Trash2 size={12} /> Xóa khỏi giỏ
                    </button>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-2 text-left md:text-center">
                  <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    Đơn giá:
                  </span>
                  <span
                    className={`font-black ${
                      !item.isAvailable ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {finalPrice.toLocaleString()}đ
                  </span>
                </div>

                <div className="col-span-4 md:col-span-2 flex justify-center">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 h-10">
                    <button
                      disabled={!item.isAvailable}
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="w-8 h-full hover:bg-white rounded-lg flex items-center justify-center text-gray-400 transition disabled:opacity-0"
                    >
                      -
                    </button>
                    <span
                      className={`w-10 text-center text-sm font-black ${
                        !item.isAvailable ? "text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      disabled={!item.isAvailable}
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="w-8 h-full hover:bg-white rounded-lg flex items-center justify-center text-gray-400 transition disabled:opacity-0"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-2 text-right">
                  <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    Tổng:
                  </span>
                  <span
                    className={`font-black text-lg ${
                      !item.isAvailable ? "text-gray-400" : "text-secondary"
                    }`}
                  >
                    {(finalPrice * item.quantity).toLocaleString()}đ
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.variantId)}
                  className="absolute top-6 right-6 text-gray-200 hover:text-red-500 hidden md:block transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center px-4">
          <button
            onClick={clearCart}
            className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-[0.2em] transition"
          >
            Xóa tất cả
          </button>
          <Link
            to="/products"
            className="text-[10px] font-black text-secondary hover:underline uppercase tracking-[0.2em] flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      {/* Right Column: Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 sticky top-24">
          <h2 className="text-xl font-black text-gray-800 mb-8 uppercase tracking-tight">
            Tóm tắt đơn hàng
          </h2>

          <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
            <div className="flex justify-between text-gray-500 text-sm font-bold">
              <span className="uppercase tracking-widest">Tạm tính</span>
              <span className="text-gray-800">
                {totalPrice.toLocaleString()}đ
              </span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm font-bold">
              <span className="uppercase tracking-widest">Vận chuyển</span>
              <span className="text-[10px] italic text-gray-400 uppercase tracking-widest">
                Tính lúc thanh toán
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-10">
            <span className="font-black text-gray-800 text-lg uppercase tracking-wider">
              Tổng cộng
            </span>
            <span className="font-black text-3xl text-red-600 tracking-tighter">
              {totalPrice.toLocaleString()}đ
            </span>
          </div>

          {!isValid && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
              <p className="text-[10px] font-bold text-red-800 leading-relaxed uppercase tracking-tighter">
                Vui lòng kiểm tra lại giỏ hàng. Có sản phẩm đã hết hàng hoặc
                ngừng kinh doanh không thể thanh toán.
              </p>
            </div>
          )}

          <button
            disabled={!isValid}
            onClick={() => navigate("/checkout")}
            className="w-full bg-secondary hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-95 text-lg flex items-center justify-center gap-3"
          >
            TIẾN HÀNH THANH TOÁN
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-300">
            <Info size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
              SportHub An tâm mua sắm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
