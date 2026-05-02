"use client";

import { cn } from "@/lib/utils";
import React from "react";
import Link from "next/link";
import { MapPin, Phone, MessageCircle, ChevronUp, ArrowRight, Package, Mail } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <footer className="relative mt-24 bg-[#fafafa] border-t border-slate-200/50 overflow-hidden">
      
      {/* ULTRA-PREMIUM AMBIENT GLOWS */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-green-500/5 blur-[150px] pointer-events-none rounded-full" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 pt-20 pb-8 px-5 xl:px-0 max-w-frame mx-auto"
      >
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-14 gap-x-10 mb-20">
          
          {/* 1. BRAND & IDENTITY */}
          <motion.div variants={itemVariants} className="flex flex-col lg:col-span-4">
            <Link href="/" className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 lowercase mb-6 w-fit">
              rabindra<span className="text-green-600">store.</span>
            </Link>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium pr-4">
              Simraungadh's premier wholesale infrastructure. Powering local businesses with premium inventory, direct pricing, and seamless logistics.
            </p>
            <div className="flex items-start gap-3 text-sm font-semibold text-slate-700 bg-white w-fit px-5 py-3.5 rounded-2xl border border-slate-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <MapPin size={18} className="text-green-500 shrink-0 mt-0.5" />
              <span>Simraungadh, Madhesh<br/><span className="text-slate-400 font-medium">Nepal</span></span>
            </div>
          </motion.div>

         

          {/* 3. CONNECT & NEWSLETTER (The Enterprise Touch) */}
          <motion.div variants={itemVariants} className="flex flex-col lg:col-span-4 lg:items-end">
            <div className="w-full lg:w-[320px] flex flex-col">
              
              {/* iOS Style Widget Cards */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <a href="https://wa.me/9779860117783" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:border-green-200 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle size={20} className="text-green-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">WhatsApp</span>
                </a>
                <a href="tel:+9779860117783" className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200 hover:border-slate-300 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Phone size={20} className="text-slate-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Call Us</span>
                </a>
              </div>

             {/* Upgraded Newsletter Widget */}
              <div className="flex flex-col gap-2">
                <form 
                  onSubmit={(e) => { e.preventDefault(); /* Add your subscribe logic here */ }}
                  className="bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center focus-within:border-green-500/40 focus-within:ring-4 focus-within:ring-green-500/10 transition-all duration-300"
                >
                  <div className="pl-3 pr-2 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder="Get live rate alerts..." 
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-green-600 transition-colors text-white text-xs font-bold rounded-xl whitespace-nowrap active:scale-95 shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
                
                {/* Professional Direct Email Link */}
                <a 
                  href="mailto:info@rabindra.store" 
                  className="text-[11px] font-medium text-slate-500 hover:text-green-600 transition-colors ml-1 w-fit flex items-center gap-1"
                >
                  Or email us directly at info@rabindra.store
                </a>
              </div>

            </div>
          </motion.div>
        </div>

        {/* BOTTOM BAR */}
        <motion.div variants={itemVariants} className="relative">
          <hr className="h-px border-t border-slate-200/60 mb-8" />
          
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            
             {/* Micro-Badges (Full Nepali Payment Stack) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 w-full lg:w-auto">
               
               {/* eSewa */}
               <div className="px-3 py-1.5 bg-[#60bb46]/5 border border-[#60bb46]/20 rounded-lg">
                 <span className="text-[12px] font-black tracking-wider text-[#60bb46]">eSewa</span>
               </div>
               
               {/* Fonepay */}
               <div className="px-3 py-1.5 bg-[#e31837]/5 border border-[#e31837]/20 rounded-lg">
                 <span className="text-[12px] font-black tracking-wider text-[#e31837]">fonepay</span>
               </div>

               {/* NEW: Khalti */}
               <div className="px-3 py-1.5 bg-[#5C2D91]/5 border border-[#5C2D91]/20 rounded-lg">
                 <span className="text-[10px] font-black tracking-wider text-[#5C2D91] uppercase">Khalti</span>
               </div>

               {/* NEW: ConnectIPS */}
               <div className="px-3 py-1.5 bg-[#00509D]/5 border border-[#00509D]/20 rounded-lg">
                 <span className="text-[10px] font-black tracking-wider text-[#00509D]">connectIPS</span>
               </div>

               {/* NEW: Cash Payment */}
               <div className="px-3 py-1.5 bg-yellow-50/50 border border-yellow-200/60 rounded-lg">
                 <span className="text-[10px] font-bold tracking-wider text-yellow-700 uppercase">Cash Payment</span>
               </div>

               {/* Bank Transfer */}
               <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                 <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">Bank Transfer</span>
               </div>

               {/* NEW: Cash on Delivery (B2B Standard) */}
               <div className="px-3 py-1.5 bg-green-50/50 border border-green-200/60 rounded-lg">
                 <span className="text-[10px] font-bold tracking-wider text-green-700 uppercase">Cash on Delivery</span>
               </div>

            </div>

            {/* Copyright & Dev Signature */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400 font-medium text-center sm:text-left w-full lg:w-auto">
              <p>© {new Date().getFullYear()} Rabindra Store. All rights reserved.</p>
              <span className="hidden sm:inline text-slate-200">|</span>
              <p>
                Developed by <a href="https://www.facebook.com/stayrahul" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-800 hover:text-green-600 transition-colors">Sushant Kushwaha</a>
              </p>
            </div>
            
            {/* FLOATING Back to Top Button */}
            <button 
              onClick={scrollToTop}
              className="absolute -top-16 right-0 lg:static lg:mt-0 p-3.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:border-green-200 hover:-translate-y-1 text-slate-400 hover:text-green-600 transition-all duration-300 active:scale-95"
              aria-label="Scroll to top"
            >
              <ChevronUp size={18} strokeWidth={2.5} />
            </button>

          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
