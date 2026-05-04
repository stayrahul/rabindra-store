"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSave, FiGlobe, FiTag, FiPhone, FiMail, 
  FiShoppingBag, FiTruck, FiCreditCard, FiCheck, 
  FiLoader, FiLock, FiAlertCircle, FiZap, FiDatabase, 
  FiRefreshCw, FiExternalLink, FiFileText, FiShare2, 
  FiClock, FiMessageCircle, FiEye, FiEyeOff, FiX, FiPlus, FiTrash2
} from "react-icons/fi";
import { supabase } from "@/utils/supabase";

// --- 1. EXPANDED MASTER SCHEMA ---
const DEFAULT_SCHEMA = {
  // IDENTITY
  storeName: "Rabindra Wholesale Mart",
  logoUrl: "",
  faviconUrl: "",
  supportPhone: "+977 9860117783",
  supportEmail: "contact@rabindra.com",
  address: "Simraungadh, Bara, Nepal",
  currency: "NPR",
  taxIdNumber: "PAN-123456789",
  operatingHours: "08:00 AM - 08:00 PM",
  
  // TAXONOMY (Dynamic Category Array)
  categories: [
    "Staples & Grains",
    "Cooking Oils & Ghee",
    "Spices & Condiments",
    "Household & Cleaning",
    "Personal Care & Hygiene",
    "Snacks & Instant Foods",
    "Beverages"
  ],

  // B2B RULES
  requireApproval: true,
  hidePricesFromGuests: true,
  allowBackorders: false, 
  enableTieredPricing: true,

  // LOGISTICS
  baseShippingRate: "150",
  freeShippingThreshold: "15000",
  localPickup: true,
  enableSameDayDelivery: true,
  sameDayCutoffTime: "14:00",

  // CHECKOUT & FINANCE
  taxRate: "13",
  orderPrefix: "RAB-",
  enableCOD: true,
  enableBankTransfer: true,
  enableEsewa: false,
  enableKhalti: false,
  bankAccountDetails: "Bank: Everest Bank Ltd.\nAcct Name: Rabindra Mart\nAcct No: 12345678901234",

  // UX & SEO
  enableProductReviews: true, 
  enableWhatsappWidget: true, 
  whatsappWidgetNumber: "9779860117783",
  seoTitle: "Rabindra Wholesale | Premium Supply",
  seoDescription: "Leading wholesale supplier in Nepal.",

  // SECURITY
  adminPassword: "rabindra-secure",
  emailNotifications: true,
  maintenance: false,
  require2FA: true,
  blockSuspiciousIPs: true, 
};

// --- 2. REUSABLE UI COMPONENTS ---

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

// UPGRADED: Secure Password Input
const PasswordField = ({ label, name, value, onChange }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 group-focus-within:text-rose-600 transition-colors">{label}</label>
      <div className="relative">
        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
        <input 
          type={show ? "text" : "password"} name={name} value={value || ""} onChange={onChange} 
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-slate-900 transition-all shadow-sm" 
        />
        <button 
          type="button" onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
};

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

const TABS = [
  { id: "general", label: "Identity", icon: FiGlobe },
  { id: "categories", label: "Taxonomy", icon: FiTag },
  { id: "pricing", label: "B2B Engine", icon: FiZap },
  { id: "checkout", label: "Checkout", icon: FiCreditCard },
  { id: "logistics", label: "Logistics", icon: FiTruck },
  { id: "security", label: "Security", icon: FiLock },
];

