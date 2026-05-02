"use client";

import React, { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  MessageCircle // Added for the Inquiry button
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
  
  // --- PRICING ENGINE ---
  const productData = product as any;
  const currentUnit = selectedUnit || (productData?.units?.[0]) || "Standard";

  const activeVariant = productData?.variants?.find((v: any) => v.unit === currentUnit) 
                     || productData?.varients?.find((v: any) => v.unit === currentUnit);

  // FORCE conversion to Number and handle 0 gracefully
  const basePrice = Number(activeVariant?.price) 
                 || Number(productData?.sellingPrice) 
                 || Number(productData?.price) 
                 || 0;

  const totalPrice = basePrice * quantity;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  useEffect(() => {
    if (product && product.units && product.units.length > 0) {
      setSelectedUnit(product.units[0]);
    }
  }, [product]);

  // WhatsApp Inquiry for 0-price items
  const handleInquiry = () => {
    const message = `नमस्ते Rabindra Store 🙏\nI want to know the current wholesale rate for: *${product?.nameEn}* (${currentUnit}).`;
    window.open(`https://wa.me/9779860117783?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCart({
        id: String(`${product.id}-${isCustomOrder ? "custom" : selectedUnit}-${Date.now()}`),
        name: product.nameEn,
        nepaliName: product.nameNp || "",
        srcUrl: product.imageUrl,
        imageUrl: product.imageUrl,
        unit: isCustomOrder ? customNote.trim() : selectedUnit,
        quantity: isCustomOrder ? 0 : quantity,
        price: basePrice,
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
    <div className="min-h-screen bg-slate-50 font-sans pb-32 md:pb-12 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Nav (Mobile) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between md:hidden">
        <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-900" />
        </Link>
        <span className="font-black text-slate-900 uppercase tracking-tight text-sm">Details</span>
        <div className="w-10"></div>
      </div>

      <div className="max-w-6xl mx-auto md:pt-12 md:px-6">
        <div className="flex flex-col lg:flex-row bg-white md:rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* LEFT: IMAGE SECTION */}
          <div className="relative w-full lg:w-1/2 bg-slate-50/50 flex items-center justify-center p-8 md:p-16">
            <div className="absolute top-8 left-8 hidden md:block">
               <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors group bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
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
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="p-6 md:p-12 lg:p-16 lg:w-1/2 flex flex-col">
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1.5 rounded-md">
                  {product.category}
                </span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-md",
                  product.inStock ? "text-emerald-600 bg-emerald-50" : "text-orange-600 bg-orange-50"
                )}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 leading-[1.1]">
                {product.nameEn}
              </h1>
              <p className="text-xl md:text-2xl font-bold text-slate-400 font-hindi mb-6">
                {product.nameNp}
              </p>

              {/* PRICING DISPLAY FIX */}
              <div className="flex items-end gap-3 pb-6 border-b border-slate-100">
                {isCustomOrder ? (
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-indigo-600 tracking-tight">Custom Quote</span>
                    <span className="text-sm font-bold text-slate-400">Calculated on WhatsApp</span>
                  </div>
                ) : basePrice > 0 ? (
                  <>
                    <div className="flex items-start">
                      <span className="text-lg font-bold text-slate-400 mt-1 mr-1">Rs.</span>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">{formatCurrency(basePrice)}</span>
                    </div>
                    <span className="text-base font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      / {selectedUnit}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col py-2">
                    <span className="text-3xl font-black text-indigo-600 italic animate-pulse">Ask for Rate</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Market rate fluctuates daily</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <Tag size={14} className="text-emerald-500" /> Live Wholesale Rate
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <Truck size={14} className="text-indigo-500" /> Local Delivery
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <ShieldCheck size={14} className="text-blue-500" /> Verified Quality
                </div>
              </div>
            </header>

            {/* UNIT SELECTION */}
            <div className={cn("mb-8 transition-all duration-500", isCustomOrder ? "opacity-30 grayscale pointer-events-none" : "opacity-100")}>
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
                1. Select Unit <span className="flex-1 h-px bg-slate-100 ml-2"></span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.units?.map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setSelectedUnit(unit)}
                    className={cn(
                      "px-6 py-3 rounded-2xl font-black text-sm transition-all border-2",
                      selectedUnit === unit ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM ORDER BOX */}
            <div className={cn(
              "mb-8 p-5 rounded-[2rem] transition-all duration-500 border-2",
              isCustomOrder ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200/50" : "bg-slate-50 border-slate-100"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className={isCustomOrder ? "text-indigo-200" : "text-indigo-400"} />
                <h3 className={cn("font-black text-[10px] uppercase tracking-[0.2em]", isCustomOrder ? "text-white" : "text-slate-900")}>
                  2. Custom Requirements (Optional)
                </h3>
              </div>
              <textarea
                placeholder="Want a different weight? Mixed varieties? Type here..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className={cn(
                  "w-full rounded-2xl p-4 text-sm font-bold outline-none transition-all resize-none h-24",
                  isCustomOrder ? "bg-white/10 text-white placeholder:text-indigo-200 border-transparent" : "bg-white text-slate-700 placeholder:text-slate-400 border-slate-200 focus:border-indigo-300"
                )}
              />
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
              {!isCustomOrder && basePrice > 0 && (
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1.5 shadow-inner">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3.5 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90"><Minus size={20} /></button>
                  <span className="w-14 text-center font-black text-xl text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3.5 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90"><Plus size={20} /></button>
                </div>
              )}
              
              <button
                onClick={basePrice > 0 || isCustomOrder ? handleAddToCart : handleInquiry}
                disabled={!product.inStock}
                className={cn(
                  "flex-1 flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all shadow-2xl relative group",
                  isAdded ? "bg-emerald-500 text-white shadow-emerald-200/50" : 
                  (basePrice > 0 || isCustomOrder ? "bg-slate-900 hover:bg-indigo-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"),
                  !product.inStock && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  {isAdded ? <Check size={24} strokeWidth={4} /> : 
                  (basePrice > 0 || isCustomOrder ? <ShoppingCart size={24} /> : <MessageCircle size={24} />)}
                  <span className="font-black text-lg">
                    {isAdded ? 'Added!' : (isCustomOrder ? 'Custom Request' : (basePrice > 0 ? 'Add to Cart' : 'Check Rate via WhatsApp'))}
                  </span>
                </div>
                
                {!isCustomOrder && !isAdded && basePrice > 0 && (
                  <div className="relative z-10 flex flex-col items-end text-right border-l border-white/20 pl-4">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total</span>
                    <span className="font-black text-lg leading-none">Rs. {formatCurrency(totalPrice)}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 pb-safe md:hidden shadow-[0_-20px_40px_rgba(0,0,0,0.08)]">
        {!isCustomOrder && basePrice > 0 && (
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
            <span className="text-xl font-black text-slate-900">Rs. {formatCurrency(totalPrice)}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isCustomOrder && basePrice > 0 && (
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-inner h-14">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100"><Minus size={18} /></button>
              <span className="w-10 text-center font-black text-lg text-slate-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100"><Plus size={18} /></button>
            </div>
          )}
          <button
            onClick={basePrice > 0 || isCustomOrder ? handleAddToCart : handleInquiry}
            disabled={!product.inStock}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-black text-base transition-all shadow-xl",
              isAdded ? "bg-emerald-500 text-white" : 
              (basePrice > 0 || isCustomOrder ? "bg-slate-900 text-white" : "bg-indigo-600 text-white"),
              !product.inStock && "opacity-50"
            )}
          >
            {isAdded ? <Check size={20} strokeWidth={4} /> : 
            (basePrice > 0 || isCustomOrder ? <ShoppingCart size={20} /> : <MessageCircle size={20} />)}
            {isAdded ? 'Added!' : (isCustomOrder ? 'Custom Request' : (basePrice > 0 ? 'Add to Cart' : 'Check Rate'))}
          </button>
        </div>
      </div>
    </div>
  );
}