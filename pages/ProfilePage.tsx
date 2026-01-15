import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Order, OrderStatus, UserAddress } from "../types";
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
  Plus,
  Edit3,
  Check,
  ChevronDown,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { api, userService } from "../services";

// Vietnam location data (simplified - in production, use API)
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

const DISTRICTS: Record<string, { code: string; name: string }[]> = {
  "01": [
    { code: "001", name: "Ba Đình" },
    { code: "002", name: "Hoàn Kiếm" },
    { code: "003", name: "Tây Hồ" },
    { code: "004", name: "Long Biên" },
    { code: "005", name: "Cầu Giấy" },
    { code: "006", name: "Đống Đa" },
    { code: "007", name: "Hai Bà Trưng" },
    { code: "008", name: "Hoàng Mai" },
    { code: "009", name: "Thanh Xuân" },
  ],
  "79": [
    { code: "760", name: "Quận 1" },
    { code: "761", name: "Quận 3" },
    { code: "762", name: "Quận 4" },
    { code: "763", name: "Quận 5" },
    { code: "764", name: "Quận 6" },
    { code: "765", name: "Quận 7" },
    { code: "766", name: "Quận 8" },
    { code: "767", name: "Quận 10" },
    { code: "768", name: "Quận 11" },
    { code: "769", name: "Quận 12" },
    { code: "770", name: "Bình Thạnh" },
    { code: "771", name: "Gò Vấp" },
    { code: "772", name: "Phú Nhuận" },
    { code: "773", name: "Tân Bình" },
    { code: "774", name: "Tân Phú" },
    { code: "775", name: "Thủ Đức" },
    { code: "776", name: "Bình Tân" },
  ],
  "48": [
    { code: "490", name: "Hải Châu" },
    { code: "491", name: "Thanh Khê" },
    { code: "492", name: "Sơn Trà" },
    { code: "493", name: "Ngũ Hành Sơn" },
    { code: "494", name: "Liên Chiểu" },
    { code: "495", name: "Cẩm Lệ" },
  ],
};

const WARDS: Record<string, { code: string; name: string }[]> = {
  "760": [
    { code: "26734", name: "Phường Bến Nghé" },
    { code: "26737", name: "Phường Bến Thành" },
    { code: "26740", name: "Phường Cầu Kho" },
    { code: "26743", name: "Phường Cầu Ông Lãnh" },
    { code: "26746", name: "Phường Cô Giang" },
    { code: "26749", name: "Phường Đa Kao" },
    { code: "26752", name: "Phường Nguyễn Cư Trinh" },
    { code: "26755", name: "Phường Nguyễn Thái Bình" },
    { code: "26758", name: "Phường Phạm Ngũ Lão" },
    { code: "26761", name: "Phường Tân Định" },
  ],
  "770": [
    { code: "26830", name: "Phường 1" },
    { code: "26833", name: "Phường 2" },
    { code: "26836", name: "Phường 3" },
    { code: "26839", name: "Phường 5" },
    { code: "26842", name: "Phường 6" },
    { code: "26845", name: "Phường 7" },
    { code: "26848", name: "Phường 11" },
    { code: "26851", name: "Phường 12" },
    { code: "26854", name: "Phường 13" },
    { code: "26857", name: "Phường 14" },
    { code: "26860", name: "Phường 15" },
    { code: "26863", name: "Phường 17" },
    { code: "26866", name: "Phường 19" },
    { code: "26869", name: "Phường 21" },
    { code: "26872", name: "Phường 22" },
    { code: "26875", name: "Phường 24" },
    { code: "26878", name: "Phường 25" },
    { code: "26881", name: "Phường 26" },
    { code: "26884", name: "Phường 27" },
    { code: "26887", name: "Phường 28" },
  ],
  "771": [
    { code: "26890", name: "Phường 1" },
    { code: "26893", name: "Phường 3" },
    { code: "26896", name: "Phường 4" },
    { code: "26899", name: "Phường 5" },
    { code: "26902", name: "Phường 6" },
    { code: "26905", name: "Phường 7" },
    { code: "26908", name: "Phường 8" },
    { code: "26911", name: "Phường 9" },
    { code: "26914", name: "Phường 10" },
    { code: "26917", name: "Phường 11" },
    { code: "26920", name: "Phường 12" },
    { code: "26923", name: "Phường 13" },
    { code: "26926", name: "Phường 14" },
    { code: "26929", name: "Phường 15" },
    { code: "26932", name: "Phường 16" },
    { code: "26935", name: "Phường 17" },
  ],
  "001": [
    { code: "00001", name: "Phường Phúc Xá" },
    { code: "00004", name: "Phường Trúc Bạch" },
    { code: "00007", name: "Phường Vĩnh Phúc" },
    { code: "00010", name: "Phường Cống Vị" },
    { code: "00013", name: "Phường Liễu Giai" },
    { code: "00016", name: "Phường Nguyễn Trung Trực" },
    { code: "00019", name: "Phường Quán Thánh" },
    { code: "00022", name: "Phường Ngọc Hà" },
    { code: "00025", name: "Phường Điện Biên" },
    { code: "00028", name: "Phường Đội Cấn" },
    { code: "00031", name: "Phường Ngọc Khánh" },
    { code: "00034", name: "Phường Kim Mã" },
    { code: "00037", name: "Phường Giảng Võ" },
    { code: "00040", name: "Phường Thành Công" },
  ],
};

