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
  FileSpreadsheet,
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
import { uploadImage, replaceImage, deleteImage } from "../../lib/storage";
import { ProductFormTabs } from "./ProductFormTabs"; // ✅ NEW: Import new component
import { BulkImportWizard } from "./BulkImportWizard"; // ✅ Bulk Import

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
  const [showModal, setShowModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
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
    setShowModal(true);
  };

  const handleCreate = () => {
    setActiveProduct(null);
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!currentUser) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?\n\n` +
        `Lưu ý: Không thể xóa nếu sản phẩm đã có đơn hàng.`
    );

    if (!confirmed) return;

    try {
      await api.products.delete(productId, currentUser);
      await refetchProducts();
      alert("Xóa sản phẩm thành công!");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkImport(true)}
              className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3 active:scale-95 transition hover:shadow-2xl"
            >
              <FileSpreadsheet size={18} /> Import Excel
            </button>
            <button
              onClick={handleCreate}
              className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3 active:scale-95 transition"
            >
              <Plus size={18} /> Thêm sản phẩm mới
            </button>
          </div>
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
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 rounded-xl shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fullscreen Product Form Modal */}
        {showModal && (
          <ProductFormModal
            product={activeProduct}
            categories={categories}
            brands={brands}
            allAttributes={attributes}
            sizeGuides={sizeGuides}
            onClose={() => {
              setShowModal(false);
              setActiveProduct(null); // Clear active product
              refetchProducts(); // Refetch to get fresh data
            }}
            onSave={(updatedProduct: Product) => {
              // ✅ Update activeProduct with fresh data from save
              setActiveProduct(updatedProduct);
              refetchProducts();
            }}
          />
        )}

        {/* Bulk Import Wizard */}
        {showBulkImport && (
          <BulkImportWizard
            categories={categories}
            brands={brands}
            onClose={() => setShowBulkImport(false)}
            onSuccess={() => {
              refetchProducts();
            }}
          />
        )}
      </div>
    </>
  );
};

const ProductFormModal = ({
  product,
  categories,
  brands,
  allAttributes,
  sizeGuides,
  onClose,
  onSave,
}: {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  allAttributes: ProductAttribute[];
  sizeGuides: SizeGuide[];
  onClose: () => void;
  onSave: (product?: Product) => void;
}) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "variants">("info");
  const [loading, setLoading] = useState(false);
  const [savedProduct, setSavedProduct] = useState<Product | null>(product);
  const [variants, setVariants] = useState<any[]>(product?.variants || []);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Track newly uploaded images in this session (for cleanup if cancel)
  const [sessionUploadedImages, setSessionUploadedImages] = useState<string[]>(
    []
  );
  const [hasSaved, setHasSaved] = useState(false);

  const handleClose = async () => {
    if (loading) return;
    const confirmed = window.confirm(
      "Đóng form? Thông tin chưa lưu sẽ bị mất."
    );
    if (confirmed) {
      // Clean up uploaded images if not saved
      if (!hasSaved && sessionUploadedImages.length > 0) {
        console.log(
          "🗑️ Cleaning up unsaved images:",
          sessionUploadedImages.length
        );
        for (const imageUrl of sessionUploadedImages) {
          try {
            await deleteImage(imageUrl);
          } catch (e) {
            console.warn("Failed to delete orphan image:", imageUrl);
          }
        }
      }
      onClose();
    }
  };

  const [formData, setFormData] = useState({
    name: product?.name || "",
    productCode: product?.productCode || "",
    categoryId: product?.categoryId || "",
    brandId: product?.brandId || "",
    description: product?.description || "",
    basePrice: product?.basePrice || "",
    promotionalPrice: product?.promotionalPrice || "",
    thumbnailUrl: product?.thumbnailUrl || "",
    imageUrls: product?.imageUrls || [], // ✅ Multiple images support
    status: product?.status || ProductStatus.ACTIVE,
    attributes: product?.attributes || {},
    freeShipping: product?.freeShipping || false,
    allowReturn: product?.allowReturn ?? true,
    returnPeriod: product?.returnPeriod || 7,
    sizeGuideId: product?.sizeGuideId || "",
    condition: product?.condition || "Mới 100% Full Box",
  });

  // ✅ FIX: Sync formData when product prop changes (after update)
  useEffect(() => {
    if (product) {
      console.log("🔄 Syncing formData with updated product:", {
        productId: product.id,
        imageUrls: product.imageUrls,
        imageUrlsLength: product.imageUrls?.length,
      });
      setFormData({
        name: product.name || "",
        productCode: product.productCode || "",
        categoryId: product.categoryId || "",
        brandId: product.brandId || "",
        description: product.description || "",
        basePrice: product.basePrice || "",
        promotionalPrice: product.promotionalPrice || "",
        thumbnailUrl: product.thumbnailUrl || "",
        imageUrls: product.imageUrls || [], // ✅ Sync imageUrls from updated product
        status: product.status || ProductStatus.ACTIVE,
        attributes: product.attributes || {},
        freeShipping: product.freeShipping || false,
        allowReturn: product.allowReturn ?? true,
        returnPeriod: product.returnPeriod || 7,
        sizeGuideId: product.sizeGuideId || "",
        condition: product.condition || "Mới 100% Full Box",
      });
    }
  }, [product]);

  const [infoTab, setInfoTab] = useState<
    "basic" | "media" | "specs" | "policies"
  >("basic"); // ✅ Sub-tabs for better UX

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

  const specificationAttributes = useMemo(() => {
    return categoryAttributes.filter(
      (a: ProductAttribute) => a.type === "specification"
    );
  }, [categoryAttributes]);

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("⚠️ Chỉ chấp nhận file ảnh (JPG, PNG, WebP, ...)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ Kích thước file quá lớn (tối đa 5MB)");
      return;
    }

    setLoading(true);
    try {
      console.log("📷 [PRODUCT] Uploading main image...");

      let imageUrl: string;
      const oldThumbnail = formData.thumbnailUrl;

      // If updating existing product with old image, replace it
      if (savedProduct && formData.thumbnailUrl) {
        imageUrl = await replaceImage(formData.thumbnailUrl, file, "products");
      } else {
        // New upload - track for cleanup if cancel
        const result = await uploadImage(file, "products");
        imageUrl = result.url;
        setSessionUploadedImages((prev) => [...prev, imageUrl]);

        // If there was an unsaved previous image, remove from tracking and delete
        if (oldThumbnail && sessionUploadedImages.includes(oldThumbnail)) {
          setSessionUploadedImages((prev) =>
            prev.filter((url) => url !== oldThumbnail)
          );
          await deleteImage(oldThumbnail);
        }
      }

      setFormData({ ...formData, thumbnailUrl: imageUrl });
      console.log("✅ [PRODUCT] Image uploaded:", imageUrl);
    } catch (error: any) {
      console.error("❌ [PRODUCT] Upload error:", error);
      alert("❌ Lỗi upload ảnh: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle multiple gallery images upload
  const handleGalleryImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate total images (max 8 including thumbnail)
    const currentImages = formData.imageUrls || [];
    if (currentImages.length + files.length > 8) {
      alert(
        `⚠️ Tối đa 8 ảnh. Hiện có ${
          currentImages.length
        } ảnh, chỉ có thể thêm ${8 - currentImages.length} ảnh nữa.`
      );
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          console.warn("Skip non-image file:", file.name);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          console.warn("Skip oversized file:", file.name);
          continue;
        }

        const result = await uploadImage(file, "products");
        uploadedUrls.push(result.url);
      }

      // Track new uploads for cleanup if cancel
      setSessionUploadedImages((prev) => [...prev, ...uploadedUrls]);

      setFormData({
        ...formData,
        imageUrls: [...currentImages, ...uploadedUrls],
      });

      console.log(`✅ Uploaded ${uploadedUrls.length} images`);
    } catch (error: any) {
      console.error("❌ Gallery upload error:", error);
      alert("❌ Lỗi upload ảnh: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Remove gallery image
  const handleRemoveGalleryImage = async (index: number) => {
    const imageToRemove = formData.imageUrls?.[index];
    const newImages = [...(formData.imageUrls || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, imageUrls: newImages });

    // If this was a newly uploaded image, remove from tracking and delete immediately
    if (imageToRemove && sessionUploadedImages.includes(imageToRemove)) {
      setSessionUploadedImages((prev) =>
        prev.filter((url) => url !== imageToRemove)
      );
      await deleteImage(imageToRemove);
    }
  };

  // ✅ NEW: Save everything (product + variants) for editing mode
  const handleSaveEverything = async () => {
    if (!currentUser || !savedProduct) return;

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
      await api.products.update(savedProduct.id, formData, currentUser);
      await api.products.saveVariants(savedProduct.id, variants, currentUser);
      alert("✅ Đã lưu toàn bộ sản phẩm và danh sách biến thể!");
      onClose();
    } catch (err: any) {
      console.error("❌ [SAVE ERROR]", err);
      alert(`❌ Lỗi lưu dữ liệu:\n${err.message}`);
    } finally {
      setLoading(false);
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
      // ✅ DEBUG: Check if imageUrls is being sent
      console.log("🔍 FormData before save:", {
        imageUrls: formData.imageUrls,
        imageUrlsLength: formData.imageUrls?.length,
        thumbnailUrl: formData.thumbnailUrl,
      });

      let res;
      if (savedProduct) {
        res = await api.products.update(savedProduct.id, formData, currentUser);
        // ✅ FIX: Preserve existing variants after update
        res.variants = savedProduct.variants || [];
      } else {
        // ✅ FIX: Clean sizeGuideId before sending to API
        const cleanedData = {
          ...formData,
          sizeGuideId:
            formData.sizeGuideId && formData.sizeGuideId.trim() !== ""
              ? formData.sizeGuideId
              : null,
        };
        res = await api.products.create(cleanedData, currentUser);
      }
      console.log("✅ Save successful, updated product:", {
        id: res.id,
        imageUrls: res.imageUrls,
        imageUrlsLength: res.imageUrls?.length,
      });
      setSavedProduct(res);
      setHasSaved(true); // Mark as saved so images won't be cleaned up on close
      setSessionUploadedImages([]); // Clear tracking since saved successfully
      // ✅ FIX: Notify parent of updated product
      if (onSave) {
        onSave(res);
      }
      alert("Lưu thông tin sản phẩm thành công!");
      // ✅ FIX: Only auto-switch to variants tab when creating NEW product
      if (!savedProduct) {
        setActiveTab("variants");
      }
    } catch (err: any) {
      console.error("Save product error:", err);
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <Package size={24} className="text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                {savedProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {formData.name || "Đang nhập liệu..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-50"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 px-8 bg-white">
          <div className="flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all relative ${
                activeTab === "info"
                  ? "text-secondary border-b-2 border-secondary bg-blue-50/30"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={16} /> Thông tin chung
              </div>
            </button>
            <button
              onClick={() => {
                if (!savedProduct) {
                  alert(
                    "Vui lòng lưu Thông tin chung trước khi quản lý biến thể."
                  );
                  return;
                }
                setActiveTab("variants");
              }}
              className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all relative ${
                activeTab === "variants"
                  ? "text-secondary border-b-2 border-secondary bg-blue-50/30"
                  : "text-gray-400 hover:text-gray-600"
              } ${!savedProduct ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid size={16} /> Quản lý biến thể
                {!savedProduct && <Lock size={12} className="ml-2" />}
              </div>
            </button>
          </div>

          {/* ✅ Submit button aligned with tabs - Show on both tabs when editing */}
          <button
            onClick={savedProduct ? handleSaveEverything : handleSaveParent}
            disabled={loading}
            className="px-10 py-3.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 hover:from-black hover:to-slate-900 transition active:scale-95 text-xs disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <>
                <Save size={16} />
                {savedProduct ? "CẬP NHẬT" : "LƯU"}
              </>
            )}
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {activeTab === "info" ? (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* ✅ NEW: Use ProductFormTabs component */}
              <ProductFormTabs
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                brands={brands}
                sizeGuides={sizeGuides}
                specificationAttributes={specificationAttributes}
                mainFileInputRef={mainFileInputRef}
                galleryFileInputRef={galleryFileInputRef}
                handleMainImageUpload={handleMainImageUpload}
                handleGalleryImagesUpload={handleGalleryImagesUpload}
                handleRemoveGalleryImage={handleRemoveGalleryImage}
                loading={loading}
              />
            </div>
          ) : (
            <VariantManager
              product={savedProduct!}
              attributes={variantAttributes}
              parentFormData={formData}
              variants={variants}
              setVariants={setVariants}
              onSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const VariantManager = ({
  product,
  attributes,
  parentFormData,
  variants: externalVariants,
  setVariants: setExternalVariants,
  onSuccess,
}: {
  product: Product;
  attributes: ProductAttribute[];
  parentFormData: any;
  variants: any[];
  setVariants: (variants: any[]) => void;
  onSuccess: () => void;
}) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [chosenValues, setChosenValues] = useState<Record<string, string[]>>(
    {}
  );
  // ✅ Use external variants state from parent
  const variants = externalVariants;
  const setVariants = setExternalVariants;
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
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("⚠️ Chỉ chấp nhận file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ Kích thước file quá lớn (tối đa 5MB)");
      return;
    }

    setLoading(true);
    try {
      console.log(`📷 [VARIANT] Uploading image for variant ${index}...`);

      const result = await uploadImage(file, "variants");
      const imageUrl = result.url;

      const newV = [...variants];
      newV[index].imageUrl = imageUrl;
      setVariants(newV);

      console.log("✅ [VARIANT] Image uploaded:", imageUrl);
    } catch (error: any) {
      console.error("❌ [VARIANT] Upload error:", error);
      alert("❌ Lỗi upload ảnh: " + error.message);
    } finally {
      setLoading(false);
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
            <Wand2 size={16} /> Tạo SKU
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
                      min="0"
                      className="w-20 bg-white border border-gray-200 rounded-xl p-2.5 text-center font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10 shadow-sm text-slate-900"
                      value={v.stockQuantity}
                      onChange={(e) => {
                        const newV = [...variants];
                        const value = parseInt(e.target.value);
                        newV[i].stockQuantity = value >= 0 ? value : 0;
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
