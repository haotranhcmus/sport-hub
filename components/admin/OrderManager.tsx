import { Order, OrderStatus } from "../../types";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Calendar,
  FilterX,
  RefreshCw,
  Eye,
  CheckCircle,
  User,
  CreditCard,
  Clock,
  Truck,
  ShieldCheck,
  Box,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { api } from "../../services";
import { AdminOrderDetailModal } from "./AdminOrderDetailModal";
import { getOrderStatusLabel } from "../../utils/helpers";
import { useOrders } from "../../hooks/useOrdersQuery";

type StatusGroup = "all" | "new" | "processing" | "finished" | "support";

export const OrderListManager = () => {
  // Use TanStack Query for orders
  const { data: orders = [], isLoading: loading, refetch } = useOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal State
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters State
  const [activeTab, setActiveTab] = useState<StatusGroup>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // No need for manual fetchOrders - TanStack Query handles it

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    activeTab,
    paymentFilter,
    customerFilter,
    dateFrom,
    dateTo,
    pageSize,
  ]);

  // Update viewingOrder when orders change
  useEffect(() => {
    if (viewingOrder && orders.length > 0) {
      const updated = orders.find((o) => o.id === viewingOrder.id);
      if (updated) setViewingOrder(JSON.parse(JSON.stringify(updated)));
    }
  }, [orders]);

  const handleQuickConfirm = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (!confirm("Xác nhận đơn hàng này và chuyển sang Đóng gói?")) return;
    setActionLoading(true);
    try {
      const res = await api.orders.updateOrderStatus(
        orderId,
        OrderStatus.PACKING
      );
      if (res) await refetch();
    } catch (err) {
      alert("Lỗi xử lý.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenModal = (order: Order) => {
    setViewingOrder(JSON.parse(JSON.stringify(order)));
  };

  const getStatusUI = (status: OrderStatus) => {
    const label = getOrderStatusLabel(status);
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return {
          label,
          css: "bg-orange-100 text-orange-700",
          icon: <Clock size={12} />,
        };
      case OrderStatus.PENDING_CONFIRMATION:
        return {
          label,
          css: "bg-blue-100 text-blue-700",
          icon: <ShieldCheck size={12} />,
        };
      case OrderStatus.PACKING:
        return {
          label,
          css: "bg-indigo-100 text-indigo-700",
          icon: <Box size={12} />,
        };
      case OrderStatus.SHIPPING:
        return {
          label,
          css: "bg-purple-100 text-purple-700",
          icon: <Truck size={12} />,
        };
      case OrderStatus.COMPLETED:
        return {
          label,
          css: "bg-green-100 text-green-700",
          icon: <CheckCircle size={12} />,
        };
      case OrderStatus.CANCELLED:
        return {
          label,
          css: "bg-red-100 text-red-700",
          icon: <XCircle size={12} />,
        };
      case OrderStatus.DELIVERY_FAILED:
        return {
          label,
          css: "bg-rose-100 text-rose-700",
          icon: <AlertTriangle size={12} />,
        };
      case OrderStatus.RETURN_REQUESTED:
        return {
          label,
          css: "bg-yellow-100 text-yellow-800",
          icon: <RotateCcw size={12} />,
        };
      default:
        return {
          label: status,
          css: "bg-gray-100 text-gray-700",
          icon: <Box size={12} />,
        };
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesSearch =
          !searchQuery ||
          o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerPhone.includes(searchQuery);
        if (!matchesSearch) return false;

        const newStatuses = [
          OrderStatus.PENDING_PAYMENT,
          OrderStatus.PENDING_CONFIRMATION,
        ];
        const processingStatuses = [OrderStatus.PACKING, OrderStatus.SHIPPING];
        const finishedStatuses = [
          OrderStatus.COMPLETED,
          OrderStatus.CANCELLED,
          OrderStatus.DELIVERY_FAILED,
        ];
        const supportStatuses = [
          OrderStatus.RETURN_REQUESTED,
          OrderStatus.RETURN_PROCESSING,
          OrderStatus.RETURN_COMPLETED,
        ];

        if (activeTab === "new" && !newStatuses.includes(o.status))
          return false;
        if (
          activeTab === "processing" &&
          !processingStatuses.includes(o.status)
        )
          return false;
        if (activeTab === "finished" && !finishedStatuses.includes(o.status))
          return false;
        if (activeTab === "support" && !supportStatuses.includes(o.status))
          return false;

        if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter)
          return false;
        if (customerFilter !== "all" && o.customerType !== customerFilter)
          return false;

        const orderDate = new Date(o.createdAt);
        if (dateFrom && orderDate < new Date(dateFrom)) return false;
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (orderDate > toDate) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [
    orders,
    searchQuery,
    activeTab,
    paymentFilter,
    customerFilter,
    dateFrom,
    dateTo,
  ]);

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchQuery("");
    setPaymentFilter("all");
    setCustomerFilter("all");
    setDateFrom("");
    setDateTo("");
    setActiveTab("all");
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">
            Quản lý đơn hàng
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Xử lý giao dịch & vận hành đơn
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
          <StatusTab
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            label="Tất cả"
            count={orders.length}
          />
          <StatusTab
            active={activeTab === "new"}
            onClick={() => setActiveTab("new")}
            label="Đơn mới"
            color="blue"
            count={
              orders.filter((o) =>
                [
                  OrderStatus.PENDING_PAYMENT,
                  OrderStatus.PENDING_CONFIRMATION,
                ].includes(o.status)
              ).length
            }
          />
          <StatusTab
            active={activeTab === "processing"}
            onClick={() => setActiveTab("processing")}
            label="Đang xử lý"
            color="indigo"
            count={
              orders.filter((o) =>
                [OrderStatus.PACKING, OrderStatus.SHIPPING].includes(o.status)
              ).length
            }
          />
          <StatusTab
            active={activeTab === "finished"}
            onClick={() => setActiveTab("finished")}
            label="Kết thúc"
            color="emerald"
            count={
              orders.filter((o) =>
                [
                  OrderStatus.COMPLETED,
                  OrderStatus.CANCELLED,
                  OrderStatus.DELIVERY_FAILED,
                ].includes(o.status)
              ).length
            }
          />
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Mã đơn / SĐT khách..."
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-secondary/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Thanh toán
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending_refund">Chờ hoàn tiền</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Loại khách hàng
            </label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase outline-none cursor-pointer"
            >
              <option value="all">Tất cả loại khách</option>
              <option value="member">Thành viên</option>
              <option value="guest">Khách vãng lai</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-xs font-black outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-xs font-black outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition"
          >
            <FilterX size={16} /> Bỏ lọc
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-black transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-6">Mã đơn / Ngày</th>
                <th className="px-6 py-6">Khách hàng</th>
                <th className="px-6 py-6 text-right">Tổng tiền</th>
                <th className="px-6 py-6 text-center">Thanh toán</th>
                <th className="px-6 py-6 text-center">Trạng thái</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentOrders.map((order) => {
                const statusUI = getStatusUI(order.status);
                return (
                  <tr
                    key={order.id}
                    onClick={() => handleOpenModal(order)}
                    className="hover:bg-gray-50/50 transition cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-secondary uppercase tracking-tight">
                        {order.orderCode}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-gray-800 uppercase leading-none">
                        {order.customerName}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        {order.customerPhone}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-right font-black text-red-600">
                      {order.totalAmount.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-sm ${
                          order.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "PENDING_REFUND"
                            ? "bg-orange-100 text-orange-700"
                            : order.paymentStatus === "REFUNDED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {order.paymentStatus === "PAID"
                          ? "Đã trả"
                          : order.paymentStatus === "PENDING_REFUND"
                          ? "Chờ hoàn"
                          : "Chưa trả"}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase shadow-sm ${statusUI.css}`}
                      >
                        {statusUI.icon} {statusUI.label}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition">
                        {order.status === OrderStatus.PENDING_CONFIRMATION && (
                          <button
                            onClick={(e) => handleQuickConfirm(e, order.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-green-500/20 active:scale-95 transition"
                            title="Duyệt nhanh"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(order);
                          }}
                          className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-xl shadow-sm transition transform hover:scale-110"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-24 text-center">
            <XCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">
              Không tìm thấy đơn hàng nào phù hợp
            </p>
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {viewingOrder && (
        <AdminOrderDetailModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onRefresh={() => refetch()}
        />
      )}
    </div>
  );
};

const StatusTab = ({ active, onClick, label, count, color = "slate" }: any) => {
  const colors: any = {
    slate: active
      ? "bg-slate-900 text-white"
      : "text-gray-400 hover:text-gray-600",
    blue: active
      ? "bg-secondary text-white shadow-xl shadow-blue-500/20"
      : "text-gray-400 hover:text-gray-600",
    indigo: active
      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
      : "text-gray-400 hover:text-gray-600",
    emerald: active
      ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20"
      : "text-gray-400 hover:text-gray-600",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${colors[color]}`}
    >
      {label}{" "}
      {count > 0 && (
        <span
          className={`px-2 py-0.5 rounded-full text-[8px] ${
            active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
