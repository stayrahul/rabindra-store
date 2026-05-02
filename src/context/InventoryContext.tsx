"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/utils/supabase"; 

export interface Product {
  id: string;
  nameEn: string;
  nameNp?: string;
  category: string;
  description?: string;
  units: string[];
  imageUrl: string;
  inStock: boolean;
}

interface InventoryContextType {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // ADDED: Types for the category manager
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
  // ADDED: State for categories (initialized with defaults)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from Supabase on load
  useEffect(() => {
    fetchProducts();
    // Note: If you create a 'categories' table in Supabase later, 
    // you would call a fetchCategories() function here too!
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      setProducts(data);
    }
    setIsLoading(false);
  };

  const addProduct = async (product: Product) => {
    setProducts((prev) => [product, ...prev]); // Update UI instantly
    const { error } = await supabase.from('products').insert([product]);
    if (error) {
      console.error("Error saving to cloud:", error);
      fetchProducts(); // Revert UI if cloud fails
    }
  };

  const updateProduct = async (id: string, updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
    const { error } = await supabase.from('products').update(updatedProduct).eq('id', id);
    if (error) console.error("Error updating cloud:", error);
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error("Error deleting from cloud:", error);
  };

  // ADDED: Category management functions
  const addCategory = (name: string) => {
    if (!categories.includes(name)) {
      setCategories((prev) => [...prev, name]);
      // TODO: Add Supabase insert here if you create a categories table
    }
  };

  const deleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((cat) => cat !== name));
    // TODO: Add Supabase delete here if you create a categories table
  };

  return (
    <InventoryContext.Provider 
      value={{ 
        products, 
        categories, // Updated to use state instead of the static array
        isLoading, 
        addProduct, 
        updateProduct, 
        deleteProduct,
        addCategory, // Exported to context
        deleteCategory // Exported to context
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