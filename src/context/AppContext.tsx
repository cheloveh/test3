import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initDB, authenticateUser, createUser, getUserById, updateUser, getCart, addToCart, removeFromCart, updateCartQuantity, clearCart, getFavorites, addFavorite, removeFavorite, getUserOrders, getOrderItems, createOrder } from '../db/database';
import { products, Product } from '../data/products';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  user: User | null;
  cart: CartItem[];
  favorites: number[];
  loading: boolean;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, name: string, phone?: string) => boolean;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => void;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  orders: any[];
  placeOrder: (address: string, deliveryMethod: string, paymentMethod: string, comment?: string) => number | null;
  dbReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      setDbReady(true);
      const savedUserId = localStorage.getItem('techzone_user');
      if (savedUserId) {
        const u = getUserById(parseInt(savedUserId));
        if (u) {
          setUser({ id: u.id, email: u.email, name: u.name, phone: u.phone, address: u.address });
          loadUserData(u.id);
        }
      }
      setLoading(false);
    })();
  }, []);

  const loadUserData = (userId: number) => {
    const cartData = getCart(userId);
    const cartItems: CartItem[] = cartData.map((item: any) => {
      const product = products.find(p => p.id === item.product_id);
      return { product: product!, quantity: item.quantity };
    }).filter((item: CartItem) => item.product);
    setCart(cartItems);

    const favs = getFavorites(userId);
    setFavorites(favs);

    const userOrders = getUserOrders(userId);
    setOrders(userOrders);
  };

  const login = (email: string, password: string): boolean => {
    const u = authenticateUser(email, password);
    if (u) {
      const userData = { id: u.id, email: u.email, name: u.name, phone: u.phone, address: u.address };
      setUser(userData);
      localStorage.setItem('techzone_user', u.id.toString());
      loadUserData(u.id);
      return true;
    }
    return false;
  };

  const register = (email: string, password: string, name: string, phone?: string): boolean => {
    const id = createUser(email, password, name, phone);
    if (id) {
      const userData = { id, email, name, phone };
      setUser(userData);
      localStorage.setItem('techzone_user', id.toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setFavorites([]);
    setOrders([]);
    localStorage.removeItem('techzone_user');
  };

  const updateProfile = (data: { name?: string; phone?: string; address?: string }) => {
    if (user) {
      updateUser(user.id, data);
      const updated = getUserById(user.id);
      if (updated) {
        setUser({ id: updated.id, email: updated.email, name: updated.name, phone: updated.phone, address: updated.address });
      }
    }
  };

  const handleAddToCart = (productId: number, quantity: number = 1) => {
    if (!user) return;
    addToCart(user.id, productId, quantity);
    loadUserData(user.id);
  };

  const handleRemoveFromCart = (productId: number) => {
    if (!user) return;
    removeFromCart(user.id, productId);
    loadUserData(user.id);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (!user) return;
    updateCartQuantity(user.id, productId, quantity);
    loadUserData(user.id);
  };

  const handleClearCart = () => {
    if (!user) return;
    clearCart(user.id);
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const toggleFavorite = (productId: number) => {
    if (!user) return;
    if (favorites.includes(productId)) {
      removeFavorite(user.id, productId);
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      addFavorite(user.id, productId);
      setFavorites([...favorites, productId]);
    }
  };

  const isFav = (productId: number) => favorites.includes(productId);

  const handlePlaceOrder = (address: string, deliveryMethod: string, paymentMethod: string, comment?: string): number | null => {
    if (!user || cart.length === 0) return null;
    const items = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));
    const orderId = createOrder(user.id, items, address, deliveryMethod, paymentMethod, comment);
    if (orderId) {
      setCart([]);
      const userOrders = getUserOrders(user.id);
      setOrders(userOrders);
    }
    return orderId;
  };

  return (
    <AppContext.Provider value={{
      user, cart, favorites, loading, login, register, logout, updateProfile,
      addToCart: handleAddToCart, removeFromCart: handleRemoveFromCart,
      updateQuantity: handleUpdateQuantity, clearCart: handleClearCart,
      cartTotal, toggleFavorite, isFavorite: isFav, orders, placeOrder: handlePlaceOrder, dbReady
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
