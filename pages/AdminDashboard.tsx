import React, { useState, useEffect } from "react";
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
  Store,
  Box,
  BarChart3,
  Cog,
  MessageCircle,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { NotificationBell } from "../components/common/NotificationBell";
import { chatService } from "../services/chat.service";

// Import Separated Components
import {
  SidebarItem,
  SidebarSubItem,
  SidebarModule,
  Breadcrumb,
} from "../components/admin/SharedUI";
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
import { AdminChatDashboard } from "../components/admin/AdminChatDashboard";

// Helper function để lấy breadcrumb path
const getBreadcrumb = (view: ViewType): string[] => {
  const breadcrumbMap: Record<ViewType, string[]> = {
    dashboard: ["Tổng quan"],
    sales: ["Kinh doanh", "Đơn hàng"],
    returns: ["Kinh doanh", "Đổi / Trả"],
    chat: ["Kinh doanh", "Chat hỗ trợ"],
    reports: ["Báo cáo", "Doanh thu"],
    products: ["Sản phẩm", "Sản phẩm & SKU"],
    size_guides: ["Sản phẩm", "Bảng Size"],
    product_config: ["Sản phẩm", "Cấu hình sản phẩm"],
    inventory: ["Quản lý kho", "Nhập kho"],
    stock_issue: ["Quản lý kho", "Xuất kho"],
    stock_count: ["Quản lý kho", "Kiểm kê"],
    inventory_report: ["Quản lý kho", "Báo cáo tồn kho"],
    suppliers: ["Quản lý kho", "Nhà cung cấp"],
    system_config: ["Cấu hình", "Website"],
    system: ["Cấu hình", "Nhân viên"],
    audit_logs: ["Cấu hình", "Nhật ký"],
  };
  return breadcrumbMap[view] || [view];
};

