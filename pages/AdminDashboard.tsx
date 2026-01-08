import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  LogOut,
  X,
  Briefcase,
  Settings,
  ArrowUpCircle,
  PackageOpen,
  ClipboardList,
  ShieldAlert,
  TrendingUp,
  Warehouse,
  Wrench,
  Menu,
  Ruler,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Import Separated Components
import { SidebarItem } from "../components/admin/SharedUI";
import { DashboardView } from "../components/admin/DashboardHome";
import { OrderListManager } from "../components/admin/OrderManager";
import { ProductConfigManager } from "../components/admin/ProductConfig";
import { ProductManager } from "../components/admin/ProductManager";
import { SupplierManager } from "../components/admin/SupplierManager";
import { ReportsManager } from "../components/admin/BusinessReports";
import {
  InventoryReportManager,
  StocktakeManager,
} from "../components/admin/InventorySystem";
import { InventoryManager } from "../components/admin/StockEntrySystem";
import { StockIssueManager } from "../components/admin/StockIssueSystem";
import {
  SystemManager,
  AuditLogsView,
  SystemConfigManager,
} from "../components/admin/SystemAdmin";
import { SizeGuideManager } from "../components/admin/SizeGuideManager";
import { ReturnManager } from "../components/admin/ReturnManager";

// ================= TYPES =================
type ViewType =
  | "dashboard"
  | "sales"
  | "returns"
  | "products"
  | "inventory"
  | "stock_issue"
  | "stock_count"
  | "audit_logs"
  | "system"
  | "product_config"
  | "suppliers"
  | "reports"
  | "inventory_report"
  | "system_config"
  | "size_guides";

