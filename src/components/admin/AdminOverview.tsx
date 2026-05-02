"use client";

import { FiBox, FiAlertCircle, FiTrendingUp, FiCheckCircle, FiActivity, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useInventory } from "@/context/InventoryContext";

export default function AdminOverview() {
  const { products, isLoading } = useInventory();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-48 bg-slate-100 rounded-md" />
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white border border-slate-100 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white border border-slate-100 rounded-3xl" />
          <div className="h-80 bg-slate-50 border border-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;
  const healthScore = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;

  const categoryCounts = products.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const StatCard = ({ title, value, icon, colorTheme }: any) => {
    const themes = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      rose: "bg-rose-50 text-rose-600 border-rose-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
    };
    
    return (
      <motion.div
        variants={itemVariants}
        className="relative bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
      >
        <div className="relative z-10 flex items-center gap-5">
          <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500 border ${themes[colorTheme as keyof typeof themes]}`}>
            {icon}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
          </div>
        </div>
        {/* Subtle decorative background gradient */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 rounded-full blur-2xl group-hover:bg-slate-100 transition-colors duration-500 z-0" />
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants} 
      className="space-y-8 pb-10 selection:bg-indigo-100"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Business Intelligence</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Real-time status of your wholesale inventory.</p>
        </div>
        <div className="bg-emerald-50/80 px-4 py-2.5 rounded-full border border-emerald-200/50 flex items-center gap-3 shadow-sm shrink-0">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">System Live: {totalProducts}</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard 
          title="Total Catalog" 
          value={totalProducts} 
          icon={<FiBox className="text-2xl" />} 
          colorTheme="blue"
        />
        <StatCard 
          title="Active Stock" 
          value={inStockCount} 
          icon={<FiCheckCircle className="text-2xl" />} 
          colorTheme="emerald"
        />
        <StatCard 
          title="Stock Alerts" 
          value={outOfStockCount} 
          icon={<FiAlertCircle className="text-2xl" />} 
          colorTheme="rose"
        />
        <StatCard 
          title="Health Score" 
          value={`${healthScore}%`} 
          icon={<FiActivity className="text-2xl" />} 
          colorTheme="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Distribution (Left 2/3) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-200/60"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FiTrendingUp size={18} />
              </div>
              Catalog Distribution
            </h3>
            <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-widest">
              By Category
            </span>
          </div>
          
          <div className="space-y-6">
            {Object.entries(categoryCounts).map(([category, count]) => {
              const percentage = Math.round((count / totalProducts) * 100) || 0;
              return (
                <div key={category} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{category}</span>
                    <div className="text-right leading-none">
                      <span className="text-sm font-black text-slate-800">{count}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1.5 opacity-70">Items</span>
                      <span className="text-xs font-bold text-indigo-500 ml-3">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-indigo-500 h-full rounded-full relative overflow-hidden" 
                    >
                      {/* Shimmer effect inside progress bar */}
                      <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Critical Alerts (Right 1/3) */}
        <motion.div 
          variants={itemVariants}
          className={`flex flex-col p-8 rounded-3xl border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] h-full transition-colors ${
            outOfStockCount > 0 
              ? 'bg-rose-50/30 border-rose-100' 
              : 'bg-emerald-50/30 border-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-black uppercase tracking-widest text-xs flex items-center gap-2 ${outOfStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              <FiAlertCircle size={14} />
              {outOfStockCount > 0 ? 'Inventory Alerts' : 'Status Clear'}
            </h3>
            {outOfStockCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse tracking-wider">
                CRITICAL
              </span>
            )}
          </div>

          {outOfStockCount > 0 ? (
            <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-2 custom-scrollbar">
              {products.filter(p => !p.inStock).map(p => (
                <div 
                  key={p.id} 
                  className="bg-white p-3.5 rounded-2xl border border-rose-100/50 shadow-sm flex items-center justify-between group cursor-pointer hover:border-rose-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col">
                    <p className="font-bold text-slate-800 text-sm truncate max-w-[180px]">{p.nameEn}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{p.category}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <FiArrowRight className="text-rose-500" size={14} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-100/50 rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="text-3xl text-emerald-500" />
              </div>
              <p className="text-slate-800 font-bold text-base">All Good!</p>
              <p className="text-slate-500 text-sm mt-1">Your inventory is fully stocked.</p>
            </div>
          )}

          {outOfStockCount > 0 && (
            <div className="mt-auto pt-6 border-t border-rose-100/50">
              <p className="text-[11px] font-bold text-rose-500 text-center uppercase tracking-widest">
                Requires immediate action
              </p>
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}