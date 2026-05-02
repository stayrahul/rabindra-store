"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, X, Trash2, Plus, Minus, 
  MessageCircle, Sparkles, ReceiptText, 
  PackageCheck, Info
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { addToCart, removeCartItem, deleteFromCart } from "@/lib/features/carts/cartsSlice";
import { cn } from "@/lib/utils";

const CartBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const { items, totalQuantities } = useAppSelector((state: RootState) => state.carts);
  const prevQty = useRef(totalQuantities);

  useEffect(() => { setMounted(true); }, []);

  // Calculate Subtotal for standard items
  const subtotal = items.reduce((acc, item) => {
    return acc + (Number(item.price || 0) * (item.quantity || 0));
  }, 0);

  // Auto-open logic when items are added
  useEffect(() => {
    if (totalQuantities > prevQty.current) setIsOpen(true);
    prevQty.current = totalQuantities;
  }, [totalQuantities]);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "9779860117783";
    let message = `नमस्ते Rabindra Store 🙏\n\n*Wholesale Order Inquiry*\n`;
    message += `━━━━━━━━━━━━━━━━━━\n`;

    items.forEach((item, i) => {
      const isCustom = item.quantity === 0;
      message += `${i + 1}. *${item.name}*\n`;
      message += isCustom 
        ? `   Detail: ${item.unit}\n` 
        : `   Qty: ${item.quantity} × ${item.unit} (Rate: Rs. ${item.price})\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *Est. Total:* Rs. ${subtotal.toLocaleString('en-IN')}\n`;
    message += `🚚 *Location:* Simraungadh\n\n*Name:* ____________\n*Contact:* __________`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!mounted) return null;

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group active:scale-90"
      >
        <ShoppingCart size={22} className="text-slate-900 group-hover:text-indigo-600 transition-colors" />
        {totalQuantities > 0 && (
          <motion.span 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-indigo-600 text-white font-black rounded-lg h-6 min-w-[24px] px-1.5 flex items-center justify-center text-[11px] shadow-lg border-2 border-white"
          >
            {totalQuantities}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90]"
            />

            {/* SIDEBAR DRAWER */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-slate-50 z-[100] flex flex-col shadow-2xl"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Order</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{totalQuantities} Units Selected</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* ITEMS LIST */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                       <ShoppingCart size={40} className="opacity-20" />
                    </div>
                    <p className="font-bold text-slate-400 tracking-wide uppercase text-xs">Your cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div 
                      layout key={item.id} 
                      className={cn(
                        "flex gap-4 p-4 rounded-[2rem] border relative transition-all",
                        item.quantity === 0 ? "bg-indigo-50 border-indigo-100" : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                      )}
                    >
                      <div className="w-20 h-20 relative bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 p-2">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>

                      <div className="flex-1 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900 text-sm md:text-base line-clamp-1">{item.name}</h4>
                          {item.quantity === 0 && <Sparkles size={14} className="text-indigo-500 animate-pulse" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-3 font-hindi">{item.nepaliName}</p>

                        <div className="flex items-center justify-between">
                          {item.quantity === 0 ? (
                            <div className="bg-white/50 px-3 py-1.5 rounded-lg border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase">
                              Custom: {item.unit}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button onClick={() => dispatch(removeCartItem({ id: item.id }))} className="p-1.5 bg-white shadow-sm rounded-lg hover:bg-red-50 transition-colors">
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              <span className="font-black text-sm w-8 text-center">{item.quantity}</span>
                              <button onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))} className="p-1.5 bg-white shadow-sm rounded-lg hover:bg-emerald-50 transition-colors">
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>
                          )}
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</p>
                             {item.price > 0 && <p className="text-xs font-black text-slate-900">Rs. {item.price}</p>}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => dispatch(deleteFromCart({ id: item.id }))} 
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* CHECKOUT SECTION */}
              {items.length > 0 && (
                <div className="p-6 bg-white border-t border-slate-100 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                  {/* Totals Summary */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Estimated Subtotal</span>
                      <span className="font-black text-slate-900 text-lg">Rs. {subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <Info size={14} className="text-emerald-600" />
                      <p className="text-[10px] font-bold text-emerald-700 leading-tight">
                        Final wholesale rates will be confirmed by Rabindra Store based on today's market value.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleWhatsAppCheckout}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 group"
                  >
                    <MessageCircle size={24} fill="white" className="group-hover:rotate-12 transition-transform" />
                    Place Wholesale Order
                  </button>
                  <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Free Delivery in Simraungadh
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartBtn;