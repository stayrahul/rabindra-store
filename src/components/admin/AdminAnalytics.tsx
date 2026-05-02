"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiDollarSign, FiShoppingBag, FiActivity, FiTrendingUp, 
  FiDownload, FiAlertTriangle, FiClock, FiArrowRight, FiRefreshCw, FiInfo
} from "react-icons/fi";
import { supabase } from "@/utils/supabase";

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // REAL-TIME STATE
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    avgOrder: 0,
    conversion: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // FETCH LIVE DATA FROM SUPABASE
  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Low Stock Items (Items with stock < 10)
      const { data: stockData } = await supabase
        .from('products')
        .select('nameEn, variants')
        .lt('stock', 10); // Assuming you have a 'stock' column

      // 2. Fetch Recent Orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // 3. Calculate Totals (Mock calculation if table is empty)
      if (orderData) {
        const totalRev = orderData.reduce((acc, curr) => acc + (curr.total || 0), 0);
        setStats({
          revenue: totalRev,
          orders: orderData.length,
          avgOrder: orderData.length > 0 ? totalRev / orderData.length : 0,
          conversion: 0 // Placeholder until Traffic API is connected
        });
        setRecentOrders(orderData);
      }

      setLowStock(stockData || []);
    } catch (error) {
      console.error("Analytics Sync Error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'NPR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
      <FiRefreshCw className="animate-spin text-indigo-500" size={32} />
      <p className="font-black uppercase tracking-widest text-xs">Syncing Live Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-[90rem] mx-auto space-y-8 pb-12 selection:bg-indigo-100">
      
      {/* COMMAND BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Ledger Intelligence</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time synchronization with Supabase.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAnalytics}
            className="p-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all shadow-sm"
          >
            <FiRefreshCw className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
            <FiDownload /> Audit Report
          </button>
        </div>
      </div>

      {/* DYNAMIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Net Revenue", value: formatCurrency(stats.revenue), icon: FiDollarSign, color: "emerald" },
          { label: "Total Orders", value: stats.orders, icon: FiShoppingBag, color: "indigo" },
          { label: "Average Basket", value: formatCurrency(stats.avgOrder), icon: FiActivity, color: "blue" },
          { label: "Site Traffic", value: "---", icon: FiTrendingUp, color: "slate" },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            key={i} 
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-2xl mb-6 shadow-inner border border-${stat.color}-100`}>
              <stat.icon />
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LIVE INVENTORY MONITOR */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <FiAlertTriangle className="text-amber-500" /> Stock Vulnerabilities
            </h3>
            {lowStock.length === 0 && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Healthy</span>}
          </div>

          {lowStock.length > 0 ? (
            <div className="space-y-4">
              {lowStock.map((item: any, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/30">
                  <span className="font-bold text-slate-800">{item.nameEn}</span>
                  <span className="bg-white px-4 py-1.5 rounded-xl border border-rose-100 text-rose-600 font-black text-sm">Critical</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <FiActivity size={32} />
              </div>
              <p className="text-slate-400 font-bold text-sm">All inventory levels are above safety thresholds.</p>
            </div>
          )}
        </div>

        {/* RECENT ORDER STREAM */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
            <FiClock className="text-indigo-500" /> Live Feed
          </h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-6">
              {recentOrders.map((order: any, i) => (
                <div key={i} className="flex flex-col gap-1 border-l-2 border-slate-100 pl-6 relative">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900 text-sm">Order #{order.id.slice(-4)}</span>
                    <span className="text-emerald-600 font-black text-sm">{formatCurrency(order.total)}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FiInfo className="mx-auto text-slate-200 mb-3" size={40} />
              <p className="text-slate-400 font-bold text-sm">Waiting for incoming orders...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}