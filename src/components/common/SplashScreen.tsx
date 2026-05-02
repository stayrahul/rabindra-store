"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          // FIX 1: Removed the problematic filter: "blur(10px)" from the exit animation
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          // FIX 2: Removed backdrop-blur completely. Using a solid bg-slate-50.
          // This guarantees 0% chance of Safari rendering glitches.
          className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col items-center justify-center"
        >
          <div className="relative flex flex-col items-center justify-center px-8">
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="mb-5 relative"
            >
              <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                <ShoppingBag className="text-white w-8 h-8" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-indigo-600 rounded-full border-[3px] border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                RABINDRA<span className="text-indigo-600">.</span>
              </h1>
              <p className="mt-2 text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px]">
                Wholesale Store
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="h-1 w-48 bg-slate-200/60 mt-8 rounded-full overflow-hidden relative"
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="absolute inset-0 w-1/2 bg-indigo-600 rounded-full"
              />
            </motion.div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}