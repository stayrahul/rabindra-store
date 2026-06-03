"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
        >
          <div className="relative flex flex-col items-center justify-center px-8">
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              className="mb-6 relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-indigo-200">
                <ShoppingBag className="text-white w-9 h-9" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                RABINDRA<span className="text-indigo-600">.</span>
              </h1>
              <p className="mt-2.5 text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px]">
                Premium Wholesale
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="h-1 w-52 bg-slate-100 mt-8 rounded-full overflow-hidden relative"
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  duration: 0.9, 
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest"
            >
              Simraungadh, Nepal
            </motion.p>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}