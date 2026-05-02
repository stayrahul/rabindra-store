"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSave, FiGlobe, FiTag, FiPhone, FiMail, FiMapPin, 
  FiShoppingBag, FiShield, FiTruck, FiBell, FiCreditCard, 
  FiCheck, FiLoader, FiUsers, FiSearch, FiLock, FiAlertCircle,
  FiZap, FiDatabase, FiRefreshCw, FiExternalLink,
  FiFileText, FiShare2, FiClock, FiMessageCircle, FiEye, FiX
} from "react-icons/fi";
import CategoryManager from "./CategoryManager";
import { supabase } from "@/utils/supabase";

// --- 1. MASTER SCHEMA ---
const DEFAULT_SCHEMA = {
  // 1. STORE IDENTITY & ASSETS
  storeName: "Rabindra Wholesale Mart",
  logoUrl: "",
  faviconUrl: "",
  supportPhone: "+977 9860117783",
  supportEmail: "contact@rabindra.com",
  address: "Simraungadh, Bara, Nepal",
  adminName: "Sushant Kushwaha",
  currency: "NPR",
  taxIdNumber: "PAN-123456789",
  
  // 2. WHOLESALE & CATALOG RULES
  requireApproval: true,
  hidePricesFromGuests: true,
  allowBackorders: false, 
  callForPrice: false, 
  minOrderValue: "5000",
  defaultNetTerms: "30",
  enableTieredPricing: true,
  taxExemptForRegisteredVendors: false,

  // 3. LOGISTICS & FULFILLMENT
  baseShippingRate: "150",
  freeShippingThreshold: "15000",
  localPickup: true,
  pickupAddress: "Warehouse 1, Simraungadh Main Road", 
  deliveryRadiusKm: "50",
  estimatedDeliveryDays: "2",
  enableSameDayDelivery: true,
  sameDayCutoffTime: "14:00",
  packagingFee: "50",

  // 4. CHECKOUT & FINANCE
  guestCheckout: false, 
  requirePhoneVerification: false, 
  requireTermsAtCheckout: true, 
  taxRate: "13",
  orderPrefix: "RAB-",
  invoiceDueDays: "7",
  enableCOD: true,
  enableBankTransfer: true,
  bankAccountDetails: "Bank: Everest Bank Ltd.\nAcct Name: Rabindra Mart\nAcct No: 12345678901234",
  depositPercentage: "50",

  // 5. UX & CUSTOMER ENGAGEMENT
  defaultProductView: "grid", 
  stockDisplayFormat: "exact", 
  enableProductReviews: true, 
  autoApproveReviews: false, 
  returnWindowDays: "7", 
  enableWhatsappWidget: true, 
  whatsappWidgetNumber: "9779860117783",

  // 6. SEO & WEB
  seoTitle: "Rabindra Wholesale | Premium B2B Supply",
  seoDescription: "The leading wholesale supplier for premium goods in Nepal.",
  googleAnalyticsId: "G-R8WZYFHD1K",
  enableIndexing: true,
  socialShareImageUrl: "",
  facebookUrl: "",
  instagramUrl: "",

  // 7. AUTOMATION & SECURITY
  adminPassword: "rabindra115",
  emailNotifications: true,
  smsAlerts: false,
  adminAlertEmail: "admin@rabindra.com",
  lowStockThreshold: "10",
  abandonedCartEmails: true,
  maintenance: false,
  require2FA: true,
  sessionTimeoutMins: "120",
  blockSuspiciousIPs: true, 
};

// --- 2. REUSABLE UI COMPONENTS (MOVED OUTSIDE TO FIX FOCUS BUG) ---

const SectionHeader = ({ icon: Icon, title, desc }: any) => (
  <div className="mb-8 border-b border-slate-100 pb-5">
    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><Icon size={20} /></div>
      {title}
    </h3>
    <p className="text-sm text-slate-500 font-medium mt-2 ml-14">{desc}</p>
  </div>
);

