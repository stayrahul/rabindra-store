"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Plus, PhoneCall, Check, MessageCircle } from "lucide-react"; // Added MessageCircle

import { addToCart } from "@/lib/features/carts/cartsSlice";
import { cn } from "@/lib/utils";

// Interface strictly matched to your Supabase schema
export interface Product {
  id: string;
  nameEn: string;
  nameNp?: string;
  imageUrl: string;
  category: string;
  units?: string[];
  inStock: boolean;
  sellingPrice?: number;
  variants?: any[];
  varients?: any[]; 
}

const ProductCard = ({ data }: { data: Product }) => {
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);

  // --- PRICING ENGINE ---
  const productData = data as any;
  const defaultUnit = data.units?.[0] || "Standard";
  const variantsArray = productData?.variants || productData?.varients || [];
  const activeVariant = variantsArray.find((v: any) => v.unit === defaultUnit);

  // Force Number conversion to handle string-based JSON data
  const displayPrice = Number(activeVariant?.price) || 
                       Number(productData?.sellingPrice) || 
                       Number(productData?.price) || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCart({
        id: `${data.id}-${defaultUnit}-${Date.now()}`,
        name: data.nameEn,
        nepaliName: data.nameNp || "",
        srcUrl: data.imageUrl,
        imageUrl: data.imageUrl,
        unit: defaultUnit,
        quantity: 1,
        price: displayPrice, 
      })
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Helper for WhatsApp Inquiry
  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = `नमस्ते Rabindra Store 🙏\nI want to know the current wholesale rate for: *${data.nameEn}* (${defaultUnit}).`;
    window.open(`https://wa.me/9779860117783?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] p-3 border border-slate-100 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1.5">
      
      {/* Premium Image Container */}
      <Link 
        href={`/product/${data.id}`} 
        className="relative w-full aspect-square mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center isolate"
      >
        <Image
          src={data.imageUrl}
          alt={data.nameEn}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3.5 py-1.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-full text-[10px] font-black tracking-widest text-indigo-900 uppercase shadow-sm">
            {data.category}
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="flex flex-col flex-1 px-2 pb-1">
        <Link href={`/product/${data.id}`} className="block group/text mb-3">
          <h3 className="text-sm md:text-base font-black text-slate-900 leading-snug line-clamp-2 group-hover/text:text-indigo-600 transition-colors">
            {data.nameEn}
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1.5 line-clamp-1 font-hindi">
            {data.nameNp || "—"}
          </p>
        </Link>

        {/* PRICING & UNIT BAR - UPDATED */}
        <div className="flex items-center justify-between mb-5 mt-auto bg-slate-50 rounded-xl p-2.5 border border-slate-100/50">
          <div className="flex flex-col">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Market Rate</span>
             <span className={cn(
               "text-xs font-black",
               displayPrice > 0 ? "text-slate-900" : "text-indigo-600 italic flex items-center gap-1"
             )}>
               {displayPrice > 0 ? (
                 `Rs. ${displayPrice.toLocaleString('en-IN')}`
               ) : (
                 <>Ask for Rate</>
               )}
             </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <div className="flex flex-col items-end text-right">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bulk Unit</span>
             <span className="text-xs font-black text-slate-800">{defaultUnit}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full">
          {!data.inStock ? (
             <motion.a
                whileTap={{ scale: 0.96 }}
                href="tel:+9779860117783"
                className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 py-3.5 rounded-xl font-black transition-colors shadow-sm"
             >
                <PhoneCall size={16} strokeWidth={2.5} />
                <span className="text-xs uppercase tracking-wider">Call for Stock</span>
             </motion.a>
          ) : displayPrice > 0 ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black transition-all shadow-sm",
                isAdded 
                  ? "bg-emerald-500 text-white shadow-emerald-200/50" 
                  : "bg-slate-900 text-white shadow-slate-900/20 hover:bg-indigo-600"
              )}
            >
              {isAdded ? (
                <>
                  <Check size={18} strokeWidth={3} className="animate-in zoom-in duration-300" />
                  <span className="text-xs uppercase tracking-wider">Added!</span>
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={3} />
                  <span className="text-xs uppercase tracking-wider">Quick Add</span>
                </>
              )}
            </motion.button>
          ) : (
            /* NEW: WhatsApp Inquiry button for 0-price items */
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleInquiry}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-black transition-all hover:bg-indigo-50 shadow-sm shadow-indigo-100"
            >
              <MessageCircle size={18} strokeWidth={3} />
              <span className="text-xs uppercase tracking-wider">Inquire Price</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;