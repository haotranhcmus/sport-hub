// ✅ NOTION-STYLE: Product Form with Mini Sidebar Navigation
import React, { useRef, useEffect } from "react";
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
  const [activeSection, setActiveSection] = React.useState("basic");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const basicRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const policiesRef = useRef<HTMLDivElement>(null);

  // Track scroll position and update active section
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const threshold = containerTop + 100; // 100px from top of container

      const sections = [
        { id: "basic", ref: basicRef },
        { id: "media", ref: mediaRef },
        { id: "specs", ref: specsRef },
        { id: "policies", ref: policiesRef },
      ];

      // Find the section that is currently in view (closest to top)
      let currentSection = "basic";
      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= threshold) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const refs = {
      basic: basicRef,
      media: mediaRef,
      specs: specsRef,
      policies: policiesRef,
    };
    const targetRef = refs[sectionId as keyof typeof refs];
    if (targetRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = targetRef.current;

      // Get the target's position relative to the container
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top;

      // Scroll with offset to keep title visible (add current scroll position)
      container.scrollTo({
        top: container.scrollTop + relativeTop - 20,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* 🎯 MINI SIDEBAR - Notion/Odoo Style */}
      <div className="w-56 flex-shrink-0">
        <div className="sticky top-0 space-y-1 bg-gray-50/50 rounded-2xl p-3">
          <button
            type="button"
            onClick={() => scrollToSection("basic")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-left ${
              activeSection === "basic"
                ? "bg-white text-secondary shadow-sm"
                : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
            }`}
          >
            <Package size={16} />
            <span>Cơ bản</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("media")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-left ${
              activeSection === "media"
                ? "bg-white text-secondary shadow-sm"
                : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
            }`}
          >
            <ImageIcon size={16} />
            <span>Hình ảnh</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("specs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-left ${
              activeSection === "specs"
                ? "bg-white text-secondary shadow-sm"
                : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
            }`}
          >
            <Settings2 size={16} />
            <span>Thông số</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("policies")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-left ${
              activeSection === "policies"
                ? "bg-white text-secondary shadow-sm"
                : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Chính sách</span>
          </button>
        </div>
      </div>

      {/* 📄 SCROLLABLE CONTENT - All sections visible */}
      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-8 overflow-y-auto pr-2 scroll-smooth"
        style={{ maxHeight: "calc(100vh - 280px)", scrollPaddingTop: "20px" }}
      >
        {/* SECTION 1: BASIC INFO */}
        <div
          ref={basicRef}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          style={{ scrollMarginTop: "20px" }}
        >
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Package size={20} className="text-secondary" />
            </div>
            Thông tin cơ bản
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {categories
                    .filter((c: any) => c.parentId !== null)
                    .map((c: any) => (
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
        </div>

        {/* SECTION 2: MEDIA / IMAGES */}
        <div
          ref={mediaRef}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          style={{ scrollMarginTop: "20px" }}
        >
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <ImageIcon size={20} className="text-secondary" />
            </div>
            Hình ảnh sản phẩm
            <span className="ml-auto text-xs font-bold text-gray-400">
              {(formData.imageUrls?.length || 0) +
                (formData.thumbnailUrl ? 1 : 0)}
              /9 ảnh
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        </div>

        {/* SECTION 3: SPECIFICATIONS */}
        <div
          ref={specsRef}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          style={{ scrollMarginTop: "20px" }}
        >
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Settings2 size={20} className="text-secondary" />
            </div>
            Thông số kỹ thuật
          </h3>
          <div className="space-y-8">
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
        </div>

        {/* SECTION 4: POLICIES */}
        <div
          ref={policiesRef}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          style={{ scrollMarginTop: "20px" }}
        >
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <ShieldCheck size={20} className="text-secondary" />
            </div>
            Chính sách & Ưu đãi
          </h3>
          <div className="space-y-8">
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
        </div>
      </div>
    </div>
  );
};