// Calculate shipping fee based on location
const calculateShippingFee = (provinceCode?: string): number => {
  if (!provinceCode) return 0;
  // HCM and Hanoi - cheaper shipping
  if (provinceCode === "79" || provinceCode === "01") return 25000;
  // Major cities
  if (["48", "31", "92"].includes(provinceCode)) return 35000;
  // Other provinces
  return 45000;
};

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
  const { user, addAddress, updateAddress, removeAddress, setDefaultAddress } =
    useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<UserAddress>>({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Get districts for selected province
  const availableDistricts = formData.provinceCode
    ? DISTRICTS[formData.provinceCode] || []
    : [];
  // Get wards for selected district
  const availableWards = formData.districtCode
    ? WARDS[formData.districtCode] || []
    : [];

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Vui lòng nhập tên người nhận";
    } else if (formData.name.length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)";
    }

    if (!formData.provinceCode) {
      newErrors.province = "Vui lòng chọn Tỉnh/Thành phố";
    }
    if (!formData.districtCode) {
      newErrors.district = "Vui lòng chọn Quận/Huyện";
    }
    if (!formData.wardCode) {
      newErrors.ward = "Vui lòng chọn Phường/Xã";
    }
    if (!formData.address?.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ chi tiết";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProvinceChange = (code: string) => {
    const province = PROVINCES.find((p) => p.code === code);
    setFormData({
      ...formData,
      provinceCode: code,
      city: province?.name || "",
      districtCode: "",
      district: "",
      wardCode: "",
      ward: "",
    });
    setErrors({ ...errors, province: "" });
  };

  const handleDistrictChange = (code: string) => {
    const district = availableDistricts.find((d) => d.code === code);
    setFormData({
      ...formData,
      districtCode: code,
      district: district?.name || "",
      wardCode: "",
      ward: "",
    });
    setErrors({ ...errors, district: "" });
  };

  const handleWardChange = (code: string) => {
    const ward = availableWards.find((w) => w.code === code);
    setFormData({
      ...formData,
      wardCode: code,
      ward: ward?.name || "",
    });
    setErrors({ ...errors, ward: "" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      provinceCode: "",
      districtCode: "",
      wardCode: "",
      isDefault: false,
    });
    setErrors({});
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city || "",
      district: addr.district || "",
      ward: addr.ward || "",
      provinceCode: addr.provinceCode || "",
      districtCode: addr.districtCode || "",
      wardCode: addr.wardCode || "",
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const addressData: UserAddress = {
        id: editingAddress?.id || crypto.randomUUID(),
        name: formData.name!,
        phone: formData.phone!,
        address: formData.address!,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        provinceCode: formData.provinceCode,
        districtCode: formData.districtCode,
        wardCode: formData.wardCode,
        isDefault: formData.isDefault || false,
      };

      if (editingAddress) {
        await updateAddress(addressData);
        showNotification("success", "Cập nhật địa chỉ thành công!");
      } else {
        await addAddress(addressData);
        showNotification("success", "Thêm địa chỉ thành công!");
      }
      resetForm();
    } catch (error: any) {
      showNotification("error", error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await removeAddress(id);
      showNotification("success", "Đã xóa địa chỉ!");
    } catch (error: any) {
      showNotification("error", error.message || "Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      showNotification("success", "Đã đặt làm địa chỉ mặc định!");
    } catch (error: any) {
      showNotification("error", error.message || "Có lỗi xảy ra");
    }
  };

  const getFullAddress = (addr: UserAddress) => {
    const parts = [addr.address, addr.ward, addr.district, addr.city].filter(
      Boolean
    );
    return parts.join(", ");
  };

  return (
    <div className="space-y-6 animate-in fade-in">
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
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Sổ địa chỉ
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-600 transition"
        >
          <Plus size={16} /> Thêm địa chỉ
        </button>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-800 uppercase">
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Tên người nhận *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder="Nhập họ và tên"
                    className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] font-bold mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: value });
                      setErrors({ ...errors, phone: "" });
                    }}
                    placeholder="Nhập số điện thoại"
                    maxLength={11}
                    className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm ${
                      errors.phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[10px] font-bold mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Province / District / Ward selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.provinceCode}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm appearance-none bg-white ${
                        errors.province
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                      }`}
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                  {errors.province && (
                    <p className="text-red-500 text-[10px] font-bold mt-1">
                      {errors.province}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Quận/Huyện *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.districtCode}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      disabled={!formData.provinceCode}
                      className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.district
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                      }`}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {availableDistricts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                  {errors.district && (
                    <p className="text-red-500 text-[10px] font-bold mt-1">
                      {errors.district}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Phường/Xã *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.wardCode}
                      onChange={(e) => handleWardChange(e.target.value)}
                      disabled={!formData.districtCode}
                      className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.ward
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                      }`}
                    >
                      <option value="">Chọn phường/xã</option>
                      {availableWards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                  {errors.ward && (
                    <p className="text-red-500 text-[10px] font-bold mt-1">
                      {errors.ward}
                    </p>
                  )}
                </div>
              </div>

              {/* Detailed address */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Địa chỉ chi tiết *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setErrors({ ...errors, address: "" });
                  }}
                  placeholder="Số nhà, tên đường..."
                  className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm ${
                    errors.address
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-[10px] font-bold mt-1">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Set as default */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                <span className="text-sm font-bold text-gray-600">
                  Đặt làm địa chỉ mặc định
                </span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-6 flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-secondary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {editingAddress ? "Lưu thay đổi" : "Thêm địa chỉ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      {user?.addresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
            Chưa có địa chỉ nào
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Thêm địa chỉ để việc đặt hàng nhanh hơn
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-600 transition"
          >
            Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {user?.addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 border-2 rounded-2xl transition group hover:shadow-lg ${
                addr.isDefault
                  ? "border-secondary bg-blue-50/30"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      addr.isDefault ? "bg-secondary" : "bg-gray-100"
                    }`}
                  >
                    <MapPin
                      size={18}
                      className={
                        addr.isDefault ? "text-white" : "text-gray-400"
                      }
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 uppercase flex items-center gap-2">
                      {addr.name}
                      {addr.isDefault && (
                        <span className="text-[8px] bg-secondary text-white px-2 py-0.5 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </h3>
                    <p className="text-sm font-bold text-gray-500 mt-0.5">
                      {addr.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="px-3 py-1.5 text-[9px] font-black text-secondary uppercase bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(addr)}
                    className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {getFullAddress(addr)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileInfo = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName)) {
      newErrors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09)";
    } else {
      // Check phone uniqueness (only if phone changed)
      if (formData.phone !== user?.phone) {
        try {
          const exists = await userService.checkPhoneExists(
            formData.phone,
            user?.id
          );
          if (exists) {
            newErrors.phone =
              "Số điện thoại này đã được sử dụng bởi tài khoản khác";
          }
        } catch (error) {
          console.error("Error checking phone:", error);
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setLoading(true);
    const isValid = await validateForm();

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      await updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone,
      });
      showNotification("success", "Cập nhật thông tin thành công!");
    } catch (error: any) {
      showNotification("error", error.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-2xl animate-in slide-in-from-right-4">
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
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
          Thông tin tài khoản
        </h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          Quản lý thông tin cá nhân của bạn
        </p>
      </div>

      <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
          <img
            src={
              user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                formData.fullName
              )}&background=3b82f6&color=fff&size=128`
            }
            alt="Avatar"
            className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
          />
          <div>
            <p className="font-black text-gray-800 text-lg">
              {formData.fullName || "Chưa có tên"}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Họ và tên *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                setErrors({ ...errors, fullName: "" });
              }}
              placeholder="Nhập họ và tên"
              className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm bg-white ${
                errors.fullName
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              }`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-[10px] font-bold mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Email <span className="text-gray-300">(Không thể sửa)</span>
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-3 outline-none font-semibold text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, phone: value });
                setErrors({ ...errors, phone: "" });
              }}
              placeholder="Nhập số điện thoại (VD: 0901234567)"
              maxLength={11}
              className={`w-full border rounded-xl px-4 py-3 outline-none transition font-semibold text-sm bg-white ${
                errors.phone
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-[10px] font-bold mt-1">
                {errors.phone}
              </p>
            )}
            <p className="text-[9px] text-gray-400 mt-1">
              Số điện thoại dùng để nhận thông báo đơn hàng và liên hệ giao hàng
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Vai trò
            </label>
            <div className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-3 font-semibold text-sm text-gray-500">
              {user?.role === "CUSTOMER"
                ? "Khách hàng"
                : user?.role === "ADMIN"
                ? "Quản trị viên"
                : user?.role}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-12 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-3"
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Đang lưu...
          </>
        ) : (
          <>
            <Check size={16} />
            Cập nhật thông tin
          </>
        )}
      </button>
    </div>
  );
};

const ChangePassword = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Password strength calculation
  const getPasswordStrength = (
    password: string
  ): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 1) return { score, label: "Yếu", color: "bg-red-500" };
    if (score <= 2)
      return { score, label: "Trung bình", color: "bg-yellow-500" };
    if (score <= 3) return { score, label: "Khá", color: "bg-blue-500" };
    return { score, label: "Mạnh", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwords.new);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwords.old) {
      newErrors.old = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwords.new) {
      newErrors.new = "Vui lòng nhập mật khẩu mới";
    } else if (passwords.new.length < 8) {
      newErrors.new = "Mật khẩu mới phải có ít nhất 8 ký tự";
    } else if (passwords.new === passwords.old) {
      newErrors.new = "Mật khẩu mới phải khác mật khẩu cũ";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.new)) {
      newErrors.new = "Mật khẩu phải có chữ thường, chữ hoa và số";
    }

    if (!passwords.confirm) {
      newErrors.confirm = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwords.confirm !== passwords.new) {
      newErrors.confirm = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await userService.changePassword(user!.id, passwords.old, passwords.new);
      showNotification("success", "Đổi mật khẩu thành công!");
      setPasswords({ old: "", new: "", confirm: "" });
      setErrors({});
    } catch (error: any) {
      showNotification(
        "error",
        error.message || "Có lỗi xảy ra khi đổi mật khẩu"
      );
      if (error.message?.includes("cũ")) {
        setErrors({ ...errors, old: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-xl animate-in slide-in-from-right-4">
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
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
          Đổi mật khẩu
        </h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          Bảo mật tài khoản của bạn
        </p>
      </div>

      <div className="space-y-6 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
        {/* Current Password */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Mật khẩu hiện tại *
          </label>
          <div className="relative">
            <input
              type={showPass.old ? "text" : "password"}
              value={passwords.old}
              onChange={(e) => {
                setPasswords({ ...passwords, old: e.target.value });
                setErrors({ ...errors, old: "" });
              }}
              placeholder="Nhập mật khẩu hiện tại"
              className={`w-full border rounded-xl px-4 py-3 pr-12 outline-none transition font-semibold text-sm bg-white ${
                errors.old
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPass({ ...showPass, old: !showPass.old })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass.old ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.old && (
            <p className="text-red-500 text-[10px] font-bold mt-1">
              {errors.old}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Mật khẩu mới *
          </label>
          <div className="relative">
            <input
              type={showPass.new ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => {
                setPasswords({ ...passwords, new: e.target.value });
                setErrors({ ...errors, new: "" });
              }}
              placeholder="Nhập mật khẩu mới"
              className={`w-full border rounded-xl px-4 py-3 pr-12 outline-none transition font-semibold text-sm bg-white ${
                errors.new
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.new && (
            <p className="text-red-500 text-[10px] font-bold mt-1">
              {errors.new}
            </p>
          )}

          {/* Password strength indicator */}
          {passwords.new && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Độ mạnh mật khẩu
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${
                    passwordStrength.score <= 1
                      ? "text-red-500"
                      : passwordStrength.score <= 2
                      ? "text-yellow-600"
                      : passwordStrength.score <= 3
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <ul className="mt-2 space-y-1 text-[9px] text-gray-400">
                <li
                  className={`flex items-center gap-1 ${
                    passwords.new.length >= 8 ? "text-green-500" : ""
                  }`}
                >
                  {passwords.new.length >= 8 ? (
                    <Check size={10} />
                  ) : (
                    <X size={10} />
                  )}
                  Ít nhất 8 ký tự
                </li>
                <li
                  className={`flex items-center gap-1 ${
                    /[A-Z]/.test(passwords.new) && /[a-z]/.test(passwords.new)
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  {/[A-Z]/.test(passwords.new) &&
                  /[a-z]/.test(passwords.new) ? (
                    <Check size={10} />
                  ) : (
                    <X size={10} />
                  )}
                  Có chữ hoa và chữ thường
                </li>
                <li
                  className={`flex items-center gap-1 ${
                    /\d/.test(passwords.new) ? "text-green-500" : ""
                  }`}
                >
                  {/\d/.test(passwords.new) ? (
                    <Check size={10} />
                  ) : (
                    <X size={10} />
                  )}
                  Có ít nhất 1 số
                </li>
                <li
                  className={`flex items-center gap-1 ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new)
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  {/[!@#$%^&*(),.?":{}|<>]/.test(passwords.new) ? (
                    <Check size={10} />
                  ) : (
                    <X size={10} />
                  )}
                  Có ký tự đặc biệt (khuyến khích)
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Xác nhận mật khẩu mới *
          </label>
          <div className="relative">
            <input
              type={showPass.confirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) => {
                setPasswords({ ...passwords, confirm: e.target.value });
                setErrors({ ...errors, confirm: "" });
              }}
              placeholder="Nhập lại mật khẩu mới"
              className={`w-full border rounded-xl px-4 py-3 pr-12 outline-none transition font-semibold text-sm bg-white ${
                errors.confirm
                  ? "border-red-300 bg-red-50"
                  : passwords.confirm && passwords.confirm === passwords.new
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              }`}
            />
            <button
              type="button"
              onClick={() =>
                setShowPass({ ...showPass, confirm: !showPass.confirm })
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {passwords.confirm && passwords.confirm === passwords.new && (
              <Check
                size={18}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500"
              />
            )}
          </div>
          {errors.confirm && (
            <p className="text-red-500 text-[10px] font-bold mt-1">
              {errors.confirm}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-black transition flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw size={18} className="animate-spin" />
        ) : (
          <>
            <ShieldCheck size={18} /> Đổi mật khẩu
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
