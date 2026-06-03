"use client";

import { usePathname } from "next/navigation";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/common/BackToTop";
import AdminQuickBar from "../admin/AdminQuickBar";
import StorePulse from "../common/StorePulse";
import { useInventory } from "@/context/InventoryContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiInfo, FiX, FiSettings, FiLock, FiActivity } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, isLoading } = useInventory();

  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [dismissedHoliday, setDismissedHoliday] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  // Sync state with settings once loaded
  useEffect(() => {
    if (settings?.holidayMode) {
      const isDismissed = sessionStorage.getItem("holiday_dismissed");
      if (isDismissed) setDismissedHoliday(true);
    }
  }, [settings]);

  const handleDismissHoliday = () => {
    setDismissedHoliday(true);
    sessionStorage.setItem("holiday_dismissed", "true");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. ANNOUNCEMENT BAR */}
      {!isAdmin && !isLoading && settings?.announcement && showAnnouncement && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="bg-indigo-600 text-white relative z-[110] overflow-hidden"
        >
          <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
            <FiInfo className="text-indigo-200 shrink-0" size={14} />
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center truncate pr-8">
              {settings.announcement}
            </p>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors absolute right-4"
              aria-label="Dismiss"
            >
              <FiX size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. NAVIGATION */}
      {!isAdmin && <TopNavbar />}

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 relative">
        {/* MAINTENANCE MODE OVERLAY */}
        <AnimatePresence>
          {!isAdmin && !isLoading && settings?.maintenanceMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-zinc-950 flex items-center justify-center p-6 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-2xl w-full text-center relative z-10"
              >
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full group-hover:opacity-100 transition-opacity" />
                  <FiSettings className="text-white text-4xl animate-[spin_4s_linear_infinity] relative z-10" />
                </div>

                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 uppercase">
                  System <span className="text-indigo-500">Optimization</span>
                </h2>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mb-10">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Protocol Active</span>
                  </div>
                  <p className="text-zinc-400 font-bold leading-relaxed text-lg">
                    We are currently performing high-density inventory synchronization and system tuning. The storefront will be back online shortly.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  <div className="flex flex-col items-center gap-2">
                    <FiLock className="text-white" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Secure</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <FiActivity className="text-white" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Optimizing</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <FiSettings className="text-white" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Syncing</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOLIDAY MODE OVERLAY */}
        <AnimatePresence>
          {!isAdmin && !isLoading && settings?.holidayMode && !dismissedHoliday && !settings?.maintenanceMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-50 rounded-full opacity-50 blur-3xl" />

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-100">
                    <FiAlertTriangle className="text-rose-500 text-3xl" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Store on Holiday</h2>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {settings.storeName} is currently taking a short break. You can still browse our premium catalog, but please note that <span className="text-slate-900 font-bold">orders and inquiries will be processed once we return.</span>
                  </p>
                  <button
                    onClick={handleDismissHoliday}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Continue Browsing
                  </button>
                  <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Simraungadh · Nepal
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
        <AdminQuickBar />
        <StorePulse />
      </main>

      {/* 4. FOOTER & EXTRAS */}
      {!isAdmin && !pathname?.startsWith("/product/") && <BackToTop />}
      {!isAdmin && <Footer />}
    </div>
  );
}
