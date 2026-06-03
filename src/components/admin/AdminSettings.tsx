"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSave, FiGlobe, FiTag, FiPhone, FiMail, FiMapPin,
  FiShoppingBag, FiShield, FiTruck, FiBell, FiCreditCard,
  FiCheck, FiLoader, FiUsers, FiSearch, FiLock, FiAlertCircle,
  FiZap, FiDatabase, FiRefreshCw, FiExternalLink, FiUpload,
  FiFileText, FiShare2, FiClock, FiMessageCircle, FiEye, FiEyeOff, FiX,
  FiServer, FiSun, FiCoffee, FiAlertTriangle, FiCpu, FiLayout, FiMaximize, FiCommand,
  FiArrowDown,
  FiCheckCircle,
  FiActivity
} from "react-icons/fi";
import CategoryManager from "./CategoryManager";
import BulkRateEditor from "./BulkRateEditor";
import { supabase } from "@/utils/supabase";
import { cn } from "@/lib/utils";
import { useInventory } from "@/context/InventoryContext";

// --- 1. ENHANCED SCHEMA (UPGRADED FOR DUAL KEYS) ---
const DEFAULT_SCHEMA = {
  // 1. STORE IDENTITY
  storeName: "Rabindra Wholesale Mart",
  supportPhone: "+977 9860117783",
  supportEmail: "contact@rabindra.com",
  address: "Simraungadh, Bara, Nepal",
  whatsappNumber: "9779860117783",
  storeDescription: "The leading wholesale supplier for premium goods in Simraungadh.",

  // 2. OPERATIONS & HOURS
  openingTime: "08:00",
  closingTime: "20:00",
  holidayMode: false,
  maintenanceMode: false,
  announcement: "Fresh stock arrived! Visit us for the best wholesale rates.",
  allowOnlineOrders: true,
  enableOrderAudio: true,

  // 3. PRICING & DELIVERY
  minOrderValue: "500",
  deliveryCharge: "50",
  freeDeliveryThreshold: "5000",
  taxLabel: "VAT",
  taxPercentage: "13",
  enableTax: false,

  // 4. WEB & SEO
  seoTitle: "Rabindra Wholesale | Premium Wholesale Mart",
  seoDescription: "Simraungadh's premier wholesale infrastructure for groceries and essentials.",
  seoKeywords: "wholesale, mart, simraungadh, groceries, bara, nepal",
  ogImageUrl: "",
  googleAnalyticsId: "G-R8WZYFHD1K",
  facebookUrl: "https://facebook.com/stayrahul",
  instagramUrl: "",

  // 5. AI & NEURAL CORE
  aiModel: "GPT-4-Turbo",
  aiPromptTone: "Professional & Precise",
  autoTagging: true,
  imageOptimization: true,

  // 6. SECURITY & ACCESS (UPGRADED)
  appAdminPassword: "rabindra101",
  webAdminPassword: "rabindra115",
  sessionTimeoutMins: "120",
  lowStockThreshold: "5",
  lowStockAlerts: true,
  systemLockdown: false,
};

// --- 2. REUSABLE UI COMPONENTS ---
const SectionHeader = ({ icon: Icon, title, desc }: any) => (
  <div className="mb-8 sm:mb-10 border-b border-slate-100 pb-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
        <Icon size={20} className="sm:text-2xl" />
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-[10px] sm:text-sm text-slate-400 font-bold mt-1 tracking-tight">{desc}</p>
      </div>
    </div>
  </div>
);

const InputField = ({ label, name, type = "text", icon: Icon, placeholder = "", value, onChange }: any) => (
  <div className="space-y-3 group">
    <label className="text-[10px] font-black text-slate-400 ml-1 group-focus-within:text-indigo-600 transition-colors uppercase tracking-[0.2em]">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />}
      <input
        type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-14' : 'pl-6'} pr-6 py-4.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-slate-900 transition-all placeholder:text-slate-300 shadow-inner`}
      />
    </div>
  </div>
);