export const AdminDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  console.log("🎛️ [AdminDashboard] Current view:", activeView);
  console.log("👤 [AdminDashboard] User:", user?.fullName, user?.role);

  return (
    <div className="flex justify-center h-[calc(100vh-64px)] bg-gray-100 overflow-hidden relative text-slate-900">
      <div className="flex w-full max-w-[2000px]">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <aside
          className={`absolute md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 transform ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user?.fullName}`
                }
                className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                alt="Admin"
              />
              <div>
                <p className="font-bold text-sm text-gray-800">
                  {user?.fullName}
                </p>
                <p className="text-[10px] text-gray-400 font-black uppercase">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Tổng quan"
              active={activeView === "dashboard"}
              onClick={() => {
                setActiveView("dashboard");
                setIsSidebarOpen(false);
              }}
            />

            <div className="pt-4 pb-1 pl-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Kinh doanh
            </div>
            <SidebarItem
              icon={<ShoppingCart size={18} />}
              label="Đơn hàng"
              active={activeView === "sales"}
              onClick={() => {
                setActiveView("sales");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<RotateCcw size={18} />}
              label="Quản lý Đổi/Trả"
              active={activeView === "returns"}
              onClick={() => {
                setActiveView("returns");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<TrendingUp size={18} />}
              label="Báo cáo doanh thu"
              active={activeView === "reports"}
              onClick={() => {
                setActiveView("reports");
                setIsSidebarOpen(false);
              }}
            />

            <div className="pt-4 pb-1 pl-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Hàng hóa & Kho
            </div>
            <SidebarItem
              icon={<Package size={18} />}
              label="Sản phẩm & SKU"
              active={activeView === "products"}
              onClick={() => {
                setActiveView("products");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<Ruler size={18} />}
              label="Bảng Size"
              active={activeView === "size_guides"}
              onClick={() => {
                setActiveView("size_guides");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<Settings size={18} />}
              label="Phân loại / Hiệu"
              active={activeView === "product_config"}
              onClick={() => {
                setActiveView("product_config");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<Briefcase size={18} />}
              label="Nhà cung cấp"
              active={activeView === "suppliers"}
              onClick={() => {
                setActiveView("suppliers");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<ArrowUpCircle size={18} />}
              label="Nhập kho"
              active={activeView === "inventory"}
              onClick={() => {
                setActiveView("inventory");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<PackageOpen size={18} />}
              label="Xuất kho"
              active={activeView === "stock_issue"}
              onClick={() => {
                setActiveView("stock_issue");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<ClipboardList size={18} />}
              label="Kiểm kê"
              active={activeView === "stock_count"}
              onClick={() => {
                setActiveView("stock_count");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<Warehouse size={18} />}
              label="Báo cáo tồn kho"
              active={activeView === "inventory_report"}
              onClick={() => {
                setActiveView("inventory_report");
                setIsSidebarOpen(false);
              }}
            />

            <div className="pt-4 pb-1 pl-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Cấu hình
            </div>
            <SidebarItem
              icon={<Wrench size={18} />}
              label="Cấu hình Website"
              active={activeView === "system_config"}
              onClick={() => {
                setActiveView("system_config");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<ShieldAlert size={18} />}
              label="Nhật ký hệ thống"
              active={activeView === "audit_logs"}
              onClick={() => {
                setActiveView("audit_logs");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem
              icon={<Users size={18} />}
              label="Nhân viên"
              active={activeView === "system"}
              onClick={() => {
                setActiveView("system");
                setIsSidebarOpen(false);
              }}
            />
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition font-bold text-sm uppercase tracking-tight"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-3 bg-white rounded-xl shadow-sm mb-6 border m-4"
          >
            <Menu size={20} />
          </button>

          {activeView === "dashboard" && (
            <ErrorBoundary view="Dashboard">
              <DashboardView />
            </ErrorBoundary>
          )}
          {activeView === "sales" && (
            <ErrorBoundary view="Orders">
              <OrderListManager />
            </ErrorBoundary>
          )}
          {activeView === "returns" && (
            <ErrorBoundary view="Returns">
              <ReturnManager />
            </ErrorBoundary>
          )}
          {activeView === "reports" && (
            <ErrorBoundary view="Reports">
              <ReportsManager />
            </ErrorBoundary>
          )}
          {activeView === "products" && (
            <ErrorBoundary view="Products">
              <ProductManager />
            </ErrorBoundary>
          )}
          {activeView === "size_guides" && (
            <ErrorBoundary view="Size Guides">
              <SizeGuideManager />
            </ErrorBoundary>
          )}
          {activeView === "product_config" && (
            <ErrorBoundary view="Product Config">
              <ProductConfigManager />
            </ErrorBoundary>
          )}
          {activeView === "suppliers" && (
            <ErrorBoundary view="Suppliers">
              <SupplierManager />
            </ErrorBoundary>
          )}
          {activeView === "inventory" && (
            <ErrorBoundary view="Inventory">
              <InventoryManager />
            </ErrorBoundary>
          )}
          {activeView === "stock_issue" && (
            <ErrorBoundary view="Stock Issue">
              <StockIssueManager />
            </ErrorBoundary>
          )}
          {activeView === "stock_count" && (
            <ErrorBoundary view="Stock Count">
              <StocktakeManager />
            </ErrorBoundary>
          )}
          {activeView === "inventory_report" && (
            <ErrorBoundary view="Inventory Report">
              <InventoryReportManager
                onGoToStockEntry={() => setActiveView("inventory")}
              />
            </ErrorBoundary>
          )}
          {activeView === "system_config" && (
            <ErrorBoundary view="System Config">
              <SystemConfigManager />
            </ErrorBoundary>
          )}
          {activeView === "audit_logs" && (
            <ErrorBoundary view="Audit Logs">
              <AuditLogsView />
            </ErrorBoundary>
          )}
          {activeView === "system" && (
            <ErrorBoundary view="System">
              <SystemManager />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; view: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; view: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(
      `❌ [ErrorBoundary - ${this.props.view}] Error caught:`,
      error
    );
    console.error(
      `📍 [ErrorBoundary - ${this.props.view}] Error info:`,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 rounded-3xl border-2 border-red-200">
          <h2 className="text-2xl font-black text-red-600 mb-4">
            ⚠️ LỖI: {this.props.view}
          </h2>
          <p className="text-sm text-red-800 font-bold mb-4">
            {this.state.error?.message || "Unknown error"}
          </p>
          <pre className="text-xs bg-white p-4 rounded-xl overflow-auto max-h-96 text-red-900">
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
