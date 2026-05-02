"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { FiEdit2, FiTrash2, FiSearch, FiPackage, FiX, FiCheckSquare, FiSquare } from "react-icons/fi";
import { useInventory } from "@/context/InventoryContext";
import { Product } from "@/context/InventoryContext"; // Ensure correct import path

export default function InventoryTable({ onEdit }: { onEdit: (p: Product) => void }) {
  // Use isLoading from context instead of isLoaded
  const { products, updateProduct, deleteProduct, isLoading } = useInventory();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Derive unique categories from current products
  const availableCategories = useMemo(() => {
    const categories = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(categories)];
  }, [products]);

  // Handle stock toggling using the updateProduct function
  const handleToggleStock = async (product: Product) => {
    await updateProduct(product.id, { ...product, inStock: !product.inStock });
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    
    return products.filter((p) => {
      const matchesSearch = query === "" || 
        p.nameEn.toLowerCase().includes(query) || 
        (p.nameNp && p.nameNp.includes(query));
        
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-2xl w-full"></div>
        <div className="flex gap-2 mb-4 overflow-x-auto">
           {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-slate-100 rounded-full shrink-0"></div>)}
        </div>
        <div className="hidden md:block h-96 bg-slate-50 rounded-3xl border border-slate-100"></div>
        <div className="md:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-50 rounded-3xl border border-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="space-y-4">
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search products by English or Nepali name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
          <FiPackage className="mx-auto text-4xl text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {search || selectedCategory !== "All" ? "No products match your filters." : "No products found in inventory."}
          </p>
          {(search || selectedCategory !== "All") && (
            <button 
              onClick={() => { setSearch(""); setSelectedCategory("All"); }} 
              className="mt-3 text-indigo-500 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* MOBILE VIEW: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${product.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            
            <div className="flex gap-4 items-center mt-1">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.nameEn} fill sizes="(max-width: 768px) 80px, 80px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><FiPackage size={24}/></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 mb-1 block">{product.category}</span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{product.nameEn}</h3>
                <p className="text-sm text-slate-500">{product.nameNp}</p>
              </div>
            </div>
            
            {product.units && product.units.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.units.map((unit, i) => (
                  <span key={i} className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{unit}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 mt-1">
              <button 
                onClick={() => handleToggleStock(product)}
                aria-label={product.inStock ? "Mark out of stock" : "Mark in stock"}
                className={`px-4 py-3 rounded-xl text-sm font-bold flex-1 flex items-center justify-center gap-2 transition-all ${
                  product.inStock ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {product.inStock ? <><FiCheckSquare /> In Stock</> : <><FiSquare /> Out of Stock</>}
              </button>
              <button 
                onClick={() => onEdit(product)} 
                className="p-3 bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <FiEdit2 />
              </button>
              <button 
                onClick={() => deleteProduct(product.id)} 
                className="p-3 bg-white border border-slate-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: Table */}
      {filteredProducts.length > 0 && (
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-6 font-semibold border-b border-slate-100">Product</th>
                <th className="p-6 font-semibold border-b border-slate-100">Category</th>
                <th className="p-6 font-semibold border-b border-slate-100">Packaging</th>
                <th className="p-6 font-semibold border-b border-slate-100">Status</th>
                <th className="p-6 font-semibold text-right border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-100">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.nameEn} fill sizes="56px" className="object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-300"><FiPackage size={20}/></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">{product.nameEn}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{product.nameNp}</p>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-medium text-slate-600">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg">{product.category}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-wrap gap-1.5">
                      {product.units?.map((unit, i) => (
                        <span key={i} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md">{unit}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => handleToggleStock(product)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        product.inStock 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="p-6 text-right space-x-2 opacity-40 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(product)} 
                      className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)} 
                      className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-rose-600 hover:border-rose-200 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}