// UPGRADED: Secure Password Field with Visibility Toggle
const SecurePasswordField = ({ label, name, icon: Icon, value, onChange }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-3 group">
      <label className="text-[10px] font-black text-rose-500 ml-1 group-focus-within:text-rose-600 transition-colors uppercase tracking-[0.2em]">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-rose-500 transition-colors" size={18} />}
        <input
          type={show ? "text" : "password"} name={name} value={value || ""} onChange={onChange}
          className={`w-full ${Icon ? 'pl-14' : 'pl-6'} pr-14 py-4.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-black text-slate-900 transition-all shadow-inner`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors outline-none"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
};

const TextAreaField = ({ label, name, rows = 3, placeholder = "", value, onChange }: any) => (
  <div className="space-y-3 group col-span-full">
    <label className="text-[10px] font-black text-slate-400 ml-1 group-focus-within:text-indigo-600 transition-colors uppercase tracking-[0.2em]">{label}</label>
    <textarea
      name={name} value={value || ""} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-6 py-5 rounded-[2rem] border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm text-slate-700 transition-all resize-none placeholder:text-slate-300 shadow-inner leading-relaxed"
    />
  </div>
);

const StatusToggle = ({ label, desc, checked, onToggle, variant = "indigo" }: any) => {
  const colors = {
    indigo: "bg-indigo-600",
    rose: "bg-rose-600",
    emerald: "bg-emerald-600"
  }[variant as "indigo" | "rose" | "emerald"] || "bg-indigo-600";

  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer group",
        checked ? "bg-white border-slate-200 shadow-xl" : "bg-slate-50 border-slate-100 opacity-60 hover:opacity-100"
      )}
      onClick={onToggle}
    >
      <div className="pr-6">
        <h4 className="font-black text-slate-900 text-sm tracking-tight">{label}</h4>
        <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-relaxed uppercase tracking-widest">{desc}</p>
      </div>
      <button className={`shrink-0 w-14 h-7 flex items-center rounded-full p-1.5 transition-colors duration-300 ${checked ? colors : 'bg-slate-200'}`}>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className={cn("w-4 h-4 bg-white rounded-full shadow-md", checked ? "ml-auto" : "mr-auto")}
        />
      </button>
    </div>
  );
};

const TABS = [
  { id: "identity", label: "Identity", icon: FiGlobe },
  { id: "ops", label: "Operations", icon: FiClock },
  { id: "pricing", label: "Finance", icon: FiCreditCard },
  { id: "ai", label: "Neural", icon: FiCpu },
  { id: "web", label: "Marketing", icon: FiShare2 },
  { id: "security", label: "Security", icon: FiLock },
  { id: "categories", label: "Taxonomy", icon: FiTag },
];

