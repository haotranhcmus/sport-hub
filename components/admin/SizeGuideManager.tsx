import React, { useState, useEffect, useMemo } from "react";
import {
  Ruler,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  List,
  ArrowDownUp,
  Info,
  Minus,
} from "lucide-react";
import { api } from "../../services";
import { SizeGuide, SizeGuideColumn } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { InputField } from "./SharedUI";

export const SizeGuideManager = () => {
  const { user: currentUser } = useAuth();
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SizeGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    columns: [{ key: "size", label: "Size" }] as SizeGuideColumn[],
    rows: [] as Record<string, string>[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.sizeGuides.list();
      setSizeGuides(res);
    } catch (err) {
      console.error("Lỗi khi tải danh sách bảng size:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item?: SizeGuide) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        columns: [...item.columns],
        rows: item.rows.map((r) => ({ ...r })),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        columns: [{ key: "size", label: "Kích cỡ" }],
        rows: [{ size: "" }],
      });
    }
    setIsModalOpen(true);
  };

  const handleAddColumn = () => {
    const key = `col_${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      columns: [...prev.columns, { key, label: "Cột mới" }],
      rows: prev.rows.map((r) => ({ ...r, [key]: "" })),
    }));
  };

  const handleRemoveColumn = (key: string) => {
    if (formData.columns.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.key !== key),
      rows: prev.rows.map((r) => {
        const newRow = { ...r };
        delete newRow[key];
        return newRow;
      }),
    }));
  };

  const handleAddRow = () => {
    const newRow: Record<string, string> = {};
    formData.columns.forEach((c) => (newRow[c.key] = ""));
    setFormData((prev) => ({ ...prev, rows: [...prev.rows, newRow] }));
  };

  const handleRemoveRow = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== idx),
    }));
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    // Ngăn chặn sự kiện trôi lên các phần tử cha
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) return;

    const sg = sizeGuides.find((s) => s.id === id);
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa bảng size "${
          sg?.name || "này"
        }"? Dữ liệu này không thể khôi phục.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      console.log("Đang thực hiện xóa bảng size ID:", id);
      const success = await api.sizeGuides.delete(id, currentUser);
      if (success) {
        // Cập nhật state cục bộ ngay lập tức để UI phản hồi nhanh
        setSizeGuides((prev) => prev.filter((item) => item.id !== id));
        // Đồng thời gọi lại list để đồng bộ với mock store
        await fetchData();
      }
    } catch (err: any) {
      alert("Lỗi khi xóa bảng size: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      if (editingItem)
        await api.sizeGuides.update(editingItem.id, formData, currentUser);
      else await api.sizeGuides.create(formData, currentUser);
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sizeGuides.filter((sg) =>
    sg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in p-6 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Quản lý Bảng Size
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Định nghĩa kích cỡ cho từng dòng sản phẩm
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-10 py-4 bg-secondary text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3 active:scale-95 transition"
        >
          <Plus size={18} /> Tạo bảng size mới
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
        <Search className="text-gray-300 ml-2" size={24} />
        <input
          type="text"
          placeholder="Tìm kiếm bảng size..."
          className="flex-1 bg-transparent border-none outline-none font-black text-sm uppercase text-slate-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((sg) => (
          <div
            key={sg.id}
            className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 text-secondary rounded-3xl group-hover:scale-110 transition duration-500">
                <Ruler size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition translate-x-4 group-hover:translate-x-0 duration-300">
                <button
                  type="button"
                  onClick={() => openModal(sg)}
                  className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-xl shadow-sm transition transform hover:scale-105"
                  title="Sửa"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, sg.id)}
                  disabled={deletingId === sg.id}
                  className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 rounded-xl shadow-sm transition transform hover:scale-105 disabled:opacity-50"
                  title="Xóa"
                >
                  {deletingId === sg.id ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-2 line-clamp-1">
              {sg.name}
            </h3>
            <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-6 flex-1">
              {sg.description || "Không có mô tả."}
            </p>
            <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {sg.columns.slice(0, 3).map((c) => (
                  <span
                    key={c.key}
                    className="px-2 py-0.5 bg-gray-100 text-[8px] font-black uppercase text-gray-400 rounded-lg"
                  >
                    {c.label}
                  </span>
                ))}
                {sg.columns.length > 3 && (
                  <span className="text-[8px] font-black text-gray-300">
                    +{sg.columns.length - 3}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black text-secondary uppercase bg-blue-50 px-3 py-1 rounded-full shrink-0">
                {sg.rows.length} Dòng
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
          >
            <div className="bg-gray-50 p-8 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary text-white rounded-2xl shadow-xl">
                  <Ruler size={24} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingItem
                    ? "Cập nhật bảng size"
                    : "Thiết kế bảng size mới"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField
                  label="Tên bảng size *"
                  value={formData.name}
                  onChange={(v: string) =>
                    setFormData({ ...formData, name: v })
                  }
                  required
                />
                <InputField
                  label="Mô tả bảng size"
                  value={formData.description}
                  onChange={(v: string) =>
                    setFormData({ ...formData, description: v })
                  }
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <List size={14} /> Dữ liệu bảng (Kéo thả để nhập liệu nhanh)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition transform active:scale-95"
                  >
                    <Plus size={14} /> Thêm cột mới
                  </button>
                </div>

                <div className="bg-gray-200/50 rounded-[32px] border border-gray-300 overflow-hidden shadow-inner">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-white border-b border-gray-300">
                        <tr>
                          {formData.columns.map((col, idx) => (
                            <th key={col.key} className="px-6 py-5">
                              <div className="flex items-center gap-2 group relative">
                                <input
                                  className="bg-white border border-slate-300 font-black text-[10px] uppercase tracking-widest text-secondary outline-none w-40 focus:ring-4 focus:ring-secondary/10 focus:border-secondary rounded-xl px-4 py-2.5 transition-all shadow-sm"
                                  value={col.label}
                                  onChange={(e) => {
                                    const newCols = [...formData.columns];
                                    newCols[idx].label = e.target.value;
                                    setFormData({
                                      ...formData,
                                      columns: newCols,
                                    });
                                  }}
                                />
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColumn(col.key)}
                                    className="p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    title="Xóa cột"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th className="px-6 py-4 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300 bg-gray-50/50">
                        {formData.rows.length > 0 ? (
                          formData.rows.map((row, rowIdx) => (
                            <tr
                              key={rowIdx}
                              className="hover:bg-white transition duration-200"
                            >
                              {formData.columns.map((col) => (
                                <td key={col.key} className="px-6 py-4">
                                  <input
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all text-slate-800 shadow-sm"
                                    value={row[col.key]}
                                    placeholder="..."
                                    onChange={(e) => {
                                      const newRows = [...formData.rows];
                                      newRows[rowIdx][col.key] = e.target.value;
                                      setFormData({
                                        ...formData,
                                        rows: newRows,
                                      });
                                    }}
                                  />
                                </td>
                              ))}
                              <td className="px-6 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(rowIdx)}
                                  className="p-2.5 bg-white border border-gray-200 text-gray-300 hover:text-red-500 hover:border-red-200 rounded-xl transition shadow-sm"
                                  title="Xóa dòng"
                                >
                                  <Minus size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={formData.columns.length + 1}
                              className="py-12 text-center"
                            >
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">
                                Chưa có dữ liệu dòng. Nhấn nút bên dưới để thêm.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="w-full py-6 bg-white text-gray-400 hover:text-secondary hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-t border-gray-300 shadow-inner group"
                  >
                    <Plus
                      size={20}
                      className="group-hover:scale-125 transition-transform"
                    />
                    THÊM DÒNG DỮ LIỆU MỚI
                  </button>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-[32px] border-2 border-dashed border-blue-200 flex gap-5">
                <Info className="text-secondary shrink-0" size={24} />
                <div className="space-y-1">
                  <p className="text-xs font-black text-blue-800 uppercase tracking-tight">
                    Hướng dẫn cấu hình:
                  </p>
                  <p className="text-[11px] font-bold text-blue-600/80 leading-relaxed uppercase">
                    Các cột (Header) nên là tên các loại size: EU, US, CM, KG...
                    Các ô nhập liệu bên dưới là thông số tương ứng. Hãy đảm bảo
                    bạn nhấn "Lưu bảng size" trước khi thoát để áp dụng thay
                    đổi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shadow-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] hover:text-gray-800 transition tracking-widest"
              >
                HỦY BỎ
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-14 py-4 bg-secondary text-white rounded-[20px] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 flex items-center gap-3 disabled:opacity-50 transition active:scale-95 hover:bg-blue-600"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <>
                    <Save size={18} /> LƯU BẢNG SIZE
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
