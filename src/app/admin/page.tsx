"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AdminAuth from "@/components/admin/AdminAuth";
import AdminOverview from "@/components/admin/AdminOverview"; 
import InventoryTable from "@/components/admin/InventoryTable";
import AddProductForm from "@/components/admin/AddProductForm";
import AdminSettings from "@/components/admin/AdminSettings";

// Icons
import { 
  FiHome, FiBox, FiPlusCircle, FiLogOut, FiSettings,
  FiExternalLink, FiActivity, FiZap, FiMenu, FiChevronLeft, FiChevronRight, FiSearch
} from "react-icons/fi"; 
import { Product, useInventory } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview"); 
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [clock, setClock] = useState("");
  const { products } = useInventory();

  // Security & Hydration
  useEffect(() => {
    setMounted(true);
    // Security layer: Check for tampered session state
    const authTime = sessionStorage.getItem("admin_auth_timestamp");
    if (authTime) {
      const parsedTime = parseInt(authTime, 10);
      if (isNaN(parsedTime) || Date.now() - parsedTime > 24 * 60 * 60 * 1000) {
        handleLogout(); // Force logout if session is malformed or expired (>24h)
      }
    }
    // Live clock
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    tick();
    const clockInterval = setInterval(tick, 30000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleEdit = (product: Product) => {
    setEditingItem(product);
    setActiveTab("add"); 
  };

  const handleFormSuccess = () => {
    setEditingItem(null); 
    setActiveTab("inventory"); 
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    if (id !== 'add') setEditingItem(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth_timestamp");
    localStorage.removeItem("admin_lockout_timestamp");
    window.location.reload(); 
  };

  if (!mounted) return null;

  const NAV_ITEMS = [
    { id: "overview", label: "Dashboard", icon: FiHome, desc: "Overview and analytics" },
    { id: "inventory", label: "Catalog", icon: FiBox, desc: `${products.length} products in inventory` },
    { id: "add", label: editingItem ? "Edit Product" : "Add Product", icon: FiPlusCircle, desc: "Configure product details" },
    { id: "settings", label: "Settings", icon: FiSettings, desc: "Store configuration" },
  ];

  const currentTab = NAV_ITEMS.find(t => t.id === activeTab);
  const currentTabLabel = currentTab?.label || "Dashboard";
  const currentTabDesc = currentTab?.desc || "";

  return (
    <AdminAuth>
      <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className={cn(
          "hidden lg:flex flex-col bg-slate-900 border-r border-white/5 shadow-2xl z-20 relative transition-all duration-500 ease-in-out",
          isSidebarCollapsed ? "w-[100px]" : "w-[300px]"
        )}>
          
          {/* Logo Section */}
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 relative group">
                <FiZap className="text-white text-xl group-hover:scale-125 transition-transform" />
              </div>
              {!isSidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase">Hub<span className="text-indigo-400">.OS</span></h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5">Rabindra Store</p>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest outline-none group overflow-hidden",
                    isActive ? "text-white bg-white/10 shadow-xl" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className={cn("text-xl transition-transform", isActive ? "scale-110 text-indigo-400" : "group-hover:scale-110")}>
                    <item.icon />
                  </span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                  {isActive && !isSidebarCollapsed && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-400 rounded-l-full shadow-[0_0_15px_rgba(129,140,248,0.5)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-4 top-24 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center border-4 border-slate-50 hover:bg-indigo-700 transition-all shadow-xl z-30"
          >
            {isSidebarCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
          </button>

          {/* User & Sign Out */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-400 transition-all group",
                isSidebarCollapsed && "justify-center"
              )}
            >
              <FiLogOut className="text-xl group-hover:-translate-x-1 transition-transform" />
              {!isSidebarCollapsed && <span>Terminate</span>}
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT WRAPPER --- */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
          
          {/* --- TOP HEADER (MISSION CONTROL) --- */}
          <header className="hidden lg:flex items-center justify-between h-[100px] px-12 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-12 flex-1">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                  {currentTabLabel}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{currentTabDesc}</p>
              </div>

              {/* Spotlight Search */}
              <div className="relative max-w-md w-full group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Spotlight Search..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-8 px-8 border-l border-slate-100">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timezone</span>
                  <span className="text-sm font-black text-slate-900">{clock}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latency</span>
                  <span className="text-sm font-black text-emerald-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 12ms
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Engine</span>
                  <span className="text-sm font-black text-indigo-500 uppercase tracking-tight flex items-center gap-2">
                    Active
                  </span>
                </div>
              </div>

              <a 
                href="/" 
                target="_blank" 
                className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 active:scale-90"
                title="View Storefront"
              >
                <FiExternalLink size={20} />
              </a>
            </div>
          </header>

          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-y-auto p-4 pb-28 md:p-10 custom-scrollbar relative">
            {/* Mobile Top Bar */}
            <div className="lg:hidden flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                  <FiActivity className="text-indigo-600 text-lg" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Rabindra</h1>
              </div>
              <button onClick={handleLogout} className="p-2.5 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 rounded-xl border border-rose-100 transition-colors shadow-sm">
                <FiLogOut size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="max-w-[90rem] mx-auto w-full"
              >
                {activeTab === "overview" && <AdminOverview />}
                {activeTab === "settings" && <AdminSettings />}
                
                {activeTab === "inventory" && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Product Catalog</h2>
                      <p className="text-slate-500 mt-1 font-medium">Manage your enterprise inventory and stock levels.</p>
                    </div>
                    <InventoryTable onEdit={handleEdit} />
                  </div>
                )}

                {activeTab === "add" && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingItem ? "Edit Product" : "Add New Product"}</h2>
                      <p className="text-slate-500 mt-1 font-medium">Configure product details, variants, and imagery.</p>
                    </div>
                    <AddProductForm initialData={editingItem} onSuccess={handleFormSuccess} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* --- MOBILE BOTTOM NAV --- */}
        <aside className="lg:hidden fixed bottom-6 left-4 right-4 z-50 bg-white border border-slate-200 p-2 rounded-2xl shadow-xl flex justify-between items-center px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className="relative flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-xl outline-none group"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTabAdminLight"
                    className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={cn("text-xl mb-1 transition-transform", isActive ? "text-indigo-600 scale-110" : "text-slate-400 group-hover:text-slate-600")}>
                  <item.icon />
                </span>
                {isActive && <div className="w-1 h-1 bg-indigo-600 rounded-full" />}
              </button>
            );
          })}
        </aside>

      </div>
    </AdminAuth>
  );
}