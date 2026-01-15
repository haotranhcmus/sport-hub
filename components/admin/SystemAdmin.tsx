import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  RefreshCw,
  Terminal,
  ChevronRight,
  X,
  UserPlus,
  UserCheck,
  UserX,
  Edit3,
  Lock,
  Unlock,
  Monitor,
  ImageIcon,
  Settings,
  Save,
  Upload,
  Camera,
} from "lucide-react";
import { api } from "../../services";
import {
  SystemLog,
  User as UserType,
  SystemConfig,
  AppBanner,
} from "../../types";
import { useAuth } from "../../context/AuthContext";
import { StatCard, InputField, TabButton } from "./SharedUI";
import { uploadImage } from "../../lib/storage";

export const AuditLogsView = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [filterActor, setFilterActor] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);
  const fetchLogs = async () => {
    setLoading(true);
    const res = await api.system.getLogs();
    setLogs(res);
    setLoading(false);
  };

  const filteredLogs = useMemo(
    () =>
      logs.filter(
        (log) =>
          !filterActor ||
          log.actorName.toLowerCase().includes(filterActor.toLowerCase())
      ),
    [logs, filterActor]
  );

  return (
    <div className="space-y-10 animate-in fade-in p-6 md:p-8 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Nhật ký hệ thống
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Hệ thống giám sát vận hành
          </p>
        </div>
        <button onClick={fetchLogs} className="p-4 bg-white border rounded-3xl">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            size={16}
          />
          <input
            type="text"
            className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-black uppercase"
            placeholder="Tên nhân viên..."
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
            <tr>
              <th className="px-8 py-6">Thời gian</th>
              <th className="px-6 py-6">Nhân viên</th>
              <th className="px-6 py-6">Hành động</th>
              <th className="px-6 py-6">Nội dung</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="hover:bg-gray-50 transition cursor-pointer group"
              >
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-gray-800 uppercase">
                    {new Date(log.timestamp).toLocaleDateString("vi-VN")}
                  </span>
                  <br />
                  <span className="text-[10px] font-bold text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString("vi-VN")}
                  </span>
                </td>
                <td className="px-6 py-6 text-sm font-black text-gray-800 uppercase">
                  {log.actorName}
                </td>
                <td className="px-6 py-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      log.actionType === "CREATE"
                        ? "bg-green-100 text-green-700"
                        : log.actionType === "UPDATE"
                        ? "bg-blue-100 text-blue-700"
                        : log.actionType === "DELETE"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {log.actionType}
                  </span>
                </td>
                <td className="px-6 py-6 text-sm font-bold text-gray-600 line-clamp-1">
                  {log.description}
                </td>
                <td className="px-8 py-6 text-right">
                  <ChevronRight size={18} className="text-gray-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-100 p-8 border-b flex justify-between items-center">
              <h2 className="text-xl font-black uppercase">
                Chi tiết hành động
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12">
              <pre className="bg-slate-900 rounded-[32px] p-8 text-blue-300 font-mono text-xs overflow-x-auto">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SystemManager = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "SALES" as any,
  });

  const fetchEmployees = async () => {
    const res = await api.employees.list();
    setEmployees(res);
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      if (editingEmp)
        await api.employees.update(editingEmp.id, formData, currentUser);
      else await api.employees.create(formData, currentUser);
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in p-6 md:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Quản lý nhân viên
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">
            Phân quyền hệ thống
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEmp(null);
            setFormData({ fullName: "", email: "", phone: "", role: "SALES" });
            setIsModalOpen(true);
          }}
          className="px-8 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-2"
        >
          <UserPlus size={18} /> Thêm nhân viên
        </button>
      </div>
      <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
            <tr>
              <th className="px-8 py-6">Nhân viên</th>
              <th className="px-6 py-6">Vai trò</th>
              <th className="px-6 py-6 text-center">Trạng thái</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition">
                <td className="px-8 py-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black uppercase">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase">
                      {emp.fullName}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {emp.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-black uppercase">
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      emp.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingEmp(emp);
                      setFormData({
                        fullName: emp.fullName,
                        email: emp.email,
                        phone: emp.phone || "",
                        role: emp.role,
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-secondary"
                  >
                    <Edit3 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-[40px] w-full max-w-2xl p-10 space-y-6"
          >
            <h2 className="text-xl font-black uppercase">
              Thông tin nhân viên
            </h2>
            <InputField
              label="Họ tên *"
              value={formData.fullName}
              onChange={(v: string) =>
                setFormData({ ...formData, fullName: v })
              }
              required
            />
            <InputField
              label="Email *"
              value={formData.email}
              onChange={(v: string) => setFormData({ ...formData, email: v })}
              required
              disabled={!!editingEmp}
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 font-black text-gray-400 uppercase text-[10px]"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-10 py-4 bg-secondary text-white rounded-2xl font-black uppercase text-[10px] shadow-xl"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export const SystemConfigManager = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "general" | "shipping" | "banners" | "params"
  >("general");
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Province list for store location
  const PROVINCES = [
    { code: "01", name: "Hà Nội" },
    { code: "79", name: "TP. Hồ Chí Minh" },
    { code: "48", name: "Đà Nẵng" },
    { code: "31", name: "Hải Phòng" },
    { code: "92", name: "Cần Thơ" },
    { code: "74", name: "Bình Dương" },
    { code: "75", name: "Đồng Nai" },
    { code: "77", name: "Bà Rịa - Vũng Tàu" },
    { code: "89", name: "An Giang" },
    { code: "26", name: "Vĩnh Phúc" },
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.system.getConfig();
      // Set defaults if missing
      setConfig({
        ...data,
        storeAddress: data.storeAddress || "",
        storeProvinceCode: data.storeProvinceCode || "79",
        storeProvinceName: data.storeProvinceName || "TP. Hồ Chí Minh",
        baseShippingFee: data.baseShippingFee || 30000,
        sameProvinceFee: data.sameProvinceFee || 15000,
        sameProvinceDiscount: data.sameProvinceDiscount || 30, // Legacy
        freeShippingThreshold: data.freeShippingThreshold || 1000000,
        banners: data.banners || [],
      });
    } catch (err) {
      showNotification("error", "Không thể tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    if (!config || !currentUser) return;
    setIsSaving(true);
    try {
      await api.system.updateConfig(config, currentUser);
      showNotification("success", "Cập nhật cấu hình thành công!");
    } catch (err) {
      showNotification("error", "Lỗi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProvinceChange = (code: string) => {
    const province = PROVINCES.find((p) => p.code === code);
    if (province && config) {
      setConfig({
        ...config,
        storeProvinceCode: code,
        storeProvinceName: province.name,
      });
    }
  };

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    if (!file.type.startsWith("image/")) {
      setNotification({ type: "error", message: "Chỉ chấp nhận file ảnh" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setNotification({ type: "error", message: "File quá lớn (tối đa 2MB)" });
      return;
    }

    try {
      const result = await uploadImage(file, "system");
      setConfig({ ...config, logoUrl: result.url });
      setNotification({ type: "success", message: "Upload logo thành công!" });
    } catch (error: any) {
      setNotification({
        type: "error",
        message: "Lỗi upload: " + error.message,
      });
    }
  };

  // Banner image upload handler
  const handleBannerImageUpload = async (
    bannerId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    if (!file.type.startsWith("image/")) {
      setNotification({ type: "error", message: "Chỉ chấp nhận file ảnh" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({ type: "error", message: "File quá lớn (tối đa 5MB)" });
      return;
    }

    try {
      const result = await uploadImage(file, "banners");
      handleUpdateBanner(bannerId, "imageUrl", result.url);
      setNotification({
        type: "success",
        message: "Upload banner thành công!",
      });
    } catch (error: any) {
      setNotification({
        type: "error",
        message: "Lỗi upload: " + error.message,
      });
    }
  };

  const handleAddBanner = () => {
    if (!config) return;
    const newBanner = {
      id: crypto.randomUUID(),
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      order: config.banners.length,
    };
    setConfig({ ...config, banners: [...config.banners, newBanner] });
  };

  const handleRemoveBanner = (id: string) => {
    if (!config) return;
    setConfig({
      ...config,
      banners: config.banners.filter((b) => b.id !== id),
    });
  };

  const handleUpdateBanner = (id: string, field: string, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      banners: config.banners.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="w-full space-y-6 animate-in fade-in p-4 md:p-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <Save size={20} />
          ) : (
            <X size={20} />
          )}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Cấu hình hệ thống
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Quản lý thông tin cửa hàng & vận hành
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-secondary text-white rounded-xl font-black text-xs uppercase shadow-lg flex items-center gap-2 hover:bg-blue-600 transition disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          Lưu cấu hình
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 bg-gray-50 border-r border-gray-100">
          <nav className="p-3 space-y-1">
            <TabButton
              id="general"
              active={activeTab}
              onClick={setActiveTab}
              label="Thông tin chung"
              icon={<Monitor size={16} />}
            />
            <TabButton
              id="shipping"
              active={activeTab}
              onClick={setActiveTab}
              label="Vận chuyển"
              icon={<Settings size={16} />}
            />
            <TabButton
              id="banners"
              active={activeTab}
              onClick={setActiveTab}
              label="Banner"
              icon={<ImageIcon size={16} />}
            />
            <TabButton
              id="params"
              active={activeTab}
              onClick={setActiveTab}
              label="Tham số"
              icon={<Settings size={16} />}
            />
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight border-b pb-3">
                Thông tin cửa hàng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">
                      Tên cửa hàng *
                    </label>
                    <input
                      type="text"
                      value={config.websiteTitle}
                      onChange={(e) =>
                        setConfig({ ...config, websiteTitle: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                      placeholder="Tên cửa hàng"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">
                      Hotline *
                    </label>
                    <input
                      type="tel"
                      value={config.hotline}
                      onChange={(e) =>
                        setConfig({ ...config, hotline: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                      placeholder="1900xxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      value={config.contactEmail || ""}
                      onChange={(e) =>
                        setConfig({ ...config, contactEmail: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                      placeholder="contact@store.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed text-center hover:border-secondary transition-colors">
                    <img
                      src={
                        config.logoUrl ||
                        "https://via.placeholder.com/100?text=Logo"
                      }
                      className="w-20 h-20 mx-auto mb-4 object-contain rounded-xl bg-white p-2 shadow-sm"
                      alt="Logo"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-secondary/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Upload size={14} /> Tải ảnh lên
                    </button>
                    <p className="text-[9px] text-gray-400 mt-2">
                      PNG, JPG (tối đa 2MB)
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={config.facebookUrl || ""}
                      onChange={(e) =>
                        setConfig({ ...config, facebookUrl: e.target.value })
                      }
                      className="border border-gray-200 rounded-lg px-3 py-2 text-[10px] focus:border-secondary outline-none"
                      placeholder="Facebook URL"
                    />
                    <input
                      type="text"
                      value={config.zaloUrl || ""}
                      onChange={(e) =>
                        setConfig({ ...config, zaloUrl: e.target.value })
                      }
                      className="border border-gray-200 rounded-lg px-3 py-2 text-[10px] focus:border-secondary outline-none"
                      placeholder="Zalo URL"
                    />
                    <input
                      type="text"
                      value={config.instagramUrl || ""}
                      onChange={(e) =>
                        setConfig({ ...config, instagramUrl: e.target.value })
                      }
                      className="border border-gray-200 rounded-lg px-3 py-2 text-[10px] focus:border-secondary outline-none"
                      placeholder="Instagram URL"
                    />
                  </div>
                </div>
              </div>

              {/* Store Address */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-4">
                  Địa chỉ cửa hàng (dùng tính phí ship)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      value={config.storeProvinceCode}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none appearance-none bg-white"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      value={config.storeAddress}
                      onChange={(e) =>
                        setConfig({ ...config, storeAddress: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                      placeholder="Số nhà, tên đường, quận/huyện..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === "shipping" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight border-b pb-3">
                Cấu hình phí vận chuyển
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">
                    Phí ship khác tỉnh
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={config.baseShippingFee}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          baseShippingFee: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 border border-blue-200 rounded-lg px-3 py-2 font-black text-lg text-blue-700 focus:border-blue-400 outline-none"
                    />
                    <span className="text-sm font-bold text-blue-500">đ</span>
                  </div>
                  <p className="text-[9px] text-blue-500 mt-2">
                    Áp dụng khi giao khác tỉnh với cửa hàng
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <label className="block text-[10px] font-black text-green-600 uppercase mb-2">
                    Phí ship cùng tỉnh
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={config.sameProvinceFee || 0}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sameProvinceFee: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 border border-green-200 rounded-lg px-3 py-2 font-black text-lg text-green-700 focus:border-green-400 outline-none"
                    />
                    <span className="text-sm font-bold text-green-500">đ</span>
                  </div>
                  <p className="text-[9px] text-green-500 mt-2">
                    Áp dụng khi giao cùng tỉnh ({config.storeProvinceName})
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <label className="block text-[10px] font-black text-orange-600 uppercase mb-2">
                    Miễn phí ship từ
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={config.freeShippingThreshold}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          freeShippingThreshold: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 border border-orange-200 rounded-lg px-3 py-2 font-black text-lg text-orange-700 focus:border-orange-400 outline-none"
                    />
                    <span className="text-sm font-bold text-orange-500">đ</span>
                  </div>
                  <p className="text-[9px] text-orange-500 mt-2">
                    Đơn hàng &gt; giá trị này = Free ship
                  </p>
                </div>
              </div>

              {/* Shipping Preview */}
              <div className="p-4 bg-gray-50 rounded-xl border">
                <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3">
                  Preview phí ship
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-[9px] text-gray-400 uppercase">
                      Cùng tỉnh
                    </p>
                    <p className="font-black text-green-600 text-lg">
                      {(config.sameProvinceFee || 0).toLocaleString()}đ
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-[9px] text-gray-400 uppercase">
                      Khác tỉnh
                    </p>
                    <p className="font-black text-blue-600 text-lg">
                      {config.baseShippingFee.toLocaleString()}đ
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-[9px] text-gray-400 uppercase">
                      Miễn phí từ
                    </p>
                    <p className="font-black text-orange-600 text-lg">
                      {config.freeShippingThreshold.toLocaleString()}đ
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-[9px] text-gray-400 uppercase">
                      Cửa hàng tại
                    </p>
                    <p className="font-black text-gray-700 text-sm">
                      {config.storeProvinceName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === "banners" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
                  Quản lý Banner
                </h3>
                <button
                  onClick={handleAddBanner}
                  className="px-4 py-2 bg-secondary text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"
                >
                  <Upload size={14} /> Thêm banner
                </button>
              </div>

              {config.banners.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
                  <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-sm text-gray-400 font-bold">
                    Chưa có banner nào
                  </p>
                  <button
                    onClick={handleAddBanner}
                    className="mt-4 px-6 py-2 bg-secondary text-white rounded-lg text-[10px] font-black uppercase"
                  >
                    Thêm banner đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.banners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className="p-4 bg-gray-50 rounded-xl border flex flex-col md:flex-row gap-4 items-start"
                    >
                      <div className="w-full md:w-48 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative group">
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Camera size={24} />
                          </div>
                        )}
                        {/* Upload overlay */}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleBannerImageUpload(banner.id, e)
                            }
                          />
                          <div className="text-white text-center">
                            <Upload size={20} className="mx-auto mb-1" />
                            <span className="text-[10px] font-bold">
                              Upload ảnh
                            </span>
                          </div>
                        </label>
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          value={banner.linkUrl || ""}
                          onChange={(e) =>
                            handleUpdateBanner(
                              banner.id,
                              "linkUrl",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
                          placeholder="Link khi click vào banner (VD: /products?category=xxx)"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={banner.isActive}
                              onChange={(e) =>
                                handleUpdateBanner(
                                  banner.id,
                                  "isActive",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                            />
                            <span className="text-[10px] font-bold text-gray-600">
                              Hiển thị
                            </span>
                          </label>
                          <button
                            onClick={() => handleRemoveBanner(banner.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Params Tab */}
          {activeTab === "params" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight border-b pb-3">
                Tham số hệ thống
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">
                    Thuế VAT (%)
                  </label>
                  <input
                    type="number"
                    value={config.vatRate}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        vatRate: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-black text-lg focus:border-secondary outline-none"
                    max={100}
                  />
                  <p className="text-[9px] text-gray-400 mt-2">
                    Áp dụng cho tất cả đơn hàng
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">
                    Cảnh báo tồn kho thấp
                  </label>
                  <input
                    type="number"
                    value={config.lowStockThreshold}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lowStockThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-black text-lg focus:border-secondary outline-none"
                  />
                  <p className="text-[9px] text-gray-400 mt-2">
                    Thông báo khi tồn kho &lt; số này
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">
                    Thời hạn đổi trả mặc định (ngày)
                  </label>
                  <select
                    value={config.returnPeriodDays || 7}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        returnPeriodDays: parseInt(e.target.value) || 7,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-black text-lg focus:border-secondary outline-none"
                  >
                    <option value={7}>7 ngày</option>
                    <option value={14}>14 ngày</option>
                    <option value={30}>30 ngày</option>
                  </select>
                  <p className="text-[9px] text-gray-400 mt-2">
                    Giá trị mặc định khi tạo sản phẩm mới (có thể thay đổi cho
                    từng sản phẩm)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
