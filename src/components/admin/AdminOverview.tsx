"use client";

import { useMemo, useState, useEffect } from "react";
import { 
  FiBox, FiAlertCircle, FiCheckCircle, 
  FiActivity, FiArrowRight, FiPackage, FiClock, FiRefreshCcw,
  FiAlertTriangle, FiBarChart2, FiDollarSign, FiTrendingUp, FiTrendingDown
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/context/InventoryContext";

// --- 1. TYPES & INTERFACES ---
interface Product {
  id: string | number;
  nameEn: string;
  category: string;
  inStock: boolean;
  stockQty?: number;
  unitPrice?: number;
}

// --- 2. FALLBACK MOCK DATA ---
const REALISTIC_MOCK_CATALOG: Product[] = [
  { id: 101, nameEn: "Wai Wai Noodles (Chicken) - 30 Pcs", category: "Packaged Foods", inStock: true, stockQty: 150, unitPrice: 550 },
  { id: 102, nameEn: "Fortune Sunflower Oil - 1L x 10", category: "Edible Oils", inStock: true, stockQty: 45, unitPrice: 2800 },
  { id: 103, nameEn: "Premium Basmati Rice - 25kg Sack", category: "Grains & Pulses", inStock: true, stockQty: 12, unitPrice: 3200 },
  { id: 104, nameEn: "DDC Pure Ghee - 1L Jar", category: "Dairy", inStock: false, stockQty: 0, unitPrice: 1150 },
  { id: 105, nameEn: "Aashirvaad Whole Wheat Atta - 5kg", category: "Grains & Pulses", inStock: true, stockQty: 85, unitPrice: 480 },
  { id: 106, nameEn: "Nescafé Classic Coffee - 200g Jar", category: "Beverages", inStock: false, stockQty: 0, unitPrice: 850 },
  { id: 107, nameEn: "Refined Sugar (Sakhhar) - 50kg Sack", category: "Baking & Spices", inStock: true, stockQty: 5, unitPrice: 4500 },
  { id: 111, nameEn: "Current Hot & Spicy - Carton", category: "Packaged Foods", inStock: true, stockQty: 110, unitPrice: 600 },
];

// --- 3. ANIMATION VARIANTS (Moved Outside) ---
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } } };

// --- 4. ISOLATED LIVE CLOCK COMPONENT ---
// This prevents the whole dashboard from re-rendering every second
const LiveClock = () => {
  const [realTime, setRealTime] = useState<string>("Syncing...");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setRealTime(now.toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      }) + " Sync");
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold font-mono">
      <FiClock size={12} className="animate-pulse text-indigo-400" /> {realTime}
    </span>
  );
};

