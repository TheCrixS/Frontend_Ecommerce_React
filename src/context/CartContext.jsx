import { createContext, useContext, useState, useEffect } from "react";
import { maxUnits } from "../utils/format";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "manga_store_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.stock <= 0) return;

    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, maxUnits(product));
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, product, quantity: nextQuantity }
            : item
        );
      }
      return [
        ...prevItems,
        { product, quantity: Math.min(quantity, maxUnits(product)) },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id !== productId) return item;
        const clamped = Math.min(quantity, maxUnits(item.product));
        return { ...item, quantity: clamped };
      })
    );
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Number() evita concatenaciones porque Pydantic v2 serializa Decimal como string en JSON
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const value = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe utilizarse dentro de un CartProvider");
  }
  return context;
}