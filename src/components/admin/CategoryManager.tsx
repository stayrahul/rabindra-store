"use client";

import { useState, useRef, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiCheck, FiX, FiInfo, FiAlertTriangle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/context/InventoryContext";

export default function CategoryManager() {
  const { categories, addCategory, deleteCategory } = useInventory();
  
  // States
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Clear errors when typing
  useEffect(() => { if (error) setError(null); }, [newCat]);
  useEffect(() => { if (editError) setEditError(null); }, [editValue]);

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
    <div className="max-w-4xl space-y-8 selection:bg-indigo-100">
      
      {/* Header & Info Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FiTag />
              </div>
              Store Taxonomy
            </h2>
            <p className="text-slate-500 font-medium ml-1">Organize your inventory with high-level classifications.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
            <FiInfo className="text-slate-400" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Total: {categories.length} Categories
            </p>
          </div>
        </div>

        {/* Add New Category Form */}
        <div className="mt-10 relative">
          <form 
            onSubmit={handleAdd}
            className="flex flex-col sm:flex-row gap-3 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            <input 
              type="text" 
              value={newCat} 
              onChange={(e) => setNewCat(e.target.value)} 
              placeholder="Enter new category name..." 
              className="flex-1 px-6 py-4 rounded-[1.5rem] bg-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
            />
            <button 
              type="submit"
              disabled={!newCat.trim()}
              className="px-8 py-4 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none active:scale-95"
            >
              <FiPlus className="stroke-[3px]" /> Create
            </button>
          </form>
          {error && (
            <p className="absolute -bottom-6 left-6 text-sm font-bold text-rose-500">{error}</p>
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Current Registry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {categories.map((cat) => (
              <motion.div 
                layout
                key={cat}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300"
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
                          className={`flex-1 px-4 py-2.5 rounded-xl border-2 bg-indigo-50/30 focus:outline-none font-bold text-slate-800 transition-colors ${editError ? 'border-rose-300 focus:border-rose-500' : 'border-indigo-200 focus:border-indigo-500'}`}
                          autoFocus
                        />
                        <button 
                          type="submit" 
                          aria-label="Save changes"
                          className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-colors"
                        >
                          <FiCheck />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingId(null)} 
                          aria-label="Cancel editing"
                          className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                          <FiX />
                        </button>
                      </form>
                      {editError && <p className="text-xs text-rose-500 font-bold mt-1 absolute">{editError}</p>}
                    </motion.div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                          <FiTag size={18} />
                        </div>
                        <div>
                          <span className="font-black text-slate-800 text-lg">{cat}</span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Standard Department</p>
                        </div>
                      </div>

                      {/* We use focus-within here so keyboard tabbing keeps the actions visible */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { 
                            setEditingId(cat); 
                            setEditValue(cat); 
                            setEditError(null); 
                          }} 
                          aria-label={`Edit ${cat}`}
                          className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setCategoryToDelete(cat)} 
                          aria-label={`Delete ${cat}`}
                          className="p-3 bg-slate-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <FiTrash2 size={16} />
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
                      className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-[2rem] flex items-center justify-center p-4 text-center border-2 border-rose-100"
                    >
                      <div className="space-y-3">
                        <p className="text-sm font-black text-slate-800 flex items-center justify-center gap-2">
                          <FiAlertTriangle className="text-rose-500" /> Remove Category?
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => confirmDelete(cat)} 
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-100 active:scale-95 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                            autoFocus
                          >
                            Yes, Delete
                          </button>
                          <button 
                            onClick={() => setCategoryToDelete(null)} 
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black active:scale-95 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {categories.length === 0 && (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <FiTag className="mx-auto text-5xl text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">No categories defined yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}