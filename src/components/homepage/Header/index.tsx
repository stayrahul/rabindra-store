"use client";

import { integralCF } from "@/styles/fonts";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Zap, Star } from "lucide-react";

const TICKER_ITEMS = [
  "SUGAR (50KG)", "BASMATI RICE (25KG)", "MUSTARD OIL (15L)", 
  "AASHIRVAAD ATTA (50KG)", "SOYABEAN OIL (15L)", "DAAL (25KG)", 
  "TEA LEAVES (3KG)", "SALT (50KG)",
];

const Hero = () => {
  // FIX: Force component to mount visible if JS fails on iPad
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <header className="relative bg-[#fafafa] pb-16 sm:pb-20 overflow-hidden border-b border-slate-200/60 min-h-[70vh] sm:min-h-[80vh] flex flex-col justify-center">
      
      {/* ENTERPRISE LOGISTICS GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      
      {/* FIX: Removed blur-[80px] which crashes iPads. Replaced with a lightweight radial gradient. */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[300px] pointer-events-none z-0" 
           style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)' }}
      />

      {/* LIVE MARKET TICKER */}
      <div className="absolute top-0 w-full bg-slate-900 border-b border-slate-800 flex overflow-hidden z-20 py-1.5 sm:py-2">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap items-center gap-6 sm:gap-8 px-4"
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-xs font-bold tracking-wider text-slate-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-frame mx-auto px-4 xl:px-0 relative z-10 pt-20 sm:pt-24">
        <motion.section
          variants={containerVariants}
          // FIX: Bypasses the opacity: 0 lock on iOS Safari
          initial={isMounted ? "hidden" : "visible"}
          animate="visible"
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 bg-white border border-slate-200/80 text-slate-500 font-bold text-[10px] sm:text-[11px] rounded-full mb-6 sm:mb-8 tracking-widest shadow-sm uppercase">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
            live market rates • estd. 2026
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-[36px] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 text-slate-800 tracking-tighter lowercase font-semibold">
            powering <br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-700 pb-1">
              local commerce.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-500 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-2xl leading-relaxed font-medium px-2 sm:px-0">
            powering local businesses with premium grains, pure oils, and daily essentials. lock in your bulk inventory directly via whatsapp.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col items-center w-full max-w-xs sm:max-w-none mx-auto">
            <div className="w-full sm:w-auto mb-6 sm:mb-8">
              <a href="https://wa.me/9779860117783" target="_blank" rel="noreferrer" className="group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 transition-all text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-xl active:scale-95">
                <MessageCircle size={18} className="text-green-400 sm:w-5 sm:h-5" />
                <span>order via whatsapp</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform opacity-70 sm:w-[18px] sm:h-[18px]" />
              </a>
            </div>

            {/* FIX: Removed backdrop-blur-md here as well to protect the iPad */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold text-slate-500 bg-white/95 border border-slate-200/50 px-4 sm:px-5 py-3 sm:py-2.5 rounded-2xl sm:rounded-full shadow-sm w-full sm:w-auto">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] text-slate-500 z-30">R1</div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-[8px] text-green-700 z-20">S2</div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-white z-10"><Star size={8} /></div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                <div className="flex text-yellow-400">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                </div>
                  <span>fueling <span className="text-slate-800">50+ local businesses</span></span>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </header>
  );
};

export default Hero;