"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Truck, Clock, Award, Handshake, BadgeCheck } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, label: "Quality Assured", desc: "Premium verified products" },
  { icon: Truck, label: "Fast Delivery", desc: "Same-day local dispatch" },
  { icon: Clock, label: "Live Rates", desc: "Real-time market pricing" },
  { icon: Award, label: "Best Wholesale", desc: "Unbeatable bulk rates" },
  { icon: Handshake, label: "B2B Trusted", desc: "50+ business partners" },
  { icon: BadgeCheck, label: "Since 2026", desc: "Simraungadh's finest" },
];

const Brands = () => {
  return (
    <section className="py-12 md:py-16 bg-white border-y border-slate-100">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Why Businesses Choose <span className="text-indigo-600">Rabindra</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">The wholesale infrastructure that powers Simraungadh commerce.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center text-center p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 border border-slate-200 shadow-sm text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                <item.icon size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-1">{item.label}</h3>
              <p className="text-[11px] font-medium text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;
