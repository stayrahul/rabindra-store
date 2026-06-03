"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Package, Droplets, Flame, Cookie } from "lucide-react";

const CATEGORIES = [
  { title: "Grains & Pulses", icon: Package, color: "from-amber-500 to-orange-600", items: "Rice, Dal, Atta, Besan", href: "/shop?category=Grains+%26+Pulses" },
  { title: "Oils & Ghee", icon: Droplets, color: "from-emerald-500 to-teal-600", items: "Mustard, Soyabean, Ghee", href: "/shop?category=Oils+%26+Ghee" },
  { title: "Spices & Herbs", icon: Flame, color: "from-rose-500 to-red-600", items: "Turmeric, Chili, Cumin", href: "/shop?category=Spices+%26+Herbs" },
  { title: "Snacks & More", icon: Cookie, color: "from-indigo-500 to-purple-600", items: "Noodles, Biscuits, Tea", href: "/shop?category=Snacks+%26+Noodles" },
];

const DressStyle = () => {
  return (
    <section className="px-4 xl:px-0 py-16 md:py-20">
      <div className="max-w-frame mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Browse by <span className="text-indigo-600">Category</span>
          </h2>
          <p className="text-slate-500 font-medium mt-3 max-w-lg mx-auto">
            Find exactly what your business needs — from bulk grains to premium spices.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={cat.href}
                className="group flex flex-col h-full p-6 md:p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2`} />

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-5 shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon size={24} />
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{cat.title}</h3>
                <p className="text-xs font-medium text-slate-400 mb-6 flex-1">{cat.items}</p>

                <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                  Browse <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DressStyle;
