import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Boxes,
  Trophy,
  Edit3,
  Trash2,
  X,
  Save,
  RefreshCw,
  Settings2,
  Minus,
  CheckCircle2,
  Hash,
  Filter,
  ChevronRight,
  Layers,
  Upload,
  ImageIcon,
  Camera,
  LayoutTemplate,
  Info as InfoIcon,
  AlertTriangle,
  AlertOctagon,
  Ruler,
} from "lucide-react";
import { api } from "../../services";
import { Category, Brand, ProductAttribute, SizeGuide } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { InputField } from "./SharedUI";
import { slugify } from "../../utils/helpers";

// Helper: Đọc file sang Base64
const handleFileRead = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Component con: Modal xác nhận xóa
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading: boolean;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
            <AlertOctagon size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              {message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              disabled={loading}
              onClick={onClose}
              className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              disabled={loading}
              onClick={onConfirm}
              className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                "XÁC NHẬN XÓA"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con: Bộ chọn các mục
const ItemSelectorModal = ({
  isOpen,
  onClose,
  title,
  items,
  selectedIds,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: { id: string; name: string }[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}) => {
  const [tempIds, setTempIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) setTempIds(selectedIds);
  }, [isOpen, selectedIds]);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const toggleId = (id: string) => {
    setTempIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-black text-sm tracking-tight uppercase">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
              size={16}
            />
            <input
              autoFocus
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-secondary/20"
              placeholder="Tìm kiếm mục cần chọn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleId(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                  tempIds.includes(item.id)
                    ? "border-secondary bg-blue-50/50"
                    : "border-gray-50 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-xs font-black uppercase ${
                    tempIds.includes(item.id)
                      ? "text-secondary"
                      : "text-gray-500"
                  }`}
                >
                  {item.name}
                </span>
                {tempIds.includes(item.id) && (
                  <CheckCircle2 size={16} className="text-secondary" />
                )}
              </button>
            ))
          ) : (
            <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase">
              Không tìm thấy kết quả
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-xs font-black uppercase text-gray-400"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(tempIds);
              onClose();
            }}
            className="flex-1 py-3 bg-secondary text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-500/20"
          >
            Xác nhận ({tempIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductConfigManager = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "category" | "attribute" | "brand"
  >("category");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Confirm Delete States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    imageUrl: "",
    logoUrl: "",
    country: "",
    parentId: "",
    sizeGuideId: "",
    categoryIds: [] as string[],
    values: [] as string[],
    selectedAttrIds: [] as string[],
    type: "info" as "variant" | "info",
  });
  const [newValueInput, setNewValueInput] = useState("");
  const imgFileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, brds, attrs, sgs] = await Promise.all([
        api.categories.list(),
        api.brands.list(),
        api.attributes.list(),
        api.sizeGuides.list(),
      ]);
      setCategories(cats);
      setBrands(brds);
      setAttributes(attrs);
      setSizeGuides(sgs);
    } catch (err) {
      console.error("Fetch data failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    if (activeTab === "attribute") {
      if (formData.type === "variant" && formData.values.length === 0) {
        alert("Thuộc tính sinh biến thể phải có ít nhất 1 giá trị!");
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === "category") {
        // Clean data: Remove UI-only fields and attribute-specific fields
        const {
          selectedAttrIds,
          categoryIds,
          code,
          type,
          values,
          ...cleanData
        } = formData;
        // Convert empty foreign keys to null
        const categoryData = {
          ...cleanData,
          slug: editingItem ? cleanData.slug : slugify(cleanData.name), // Auto-generate slug for new items
          parentId: cleanData.parentId || null,
          sizeGuideId: cleanData.sizeGuideId || null,
        };

        // Save category first
        let savedCategory;
        if (editingItem) {
          savedCategory = await api.categories.update(
            editingItem.id,
            categoryData,
            currentUser
          );
        } else {
          savedCategory = await api.categories.create(
            categoryData,
            currentUser
          );
        }

        // Update attribute relationships
        // For all attributes, update their categoryIds to include/exclude this category
        const categoryId = savedCategory.id;
        const selectedIds = selectedAttrIds || [];

        // Get all attributes
        const allAttrs = attributes || [];

        for (const attr of allAttrs) {
          const currentCategoryIds = attr.categoryIds || [];
          const shouldInclude = selectedIds.includes(attr.id);
          const isIncluded = currentCategoryIds.includes(categoryId);

          // If should include but not included, add it
          if (shouldInclude && !isIncluded) {
            await api.attributes.update(
              attr.id,
              { categoryIds: [...currentCategoryIds, categoryId] },
              currentUser
            );
          }
          // If should not include but is included, remove it
          else if (!shouldInclude && isIncluded) {
            await api.attributes.update(
              attr.id,
              {
                categoryIds: currentCategoryIds.filter(
                  (id: string) => id !== categoryId
                ),
              },
              currentUser
            );
          }
        }
      } else if (activeTab === "brand") {
        // Clean brand data: Remove UI-only and attribute-specific fields, plus fields Brand doesn't have
        const {
          selectedAttrIds,
          categoryIds,
          imageUrl,
          code,
          type,
          values,
          description,
          parentId,
          sizeGuideId,
          ...brandBase
        } = formData;
        const brandData = {
          ...brandBase,
          slug: editingItem ? brandBase.slug : slugify(formData.name), // Auto-generate slug for new items
          logoUrl: formData.logoUrl,
        };
        if (editingItem)
          await api.brands.update(editingItem.id, brandData, currentUser);
        else await api.brands.create(brandData, currentUser);
      } else {
        // Clean attribute data: Remove UI-only and category/brand-specific fields
        const {
          selectedAttrIds,
          imageUrl,
          logoUrl,
          parentId,
          sizeGuideId,
          country,
          slug, // Remove slug - attributes don't have slug field
          ...cleanAttrData
        } = formData;

        console.log("💾 Saving attribute data:", cleanAttrData);

        if (editingItem)
          await api.attributes.update(
            editingItem.id,
            cleanAttrData,
            currentUser
          );
        else await api.attributes.create(cleanAttrData as any, currentUser);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerDelete = (item: any) => {
    setItemToConfirm(item);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentUser || !itemToConfirm) return;
    setIsDeleting(true);
    try {
      if (activeTab === "category")
        await api.categories.delete(itemToConfirm.id, currentUser);
      else if (activeTab === "brand")
        await api.brands.delete(itemToConfirm.id, currentUser);
      else await api.attributes.delete(itemToConfirm.id, currentUser);

      await fetchData();
      setIsConfirmOpen(false);
      if (editingItem && editingItem.id === itemToConfirm.id)
        setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Không thể xóa mục này.");
    } finally {
      setIsDeleting(false);
      setItemToConfirm(null);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      if (activeTab === "category") {
        const linkedAttrs =
          attributes
            ?.filter((a) => a?.categoryIds?.includes(item.id))
            ?.map((a) => a.id) || [];
        setFormData({
          name: item.name || "",
          slug: item.slug || "",
          description: item.description || "",
          imageUrl: item.imageUrl || "",
          parentId: item.parentId || "",
          sizeGuideId: item.sizeGuideId || "",
          selectedAttrIds: linkedAttrs,
        });
      } else if (activeTab === "attribute") {
        setFormData({
          name: item.name || "",
          code: item.code || "",
          categoryIds: item.categoryIds || [],
          values: item.values || [],
          type: item.type || "variant",
        });
      } else if (activeTab === "brand") {
        setFormData({
          name: item.name || "",
          slug: item.slug || "",
          logoUrl: item.logoUrl || "",
          country: item.country || "",
        });
      }
    } else {
      setEditingItem(null);
      if (activeTab === "category") {
        setFormData({
          name: "",
          description: "",
          imageUrl: "",
          parentId: "",
          sizeGuideId: "",
          selectedAttrIds: [],
        });
      } else if (activeTab === "brand") {
        setFormData({
          name: "",
          logoUrl: "",
          country: "",
        });
      } else {
        setFormData({
          name: "",
          code: "",
          categoryIds: [],
          values: [],
          type: "variant",
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileRead(file);
      if (activeTab === "brand") setFormData({ ...formData, logoUrl: base64 });
      else if (activeTab === "category")
        setFormData({ ...formData, imageUrl: base64 });
    }
  };

  const generateCodeFromName = (name: string) => {
    if (!name) return "";
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w]/g, "");
  };

  const handleNameBlur = () => {
    if (activeTab === "attribute" && !formData.code) {
      setFormData({ ...formData, code: generateCodeFromName(formData.name) });
    }
  };

  const handleAddPredefinedValue = () => {
    const val = newValueInput.trim();
    if (!val) return;
    if (formData.values.includes(val)) {
      alert("Giá trị này đã tồn tại.");
      return;
    }
    setFormData((prev) => ({ ...prev, values: [...prev.values, val] }));
    setNewValueInput("");
  };

  const filteredItems = useMemo(() => {
    const list =
      activeTab === "category"
        ? categories
        : activeTab === "brand"
        ? brands
        : attributes;
    return list.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, categories, brands, attributes, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in p-6 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Cấu hình sản phẩm
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Quản lý định danh & Phân loại dữ liệu
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-10 py-4 bg-secondary text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3 active:scale-95 transition"
        >
          <Plus size={18} /> Thêm{" "}
          {activeTab === "category"
            ? "danh mục"
            : activeTab === "attribute"
            ? "thuộc tính"
            : "thương hiệu"}
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex border-b border-gray-50 bg-gray-50/30 overflow-x-auto no-scrollbar">
          <TabHeader
            active={activeTab === "category"}
            onClick={() => setActiveTab("category")}
            icon={<Boxes size={18} />}
            label="Danh mục"
          />
          <TabHeader
            active={activeTab === "attribute"}
            onClick={() => setActiveTab("attribute")}
            icon={<Settings2 size={18} />}
            label="Thuộc tính"
          />
          <TabHeader
            active={activeTab === "brand"}
            onClick={() => setActiveTab("brand")}
            icon={<Trophy size={18} />}
            label="Thương hiệu"
          />
        </div>

        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={18}
            />
            <input
              type="text"
              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black uppercase outline-none focus:ring-2 focus:ring-secondary/10"
              placeholder="Tìm kiếm nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-10 py-6">Thông tin chính</th>
                <th className="px-6 py-6">
                  {activeTab === "category"
                    ? "Thuộc tính & Size Guide"
                    : activeTab === "attribute"
                    ? "Loại / Mã"
                    : "Slug / Mã"}
                </th>
                <th className="px-6 py-6 text-center">
                  {activeTab === "attribute" ? "Giá trị" : "Ảnh"}
                </th>
                <th className="px-10 py-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition group"
                >
                  <td className="px-10 py-6">
                    <p className="font-black text-gray-800 uppercase text-base tracking-tight">
                      {item.name}
                    </p>
                    {activeTab === "category" && item.parentId && (
                      <p className="text-[10px] font-bold text-secondary uppercase flex items-center gap-1 mt-1">
                        <Layers size={10} /> Trực thuộc:{" "}
                        {categories?.find((c) => c.id === item.parentId)?.name}
                      </p>
                    )}
                    {activeTab === "attribute" && (
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">
                        {item.categoryIds?.length > 0
                          ? "Dành cho danh mục cụ thể"
                          : "Toàn hệ thống (Global)"}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {activeTab === "attribute" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                item.type === "variant"
                                  ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                              }`}
                            >
                              {item.type === "variant"
                                ? "Sinh biến thể"
                                : "Thông tin bổ sung"}
                            </span>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              CODE: {item.code}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item?.categoryIds?.length > 0 &&
                              item.categoryIds.map((cid: string) => (
                                <span
                                  key={cid}
                                  className="px-2 py-0.5 bg-gray-100 text-[9px] font-black uppercase rounded text-gray-500"
                                >
                                  {categories?.find((c) => c.id === cid)?.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      ) : activeTab === "category" ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {attributes
                              ?.filter((a) =>
                                a?.categoryIds?.includes(item?.id)
                              )
                              ?.map((a) => (
                                <span
                                  key={a.id}
                                  className="px-2 py-0.5 bg-blue-50 text-[9px] font-black uppercase rounded text-secondary border border-blue-100"
                                >
                                  {a.name}
                                </span>
                              ))}
                          </div>
                          {item?.sizeGuideId && (
                            <div className="flex items-center gap-2 text-green-600">
                              <Ruler size={12} />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                {
                                  sizeGuides?.find(
                                    (sg) => sg.id === item.sizeGuideId
                                  )?.name
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-secondary font-black tracking-tight">
                          /{item?.slug}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {activeTab === "attribute" ? (
                      <span className="inline-block font-black text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded-lg">
                        {item.values?.length || 0}
                      </span>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm mx-auto overflow-hidden p-1 flex items-center justify-center">
                        <img
                          src={
                            item.logoUrl ||
                            item.imageUrl ||
                            "https://ui-avatars.com/api/?name=SH"
                          }
                          className="max-w-full max-h-full object-contain"
                          alt=""
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition duration-200">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary hover:border-secondary rounded-xl shadow-sm transition transform hover:scale-110"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => triggerDelete(item)}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 rounded-xl shadow-sm transition transform hover:scale-110"
                        title="Xóa bỏ"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
          >
            <div className="bg-gray-50 p-8 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">
                {editingItem ? "Cập nhật" : "Thêm mới"}{" "}
                {activeTab === "category"
                  ? "Danh mục"
                  : activeTab === "brand"
                  ? "Thương hiệu"
                  : "Thuộc tính"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Cột Trái: Ảnh */}
                {(activeTab === "brand" || activeTab === "category") && (
                  <div className="lg:col-span-4 space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} className="text-secondary" />{" "}
                      {activeTab === "brand"
                        ? "Logo thương hiệu"
                        : "Ảnh đại diện"}
                    </label>
                    <div className="relative aspect-square w-full bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group hover:border-secondary transition">
                      {(
                        activeTab === "brand"
                          ? formData.logoUrl
                          : formData.imageUrl
                      ) ? (
                        <>
                          <img
                            src={
                              activeTab === "brand"
                                ? formData.logoUrl
                                : formData.imageUrl
                            }
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
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => imgFileInputRef.current?.click()}
                              className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition"
                            >
                              <Upload size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  [activeTab === "brand"
                                    ? "logoUrl"
                                    : "imageUrl"]: "",
                                })
                              }
                              className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => imgFileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 text-gray-400 hover:text-secondary transition"
                        >
                          <Camera size={32} />
                          <span className="text-[10px] font-black uppercase">
                            Tải ảnh lên
                          </span>
                        </button>
                      )}
                      <input
                        type="file"
                        ref={imgFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                )}

                {/* Cột Phải: Fields */}
                <div
                  className={`${
                    activeTab === "brand" || activeTab === "category"
                      ? "lg:col-span-8"
                      : "lg:col-span-12"
                  } space-y-6`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Tên gọi *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        onBlur={handleNameBlur}
                      />
                    </div>
                    {activeTab === "category" ? (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Danh mục cha
                        </label>
                        <select
                          className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10"
                          value={formData.parentId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              parentId: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Cấp cao nhất --</option>
                          {categories
                            ?.filter((c) => c.id !== editingItem?.id)
                            ?.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    ) : activeTab === "attribute" ? (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Mã định danh *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10 uppercase"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                          }
                        />
                      </div>
                    ) : activeTab === "brand" ? (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Quốc gia
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10"
                          value={formData.country || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          placeholder="VD: Việt Nam, USA, Japan..."
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* ATTRIBUTE TYPE SELECTOR */}
                  {activeTab === "attribute" && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Loại thuộc tính *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: "variant" })
                          }
                          className={`p-4 rounded-2xl border-2 transition text-left ${
                            formData.type === "variant"
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white hover:border-purple-300"
                          }`}
                        >
                          <p
                            className={`text-xs font-black uppercase ${
                              formData.type === "variant"
                                ? "text-purple-600"
                                : "text-gray-600"
                            }`}
                          >
                            Sinh biến thể
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold mt-1">
                            Tạo SKU (Size, Màu sắc)
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: "info" })
                          }
                          className={`p-4 rounded-2xl border-2 transition text-left ${
                            formData.type === "info"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <p
                            className={`text-xs font-black uppercase ${
                              formData.type === "info"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          >
                            Thông tin bổ sung
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold mt-1">
                            Chi tiết sản phẩm
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ATTRIBUTE VALUES LIST */}
                  {activeTab === "attribute" && (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Danh sách giá trị {formData.type === "variant" && "*"}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ví dụ: Đỏ, 40, XL..."
                          className="flex-1 border border-gray-100 bg-gray-50 rounded-2xl px-5 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-secondary/10"
                          value={newValueInput}
                          onChange={(e) => setNewValueInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddPredefinedValue();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddPredefinedValue}
                          className="px-6 py-3 bg-secondary text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-700 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[60px]">
                        {formData.values.length > 0 ? (
                          formData.values.map((val, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm border border-gray-100 animate-in zoom-in-50"
                            >
                              {val}
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    values: formData.values.filter(
                                      (_, i) => i !== idx
                                    ),
                                  })
                                }
                                className="text-gray-400 hover:text-red-500 transition"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-gray-300 font-bold uppercase py-2">
                            {formData.type === "variant"
                              ? "Chưa có giá trị. Thêm ít nhất 1 giá trị để sinh biến thể."
                              : "Không có giá trị định sẵn. Người dùng có thể nhập tự do."}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "category" && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Bảng size mặc định
                      </label>
                      <select
                        className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-secondary/10"
                        value={formData.sizeGuideId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sizeGuideId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Không áp dụng --</option>
                        {sizeGuides?.map((sg) => (
                          <option key={sg.id} value={sg.id}>
                            {sg.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1 italic">
                        Sản phẩm thuộc danh mục này sẽ hiển thị bảng size đã
                        chọn.
                      </p>
                    </div>
                  )}

                  {activeTab !== "brand" && (
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {activeTab === "category"
                          ? "Thuộc tính áp dụng"
                          : "Danh mục áp dụng"}
                      </label>
                      <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200">
                        {activeTab === "category" ? (
                          <>
                            {formData.selectedAttrIds?.map((id) => (
                              <div
                                key={id}
                                className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-md animate-in zoom-in-50"
                              >
                                {attributes?.find((a) => a.id === id)?.name}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      selectedAttrIds:
                                        formData.selectedAttrIds.filter(
                                          (i) => i !== id
                                        ),
                                    })
                                  }
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setIsSelectorOpen(true)}
                              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-secondary transition transform active:scale-90"
                            >
                              <Plus size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            {formData.categoryIds?.map((id) => (
                              <div
                                key={id}
                                className="flex items-center gap-2 bg-secondary text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-md animate-in zoom-in-50"
                              >
                                {categories?.find((c) => c.id === id)?.name}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      categoryIds: formData.categoryIds.filter(
                                        (i) => i !== id
                                      ),
                                    })
                                  }
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setIsSelectorOpen(true)}
                              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-secondary transition transform active:scale-90"
                            >
                              <Plus size={16} />
                            </button>
                            {formData.categoryIds.length === 0 && (
                              <span className="text-[10px] font-black text-gray-300 uppercase py-1">
                                Toàn hệ thống (Global)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "category" && (
                    <InputField
                      label="Mô tả / Ghi chú"
                      value={formData.description}
                      onChange={(v: string) =>
                        setFormData({ ...formData, description: v })
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] hover:text-gray-800 transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-secondary text-white rounded-[20px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-3 disabled:opacity-50 transition active:scale-95"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <>
                    <Save size={18} /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <ItemSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title={
          activeTab === "category"
            ? "Chọn Thuộc tính cho Danh mục"
            : "Chọn Danh mục áp dụng"
        }
        items={activeTab === "category" ? attributes : categories}
        selectedIds={
          activeTab === "category"
            ? formData.selectedAttrIds
            : formData.categoryIds
        }
        onConfirm={(ids) => {
          if (activeTab === "category")
            setFormData({ ...formData, selectedAttrIds: ids });
          else setFormData({ ...formData, categoryIds: ids });
        }}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title={`Xác nhận xóa ${
          activeTab === "category"
            ? "Danh mục"
            : activeTab === "brand"
            ? "Thương hiệu"
            : "Thuộc tính"
        }`}
        message={`Bạn có chắc chắn muốn xóa "${itemToConfirm?.name}"? Hành động này không thể hoàn tác và sẽ xóa bỏ mọi liên kết liên quan.`}
      />
    </div>
  );
};

const TabHeader = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`px-10 py-6 font-black text-xs uppercase tracking-widest relative transition flex-shrink-0 ${
      active
        ? "text-secondary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-secondary bg-white"
        : "text-gray-400 hover:text-gray-600"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon} {label}
    </div>
  </button>
);
