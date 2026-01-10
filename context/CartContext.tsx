import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { CartItem, Product, ProductVariant, ProductStatus } from "../types";
import { useAuth } from "./AuthContext";
import { useProducts } from "../hooks/useProductsQuery";
import {
  useCart as useCartQuery,
  useAddToCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useClearCart,
} from "../hooks/useCartQuery";

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    variant: ProductVariant,
    quantity: number
  ) => void;
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

const LOCAL_STORAGE_KEY = "sporthub_guest_cart";
const CART_EXPIRY_DAYS = 7;

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Use TanStack Query for products (auto-cached, auto-refetched)
  const { data: latestProducts = [], isLoading: productsLoading } =
    useProducts();

  // Use TanStack Query for authenticated user's cart
  const { data: serverCartItems = [] } = useCartQuery(user?.id);

  // Use TanStack Query mutations with optimistic updates
  const addToCartMutation = useAddToCart(user?.id);
  const updateQuantityMutation = useUpdateCartQuantity(user?.id);
  const removeFromCartMutation = useRemoveFromCart(user?.id);
  const clearCartMutation = useClearCart(user?.id);

  // Local state for guest cart
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);

  // Load guest cart from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        const { items: savedItems, timestamp } = JSON.parse(data);
        const isExpired =
          Date.now() - timestamp > CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        if (isExpired) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setGuestItems([]);
        } else {
          setGuestItems(savedItems);
        }
      }
    }
  }, [isAuthenticated]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated && guestItems.length >= 0) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          items: guestItems,
          timestamp: Date.now(),
        })
      );
    }
  }, [guestItems, isAuthenticated]);

  // Get items based on auth status (server-side via query or local guest cart)
  const items = useMemo(() => {
    // For authenticated users, use server cart from TanStack Query
    // For guests, use local state
    return isAuthenticated ? serverCartItems : guestItems;
  }, [isAuthenticated, serverCartItems, guestItems]);

  const validatedItems = useMemo(() => {
    return items.map((item) => {
      // Validate dựa trên latestProducts fetch từ API thay vì mockData tĩnh
      const realProduct = latestProducts.find((p) => p.id === item.product.id);
      const realVariant = realProduct?.variants?.find(
        (v) => v.id === item.variantId
      );

      let warning = "";
      let error = "";
      let finalQuantity = item.quantity;
      let isAvailable = true;

      if (
        !realProduct ||
        realProduct.status === ProductStatus.ARCHIVED ||
        realProduct.status === ProductStatus.DRAFT
      ) {
        error = "Sản phẩm không còn kinh doanh.";
        isAvailable = false;
      } else if (realProduct.status === ProductStatus.INACTIVE) {
        warning = "Sản phẩm tạm thời hết hàng.";
        isAvailable = false;
      } else if (!realVariant || realVariant.stockQuantity <= 0) {
        error = "Phân loại này đã hết hàng.";
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
        variant: realVariant || item.variant,
      };
    });
  }, [items, latestProducts]);

  // Auto-update guest cart items when validation changes quantity
  useEffect(() => {
    if (!isAuthenticated) {
      const needsUpdate = validatedItems.some(
        (v, i) => v.quantity !== items[i]?.quantity
      );
      if (needsUpdate) {
        setGuestItems(
          validatedItems.map(
            ({ warning, error, isAvailable, ...rest }) => rest as CartItem
          )
        );
      }
    }
  }, [validatedItems, isAuthenticated]);

  const isValid = useMemo(() => {
    return (
      validatedItems.length > 0 &&
      validatedItems.every((i) => i.isAvailable && !i.error)
    );
  }, [validatedItems]);

  const addToCart = (
    product: Product,
    variant: ProductVariant,
    quantity: number
  ) => {
    // ✅ Validate stock before adding to cart
    const realProduct = latestProducts.find((p) => p.id === product.id);
    const realVariant = realProduct?.variants?.find((v) => v.id === variant.id);

    // Check if product/variant is available
    if (
      !realProduct ||
      realProduct.status === ProductStatus.ARCHIVED ||
      realProduct.status === ProductStatus.DRAFT
    ) {
      alert("❌ Sản phẩm này không còn kinh doanh.");
      return;
    }

    if (!realVariant) {
      alert("❌ Phân loại sản phẩm không tồn tại.");
      return;
    }

    if (realVariant.stockQuantity === 0) {
      alert(
        `❌ Phân loại "${variant.color} / ${variant.size}" hiện đã hết hàng. Vui lòng chọn phân loại khác.`
      );
      return;
    }

    // Check if quantity exceeds stock
    const existingItem = items.find((i) => i.variantId === variant.id);
    const currentQtyInCart = existingItem?.quantity || 0;
    const totalQty = currentQtyInCart + quantity;

    if (totalQty > realVariant.stockQuantity) {
      const canAdd = realVariant.stockQuantity - currentQtyInCart;
      if (canAdd <= 0) {
        alert(
          `⚠️ Bạn đã có ${currentQtyInCart} sản phẩm này trong giỏ hàng.\nTồn kho hiện tại: ${realVariant.stockQuantity}`
        );
        setIsOpen(true);
        return;
      }
      alert(
        `⚠️ Chỉ có thể thêm ${canAdd} sản phẩm nữa (Tồn kho: ${realVariant.stockQuantity}, Trong giỏ: ${currentQtyInCart})`
      );
      quantity = canAdd;
    }

    if (isAuthenticated && user) {
      // Use TanStack Query mutation with optimistic update (instant UI)
      addToCartMutation.mutate({ product, variant, quantity });
    } else {
      // Guest: update local state
      setGuestItems((prev) => {
        const existing = prev.find((i) => i.variantId === variant.id);
        if (existing) {
          return prev.map((i) =>
            i.variantId === variant.id
              ? {
                  ...i,
                  quantity: Math.min(
                    i.quantity + quantity,
                    realVariant.stockQuantity
                  ),
                }
              : i
          );
        }
        return [
          ...prev,
          {
            id: Date.now().toString(),
            variantId: variant.id,
            product,
            variant,
            quantity,
          },
        ];
      });
    }
    setIsOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    if (isAuthenticated && user) {
      removeFromCartMutation.mutate(variantId);
    } else {
      setGuestItems((prev) => prev.filter((i) => i.variantId !== variantId));
    }
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    if (isAuthenticated && user) {
      updateQuantityMutation.mutate({ variantId, quantity });
    } else {
      setGuestItems((prev) =>
        prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    if (isAuthenticated && user) {
      clearCartMutation.mutate();
    } else {
      setGuestItems([]);
    }
  };

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      validatedItems.reduce((acc, item) => {
        if (!item.isAvailable) return acc;
        const price =
          item.product?.promotionalPrice || item.product?.basePrice || 0;
        const priceAdjustment = item.variant?.priceAdjustment || 0;
        return acc + (price + priceAdjustment) * item.quantity;
      }, 0),
    [validatedItems]
  );

  const toggleCart = () => setIsOpen((prev) => !prev);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider
      value={{
        items: validatedItems as any,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        toggleCart,
        closeCart,
        isValid,
        syncLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
