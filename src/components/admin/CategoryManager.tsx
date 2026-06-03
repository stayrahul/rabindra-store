"use client";

import { useState, useRef, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiCheck, FiX, FiInfo, FiAlertTriangle, FiDatabase, FiRefreshCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/context/InventoryContext";

export default function CategoryManager() {
  const { categories, addCategory, deleteCategory, products } = useInventory();
  
  // States
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Clear errors when typing
  useEffect(() => { if (error) setError(null); }, [newCat]);
  useEffect(() => { if (editError) setEditError(null); }, [editValue]);

  // Count products per category
  const getCategoryCount = (cat: string) => {
    return products.filter(p => p.category === cat).length;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCat.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError("This category already exists.");
      return;
    }

    addCategory(trimmed);
    setNewCat("");
    setError(null);
    setSuccessMsg(`"${trimmed}" added successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent, oldName: string) => {
    e.preventDefault();
    const trimmed = editValue.trim();
    
    if (!trimmed || trimmed === oldName) {
      setEditingId(null);
      return;
    }

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setEditError("Category name already taken.");
      return;
    }

    deleteCategory(oldName);
    addCategory(trimmed);
    setEditingId(null);
    setEditError(null);
  };

  const confirmDelete = (name: string) => {
    deleteCategory(name);
    setCategoryToDelete(null);
  };

  return (
    <div className="max-w-4xl space-y-8 font-sans text-slate-800 pb-12">
      
      {/* Header & Info Section */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
                <FiDatabase size={22} />
              </div>
              Categories
            </h2>
            <p className="text-slate-500 font-bold text-sm mt-2">Manage product classifications. Changes sync to Supabase automatically.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-xl border border-slate-200">
            <FiTag className="text-indigo-600" />
            <p className="text-sm font-black text-slate-900">
              {categories.length} <span className="text-slate-500 font-bold text-xs">Total</span>
            </p>
          </div>
        </div>

        {/* Add New Category Form */}
        <div className="mt-8 relative">
          <form 
            onSubmit={handleAdd}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input 
              type="text" 
              value={newCat} 
              onChange={(e) => setNewCat(e.target.value)} 
              placeholder="Enter new category name..." 
              className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900 placeholder:text-slate-400 transition-all"
            />
            <button 
              type="submit"
              disabled={!newCat.trim()}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm active:scale-95"
            >
              <FiPlus className="stroke-[3px]" /> Add Category
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 text-sm font-bold text-rose-600 flex items-center gap-2"
              >
                <FiAlertTriangle size={14} /> {error}
              </motion.p>
            )}
            {successMsg && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 text-sm font-bold text-emerald-600 flex items-center gap-2"
              >
                <FiCheck size={14} /> {successMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Active Categories
          </h3>
          <div className="relative w-full max-w-[240px]">
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
            <FiRefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {categories
              .filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((cat) => {
              const count = getCategoryCount(cat);
              return (
                <motion.div 
                  layout
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                >
                  
                  <div className="flex items-center justify-between min-h-[40px]">
                    {editingId === cat ? (
                      <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="w-full">
                        <form 
                          onSubmit={(e) => handleSaveEdit(e, cat)}
                          className="flex flex-1 items-center gap-2"
                        >
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Escape' && setEditingId(null)}
                            className={`flex-1 px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none font-bold text-slate-900 transition-all ${editError ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                            autoFocus
                          />
                          <button 
                            type="submit" 
                            aria-label="Save changes"
                            className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                          >
                            <FiCheck />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setEditingId(null)} 
                            aria-label="Cancel editing"
                            className="p-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          >
                            <FiX />
                          </button>
                        </form>
                        {editError && <p className="text-xs text-rose-600 font-bold mt-2">{editError}</p>}
                      </motion.div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                            <FiTag size={16} />
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-base">{cat}</span>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                              {count} {count === 1 ? 'product' : 'products'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { 
                              setEditingId(cat); 
                              setEditValue(cat); 
                              setEditError(null); 
                            }} 
                            aria-label={`Edit ${cat}`}
                            className="p-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all focus:outline-none"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setCategoryToDelete(cat)} 
                            aria-label={`Delete ${cat}`}
                            className="p-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all focus:outline-none"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Inline Delete Confirmation Overlay */}
                  <AnimatePresence>
                    {categoryToDelete === cat && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-white rounded-2xl flex items-center justify-center p-4 text-center border-2 border-rose-200 shadow-lg"
                      >
                        <div className="space-y-4">
                          <p className="text-sm font-black text-rose-600 flex items-center justify-center gap-2">
                            <FiAlertTriangle className="text-rose-500" /> Delete "{cat}"?
                          </p>
                          {count > 0 && (
                            <p className="text-xs text-slate-500 font-medium">
                              Warning: {count} products use this category.
                            </p>
                          )}
                          <div className="flex gap-3 justify-center">
                            <button 
                              onClick={() => confirmDelete(cat)} 
                              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-black transition-all focus:outline-none shadow-md shadow-rose-200 active:scale-95"
                              autoFocus
                            >
                              Delete
                            </button>
                            <button 
                              onClick={() => setCategoryToDelete(null)} 
                              className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-sm font-bold transition-all focus:outline-none"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {categories.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
            <FiDatabase className="mx-auto text-4xl text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-sm">No categories defined yet. Add one above.</p>
          </div>
        )}
      </div>

    </div>
  );
}