// --- 3. MAIN COMPONENT ---
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("identity");
  const [settings, setSettings] = useState(DEFAULT_SCHEMA);
  const [persistedSettings, setPersistedSettings] = useState(DEFAULT_SCHEMA);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<"app" | "web" | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const { refreshSettings } = useInventory();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('store_settings').select('data').single();
      if (data?.data) {
        // Ensure old single passwords don't overwrite new defaults if missing
        const merged = { ...DEFAULT_SCHEMA, ...data.data };

        // Data migration safety check (if DB is completely missing the new keys)
        if (!merged.appAdminPassword) merged.appAdminPassword = DEFAULT_SCHEMA.appAdminPassword;
        if (!merged.webAdminPassword) merged.webAdminPassword = DEFAULT_SCHEMA.webAdminPassword;

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
    setSettings(prev => ({ ...prev, [key]: !prev[key] as any }));
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ id: 1, data: settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw error;
      setPersistedSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to sync settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="h-[600px] flex flex-col items-center justify-center gap-6">
      <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] shadow-2xl flex items-center justify-center">
        <FiLoader className="animate-spin text-indigo-600" size={32} />
      </div>
      <span className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Synchronizing Core...</span>
    </div>
  );

  return (
    <div className="max-w-[95rem] mx-auto space-y-12 pb-32 font-sans selection:bg-indigo-100">

      {/* ── STICKY CONTROL HEADER ── */}
      <div className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-2xl py-6 sm:py-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 -mx-4 px-4 md:-mx-12 md:px-12">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">Configuration</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest">v2.1</span>
            <p className="text-slate-400 text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-none">Manage global store parameters.</p>
          </div>
        </div>

        {activeTab !== "categories" && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <AnimatePresence>
              {hasChanges && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSettings(persistedSettings)}
                  className="flex-1 sm:flex-none px-6 py-4 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
                >
                  <FiX className="inline sm:mr-2" /> <span className="hidden sm:inline">Discard</span>
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess || !hasChanges}
              className={cn(
                "flex-1 sm:flex-none px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3",
                saveSuccess ? "bg-emerald-500 text-white shadow-emerald-200" :
                  hasChanges ? "bg-slate-900 text-white shadow-slate-900/40" :
                    "bg-white border border-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              {isSaving ? <FiLoader className="animate-spin" /> : saveSuccess ? <FiCheck /> : <FiSave />}
              <span className="hidden sm:inline">{isSaving ? "Syncing..." : saveSuccess ? "Synced" : "Commit Changes"}</span>
              <span className="sm:hidden">{isSaving ? "Syncing" : saveSuccess ? "Done" : "Save"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── TAB ORCHESTRATOR ── */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
              activeTab === tab.id ? "bg-white border-indigo-100 text-indigo-600 shadow-2xl shadow-indigo-100 sm:scale-105 z-10" : "bg-slate-50 border-transparent text-slate-400 hover:text-slate-600 hover:bg-white"
            )}
          >
            <tab.icon size={16} className="sm:text-lg" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DYNAMIC PANEL ENGINE ── */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}>

            {activeTab === "identity" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 space-y-12">
                  <SectionHeader icon={FiGlobe} title="Public Presence" desc="Define how the global infrastructure appears to the public." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Brand Name" name="storeName" icon={FiShoppingBag} value={settings.storeName} onChange={handleInputChange} />
                    <InputField label="WhatsApp Interface" name="whatsappNumber" icon={FiMessageCircle} placeholder="977..." value={settings.whatsappNumber} onChange={handleInputChange} />
                    <InputField label="Primary Phone" name="supportPhone" icon={FiPhone} value={settings.supportPhone} onChange={handleInputChange} />
                    <InputField label="Official Email" name="supportEmail" icon={FiMail} value={settings.supportEmail} onChange={handleInputChange} />
                    <TextAreaField label="Physical Infrastructure Location" name="address" value={settings.address} onChange={handleInputChange} />
                    <TextAreaField label="System Narrative / Bio" name="storeDescription" rows={3} value={settings.storeDescription} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <FiCommand className="absolute -bottom-6 -right-6 text-white/5 text-[12rem] transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Identity Tip</p>
                    <h4 className="text-xl font-black mb-4 tracking-tight">Consistent Branding</h4>
                    <p className="text-sm font-bold text-slate-400 leading-relaxed">Ensure your Brand Name and Bio reflect your wholesale focus to improve SEO ranking in search results.</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 text-indigo-900">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center"><FiShield /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Verification Status</span>
                    </div>
                    <p className="text-2xl font-black tracking-tighter">Verified Official</p>
                    <p className="text-xs font-bold mt-2 opacity-60">Metadata validated on {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ops" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 space-y-12">
                  <SectionHeader icon={FiClock} title="Operational Policies" desc="Manage active cycles, availability, and system-wide announcements." />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <StatusToggle label="Holiday Mode" desc="Suspend all public transactions" checked={settings.holidayMode} onToggle={() => toggleBoolean("holidayMode")} variant="rose" />
                    <StatusToggle label="Digital Commerce" desc="Enable online checkout engine" checked={settings.allowOnlineOrders} onToggle={() => toggleBoolean("allowOnlineOrders")} variant="emerald" />
                    <StatusToggle label="Maintenance Lock" desc="Restrict access to storefront" checked={settings.maintenanceMode} onToggle={() => toggleBoolean("maintenanceMode")} variant="rose" />
                    <StatusToggle label="Acoustic Alerts" desc="Audio pings on incoming orders" checked={settings.enableOrderAudio} onToggle={() => toggleBoolean("enableOrderAudio")} variant="indigo" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="grid grid-cols-2 gap-6">
                      <InputField label="Cycle Start" name="openingTime" type="time" icon={FiSun} value={settings.openingTime} onChange={handleInputChange} />
                      <InputField label="Cycle End" name="closingTime" type="time" icon={FiCoffee} value={settings.closingTime} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-4">
                      <InputField label="System-Wide Announcement" name="announcement" icon={FiBell} value={settings.announcement} onChange={handleInputChange} />
                      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl flex items-center gap-5 border border-white/10">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center animate-pulse"><FiBell /></div>
                        <p className="text-xs font-bold leading-tight">{settings.announcement || "Awaiting transmission..."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 space-y-12">
                <SectionHeader icon={FiCreditCard} title="Fiscal Parameters" desc="Configure fiscal thresholds, taxes, and logistic costs." />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <InputField label="Min. Order Value (NPR)" name="minOrderValue" type="number" icon={FiArrowDown} value={settings.minOrderValue} onChange={handleInputChange} />
                  <InputField label="Logistic Unit Cost" name="deliveryCharge" type="number" icon={FiTruck} value={settings.deliveryCharge} onChange={handleInputChange} />
                  <InputField label="Gratis Delivery Threshold" name="freeDeliveryThreshold" type="number" icon={FiCheckCircle} value={settings.freeDeliveryThreshold} onChange={handleInputChange} />
                </div>

                <div className="pt-12 border-t border-slate-50 flex flex-col gap-10">
                  <StatusToggle label="Fiscal Regulation (VAT/PAN)" desc="Apply taxation at transaction phase" checked={settings.enableTax} onToggle={() => toggleBoolean("enableTax")} />
                  {settings.enableTax && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-1 md:grid-cols-2 gap-10 overflow-hidden">
                      <InputField label="Regulation Label" name="taxLabel" placeholder="VAT" value={settings.taxLabel} onChange={handleInputChange} />
                      <InputField label="Tax Magnitude (%)" name="taxPercentage" type="number" value={settings.taxPercentage} onChange={handleInputChange} />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 space-y-12">
                  <SectionHeader icon={FiCpu} title="Neural Core Settings" desc="Configure the AI engine responsible for auto-tagging and content generation." />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Model</label>
                      <select name="aiModel" value={settings.aiModel} onChange={handleInputChange} className="w-full px-6 py-4.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-900 shadow-inner appearance-none">
                        <option value="GPT-4-Turbo">GPT-4 Turbo (Premium)</option>
                        <option value="GPT-3.5-Turbo">GPT-3.5 Turbo (Fast)</option>
                        <option value="Claude-3-Opus">Claude 3 Opus (Creative)</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prompt Personality</label>
                      <select name="aiPromptTone" value={settings.aiPromptTone} onChange={handleInputChange} className="w-full px-6 py-4.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-900 shadow-inner appearance-none">
                        <option value="Professional & Precise">Professional & Precise</option>
                        <option value="Casual & Engaging">Casual & Engaging</option>
                        <option value="Persuasive & Sales-y">Persuasive & Sales-y</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatusToggle label="Semantic Auto-Tagging" desc="AI will categorize products automatically" checked={settings.autoTagging} onToggle={() => toggleBoolean("autoTagging")} />
                    <StatusToggle label="Visual Optimization" desc="AI will compress and enhance images" checked={settings.imageOptimization} onToggle={() => toggleBoolean("imageOptimization")} />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                  <FiZap className="absolute top-0 right-0 text-white/5 text-[15rem]" />
                  <h4 className="text-3xl font-black tracking-tighter mb-6">Neural Capacity</h4>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                        <span>Processing Power</span>
                        <span>98%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[98%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                        <span>Token Allocation</span>
                        <span>42%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[42%] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "web" && (
              <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 space-y-12">
                <SectionHeader icon={FiShare2} title="Digital Marketing & SEO" desc="Define how search engines and social platforms perceive the store." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <InputField label="SEO Meta Identity" name="seoTitle" icon={FiSearch} value={settings.seoTitle} onChange={handleInputChange} />
                  <InputField label="Analytics Telemetry ID" name="googleAnalyticsId" icon={FiDatabase} placeholder="G-XXXXXX" value={settings.googleAnalyticsId} onChange={handleInputChange} />
                  <TextAreaField label="Global Meta Narrative" name="seoDescription" rows={3} value={settings.seoDescription} onChange={handleInputChange} />
                  <div className="space-y-8">
                    <InputField label="Facebook Protocol" name="facebookUrl" icon={FiExternalLink} value={settings.facebookUrl} onChange={handleInputChange} />
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FiLayout className="text-indigo-600" size={24} />
                        <span className="text-sm font-black text-slate-900">Sitemap Engine</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-lg">Auto-Generating</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPGRADED SECURITY TAB */}
            {activeTab === "security" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 space-y-12">
                  <SectionHeader icon={FiLock} title="Access & Security Control" desc="Define safety thresholds and manage master administrative credentials." />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <InputField label="Alert Threshold (Low Stock)" name="lowStockThreshold" type="number" icon={FiAlertTriangle} value={settings.lowStockThreshold} onChange={handleInputChange} />
                    <InputField label="Session Expiry (Minutes)" name="sessionTimeoutMins" type="number" icon={FiClock} value={settings.sessionTimeoutMins} onChange={handleInputChange} />

                    {/* NEW: Dual Password Configuration via Modal */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-1">App Login PIN</label>
                      <button 
                        onClick={() => setShowPasswordModal("app")}
                        className="w-full flex items-center justify-between px-6 py-4.5 rounded-2xl border border-rose-200 bg-rose-50 text-slate-900 font-black hover:bg-rose-100 transition-colors shadow-sm active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3"><FiShield className="text-rose-500"/> Update App PIN</div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 bg-white px-3 py-1.5 rounded-md border border-rose-100 shadow-sm">Click to change</span>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-1">Web Terminal Key</label>
                      <button 
                        onClick={() => setShowPasswordModal("web")}
                        className="w-full flex items-center justify-between px-6 py-4.5 rounded-2xl border border-rose-200 bg-rose-50 text-slate-900 font-black hover:bg-rose-100 transition-colors shadow-sm active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3"><FiLock className="text-rose-500"/> Update Web Key</div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 bg-white px-3 py-1.5 rounded-md border border-rose-100 shadow-sm">Click to change</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-rose-600 mb-2">
                        <FiAlertCircle />
                        <span className="text-[10px] font-black uppercase tracking-widest">Security Warning</span>
                      </div>
                      <p className="text-xs font-bold text-rose-500">Changing the Master Keys will terminate all active admin sessions globally.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-8 sm:p-10 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <FiServer className="text-indigo-600" /> Infra Status
                    </h4>
                    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                      {[
                        { label: "Latency", value: "12ms", status: "optimal" },
                        { label: "Database", value: "Normal", status: "optimal" },
                        { label: "Uptime", value: "99.9%", status: "optimal" },
                        { label: "Sync", value: "0ms", status: "optimal" }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                          <span className="text-xs font-black text-slate-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="mt-8 sm:mt-10 w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Audit Logs</button>
                </div>
              </div>
            )}

            {activeTab === "categories" && <div className="bg-transparent"><CategoryManager /></div>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── ADDITIONAL TOOLS BAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.8rem] flex items-center justify-center transition-transform group-hover:scale-110">
              <FiZap size={28} />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Mass Rate Sync</h4>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Adjust all prices by % or fixed value</p>
            </div>
          </div>
          <button
            onClick={() => setShowBulkEditor(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
          >
            Open Engine
          </button>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.8rem] flex items-center justify-center transition-transform group-hover:scale-110">
              <FiDatabase size={28} />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Re-index Store</h4>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Force metadata refresh across catalog</p>
            </div>
          </div>
          <button
            onClick={async () => {
              setIsLoading(true);
              await refreshSettings();
              setTimeout(() => setIsLoading(false), 1000);
            }}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Re-index
          </button>
        </div>
      </div>

      {/* ── GLOBAL BACKUP FOOTER ── */}
      <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-white shadow-2xl shadow-slate-100 rounded-[3rem] border border-slate-100 mt-12 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <FiRefreshCw className={isSaving ? "animate-spin" : ""} size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Global Sync Active</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Hash: {new Date().getTime().toString(16).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            id="settings-upload"
            className="hidden"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const imported = JSON.parse(ev.target?.result as string);
                    setSettings(prev => ({ ...prev, ...imported }));
                    alert("Settings imported into draft. Click 'Commit Changes' to save.");
                  } catch (err) {
                    alert("Invalid settings file.");
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
          <button
            onClick={() => document.getElementById('settings-upload')?.click()}
            className="px-10 py-5 bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 flex items-center gap-3 shadow-sm"
          >
            <FiUpload size={18} /> Import Draft
          </button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `rabindra-settings-v2.json`; a.click();
            }}
            className="px-10 py-5 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 flex items-center gap-3 shadow-sm"
          >
            <FiDatabase size={18} /> Download Backup
          </button>
        </div>
      </div>

      {/* ── BULK EDITOR MODAL ── */}
      <AnimatePresence>
        {showBulkEditor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulkEditor(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <BulkRateEditor onClose={() => { setShowBulkEditor(false); loadData(); }} />
          </div>
        )}
      </AnimatePresence>

      {/* ── PASSWORD CHANGE MODAL ── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowPasswordModal(null); setPasswordForm({ current: "", new: "", confirm: "" }); setPasswordError(""); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl z-10 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FiLock className="text-rose-500" /> Change {showPasswordModal === "app" ? "App PIN" : "Web Key"}
                </h3>
                <button onClick={() => { setShowPasswordModal(null); setPasswordForm({ current: "", new: "", confirm: "" }); setPasswordError(""); }} className="text-slate-400 hover:text-slate-900 transition-colors p-2 bg-slate-50 rounded-xl">
                  <FiX size={20} />
                </button>
              </div>

              {passwordError && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3 shadow-sm">
                  <FiAlertTriangle size={18} className="shrink-0 text-rose-500" /> {passwordError}
                </div>
              )}

              <div className="space-y-5">
                <InputField label="Current Key" type="password" icon={FiLock} value={passwordForm.current} onChange={(e: any) => { setPasswordForm({ ...passwordForm, current: e.target.value }); setPasswordError(""); }} />
                <InputField label="New Key" type="password" icon={FiShield} value={passwordForm.new} onChange={(e: any) => { setPasswordForm({ ...passwordForm, new: e.target.value }); setPasswordError(""); }} />
                <InputField label="Confirm New Key" type="password" icon={FiCheckCircle} value={passwordForm.confirm} onChange={(e: any) => { setPasswordForm({ ...passwordForm, confirm: e.target.value }); setPasswordError(""); }} />
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { setShowPasswordModal(null); setPasswordForm({ current: "", new: "", confirm: "" }); setPasswordError(""); }} className="flex-1 py-4.5 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors active:scale-95">Cancel</button>
                <button 
                  onClick={() => {
                    const currentKey = showPasswordModal === "app" ? settings.appAdminPassword : settings.webAdminPassword;
                    if (passwordForm.current !== currentKey) return setPasswordError("Current key is incorrect.");
                    if (passwordForm.new !== passwordForm.confirm) return setPasswordError("New keys do not match.");
                    if (passwordForm.new.length < 6) return setPasswordError("New key must be at least 6 characters.");
                    
                    setSettings(prev => ({ ...prev, [showPasswordModal === "app" ? "appAdminPassword" : "webAdminPassword"]: passwordForm.new }));
                    setShowPasswordModal(null);
                    setPasswordForm({ current: "", new: "", confirm: "" });
                    setPasswordError("");
                  }} 
                  className="flex-1 py-4.5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/30 active:scale-95"
                >
                  Confirm Change
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}