"use client";

import React from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Product } from "@/context/InventoryContext";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type ProductListSecProps = {
  title: string;
  data: Product[];
  viewAllLink?: string;
};

const ProductListSec = ({ title, data, viewAllLink }: ProductListSecProps) => {
  return (
    <section className="max-w-[90rem] mx-auto px-4 md:px-8 mt-12 sm:mt-24 mb-16">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-px bg-indigo-200" />
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
               <Sparkles size={12} /> Curated Selection
             </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none"
          >
            {title}
          </motion.h2>
        </div>

        {viewAllLink && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link 
              href={viewAllLink} 
              className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-900 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md active:scale-95 uppercase tracking-widest"
            >
              Explore Catalog 
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Grid with Staggered Animation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8">
        {data.length > 0 ? (
          data.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <ProductCard data={product as any} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
            <Sparkles size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-black text-slate-400">No products found in this selection.</p>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">Refine filters or check back later</p>
          </div>
        )}
      </div>
    
      {/* Mobile View All Button (Visible if link provided) */}
      {viewAllLink && (
        <div className="mt-10 flex justify-center md:hidden">
          <Link 
            href={viewAllLink} 
            className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 rounded-[1.5rem] text-sm font-black text-white active:scale-95 transition-transform uppercase tracking-widest shadow-xl shadow-slate-900/20"
          >
            View Full Catalog <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </section>
  );
};

export default ProductListSec;