"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiMapPin } from "react-icons/fi";
import { useInventory } from "@/context/InventoryContext";

export default function StorePulse() {
  const { settings } = useInventory();
  const [status, setStatus] = useState({ label: "Checking...", color: "bg-slate-400" });

  useEffect(() => {
    if (!settings) return;

    const checkStatus = () => {
      if (settings.holidayMode) {
        return setStatus({ label: "Store Holiday", color: "bg-rose-500" });
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [openH, openM] = (settings.openingTime || "08:00").split(':').map(Number);
      const [closeH, closeM] = (settings.closingTime || "20:00").split(':').map(Number);
      
      const openTime = openH * 60 + openM;
      const closeTime = closeH * 60 + closeM;

      if (currentTime >= openTime && currentTime < closeTime) {
        if (closeTime - currentTime < 60) {
          setStatus({ label: "Closing Soon", color: "bg-amber-500" });
        } else {
          setStatus({ label: "Open Now", color: "bg-emerald-500" });
        }
      } else {
        setStatus({ label: "Closed", color: "bg-slate-500" });
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 60000);
    return () => clearInterval(timer);
  }, [settings]);

  if (!settings) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[80] hidden sm:block">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-2.5 pr-5 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
      >
        <div className="relative">
          <div className={`w-10 h-10 ${status.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
            <FiClock size={18} />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 ${status.color} rounded-full -z-10`}
          />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Simraungadh</p>
          <p className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">{status.label}</p>
        </div>
      </motion.div>
    </div>
  );
}
