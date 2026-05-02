"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiShoppingBag, FiActivity, FiTrendingUp } from "react-icons/fi";

const mockTopProducts = [
  { id: "P-01", name: "Premium Basmati Rice (25kg)", sold: 142, revenue: "Rs. 4,26,000" },
  { id: "P-02", name: "Mustard Oil - Carton", sold: 89, revenue: "Rs. 2,13,600" },
  { id: "P-03", name: "Red Lentils (Dal) (50kg)", sold: 64, revenue: "Rs. 1,60,000" },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Business Analytics</h2>
        <p className="text-slate-500 mt-1 text-sm">Review sales trends and inventory performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue (30d)", value: "Rs. 12,45,000", icon: FiDollarSign, trend: "+14.5%" },
          { label: "Wholesale Orders", value: "84", icon: FiShoppingBag, trend: "+5.2%" },
          { label: "Store Conversion Rate", value: "3.2%", icon: FiActivity, trend: "-1.1%" },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                <stat.icon />
              </div>
              <span className={`text-xs font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</h3>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FiTrendingUp className="text-indigo-500" /> Fast Moving Stock
          </h3>
        </div>
        <div className="space-y-4">
          {mockTopProducts.map((product, i) => (
            <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-4">
              <div>
                <h4 className="font-bold text-slate-900">{product.name}</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">ID: {product.id}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Units Sold</p>
                  <p className="font-black text-slate-800">{product.sold}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Revenue</p>
                  <p className="font-black text-emerald-600">{product.revenue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}