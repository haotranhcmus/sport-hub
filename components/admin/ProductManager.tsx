import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Package,
  Save,
  ArrowLeft,
  ChevronRight,
  Layers,
  Settings2,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2,
  X,
  Info as InfoIcon,
  Boxes,
  Tag,
  ShieldCheck,
  Database,
  FileText,
  LayoutGrid,
  Lock,
  CheckSquare,
  Square,
  ChevronDown,
  Upload,
  Camera,
  Sparkles,
  Wand2,
  Truck,
  RotateCcw,
  Ruler,
} from "lucide-react";
import { api } from "../../services";
import {
  Product,
  Category,
  Brand,
  ProductAttribute,
  ProductStatus,
  ProductVariant,
  SizeGuide,
} from "../../types";
import { useAuth } from "../../context/AuthContext";
import { InputField } from "./SharedUI";
import { useProducts } from "../../hooks/useProductsQuery";
import {
  useCategories,
  useBrands,
  useAttributes,
  useSizeGuides,
} from "../../hooks/useInventoryQuery";

const handleFileRead = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ProductManager = () => {
  const { user: currentUser } = useAuth();
  const [view, setView] = useState<"list" | "form">("list");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Use TanStack Query for all data fetching
  const {
    data: products = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { data: attributes = [] } = useAttributes();
  const { data: sizeGuides = [] } = useSizeGuides();

  const loading = productsLoading;

  const handleEdit = (product: Product) => {
    setActiveProduct(product);
    setView("form");
  };

  const handleCreate = () => {
    setActiveProduct(null);
    setView("form");
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === "form") {
    return (
      <ProductForm
        product={activeProduct}
        categories={categories}
        brands={brands}
        allAttributes={attributes}
        sizeGuides={sizeGuides}
        onBack={() => {
          setView("list");
          refetchProducts();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in p-6 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Kho hàng & Sản phẩm
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Quản lý danh sách sản phẩm và biến thể SKU
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3 active:scale-95 transition"
        >
          <Plus size={18} /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
        <Search className="text-gray-300 ml-2" size={24} />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã sản phẩm..."
          className="flex-1 bg-transparent border-none outline-none font-black text-sm uppercase text-slate-900"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
            <tr>
              <th className="px-10 py-6">Sản phẩm</th>
              <th className="px-6 py-6">Phân loại</th>
              <th className="px-6 py-6 text-center">Biến thể</th>
              <th className="px-6 py-6 text-center">Trạng thái</th>
              <th className="px-10 py-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden p-1 flex items-center justify-center shrink-0">
                      <img
                        src={
                          p.thumbnailUrl ||
                          "https://via.placeholder.com/56?text=No+Image"
                        }
                        className="max-w-full max-h-full object-contain"
                        alt=""
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes("placeholder")) {
                            target.src =
                              "https://via.placeholder.com/56?text=No+Image";
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 uppercase text-sm line-clamp-1">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter">
                          Mã: {p.productCode}
                        </p>
                        {p.freeShipping && (
                          <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                            Freeship
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <p className="text-xs font-black text-gray-600 uppercase">
                    {categories.find((c) => c.id === p.categoryId)?.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                    {brands.find((b) => b.id === p.brandId)?.name}
                  </p>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="px-3 py-1 bg-blue-50 text-secondary rounded-lg text-[10px] font-black uppercase">
                    {p.variants?.length || 0} SKU
                  </span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.status === ProductStatus.ACTIVE
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-xl shadow-sm"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 rounded-xl shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductForm = ({
  product,
  categories,
  brands,
  allAttributes,
  sizeGuides,
  onBack,
}: any) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "variants">("info");
  const [loading, setLoading] = useState(false);
  const [savedProduct, setSavedProduct] = useState<Product | null>(product);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    productCode: product?.productCode || "",
    categoryId: product?.categoryId || "",
    brandId: product?.brandId || "",
    description: product?.description || "",
    basePrice: product?.basePrice || "",
    promotionalPrice: product?.promotionalPrice || "",
    thumbnailUrl: product?.thumbnailUrl || "",
    status: product?.status || ProductStatus.ACTIVE,
    attributes: product?.attributes || {},
    freeShipping: product?.freeShipping || false,
    allowReturn: product?.allowReturn ?? true,
    returnPeriod: product?.returnPeriod || 7,
    sizeGuideId: product?.sizeGuideId || "",
    condition: product?.condition || "Mới 100% Full Box",
  });

  const categoryAttributes = useMemo(() => {
    if (!formData.categoryId) return [];
    return allAttributes.filter(
      (a: ProductAttribute) =>
        !a.categoryIds ||
        a.categoryIds.length === 0 ||
        a.categoryIds.includes(formData.categoryId)
    );
  }, [formData.categoryId, allAttributes]);

  const variantAttributes = useMemo(() => {
    return categoryAttributes.filter(
      (a: ProductAttribute) => a.type === "variant"
    );
  }, [categoryAttributes]);

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileRead(file);
      setFormData({ ...formData, thumbnailUrl: base64 });
    }
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    if (!formData.name || !formData.productCode) {
      alert("Vui lòng nhập tên và mã sản phẩm!");
      return;
    }
    if (!formData.categoryId || !formData.brandId) {
      alert("Vui lòng chọn danh mục và thương hiệu!");
      return;
    }
    if (!formData.thumbnailUrl) {
      alert("Vui lòng tải ảnh đại diện sản phẩm!");
      return;
    }
    if (!formData.basePrice || formData.basePrice <= 0) {
      alert("Vui lòng nhập giá niêm yết hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (savedProduct) {
        res = await api.products.update(savedProduct.id, formData, currentUser);
      } else {
        res = await api.products.create(formData, currentUser);
      }
      setSavedProduct(res);
      alert("Lưu thông tin sản phẩm thành công!");
      setActiveTab("variants");
    } catch (err: any) {
      console.error("Save product error:", err);
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in slide-in-from-bottom-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
              {savedProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Sản phẩm: {formData.name || "Đang nhập liệu..."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-10 py-5 font-black text-xs uppercase tracking-widest transition-all relative ${
            activeTab === "info"
              ? "text-secondary border-b-2 border-secondary bg-blue-50/30"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText size={18} /> Thông tin chung
          </div>
        </button>
        <button
          onClick={() => {
            if (!savedProduct) {
              alert("Vui lòng lưu Thông tin chung trước khi quản lý biến thể.");
              return;
            }
            setActiveTab("variants");
          }}
          className={`px-10 py-5 font-black text-xs uppercase tracking-widest transition-all relative ${
            activeTab === "variants"
              ? "text-secondary border-b-2 border-secondary bg-blue-50/30"
              : "text-gray-400 hover:text-gray-600"
          } ${!savedProduct ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <div className="flex items-center gap-3">
            <LayoutGrid size={18} /> Quản lý biến thể
            {!savedProduct && <Lock size={12} className="ml-2" />}
          </div>
        </button>
      </div>

      <div className="mt-8">
        {activeTab === "info" ? (
          <form
            onSubmit={handleSaveParent}
            className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-6">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={14} className="text-secondary" /> Ảnh đại
                  diện sản phẩm
                </label>
                <div className="relative aspect-square w-full bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-secondary/40">
                  {formData.thumbnailUrl ? (
                    <>
                      <img
                        src={formData.thumbnailUrl}
                        className="w-full h-full object-contain p-4"
                        alt=""
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes("placeholder")) {
                            target.src =
                              "https://via.placeholder.com/400?text=No+Image";
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => mainFileInputRef.current?.click()}
                          className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition"
                        >
                          <Upload size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, thumbnailUrl: "" })
                          }
                          className="p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => mainFileInputRef.current?.click()}
                      className="text-center p-6 space-y-4 hover:scale-105 transition active:scale-95 group/btn"
                    >
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-secondary transition-transform duration-300 group-hover/btn:scale-110">
                        <Upload size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-800 uppercase">
                          Tải ảnh lên
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                          (.png, .jpg)
                        </p>
                      </div>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={mainFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                  />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField
                    label="Tên sản phẩm *"
                    value={formData.name}
                    onChange={(v: any) => setFormData({ ...formData, name: v })}
                    required
                  />
                  <InputField
                    label="Mã sản phẩm (Model) *"
                    value={formData.productCode}
                    onChange={(v: any) =>
                      setFormData({ ...formData, productCode: v })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Danh mục *
                    </label>
                    <select
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10 text-slate-900 cursor-pointer"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Thương hiệu *
                    </label>
                    <select
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10 text-slate-900 cursor-pointer"
                      value={formData.brandId}
                      onChange={(e) =>
                        setFormData({ ...formData, brandId: e.target.value })
                      }
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {brands.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <InputField
                    label="Giá niêm yết"
                    type="number"
                    suffix="VND"
                    value={formData.basePrice}
                    onChange={(v: any) =>
                      setFormData({ ...formData, basePrice: v })
                    }
                  />
                  <InputField
                    label="Giá KM"
                    type="number"
                    suffix="VND"
                    value={formData.promotionalPrice}
                    onChange={(v: any) =>
                      setFormData({ ...formData, promotionalPrice: v })
                    }
                  />
                  <InputField
                    label="Tình trạng *"
                    value={formData.condition}
                    onChange={(v: any) =>
                      setFormData({ ...formData, condition: v })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Bảng size riêng
                    </label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black text-xs outline-none focus:ring-2 focus:ring-secondary/10 text-slate-900 cursor-pointer"
                      value={formData.sizeGuideId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sizeGuideId: e.target.value,
                        })
                      }
                    >
                      <option value="">Sử dụng của Danh mục</option>
                      {sizeGuides.map((sg: SizeGuide) => (
                        <option key={sg.id} value={sg.id}>
                          {sg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Giao hàng miễn phí
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          freeShipping: !formData.freeShipping,
                        })
                      }
                      className={`h-14 flex items-center justify-center gap-3 rounded-2xl border-2 transition font-black text-xs uppercase ${
                        formData.freeShipping
                          ? "bg-blue-50 border-secondary text-secondary"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                      }`}
                    >
                      <Truck size={18} />{" "}
                      {formData.freeShipping ? "Đã kích hoạt" : "Không áp dụng"}
                    </button>
                  </div>
                </div>

                {/* CHÍNH SÁCH ĐỔI TRẢ HIỆN ĐẠI */}
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200 space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          formData.allowReturn
                            ? "bg-green-500 text-white shadow-lg"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <RotateCcw size={24} />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">
                          Chính sách đổi trả
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Áp dụng cho khách hàng khi mua sản phẩm này
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          allowReturn: !formData.allowReturn,
                        })
                      }
                      className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        formData.allowReturn
                          ? "bg-secondary text-white shadow-xl"
                          : "bg-white border border-gray-200 text-gray-400"
                      }`}
                    >
                      {formData.allowReturn ? "ĐANG BẬT" : "ĐANG TẮT"}
                    </button>
                  </div>

                  {formData.allowReturn && (
                    <div className="animate-in slide-in-from-top-4 pt-4 border-t border-slate-200">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Thời hạn hỗ trợ đổi trả *
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[7, 14, 30].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, returnPeriod: days })
                            }
                            className={`py-4 rounded-2xl font-black text-xs transition-all border-2 ${
                              formData.returnPeriod === days
                                ? "bg-white border-secondary text-secondary shadow-lg scale-105"
                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                            }`}
                          >
                            {days} NGÀY
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-[9px] font-bold text-slate-400 italic uppercase flex items-center gap-2">
                        <InfoIcon size={12} /> Khách hàng được đổi mẫu/size
                        trong vòng {formData.returnPeriod} ngày kể từ ngày nhận
                        hàng.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <InfoIcon size={14} className="text-secondary" /> Thông số & Đặc
                tính kỹ thuật
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryAttributes
                  .filter((a) => a.type === "info")
                  .map((attr) => (
                    <div key={attr.id} className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {attr.name}
                      </label>
                      {attr.values.length > 0 ? (
                        <select
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-secondary/10"
                          value={(formData.attributes as any)[attr.code] || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              attributes: {
                                ...formData.attributes,
                                [attr.code]: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="">-- Chọn {attr.name} --</option>
                          {attr.values.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-secondary/10"
                          value={(formData.attributes as any)[attr.code] || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              attributes: {
                                ...formData.attributes,
                                [attr.code]: e.target.value,
                              },
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-secondary" /> Mô tả nội dung
                sản phẩm
              </label>
              <textarea
                className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-8 font-medium text-sm outline-none min-h-[240px] text-slate-900 focus:ring-2 focus:ring-secondary/10 transition leading-relaxed"
                placeholder="Mô tả công nghệ, trải nghiệm người dùng, chất liệu chi tiết..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="pt-8 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-20 py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-4 hover:bg-black transition active:scale-95 text-xs"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} />{" "}
                    {savedProduct
                      ? "CẬP NHẬT THÔNG TIN"
                      : "TIẾP TỤC & TẠO BIẾN THỂ"}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <VariantManager
            product={savedProduct!}
            attributes={variantAttributes}
            parentFormData={formData}
            onSuccess={onBack}
          />
        )}
      </div>
    </div>
  );
};

const VariantManager = ({
  product,
  attributes,
  parentFormData,
  onSuccess,
}: {
  product: Product;
  attributes: ProductAttribute[];
  parentFormData: any;
  onSuccess: () => void;
}) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [chosenValues, setChosenValues] = useState<Record<string, string[]>>(
    {}
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    product.variants || []
  );
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeSelectorAttr, setActiveSelectorAttr] =
    useState<ProductAttribute | null>(null);
  const skuFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggleValueSelection = (attrId: string, value: string) => {
    setChosenValues((prev) => {
      const current = prev[attrId] || [];
      return {
        ...prev,
        [attrId]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleGenerate = () => {
    const attributeIds = Object.keys(chosenValues).filter(
      (id) => (chosenValues[id] || []).length > 0
    );
    if (attributeIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 giá trị.");
      return;
    }

    const valuesToCombine = attributeIds.map((id) => chosenValues[id]);
    const cartesian = (...args: any[]) =>
      args.reduce((a, b) =>
        a.flatMap((d: any) => b.map((e: any) => [d, e].flat()))
      );
    const combinations =
      valuesToCombine.length > 1
        ? cartesian(...valuesToCombine)
        : valuesToCombine[0].map((v) => [v]);

    // Check for duplicate variants before creating
    const existingVariants = new Set(
      variants.map((v) => `${v.color.toLowerCase()}-${v.size.toLowerCase()}`)
    );

    const duplicates: string[] = [];
    const validCombinations = combinations.filter((combo: any) => {
      const color = Array.isArray(combo) ? combo[0] : combo;
      const size = Array.isArray(combo) ? combo[1] || "Free" : "Free";
      const key = `${color.toLowerCase()}-${size.toLowerCase()}`;

      if (existingVariants.has(key)) {
        duplicates.push(`${color} - ${size}`);
        return false;
      }
      return true;
    });

    if (duplicates.length > 0) {
      alert(
        `Các biến thể sau đã tồn tại:\n${duplicates.join(
          "\n"
        )}\n\nChỉ tạo các biến thể chưa tồn tại.`
      );
      if (validCombinations.length === 0) {
        return;
      }
    }

    const newVariants: ProductVariant[] = validCombinations.map(
      (combo: any, index: number) => {
        const color = Array.isArray(combo) ? combo[0] : combo;
        const size = Array.isArray(combo) ? combo[1] || "Free" : "Free";

        // Generate unique SKU with index to prevent duplicates
        const colorCode = color
          .replace(/\s+/g, "")
          .slice(0, 5)
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // Remove Vietnamese accents
        const sizeCode = size.toUpperCase().replace(/\s+/g, "");
        const uniqueSuffix = (variants.length + index)
          .toString()
          .padStart(3, "0");

        return {
          id: `v-${Date.now()}-${index}`,
          productId: product.id,
          sku: `${product.productCode}-${colorCode}-${sizeCode}-${uniqueSuffix}`,
          color: color,
          size: size,
          stockQuantity: 0,
          priceAdjustment: 0,
          imageUrl: product.thumbnailUrl,
          status: "active",
        };
      }
    );

    setVariants([...variants, ...newVariants]);
    setShowGenerateModal(false);
  };

  const handleSkuImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileRead(file);
      const newV = [...variants];
      newV[index].imageUrl = base64;
      setVariants(newV);
    }
  };

  const handleSaveEverything = async () => {
    if (!currentUser) return;

    // Validate SKU uniqueness
    const skus = variants.map((v) => v.sku);
    const duplicates = skus.filter((sku, idx) => skus.indexOf(sku) !== idx);
    if (duplicates.length > 0) {
      alert(
        `SKU bị trùng lặp:\n${[...new Set(duplicates)].join(
          "\n"
        )}\n\nVui lòng chỉnh sửa SKU để đảm bảo tính duy nhất.`
      );
      return;
    }

    setLoading(true);
    try {
      await api.products.update(product.id, parentFormData, currentUser);
      await api.products.saveVariants(product.id, variants, currentUser);
      alert("✅ Đã lưu toàn bộ sản phẩm và danh sách biến thể!");
      onSuccess();
    } catch (err: any) {
      console.error("❌ [SAVE ERROR]", err);
      alert(`❌ Lỗi lưu dữ liệu:\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <Database size={18} className="text-secondary" /> BẢNG CẤU HÌNH SKU
            BIẾN THỂ
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
            Thiết lập tồn kho và giá cho từng phân loại
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-black transition active:scale-95 flex items-center gap-3"
          >
            <Wand2 size={16} /> Tự động sinh SKU
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-10 py-5">Phân loại</th>
                <th className="px-6 py-5">Ảnh đại diện</th>
                <th className="px-6 py-5">Mã SKU</th>
                <th className="px-6 py-5 text-center">Tồn thực tế</th>
                <th className="px-6 py-5 text-right">Chênh lệch giá (+)</th>
                <th className="px-6 py-5 text-center">Trạng thái</th>
                <th className="px-10 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variants.map((v, i) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-10 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">
                          Màu:
                        </span>
                        <div className="text-[10px] font-black text-gray-800 uppercase bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full cursor-not-allowed">
                          {v.color}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">
                          Size:
                        </span>
                        <div className="text-[9px] font-bold text-gray-500 uppercase bg-gray-50 border border-gray-200 rounded px-2 py-1 w-20 cursor-not-allowed">
                          {v.size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 group">
                      <button
                        onClick={() => skuFileInputRefs.current[v.id]?.click()}
                        className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 hover:border-secondary transition shadow-sm"
                      >
                        <img
                          src={
                            v.imageUrl ||
                            product.thumbnailUrl ||
                            "https://via.placeholder.com/56?text=No+Image"
                          }
                          className="w-full h-full object-contain"
                          alt=""
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes("placeholder")) {
                              target.src =
                                "https://via.placeholder.com/56?text=No+Image";
                            }
                          }}
                        />
                      </button>
                      <input
                        type="file"
                        ref={(el) => {
                          skuFileInputRefs.current[v.id] = el;
                        }}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleSkuImageUpload(i, e)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-100 font-mono text-[11px] font-black text-secondary outline-none focus:ring-1 focus:ring-secondary/20 rounded-lg px-3 py-2 w-full uppercase"
                      value={v.sku}
                      onChange={(e) => {
                        const newV = [...variants];
                        newV[i].sku = e.target.value.toUpperCase();
                        setVariants(newV);
                      }}
                    />
                  </td>
                  <td className="px-6 py-5 text-center">
                    <input
                      type="number"
                      className="w-20 bg-white border border-gray-200 rounded-xl p-2.5 text-center font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10 shadow-sm text-slate-900"
                      value={v.stockQuantity}
                      onChange={(e) => {
                        const newV = [...variants];
                        newV[i].stockQuantity = parseInt(e.target.value) || 0;
                        setVariants(newV);
                      }}
                    />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        className="w-28 bg-white border border-gray-200 rounded-xl p-2.5 text-right font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10 shadow-sm text-slate-900"
                        value={v.priceAdjustment}
                        onChange={(e) => {
                          const newV = [...variants];
                          newV[i].priceAdjustment =
                            parseInt(e.target.value) || 0;
                          setVariants(newV);
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => {
                        const newV = [...variants];
                        newV[i].status =
                          v.status === "active" ? "archived" : "active";
                        setVariants(newV);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition ${
                        v.status === "active"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      {v.status === "active" ? "Active" : "Closed"}
                    </button>
                  </td>
                  <td className="px-10 py-5 text-right">
                    <button
                      onClick={async () => {
                        // Check if variant is existing (has UUID)
                        const isExisting = v.id && v.id.length > 10;

                        if (isExisting) {
                          // Confirm delete for existing variants
                          if (
                            !confirm(
                              `Xóa variant "${v.sku}"?\n\nLưu ý: Nếu variant đã có trong đơn hàng, hệ thống sẽ từ chối xóa.`
                            )
                          ) {
                            return;
                          }

                          try {
                            await api.products.deleteVariant(v.id, currentUser);
                            alert("Đã xóa variant thành công!");
                            // Remove from state
                            setVariants(variants.filter((_, idx) => idx !== i));
                          } catch (err: any) {
                            alert(err.message || "Lỗi khi xóa variant.");
                          }
                        } else {
                          // New variant - just remove from state
                          setVariants(variants.filter((_, idx) => idx !== i));
                        }
                      }}
                      className="p-2 text-gray-200 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-4xl px-4">
        <div className="flex justify-between items-center gap-6 p-6 bg-slate-900 rounded-[32px] shadow-2xl border border-white/10 backdrop-blur-md">
          <div className="hidden md:flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase">
                Lưu toàn bộ thay đổi
              </p>
              <p className="text-[9px] text-gray-400 font-bold uppercase">
                {variants.length} SKU biến thể hiện hữu
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveEverything}
            disabled={loading}
            className="flex-1 md:flex-none px-12 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition"
          >
            {loading ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={18} /> HOÀN TẤT & LƯU CƠ SỞ DỮ LIỆU
              </>
            )}
          </button>
        </div>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Sparkles className="text-secondary" /> Trình tạo biến thể tự
                  động
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Hệ thống sẽ tự động tổ hợp các giá trị thuộc tính bên dưới
                </p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition"
              >
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {attributes.length > 0 ? (
                  attributes.map((attr) => {
                    const selectedCount = (chosenValues[attr.id] || []).length;
                    return (
                      <div
                        key={attr.id}
                        className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                              {attr.name}
                            </p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">
                              CODE: {attr.code}
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveSelectorAttr(attr)}
                            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-secondary hover:bg-blue-50 transition active:scale-90"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                          {selectedCount > 0 ? (
                            chosenValues[attr.id].map((val) => (
                              <span
                                key={val}
                                className="px-3 py-1.5 bg-white text-[9px] font-black uppercase text-secondary border border-blue-100 rounded-lg shadow-sm flex items-center gap-2"
                              >
                                {val}
                                <button
                                  onClick={() =>
                                    toggleValueSelection(attr.id, val)
                                  }
                                  className="text-gray-300 hover:text-red-500"
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))
                          ) : (
                            <div className="w-full h-10 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                              <span className="text-[9px] font-bold text-gray-300 italic uppercase tracking-widest">
                                Chưa chọn giá trị
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-20 text-center bg-orange-50 border-2 border-dashed border-orange-100 rounded-[40px]">
                    <AlertCircle
                      className="mx-auto text-orange-300 mb-4"
                      size={40}
                    />
                    <p className="text-sm font-black text-orange-800 uppercase">
                      Danh mục chưa cấu hình thuộc tính sinh biến thể
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => setChosenValues({})}
                className="px-8 py-4 font-black text-gray-400 text-xs uppercase tracking-widest hover:text-red-500 transition"
              >
                Reset
              </button>
              <button
                onClick={handleGenerate}
                disabled={attributes.length === 0}
                className="flex-1 py-5 bg-secondary text-white rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:bg-blue-600 transition disabled:opacity-50"
              >
                <Wand2 size={20} /> SINH DANH SÁCH BIẾN THỂ
              </button>
            </div>
          </div>

          {activeSelectorAttr && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
              <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight">
                      {activeSelectorAttr.name}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Chọn các giá trị muốn tham gia tổ hợp
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSelectorAttr(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-8 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {activeSelectorAttr.values.map((val) => {
                    const isSelected = (
                      chosenValues[activeSelectorAttr.id] || []
                    ).includes(val);
                    return (
                      <button
                        key={val}
                        onClick={() =>
                          toggleValueSelection(activeSelectorAttr.id, val)
                        }
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                          isSelected
                            ? "border-secondary bg-blue-50 text-secondary"
                            : "border-gray-50 hover:bg-gray-50 text-gray-400"
                        }`}
                      >
                        <span className="text-xs font-black uppercase">
                          {val}
                        </span>
                        {isSelected ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => setActiveSelectorAttr(null)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl"
                  >
                    XÁC NHẬN
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
