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
    <div className="space-y-10 animate-in fade-in">
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
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-700`}
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
    <div className="space-y-6 animate-in fade-in">
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
  const [activeTab, setActiveTab] = useState<"general" | "banners" | "params">(
    "general"
  );
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.system.getConfig().then(setConfig);
  }, []);

  const handleSave = async () => {
    if (!config || !currentUser) return;
    setIsSaving(true);
    try {
      await api.system.updateConfig(config, currentUser);
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi lưu cấu hình.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Cấu hình hệ thống
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Vận hành & Giao diện
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-10 py-4 bg-secondary text-white rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center gap-3"
        >
          {isSaving ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <>
              <Save size={18} /> Lưu cấu hình
            </>
          )}
        </button>
      </div>
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100">
          <nav className="p-4 space-y-2">
            <TabButton
              id="general"
              active={activeTab}
              onClick={setActiveTab}
              label="Thông tin chung"
              icon={<Monitor size={18} />}
            />
            <TabButton
              id="banners"
              active={activeTab}
              onClick={setActiveTab}
              label="Banners"
              icon={<ImageIcon size={18} />}
            />
            <TabButton
              id="params"
              active={activeTab}
              onClick={setActiveTab}
              label="Tham số"
              icon={<Settings size={18} />}
            />
          </nav>
        </div>
        <div className="flex-1 p-8 md:p-12">
          {activeTab === "general" && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <InputField
                    label="Tên cửa hàng *"
                    value={config.websiteTitle}
                    onChange={(v: string) =>
                      setConfig({ ...config, websiteTitle: v })
                    }
                  />
                  <InputField
                    label="Hotline *"
                    value={config.hotline}
                    onChange={(v: string) =>
                      setConfig({ ...config, hotline: v })
                    }
                  />
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-[40px] border-2 border-dashed">
                  <img
                    src={config.logoUrl}
                    className="w-24 h-24 mb-6 object-contain"
                    alt="Logo"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-white border rounded-xl text-[10px] font-black uppercase"
                  >
                    Thay đổi Logo
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "params" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-right-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                  VAT (%)
                </label>
                <input
                  type="number"
                  className="w-full border bg-gray-50 rounded-2xl px-5 py-4 font-black"
                  value={config.vatRate}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      vatRate: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