// ================= TYPES =================
type ViewType =
  | "dashboard"
  | "sales"
  | "returns"
  | "chat"
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
  const [waitingChatsCount, setWaitingChatsCount] = useState(0);
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();

  // Load waiting chats count
  useEffect(() => {
    const loadWaitingChats = async () => {
      try {
        const rooms = await chatService.getWaitingRooms();
        setWaitingChatsCount(rooms.length);
      } catch (error) {
        console.error("Error loading waiting chats:", error);
      }
    };
    loadWaitingChats();
    // Refresh every 30 seconds
    const interval = setInterval(loadWaitingChats, 30000);
    return () => clearInterval(interval);
  }, []);

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
          className={`absolute md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 transform overflow-visible ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center overflow-visible relative z-[9999]">
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
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <NotificationBell
                onNotificationClick={(notification) => {
                  // Navigate based on notification type
                  if (notification.type === "NEW_ORDER") {
                    setActiveView("sales");
                  } else if (notification.type === "CHAT_MESSAGE") {
                    setActiveView("chat");
                  } else if (notification.type === "NEW_RETURN") {
                    setActiveView("returns");
                  }
                  setIsSidebarOpen(false);
                }}
              />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {/* MODULE 1: Tổng quan */}
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Tổng quan"
              active={activeView === "dashboard"}
              onClick={() => {
                setActiveView("dashboard");
                setIsSidebarOpen(false);
              }}
            />

            {/* MODULE 2: Kinh doanh */}
            <div className="pt-4"></div>
            <SidebarModule
              icon={<Store size={18} />}
              label="Kinh doanh"
              defaultExpanded={["sales", "returns", "reports", "chat"].includes(
                activeView
              )}
            >
              <SidebarSubItem
                icon={<ShoppingCart size={16} />}
                label="Đơn hàng"
                active={activeView === "sales"}
                onClick={() => {
                  setActiveView("sales");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<RotateCcw size={16} />}
                label="Đổi / Trả"
                active={activeView === "returns"}
                onClick={() => {
                  setActiveView("returns");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<MessageCircle size={16} />}
                label="Chat hỗ trợ"
                active={activeView === "chat"}
                badge={waitingChatsCount > 0 ? waitingChatsCount : undefined}
                onClick={() => {
                  setActiveView("chat");
                  setIsSidebarOpen(false);
                }}
              />
            </SidebarModule>

            {/* MODULE 3: Sản phẩm */}
            <SidebarModule
              icon={<Box size={18} />}
              label="Sản phẩm"
              defaultExpanded={[
                "products",
                "size_guides",
                "product_config",
              ].includes(activeView)}
            >
              <SidebarSubItem
                icon={<Package size={16} />}
                label="Sản phẩm & SKU"
                active={activeView === "products"}
                onClick={() => {
                  setActiveView("products");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<Ruler size={16} />}
                label="Bảng Size"
                active={activeView === "size_guides"}
                onClick={() => {
                  setActiveView("size_guides");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<Settings size={16} />}
                label="Cấu hình sản phẩm"
                active={activeView === "product_config"}
                onClick={() => {
                  setActiveView("product_config");
                  setIsSidebarOpen(false);
                }}
              />
            </SidebarModule>

            {/* MODULE 4: Quản lý kho */}
            <SidebarModule
              icon={<Warehouse size={18} />}
              label="Quản lý kho"
              defaultExpanded={[
                "inventory",
                "stock_issue",
                "stock_count",
                "inventory_report",
                "suppliers",
              ].includes(activeView)}
            >
              <SidebarSubItem
                icon={<ArrowUpCircle size={16} />}
                label="Nhập kho"
                active={activeView === "inventory"}
                onClick={() => {
                  setActiveView("inventory");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<PackageOpen size={16} />}
                label="Xuất kho"
                active={activeView === "stock_issue"}
                onClick={() => {
                  setActiveView("stock_issue");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<ClipboardList size={16} />}
                label="Kiểm kê"
                active={activeView === "stock_count"}
                onClick={() => {
                  setActiveView("stock_count");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<BarChart3 size={16} />}
                label="Báo cáo tồn kho"
                active={activeView === "inventory_report"}
                onClick={() => {
                  setActiveView("inventory_report");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<Briefcase size={16} />}
                label="Nhà cung cấp"
                active={activeView === "suppliers"}
                onClick={() => {
                  setActiveView("suppliers");
                  setIsSidebarOpen(false);
                }}
              />
            </SidebarModule>

            {/* MODULE 5: Báo cáo */}
            <SidebarModule
              icon={<TrendingUp size={18} />}
              label="Báo cáo"
              defaultExpanded={activeView === "reports"}
            >
              <SidebarSubItem
                icon={<BarChart3 size={16} />}
                label="Doanh thu"
                active={activeView === "reports"}
                onClick={() => {
                  setActiveView("reports");
                  setIsSidebarOpen(false);
                }}
              />
            </SidebarModule>

            {/* MODULE 6: Cấu hình hệ thống */}
            <SidebarModule
              icon={<Cog size={18} />}
              label="Cấu hình"
              defaultExpanded={[
                "system_config",
                "audit_logs",
                "system",
              ].includes(activeView)}
            >
              <SidebarSubItem
                icon={<Wrench size={16} />}
                label="Website"
                active={activeView === "system_config"}
                onClick={() => {
                  setActiveView("system_config");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<Users size={16} />}
                label="Nhân viên"
                active={activeView === "system"}
                onClick={() => {
                  setActiveView("system");
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarSubItem
                icon={<ShieldAlert size={16} />}
                label="Nhật ký"
                active={activeView === "audit_logs"}
                onClick={() => {
                  setActiveView("audit_logs");
                  setIsSidebarOpen(false);
                }}
              />
            </SidebarModule>
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

          {/* Breadcrumb - hiển thị ở mọi trang */}
          <div className="px-6 md:px-8 pt-6">
            <Breadcrumb items={getBreadcrumb(activeView)} />
          </div>

          {activeView === "dashboard" && (
            <AdminErrorBoundary view="Dashboard">
              <DashboardView />
            </AdminErrorBoundary>
          )}
          {activeView === "sales" && (
            <AdminErrorBoundary view="Orders">
              <OrderListManager />
            </AdminErrorBoundary>
          )}
          {activeView === "returns" && (
            <AdminErrorBoundary view="Returns">
              <ReturnManager />
            </AdminErrorBoundary>
          )}
          {activeView === "chat" && (
            <AdminErrorBoundary view="Chat">
              <div className="px-6 md:px-8 pb-6">
                <AdminChatDashboard />
              </div>
            </AdminErrorBoundary>
          )}
          {activeView === "reports" && (
            <AdminErrorBoundary view="Reports">
              <ReportsManager />
            </AdminErrorBoundary>
          )}
          {activeView === "products" && (
            <AdminErrorBoundary view="Products">
              <ProductManager />
            </AdminErrorBoundary>
          )}
          {activeView === "size_guides" && (
            <AdminErrorBoundary view="Size Guides">
              <SizeGuideManager />
            </AdminErrorBoundary>
          )}
          {activeView === "product_config" && (
            <AdminErrorBoundary view="Product Config">
              <ProductConfigManager />
            </AdminErrorBoundary>
          )}
          {activeView === "suppliers" && (
            <AdminErrorBoundary view="Suppliers">
              <SupplierManager />
            </AdminErrorBoundary>
          )}
          {activeView === "inventory" && (
            <AdminErrorBoundary view="Inventory">
              <InventoryManager />
            </AdminErrorBoundary>
          )}
          {activeView === "stock_issue" && (
            <AdminErrorBoundary view="Stock Issue">
              <StockIssueManager />
            </AdminErrorBoundary>
          )}
          {activeView === "stock_count" && (
            <AdminErrorBoundary view="Stock Count">
              <StocktakeManager />
            </AdminErrorBoundary>
          )}
          {activeView === "inventory_report" && (
            <AdminErrorBoundary view="Inventory Report">
              <InventoryReportManager
                onGoToStockEntry={() => setActiveView("inventory")}
              />
            </AdminErrorBoundary>
          )}
          {activeView === "system_config" && (
            <AdminErrorBoundary view="System Config">
              <SystemConfigManager />
            </AdminErrorBoundary>
          )}
          {activeView === "audit_logs" && (
            <AdminErrorBoundary view="Audit Logs">
              <AuditLogsView />
            </AdminErrorBoundary>
          )}
          {activeView === "system" && (
            <AdminErrorBoundary view="System">
              <SystemManager />
            </AdminErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};

// Simple Error Boundary using class with explicit typing
// Simple Error Fallback wrapper - React 19 compatible
const AdminErrorBoundary: React.FC<{
  children: React.ReactNode;
  view: string;
}> = ({ children, view }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error(`❌ [AdminErrorBoundary - ${view}] Error:`, event.error);
      setError(event.error);
      setHasError(true);
      event.preventDefault();
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [view]);

  if (hasError) {
    return (
      <div className="p-10 bg-red-50 rounded-3xl border-2 border-red-200">
        <h2 className="text-2xl font-black text-red-600 mb-4">
          ⚠️ LỖI: {view}
        </h2>
        <p className="text-sm text-red-800 font-bold mb-4">
          {error?.message || "Unknown error"}
        </p>
        <pre className="text-xs bg-white p-4 rounded-xl overflow-auto max-h-96 text-red-900">
          {error?.stack}
        </pre>
        <button
          onClick={() => {
            setHasError(false);
            setError(null);
          }}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
