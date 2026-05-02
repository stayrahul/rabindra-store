"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSave, FiGlobe, FiTag, FiSliders, FiPhone, FiMail, FiMapPin, 
  FiShoppingBag, FiShield, FiTruck, FiBell, FiCreditCard, 
  FiCheck, FiLoader, FiUsers, FiSearch, FiLock, FiAlertCircle
} from "react-icons/fi";
import CategoryManager from "./CategoryManager";

// The master database of your default settings
const INITIAL_SETTINGS = {
  // 1. General
  storeName: "Rabindra Wholesale Mart",
  supportPhone: "+977 9860117783",
  supportEmail: "contact@rabindra.com",
  address: "Kathmandu, Nepal",
  adminName: "Sushant Kushwaha",
  timezone: "Asia/Kathmandu",
  
  // 2. B2B & Vendors
  requireApproval: true,
  hidePricesFromGuests: true,
  minOrderValue: "5000",
  defaultNetTerms: "30", // Days to pay
  maxCreditLimit: "500000",
  enableTieredPricing: true,

  // 3. Logistics & Shipping
  baseShippingRate: "150",
  freeShippingThreshold: "15000",
  localPickup: true,
  deliveryRadiusKm: "50",
  weightUnit: "kg",
  premiumPackagingEnabled: true,

  // 4. Payments & Checkout
  currency: "NPR",
  taxRate: "13",
  orderPrefix: "RAB-",
  enableCOD: true,
  enableBankTransfer: true,
  enableDigitalWallets: false,
  allowPartialPayments: false,

  // 5. Notifications
  emailNotifications: true,
  smsAlerts: false,
  adminAlertEmail: "admin@rabindra.com",
  lowStockAlerts: true,
  lowStockThreshold: "10",
  abandonedCartEmails: true,

  // 6. SEO & Web
  seoTitle: "Rabindra Wholesale | Premium B2B Supply",
  seoDescription: "The leading wholesale supplier for premium goods, packaging, and logistics in Nepal.",
  googleAnalyticsId: "",
  enableIndexing: true,
  socialShareImageUrl: "/images/og-banner.jpg",

  // 7. Security & System
  maintenance: false,
  hideOutOfStock: false,
  require2FA: false,
  sessionTimeoutMins: "120",
  forceStrongPasswords: true,
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  
  // State Management
  const [savedSettings, setSavedSettings] = useState(INITIAL_SETTINGS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  
  // Save Action States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Deep compare to detect unsaved changes
  useEffect(() => {
    const isDifferent = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    setHasChanges(isDifferent);
  }, [settings, savedSettings]);

  // Input Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }));
  };

  // The Master Save Function
  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    
    // Simulate Supabase API Call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    console.log("🚀 Payload Successfully Sent to Database:", settings);
    
    setSavedSettings(settings); // Sync the baseline
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reusable Premium Components
  const ToggleSwitch = ({ label, desc, stateKey }: { label: string, desc: string, stateKey: keyof typeof settings }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group">
      <div className="pr-6">
        <h4 className="font-bold text-slate-900 text-sm">{label}</h4>
        <p className="text-xs font-medium text-slate-500 mt-1">{desc}</p>
      </div>
      <button 
        onClick={() => handleToggle(stateKey)}
        disabled={isSaving}
        className={`shrink-0 w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${settings[stateKey] ? 'bg-indigo-500' : 'bg-slate-200 hover:bg-slate-300'}`}
      >
        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings[stateKey] ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );

  const TextInput = ({ label, name, type = "text", icon: Icon, placeholder = "" }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input 
          type={type} name={name} value={settings[name as keyof typeof settings] as string} onChange={handleChange} placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 transition-all shadow-sm`} 
        />
      </div>
    </div>
  );

  const TABS = [
    { id: "general", label: "General", icon: FiGlobe },
    { id: "b2b", label: "B2B Rules", icon: FiUsers },
    { id: "logistics", label: "Logistics", icon: FiTruck },
    { id: "payments", label: "Payments", icon: FiCreditCard },
    { id: "notifications", label: "Alerts", icon: FiBell },
    { id: "seo", label: "SEO & Web", icon: FiSearch },
    { id: "security", label: "Security", icon: FiShield },
    { id: "categories", label: "Categories", icon: FiTag },
  ];

  return (
    <div className="max-w-6xl space-y-8 pb-12">
      
      {/* Header & Save Bar */}
      <div className="sticky top-0 z-40 bg-[#F8FAFC]/80 backdrop-blur-xl py-4 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mx-4 px-4 md:-mx-8 md:px-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Core</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-slate-500 text-sm font-medium">Manage 40+ global engine parameters.</p>
            {hasChanges && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2.5 py-1 rounded-md animate-pulse"><FiAlertCircle /> Unsaved Changes</span>}
          </div>
        </div>
        
        {activeTab !== "categories" && (
          <button 
            onClick={handleSave}
            disabled={isSaving || saveSuccess || !hasChanges}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black transition-all shadow-lg active:scale-95 disabled:active:scale-100 ${
              saveSuccess ? "bg-emerald-500 text-white shadow-emerald-200" 
              : hasChanges ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2 ring-offset-[#F8FAFC]" 
              : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
            }`}
          >
            {isSaving ? <FiLoader size={18} className="animate-spin" /> : saveSuccess ? <FiCheck size={18} /> : <FiSave size={18} />}
            <span>{isSaving ? "Syncing..." : saveSuccess ? "Synced!" : "Save Configuration"}</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm w-fit max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            
            {/* 1. GENERAL TAB */}
            {activeTab === "general" && (
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><FiGlobe className="text-indigo-500" /> Store Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TextInput label="Store Name" name="storeName" icon={FiShoppingBag} />
                  <TextInput label="Admin Name" name="adminName" icon={FiShield} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Timezone</label>
                    <select name="timezone" value={settings.timezone} onChange={handleChange} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 transition-all shadow-sm">
                      <option value="Asia/Kathmandu">Asia/Kathmandu (+05:45)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (+05:30)</option>
                    </select>
                  </div>
                  <TextInput label="Support Phone" name="supportPhone" icon={FiPhone} />
                  <TextInput label="Support Email" name="supportEmail" icon={FiMail} />
                  <TextInput label="Physical Address" name="address" icon={FiMapPin} />
                </div>
              </div>
            )}

            {/* 2. B2B & VENDORS */}
            {activeTab === "b2b" && (
              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6"><FiUsers className="text-indigo-500" /> B2B Access Rules</h3>
                  <ToggleSwitch stateKey="requireApproval" label="Require Vendor Approval" desc="New registrations must be manually vetted by an admin." />
                  <ToggleSwitch stateKey="hidePricesFromGuests" label="Hide Prices from Guests" desc="Unregistered users can see the catalog, but not pricing." />
                  <ToggleSwitch stateKey="enableTieredPricing" label="Enable Tiered Bulk Pricing" desc="Offer dynamic discounts based on volume purchased." />
                </div>
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-slate-900">Wholesale Financials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TextInput label="Min Order Value (Rs.)" name="minOrderValue" type="number" />
                    <TextInput label="Default Net Terms (Days)" name="defaultNetTerms" type="number" placeholder="e.g., 30 for Net-30" />
                    <TextInput label="Max Credit Limit (Rs.)" name="maxCreditLimit" type="number" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. LOGISTICS */}
            {activeTab === "logistics" && (
              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6"><FiTruck className="text-indigo-500" /> Shipping & Fulfillment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TextInput label="Base Rate (Rs.)" name="baseShippingRate" type="number" />
                    <TextInput label="Free Delivery Threshold" name="freeShippingThreshold" type="number" />
                    <TextInput label="Delivery Radius (Km)" name="deliveryRadiusKm" type="number" />
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                  <ToggleSwitch stateKey="localPickup" label="Allow Warehouse Pickup" desc="Vendors can collect goods directly from your location." />
                  <ToggleSwitch stateKey="premiumPackagingEnabled" label="Premium Packaging Option" desc="Allow customers to request hygienic/gift packaging at checkout." />
                </div>
              </div>
            )}

            {/* 4. PAYMENTS */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6"><FiCreditCard className="text-indigo-500" /> Checkout & Tax</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TextInput label="Currency Setup" name="currency" />
                    <TextInput label="Tax Rate (%)" name="taxRate" type="number" />
                    <TextInput label="Order ID Prefix" name="orderPrefix" placeholder="e.g., RAB-" />
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                  <ToggleSwitch stateKey="enableCOD" label="Cash on Delivery (COD)" desc="Standard payment on arrival." />
                  <ToggleSwitch stateKey="enableBankTransfer" label="Direct Bank Transfer" desc="B2B wire instructions provided at checkout." />
                  <ToggleSwitch stateKey="enableDigitalWallets" label="Digital Wallets (eSewa/Khalti)" desc="Process mobile payments directly." />
                  <ToggleSwitch stateKey="allowPartialPayments" label="Allow Partial Deposits" desc="Vendors can pay a percentage upfront to secure stock." />
                </div>
              </div>
            )}

            {/* 5. NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6"><FiBell className="text-indigo-500" /> Automated Alerts</h3>
                <TextInput label="Admin Alert Email Receiver" name="adminAlertEmail" icon={FiMail} />
                <div className="pt-4 space-y-2">
                  <ToggleSwitch stateKey="emailNotifications" label="Order Email Receipts" desc="Automatically send invoices to vendors." />
                  <ToggleSwitch stateKey="smsAlerts" label="SMS Dispatch Alerts" desc="Text customers when a truck leaves the warehouse." />
                  <ToggleSwitch stateKey="abandonedCartEmails" label="Abandoned Cart Recovery" desc="Email vendors who leave items in their cart for 24 hours." />
                  <ToggleSwitch stateKey="lowStockAlerts" label="Low Stock Warning System" desc="Notify admins when inventory dips." />
                </div>
                {settings.lowStockAlerts && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                    <TextInput label="Trigger Alert Below (Units)" name="lowStockThreshold" type="number" />
                  </motion.div>
                )}
              </div>
            )}

            {/* 6. SEO & WEB */}
            {activeTab === "seo" && (
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6"><FiSearch className="text-indigo-500" /> Search Optimization</h3>
                <TextInput label="Meta Title" name="seoTitle" />
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Meta Description</label>
                  <textarea name="seoDescription" value={settings.seoDescription} onChange={handleChange} rows={3} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 transition-all shadow-sm resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput label="Google Analytics ID" name="googleAnalyticsId" placeholder="G-XXXXXXXXXX" />
                  <TextInput label="Social Share Image (URL)" name="socialShareImageUrl" placeholder="/images/banner.jpg" />
                </div>
                <ToggleSwitch stateKey="enableIndexing" label="Allow Search Engine Indexing" desc="Let Google and Bing crawl your storefront." />
              </div>
            )}

            {/* 7. SECURITY */}
            {activeTab === "security" && (
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6"><FiLock className="text-rose-500" /> Core Security & Failsafes</h3>
                <ToggleSwitch stateKey="maintenance" label="Maintenance Mode (Store Lockout)" desc="Shut down the frontend to users while updating." />
                <ToggleSwitch stateKey="hideOutOfStock" label="Hide Empty Inventory" desc="Automatically pull sold-out items from the public catalog." />
                <ToggleSwitch stateKey="require2FA" label="Enforce 2FA for Admins" desc="Require two-factor authentication for backend access." />
                <ToggleSwitch stateKey="forceStrongPasswords" label="Enforce Strong Passwords" desc="Require numbers, symbols, and caps for vendor accounts." />
                <div className="pt-4">
                  <TextInput label="Admin Session Timeout (Minutes)" name="sessionTimeoutMins" type="number" />
                </div>
              </div>
            )}

            {/* 8. CATEGORIES */}
            {activeTab === "categories" && (
              <div className="bg-transparent"><CategoryManager /></div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}