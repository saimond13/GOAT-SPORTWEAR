"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product, CartItem } from "@/types/product";

export type DeliveryType = "domicilio" | "sucursal" | "";

export interface ShippingInfo {
  type: DeliveryType;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  recipientName: string;
  recipientPhone: string;
  agencyId: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity: number, paymentMethod: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  shipping: ShippingInfo;
  setShipping: (info: Partial<ShippingInfo>) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const defaultShipping: ShippingInfo = {
  type: "", address: "", postalCode: "", city: "", province: "",
  recipientName: "", recipientPhone: "", agencyId: "",
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [shipping, setShippingState] = useState<ShippingInfo>(defaultShipping);

  const addItem = (product: Product, size: string, quantity: number, paymentMethod: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity, paymentMethod }
            : i
        );
      }
      return [...prev, { product, size, quantity, paymentMethod }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId, size); return; }
    setItems((prev) =>
      prev.map((i) => i.product.id === productId && i.size === size ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => setItems([]);

  const setShipping = (info: Partial<ShippingInfo>) =>
    setShippingState((prev) => ({ ...prev, ...info }));

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      total, itemCount, isOpen, setIsOpen,
      shipping, setShipping,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
