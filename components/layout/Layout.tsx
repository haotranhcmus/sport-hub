import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  Search,
  Menu,
  X,
  ArrowRight,
  Truck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CartDrawer } from "../features/cart/CartDrawer";
import { api } from "../../services";
import { Product } from "../../types/index";
import { removeAccents } from "../../utils/helpers";

export const Layout = () => {
  const { totalItems, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const suggestionRef = useRef<HTMLDivElement>(null);

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const allProducts = await api.products.list();
        const normalizedQuery = removeAccents(searchQuery);
        const filtered = allProducts
          .filter((p) => {
            const normalizedName = removeAccents(p.name);
            return (
              normalizedName.includes(normalizedQuery) ||
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          })
          .slice(0, 5);
        setSuggestions(filtered);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };
    const timeoutId = setTimeout(() => {
      getSuggestions().catch((err) => {
        console.error("Unhandled error in getSuggestions:", err);
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isStaff = user && user.role !== "CUSTOMER";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {!isStaff && <CartDrawer />}

      {!isAdminRoute && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-black text-primary tracking-tighter flex items-center"
            >
              Sport<span className="text-secondary">Hub</span>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className="text-sm font-black uppercase tracking-widest hover:text-secondary transition"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="text-sm font-black uppercase tracking-widest hover:text-secondary transition"
              >
                Sản phẩm
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-sm font-black uppercase tracking-widest text-accent hover:underline"
                >
                  Admin
                </Link>
              )}
            </nav>

            <div
              className="hidden md:block relative w-full max-w-sm"
              ref={suggestionRef}
            >
              <form onSubmit={handleSearchSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    size={18}
                    className="text-gray-400 group-focus-within:text-secondary transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-secondary/5 transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        navigate(`/products/${product.slug}`);
                        setShowSuggestions(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 transition text-left group"
                    >
                      <img
                        src={
                          product.thumbnailUrl ||
                          "https://via.placeholder.com/40?text=No+Image"
                        }
                        className="w-10 h-10 rounded-lg object-cover"
                        alt=""
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes("placeholder")) {
                            target.src =
                              "https://via.placeholder.com/40?text=No+Image";
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-800 line-clamp-1">
                          {product.name}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-gray-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {!isStaff && (
                <div className="flex items-center space-x-1 mr-2 border-r border-gray-100 pr-2">
                  <Link
                    to="/tracking"
                    className="p-3 hover:bg-gray-50 rounded-2xl transition group relative"
                    title="Tra cứu đơn hàng"
                  >
                    <Truck
                      size={22}
                      className="text-gray-600 group-hover:text-secondary transition-colors"
                    />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 hidden">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                    </span>
                  </Link>

                  <button
                    onClick={toggleCart}
                    className="relative p-3 hover:bg-gray-50 rounded-2xl transition group"
                    title="Giỏ hàng"
                  >
                    <ShoppingCart
                      size={22}
                      className="text-gray-700 group-hover:text-secondary transition-colors"
                    />
                    {totalItems > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black rounded-lg min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white shadow-sm">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {isAuthenticated ? (
                <div className="flex items-center space-x-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-2xl transition"
                  >
                    <img
                      src={
                        user?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${user?.fullName}`
                      }
                      className="w-9 h-9 rounded-xl object-cover"
                      alt=""
                    />
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2.5 text-gray-400 hover:text-red-500 transition"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-slate-800 transition"
                >
                  Đăng nhập
                </Link>
              )}
              <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow w-full max-w-full px-4 md:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-primary text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            © 2025 SportHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
