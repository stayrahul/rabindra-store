"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- CORRECTED IMPORTS BASED ON YOUR FILER EXPLORER ---
import AdminAuth from "@/components/admin/AdminAuth";
import AdminOverview from "@/components/admin/AdminOverview"; 
import InventoryTable from "@/components/admin/InventoryTable";
import AddProductForm from "@/components/admin/AddProductForm";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

// Icons
import { 
  FiHome, 
  FiBox, 
  FiPlusCircle, 
  FiLogOut, 
  FiSettings,
  FiBarChart2,
  FiLayout,
  FiMessageSquare
} from "react-icons/fi"; 
import { Product } from "@/context/InventoryContext";

const NavButton = ({ 
  id, 
  label, 
  icon, 
  isActive, 
  onClick 
}: { 
  id: string; 
  label: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 shrink-0 md:shrink w-auto md:w-full text-center md:text-left p-3 md:px-4 md:py-3 rounded-2xl transition-all font-medium ${
      isActive 
      ? "text-indigo-600 bg-indigo-50 shadow-sm md:shadow-none" 
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    }`}
  >
    <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</span>
    <span className="hidden sm:block text-[10px] md:text-base font-bold uppercase md:capitalize tracking-wider md:tracking-normal">
      {label}
    </span>
  </button>
);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview"); 
  const [editingItem, setEditingItem] = useState<Product | null>(null);

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
    sessionStorage.removeItem("adminAuthTime");
    window.location.reload();
  };

  return (
    <AdminAuth>
      <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24 md:pb-0">
        
        {/* Sidebar / Bottom Nav */}
        <aside className="fixed bottom-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 md:relative md:w-64 md:h-screen md:border-r md:border-t-0 md:flex md:flex-col p-2 md:p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none overflow-x-auto md:overflow-visible scrollbar-hide">
          <div className="hidden md:block mb-8 px-4 mt-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rabindra</h1>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
          
          <nav className="flex justify-start md:flex-col md:flex-1 gap-1 md:gap-2 px-2 md:px-0 min-w-max md:min-w-0">
            <NavButton id="overview" label="Overview" icon={<FiHome />} isActive={activeTab === "overview"} onClick={() => handleTabChange("overview")} />
            <NavButton id="analytics" label="Analytics" icon={<FiBarChart2 />} isActive={activeTab === "analytics"} onClick={() => handleTabChange("analytics")} />
            <NavButton id="inventory" label="Inventory" icon={<FiBox />} isActive={activeTab === "inventory"} onClick={() => handleTabChange("inventory")} />
            <NavButton id="storefront" label="Storefront" icon={<FiLayout />} isActive={activeTab === "storefront"} onClick={() => handleTabChange("storefront")} />
            <NavButton id="inquiries" label="Inquiries" icon={<FiMessageSquare />} isActive={activeTab === "inquiries"} onClick={() => handleTabChange("inquiries")} />
            <NavButton id="add" label={editingItem ? "Edit Item" : "Add Item"} icon={<FiPlusCircle />} isActive={activeTab === "add"} onClick={() => handleTabChange("add")} />
            <NavButton id="settings" label="Settings" icon={<FiSettings />} isActive={activeTab === "settings"} onClick={() => handleTabChange("settings")} />
            
            <button
              onClick={handleLogout}
              className="flex flex-col md:flex-row items-center shrink-0 md:shrink gap-1 md:gap-3 w-auto md:w-full text-center md:text-left p-3 md:px-4 md:py-3 rounded-2xl transition-all font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 md:mt-auto group ml-auto md:ml-0"
            >
              <span className="text-xl transition-transform group-hover:-translate-x-1"><FiLogOut /></span>
              <span className="hidden sm:block text-[10px] md:text-base font-bold uppercase md:capitalize tracking-wider md:tracking-normal">
                Logout
              </span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-4 md:p-8 lg:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === "overview" && <AdminOverview />}
              {activeTab === "analytics" && <AdminAnalytics />}
              {activeTab === "settings" && <AdminSettings />}
              
              {activeTab === "inventory" && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight px-1">Inventory Management</h2>
                    <p className="text-slate-500 mt-1 px-1">Search, update stock, and manage your product catalog.</p>
                  </div>
                  <InventoryTable onEdit={handleEdit} />
                </div>
              )}

              {activeTab === "add" && <AddProductForm initialData={editingItem} onSuccess={handleFormSuccess} />}

              {activeTab === "storefront" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
                   <FiLayout size={48} className="mx-auto text-slate-200 mb-4" />
                   <h3 className="text-xl font-bold">Storefront Designer</h3>
                   <p className="text-slate-500">Edit banners and home layout (Coming Soon).</p>
                </div>
              )}

              {activeTab === "inquiries" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
                   <FiMessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                   <h3 className="text-xl font-bold">Stock Inquiries</h3>
                   <p className="text-slate-500">View customer stock requests (Coming Soon).</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AdminAuth>
  );
}