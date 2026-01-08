import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Order, OrderStatus } from "../types";
import {
  User as UserIcon,
  Package,
  LogOut,
  Key,
  MapPin,
  Star,
  RefreshCw,
  Trash2,
  ChevronRight,
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  CreditCard,
  Calendar,
  Landmark,
  UserCheck,
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Truck,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Box,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services";

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const isStaff = user && user.role !== "CUSTOMER";
  const [activeTab, setActiveTab] = useState<string>(
    isStaff ? "work" : "orders"
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px] animate-in fade-in duration-500">
      <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="relative inline-block mb-4">
            <img
              src={
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user?.fullName}`
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full mx-auto border-4 border-gray-50 object-cover shadow-sm"
            />
            <div
              className={`absolute bottom-0 right-0 w-6 h-6 border-2 border-white rounded-full ${
                isStaff ? "bg-indigo-500" : "bg-green-500"
              }`}
            ></div>
          </div>
          <h2 className="font-bold text-xl text-gray-800">{user?.fullName}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div
            className={`mt-4 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
              isStaff ? "bg-slate-900 text-white" : "bg-blue-50 text-blue-600"
            }`}
          >
            {isStaff ? "NHÂN SỰ HỆ THỐNG" : "THÀNH VIÊN VÀNG"}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <nav className="flex flex-col">
            {!isStaff ? (
              <>
                <NavItem
                  icon={<Package size={18} />}
                  label="Lịch sử mua hàng"
                  active={activeTab === "orders"}
                  onClick={() => setActiveTab("orders")}
                />
                <NavItem
                  icon={<MapPin size={18} />}
                  label="Sổ địa chỉ"
                  active={activeTab === "addresses"}
                  onClick={() => setActiveTab("addresses")}
                />
                <NavItem
                  icon={<UserIcon size={18} />}
                  label="Thông tin cá nhân"
                  active={activeTab === "info"}
                  onClick={() => setActiveTab("info")}
                />
              </>
            ) : (
              <>
                <NavItem
                  icon={<Briefcase size={18} />}
                  label="Hồ sơ nhân sự"
                  active={activeTab === "work"}
                  onClick={() => setActiveTab("work")}
                />
                <NavItem
                  icon={<UserIcon size={18} />}
                  label="Thông tin cá nhân"
                  active={activeTab === "info"}
                  onClick={() => setActiveTab("info")}
                />
              </>
            )}
            <NavItem
              icon={<Key size={18} />}
              label="Đổi mật khẩu"
              active={activeTab === "password"}
              onClick={() => setActiveTab("password")}
            />
            <button
              onClick={logout}
              className="flex items-center gap-3 px-6 py-4 text-sm font-semibold text-red-500 hover:bg-red-50 transition border-t border-gray-50"
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          </nav>
        </div>
      </aside>

      <div className="flex-grow min-w-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 min-h-full">
          {activeTab === "orders" && !isStaff && <OrderHistory />}
          {activeTab === "addresses" && !isStaff && <AddressBook />}
          {activeTab === "info" && <ProfileInfo />}
          {activeTab === "work" && isStaff && <StaffWorkProfile />}
          {activeTab === "password" && <ChangePassword />}
        </div>
      </div>
    </div>
  );
};

const StaffWorkProfile = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-10 animate-in slide-in-from-right-4">
      <div>
        <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">
          Hồ sơ định danh nhân sự
        </h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
          Thông tin dành cho quản lý nội bộ
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard
          icon={<Landmark className="text-indigo-500" />}
          label="Mã nhân viên"
          value={user?.staffId || "ADMIN-001"}
        />
        <InfoCard
          icon={<CreditCard className="text-blue-500" />}
          label="Số CCCD / Định danh"
          value={user?.idCard || "001099XXXXXX"}
        />
        <InfoCard
          icon={<Briefcase className="text-orange-500" />}
          label="Chức vụ hiện tại"
          value={user?.position || "Quản trị viên"}
        />
        <InfoCard
          icon={<Building2 className="text-emerald-500" />}
          label="Phòng ban"
          value={user?.department || "Ban điều hành"}
        />
        <InfoCard
          icon={<Calendar className="text-pink-500" />}
          label="Ngày gia nhập"
          value={user?.joinDate || "01/01/2024"}
        />
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-5">
    <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-gray-800 uppercase">{value}</p>
    </div>
  </div>
);

const NavItem = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between gap-3 px-6 py-4 text-sm font-semibold transition ${
      active
        ? "bg-secondary/5 text-secondary border-r-4 border-secondary"
        : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon} <span>{label}</span>
    </div>
    {active && <ChevronRight size={14} />}
  </button>
);

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<
    "all" | OrderStatus | "returns"
  >("all");

  const fetchOrders = () => {
    setLoading(true);
    api.orders.list().then((res) => {
      setOrders(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 30 seconds to sync with admin updates
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const ORDER_TABS = [
    { id: "all", label: "Tất cả đơn" },
    // Fix shorthands S1-S6 to correct OrderStatus members
    { id: OrderStatus.PENDING_CONFIRMATION, label: "Chờ xác nhận" },
    { id: OrderStatus.PACKING, label: "Đóng gói" },
    { id: OrderStatus.SHIPPING, label: "Giao hàng" },
    { id: OrderStatus.COMPLETED, label: "Hoàn tất" },
    { id: OrderStatus.CANCELLED, label: "Đã hủy" },
    { id: "returns", label: "Đổi / Trả" },
  ];

  const filteredOrders = useMemo(() => {
    if (activeSubTab === "all") return orders;
    // Fix shorthands S8-S10
    if (activeSubTab === "returns")
      return orders.filter((o) =>
        [
          OrderStatus.RETURN_REQUESTED,
          OrderStatus.RETURN_PROCESSING,
          OrderStatus.RETURN_COMPLETED,
        ].includes(o.status)
      );
    return orders.filter((o) => o.status === activeSubTab);
  }, [orders, activeSubTab]);

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      // Fix shorthands S1-S10
      case OrderStatus.PENDING_PAYMENT:
        return {
          label: "Chờ trả tiền",
          css: "bg-orange-100 text-orange-700",
          icon: <Clock size={12} />,
        };
      case OrderStatus.PENDING_CONFIRMATION:
        return {
          label: "Chờ duyệt",
          css: "bg-blue-100 text-blue-700",
          icon: <ShieldCheck size={12} />,
        };
      case OrderStatus.PACKING:
        return {
          label: "Đang gói",
          css: "bg-indigo-100 text-indigo-700",
          icon: <Box size={12} />,
        };
      case OrderStatus.SHIPPING:
        return {
          label: "Đang giao",
          css: "bg-purple-100 text-purple-700",
          icon: <Truck size={12} />,
        };
      case OrderStatus.COMPLETED:
        return {
          label: "Hoàn tất",
          css: "bg-green-100 text-green-700",
          icon: <CheckCircle2 size={12} />,
        };
      case OrderStatus.CANCELLED:
        return {
          label: "Đã hủy",
          css: "bg-red-100 text-red-700",
          icon: <XCircle size={12} />,
        };
      case OrderStatus.RETURN_REQUESTED:
        return {
          label: "Chờ Đổi/Trá",
          css: "bg-yellow-100 text-yellow-800",
          icon: <RotateCcw size={12} />,
        };
      case OrderStatus.RETURN_PROCESSING:
        return {
          label: "Đang đổi/trả",
          css: "bg-blue-50 text-blue-600",
          icon: <RefreshCw size={12} className="animate-spin-slow" />,
        };
      case OrderStatus.RETURN_COMPLETED:
        return {
          label: "Đã trả hàng",
          css: "bg-teal-100 text-teal-800",
          icon: <RotateCcw size={12} />,
        };
      default:
        return {
          label: status,
          css: "bg-gray-100 text-gray-700",
          icon: <Package size={12} />,
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tight">
            Lịch sử đơn hàng
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Theo dõi và quản lý giao dịch
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
          title="Làm mới danh sách"
        >
          <RefreshCw
            size={18}
            className={`text-gray-400 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="relative">
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
          {ORDER_TABS.map((tab) => {
            // Fix shorthands S8-S10
            const count = orders.filter((o) =>
              tab.id === "all"
                ? true
                : tab.id === "returns"
                ? [
                    OrderStatus.RETURN_REQUESTED,
                    OrderStatus.RETURN_PROCESSING,
                    OrderStatus.RETURN_COMPLETED,
                  ].includes(o.status)
                : o.status === tab.id
            ).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 md:px-5 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 relative shrink-0 ${
                  activeSubTab === tab.id
                    ? "text-secondary border-secondary"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] ${
                      activeSubTab === tab.id
                        ? "bg-secondary text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw
            className="animate-spin mx-auto text-secondary mb-4"
            size={32}
          />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 animate-in zoom-in-95 mx-2">
          <ShoppingBag size={40} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Không có đơn hàng nào
          </h3>
          <Link
            to="/products"
            className="mt-6 inline-block px-8 py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusDisplay(order.status);
            const firstItem = order.items[0];
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-[24px] hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-secondary shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-800 uppercase tracking-tight">
                          {order.orderCode}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap ${statusInfo.css}`}
                    >
                      {statusInfo.icon} {statusInfo.label}
                    </div>
                  </div>

                  <div className="flex gap-4 items-center mb-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                      <img
                        src={
                          firstItem.thumbnailUrl ||
                          "https://picsum.photos/200/200"
                        }
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-800 uppercase text-xs line-clamp-1">
                        {firstItem.productName}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        {firstItem.color} / {firstItem.size}
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase">
                        Số lượng:{" "}
                        <span className="text-gray-800">
                          {firstItem.quantity}
                        </span>
                      </p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Tổng tiền
                      </p>
                      <p className="font-black text-base text-red-600 tracking-tighter">
                        {order.totalAmount.toLocaleString()}đ
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-50 gap-4">
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="p-1.5 bg-blue-50 text-secondary rounded-lg">
                        <CreditCard size={12} />
                      </div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        {order.paymentMethod === "COD" ? "Tiền mặt" : "Online"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/orders/${order.orderCode}`)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Eye size={12} /> CHI TIẾT
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AddressBook = () => {
  const { user, removeAddress, setDefaultAddress } = useAuth();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
        Sổ địa chỉ
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {user?.addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-8 border-2 rounded-[32px] transition ${
              addr.isDefault
                ? "border-secondary bg-blue-50/30"
                : "border-gray-50"
            }`}
          >
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-black text-gray-800 uppercase">
                  {addr.name}{" "}
                  {addr.isDefault && (
                    <span className="text-[8px] bg-secondary text-white px-2 py-0.5 rounded-full ml-2">
                      Mặc định
                    </span>
                  )}
                </h3>
                <p className="text-sm font-bold text-gray-500 mt-1">
                  {addr.phone}
                </p>
              </div>
              <div className="flex gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-[9px] font-black text-secondary uppercase hover:underline"
                  >
                    Mặc định
                  </button>
                )}
                <button
                  onClick={() => removeAddress(addr.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium">{addr.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileInfo = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });
  const handleSave = () => {
    updateProfile(formData);
    alert("Cập nhật thành công!");
  };
  return (
    <div className="space-y-10 max-w-2xl animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
        Thông tin tài khoản
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InputField
          label="Họ và tên"
          value={formData.fullName}
          onChange={(v: any) => setFormData({ ...formData, fullName: v })}
        />
        <InputField
          label="Email (Không thể sửa)"
          value={user?.email || ""}
          disabled
        />
        <InputField
          label="Số điện thoại"
          value={formData.phone}
          onChange={(v: any) => setFormData({ ...formData, phone: v })}
        />
      </div>
      <button
        onClick={handleSave}
        className="px-12 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-600 transition"
      >
        Cập nhật
      </button>
    </div>
  );
};

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleUpdate = async () => {
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      alert("Vui lòng điền đầy đủ mật khẩu.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert("Mật khẩu không trùng khớp.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Đổi mật khẩu thành công!");
      setPasswords({ old: "", new: "", confirm: "" });
    }, 1000);
  };
  return (
    <div className="space-y-10 max-md animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
        Đổi mật khẩu
      </h2>
      <div className="space-y-6 bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 relative">
        <button
          onClick={() => setShowPass(!showPass)}
          className="absolute top-4 right-4 p-2 text-gray-300"
        >
          {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <InputField
          label="Mật khẩu hiện tại"
          type={showPass ? "text" : "password"}
          value={passwords.old}
          onChange={(v: string) => setPasswords({ ...passwords, old: v })}
        />
        <InputField
          label="Mật khẩu mới"
          type={showPass ? "text" : "password"}
          value={passwords.new}
          onChange={(v: string) => setPasswords({ ...passwords, new: v })}
        />
        <InputField
          label="Xác nhận mật khẩu mới"
          type={showPass ? "text" : "password"}
          value={passwords.confirm}
          onChange={(v: string) => setPasswords({ ...passwords, confirm: v })}
        />
      </div>
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-black transition flex items-center justify-center gap-3"
      >
        {loading ? (
          <RefreshCw size={18} className="animate-spin" />
        ) : (
          <>
            <ShieldCheck size={18} /> Cập nhật
          </>
        )}
      </button>
    </div>
  );
};

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  disabled,
}: any) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={`w-full border border-gray-100 bg-white rounded-2xl px-5 py-4 outline-none transition font-black text-sm ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-50"
          : "focus:ring-2 focus:ring-secondary/10"
      }`}
    />
  </div>
);
