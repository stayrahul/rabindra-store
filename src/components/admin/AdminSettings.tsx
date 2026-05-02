"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSave, FiGlobe, FiTag, FiSliders, FiPhone, FiMail, FiMapPin, 
  FiShoppingBag, FiShield, FiTruck, FiBell, FiCreditCard, 
  FiCheck, FiLoader, FiUsers, FiSearch, FiLock, FiAlertCircle,
  FiPercent, FiZap, FiDatabase, FiRefreshCw, FiExternalLink
} from "react-icons/fi";
import CategoryManager from "./CategoryManager";
import { supabase } from "@/utils/supabase";

// MASTER SCHEMA: Every single configurable item in the store
const DEFAULT_SCHEMA = {
  // --- STORE IDENTITY ---
  storeName: "Rabindra Wholesale Mart",
  supportPhone: "+977 9860117783",
  supportEmail: "contact@rabindra.com",
  address: "Kathmandu, Nepal",
  adminName: "Sushant Kushwaha",
  timezone: "Asia/Kathmandu",
  currency: "NPR",
  
  // --- WHOLESALE & B2B RULES ---
  requireApproval: true,
  hidePricesFromGuests: true,
  minOrderValue: "5000",
  defaultNetTerms: "30",
  maxCreditLimit: "500000",
  enableTieredPricing: true,
  taxExemptForRegisteredVendors: false,

  // --- LOGISTICS & FULFILLMENT ---
  baseShippingRate: "150",
  freeShippingThreshold: "15000",
  localPickup: true,
  deliveryRadiusKm: "50",
  estimatedDeliveryDays: "2",
  premiumPackagingEnabled: true,
  packagingFee: "50",

  // --- PAYMENTS & CHECKOUT ---
  taxRate: "13",
  orderPrefix: "RAB-",
  enableCOD: true,
  enableBankTransfer: true,
  enableDigitalWallets: false,
  allowPartialPayments: false,
  depositPercentage: "50",

  // --- AUTOMATION & ALERTS ---
  emailNotifications: true,
  smsAlerts: false,
  adminAlertEmail: "admin@rabindra.com",
  lowStockAlerts: true,
  lowStockThreshold: "10",
  abandonedCartEmails: true,
  autoArchiveOrders: false,

  // --- SEO & PERFORMANCE ---
  seoTitle: "Rabindra Wholesale | Premium B2B Supply",
  seoDescription: "The leading wholesale supplier for premium goods, packaging, and logistics in Nepal.",
  googleAnalyticsId: "G-R8WZYFHD1K",
  enableIndexing: true,
  socialShareImageUrl: "/images/og-banner.jpg",
  enablePWA: true,

  // --- SECURITY & SYSTEM ---
  maintenance: false,
  hideOutOfStock: false,
  require2FA: false,
  sessionTimeoutMins: "120",
  forceStrongPasswords: true,
  auditLogging: true,
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(DEFAULT_SCHEMA);
  const [persistedSettings, setPersistedSettings] = useState(DEFAULT_SCHEMA);
  
  // UI Status
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 1. DATA INITIALIZATION: Fetch from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('store_settings')
      .select('data')
      .single();

    if (data?.data) {
      // Merge with default schema to handle new settings updates
      const merged = { ...DEFAULT_SCHEMA, ...data.data };
      setSettings(merged);
      setPersistedSettings(merged);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // 2. CHANGE DETECTION
  useEffect(() => {
    const isChanged = JSON.stringify(settings) !== JSON.stringify(persistedSettings);
    setHasChanges(isChanged);
  }, [settings, persistedSettings]);

  // 3. EVENT HANDLERS
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleBoolean = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    
    const { error } = await supabase
      .from('store_settings')
      .upsert({ id: 1, data: settings, updated_at: new Date() });

    if (!error) {
      setPersistedSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  // --- REUSABLE UI COMPONENTS ---
  const SectionHeader = ({ icon: Icon, title, desc }: any) => (
    <div className="mb-8">
      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Icon size={20} /></div>
        {title}
      </h3>
      <p className="text-sm text-slate-500 font-medium mt-1 ml-12">{desc}</p>
    </div>
  );

  const InputField = ({ label, name, type = "text", icon: Icon, placeholder = "" }: any) => (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 group-focus-within:text-indigo-500 transition-colors">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
        <input 
          type={type} name={name} value={settings[name as keyof typeof settings] as string} 
          onChange={handleInputChange} placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none font-bold text-slate-900 transition-all shadow-sm`} 
        />
      </div>
    </div>
  );

  const StatusToggle = ({ label, desc, stateKey }: { label: string, desc: string, stateKey: keyof typeof settings }) => (
    <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group">
      <div className="pr-6">
        <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-900">{label}</h4>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button 
        onClick={() => toggleBoolean(stateKey)}
        className={`shrink-0 w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${settings[stateKey] ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${settings[stateKey] ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );

  const TABS = [
    { id: "general", label: "Identity", icon: FiGlobe },
    { id: "pricing", label: "B2B Engine", icon: FiZap },
    { id: "logistics", label: "Logistics", icon: FiTruck },
    { id: "payments", label: "Payments", icon: FiCreditCard },
    { id: "alerts", label: "Automation", icon: FiBell },
    { id: "seo", label: "SEO/Web", icon: FiSearch },
    { id: "security", label: "Failsafes", icon: FiShield },
    { id: "categories", label: "Taxonomy", icon: FiTag },
  ];

  if (isLoading) return (
    <div className="h-96 flex items-center justify-center gap-3 text-slate-400 font-bold">
      <FiLoader className="animate-spin text-indigo-500" size={24} /> 
      Initialising Engine...
    </div>
  );

  return (
    <div className="max-w-6xl space-y-8 pb-12 selection:bg-indigo-100">
      
      {/* GLOBAL PERSISTENCE BAR */}
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-8 px-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">System Core</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded tracking-widest">PRO</span>
            <p className="text-slate-500 text-xs font-bold">Rabindra Wholesale Global v3.1</p>
          </div>
        </div>
        
        {activeTab !== "categories" && (
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {hasChanges && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="hidden lg:flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl">
                  <FiAlertCircle /> Pending Changes
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={handleSave}
              disabled={isSaving || saveSuccess || !hasChanges}
              className={`flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl ${
                saveSuccess ? "bg-emerald-500 text-white shadow-emerald-200" 
                : hasChanges ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {isSaving ? <FiLoader className="animate-spin" /> : saveSuccess ? <FiCheck /> : <FiSave />}
              <span>{isSaving ? "Syncing..." : saveSuccess ? "System Updated!" : "Sync Engine"}</span>
            </button>
          </div>
        )}
      </div>

      {/* NAVIGATION NAV-DRAWER */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1.5 bg-slate-200/50 rounded-[2rem] border border-slate-200 shadow-inner w-fit max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${
              activeTab === tab.id ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT ENGINE */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            
            {/* --- TAB 1: IDENTITY --- */}
            {activeTab === "general" && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
                <SectionHeader icon={FiGlobe} title="Store Identity" desc="Primary contact and branding information for your storefront." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <InputField label="Public Store Name" name="storeName" icon={FiShoppingBag} />
                  <InputField label="Super Admin Name" name="adminName" icon={FiShield} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Currency</label>
                    <select name="currency" value={settings.currency} onChange={handleInputChange} className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none">
                      <option value="NPR">NPR (Rs.)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <InputField label="Support Line" name="supportPhone" icon={FiPhone} />
                  <InputField label="Official Email" name="supportEmail" icon={FiMail} />
                  <InputField label="Base Warehouse Address" name="address" icon={FiMapPin} />
                </div>
              </div>
            )}

            {/* --- TAB 2: B2B ENGINE (PRICING) --- */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                  <SectionHeader icon={FiZap} title="B2B Pricing Engine" desc="Control how wholesale vendors interact with your pricing." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusToggle stateKey="requireApproval" label="Manual Vetting" desc="Admins must approve every new vendor account." />
                    <StatusToggle stateKey="hidePricesFromGuests" label="Price Gating" desc="Hide prices until the user is logged in as a vendor." />
                    <StatusToggle stateKey="enableTieredPricing" label="Tiered Bulk Pricing" desc="Enable automatic discounts for higher volumes." />
                    <StatusToggle stateKey="taxExemptForRegisteredVendors" label="VAT Exemption" desc="Skip tax for vendors with verified PAN/VAT numbers." />
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Financial Thresholds</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InputField label="Min. Order Value" name="minOrderValue" type="number" />
                    <InputField label="Default Net Terms" name="defaultNetTerms" type="number" placeholder="Days" />
                    <InputField label="Max Account Credit" name="maxCreditLimit" type="number" />
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: LOGISTICS --- */}
            {activeTab === "logistics" && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
                <SectionHeader icon={FiTruck} title="Logistics & Fulfillment" desc="Manage shipping rates, zones, and packaging fees." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <InputField label="Base Delivery (Rs.)" name="baseShippingRate" type="number" />
                  <InputField label="Free Delivery At" name="freeShippingThreshold" type="number" />
                  <InputField label="Delivery Radius (Km)" name="deliveryRadiusKm" type="number" />
                  <InputField label="Est. Lead Time (Days)" name="estimatedDeliveryDays" type="number" />
                </div>
                <div className="pt-6 border-t border-slate-50 space-y-4">
                  <StatusToggle stateKey="localPickup" label="Allow Warehouse Pickup" desc="Vendors can skip shipping and collect in person." />
                  <StatusToggle stateKey="premiumPackagingEnabled" label="Premium Packaging" desc="Enable high-quality, hygienic packaging options." />
                  {settings.premiumPackagingEnabled && <InputField label="Packaging Fee (Rs.)" name="packagingFee" type="number" />}
                </div>
              </div>
            )}

            {/* --- TAB 4: PAYMENTS --- */}
            {activeTab === "payments" && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
                <SectionHeader icon={FiCreditCard} title="Checkout & Payments" desc="Configure your payment gateway and tax settings." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <InputField label="Standard Tax Rate (%)" name="taxRate" type="number" />
                  <InputField label="Order ID Prefix" name="orderPrefix" />
                  <InputField label="Deposit Required (%)" name="depositPercentage" type="number" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatusToggle stateKey="enableCOD" label="Cash on Delivery" desc="Standard offline payment method." />
                  <StatusToggle stateKey="enableBankTransfer" label="Direct Bank Transfer" desc="B2B wire transfer instructions." />
                  <StatusToggle stateKey="enableDigitalWallets" label="Digital Wallets" desc="eSewa / Khalti integration." />
                  <StatusToggle stateKey="allowPartialPayments" label="Installment Plans" desc="Allow customers to pay deposit first." />
                </div>
              </div>
            )}

            {/* --- TAB 5: AUTOMATION --- */}
            {activeTab === "alerts" && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6">
                <SectionHeader icon={FiBell} title="System Automation" desc="Set up automatic notifications and inventory alerts." />
                <InputField label="Admin Alert Target Email" name="adminAlertEmail" icon={FiMail} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  <StatusToggle stateKey="emailNotifications" label="Auto-Invoice Emails" desc="Instantly email invoices upon order confirmation." />
                  <StatusToggle stateKey="smsAlerts" label="SMS Tracking Alerts" desc="Send dispatch texts to customers." />
                  <StatusToggle stateKey="lowStockAlerts" label="Inventory Watchdog" desc="Alert admin when items fall below threshold." />
                  <StatusToggle stateKey="abandonedCartEmails" label="Cart Recovery" desc="Follow up with vendors who leave items in carts." />
                </div>
                {settings.lowStockAlerts && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-6 bg-slate-50 rounded-2xl">
                    <InputField label="Low Stock Warning Trigger (Units)" name="lowStockThreshold" type="number" />
                  </motion.div>
                )}
              </div>
            )}

            {/* --- TAB 6: SEO --- */}
            {activeTab === "seo" && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
                <SectionHeader icon={FiSearch} title="SEO & Performance" desc="Optimise how your store appears on Google and Social Media." />
                <div className="space-y-6">
                  <InputField label="Homepage Meta Title" name="seoTitle" />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homepage Meta Description</label>
                    <textarea name="seoDescription" value={settings.seoDescription} onChange={handleInputChange} rows={3} className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="GA4 Measurement ID" name="googleAnalyticsId" placeholder="G-XXXXXXXXXX" />
                    <InputField label="OG Image URL" name="socialShareImageUrl" placeholder="/images/banner.jpg" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <StatusToggle stateKey="enableIndexing" label="Google Indexing" desc="Allow search engines to crawl and list your store." />
                    <StatusToggle stateKey="enablePWA" label="PWA Installation" desc="Allow users to install your store as a mobile app." />
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 7: SECURITY --- */}
            {activeTab === "security" && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
                <SectionHeader icon={FiLock} title="Core Failsafes" desc="Manage system availability and admin security." />
                <div className="flex flex-col gap-4">
                  <StatusToggle stateKey="maintenance" label="Maintenance Mode" desc="Lock storefront for everyone except admins." />
                  <StatusToggle stateKey="hideOutOfStock" label="Smart Inventory" desc="Hide products automatically when stock hits zero." />
                  <StatusToggle stateKey="require2FA" label="Admin Multi-Factor" desc="Enforce 2FA for all dashboard users." />
                  <StatusToggle stateKey="auditLogging" label="Audit Trails" desc="Log every single change made in the admin panel." />
                </div>
                <div className="pt-6 border-t border-slate-50">
                  <InputField label="Admin Session Timeout (Minutes)" name="sessionTimeoutMins" type="number" />
                </div>
              </div>
            )}

            {/* --- TAB 8: CATEGORIES --- */}
            {activeTab === "categories" && (
              <div className="bg-transparent"><CategoryManager /></div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER UTILITIES */}
      <div className="flex items-center justify-between p-6 bg-slate-100/50 rounded-3xl border border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Last Sync: {new Date(persistedSettings === DEFAULT_SCHEMA ? Date.now() : Date.now()).toLocaleTimeString()}
        </p>
        <button 
          onClick={() => {
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rabindra-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
          }}
          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-[0.2em] flex items-center gap-2"
        >
          <FiDatabase /> Export Backup
        </button>
      </div>
    </div>
  );
}