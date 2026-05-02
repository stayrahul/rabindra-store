"use client";

import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { addToCart, removeCartItem, deleteFromCart, clearCart } from "@/lib/features/carts/cartsSlice";
import { ShoppingCart, X, Trash2, Plus, Minus, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CartBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { items, totalQuantities } = useAppSelector((state: RootState) => state.carts);
  const dispatch = useAppDispatch();
  
  // Track previous quantity to auto-open drawer
  const prevQty = useRef(totalQuantities);

  useEffect(() => {
    setMounted(true);
  }, []);

  // AUTO-OPEN SIDEBAR LOGIC
  useEffect(() => {
    if (totalQuantities > prevQty.current) {
      setIsOpen(true);
    }
    prevQty.current = totalQuantities;
  }, [totalQuantities]);

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const phoneNumber = "9779860117783"; 
    let message = `नमस्ते Rabindra Store, Simraungadh 🙏\n\n`;
    message += `I am interested in ordering the following bulk items:\n`;
    message += `--------------------------\n`;

    items.forEach((item, index) => {
      const isCustom = item.quantity === 0;
      message += `${index + 1}. *${item.name}* (${item.nepaliName})\n`;
      
      if (isCustom) {
        message += `   Requirement: *${item.unit}*\n\n`;
      } else {
        message += `   Qty: ${item.quantity} x ${item.unit}\n\n`;
      }
    });

    message += `--------------------------\n`;
    message += `🛒 *Order Status:* Wholesale Inquiry\n`;
    message += `💡 *Bulk Note:* Please confirm current market rates.\n`;
    message += `🚚 *Delivery:* (Free delivery over Rs. 20,000)\n\n`;
    message += `My Name: ________________\n`;
    message += `My Location: ____________`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  if (!mounted) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-3 bg-white hover:bg-slate-50 border border-slate-200 transition-all rounded-2xl flex items-center justify-center shadow-sm group active:scale-95"
      >
        <ShoppingCart size={22} className="text-slate-900 group-hover:text-indigo-600 transition-colors" />
        {totalQuantities > 0 && (
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white font-black rounded-lg h-6 min-w-[24px] px-1.5 flex items-center justify-center text-[11px] shadow-lg border-2 border-white">
            {totalQuantities}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-slate-50 shadow-2xl z-[100] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Order</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{totalQuantities} Units</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <ShoppingCart size={40} className="opacity-20 mb-4" />
                    <p className="font-bold">Your bulk cart is empty.</p>
                  </div>
                ) : (
                  items.map((item) => {
                    const isCustom = item.quantity === 0;
                    return (
                      <motion.div 
                        layout
                        key={item.id} 
                        className={cn(
                          "flex gap-4 p-4 rounded-[2rem] border relative",
                          isCustom ? "bg-indigo-50/50 border-indigo-100" : "bg-white border-slate-100 shadow-sm"
                        )}
                      >
                        <div className="w-20 h-20 relative bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50 p-2 shadow-inner">
                          <Image
                            src={item.srcUrl || "/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            sizes="80px"
                          />
                        </div>

                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-slate-900 text-sm md:text-base">{item.name}</h4>
                            {isCustom && <Sparkles size={14} className="text-indigo-500 animate-pulse" />}
                          </div>
                          <p className="text-[11px] text-slate-400 font-black uppercase mb-3">{item.nepaliName}</p>
                          
                          {isCustom ? (
                            <div className="bg-white px-3 py-2 rounded-xl border border-indigo-100">
                              <p className="text-xs font-bold text-indigo-600">Custom: {item.unit}</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                <button onClick={() => dispatch(removeCartItem({ id: item.id }))} className="p-1.5 bg-white shadow-sm rounded-lg">
                                  <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                                <button onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))} className="p-1.5 bg-white shadow-sm rounded-lg">
                                  <Plus size={12} strokeWidth={3} />
                                </button>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{item.unit}</span>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => dispatch(deleteFromCart({ id: item.id }))}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
                  <button 
                    onClick={handleWhatsAppCheckout}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95"
                  >
                    <MessageCircle size={24} fill="currentColor" />
                    Send to WhatsApp
                  </button>
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