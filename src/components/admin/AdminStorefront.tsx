"use client";

import React, { useState } from "react";
import { 
  FiSave, FiLayout, FiCheckCircle, FiStar, FiGlobe, 
  FiSmartphone, FiMapPin, FiMail, FiFacebook, FiInstagram, 
  FiShoppingBag
} from "react-icons/fi";
import { cn } from "@/lib/utils";

export default function AdminStorefront() {
  const [isSaved, setIsSaved] = useState(false);

  // FULLY FUNCTIONAL STATE: All 22 options are tracked here
  const [settings, setSettings] = useState({
    // Branding (6)
    siteTitle: "Rabindra Store | Simraungadh",
    metaDescription: "Best wholesale grocery in Nepal",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#4f46e5",
    themeMode: "light",
    
    // Hero & UI (5)
    heroHeadline: "Wholesale Catalog",
    heroSubheadline: "Browse our latest stock of premium groceries.",
    searchPlaceholder: "Search items...",
    heroImageUrl: "",
    cardRadius: "12px",

    // Commerce & Rules (6)
    currency: "NPR",
    freeDeliveryLimit: 20000,
    minOrderValue: 5000,
    taxRate: 13,
    b2bMode: false,
    maintenanceMode: false,

    // Contact & Footer (5)
    address: "Simraungadh, Bara, Nepal",
    email: "contact@rabindra.me",
    whatsapp: "+977 9860117783",
    facebook: "",
    orderDisclaimer: "Market rates confirmed via WA"
  });

  // Generic handler to update any setting dynamically
  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaved(true);
    // In a real app, this sends the 'settings' object to your database
    console.log("Saving to database:", settings);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl space-y-8 pb-32">
      {/* 1. TOP HEADER & GLOBAL SAVE */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Storefront Designer</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage 22 functional configurations for Rabindra Store.</p>
        </div>
        <button 
          onClick={handleSave}
          className={cn(
            "flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-black transition-all shadow-xl hover:-translate-y-1 active:translate-y-0",
            isSaved ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-slate-900 text-white shadow-slate-200 hover:bg-indigo-600"
          )}
        >
          {isSaved ? <><FiCheckCircle size={22} /> System Updated</> : <><FiSave size={22} /> Save Global Settings</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION A: BRANDING & SEO */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-4">
            <FiGlobe className="text-indigo-500" /> Branding & Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Site Title</label>
              <input type="text" value={settings.siteTitle} onChange={e => handleChange("siteTitle", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Meta Description</label>
              <input type="text" value={settings.metaDescription} onChange={e => handleChange("metaDescription", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Logo URL</label>
              <input type="text" placeholder="Cloudinary link..." value={settings.logoUrl} onChange={e => handleChange("logoUrl", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-medium text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">4. Favicon Icon</label>
              <input type="text" placeholder="URL to .ico file" value={settings.faviconUrl} onChange={e => handleChange("faviconUrl", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-medium text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">5. Primary Brand Color</label>
              <input type="color" value={settings.primaryColor} onChange={e => handleChange("primaryColor", e.target.value)} className="w-full h-12 p-1 rounded-xl bg-white border-2 border-slate-100 cursor-pointer" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">6. Default Theme</label>
              <select value={settings.themeMode} onChange={e => handleChange("themeMode", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold">
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION B: HERO MESSAGING */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-4">
            <FiStar className="text-orange-500" /> Hero Content
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7. Main H1 Header</label>
              <input type="text" value={settings.heroHeadline} onChange={e => handleChange("heroHeadline", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">8. Sub-headline Text</label>
              <textarea rows={3} value={settings.heroSubheadline} onChange={e => handleChange("heroSubheadline", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-medium text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">9. Search Placeholder</label>
              <input type="text" value={settings.searchPlaceholder} onChange={e => handleChange("searchPlaceholder", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">10. Hero Banner URL</label>
              <input type="text" placeholder="https://..." value={settings.heroImageUrl} onChange={e => handleChange("heroImageUrl", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">11. Card Corner Radius</label>
              <select value={settings.cardRadius} onChange={e => handleChange("cardRadius", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold">
                <option value="0px">Sharp (0px)</option>
                <option value="12px">Standard (12px)</option>
                <option value="32px">Ultra-Round (32px)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION C: COMMERCE SETTINGS */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-4">
            <FiShoppingBag className="text-emerald-500" /> Commerce & Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">12. Base Currency</label>
              <input type="text" value={settings.currency} onChange={e => handleChange("currency", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">13. Free Delivery Threshold</label>
              <input type="number" value={settings.freeDeliveryLimit} onChange={e => handleChange("freeDeliveryLimit", Number(e.target.value))} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">14. Minimum Order Value</label>
              <input type="number" value={settings.minOrderValue} onChange={e => handleChange("minOrderValue", Number(e.target.value))} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">15. Default Tax Rate (%)</label>
              <input type="number" value={settings.taxRate} onChange={e => handleChange("taxRate", Number(e.target.value))} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-black" />
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-4">
              <input type="checkbox" id="b2b" checked={settings.b2bMode} onChange={e => handleChange("b2bMode", e.target.checked)} className="w-5 h-5 accent-indigo-600" />
              <label htmlFor="b2b" className="font-bold text-sm text-slate-700">16. Enable B2B Wholesale Login</label>
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-4">
              <input type="checkbox" id="maintenance" checked={settings.maintenanceMode} onChange={e => handleChange("maintenanceMode", e.target.checked)} className="w-5 h-5 accent-red-500" />
              <label htmlFor="maintenance" className="font-bold text-sm text-red-600">17. Enable Maintenance Mode</label>
            </div>
          </div>
        </div>

        {/* SECTION D: CONTACT & FOOTER */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6 lg:col-span-1">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-4">
            <FiSmartphone className="text-pink-500" /> Support & Socials
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FiMapPin className="text-slate-400" />
              <input type="text" value={settings.address} onChange={e => handleChange("address", e.target.value)} className="w-full bg-transparent border-b border-slate-100 font-bold text-xs py-1 outline-none" />
            </div>
            <div className="flex items-center gap-3">
              <FiMail className="text-slate-400" />
              <input type="text" value={settings.email} onChange={e => handleChange("email", e.target.value)} className="w-full bg-transparent border-b border-slate-100 font-bold text-xs py-1 outline-none" />
            </div>
            <div className="flex items-center gap-3">
              <FiFacebook className="text-blue-600" />
              <input type="text" placeholder="Facebook Link" value={settings.facebook} onChange={e => handleChange("facebook", e.target.value)} className="w-full bg-transparent border-b border-slate-100 font-bold text-xs py-1 outline-none" />
            </div>
            <div className="space-y-2 pt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">21. WhatsApp Order Number</label>
              <input type="text" value={settings.whatsapp} onChange={e => handleChange("whatsapp", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">22. Footer Order Disclaimer</label>
              <input type="text" value={settings.orderDisclaimer} onChange={e => handleChange("orderDisclaimer", e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-medium text-[10px]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}