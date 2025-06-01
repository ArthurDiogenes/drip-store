import React, { createContext, useState, useEffect, useContext } from 'react';
import { useUser } from './UserContext';
import { getCart, getCartItems, getCartSummary } from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    try {
      setLoading(true);
      console.log('Loading cart data...');
      
      const currentCartId = await getCart(user?.id);
      console.log('Cart ID:', currentCartId);
      setCartId(currentCartId);

      if (currentCartId) {
        const items = await getCartItems(currentCartId);
        console.log('Cart items loaded:', items);
        setCartItems(items);

        const summary = await getCartSummary(currentCartId);
        console.log('Cart summary:', summary);
        setCartCount(summary.totalItems);
        setCartSubtotal(summary.subtotal);
      } else {
        setCartItems([]);
        setCartCount(0);
        setCartSubtotal(0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      setCartCount(0);
      setCartSubtotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user?.id]);

  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('CartContext: Cart update event received');
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const refreshCart = () => {
    loadCart();
  };

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    cartId,
    loading,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};