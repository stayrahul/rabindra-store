'use client';

import React from "react";
import * as motion from "framer-motion/client";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product.types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ProductListSecProps = {
  title: string;
  data: Product[];
  viewAllLink?: string; // Optional: Link to the full catalog category
};

const ProductListSec = ({ title, data, viewAllLink }: ProductListSecProps) => {
  return (
    <section className="max-w-[90rem] mx-auto px-4 md:px-8 mt-12 sm:mt-20 mb-10">
      
      {/* Header Area with Title and Desktop "View All" */}
      <div className="flex items-end justify-between mb-6 sm:mb-10">
        <motion.h2
          initial={{ y: "20px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl font-black lowercase tracking-tight text-slate-900"
        >
          {title}
        </motion.h2>

        {/* Desktop View All Link */}
        {viewAllLink && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="hidden sm:block pb-1"
          >
            <Link 
              href={viewAllLink} 
              className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              View Catalog 
              <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Grid: Removed the whileHover wrapper to let ProductCard shine */}
      <motion.div
        initial={{ y: "30px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6"
      >
        {data.map((product) => (
         <ProductCard key={product.id} data={product as any} />
        ))}
      </motion.div>
    
      {/* Mobile View All Button */}
      {viewAllLink && (
        <div className="mt-8 flex justify-center sm:hidden">
          <Link 
            href={viewAllLink} 
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 rounded-xl text-sm font-black text-slate-800 active:scale-95 transition-transform uppercase tracking-widest"
          >
            View Catalog <ArrowRight size={16} strokeWidth={3} />
          </Link>
        </div>
      )}
    </section>
  );
};

export default ProductListSec;