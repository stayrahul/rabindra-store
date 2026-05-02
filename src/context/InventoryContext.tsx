"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/utils/supabase"; 

// 1. UPGRADED: Interface matched to your actual Supabase Columns
export interface Product {
  id: string;
  nameEn: string;
  nameNp?: string;
  description?: string;
  imageUrl?: string;
  category: string;
  inStock: boolean;
  units: string[];       // Backwards compatibility
  sellingPrice?: number; // From your admin logic
  variants?: any[];      // EXACT spelling from your Supabase Table
  varients?: any[];      // Safety fallback for legacy typo logic
}

interface InventoryContextType {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
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

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
      
    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      setProducts(data);
    }
    setIsLoading(false);
  };

  // 2. FIXED: addProduct now correctly maps all fields including variants
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
          variants: product.variants // Sends the JSON array to Supabase
        }
      ]);

    if (error) {
      console.error("Error adding product:", error);
      throw error;
    }
    await fetchProducts(); // Refresh local state
  };

  // 3. FIXED: updateProduct now handles Partial updates and refreshes the UI
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update({
        nameEn: updates.nameEn,
        nameNp: updates.nameNp,
        category: updates.category,
        description: updates.description,
        imageUrl: updates.imageUrl,
        inStock: updates.inStock,
        units: updates.units,
        variants: updates.variants // Updates the JSON array in Supabase
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }
    await fetchProducts(); // Refresh local state
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Error deleting product:", error);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const addCategory = (name: string) => {
    if (!categories.includes(name)) {
      setCategories((prev) => [...prev, name]);
    }
  };

  const deleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((cat) => cat !== name));
  };

  return (
    <InventoryContext.Provider 
      value={{ 
        products, 
        categories, 
        isLoading, 
        addProduct, 
        updateProduct, 
        deleteProduct,
        addCategory, 
        deleteCategory 
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