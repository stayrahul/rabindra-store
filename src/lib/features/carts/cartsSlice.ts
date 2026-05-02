// src/lib/features/cart/cartSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  imageUrl: string;
  id: string | number;
  name: string;
  nepaliName: string;
  srcUrl: string;
  unit: string;
  quantity: number;
  note?: string;
  varients?: any[];
  price: number; // <-- ADD THIS LINE
};

// Simplified State: We only care about items and total item count
export interface CartState {
  items: CartItem[];
  totalQuantities: number;
}

const initialState: CartState = {
  items: [],
  totalQuantities: 0,
};

export const cartsSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    // 1. Add or Increase Quantity
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
      const newItem = action.payload;
      const quantityToAdd = newItem.quantity || 1;
      
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += quantityToAdd;
      } else {
        state.items.push({ ...newItem, quantity: quantityToAdd });
      }
      state.totalQuantities += quantityToAdd;
    },

    // 2. Decrease Quantity (Minus button)
    removeCartItem: (state, action: PayloadAction<{ id: string | number }>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
          state.totalQuantities -= 1;
        } else {
          // If quantity hits 0, remove the item entirely
          state.items = state.items.filter((item) => item.id !== action.payload.id);
          state.totalQuantities -= 1;
        }
      }
    },

    // 3. Delete Entire Item (Trash Can button)
    deleteFromCart: (state, action: PayloadAction<{ id: string | number }>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        state.totalQuantities -= existingItem.quantity;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      }
    },

    // 4. Clear Cart (After sending WhatsApp message)
    clearCart: (state) => {
      state.items = [];
      state.totalQuantities = 0;
    },

    // 5. SSR Hydration Protection (Crucial for Next.js)
    hydrateCart: (state, action: PayloadAction<CartState>) => {
      return action.payload;
    }
  },
});

export const { addToCart, removeCartItem, deleteFromCart, clearCart, hydrateCart } = cartsSlice.actions;

export default cartsSlice.reducer;