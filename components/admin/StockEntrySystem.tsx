import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  Trash2,
  Box,
  Info,
  X,
  CheckCircle2,
  ChevronDown,
  Package,
  Upload,
  Camera,
  Sparkles,
} from "lucide-react";
import { api } from "../../services";
import {
  StockEntry,
  Supplier,
  Product,
  ProductVariant,
  StockEntryItem,
} from "../../types";
import { useAuth } from "../../context/AuthContext";
import { InputField } from "./SharedUI";
import {
  useStockEntries,
  useSuppliers,
  useCreateStockEntry,
} from "../../hooks/useInventoryQuery";
import { useProducts } from "../../hooks/useProductsQuery";

export const InventoryManager = () => {
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [viewingEntry, setViewingEntry] = useState<StockEntry | null>(null);

  // Use TanStack Query
  const {
    data: stockEntries = [],
    isLoading: loading,
    refetch,
  } = useStockEntries();
  const { data: suppliers = [] } = useSuppliers();
  const { data: allProducts = [] } = useProducts();

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.status === "active"),
    [suppliers]
  );

  if (viewMode === "create")
    return (
      <StockEntryForm
        suppliers={activeSuppliers}
        products={allProducts}
        onBack={() => setViewMode("list")}
        onSaved={() => {
          setViewMode("list");
          refetch();
        }}
      />
    );

  return (
    <div className="space-y-8 animate-in fade-in text-slate-900 p-6 md:p-8 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
            Quản lý Nhập kho
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">
            Lịch sử và Lập phiếu nhập hàng
          </p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3 hover:bg-black transition active:scale-95"
        >
          <Plus size={18} /> Lập phiếu mới
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-10 py-6">Mã phiếu</th>
              <th className="px-6 py-6">Thời gian</th>
              <th className="px-6 py-6">Nhà cung cấp</th>
              <th className="px-6 py-6">Nhân viên lập</th>
              <th className="px-6 py-6 text-right">Tổng giá trị</th>
              <th className="px-10 py-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stockEntries.length > 0 ? (
              stockEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-10 py-6 font-black text-secondary tracking-tighter uppercase">
                    {entry.code}
                  </td>
                  <td className="px-6 py-6 text-xs font-bold text-slate-600">
                    {new Date(entry.date).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-6 font-black uppercase text-sm text-slate-800">
                    {entry.supplierName}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                        {entry.actorName?.charAt(0) || "A"}
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                        {entry.actorName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right font-black text-slate-900">
                    {entry.totalAmount.toLocaleString()}đ
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button
                      onClick={() => setViewingEntry(entry)}
                      className="p-3 text-slate-400 hover:text-secondary transition hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest italic"
                >
                  Chưa có phiếu nhập kho nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingEntry && (
        <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Chi tiết phiếu nhập: {viewingEntry.code}
                </h3>
              </div>
              <button
                onClick={() => setViewingEntry(null)}
                className="p-2 text-slate-400 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-900 border-b border-gray-100 pb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Nhà cung cấp
                  </p>
                  <p className="font-black uppercase text-slate-800">
                    {viewingEntry.supplierName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Thời gian nhập
                  </p>
                  <p className="font-black text-slate-800">
                    {new Date(viewingEntry.date).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Người lập phiếu
                  </p>
                  <p className="font-black uppercase text-slate-800">
                    {viewingEntry.actorName}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-[32px] border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/50 text-[9px] font-black text-slate-500 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Sản phẩm / Phân loại</th>
                      <th className="px-6 py-4 text-center">Số lượng</th>
                      <th className="px-6 py-4 text-right">Đơn giá vốn</th>
                      <th className="px-6 py-4 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewingEntry.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="text-xs font-bold text-slate-800"
                      >
                        <td className="px-6 py-5">
                          <p className="font-black uppercase text-slate-900">
                            {item.productName}
                          </p>
                          <p className="text-[9px] text-secondary uppercase font-bold mt-0.5">
                            {item.variantName} • {item.sku}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-center font-black text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {item.unitCost.toLocaleString()}đ
                        </td>
                        <td className="px-6 py-5 text-right font-black text-slate-900">
                          {(item.quantity * item.unitCost).toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-10">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Tổng cộng giá trị phiếu
                </p>
                <p className="text-3xl font-black text-secondary tracking-tighter">
                  {viewingEntry.totalAmount.toLocaleString()}đ
                </p>
              </div>
              <button
                onClick={() => setViewingEntry(null)}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StockEntryForm = ({ suppliers, products, onBack, onSaved }: any) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [items, setItems] = useState<Partial<StockEntryItem>[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [expandedProdId, setExpandedProdId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!pickerSearch.trim()) return products.slice(0, 10);
    const query = pickerSearch.toLowerCase();
    return products.filter(
      (p: any) =>
        p.name.toLowerCase().includes(query) ||
        p.productCode.toLowerCase().includes(query)
    );
  }, [products, pickerSearch]);

  const handleAddItem = (product: Product, variant: ProductVariant) => {
    const existingIdx = items.findIndex((i) => i.variantId === variant.id);
    if (existingIdx > -1) {
      const updated = [...items];
      updated[existingIdx].quantity = (updated[existingIdx].quantity || 0) + 1;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          id: `tmp-${Date.now()}`,
          variantId: variant.id,
          productName: product.name,
          variantName: `${variant.color}/${variant.size}`,
          sku: variant.sku,
          quantity: 1,
          unitCost: product.costPrice || product.basePrice * 0.6,
        },
      ]);
    }
    setShowPicker(false);
    setPickerSearch("");
  };

  const handleSubmit = async () => {
    if (!selectedSupplierId) return alert("Vui lòng chọn Nhà cung cấp.");
    if (items.length === 0) return alert("Vui lòng thêm ít nhất một sản phẩm.");
    setLoading(true);
    try {
      const supplier = suppliers.find((s: any) => s.id === selectedSupplierId);
      await api.inventory.createStockEntry(
        {
          supplierId: selectedSupplierId,
          supplierName: supplier.name,
          items,
          totalAmount: items.reduce(
            (acc, i) => acc + i.quantity! * i.unitCost!,
            0
          ),
          actorName: currentUser?.fullName,
        },
        currentUser!
      );
      alert("Nhập kho thành công!");
      onSaved();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-6 text-slate-900 p-6 md:p-8">
      <div className="flex items-center gap-6 mb-10">
        <button
          onClick={onBack}
          className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition"
        >
          <ChevronLeft size={24} className="text-slate-800" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Lập phiếu nhập kho
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Phiếu nhập hàng từ Nhà cung cấp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[500px]">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} className="text-secondary" /> Danh sách sản
                phẩm nhập
              </h3>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="px-8 py-3.5 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition active:scale-95"
              >
                + TÌM CHỌN SẢN PHẨM
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[9px] font-black text-slate-500 uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4 text-center">Số lượng</th>
                    <th className="px-6 py-4 text-right">Đơn giá vốn</th>
                    <th className="px-10 py-4 text-right">Thành tiền</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic"
                      >
                        Nhấn nút "Tìm sản phẩm" để bắt đầu lập danh sách
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-gray-50/50 transition"
                      >
                        <td className="px-6 py-6">
                          <p className="font-black text-xs uppercase text-slate-800">
                            {item.productName}
                          </p>
                          <p className="text-[9px] text-secondary font-bold uppercase mt-0.5">
                            {item.variantName} • {item.sku}
                          </p>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <input
                            type="number"
                            className="w-20 bg-white border border-gray-200 rounded-xl p-2.5 text-center font-black text-sm text-slate-900 focus:ring-2 focus:ring-secondary/10 outline-none shadow-sm"
                            value={item.quantity}
                            onChange={(e) => {
                              const u = [...items];
                              u[idx].quantity = Math.max(
                                1,
                                parseInt(e.target.value) || 0
                              );
                              setItems(u);
                            }}
                          />
                        </td>
                        <td className="px-6 py-6 text-right">
                          <input
                            type="number"
                            className="w-32 bg-white border border-gray-200 rounded-xl p-2.5 text-right font-black text-sm text-slate-900 focus:ring-2 focus:ring-secondary/10 outline-none shadow-sm"
                            value={item.unitCost}
                            onChange={(e) => {
                              const u = [...items];
                              u[idx].unitCost = parseFloat(e.target.value) || 0;
                              setItems(u);
                            }}
                          />
                        </td>
                        <td className="px-10 py-6 text-right font-black text-slate-900">
                          {(
                            (item.quantity || 0) * (item.unitCost || 0)
                          ).toLocaleString()}
                          đ
                        </td>
                        <td className="px-6 py-6">
                          <button
                            onClick={() =>
                              setItems(items.filter((_, i) => i !== idx))
                            }
                            className="p-2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Nhà cung cấp đối tác *
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black text-sm uppercase text-slate-800 outline-none focus:ring-2 focus:ring-secondary/10 cursor-pointer shadow-sm"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                >
                  <option value="">-- CHỌN ĐỐI TÁC --</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-8 bg-slate-900 rounded-[32px] text-white space-y-6">
                <div className="flex justify-between items-center opacity-60 text-[10px] font-black uppercase tracking-widest">
                  <span>Tổng mặt hàng SKU</span>
                  <span className="text-sm">{items.length} mục</span>
                </div>
                <div className="flex justify-between items-center opacity-60 text-[10px] font-black uppercase tracking-widest">
                  <span>Tổng số lượng (cái)</span>
                  <span className="text-sm">
                    {items.reduce((acc, i) => acc + (i.quantity || 0), 0)} cái
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                  <span className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">
                    Tổng tiền thanh toán
                  </span>
                  <span className="text-3xl font-black text-green-400 tracking-tighter">
                    {items
                      .reduce((acc, i) => acc + i.quantity! * i.unitCost!, 0)
                      .toLocaleString()}
                    đ
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || items.length === 0}
                className="w-full py-6 bg-secondary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-600 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="animate-spin mx-auto" size={20} />
                ) : (
                  "XÁC NHẬN HOÀN TẤT NHẬP KHO"
                )}
              </button>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Info size={16} className="text-secondary shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-blue-800 uppercase leading-relaxed">
                  Dữ liệu sau khi xác nhận sẽ được cộng trực tiếp vào tồn kho hệ
                  thống và không thể sửa đổi thông tin kế toán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT PICKER MODAL */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/60 z-[600] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary text-white rounded-2xl shadow-xl">
                  <Plus size={24} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Tìm chọn sản phẩm nhập
                </h3>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="p-3 bg-white border border-gray-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-2xl shadow-sm transition transform active:scale-90"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 bg-gray-50 border-b border-gray-100">
              <div className="relative max-w-2xl mx-auto">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  autoFocus
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-[20px] pl-16 pr-6 py-5 text-sm font-black text-slate-900 uppercase outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition shadow-sm"
                  placeholder="Gõ tên sản phẩm, Model hoặc SKU..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-white">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedProdId(expandedProdId === p.id ? null : p.id)
                      }
                      className="w-full p-6 flex items-center gap-6 hover:bg-gray-50 transition text-left group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden p-1 flex items-center justify-center shrink-0">
                        <img
                          src={
                            p.thumbnailUrl ||
                            "https://via.placeholder.com/64?text=No+Image"
                          }
                          className="max-w-full max-h-full object-contain"
                          alt=""
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes("placeholder")) {
                              target.src =
                                "https://via.placeholder.com/64?text=No+Image";
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase text-slate-800 tracking-tight group-hover:text-secondary transition">
                          {p.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Model: {p.productCode}
                        </p>
                      </div>
                      <div
                        className={`p-2 rounded-xl bg-gray-50 text-slate-300 transition-all ${
                          expandedProdId === p.id
                            ? "rotate-180 text-secondary bg-blue-50"
                            : ""
                        }`}
                      >
                        <ChevronDown size={20} />
                      </div>
                    </button>
                    {expandedProdId === p.id && (
                      <div className="bg-gray-50 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100 animate-in slide-in-from-top-4">
                        {p.variants.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleAddItem(p, v)}
                            className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-transparent hover:border-secondary hover:shadow-xl transition group text-left"
                          >
                            <div>
                              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                {v.color} / {v.size}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                SKU: {v.sku}
                              </p>
                            </div>
                            <div className="w-8 h-8 bg-blue-50 text-secondary rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100">
                              <Plus size={16} strokeWidth={3} />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <Search size={40} />
                  </div>
                  <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">
                    Không tìm thấy sản phẩm phù hợp
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                Hệ thống quản trị kho hàng SportHub Pro v3.5
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
