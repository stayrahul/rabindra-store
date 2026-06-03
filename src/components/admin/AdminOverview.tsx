"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiActivity, FiArrowUpRight, FiBox, FiClock, FiDollarSign, 
  FiPackage, FiRefreshCw, FiShoppingCart, FiTag, FiTrendingUp, 
  FiUsers, FiAlertCircle, FiBell, FiPieChart, FiBarChart2, 
  FiCheckCircle, FiChevronRight, FiSearch, FiLayers, FiZap, FiEye,
  FiTrendingDown, FiArchive, FiPlus, FiGrid, FiList
} from "react-icons/fi";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { useInventory } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

export default function AdminOverview() {
  const { products, categories, isLoading, refreshProducts } = useInventory();
  const [greeting, setGreeting] = useState("Good Morning");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      const hour = now.getHours();
      if (hour < 12) setGreeting("शुभ प्रभात / Good Morning");
      else if (hour < 17) setGreeting("शुभ दिन / Good Afternoon");
      else setGreeting("शुभ सन्ध्या / Good Evening");
    };
    updateTime();
    setIsMounted(true);
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── LIVE METRICS FROM SUPABASE DATA ──
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const inStockCount = products.filter(p => p.inStock).length;
    const outOfStockCount = totalProducts - inStockCount;
    const stockRate = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
    
    const catDistribution: Record<string, number> = {};
    products.forEach(p => {
      catDistribution[p.category] = (catDistribution[p.category] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(catDistribution).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0];

    const recommendations = [
      { title: "Restock Priority", desc: `${outOfStockCount} items are out of stock.`, icon: FiAlertCircle, color: "rose" },
      { title: "Inventory Health", desc: `${stockRate}% of catalog is available.`, icon: FiTrendingUp, color: "emerald" },
      { title: "Catalog Expansion", desc: `${categories.length} active categories managed.`, icon: FiTag, color: "amber" },
    ];

    // Mock trend data for visualization
    const trendData = [
      { name: 'Mon', stock: 85, active: 40 },
      { name: 'Tue', stock: 88, active: 45 },
      { name: 'Wed', stock: 82, active: 42 },
      { name: 'Thu', stock: 90, active: 48 },
      { name: 'Fri', stock: 95, active: 55 },
      { name: 'Sat', stock: 92, active: 50 },
      { name: 'Sun', stock: 98, active: 60 },
    ];

    return {
      totalProducts,
      inStockCount,
      outOfStockCount,
      stockRate,
      totalCategories: categories.length,
      topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
      catDistribution,
      recommendations,
      trendData,
      sortedCategories: sortedCategories.slice(0, 5)
    };
  }, [products, categories]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProducts();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const statCards = [
    { label: "Total Products", labelNp: "कुल उत्पादन", value: metrics.totalProducts, icon: FiBox, color: "indigo", sub: "Active Catalog", trend: "+4%" },
    { label: "In Stock", labelNp: "मौज्दात", value: metrics.inStockCount, icon: FiCheckCircle, color: "emerald", sub: `${metrics.stockRate}% availability`, trend: "+2%" },
    { label: "Out of Stock", labelNp: "सकिएको", value: metrics.outOfStockCount, icon: FiAlertCircle, color: "rose", sub: metrics.outOfStockCount > 0 ? "Action Needed" : "Clean Slate", trend: "-12%" },
    { label: "Categories", labelNp: "विभागहरू", value: metrics.totalCategories, icon: FiTag, color: "amber", sub: metrics.topCategory ? `Top: ${metrics.topCategory.name}` : "—", trend: "Stable" },
  ];

  const colorMap: Record<string, { bg: string, text: string, border: string, shadow: string, accent: string }> = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", shadow: "shadow-indigo-100", accent: "bg-indigo-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", shadow: "shadow-emerald-100", accent: "bg-emerald-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", shadow: "shadow-rose-100", accent: "bg-rose-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", shadow: "shadow-amber-100", accent: "bg-amber-500" },
  };

  return (
    <div className="max-w-[90rem] mx-auto space-y-8 pb-20 font-sans selection:bg-indigo-100">
      
      {/* ── HERO COMMAND CENTER ── */}
      <div className="relative bg-slate-900 rounded-[3rem] p-10 md:p-14 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{currentDate}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Rabindra Store.</span>
            </h2>
            <p className="text-slate-400 font-bold max-w-xl text-lg">
              Operational dashboard is live. You are managing <strong className="text-white underline decoration-indigo-500/50 underline-offset-4">{metrics.totalProducts} units</strong> across <strong className="text-white">{metrics.totalCategories} departments</strong>.
            </p>
          </div>

          <div className="flex items-center gap-6">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-right hidden sm:block min-w-[180px]">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">System Pulse</p>
                <p className="text-white font-black text-3xl tracking-tighter">{currentTime}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <FiActivity className="text-emerald-500 animate-pulse" size={14} />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Core Sync: Active</span>
                </div>
             </div>
             <button 
              onClick={handleRefresh} 
              className="w-20 h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] flex items-center justify-center transition-all active:scale-90 shadow-2xl shadow-indigo-600/40 border border-indigo-400/30"
             >
                <FiRefreshCw size={28} className={isRefreshing ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </div>

      {/* ── METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const colors = colorMap[stat.color];
          return (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }} 
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700" />
              
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 relative z-10 border shadow-inner transition-transform group-hover:scale-110", colors.bg, colors.text, colors.border)}>
                <stat.icon size={26} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{(stat as any).labelNp}</p>
                  </div>
                  <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg", stat.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50")}>
                    {stat.trend}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{isLoading ? "—" : stat.value}</p>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Performance</span>
                    <span>{stat.sub}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={cn("h-full rounded-full", colors.accent)} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── INTELLIGENCE & ANALYTICS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Trend Visualization */}
        <div className="xl:col-span-2 bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <FiActivity className="text-indigo-600" /> Catalog Vitality / सूची जीवन्तता
              </h3>
              <p className="text-slate-400 font-bold text-sm mt-1">Live inventory distribution and availability trends</p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button className="px-5 py-2 bg-white shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600">7 Days</button>
              <button className="px-5 py-2 hover:bg-white/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">30 Days</button>
            </div>
          </div>

          <div className="flex-1 w-full h-[400px] relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={metrics.trendData}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900', fontSize: '12px', padding: '16px' }} 
                  />
                  <Area type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorStock)" name="Inventory Heat" />
                  <Area type="monotone" dataKey="active" stroke="#10b981" strokeWidth={4} fillOpacity={0} name="Category Growth" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Recommendations & Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl md:rounded-[3rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <FiZap size={180} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                  <FiZap className="text-yellow-400 animate-pulse" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">AI Insights</h3>
                  <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest opacity-80">Smart Catalog Monitoring</p>
                </div>
              </div>

              <div className="space-y-4">
                {metrics.recommendations.map((rec, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", rec.color === 'rose' ? 'bg-rose-500' : rec.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500')}>
                        <rec.icon size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{rec.title}</p>
                        <p className="text-sm font-bold leading-tight">{rec.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button className="relative z-10 mt-10 w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/40 border border-indigo-400/30 active:scale-95">
              Launch Optimization Tool
            </button>
          </div>
        </div>
      </div>

      {/* ── LOWER ANALYTICS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Category breakdown (Donut) */}
        <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <FiPieChart className="text-indigo-600" /> Category Density / वर्ग घनत्व
                </h3>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Inventory Weight Distribution</p>
              </div>
           </div>
           <div className="flex-1 w-full h-[300px] relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={Object.entries(metrics.catDistribution).map(([name, value]) => ({ name, value }))} 
                      innerRadius={80} 
                      outerRadius={120} 
                      paddingAngle={10} 
                      dataKey="value"
                      stroke="none"
                    >
                      {Object.entries(metrics.catDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900', fontSize: '12px', padding: '16px' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
           </div>
        </div>

        {/* Top Performing Categories (Bar) */}
        <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[500px] xl:col-span-2">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <FiBarChart2 className="text-emerald-600" /> Department Health
                </h3>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Stock availability per category</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out</span>
                </div>
              </div>
           </div>
           <div className="flex-1 w-full h-[300px] relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={metrics.sortedCategories.map(([name, _]) => ({ 
                      name: name.length > 10 ? name.substring(0, 10) + '...' : name, 
                      inStock: products.filter(p => p.category === name && p.inStock).length,
                      outOfStock: products.filter(p => p.category === name && !p.inStock).length
                    }))}
                    barGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900', fontSize: '12px', padding: '16px' }} />
                    <Bar dataKey="inStock" fill="#10b981" radius={[8, 8, 0, 0]} name="In Stock" />
                    <Bar dataKey="outOfStock" fill="#f43f5e" radius={[8, 8, 0, 0]} name="Out of Stock" />
                  </BarChart>
                </ResponsiveContainer>
              )}
           </div>
        </div>

      </div>

      {/* ── RECENT SYSTEM ACTIVITY ── */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Infrastructure Logs</h3>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Live System Audit Trail</p>
          </div>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Full Audit Log</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Source</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { source: 'CATALOG_ENGINE', msg: 'Batch synchronization successful for 142 items', time: 'Just now', status: 'COMPLETE', color: 'emerald' },
                { source: 'AUTH_SERVICE', msg: 'Admin session authenticated via Rabindra-Air', time: '4m ago', status: 'SECURE', color: 'indigo' },
                { source: 'STORAGE_CORE', msg: 'Optimized 12 product images for mobile delivery', time: '12m ago', status: 'OPTIMIZED', color: 'amber' },
                { source: 'INVENTORY_TRACKER', msg: 'Stock alert: 5 items reached low threshold', time: '28m ago', status: 'ALERT', color: 'rose' },
              ].map((log, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-6 pr-4">
                    <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 tracking-tight">{log.source}</span>
                  </td>
                  <td className="py-6 font-bold text-slate-800 text-sm">{log.msg}</td>
                  <td className="py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{log.time}</td>
                  <td className="py-6 text-right">
                    <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm", log.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : log.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : log.color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100')}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", log.color === 'rose' ? 'bg-rose-500' : log.color === 'emerald' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500')} />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
