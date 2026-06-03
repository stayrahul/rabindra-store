"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { InventoryProvider } from "@/context/InventoryContext"; // <-- 1. Import it here

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <InventoryProvider> {/* <-- 2. Wrap it inside Redux */}
        {children}
      </InventoryProvider>
    </Provider>
  );
}