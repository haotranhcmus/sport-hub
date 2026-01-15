import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage, ForgotPasswordPage } from "./pages/AuthPages";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PaymentGateway } from "./pages/PaymentGateway";
import { OrderDetailPage } from "./pages/OrderDetailPage";

const StaffRedirect: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user && user.role !== "CUSTOMER") {
    return <Navigate to="/admin" />;
  }
  return children;
};

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  role?: string;
  allowGuest?: boolean;
}> = ({ children, role, allowGuest }) => {
  const { user, isAuthenticated } = useAuth();

  console.log("🛡️ [PROTECTED ROUTE] Auth check:", {
    isAuthenticated,
    userRole: user?.role,
    requiredRole: role,
    allowGuest,
    path: window.location.hash,
  });

  if (allowGuest) {
    if (isAuthenticated && user?.role !== "CUSTOMER")
      return <Navigate to="/admin" />;
    return children;
  }
  if (!isAuthenticated) {
    console.log("❌ [PROTECTED ROUTE] Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }
  if (role && user?.role !== role) {
    console.log(
      "❌ [PROTECTED ROUTE] Role mismatch. User role:",
      user?.role,
      "Required:",
      role
    );
    return <Navigate to="/" />;
  }
  console.log("✅ [PROTECTED ROUTE] Access granted");
  return children;
};

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route
                  path="/"
                  element={
                    <StaffRedirect>
                      <HomePage />
                    </StaffRedirect>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <StaffRedirect>
                      <ProductListPage />
                    </StaffRedirect>
                  }
                />
                <Route
                  path="/products/:slug"
                  element={
                    <StaffRedirect>
                      <ProductDetailPage />
                    </StaffRedirect>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute allowGuest>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowGuest>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment-gateway"
                  element={
                    <ProtectedRoute allowGuest>
                      <PaymentGateway />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/tracking" element={<OrderTrackingPage />} />
                {/* Cho phép cả khách vãng lai và thành viên xem chi tiết đơn hàng */}
                <Route
                  path="/orders/:code"
                  element={
                    <ProtectedRoute allowGuest>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute role="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
