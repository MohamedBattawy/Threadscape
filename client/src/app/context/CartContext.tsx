"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getCart } from "../utils/api";
import { useAuth } from "./AuthContext";

type CartItem = {
  id: number;
  productId: number;
  userId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    images: Array<{
      id: number;
      url: string;
      isMain: boolean;
    }>;
    status: 'in_stock' | 'limited_stock' | 'out_of_stock' | 'discontinued';
  };
};

type CartData = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

interface CartContextType {
  cart: CartData | null;
  itemCount: number;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getCart();
      
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        throw new Error('Invalid cart data format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart data when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [user, authLoading]);

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, error, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 