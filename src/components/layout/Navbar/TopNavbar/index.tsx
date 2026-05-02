"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, ArrowRight, Package, 
  MessageCircle, X, ShoppingBag, Zap, 
  UserCircle2, ChevronRight
} from "lucide-react";
import CartBtn from "./CartBtn";
import * as inventoryData from "@/data/inventory";

const inventory =
  (inventoryData as { inventory?: any[] }).inventory ??
  (inventoryData as { default?: any[] }).default ??
  [];

const SEARCH_SUGGESTIONS = [
  "wholesale inventory...",
  "'चीनी' (Sugar) in bulk...",
  "premium basmati rice...",
  "mustard oil (तोरीको तेल)...",
  "aashirvaad atta 50kg...",
];

const TopNavbar = () => {
  const router = useRouter();
  const [placeholderText, setPlaceholderText] = useState(SEARCH_SUGGESTIONS[0]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Rotating Placeholder Logic
  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      i = (i + 1) % SEARCH_SUGGESTIONS.length;
      setPlaceholderText(SEARCH_SUGGESTIONS[i]);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Cmd+K Shortcut Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live Results Filtering
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = inventory.filter((item) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); 
    setSearchResults(results);
  }, [searchQuery]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-[100] bg-white/70 backdrop-blur-3xl saturate-[1.1] border-b border-black/[0.04]"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-6 h-[76px] gap-6">
        
        {/* LEFT: BRANDING */}
        <Link href="/" className="group flex items-center gap-3.5 shrink-0">
          <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-b from-slate-800 to-slate-950 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-hover:shadow-[0_8px_30px_rgba(79,70,229,0.2)] transition-all duration-500">
            <ShoppingBag className="text-white w-5 h-5 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[22px] font-black text-slate-900 leading-none tracking-[-0.04em]">
              RABINDRA<span className="text-indigo-600">.</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Store</span>
            </div>
          </div>
        </Link>

        {/* CENTER: DESKTOP SEARCH */}
        <div className="hidden lg:flex flex-1 relative max-w-2xl justify-center">
          <div className={cn(
            "w-full max-w-lg flex items-center bg-slate-50 border border-slate-200/60 rounded-full px-5 py-2.5 transition-all duration-300",
            "hover:bg-slate-100/80 hover:border-slate-300",
            isFocused && "bg-white border-indigo-500 shadow-[0_8px_30px_rgba(79,70,229,0.12)] ring-4 ring-indigo-50 hover:bg-white"
          )}>
            <Search className={cn("w-4 h-4 mr-3 transition-colors duration-300", isFocused ? "text-indigo-600" : "text-slate-400")} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={`Search ${placeholderText}`}
              className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
            />
            
            <AnimatePresence mode="wait">
              {!searchQuery ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-400 shadow-sm ml-2"
                >
                  <Command size={10} />
                  <span>K</span>
                </motion.div>
              ) : (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery("")} 
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors ml-2"
                >
                  <X size={14} className="text-slate-600" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          <AnimatePresence>
            {isFocused && searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 16, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden p-2 z-[110]"
              >
                {searchResults.length > 0 ? (
                  <>
                    <div className="px-3 py-2 flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Zap size={12} className="text-amber-500 fill-amber-500" /> Fast Match
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">{searchResults.length} results</span>
                    </div>
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/product/${item.id}`)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                            <Package size={18} className="text-slate-400 group-hover:text-indigo-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.category || 'Wholesale Stock'}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="text-slate-300" size={20} />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No inventory found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching for a different product or category.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* WHATSAPP */}
          <a 
            href="https://wa.me/9779860117783" 
            className="flex items-center gap-2 p-2.5 sm:px-4 sm:py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 rounded-full sm:rounded-xl transition-all border border-emerald-100 group"
          >
            <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:block text-xs font-bold uppercase tracking-wider">Order via WA</span>
          </a>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden lg:block" />

          
          

          {/* CART BUTTON */}
          <div className="relative group flex items-center">
             <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="relative z-10">
               <CartBtn />
             </div>
          </div>

        </div>
      </div>
    </motion.nav>
  );
};

export default TopNavbar;