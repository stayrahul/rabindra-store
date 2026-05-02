"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Plus, PhoneCall, Check } from "lucide-react";

import { addToCart } from "@/lib/features/carts/cartsSlice";
import { cn } from "@/lib/utils";

// 1. Strictly export and use the Product interface (No more 'any')
export interface Product {
  id: string;
  nameEn: string;
  nameNp?: string; // Made optional just in case it's missing in DB
  imageUrl: string;
  category: string;
  units?: string[]; // Made optional to prevent undefined mapping errors
  inStock: boolean;
}

const ProductCard = ({ data }: { data: Product }) => {
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultUnit = data.units?.[0] || "Standard";

    dispatch(
      addToCart({
        id: `${data.id}-${defaultUnit}`,
        name: data.nameEn,
        nepaliName: data.nameNp || "",
        srcUrl: data.imageUrl,
        imageUrl: data.imageUrl,
        unit: defaultUnit,
        quantity: 1,
      })
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] p-3 border border-slate-100 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1.5">
      
      {/* Premium Image Container with subtle gradient */}
      <Link 
        href={`/product/${data.id}`} 
        className="relative w-full aspect-square mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center isolate"
      >
        <Image
          src={data.imageUrl || "/placeholder.png"}
          fill
          className="object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          alt={data.nameEn}
          sizes="(max-width: 768px) 45vw, (max-width: 1200px) 25vw, 20vw"
        />
        
        {/* Glassmorphism Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3.5 py-1.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-full text-[10px] font-black tracking-widest text-indigo-900 uppercase shadow-sm">
            {data.category}
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 px-2 pb-1">
        <Link href={`/product/${data.id}`} className="block group/text mb-3">
          <h3 className="text-sm md:text-base font-black text-slate-900 leading-snug line-clamp-2 group-hover/text:text-indigo-600 transition-colors">
            {data.nameEn}
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1.5 line-clamp-1">
            {data.nameNp || "—"}
          </p>
        </Link>

        {/* High-End Catalog Detailing */}
        <div className="flex items-center justify-between mb-5 mt-auto bg-slate-50 rounded-xl p-2.5 border border-slate-100/50">
          <div className="flex flex-col">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bulk Unit</span>
             <span className="text-xs font-black text-slate-800">{data.units?.[0] || 'Standard'}</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col items-end text-right">
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Status</span>
             <span className={cn(
               "text-xs font-black",
               data.inStock ? "text-slate-800" : "text-orange-500"
             )}>
               {data.inStock ? "Wholesale" : "On Request"}
             </span>
          </div>
        </div>

        {/* Action Buttons with Framer Motion Micro-interactions */}
        <div className="w-full">
          {data.inStock ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black transition-colors shadow-sm",
                isAdded 
                  ? "bg-emerald-500 text-white shadow-emerald-200/50 hover:bg-emerald-600" 
                  : "bg-slate-900 text-white shadow-slate-900/20 hover:bg-indigo-600"
              )}
            >
              {isAdded ? (
                <>
                  <Check size={18} strokeWidth={3} className="animate-in zoom-in duration-300" />
                  <span className="text-xs uppercase tracking-wider">Added to Cart</span>
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={3} />
                  <span className="text-xs uppercase tracking-wider">Add to Cart</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.a
              whileTap={{ scale: 0.96 }}
              href="tel:+9779860117783"
              className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 py-3.5 rounded-xl font-black transition-colors shadow-sm"
            >
              <PhoneCall size={16} strokeWidth={2.5} />
              <span className="text-xs uppercase tracking-wider">Call for Stock</span>
            </motion.a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;