const InputField = ({ label, name, type = "text", icon: Icon, placeholder = "", value, onChange }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
      <input 
        type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900 transition-all shadow-sm placeholder:text-slate-300 placeholder:font-medium`} 
      />
    </div>
  </div>
);

const TextAreaField = ({ label, name, rows = 3, placeholder = "", value, onChange }: any) => (
  <div className="space-y-2 group col-span-full md:col-span-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <textarea 
      name={name} value={value || ""} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium text-sm text-slate-900 transition-all shadow-sm resize-none placeholder:text-slate-300" 
    />
  </div>
);

const StatusToggle = ({ label, desc, checked, onToggle }: any) => (
  <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-50 bg-white hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group cursor-pointer shadow-sm" onClick={onToggle}>
    <div className="pr-4">
      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-900">{label}</h4>
      <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed line-clamp-2">{desc}</p>
    </div>
    <button className={`shrink-0 w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${checked ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-slate-200'}`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
  </div>
);

const SelectField = ({ label, name, options, value, onChange }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <select name={name} value={value} onChange={onChange} className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm cursor-pointer">
      {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const TABS = [
  { id: "general", label: "Identity", icon: FiGlobe },
  { id: "pricing", label: "B2B Engine", icon: FiZap },
  { id: "checkout", label: "Checkout", icon: FiCreditCard },
  { id: "logistics", label: "Logistics", icon: FiTruck },
  { id: "display", label: "UX & Display", icon: FiEye },
  { id: "web", label: "Web & SEO", icon: FiShare2 },
  { id: "security", label: "System", icon: FiLock },
  { id: "categories", label: "Taxonomy", icon: FiTag },
];

// --- 3. MAIN COMPONENT ---
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(DEFAULT_SCHEMA);
  const [persistedSettings, setPersistedSettings] = useState(DEFAULT_SCHEMA);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('store_settings').select('data').single();
      if (data?.data) {
        const merged = { ...DEFAULT_SCHEMA, ...data.data };
        setSettings(merged);
        setPersistedSettings(merged);
      }
    } catch (err) {
      console.warn("Supabase fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(persistedSettings));
  }, [settings, persistedSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleBoolean = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDiscard = () => {
    setSettings(persistedSettings);
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('store_settings').upsert({ id: 1, data: settings, updated_at: new Date().toISOString() });
      if (error) throw error;
      setPersistedSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to sync settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400 font-bold">
      <div className="p-4 bg-indigo-50 rounded-full animate-pulse"><FiLoader className="animate-spin text-indigo-500" size={32} /></div>
      Loading Operational Parameters...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 selection:bg-indigo-100">
      
      {/* GLOBAL HEADER */}
      <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-xl py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-4 px-4 md:-mx-8 md:px-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Store Config</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded tracking-widest">PRO V4</span>
            <p className="text-slate-500 text-xs font-bold">Rabindra Wholesale Master Control</p>
          </div>
        </div>
        
        {activeTab !== "categories" && (
          <div className="flex flex-wrap items-center gap-3">
            <AnimatePresence>
              {hasChanges && (
                <motion.button 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} 
                  onClick={handleDiscard}
                  className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest bg-white hover:bg-rose-50 border border-slate-200 px-4 py-3 rounded-2xl transition-colors"
                >
                  <FiX size={14} /> Discard
                </motion.button>
              )}
            </AnimatePresence>
            <button 
              onClick={handleSave} 
              disabled={isSaving || saveSuccess || !hasChanges} 
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black transition-all active:scale-95 shadow-xl ${saveSuccess ? "bg-emerald-500 text-white shadow-emerald-500/30" : hasChanges ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
            >
              {isSaving ? <FiLoader className="animate-spin" /> : saveSuccess ? <FiCheck /> : <FiSave />}
              <span>{isSaving ? "Syncing..." : saveSuccess ? "Saved!" : "Deploy Config"}</span>
            </button>
          </div>
        )}
      </div>

      {/* NAV TABS */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 p-2 bg-slate-200/50 rounded-[2rem] border border-slate-200 shadow-inner w-fit max-w-full">
        {TABS.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${activeTab === tab.id ? "bg-white text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT ENGINE */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            
            {/* 1. IDENTITY & ASSETS */}
            {activeTab === "general" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-10">
                <SectionHeader icon={FiGlobe} title="Identity & Assets" desc="Brand details, core imagery, and contact routing." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <InputField label="Public Store Name" name="storeName" icon={FiShoppingBag} value={settings.storeName} onChange={handleInputChange} />
                  <InputField label="Store Logo URL" name="logoUrl" icon={FiExternalLink} placeholder="https://..." value={settings.logoUrl} onChange={handleInputChange} />
                  <InputField label="Favicon URL (.ico/.png)" name="faviconUrl" icon={FiExternalLink} placeholder="https://..." value={settings.faviconUrl} onChange={handleInputChange} />
                  <SelectField label="Base Currency" name="currency" options={[{value: "NPR", label: "NPR (Nepali Rupees)"}, {value: "INR", label: "INR (Indian Rupees)"}]} value={settings.currency} onChange={handleInputChange} />
                  <InputField label="Support Phone" name="supportPhone" icon={FiPhone} value={settings.supportPhone} onChange={handleInputChange} />
                  <InputField label="Corporate Email" name="supportEmail" icon={FiMail} value={settings.supportEmail} onChange={handleInputChange} />
                  <InputField label="Corporate PAN/VAT" name="taxIdNumber" icon={FiFileText} value={settings.taxIdNumber} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* 2. B2B ENGINE */}
            {activeTab === "pricing" && (
              <div className="space-y-8">
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)]">
                  <SectionHeader icon={FiZap} title="B2B Catalog Rules" desc="Control product visibility, ordering rules, and pricing thresholds." />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                    <StatusToggle stateKey="hidePricesFromGuests" label="Gate Pricing" desc="Hide prices until vendor logs in." checked={settings.hidePricesFromGuests} onToggle={() => toggleBoolean("hidePricesFromGuests")} />
                    <StatusToggle stateKey="requireApproval" label="Manual Vetting" desc="Admins must approve new vendor accounts." checked={settings.requireApproval} onToggle={() => toggleBoolean("requireApproval")} />
                    <StatusToggle stateKey="allowBackorders" label="Allow Backorders" desc="Let customers buy out-of-stock items." checked={settings.allowBackorders} onToggle={() => toggleBoolean("allowBackorders")} />
                    <StatusToggle stateKey="callForPrice" label="Call for Price" desc="Hide prices for high-ticket items." checked={settings.callForPrice} onToggle={() => toggleBoolean("callForPrice")} />
                    <StatusToggle stateKey="enableTieredPricing" label="Volume Discounts" desc="Auto-apply pricing tiers in cart." checked={settings.enableTieredPricing} onToggle={() => toggleBoolean("enableTieredPricing")} />
                    <StatusToggle stateKey="taxExemptForRegisteredVendors" label="B2B VAT Exemption" desc="Skip tax for vendors with verified PAN." checked={settings.taxExemptForRegisteredVendors} onToggle={() => toggleBoolean("taxExemptForRegisteredVendors")} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InputField label="Min. Order Value (Rs)" name="minOrderValue" type="number" value={settings.minOrderValue} onChange={handleInputChange} />
                    <InputField label="Default Net Terms (Days)" name="defaultNetTerms" type="number" value={settings.defaultNetTerms} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {/* 3. CHECKOUT & FINANCE */}
            {activeTab === "checkout" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiCreditCard} title="Checkout Constraints" desc="Manage how customers finalize their orders and pay." />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <StatusToggle stateKey="guestCheckout" label="Allow Guest Checkout" desc="Let users buy without creating an account." checked={settings.guestCheckout} onToggle={() => toggleBoolean("guestCheckout")} />
                  <StatusToggle stateKey="requirePhoneVerification" label="Enforce OTP" desc="Require SMS verification before checkout." checked={settings.requirePhoneVerification} onToggle={() => toggleBoolean("requirePhoneVerification")} />
                  <StatusToggle stateKey="requireTermsAtCheckout" label="Require T&C Checkbox" desc="Legally bind users to store policies." checked={settings.requireTermsAtCheckout} onToggle={() => toggleBoolean("requireTermsAtCheckout")} />
                  <StatusToggle stateKey="enableCOD" label="Cash on Delivery" desc="Collect cash upon dispatch." checked={settings.enableCOD} onToggle={() => toggleBoolean("enableCOD")} />
                  <StatusToggle stateKey="enableBankTransfer" label="Bank Transfers" desc="Show RTGS / Wire instructions." checked={settings.enableBankTransfer} onToggle={() => toggleBoolean("enableBankTransfer")} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <InputField label="Tax Rate (%)" name="taxRate" type="number" value={settings.taxRate} onChange={handleInputChange} />
                  <InputField label="Invoice Prefix" name="orderPrefix" placeholder="INV-" value={settings.orderPrefix} onChange={handleInputChange} />
                  <InputField label="Invoice Due In (Days)" name="invoiceDueDays" type="number" value={settings.invoiceDueDays} onChange={handleInputChange} />
                </div>
                {settings.enableBankTransfer && (
                  <TextAreaField label="Bank Account Details (Shown at checkout/invoice)" name="bankAccountDetails" rows={3} value={settings.bankAccountDetails} onChange={handleInputChange} />
                )}
              </div>
            )}

            {/* 4. UX & DISPLAY */}
            {activeTab === "display" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiEye} title="UX & Engagement" desc="Control how products are displayed and how customers interact." />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <SelectField label="Default Product View" name="defaultProductView" options={[{value: "grid", label: "Grid View (Images)"}, {value: "list", label: "List View (Compact)"}]} value={settings.defaultProductView} onChange={handleInputChange} />
                  <SelectField label="Inventory Display Format" name="stockDisplayFormat" options={[{value: "exact", label: "Show Exact Quantity (e.g. 5 left)"}, {value: "status", label: "Status Only (In Stock/Out)"}, {value: "hidden", label: "Hide Completely"}]} value={settings.stockDisplayFormat} onChange={handleInputChange} />
                  <InputField label="Return Window (Days)" name="returnWindowDays" type="number" value={settings.returnWindowDays} onChange={handleInputChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <StatusToggle stateKey="enableProductReviews" label="Product Reviews" desc="Allow customers to rate products." checked={settings.enableProductReviews} onToggle={() => toggleBoolean("enableProductReviews")} />
                  <StatusToggle stateKey="autoApproveReviews" label="Auto-Approve Reviews" desc="Publish reviews without manual admin check." checked={settings.autoApproveReviews} onToggle={() => toggleBoolean("autoApproveReviews")} />
                  <StatusToggle stateKey="enableWhatsappWidget" label="WhatsApp Chat Icon" desc="Show floating support icon." checked={settings.enableWhatsappWidget} onToggle={() => toggleBoolean("enableWhatsappWidget")} />
                </div>

                {settings.enableWhatsappWidget && (
                  <div className="mt-8"><InputField label="WhatsApp Widget Number" name="whatsappWidgetNumber" icon={FiMessageCircle} value={settings.whatsappWidgetNumber} onChange={handleInputChange} /></div>
                )}
              </div>
            )}

            {/* 5. LOGISTICS */}
            {activeTab === "logistics" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiTruck} title="Fulfillment Matrix" desc="Delivery rules, locations, and dispatch schedules." />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <InputField label="Base Delivery Fee (Rs)" name="baseShippingRate" type="number" value={settings.baseShippingRate} onChange={handleInputChange} />
                  <InputField label="Free Delivery Limit (Rs)" name="freeShippingThreshold" type="number" value={settings.freeShippingThreshold} onChange={handleInputChange} />
                  <InputField label="Standard Lead Time (Days)" name="estimatedDeliveryDays" type="number" value={settings.estimatedDeliveryDays} onChange={handleInputChange} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 mb-8">
                  <StatusToggle stateKey="localPickup" label="Warehouse Collection" desc="Allow buyers to self-pickup." checked={settings.localPickup} onToggle={() => toggleBoolean("localPickup")} />
                  <StatusToggle stateKey="enableSameDayDelivery" label="Same-Day Dispatch" desc="Rush orders placed before cutoff." checked={settings.enableSameDayDelivery} onToggle={() => toggleBoolean("enableSameDayDelivery")} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {settings.localPickup && <TextAreaField label="Pickup Address Instructions" name="pickupAddress" rows={2} value={settings.pickupAddress} onChange={handleInputChange} />}
                  {settings.enableSameDayDelivery && <InputField label="Same-Day Cutoff Time" name="sameDayCutoffTime" type="time" icon={FiClock} value={settings.sameDayCutoffTime} onChange={handleInputChange} />}
                </div>
              </div>
            )}

            {/* 6. WEB & SEO */}
            {activeTab === "web" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiShare2} title="Discovery & SEO" desc="Metadata, analytics, and social links." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <InputField label="Homepage Meta Title" name="seoTitle" value={settings.seoTitle} onChange={handleInputChange} />
                  <InputField label="GA4 Measurement ID" name="googleAnalyticsId" value={settings.googleAnalyticsId} onChange={handleInputChange} />
                  <TextAreaField label="Homepage Meta Description" name="seoDescription" rows={2} value={settings.seoDescription} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                  <InputField label="Facebook URL" name="facebookUrl" value={settings.facebookUrl} onChange={handleInputChange} />
                  <InputField label="Instagram URL" name="instagramUrl" value={settings.instagramUrl} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* 7. SYSTEM CORE WITH PASSWORD OVERRIDE */}
            {activeTab === "security" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiLock} title="System Core & Access" desc="Admin safeguards, firewalls, and credential management." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 mb-8">
                  <StatusToggle stateKey="maintenance" label="Maintenance Mode" desc="Lock storefront completely." checked={settings.maintenance} onToggle={() => toggleBoolean("maintenance")} />
                  <StatusToggle stateKey="require2FA" label="Enforce Admin 2FA" desc="Mandatory Authenticator login." checked={settings.require2FA} onToggle={() => toggleBoolean("require2FA")} />
                  <StatusToggle stateKey="blockSuspiciousIPs" label="Block Suspicious IPs" desc="Auto-ban repeated failed logins." checked={settings.blockSuspiciousIPs} onToggle={() => toggleBoolean("blockSuspiciousIPs")} />
                  <StatusToggle stateKey="emailNotifications" label="Auto-Invoice E-Mailing" desc="Send PDF invoices automatically." checked={settings.emailNotifications} onToggle={() => toggleBoolean("emailNotifications")} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <InputField label="Admin Idle Timeout (Mins)" name="sessionTimeoutMins" type="number" value={settings.sessionTimeoutMins} onChange={handleInputChange} />
                  <InputField label="Low Stock Warning (Units)" name="lowStockThreshold" type="number" value={settings.lowStockThreshold} onChange={handleInputChange} />
                </div>

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-10 mb-6 border-t border-slate-100 pt-8">
                  Master Access Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <InputField 
                    label="Master Node Password" 
                    name="adminPassword" 
                    type="text" 
                    icon={FiLock} 
                    placeholder="Enter new password..." 
                    value={settings.adminPassword} 
                    onChange={handleInputChange} 
                  />
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
                    <FiAlertCircle className="text-amber-600 mt-0.5 shrink-0" size={18} />
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-relaxed">
                      Warning: Changing this key will immediately update the login requirement for all devices. Do not forget this code!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "categories" && <div className="bg-transparent"><CategoryManager /></div>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between p-6 bg-white shadow-sm rounded-3xl border border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <FiRefreshCw className={isSaving ? "animate-spin text-indigo-500" : ""} /> Last Snapshot: {new Date().toLocaleTimeString()}
        </p>
        <button onClick={() => {
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `rabindra-core-backup.json`; a.click();
          }} className="text-[10px] font-black text-slate-500 hover:text-indigo-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:border-indigo-100 uppercase tracking-[0.2em] flex items-center gap-2 transition-all">
          <FiDatabase size={12} /> Pull Backup
        </button>
      </div>
    </div>
  );
}
