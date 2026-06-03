"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FiPlus, FiSearch, FiFilter, FiList, FiGrid, FiMoreVertical,
  FiEdit2, FiTrash2, FiCheck, FiX, FiRefreshCw, FiZap,
  FiPackage, FiActivity, FiAlertTriangle, FiEye, FiCheckCircle, FiLayers,
  FiDownload,
  FiArrowUp,
  FiArrowDown
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
// Ensure these imports match your actual file structure
import { supabase } from "@/utils/supabase";
import { Product, useInventory } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

// --- Utilities ---

// Prevents regex crashes when searching for special characters like '(' or '*'
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <span>{text}</span>;
  const safeQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${safeQuery})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-indigo-500 text-white rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// --- Types ---

interface InventoryItemProps {
  product: Product;
  searchQuery: string;
  isSelected: boolean;
  isToggling: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (p: Product) => void;
  onToggleStock: (p: Product) => void;
  onDelete: (p: Product) => void;
}

type SortOption = keyof Pick<Product, 'nameEn' | 'category' | 'updated_at'>;

// --- Main Component ---

export default function InventoryTable({ onEdit }: { onEdit: (p: Product) => void }) {
  const { products, updateProduct, deleteProduct, isLoading } = useInventory();

  // State
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [sortBy, setSortBy] = useState<SortOption>("nameEn");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Derived Data
  const availableCategories = useMemo(() => {
    const categories = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(categories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = inventorySearchQuery.toLowerCase().trim();
    let result = products.filter((p) => {
      const matchesSearch = query === "" ||
        p.nameEn.toLowerCase().includes(query) ||
        (p.nameNp && p.nameNp.toLowerCase().includes(query));
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesStock = stockFilter === "all" || (stockFilter === "in" ? p.inStock : !p.inStock);

      return matchesSearch && matchesCategory && matchesStock;
    });

    result.sort((a, b) => {
      const valA = a[sortBy] || "";
      const valB = b[sortBy] || "";
      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [products, inventorySearchQuery, selectedCategory, stockFilter, sortBy, sortOrder]);

  const inStockCount = products.filter(p => p.inStock).length;
  const outStockCount = products.length - inStockCount;

  // Handlers (Memoized to prevent child re-renders)
  const handleToggleStock = useCallback(async (product: Product) => {
    setTogglingIds(prev => [...prev, product.id]);
    try {
      await updateProduct(product.id, { inStock: !product.inStock });
    } catch (err) {
      console.error("Stock toggle failed:", err);
      alert("Failed to update stock status. Please try again.");
    } finally {
      setTogglingIds(prev => prev.filter(id => id !== product.id));
    }
  }, [updateProduct]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      setSelectedItems(prev => prev.filter(id => id !== deleteTarget.id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleBulkToggleStock = async () => {
    setIsBulkActionLoading(true);
    try {
      // Process in parallel, but handle individual failures gracefully
      await Promise.allSettled(selectedItems.map(async (id) => {
        const product = products.find(p => p.id === id);
        if (product) {
          await updateProduct(id, { ...product, inStock: !product.inStock });
        }
      }));
      setSelectedItems([]);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${selectedItems.length} items?`)) return;
    setIsBulkActionLoading(true);
    try {
      await Promise.allSettled(selectedItems.map(id => deleteProduct(id)));
      setSelectedItems([]);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredProducts.map(p => p.id));
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name (EN)", "Name (NP)", "Category", "Price", "Units", "In Stock"];
    const rows = filteredProducts.map(p => [
      p.nameEn,
      p.nameNp || "",
      p.category,
      p.selling_price || "Call",
      (p.units || []).join("; "),
      p.inStock ? "Yes" : "No"
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Render Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-32 bg-white border border-slate-200 rounded-[2.5rem] w-full"></div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 w-32 bg-slate-100 rounded-2xl shrink-0"></div>)}
        </div>
        <div className="h-96 bg-white rounded-[3rem] border border-slate-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-800 pb-32">

      {/* ── METRIC SNAPSHOT ── */}
      <div className="flex sm:grid overflow-x-auto sm:overflow-visible gap-4 sm:gap-6 pb-4 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid-cols-3">
        {[
          { label: "Total Assets", value: products.length, icon: FiLayers, color: "indigo", active: stockFilter === "all", onClick: () => setStockFilter("all") },
          { label: "In Stock", value: inStockCount, icon: FiCheckCircle, color: "emerald", active: stockFilter === "in", onClick: () => setStockFilter("in") },
          { label: "Out of Stock", value: outStockCount, icon: FiAlertTriangle, color: "rose", active: stockFilter === "out", onClick: () => setStockFilter("out") },
        ].map(stat => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className={cn(
              "p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border text-left transition-all relative overflow-hidden group shrink-0 w-[240px] sm:w-auto",
              stat.active ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-200 text-white" : "bg-white border-slate-100 hover:border-indigo-200 shadow-sm"
            )}
          >
            <div className={cn("absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 rounded-bl-[3rem] opacity-10 transition-transform group-hover:scale-110", stat.active ? "bg-white" : "bg-slate-900")} />
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border", stat.active ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100")}>
              <stat.icon size={18} className={stat.active ? "text-white" : `text-${stat.color}-600`} />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{stat.label}</p>
            <p className="text-3xl sm:text-4xl font-black tracking-tighter">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* ── COMMAND BAR ── */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-0 z-20 backdrop-blur-xl bg-white/90">
        <div className="flex-1 relative group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search items..."
            value={inventorySearchQuery}
            onChange={(e) => setInventorySearchQuery(e.target.value)}
            className="w-full pl-14 pr-14 py-4.5 bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-sm shadow-inner"
          />
          {inventorySearchQuery && (
            <button onClick={() => setInventorySearchQuery("")} className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200 rounded-lg transition-all">
              <FiX size={16} />
            </button>
          )}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as "all" | "in" | "out")}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 sm:flex-none flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={cn("flex-1 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <FiList className="inline-block sm:mr-2" /> <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn("flex-1 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <FiGrid className="inline-block sm:mr-2" /> <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          <button onClick={handleExportCSV} className="px-6 py-4.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center gap-3">
            <FiDownload size={16} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ── CATEGORY CLOUD ── */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
        {availableCategories.map((cat) => {
          const count = cat === "All" ? products.length : products.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 flex items-center gap-2",
                selectedCategory === cat ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-indigo-200"
              )}
            >
              {cat}
              <span className={cn("px-2 py-0.5 rounded-lg text-[9px]", selectedCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400")}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 border-dashed shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-300">
              <FiPackage size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Vortex Empty</h3>
            <p className="text-slate-400 font-bold mt-2">Try adjusting your spectral filters or search query.</p>
            <button
              onClick={() => { setInventorySearchQuery(""); setSelectedCategory("All"); setStockFilter("all"); }}
              className="mt-10 px-8 py-4 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              Reset All Filters
            </button>
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <InventoryCard
                key={product.id}
                product={product}
                searchQuery={inventorySearchQuery}
                isToggling={togglingIds.includes(product.id)}
                isSelected={selectedItems.includes(product.id)}
                onToggleSelect={handleToggleSelect}
                onEdit={onEdit}
                onToggleStock={handleToggleStock}
                onDelete={setDeleteTarget}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm">
                    <th className="px-8 py-8 w-12 text-center">
                      <button
                        onClick={handleSelectAll}
                        className={cn("w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all", selectedItems.length > 0 && selectedItems.length === filteredProducts.length ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 bg-white")}
                      >
                        {selectedItems.length === filteredProducts.length && selectedItems.length > 0 && <FiCheck size={14} />}
                      </button>
                    </th>
                    <th className="px-8 py-8 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortBy("nameEn"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                      Identity & Description {sortBy === "nameEn" && (sortOrder === "asc" ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />)}
                    </th>
                    <th className="px-8 py-8 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => { setSortBy("category"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                      Category {sortBy === "category" && (sortOrder === "asc" ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />)}
                    </th>
                    <th className="px-8 py-8">Price</th>
                    <th className="px-8 py-8 text-center">Lifecycle</th>
                    <th className="px-10 py-8 text-right">Operational Toolset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map((product) => (
                    <InventoryRow
                      key={product.id}
                      product={product}
                      searchQuery={inventorySearchQuery}
                      isToggling={togglingIds.includes(product.id)}
                      isSelected={selectedItems.includes(product.id)}
                      onToggleSelect={handleToggleSelect}
                      onEdit={onEdit}
                      onToggleStock={handleToggleStock}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BATCH COMMAND OVERLAY ── */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-10 py-6 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col sm:flex-row items-center gap-8 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center shadow-2xl">
                <FiZap size={20} className="text-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Batch Operations</span>
                <span className="text-lg sm:text-xl font-black tracking-tight">{selectedItems.length} Selected</span>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden lg:block" />

            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={handleBulkToggleStock}
                disabled={isBulkActionLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95 disabled:opacity-50"
              >
                {isBulkActionLoading ? <FiRefreshCw className="animate-spin" /> : <FiActivity />} <span className="hidden sm:inline">Toggle</span> Stock Status
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkActionLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20 active:scale-95 disabled:opacity-50"
              >
                <FiTrash2 /> Terminate
              </button>
              <button onClick={() => setSelectedItems([])} className="p-3.5 text-white/40 hover:text-white transition-colors bg-white/5 rounded-xl">
                <FiX size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TERMINATION MODAL ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }} className="relative bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-100 shadow-inner">
                <FiAlertTriangle className="text-rose-500 text-3xl" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Terminate Asset?</h3>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                This action will permanently remove <span className="text-slate-900 font-black">"{deleteTarget.nameEn}"</span> from the global infrastructure. This cannot be reversed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-8 py-5 bg-slate-50 border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95">Cancel Operation</button>
                <button onClick={confirmDelete} className="flex-1 px-8 py-5 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95">Confirm Deletion</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---

const InventoryRow: React.FC<InventoryItemProps> = React.memo(({
  product,
  searchQuery,
  isSelected,
  isToggling,
  onToggleSelect,
  onEdit,
  onToggleStock,
  onDelete
}) => {
  return (
    <tr className={cn(
      "hover:bg-slate-50 transition-all group",
      isSelected ? "bg-indigo-50/40" : ""
    )}>
      <td className="px-8 py-6 text-center">
        <button
          onClick={() => onToggleSelect(product.id)}
          className={cn(
            "w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all",
            isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "border-slate-200 bg-white"
          )}
        >
          {isSelected && <FiCheck size={14} />}
        </button>
      </td>
      <td className="px-8 py-6 min-w-[300px]">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden bg-white border border-slate-100 p-2 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
            {product.imageUrl ? (<Image src={product.imageUrl} alt={product.nameEn} fill sizes="80px" className="object-contain" />) : (<div className="w-full h-full flex items-center justify-center text-slate-200"><FiPackage size={32} /></div>)}
          </div>
          {/* Product Info */}
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-black text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors flex items-center gap-2">
              <Highlight text={product.nameEn} query={searchQuery} />
              {product.inStock && (!product.units || product.units.length === 0) && (
                 <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-[8px] font-black uppercase text-rose-600 tracking-widest animate-pulse">Low Data</span>
              )}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1 truncate uppercase tracking-widest font-hindi">
              <Highlight text={product.nameNp || ""} query={searchQuery} />
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {product.units?.slice(0, 2).map((u) => (
                <span key={u} className="text-[8px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">{u}</span>
              ))}
              {product.units && product.units.length > 2 && <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">+{product.units.length - 2}</span>}
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-[10px] rounded-xl uppercase tracking-widest shadow-sm">
          {product.category}
        </span>
      </td>
      <td className="px-8 py-6">
        <span className="font-black text-slate-900 text-sm">
          {product.selling_price ? `Rs. ${product.selling_price}` : "Call"}
        </span>
      </td>
      <td className="px-8 py-6 text-center">
        <button
          onClick={() => onToggleStock(product)}
          disabled={isToggling}
          className={cn(
            "inline-flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
            product.inStock ? 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white' : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white',
            isToggling && "opacity-50 cursor-wait"
          )}
        >
          {isToggling ? (
            <FiRefreshCw className="animate-spin" />
          ) : (
            <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          )}
          {isToggling ? 'Updating...' : (product.inStock ? 'In Stock' : 'Out of Stock')}
        </button>
      </td>
      <td className="px-10 py-6 text-right">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button onClick={() => onEdit(product)} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-600 hover:shadow-xl transition-all active:scale-90 flex items-center justify-center" aria-label="Edit"><FiEdit2 size={20} /></button>
          <button onClick={() => onDelete(product)} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-600 hover:border-rose-600 hover:shadow-xl transition-all active:scale-90 flex items-center justify-center" aria-label="Delete"><FiTrash2 size={20} /></button>
        </div>
      </td>
    </tr>
  );
});
InventoryRow.displayName = "InventoryRow";

const InventoryCard: React.FC<InventoryItemProps> = React.memo(({
  product,
  searchQuery,
  isSelected,
  isToggling,
  onToggleSelect,
  onEdit,
  onToggleStock,
  onDelete
}) => {
  return (
    <motion.div
      className={cn(
        "bg-white p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer",
        isSelected ? "border-indigo-500 shadow-lg shadow-indigo-100/20 ring-1 ring-indigo-500" : "border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200"
      )}
      onClick={() => onToggleSelect(product.id)}
    >
      <div className={cn("absolute top-0 left-0 w-full h-1", product.inStock ? 'bg-emerald-500' : 'bg-rose-500')} />

      <div className="flex justify-between items-start mb-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-2 transition-transform duration-700 group-hover:scale-110">
          {product.imageUrl ? (<Image src={product.imageUrl} alt={product.nameEn} fill sizes="64px" className="object-contain" />) : (<div className="w-full h-full flex items-center justify-center text-slate-200"><FiPackage size={24} /></div>)}
        </div>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border transition-all", isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-300")}>
          {isSelected ? <FiCheck size={14} /> : <FiZap size={14} />}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] uppercase tracking-widest font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{product.category}</span>
            <span className={cn("w-1.5 h-1.5 rounded-full", product.inStock ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
          </div>
          <p className="text-xs font-black text-slate-900">{product.selling_price ? `Rs. ${product.selling_price}` : "Call"}</p>
        </div>
        <h3 className="font-black text-slate-900 text-lg tracking-tight leading-tight truncate group-hover:text-indigo-600 transition-colors">
          <Highlight text={product.nameEn} query={searchQuery} />
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
          <Highlight text={product.nameNp || ""} query={searchQuery} />
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 h-10 overflow-hidden">
        {product.units?.map((unit, i) => (
          <span key={i} className="text-[8px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg uppercase tracking-tight">
            {unit}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-50" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onToggleStock(product)}
          disabled={isToggling}
          className={cn(
            "flex-1 h-10 rounded-xl text-[8px] font-black flex items-center justify-center gap-2 transition-all border uppercase tracking-widest",
            product.inStock ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-600 hover:text-white',
            isToggling && "opacity-50 cursor-wait"
          )}
        >
          {isToggling ? <FiRefreshCw className="animate-spin" /> : (product.inStock ? 'In Stock' : 'Out of Stock')}
        </button>
        <button onClick={() => onEdit(product)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 rounded-xl transition-all flex items-center justify-center"><FiEdit2 size={16} /></button>
        <button onClick={() => onDelete(product)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-600 rounded-xl transition-all flex items-center justify-center"><FiTrash2 size={16} /></button>
      </div>
    </motion.div>
  );
});
InventoryCard.displayName = "InventoryCard";