// src/store/Reducers/cartReducer.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  cartItems: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

// Constants for localStorage keys to avoid magic strings
const LOCAL_STORAGE_KEYS = {
  CART_ITEMS: "cartItems",
  TOTAL_AMOUNT: "totalAmount",
  TOTAL_QUANTITY: "totalQuantity",
} as const;

// Helper function to safely load cart from localStorage
const loadCartFromLocalStorage = (): CartState => {
  try {
    const storedCartItems = localStorage.getItem(LOCAL_STORAGE_KEYS.CART_ITEMS);
    const storedTotalAmount = localStorage.getItem(LOCAL_STORAGE_KEYS.TOTAL_AMOUNT);
    const storedTotalQuantity = localStorage.getItem(LOCAL_STORAGE_KEYS.TOTAL_QUANTITY);

    return {
      cartItems: storedCartItems ? JSON.parse(storedCartItems) : [],
      totalAmount: storedTotalAmount ? parseFloat(storedTotalAmount) : 0,
      totalQuantity: storedTotalQuantity ? parseInt(storedTotalQuantity, 10) : 0,
    };
  } catch (e) {
    console.error("Failed to load cart from localStorage:", e);
    return { cartItems: [], totalAmount: 0, totalQuantity: 0 };
  }
};

// Helper function to persist cart state
const persistCartState = (state: CartState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART_ITEMS, JSON.stringify(state.cartItems));
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOTAL_AMOUNT, state.totalAmount.toString());
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOTAL_QUANTITY, state.totalQuantity.toString());
  } catch (e) {
    console.error("Failed to persist cart state:", e);
  }
};

// Helper function to calculate totals
const calculateTotals = (cartItems: CartItem[]) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { totalAmount, totalQuantity };
};

const initialState: CartState = loadCartFromLocalStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ 
      id: string; 
      name: string; 
      price: number; 
      image?: string; 
      newQuantity: number 
    }>) => {
      const { id, name, price, image, newQuantity } = action.payload;
      const existingItemIndex = state.cartItems.findIndex(item => item.id === id);

      if (existingItemIndex >= 0) {
        state.cartItems[existingItemIndex].quantity = newQuantity;
      } else {
        state.cartItems.push({ id, name, price, image, quantity: newQuantity });
      }

      const { totalAmount, totalQuantity } = calculateTotals(state.cartItems);
      state.totalAmount = totalAmount;
      state.totalQuantity = totalQuantity;

      persistCartState(state);
    },
    
    deleteItem: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
      
      const { totalAmount, totalQuantity } = calculateTotals(state.cartItems);
      state.totalAmount = totalAmount;
      state.totalQuantity = totalQuantity;

      persistCartState(state);
    },
    
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalQuantity = 0;

      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    },
    
    setCartState: (state, action: PayloadAction<{ 
      items: CartItem[]; 
      totalAmount: number; 
      totalQuantity: number 
    }>) => {
      state.cartItems = action.payload.items;
      state.totalAmount = action.payload.totalAmount;
      state.totalQuantity = action.payload.totalQuantity;
      
      persistCartState(state);
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;