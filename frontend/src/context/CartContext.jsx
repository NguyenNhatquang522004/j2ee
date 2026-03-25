import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../api/services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setLoading(true);
    try {
      const { data } = await cartService.get();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity) => {
    await cartService.addItem({ productId, quantity });
    await fetchCart();
  };

  const updateItem = async (cartItemId, quantity) => {
    await cartService.updateItem(cartItemId, { quantity });
    await fetchCart();
  };

  const removeItem = async (cartItemId) => {
    await cartService.removeItem(cartItemId);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartService.clear();
    await fetchCart();
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItem, removeItem, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
