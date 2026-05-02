"use client";

import React, { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/carts/cartsSlice";
// Change your current import to this:
import { 
  Plus, 
  Minus, 
  PhoneCall, 
  ShoppingCart, 
  ChevronRight, 
  ChevronLeft, // <-- Add this
  Check, 
  Sparkles, 
  ArrowLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventory } from "@/context/InventoryContext";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products, isLoading } = useInventory();
  
  const product = products.find((p) => p.id === id);
  const dispatch = useDispatch();

  // --- STATE ---
  const [selectedUnit, setSelectedUnit] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [customNote, setCustomNote] = useState("");

  const isCustomOrder = customNote.trim().length > 0;

  useEffect(() => {
    if (product && product.units && product.units.length > 0) {
      setSelectedUnit(product.units[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCart({
        // 1. Generate a unique ID so custom orders don't merge incorrectly
        id: String(`${product.id}-${isCustomOrder ? "custom" : selectedUnit}-${Date.now()}`),
        name: product.nameEn,
        nepaliName: product.nameNp || "",
        srcUrl: product.imageUrl,
        imageUrl: product.imageUrl,
        
        // 2. Logic: If custom, the unit is the user's text. 
        unit: isCustomOrder ? customNote.trim() : selectedUnit,
        
        // 3. Logic: If custom, we use 0 as a flag for the WhatsApp generator
        quantity: isCustomOrder ? 0 : quantity,
        
        note: customNote.trim() || undefined,
      })
    );
    
    setIsAdded(true);
    setCustomNote(""); 
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Loading Mart...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product vanished!</h2>
      <Link href="/" className="mt-4 text-indigo-600 font-bold underline">Return to Shop</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 md:pb-12">
      {/* Top Nav (Mobile) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between md:hidden">
        <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-900" />
        </Link>
        <span className="font-black text-slate-900 uppercase tracking-tight text-sm">Details</span>
        <div className="w-10"></div>
      </div>

      <div className="max-w-6xl mx-auto md:pt-12 md:px-6">
        <div className="flex flex-col lg:flex-row bg-white md:rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          
          {/* LEFT: IMAGE SECTION */}
          <div className="relative w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-8 md:p-16">
            <div className="absolute top-8 left-8 hidden md:block">
               <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
               </Link>
            </div>
            <div className="relative w-full aspect-square max-w-[400px] drop-shadow-2xl hover:scale-105 transition-transform duration-500">
              <Image 
                src={product.imageUrl || "/placeholder.png"} 
                alt={product.nameEn} 
                fill 
                className="object-contain" 
                priority 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {isCustomOrder && (
              <div className="absolute top-6 right-6 bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                Custom Mode
              </div>
            )}
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="p-6 md:p-12 lg:p-16 lg:w-1/2 flex flex-col">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-md">
                  {product.category}
                </span>
                {product.inStock ? (
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-md">
                    In Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] bg-orange-50 px-3 py-1 rounded-md">
                    Out of Stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 leading-[1.1]">
                {product.nameEn}
              </h1>
              <p className="text-xl md:text-2xl font-bold text-slate-400 font-hindi">
                {product.nameNp}
              </p>
            </header>

            {/* CUSTOM ORDER BOX */}
            <div className={cn(
              "mb-8 p-5 rounded-[2rem] transition-all duration-500 border-2",
              isCustomOrder ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100" : "bg-slate-50 border-slate-100"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className={isCustomOrder ? "text-indigo-200" : "text-indigo-500"} />
                <h3 className={cn("font-black text-[10px] uppercase tracking-[0.2em]", isCustomOrder ? "text-white" : "text-slate-900")}>
                  Custom Requirements
                </h3>
              </div>
              <textarea
                placeholder="Want 7kg? Or mixed varieties? Type exactly what you need here..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className={cn(
                  "w-full rounded-2xl p-4 text-sm font-bold outline-none transition-all resize-none h-24 shadow-inner",
                  isCustomOrder ? "bg-white/10 text-white placeholder:text-indigo-200 border-transparent focus:bg-white/20" : "bg-white text-slate-700 placeholder:text-slate-400 border-slate-200"
                )}
              />
              {isCustomOrder && (
                <p className="text-[10px] text-indigo-100 mt-2 font-black uppercase tracking-widest ml-1">
                  Quantity and Units disabled for custom order.
                </p>
              )}
            </div>

            {/* UNIT SELECTION */}
            <div className={cn("mb-10 transition-all duration-500", isCustomOrder ? "opacity-20 scale-95 pointer-events-none" : "opacity-100")}>
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-4 ml-1">Select Wholesale Unit</h3>
              <div className="flex flex-wrap gap-3">
                {product.units?.map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setSelectedUnit(unit)}
                    className={cn(
                      "px-6 py-4 rounded-2xl font-black text-sm transition-all border-2",
                      selectedUnit === unit ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-4 mt-auto pt-6 border-t border-slate-50">
              {!isCustomOrder && (
                <div className="flex items-center bg-slate-100 rounded-2xl p-1 shadow-inner">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-90"><Minus size={20} /></button>
                  <span className="w-12 text-center font-black text-xl text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-90"><Plus size={20} /></button>
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-lg transition-all active:scale-[0.95] shadow-2xl",
                  isAdded ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-200",
                  !product.inStock && "opacity-50 cursor-not-allowed"
                )}
              >
                {isAdded ? <><Check size={24} strokeWidth={4} /> Added!</> : <><ShoppingCart size={24} /> {isCustomOrder ? 'Add Custom Request' : 'Add to Cart'}</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 md:hidden flex items-center gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {!isCustomOrder && (
           <div className="flex items-center bg-slate-100 rounded-2xl p-1 shadow-inner">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 bg-white rounded-xl shadow-sm"><Minus size={18} /></button>
            <span className="w-10 text-center font-black text-lg text-slate-900">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="p-3 bg-white rounded-xl shadow-sm"><Plus size={18} /></button>
          </div>
        )}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all active:scale-[0.95] shadow-xl",
            isAdded ? "bg-emerald-500 text-white" : "bg-slate-900 text-white",
            !product.inStock && "opacity-50"
          )}
        >
          {isAdded ? <Check size={20} strokeWidth={4} /> : <ShoppingCart size={20} />}
          {isAdded ? 'Added!' : (isCustomOrder ? 'Add Custom' : 'Add to Cart')}
        </button>
      </div>
    </div>
  );
}