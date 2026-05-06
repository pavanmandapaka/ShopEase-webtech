import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0 });
      return;
    }
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data.cart || { items: [], total: 0 });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error('Please login to add items to cart');
        return false;
      }
      try {
        const { data } = await cartService.addToCart({ productId, quantity });
        setCart(data.cart);
        toast.success('Added to cart!', { icon: '🛒' });
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
        return false;
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const { data } = await cartService.updateCartItem({ productId, quantity });
      setCart(data.cart);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const { data } = await cartService.removeFromCart(productId);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [], total: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }, []);

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isOpen,
        setIsOpen,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