// --- 3. MAIN ENGINE ---
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(DEFAULT_SCHEMA);
  const [persistedSettings, setPersistedSettings] = useState(DEFAULT_SCHEMA);
  
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('store_settings').select('data').single();
      if (data?.data) {
        // Merge DB data with schema to ensure new fields aren't missing
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
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }));
  };

  // CATEGORY MANAGEMENT LOGIC
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = newCategory.trim();
    if (cleanCat && !settings.categories.includes(cleanCat)) {
      setSettings(prev => ({ ...prev, categories: [...prev.categories, cleanCat] }));
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c !== catToRemove) }));
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
      <div className="sticky top-0 z-40 bg-slate-50/95 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-4 px-4 md:-mx-8 md:px-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Store Config</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded tracking-widest">PRO V5</span>
            <p className="text-slate-500 text-xs font-bold">Master Control Node</p>
          </div>
        </div>
        
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
                <SectionHeader icon={FiGlobe} title="Identity & Contact" desc="Store details, operating hours, and customer routing." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <InputField label="Public Store Name" name="storeName" icon={FiShoppingBag} value={settings.storeName} onChange={handleInputChange} />
                  <InputField label="Corporate PAN/VAT" name="taxIdNumber" icon={FiFileText} value={settings.taxIdNumber} onChange={handleInputChange} />
                  <InputField label="Operating Hours" name="operatingHours" icon={FiClock} placeholder="08:00 AM - 08:00 PM" value={settings.operatingHours} onChange={handleInputChange} />
                  <InputField label="Support Phone" name="supportPhone" icon={FiPhone} value={settings.supportPhone} onChange={handleInputChange} />
                  <InputField label="WhatsApp Contact" name="whatsappWidgetNumber" icon={FiMessageCircle} value={settings.whatsappWidgetNumber} onChange={handleInputChange} />
                  <InputField label="Corporate Email" name="supportEmail" icon={FiMail} value={settings.supportEmail} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* 2. CATEGORY MANAGER (NATIVE) */}
            {activeTab === "categories" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiTag} title="Taxonomy Engine" desc="Manage the high-level categories that organize your entire inventory." />
                
                <form onSubmit={handleAddCategory} className="flex gap-4">
                  <div className="flex-1">
                    <InputField label="Create New Category" name="newCategory" icon={FiTag} placeholder="e.g. Dry Fruits & Nuts" value={newCategory} onChange={(e: any) => setNewCategory(e.target.value)} />
                  </div>
                  <button type="submit" disabled={!newCategory.trim()} className="mt-[28px] shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-8 rounded-2xl font-black transition-colors flex items-center gap-2">
                    <FiPlus size={20} /> Add
                  </button>
                </form>

                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Categories ({settings.categories.length})</h4>
                  <div className="flex flex-wrap gap-3">
                    {settings.categories.map((cat, idx) => (
                      <div key={idx} className="group flex items-center gap-2 bg-white border border-slate-200 pl-4 pr-2 py-2 rounded-xl shadow-sm hover:border-indigo-300 transition-all">
                        <span className="text-sm font-bold text-slate-800">{cat}</span>
                        <button 
                          onClick={() => handleRemoveCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {settings.categories.length === 0 && (
                      <p className="text-sm font-medium text-slate-500 italic">No categories found. Add one above.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. B2B ENGINE */}
            {activeTab === "pricing" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiZap} title="B2B Catalog Rules" desc="Control product visibility and ordering constraints." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <StatusToggle stateKey="hidePricesFromGuests" label="Gate Pricing" desc="Hide prices until vendor logs in." checked={settings.hidePricesFromGuests} onToggle={() => toggleBoolean("hidePricesFromGuests")} />
                  <StatusToggle stateKey="requireApproval" label="Manual Vetting" desc="Admins must approve new vendor accounts." checked={settings.requireApproval} onToggle={() => toggleBoolean("requireApproval")} />
                  <StatusToggle stateKey="allowBackorders" label="Allow Backorders" desc="Let customers buy out-of-stock items." checked={settings.allowBackorders} onToggle={() => toggleBoolean("allowBackorders")} />
                  <StatusToggle stateKey="enableTieredPricing" label="Volume Discounts" desc="Auto-apply pricing tiers in cart." checked={settings.enableTieredPricing} onToggle={() => toggleBoolean("enableTieredPricing")} />
                </div>
              </div>
            )}

            {/* 4. CHECKOUT & FINANCE */}
            {activeTab === "checkout" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiCreditCard} title="Payments & Processing" desc="Manage local payment gateways and invoice rules." />
                
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Payment Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <StatusToggle stateKey="enableCOD" label="Cash on Delivery" desc="Standard cash collection." checked={settings.enableCOD} onToggle={() => toggleBoolean("enableCOD")} />
                  <StatusToggle stateKey="enableBankTransfer" label="Bank Transfer" desc="Manual RTGS/Wire." checked={settings.enableBankTransfer} onToggle={() => toggleBoolean("enableBankTransfer")} />
                  <StatusToggle stateKey="enableEsewa" label="eSewa Integrations" desc="Accept local eSewa wallet." checked={settings.enableEsewa} onToggle={() => toggleBoolean("enableEsewa")} />
                  <StatusToggle stateKey="enableKhalti" label="Khalti Integrations" desc="Accept local Khalti wallet." checked={settings.enableKhalti} onToggle={() => toggleBoolean("enableKhalti")} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <InputField label="Tax Rate (%)" name="taxRate" type="number" value={settings.taxRate} onChange={handleInputChange} />
                  <InputField label="Invoice Prefix" name="orderPrefix" placeholder="RAB-" value={settings.orderPrefix} onChange={handleInputChange} />
                </div>
                {settings.enableBankTransfer && (
                  <TextAreaField label="Bank Account Details (Shown at checkout/invoice)" name="bankAccountDetails" rows={3} value={settings.bankAccountDetails} onChange={handleInputChange} />
                )}
              </div>
            )}

            {/* 5. LOGISTICS */}
            {activeTab === "logistics" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiTruck} title="Fulfillment Matrix" desc="Delivery constraints and local dispatch schedules." />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <InputField label="Base Delivery Fee (Rs)" name="baseShippingRate" type="number" value={settings.baseShippingRate} onChange={handleInputChange} />
                  <InputField label="Free Delivery Limit (Rs)" name="freeShippingThreshold" type="number" value={settings.freeShippingThreshold} onChange={handleInputChange} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 mb-8">
                  <StatusToggle stateKey="localPickup" label="Warehouse Collection" desc="Allow buyers to self-pickup." checked={settings.localPickup} onToggle={() => toggleBoolean("localPickup")} />
                  <StatusToggle stateKey="enableSameDayDelivery" label="Same-Day Dispatch" desc="Rush orders placed before cutoff." checked={settings.enableSameDayDelivery} onToggle={() => toggleBoolean("enableSameDayDelivery")} />
                </div>
              </div>
            )}

            {/* 6. SECURITY VAULT */}
            {activeTab === "security" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] space-y-8">
                <SectionHeader icon={FiLock} title="Credential Vault & Firewall" desc="Safeguard the system and manage master credentials." />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 mb-8">
                  <StatusToggle stateKey="maintenance" label="Maintenance Mode" desc="Lock storefront completely." checked={settings.maintenance} onToggle={() => toggleBoolean("maintenance")} />
                  <StatusToggle stateKey="require2FA" label="Enforce Admin 2FA" desc="Mandatory Authenticator login." checked={settings.require2FA} onToggle={() => toggleBoolean("require2FA")} />
                  <StatusToggle stateKey="blockSuspiciousIPs" label="Block Suspicious IPs" desc="Auto-ban repeated failed logins." checked={settings.blockSuspiciousIPs} onToggle={() => toggleBoolean("blockSuspiciousIPs")} />
                </div>

                <div className="p-8 border-2 border-rose-100 bg-rose-50/30 rounded-3xl shadow-sm">
                  <h4 className="text-sm font-black text-rose-900 flex items-center gap-2 mb-6">
                    <FiAlertCircle className="text-rose-600" size={20} /> Danger Zone: Master Password
                  </h4>
                  <div className="max-w-md">
                    <PasswordField label="Master Node Password" name="adminPassword" value={settings.adminPassword} onChange={handleInputChange} />
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-4 leading-relaxed">
                      Saving a new key immediately revokes access for all currently active admin sessions.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER SNAPSHOT */}
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
