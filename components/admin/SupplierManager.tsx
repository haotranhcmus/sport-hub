import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Building2,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { api } from "../../services";
import { Supplier } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { InputField } from "./SharedUI";
import { useSuppliers } from "../../hooks/useInventoryQuery";

export const SupplierManager = () => {
  const { user: currentUser } = useAuth();

  // Use TanStack Query
  const { data: suppliers = [], isLoading: loading, refetch } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    taxCode: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setActionLoading(true);
    try {
      if (editingSupplier)
        await api.suppliers.update(editingSupplier.id, formData, currentUser);
      else await api.suppliers.create(formData, currentUser);
      setIsModalOpen(false);
      await refetch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (s: Supplier) => {
    if (!currentUser) return;
    const newStatus = s.status === "active" ? "inactive" : "active";
    try {
      await api.suppliers.update(
        s.id,
        { ...s, status: newStatus },
        currentUser
      );
      await refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.phone.includes(searchQuery) ||
          s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [suppliers, searchQuery]
  );

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      taxCode: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      taxCode: s.taxCode || "",
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email || "",
      address: s.address || "",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in p-6 md:p-8 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Nhà cung cấp
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Đối tác nguồn hàng SportHub
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-10 py-4 bg-secondary text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3 active:scale-95 transition"
        >
          <Plus size={18} /> Thêm nhà cung cấp
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
        <Search className="text-gray-300 ml-2" size={24} />
        <input
          type="text"
          placeholder="Tìm theo tên, người liên hệ hoặc SĐT..."
          className="flex-1 bg-transparent border-none outline-none font-black text-sm uppercase text-slate-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b">
            <tr>
              <th className="px-10 py-6">Đối tác & MST</th>
              <th className="px-6 py-6">Người liên hệ</th>
              <th className="px-6 py-6">Liên lạc</th>
              <th className="px-6 py-6 text-center">Trạng thái</th>
              <th className="px-10 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSuppliers.map((s) => (
              <tr
                key={s.id}
                className={`hover:bg-gray-50 transition group ${
                  s.status === "inactive" ? "opacity-50" : ""
                }`}
              >
                <td className="px-10 py-6">
                  <p className="font-black text-gray-800 uppercase text-base">
                    {s.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                    MST: {s.taxCode || "N/A"}
                  </p>
                </td>
                <td className="px-6 py-6 font-black text-gray-600 text-sm uppercase">
                  {s.contactPerson}
                </td>
                <td className="px-6 py-6">
                  <p className="text-xs font-black text-gray-700">{s.phone}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                    {s.email || ""}
                  </p>
                </td>
                <td className="px-6 py-6 text-center">
                  <button
                    onClick={() => handleToggleStatus(s)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition ${
                      s.status === "active"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    {s.status === "active" ? "Đang hợp tác" : "Ngừng hoạt động"}
                  </button>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition duration-200">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-xl shadow-sm transition transform hover:scale-110"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSuppliers.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest">
            Không tìm thấy nhà cung cấp nào
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
          >
            <div className="bg-gray-50 p-8 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary text-white rounded-2xl shadow-xl">
                  <Building2 size={24} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingSupplier
                    ? "Cập nhật đối tác"
                    : "Thêm nhà cung cấp mới"}
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

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField
                  label="Tên công ty / Đại lý *"
                  value={formData.name}
                  onChange={(v: string) =>
                    setFormData({ ...formData, name: v })
                  }
                  required
                />
                <InputField
                  label="Mã số thuế"
                  value={formData.taxCode}
                  onChange={(v: string) =>
                    setFormData({ ...formData, taxCode: v })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField
                  label="Người liên hệ *"
                  value={formData.contactPerson}
                  onChange={(v: string) =>
                    setFormData({ ...formData, contactPerson: v })
                  }
                  required
                />
                <InputField
                  label="Số điện thoại liên hệ *"
                  value={formData.phone}
                  onChange={(v: string) =>
                    setFormData({ ...formData, phone: v })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField
                  label="Email liên hệ"
                  value={formData.email}
                  onChange={(v: string) =>
                    setFormData({ ...formData, email: v })
                  }
                  type="email"
                />
                <InputField
                  label="Địa chỉ trụ sở / Kho *"
                  value={formData.address}
                  onChange={(v: string) =>
                    setFormData({ ...formData, address: v })
                  }
                  required
                />
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex justify-end gap-4 shadow-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] hover:text-gray-800 transition tracking-widest"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-secondary text-white rounded-[20px] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 flex items-center gap-3 disabled:opacity-50 transition active:scale-95 hover:bg-blue-600"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <>
                    <Save size={18} /> LƯU ĐỐI TÁC
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
