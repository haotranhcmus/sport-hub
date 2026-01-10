// ✅ IMPROVED: Product Form với Sub-tabs để giảm scrolling
import React from "react";
import {
  Package,
  Image as ImageIcon,
  Settings2,
  ShieldCheck,
  Upload,
  X,
  Truck,
  RotateCcw,
  InfoIcon,
} from "lucide-react";
import { InputField } from "./SharedUI";
import { Category, Brand, ProductAttribute, SizeGuide } from "../../types";

interface ProductFormTabsProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: Category[];
  brands: Brand[];
  sizeGuides: SizeGuide[];
  specificationAttributes: ProductAttribute[];
  mainFileInputRef: React.RefObject<HTMLInputElement>;
  galleryFileInputRef: React.RefObject<HTMLInputElement>;
  handleMainImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGalleryImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveGalleryImage: (index: number) => void;
  loading: boolean;
}

export const ProductFormTabs: React.FC<ProductFormTabsProps> = ({
  formData,
  setFormData,
  categories,
  brands,
  sizeGuides,
  specificationAttributes,
  mainFileInputRef,
  galleryFileInputRef,
  handleMainImageUpload,
  handleGalleryImagesUpload,
  handleRemoveGalleryImage,
  loading,
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<
    "basic" | "media" | "specs" | "policies"
  >("basic");

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("basic")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === "basic"
              ? "bg-white text-secondary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package size={16} />
          Thông tin cơ bản
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("media")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === "media"
              ? "bg-white text-secondary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ImageIcon size={16} />
          Hình ảnh (
          {(formData.imageUrls?.length || 0) + (formData.thumbnailUrl ? 1 : 0)}
          /9)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("specs")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === "specs"
              ? "bg-white text-secondary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Settings2 size={16} />
          Thông số kỹ thuật
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("policies")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === "policies"
              ? "bg-white text-secondary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShieldCheck size={16} />
          Chính sách
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl">
        {/* BASIC INFO */}
        {activeSubTab === "basic" && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 2-COLUMN LAYOUT */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Giá niêm yết *"
                type="number"
                suffix="VND"
                value={formData.basePrice}
                onChange={(v: any) =>
                  setFormData({ ...formData, basePrice: v })
                }
                required
              />
              <InputField
                label="Giá khuyến mãi"
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

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Mô tả sản phẩm
              </label>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-medium text-sm outline-none focus:ring-2 focus:ring-secondary/10 text-slate-900 min-h-[100px] max-h-[140px] resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>
          </div>
        )}

        {/* MEDIA / IMAGES */}
        {activeSubTab === "media" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in-50 duration-300">
            {/* LEFT: Thumbnail */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon size={14} className="text-secondary" />
                Ảnh đại diện chính *
              </label>
              <div className="relative aspect-square w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-secondary/40">
                {formData.thumbnailUrl ? (
                  <>
                    <img
                      src={formData.thumbnailUrl}
                      className="w-full h-full object-contain p-4"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
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
                    className="text-center p-6 space-y-4 hover:scale-105 transition"
                  >
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-secondary">
                      <Upload size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-800 uppercase">
                        Tải ảnh chính
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">
                        (.png, .jpg, max 5MB)
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

            {/* RIGHT: Gallery Images */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon size={14} className="text-secondary" />
                Thư viện ảnh sản phẩm (Tối đa 8 ảnh)
              </label>

              <div className="grid grid-cols-3 gap-3">
                {/* Existing Images */}
                {(formData.imageUrls || []).map(
                  (url: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden group"
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        alt={`Gallery ${index + 1}`}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="p-2 bg-red-500 text-white rounded-xl shadow-xl hover:scale-110 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Upload Button */}
                {(formData.imageUrls?.length || 0) < 8 && (
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-secondary/50 transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <Upload
                      size={24}
                      className="text-gray-400 group-hover:text-secondary transition"
                    />
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      Thêm ảnh
                    </span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={galleryFileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesUpload}
              />

              <p className="mt-4 text-[9px] text-gray-400 font-bold uppercase flex items-center gap-2">
                <InfoIcon size={12} />
                Khách hàng sẽ xem được{" "}
                {(formData.imageUrls?.length || 0) +
                  (formData.thumbnailUrl ? 1 : 0)}{" "}
                ảnh trong trang chi tiết sản phẩm
              </p>
            </div>
          </div>
        )}

        {/* SPECIFICATIONS */}
        {activeSubTab === "specs" && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
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

            {specificationAttributes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specificationAttributes.map((attr) => (
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
            )}
          </div>
        )}

        {/* POLICIES */}
        {activeSubTab === "policies" && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* Free Shipping */}
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      formData.freeShipping
                        ? "bg-secondary text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase">
                      Giao hàng miễn phí
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">
                      Miễn phí ship cho đơn hàng chứa sản phẩm này
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      freeShipping: !formData.freeShipping,
                    })
                  }
                  className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    formData.freeShipping
                      ? "bg-secondary text-white shadow-lg"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}
                >
                  {formData.freeShipping ? "BẬT" : "TẮT"}
                </button>
              </div>
            </div>

            {/* Return Policy */}
            <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      formData.allowReturn
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase">
                      Chính sách đổi trả
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">
                      Cho phép khách hàng đổi size/màu
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
                  className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    formData.allowReturn
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}
                >
                  {formData.allowReturn ? "BẬT" : "TẮT"}
                </button>
              </div>

              {formData.allowReturn && (
                <div className="animate-in slide-in-from-top-4 pt-4 border-t border-green-200">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Thời hạn đổi trả
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, returnPeriod: days })
                        }
                        className={`py-4 rounded-xl font-black text-xs transition-all border-2 ${
                          formData.returnPeriod === days
                            ? "bg-white border-green-500 text-green-600 shadow-lg scale-105"
                            : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {days} NGÀY
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