// --- 5. ISOLATED STAT CARD COMPONENT (Moved Outside) ---
// Prevents React from destroying and rebuilding the cards
const StatCard = ({ title, value, subtitle, icon: Icon, theme, trend, trendValue }: any) => {
  const themes = {
    indigo: "bg-indigo-50/50 text-indigo-600 border-indigo-100/50 shadow-indigo-500/5",
    emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100/50 shadow-emerald-500/5",
    rose: "bg-rose-50/50 text-rose-600 border-rose-100/50 shadow-rose-500/5",
    amber: "bg-amber-50/50 text-amber-600 border-amber-100/50 shadow-amber-500/5",
    blue: "bg-blue-50/50 text-blue-600 border-blue-100/50 shadow-blue-500/5",
  };
  
  return (
    <motion.div variants={itemVariants} className="relative bg-white p-7 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 group overflow-hidden flex flex-col justify-between h-[160px]">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl transition-transform group-hover:rotate-12 group-hover:scale-110 duration-500 border ${themes[theme as keyof typeof themes]}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative z-10 mt-4 flex items-center justify-between">
        {subtitle && <p className="text-xs font-bold text-slate-500">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black tracking-wider px-2 py-1 rounded-md ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {trend === 'up' ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-500 z-0 ${themes[theme as keyof typeof themes].split(' ')[0]}`} />
    </motion.div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function AdminOverview() {
  const { products: contextProducts, isLoading } = useInventory();
  const products = contextProducts?.length > 0 ? contextProducts : REALISTIC_MOCK_CATALOG;

  const analytics = useMemo(() => {
    if (!products) return null;

    const total = products.length;
    let inStock = 0;
    let totalValue = 0;
    
    const catMap = products.reduce((acc: Record<string, number>, curr: Product) => {
      if (curr.inStock || (curr.stockQty && curr.stockQty > 0)) inStock++;
      totalValue += ((curr.stockQty || 0) * (curr.unitPrice || 0));
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {});

    const outOfStock = total - inStock;
    const health = total > 0 ? Math.round((inStock / total) * 100) : 0;
    const sortedCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const formattedValue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(totalValue);

    return { total, inStock, outOfStock, health, sortedCategories, formattedValue };
  }, [products]);

  if (isLoading && !analytics) {
    return (
      <div className="space-y-8 animate-pulse p-2">
        <div className="flex justify-between items-end border-b border-slate-100 pb-6">
          <div className="space-y-3">
            <div className="h-10 w-72 bg-slate-200/60 rounded-xl" />
            <div className="h-5 w-56 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-12 w-40 bg-slate-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-50 border border-slate-100 rounded-[2rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-slate-50 border border-slate-100 rounded-[2.5rem]" />
          <div className="h-[400px] bg-slate-100/50 border border-slate-100 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-8 pb-12 selection:bg-indigo-100">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05)_0,transparent_100%)] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">Master Node</span>
            <LiveClock /> {/* THE ISOLATED CLOCK NOW LIVES HERE */}
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Business Intelligence</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time financial and stock telemetry.</p>
        </div>

        <div className="relative z-10 bg-emerald-50/80 px-5 py-3 rounded-2xl border border-emerald-200/50 flex items-center gap-3 shadow-sm shrink-0 backdrop-blur-sm">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest leading-tight">Engine Live</span>
            <span className="text-emerald-900 font-bold text-xs leading-tight">{analytics.total} SKUs Tracked</span>
          </div>
        </div>
      </div>

      {/* --- CORE METRICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Active Stock" value={analytics.inStock} subtitle="Ready for dispatch" icon={FiCheckCircle} theme="emerald" trend="up" trendValue="4.2%" />
        <StatCard title="Shortages" value={analytics.outOfStock} subtitle="Requires action" icon={FiAlertTriangle} theme="rose" trend="down" trendValue="-2.1%" />
        <StatCard title="System Health" value={`${analytics.health}%`} subtitle="Stock availability ratio" icon={FiActivity} theme="amber" trend="up" trendValue="1.8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- CATEGORY DISTRIBUTION (LEFT) --- */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] border border-slate-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><FiBarChart2 size={20} /></div>
                Volume by Category
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-2 ml-14 uppercase tracking-widest">Top performing segments</p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-xl border border-slate-200">
              <FiRefreshCcw size={12} /> Sync
            </button>
          </div>
          
          <div className="space-y-7">
            {analytics.sortedCategories.map(([category, count], index) => {
              const percentage = Math.round((count / analytics.total) * 100) || 0;
              return (
                <div key={category} className="group relative">
                  <div className="flex justify-between items-end mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-[10px] font-black text-slate-300">0{index + 1}</span>
                      <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{category}</span>
                    </div>
                    <div className="text-right leading-none flex items-baseline gap-3">
                      <span className="text-base font-black text-slate-900">{count} SKUs</span>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden ml-8" style={{ width: 'calc(100% - 2rem)' }}>
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
                      className="bg-indigo-500 h-full rounded-full relative overflow-hidden" 
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* --- CRITICAL ALERTS (RIGHT) --- */}
        <motion.div 
          variants={itemVariants}
          className={`flex flex-col p-8 md:p-10 rounded-[2.5rem] border shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] h-[600px] transition-colors duration-500 ${
            analytics.outOfStock > 0 ? 'bg-rose-50/40 border-rose-100/60' : 'bg-emerald-50/40 border-emerald-100/60'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-black uppercase tracking-[0.15em] text-xs flex items-center gap-2 ${analytics.outOfStock > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              <FiAlertCircle size={16} strokeWidth={2.5} />
              {analytics.outOfStock > 0 ? 'Depleted Stock' : 'Clearance Zero'}
            </h3>
            {analytics.outOfStock > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md animate-pulse tracking-widest shadow-sm">
                ACTION REQ
              </span>
            )}
          </div>

          {analytics.outOfStock > 0 ? (
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 -mr-2">
              <AnimatePresence>
                {products.filter((p: Product) => !p.inStock || p.stockQty === 0).map((p: Product, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    key={p.id} 
                    className="bg-white p-4 rounded-2xl border border-rose-100/50 shadow-sm flex items-center justify-between group cursor-pointer hover:border-rose-300 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex flex-col pr-4">
                      <p className="font-black text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{p.nameEn}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-wider">0 Units</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{p.category}</span>
                      </div>
                    </div>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                      <FiArrowRight className="text-rose-500 group-hover:text-white transition-colors" size={14} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-100/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FiCheckCircle className="text-4xl text-emerald-500" />
              </div>
              <p className="text-slate-800 font-black text-xl tracking-tight">Optimal Levels</p>
              <p className="text-slate-500 text-sm font-medium mt-2 max-w-[200px]">All tracked SKUs are currently available for fulfillment.</p>
            </div>
          )}

          {analytics.outOfStock > 0 && (
            <div className="mt-6 pt-6 border-t border-rose-200/50">
              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg shadow-rose-500/20 active:scale-[0.98]">
                Generate Purchase Order
              </button>
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
