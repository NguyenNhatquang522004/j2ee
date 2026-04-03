import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cartService } from '../api/services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const handleCartError = (err, fallbackMsg) => {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message;
    if (status === 429) {
        toast.error(msg || 'Thao tác quá nhanh, vui lòng thử lại sau ít phút.');
    } else {
        toast.error(msg || fallbackMsg);
    }
    throw err;
};

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

    useEffect(() => { 
        fetchCart(); 
        window.addEventListener('cart-updated', fetchCart);
        return () => window.removeEventListener('cart-updated', fetchCart);
    }, [fetchCart]);

    const addToCart = async (productId, quantity) => {
        const existingItem = cart?.items?.find(i => i.productId === productId);
        const currentQty = existingItem ? existingItem.quantity : 0;
        
        if (currentQty + quantity > 10) {
            toast.error('Để đảm bảo sản phẩm có thể đến tay nhiều khách hàng nhất, mỗi người dùng chỉ được mua tối đa 10 đơn vị.');
            return;
        }

        try {
            const { data } = await cartService.addItem({ productId, quantity });
            setCart(data);
        } catch (err) {
            handleCartError(err, 'Không thể thêm vào giỏ hàng');
        }
    };

    const updateItem = async (cartItemId, quantity) => {
        try {
            const { data } = await cartService.updateItem(cartItemId, { quantity });
            setCart(data);
        } catch (err) {
            handleCartError(err, 'Không thể cập nhật giỏ hàng');
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            await cartService.removeItem(cartItemId);
            await fetchCart();
        } catch (err) {
            handleCartError(err, 'Không thể xoá sản phẩm');
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clear();
            await fetchCart();
        } catch (err) {
            handleCartError(err, 'Không thể xoá giỏ hàng');
        }
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
