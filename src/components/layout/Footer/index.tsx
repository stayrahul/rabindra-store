"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin, Phone, MessageCircle, ChevronUp, ArrowRight,
  Mail, Clock, Shield, Truck, Heart,
  Facebook, Star, Check, Package, Instagram
} from "lucide-react";
import { motion } from "framer-motion";
import { useInventory } from "@/context/InventoryContext";
import { usePathname } from "next/navigation";

const Footer = () => {
  const { settings } = useInventory();
  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/product/");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  const whatsappNumber = settings?.whatsappNumber || "9779860117783";
  const supportPhone = settings?.supportPhone || "+977 9860117783";
  const supportEmail = settings?.supportEmail || "contact@rabindra.com";
  const address = settings?.address || "Simraungadh, Bara, Nepal";
  const facebookUrl = settings?.facebookUrl || "https://facebook.com/stayrahul";
  const instagramUrl = settings?.instagramUrl || "";
  const storeName = settings?.storeName || "Rabindra Store";

  const features = [
    { icon: Truck, label: "Free Local Delivery", desc: "Within Simraungadh", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { icon: Shield, label: "Quality Guaranteed", desc: "Premium products only", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { icon: Clock, label: "Operating Hours", desc: `${settings?.openingTime || '08:00'} - ${settings?.closingTime || '20:00'}`, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { icon: Heart, label: "Trusted by 50+", desc: "Local businesses", color: "text-rose-600 bg-rose-50 border-rose-100" },
  ];

  return (
    <footer className="relative mt-24 bg-white overflow-hidden">

      {/* TOP ACCENT LINE */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />


      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 pt-16 pb-8 px-5 xl:px-0 max-w-[1440px] mx-auto"
      >
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-14 gap-x-10 mb-16">

          {/* 1. BRAND & IDENTITY */}
          <motion.div variants={itemVariants} className="flex flex-col lg:col-span-4">
            <Link href="/" className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-1 lowercase mb-5 w-fit">
              {storeName.split(' ')[0].toLowerCase()}<span className="text-indigo-600">.store</span>
            </Link>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium pr-4">
              {settings?.storeDescription || "Simraungadh's premier wholesale infrastructure. Powering local businesses with premium inventory and direct pricing."}
            </p>
            <div className="flex items-start gap-3 text-sm font-semibold text-slate-700 bg-slate-50 w-fit px-5 py-4 rounded-2xl border border-slate-100 mb-6">
              <MapPin size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 hover:bg-indigo-600 border border-slate-200 hover:border-indigo-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                  <Facebook size={16} />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 hover:bg-rose-600 border border-slate-200 hover:border-rose-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                  <Instagram size={16} />
                </a>
              )}
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 hover:bg-emerald-600 border border-slate-200 hover:border-emerald-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <MessageCircle size={16} />
              </a>
              <a href={`tel:${supportPhone}`} className="w-10 h-10 bg-slate-50 hover:bg-sky-600 border border-slate-200 hover:border-sky-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Phone size={16} />
              </a>
            </div>
          </motion.div>

          {/* 2. QUICK LINKS + CATEGORIES */}
          <motion.div variants={itemVariants} className="flex flex-col lg:col-span-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10">
              <div>
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-5">Quick Links</h4>
                <ul className="space-y-3.5">
                  <li><Link href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" /> Browse Catalog</Link></li>
                  <li><Link href={`https://wa.me/${whatsappNumber}`} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" /> Bulk Inquiry</Link></li>
                  <li><Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 group"><ArrowRight size={12} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" /> Admin Portal</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-5">Support</h4>
                <ul className="space-y-3.5">
                  <li className="text-sm font-medium text-slate-500 flex items-center gap-2 cursor-default group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" /> {supportPhone}</li>
                  <li className="text-sm font-medium text-slate-500 flex items-center gap-2 cursor-default group"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" /> {supportEmail}</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* 3. CONNECT & NEWSLETTER */}
          <motion.div variants={itemVariants} className="flex flex-col lg:col-span-4 lg:items-end">
            <div className="w-full lg:w-[340px] flex flex-col">

              {/* Contact Cards */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2.5 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle size={20} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800">WhatsApp</span>
                </a>
                <a href={`tel:${supportPhone}`} className="flex flex-col items-center justify-center gap-2.5 p-5 bg-sky-50 rounded-2xl border border-sky-100 hover:shadow-lg hover:shadow-sky-100 transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-full bg-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Phone size={20} className="text-sky-600" />
                  </div>
                  <span className="text-xs font-bold text-sky-800">Call Us</span>
                </a>
              </div>



            </div>
          </motion.div>
        </div>

        {/* PAYMENT BADGES BAR */}
        <motion.div variants={itemVariants}>
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Accepted Payment Methods</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="px-4 py-2 bg-[#60bb46]/5 border border-[#60bb46]/20 rounded-xl">
                <span className="text-sm font-black tracking-wider text-[#60bb46]">eSewa</span>
              </div>
              <div className="px-4 py-2 bg-[#e31837]/5 border border-[#e31837]/20 rounded-xl">
                <span className="text-sm font-black tracking-wider text-[#e31837]">fonepay</span>
              </div>
              <div className="px-4 py-2 bg-[#5C2D91]/5 border border-[#5C2D91]/20 rounded-xl">
                <span className="text-xs font-black tracking-wider text-[#5C2D91] uppercase">Khalti</span>
              </div>
              <div className="px-4 py-2 bg-[#00509D]/5 border border-[#00509D]/20 rounded-xl">
                <span className="text-xs font-black tracking-wider text-[#00509D]">connectIPS</span>
              </div>
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-xs font-black tracking-wider text-amber-700 uppercase">Cash</span>
              </div>
              <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">Bank Transfer</span>
              </div>
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">COD</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM BAR */}
        <motion.div variants={itemVariants} className="relative">
          <hr className="h-px border-t border-slate-100 mb-8" />

          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

            {/* Copyright & Dev Signature */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs text-slate-400 font-medium text-center sm:text-left w-full lg:w-auto">
              <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
              <span className="hidden sm:inline text-slate-200">|</span>
              <p>
                Powered by <a href="https://www.facebook.com/stayrahul" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-800 hover:text-indigo-600 transition-colors">Sushant Kushwaha</a>
              </p>
            </div>

            {/* Back to Top Button */}
            {!isProductPage && (
              <button
                onClick={scrollToTop}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:bg-indigo-600 hover:border-indigo-600 hover:-translate-y-1 text-slate-400 hover:text-white transition-all duration-300 active:scale-95"
                aria-label="Scroll to top"
              >
                <ChevronUp size={18} strokeWidth={2.5} />
              </button>
            )}

          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
