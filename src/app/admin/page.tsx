"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AdminAuth from "@/components/admin/AdminAuth";
import AdminOverview from "@/components/admin/AdminOverview"; 
import InventoryTable from "@/components/admin/InventoryTable";
import AddProductForm from "@/components/admin/AddProductForm";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminStorefront from "@/components/admin/AdminStorefront";

// Icons
import { 
  FiHome, FiBox, FiPlusCircle, FiLogOut, FiSettings,
  FiLayout, FiMessageSquare, FiExternalLink, FiUser
} from "react-icons/fi"; 
import { Product } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview"); 
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => setMounted(true), []);

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

  // FIXED LOGOUT: Now uses the correct keys from the AdminAuth component
  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth_timestamp");
    localStorage.removeItem("admin_lockout_timestamp"); // Clears any lockouts too
    window.location.reload(); 
  };

  if (!mounted) return null;

  const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: FiHome },
    { id: "inventory", label: "Inventory", icon: FiBox },
    { id: "storefront", label: "Storefront", icon: FiLayout },
    { id: "add", label: editingItem ? "Edit Item" : "Add Item", icon: FiPlusCircle },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  const currentTabLabel = NAV_ITEMS.find(t => t.id === activeTab)?.label || "Dashboard";

  return (
    <AdminAuth>
      <div className="flex h-screen bg-[#F4F4F5] text-slate-900 font-sans overflow-hidden selection:bg-indigo-100">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden md:flex flex-col w-[280px] bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.01)] z-20">
          {/* Logo Section */}
          <div className="p-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
              <FiBox className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Rabindra</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">Master Control</p>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "relative w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors font-bold text-sm outline-none group",
                    isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {/* Animated Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-indigo-50/80 border border-indigo-100 rounded-2xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={cn("text-lg transition-transform", isActive ? "scale-110" : "group-hover:scale-110")}>
                    <item.icon />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <FiUser className="text-indigo-600" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-slate-800 truncate">Sushant Kushwaha</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-bold text-sm hover:bg-rose-50 hover:text-rose-600 transition-colors group"
            >
              <FiLogOut className="text-lg group-hover:-translate-x-1 transition-transform" />
              Terminate Session
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT WRAPPER --- */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Top Header (Desktop) */}
          <header className="hidden md:flex items-center justify-between h-20 px-10 bg-white/50 backdrop-blur-md border-b border-slate-200/60 shrink-0 z-10">
            <div>
              <h2 className="text-xl font-black text-slate-800">{currentTabLabel}</h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Manage your wholesale operations</p>
            </div>
            <a 
              href="/" 
              target="_blank" 
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              <FiExternalLink size={14} /> View Store
            </a>
          </header>

          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-y-auto p-4 pb-28 md:p-10 custom-scrollbar relative">
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <FiBox className="text-white text-sm" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Rabindra</h1>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl shadow-sm border border-slate-100">
                <FiLogOut size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="max-w-6xl mx-auto w-full"
              >
                {activeTab === "overview" && <AdminOverview />}
                {activeTab === "analytics" && <AdminAnalytics />}
                {activeTab === "settings" && <AdminSettings />}
                {activeTab === "storefront" && <AdminStorefront />}
                
                {activeTab === "inventory" && (
                  <div className="space-y-6">
                    <div className="px-2 md:px-0">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Inventory</h2>
                      <p className="text-slate-500 mt-1 font-medium text-sm">Search, update stock, and manage live rates.</p>
                    </div>
                    <InventoryTable onEdit={handleEdit} />
                  </div>
                )}

                {activeTab === "add" && <AddProductForm initialData={editingItem} onSuccess={handleFormSuccess} />}

                {activeTab === "inquiries" && (
                  <div className="bg-white rounded-[3rem] border border-slate-100 p-16 md:p-20 text-center shadow-sm max-w-2xl mx-auto mt-10">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiMessageSquare size={36} className="text-indigo-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Bulk Inquiries</h3>
                    <p className="text-slate-500 font-medium mt-3">Customer WhatsApp order logs will appear here soon.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* --- MOBILE BOTTOM NAV --- */}
        <aside className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-xl border border-slate-200/60 p-2 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex justify-between items-center px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className="relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl outline-none group"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={cn("text-xl mb-1 transition-transform", isActive ? "text-indigo-600 scale-110" : "text-slate-400 group-hover:text-slate-600")}>
                  <item.icon />
                </span>
                <span className={cn("text-[9px] font-black uppercase tracking-wider transition-colors", isActive ? "text-indigo-600" : "text-slate-400")}>
                  {item.id === 'add' && editingItem ? 'Edit' : item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </aside>

      </div>
    </AdminAuth>
  );
}