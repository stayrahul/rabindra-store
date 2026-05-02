// src/types/product.types.ts

export type Product = {
  id: string | number;
  name: string;
  nepaliName: string;
  srcUrl: string;
  gallery?: string[];
  units: string[];
  inStock: boolean;
  category?: string;
  varients?: any[];
};