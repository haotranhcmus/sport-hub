
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { CartItem, Product, ProductVariant, ProductStatus } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  isValid: boolean; 
  syncLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sporthub_guest_cart';
const CART_EXPIRY_DAYS = 7;

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);

  // Tải dữ liệu sản phẩm mới nhất từ API để validate
  const refreshProducts = async () => {
    const prods = await api.products.list();
    setLatestProducts(prods);
  };

  useEffect(() => {
    const loadCart = async () => {
      setSyncLoading(true);
      await refreshProducts();
      if (isAuthenticated && user) {
        const dbItems = await api.cart.get(user.id);
        const guestData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (guestData) {
          const { items: guestItems, timestamp } = JSON.parse(guestData);
          const isExpired = Date.now() - timestamp > CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          if (!isExpired && guestItems.length > 0) {
            const merged = [...dbItems];
            guestItems.forEach((gItem: CartItem) => {
              const existingIndex = merged.findIndex(m => m.variantId === gItem.variantId);
              if (existingIndex > -1) {
                merged[existingIndex].quantity += gItem.quantity;
              } else {
                merged.push(gItem);
              }
            });
            setItems(merged);
            await api.cart.save(user.id, merged);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } else {
            setItems(dbItems);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } else {
          setItems(dbItems);
        }
      } else {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
          const { items: savedItems, timestamp } = JSON.parse(data);
          const isExpired = Date.now() - timestamp > CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          if (isExpired) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setItems([]);
          } else {
            setItems(savedItems);
          }
        }
      }
      setSyncLoading(false);
    };

    loadCart();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (syncLoading) return;
    if (isAuthenticated && user) {
      api.cart.save(user.id, items);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        items,
        timestamp: Date.now()
      }));
    }
  }, [items, isAuthenticated, user, syncLoading]);

  const validatedItems = useMemo(() => {
    return items.map(item => {
      // Validate dựa trên latestProducts fetch từ API thay vì mockData tĩnh
      const realProduct = latestProducts.find(p => p.id === item.product.id);
      const realVariant = realProduct?.variants?.find(v => v.id === item.variantId);

      let warning = '';
      let error = '';
      let finalQuantity = item.quantity;
      let isAvailable = true;

      if (!realProduct || realProduct.status === ProductStatus.ARCHIVED || realProduct.status === ProductStatus.DRAFT) {
        error = 'Sản phẩm không còn kinh doanh.';
        isAvailable = false;
      } else if (realProduct.status === ProductStatus.INACTIVE) {
        warning = 'Sản phẩm tạm thời hết hàng.';
        isAvailable = false;
      } else if (!realVariant || realVariant.stockQuantity <= 0) {
        error = 'Phân loại này đã hết hàng.';
        isAvailable = false;
      } else if (item.quantity > realVariant.stockQuantity) {
        warning = `Chỉ còn ${realVariant.stockQuantity} sản phẩm.`;
        finalQuantity = realVariant.stockQuantity;
      }

      return {
        ...item,
        quantity: finalQuantity,
        warning,
        error,
        isAvailable,
        product: realProduct || item.product, 
        variant: realVariant || item.variant
      };
    });
  }, [items, latestProducts]);

  useEffect(() => {
    const needsUpdate = validatedItems.some((v, i) => v.quantity !== items[i]?.quantity);
    if (needsUpdate) {
        setItems(validatedItems.map(({warning, error, isAvailable, ...rest}) => rest as CartItem));
    }
  }, [validatedItems]);

  const isValid = useMemo(() => {
    return validatedItems.length > 0 && validatedItems.every(i => i.isAvailable && !i.error);
  }, [validatedItems]);

  const addToCart = async (product: Product, variant: ProductVariant, quantity: number) => {
    await refreshProducts(); // Cập nhật stock mới nhất trước khi thêm
    
    setItems(prev => {
      const existing = prev.find(i => i.variantId === variant.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        return prev.map(i => 
          i.variantId === variant.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { id: Date.now().toString(), variantId: variant.id, product, variant, quantity }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
        removeFromCart(variantId);
        return;
    }
    setItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  
  const totalPrice = useMemo(() => validatedItems.reduce((acc, item) => {
    if (!item.isAvailable) return acc;
    const price = item.product.promotionalPrice || item.product.basePrice;
    return acc + ((price + item.variant.priceAdjustment) * item.quantity);
  }, 0), [validatedItems]);

  const toggleCart = () => setIsOpen(prev => !prev);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider value={{ 
      items: validatedItems as any, addToCart, removeFromCart, updateQuantity, clearCart, 
      totalItems, totalPrice, isOpen, toggleCart, closeCart, isValid, syncLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
