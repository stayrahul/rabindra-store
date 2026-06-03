"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLayout, FiSettings, FiPackage, FiZap, FiEdit3, FiEye, FiArrowLeft, FiPieChart } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminQuickBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Simple admin check - in production this would be more robust
    const checkAdmin = () => {
      const status = localStorage.getItem("is_admin") === "true";
      setIsAdmin(status);
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    return () => window.removeEventListener("storage", checkAdmin);
  }, []);

  if (!isAdmin || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]">
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="px-4 py-2 flex items-center gap-2 border-r border-white/10 mr-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Admin Mode</span>
            </div>

            <Link href="/admin" className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all group relative" title="Dashboard">
              <FiLayout size={18} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Dashboard</span>
            </Link>

            <Link href="/admin?tab=rates" className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all group relative" title="Bulk Price Update">
              <FiZap size={18} className="text-yellow-400" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Price Editor</span>
            </Link>

            <Link href="/admin?tab=categories" className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all group relative" title="Manage Categories">
              <FiPieChart size={18} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Analytics</span>
            </Link>

            <Link href="/admin?tab=identity" className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all group relative" title="Store Settings">
              <FiSettings size={18} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Settings</span>
            </Link>

            <button 
              onClick={() => setIsVisible(false)}
              className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-all"
            >
              <FiArrowLeft size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVisible && (
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsVisible(true)}
          className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl border border-white/20 hover:scale-110 transition-transform"
        >
          <FiLayout size={20} />
        </motion.button>
      )}
    </div>
  );
}
