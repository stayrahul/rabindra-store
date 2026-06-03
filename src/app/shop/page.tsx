"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Package, Filter, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/common/ProductCard";
import { useInventory } from "@/context/InventoryContext";

function ShopContent() {
  const searchParams = useSearchParams();
  const selectedCategoryParam = searchParams.get("category");
  const { products, isLoading } = useInventory();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(selectedCategoryParam || "All");

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    const uniqueCats = Array.from(cats).filter(c => c.toLowerCase() !== "all");
    return ["All", ...uniqueCats];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      const matchSearch = !q || p.nameEn.toLowerCase().includes(q) || (p.nameNp && p.nameNp.includes(q));
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, activeCategory]);

  const inStockCount = filtered.filter(p => p.inStock).length;

  return (
    <div className="max-w-[90rem] mx-auto px-4 md:px-8 pt-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {activeCategory === "All" ? "Full Catalog" : activeCategory}
          </h1>
          <p className="text-slate-500 font-medium mt-2">{filtered.length} products · {inStockCount} in stock</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X size={14} className="text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
        <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
          <Filter size={18} />
        </div>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === cat
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8 animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/50 border border-slate-100 rounded-3xl shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
            <Package className="text-slate-300 w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-800">No Products Found</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-sm">Try adjusting your search or filters.</p>
          <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg active:scale-95">
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} data={product as any} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ShopContent />
      </Suspense>
    </main>
  );
}