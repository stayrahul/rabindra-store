"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center mx-auto relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <ShoppingBag className="text-indigo-600 w-10 h-10 relative z-10" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4">
          404<span className="text-indigo-600">.</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-4">
          Item not found in catalog
        </h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to the wholesale market.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/" 
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 shadow-xl shadow-slate-900/20 transition-all active:scale-95"
          >
            <ArrowLeft size={18} /> Back to Catalog
          </Link>
          <Link 
            href="/shop" 
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <Search size={18} /> Search Products
          </Link>
        </div>
      </motion.div>

      <div className="mt-16 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
        Rabindra Store · Premium Wholesale
      </div>
    </div>
  );
}
