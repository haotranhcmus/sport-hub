import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserAddress } from "../types";
import { api } from "../services";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  addAddress: (address: Omit<UserAddress, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "sporthub_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Load user from localStorage on mount
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const userData = await api.auth.login(email);
      // Use addresses from database (or empty array if none)
      const userWithAddresses: User = {
        ...userData,
        addresses: userData.addresses || [],
      };
      setUser(userWithAddresses);
      // Persist to localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithAddresses));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Ngay lập tức điều hướng về trang đăng nhập
    navigate("/login");
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  const addAddress = (newAddr: Omit<UserAddress, "id">) => {
    if (!user) return;
    const addressWithId = { ...newAddr, id: `addr-${Date.now()}` };
    const updatedAddresses = [...user.addresses, addressWithId];
    if (newAddr.isDefault) {
      updatedAddresses.forEach((a) => {
        if (a.id !== addressWithId.id) a.isDefault = false;
      });
    }
    const updated = { ...user, addresses: updatedAddresses };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  const removeAddress = (id: string) => {
    if (!user) return;
    const updated = {
      ...user,
      addresses: user.addresses.filter((a) => a.id !== id),
    };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    const updated = { ...user, addresses: updatedAddresses };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        addAddress,
        removeAddress,
        setDefaultAddress,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
