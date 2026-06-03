"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, X, Trash2, Plus, Minus, 
  MessageCircle, Sparkles, ReceiptText, 
  PackageCheck, Info, AlertTriangle
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { addToCart, removeCartItem, deleteFromCart } from "@/lib/features/carts/cartsSlice";
import { cn } from "@/lib/utils";
import { FiZap } from "react-icons/fi";
import { useInventory } from "@/context/InventoryContext";
import InvoiceGenerator from "@/components/common/InvoiceGenerator";

const CartBtn = ({ isMobileNav = false }: { isMobileNav?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const { items, totalQuantities } = useAppSelector((state: RootState) => state.carts);
  const { settings } = useInventory();
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
    const phoneNumber = settings?.whatsappNumber || "9779860117783";
    let message = `नमस्ते ${settings?.storeName || "Rabindra Store"} 🙏\n\n*Premium Wholesale Order*\n`;
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

  const isClosed = settings?.holidayMode || !settings?.allowOnlineOrders;

  if (!mounted) return null;

  return (
    <>
      {/* TRIGGER BUTTON */}
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative transition-all shadow-sm hover:shadow-md group active:scale-95 flex items-center justify-center",
          isMobileNav 
            ? "w-14 h-14 bg-indigo-600 rounded-full border-[4px] border-white text-white shadow-xl hover:bg-indigo-500 shadow-indigo-600/30 -translate-y-2" 
            : "p-3 bg-white border border-slate-200/50 rounded-2xl hover:bg-white hover:border-indigo-100"
        )}
      >
        <ShoppingCart size={22} className={cn("transition-colors", isMobileNav ? "text-white" : "text-slate-700 group-hover:text-indigo-600")} />
        {totalQuantities > 0 && (
          <motion.span 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className={cn(
              "absolute -top-2.5 -right-2.5 bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white font-black rounded-xl h-[26px] min-w-[26px] px-1.5 flex items-center justify-center text-xs shadow-lg border-2 border-white",
              isMobileNav && "border-white top-0 right-0"
            )}
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
              className="fixed inset-0 bg-slate-900/50 z-[90]"
            />

            {/* SIDEBAR DRAWER */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-[100dvh] w-full max-w-[440px] bg-[#F8FAFC] z-[100] flex flex-col shadow-2xl border-l border-white"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200/60 z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-2">
                    <Sparkles size={12} className="text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Premium Order</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Your Cart</h2>
                  <p className="text-xs font-bold text-slate-400 mt-2">{totalQuantities} Items Selected</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all shadow-sm active:scale-95">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* PROGRESS BAR FOR FREE DELIVERY / WHOLESALE BONUS */}
              {items.length > 0 && (
                <div className="px-6 pt-4 pb-2 bg-[#F8FAFC]">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500">Free Delivery Goal</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      {subtotal >= 5000 ? "Unlocked!" : `Rs. ${5000 - subtotal} away`}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        subtotal >= 5000 ? "bg-emerald-500" : "bg-indigo-500"
                      )}
                    />
                  </div>
                  {subtotal >= 5000 && (
                    <p className="text-[10px] font-black text-emerald-500 mt-2 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={12} /> You qualify for free local delivery
                    </p>
                  )}
                </div>
              )}

              {/* ITEMS LIST */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full -z-10" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />

                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-5">
                    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center rotate-3">
                       <ShoppingCart size={40} className="text-slate-300" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-slate-800 text-lg">Cart is empty</p>
                      <p className="text-sm font-medium text-slate-400 mt-1">Looks like you haven't added anything yet.</p>
                    </div>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div 
                      layout key={item.id} 
                      className={cn(
                        "flex gap-4 p-4 rounded-[2rem] border relative transition-all bg-white shadow-sm hover:shadow-md border-white",
                        item.quantity === 0 && "bg-indigo-50/50 border-indigo-100"
                      )}
                    >
                      <div className="w-20 h-20 relative bg-slate-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-slate-100 p-2 group">
                        <Image
                          src={item.imageUrl || "/placeholder.png"}
                          alt={item.name}
                          fill
                          className="object-contain group-hover:scale-110 transition-transform duration-500"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 pr-8">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900 text-sm md:text-base leading-tight line-clamp-1">{item.name}</h4>
                          {item.quantity === 0 && <Sparkles size={14} className="text-indigo-500 animate-pulse shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-3 line-clamp-1">{item.nepaliName}</p>

                        {/* WHOLESALE HINT */}
                        {item.quantity > 0 && item.quantity < 5 && (
                          <div className="mb-3 flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                            <FiZap size={10} /> ADD {5 - item.quantity} MORE FOR WHOLESALE BONUS
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {item.quantity === 0 ? (
                            <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase shadow-sm">
                              Custom: {item.unit}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-[14px] border border-slate-200/60">
                              <button onClick={() => dispatch(removeCartItem({ id: item.id }))} className="p-1.5 bg-white shadow-sm rounded-[10px] hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="font-black text-sm w-8 text-center text-slate-800">{item.quantity}</span>
                              <button onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))} className="p-1.5 bg-white shadow-sm rounded-[10px] hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          )}
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.unit}</p>
                             {item.price > 0 && <p className="text-sm font-black text-indigo-600">Rs. {item.price}</p>}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => dispatch(deleteFromCart({ id: item.id }))} 
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* CHECKOUT SECTION */}
              {items.length > 0 && (
                <div className="p-6 bg-white border-t border-slate-200/60 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-10">
                  {/* Totals Summary */}
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Estimated Total</span>
                      <span className="font-black text-slate-900 text-3xl leading-none">Rs. {subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {isClosed ? (
                      <div className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
                        <AlertTriangle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                        <p className="text-xs font-semibold text-rose-700 leading-relaxed">
                          We are currently not accepting online orders. Please call us directly.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                        <Info size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                          Final rates are confirmed on WhatsApp based on real-time market value.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={handleWhatsAppCheckout}
                      disabled={isClosed}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-3 py-4 md:py-5 rounded-[1.5rem] font-black text-lg shadow-xl transition-all active:scale-95 group overflow-hidden relative",
                        isClosed ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/20 hover:shadow-indigo-600/30"
                      )}
                    >
                      {!isClosed && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
                      <span className="relative flex items-center gap-3">
                        <MessageCircle size={22} fill={isClosed ? "currentColor" : "white"} className={cn(!isClosed && "group-hover:rotate-12 transition-transform")} />
                        {isClosed ? "Disabled" : "WhatsApp"}
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => setShowInvoice(true)}
                      className="p-4 md:p-5 bg-white border-2 border-slate-200 rounded-[1.5rem] text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 font-black text-sm"
                      title="Generate Pro-forma Invoice"
                    >
                      <ReceiptText size={22} />
                      <span className="hidden sm:inline">Invoice</span>
                    </button>
                  </div>
                  
                  <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <PackageCheck size={12} className="text-emerald-500" /> Free Local Delivery
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInvoice && (
          <InvoiceGenerator 
            items={items.map(item => ({
              name: item.name,
              unit: item.unit,
              quantity: item.quantity || 1,
              price: item.price
            }))}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CartBtn;