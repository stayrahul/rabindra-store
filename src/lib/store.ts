import { configureStore } from "@reduxjs/toolkit";
import cartsReducer from "./features/carts/cartsSlice";
// If the app complains about missing productsReducer, uncomment the two lines below:
// import productsReducer from "./features/products/productsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      carts: cartsReducer,
      // products: productsReducer, 
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export const store = makeStore();

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;