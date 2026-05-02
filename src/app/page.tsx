"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiPackage, FiSearch, FiX, FiCheck } from "react-icons/fi";
import { useInventory } from "@/context/InventoryContext";
import Header from "@/components/homepage/Header"; 
import { Product } from "@/context/InventoryContext";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/carts/cartsSlice";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function HomePage() {
  const { products, isLoading } = useInventory();
  const dispatch = useDispatch(); // Initialize Dispatch
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const availableProducts = useMemo(() => {
    return products?.filter(product => product.inStock) || [];
  }, [products]);

  const activeCategories = useMemo(() => {
    const categories = new Set(availableProducts.map(p => p.category));
    return ["All", ...Array.from(categories)];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return availableProducts.filter(p => {
      const matchesSearch = query === "" || 
        p.nameEn.toLowerCase().includes(query) || 
        (p.nameNp && p.nameNp.includes(query));
      
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [availableProducts, search, selectedCategory]);

  // FIXED: Now actually dispatches to Redux
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    // Pick the first unit available as a default for quick-add from home
    const defaultUnit = product.units?.[0] || "Standard";

    dispatch(
      addToCart({
        id: `${product.id}-${defaultUnit}`,
        name: product.nameEn,
        nepaliName: product.nameNp || "",
        srcUrl: product.imageUrl,
        imageUrl: product.imageUrl,
        unit: defaultUnit,
        quantity: 1,
      })
    );

    // Show visual feedback
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main className="max-w-[90rem] mx-auto p-4 md:p-8 pb-24">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4 md:mt-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Wholesale Catalog</h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg font-medium">Browse our latest stock of premium groceries and supplies.</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..." 
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold shadow-sm text-sm" 
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        {!isLoading && activeCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide mb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {activeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* CONTENT */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-pulse">
                <div className="w-full aspect-square bg-slate-100"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full w-1/3"></div>
                  <div className="h-6 bg-slate-100 rounded-full w-3/4"></div>
                  <div className="h-10 bg-slate-50 rounded-xl w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 px-4 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm mt-4">
            <FiPackage className="text-5xl text-slate-300 mb-6" />
            <h3 className="text-2xl font-black text-slate-800">No matches found</h3>
            <button 
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="mt-6 px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product, i) => (
                <motion.div 
                  key={product.id}
                  layout
                  variants={cardVariants} 
                  className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  <Link href={`/product/${product.id}`} className="relative w-full aspect-square bg-slate-50 overflow-hidden block">
                    <Image
                      src={product.imageUrl || "/placeholder.png"}
                      alt={product.nameEn}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      priority={i < 4} 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-4 md:p-5 flex flex-col flex-1 border-t border-slate-50">
                    <Link href={`/product/${product.id}`} className="block group/text">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 block">
                        {product.category}
                      </span>
                      <h2 className="font-black text-slate-900 text-base md:text-lg leading-tight line-clamp-2 group-hover/text:text-indigo-600 transition-colors">
                        {product.nameEn}
                      </h2>
                      <p className="text-xs md:text-sm font-bold text-slate-400 mt-1 line-clamp-1">
                        {product.nameNp || "—"}
                      </p>
                    </Link>

                    

                    <div className="mt-auto pt-4">
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full font-bold py-3 md:py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm md:text-base ${
                          addedItem === product.id 
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" 
                            : "bg-slate-900 hover:bg-indigo-600 text-white shadow-lg shadow-slate-100"
                        }`}
                      >
                        {addedItem === product.id ? (
                          <><FiCheck size={18} /> Added!</>
                        ) : (
                          <><FiShoppingCart size={18} /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}