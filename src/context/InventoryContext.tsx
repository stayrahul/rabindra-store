"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { supabase } from "@/utils/supabase";

export interface Product {
  id: string;
  nameEn: string;
  nameNp?: string;
  description?: string;
  imageUrl?: string;
  category: string;
  inStock: boolean;
  units: string[];
  selling_price?: number;
  variants?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface StoreSettings {
  maintenanceMode: boolean;
  holidayMode: boolean;
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  whatsappNumber: string;
  storeDescription: string;
  openingTime: string;
  closingTime: string;
  announcement: string;
  allowOnlineOrders: boolean;
  minOrderValue: string;
  deliveryCharge: string;
  freeDeliveryThreshold: string;
  taxLabel: string;
  taxPercentage: string;
  enableTax: boolean;
  seoTitle: string;
  seoDescription: string;
  googleAnalyticsId: string;
  facebookUrl: string;
  instagramUrl: string;
  adminPassword: string;
  sessionTimeoutMins: string;
  lowStockThreshold: string;
  lowStockAlerts: boolean;
  categories?: string[];
}

interface InventoryContextType {
  products: Product[];
  categories: string[];
  settings: StoreSettings | null;
  isLoading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = [
  "Grains & Pulses",
  "Oils & Ghee",
  "Spices & Herbs",
  "Snacks & Noodles",
  "Beverages",
  "Uncategorized"
];

const DEFAULT_SETTINGS: StoreSettings = {
  maintenanceMode: false,
  holidayMode: false,
  storeName: "Rabindra Wholesale Mart",
  supportPhone: "+977 9860117783",
  supportEmail: "info@rabindra.store",
  address: "Simraungadh, Bara, Nepal",
  whatsappNumber: "9779860117783",
  storeDescription: "The leading wholesale supplier for premium goods in Simraungadh.",
  openingTime: "08:00",
  closingTime: "20:00",
  announcement: "Fresh stock arrived! Visit us for the best wholesale rates.",
  allowOnlineOrders: true,
  minOrderValue: "500",
  deliveryCharge: "50",
  freeDeliveryThreshold: "5000",
  taxLabel: "VAT",
  taxPercentage: "13",
  enableTax: false,
  seoTitle: "Rabindra Wholesale | Premium Wholesale Mart",
  seoDescription: "Simraungadh's premier wholesale infrastructure for groceries and essentials.",
  googleAnalyticsId: "G-R8WZYFHD1K",
  facebookUrl: "https://facebook.com/stayrahul",
  instagramUrl: "",
  adminPassword: "rabindra115",
  sessionTimeoutMins: "120",
  lowStockThreshold: "5",
  lowStockAlerts: true,
  categories: DEFAULT_CATEGORIES
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const fetchAllData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);

    try {
      const [prodRes, settRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: false }),
        supabase.from('store_settings').select('data').single()
      ]);

      if (prodRes.data) {
        setProducts(prodRes.data);
      }

      let currentSettings = DEFAULT_SETTINGS;
      if (settRes.data?.data) {
        currentSettings = { ...DEFAULT_SETTINGS, ...settRes.data.data };
      }
      setSettings(currentSettings);

      const savedCats = currentSettings.categories || [];
      const productCats = (prodRes.data || []).map(p => p.category).filter(Boolean);
      const mergedCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...savedCats, ...productCats]));
      setCategories(mergedCats);

    } catch (err) {
      console.error("Critical error fetching inventory data:", err);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      if (isInitialLoad) setIsLoading(false);
      hasLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      fetchAllData(true);
    }
  }, [fetchAllData]);

  const saveCategoriesToDB = useCallback(async (cats: string[]) => {
    try {
      const { data: existing } = await supabase.from('store_settings').select('data').single();
      const currentData = existing?.data || {};
      await supabase.from('store_settings').upsert({
        id: 1,
        data: { ...currentData, categories: cats },
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Could not persist categories to DB:", err);
    }
  }, []);

  const addProduct = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .insert([
        {
          id: product.id,
          nameEn: product.nameEn,
          nameNp: product.nameNp,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          inStock: product.inStock,
          units: product.units,
          selling_price: product.selling_price,
          variants: product.variants
        }
      ]);

    if (error) throw error;
    await fetchAllData(false);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    // Filter out undefined keys to prevent accidental NULL overwrites
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    const { error } = await supabase
      .from('products')
      .update(cleanUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      // Rollback if needed, but fetchAllData will fix it anyway
      await fetchAllData(false);
      throw error;
    }

    // 2. Sync with server
    await fetchAllData(false);
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
    await fetchAllData(false);
  };

  const addCategory = (name: string) => {
    if (!categories.includes(name)) {
      const updated = [...categories, name];
      setCategories(updated);
      saveCategoriesToDB(updated);
    }
  };

  const deleteCategory = (name: string) => {
    const updated = categories.filter((cat) => cat !== name);
    setCategories(updated);
    saveCategoriesToDB(updated);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        settings,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        refreshProducts: () => fetchAllData(false),
        refreshSettings: () => fetchAllData(false)
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) throw new Error("useInventory must be used within InventoryProvider");
  return context;
}