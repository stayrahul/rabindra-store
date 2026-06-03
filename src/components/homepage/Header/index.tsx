"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Zap, Star, Package, Shield, Truck, Clock } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useInventory();

  useEffect(() => setIsMounted(true), []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const whatsappNumber = settings?.whatsappNumber || "9779860117783";
  const storeName = settings?.storeName || "Rabindra Store";

  const tickerItems = [
    "SUGAR (50KG)", "BASMATI RICE (25KG)", "MUSTARD OIL (15L)",
    "AASHIRVAAD ATTA (50KG)", "SOYABEAN OIL (15L)", "DAAL (25KG)",
    "TEA LEAVES (3KG)", "SALT (50KG)", "GHEE (15KG)", "BESAN (25KG)",
  ];

  const stats = [
    { value: "50+", label: "Business Partners" },
    { value: "500+", label: "Products Listed" },

  ];

  return (
    <header className="relative bg-white pb-8 sm:pb-12 overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex flex-col">

      {/* GRID PATTERN */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* ACCENT GLOWS */}
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }}
      />

      {/* LIVE MARKET TICKER */}
      <div className="w-full bg-slate-900 flex overflow-hidden z-20 py-2">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap items-center gap-8 px-4"
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold tracking-wider text-slate-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col justify-center max-w-frame mx-auto px-4 xl:px-0 relative z-10 py-12 sm:py-16">
        <motion.section
          variants={containerVariants}
          initial={isMounted ? "hidden" : "visible"}
          animate="visible"
          className="max-w-5xl mx-auto w-full"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[11px] rounded-full tracking-widest uppercase">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              live wholesale rates • {settings?.address || "Simraungadh"}
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-center text-[40px] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl mb-6 text-slate-900 tracking-tighter font-black">
            Premium Wholesale
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-emerald-500 to-teal-600">
              for Local Business.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-center text-slate-500 text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
            {settings?.storeDescription || "Grains, oils, spices, and daily essentials at unbeatable bulk rates. Direct pricing, zero middlemen, instant WhatsApp ordering."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 px-4 sm:px-0">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              <MessageCircle size={20} className="text-emerald-400" />
              <span>Order via WhatsApp</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform opacity-70" />
            </a>
            <a
              href="#catalog"
              onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-base hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all active:scale-95"
            >
              <Package size={18} />
              <span>Browse Catalog</span>
            </a>
          </motion.div>

          {/* STATS ROW */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 mb-12">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`flex items-center gap-3 px-8 py-3 ${i < stats.length - 1 ? 'sm:border-r sm:border-slate-200' : ''}`}>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* TRUST BAR */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-5 py-3 rounded-full shadow-sm">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[9px] font-black text-indigo-600 z-30">RS</div>
                <div className="w-7 h-7 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[9px] font-black text-emerald-600 z-20">SK</div>
                <div className="w-7 h-7 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-[9px] font-black text-amber-600 z-10">MK</div>
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-white z-0"><Star size={9} fill="currentColor" /></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3" fill="currentColor" />)}
                </div>
                <span>Trusted by <span className="text-slate-800 font-black">50+ businesses</span> in Madhesh</span>
              </div>
            </div>
          </motion.div>

        </motion.section>
      </div>

      {/* BOTTOM BORDER GRADIENT */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </header>
  );
};

export default Hero;