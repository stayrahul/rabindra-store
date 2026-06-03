"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPercent, FiTrendingUp, FiTrendingDown, FiShield, FiAlertCircle,
  FiCheck, FiX, FiRefreshCw, FiZap, FiLoader
} from "react-icons/fi";
import { useInventory } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

interface BulkRateEditorProps {
  onClose: () => void;
}

export default function BulkRateEditor({ onClose }: BulkRateEditorProps) {
  const { products, updateProduct } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [adjustmentType, setAdjustmentType] = useState<"percentage" | "fixed">("percentage");
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [value, setValue] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // State for tracking what will change
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

  const categories = ["all", ...new Set(products.map(p => p.category))];

  useEffect(() => {
    const targetProducts = selectedCategory === "all" 
      ? products 
      : products.filter(p => p.category === selectedCategory);

    const changes = targetProducts.map(product => {
      const updatedVariants = product.variants.map(variant => {
        const currentPrice = parseFloat(variant.price) || 0;
        let newPrice = currentPrice;
        const val = parseFloat(value) || 0;

        if (adjustmentType === "percentage") {
          const factor = val / 100;
          newPrice = direction === "up" 
            ? currentPrice * (1 + factor) 
            : currentPrice * (1 - factor);
        } else {
          newPrice = direction === "up" 
            ? currentPrice + val 
            : currentPrice - val;
        }

        return {
          ...variant,
          oldPrice: currentPrice,
          newPrice: Math.max(0, parseFloat(newPrice.toFixed(2)))
        };
      });

      return {
        id: product.id,
        nameEn: product.nameEn,
        variants: updatedVariants
      };
    });

    setPendingChanges(changes);
  }, [selectedCategory, adjustmentType, direction, value, products]);

  const handleApplyChanges = async () => {
    setIsProcessing(true);
    try {
      for (const change of pendingChanges) {
        const product = products.find(p => p.id === change.id);
        if (product) {
          const cleanVariants = change.variants.map((v: any) => ({
            unit: v.unit,
            price: v.newPrice.toString(),
            showPrice: v.showPrice
          }));
          await updateProduct(change.id, { ...product, variants: cleanVariants });
        }
      }
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Bulk update failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
    >
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiZap className="text-amber-500" />
            Global Rate Orchestrator
          </h2>
          <p className="text-slate-400 font-bold text-sm mt-1">Algorithmic mass pricing adjustment engine</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-colors text-slate-400">
          <FiX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Sector</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "all" ? "Whole Catalog" : cat}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Adjustment Logic</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button 
                    onClick={() => setAdjustmentType("percentage")}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                      adjustmentType === "percentage" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Percentage
                  </button>
                  <button 
                    onClick={() => setAdjustmentType("fixed")}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                      adjustmentType === "fixed" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Fixed Value
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vector</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button 
                    onClick={() => setDirection("up")}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2",
                      direction === "up" ? "bg-emerald-500 shadow-sm text-white" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <FiTrendingUp /> Increase
                  </button>
                  <button 
                    onClick={() => setDirection("down")}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2",
                      direction === "down" ? "bg-rose-500 shadow-sm text-white" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <FiTrendingDown /> Decrease
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Magnitude</label>
              <div className="relative">
                <input 
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={adjustmentType === "percentage" ? "Enter %" : "Enter Rs."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none focus:border-indigo-500 transition-all text-xl"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">
                  {adjustmentType === "percentage" ? "%" : "Rs."}
                </span>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Impact Analysis</h3>
              <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/30">
                Live Simulation
              </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {pendingChanges.slice(0, 10).map((change) => (
                <div key={change.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-[10px] font-bold text-slate-400 mb-2 truncate">{change.nameEn}</div>
                  <div className="space-y-2">
                    {change.variants.map((v: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{v.unit}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 line-through">Rs.{v.oldPrice}</span>
                          <FiTrendingUp className={cn("text-emerald-500", direction === "down" && "rotate-90 text-rose-500")} />
                          <span className="font-black text-white">Rs.{v.newPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {pendingChanges.length > 10 && (
                <div className="text-center text-[10px] text-slate-500 font-bold py-2">
                  + {pendingChanges.length - 10} more assets...
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Assets Impacted</span>
                <span className="text-2xl font-black">{pendingChanges.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
          <FiAlertCircle className="text-amber-500 shrink-0 mt-1" size={20} />
          <div className="text-xs font-bold text-amber-800 leading-relaxed">
            This action will modify multiple pricing records across the selected category. Ensure the simulation preview matches your operational requirements before committing to the database.
          </div>
        </div>
      </div>

      <div className="p-8 bg-slate-50 flex gap-4">
        <button 
          onClick={onClose}
          className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
        >
          Abort Mission
        </button>
        <button 
          onClick={handleApplyChanges}
          disabled={isProcessing || !value}
          className={cn(
            "flex-[2] px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3",
            success ? "bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500",
            (isProcessing || !value) && "opacity-50 cursor-not-allowed grayscale"
          )}
        >
          {isProcessing ? (
            <><FiLoader className="animate-spin" /> Synchronizing...</>
          ) : success ? (
            <><FiCheck /> Applied Successfully</>
          ) : (
            <><FiZap /> Execute Bulk Update</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
