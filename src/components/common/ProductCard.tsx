"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Plus, PhoneCall, Check, MessageCircle, ShoppingCart, Share2, Eye } from "lucide-react";

import { addToCart } from "@/lib/features/carts/cartsSlice";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  nameEn: string;
  nameNp?: string;
  imageUrl: string;
  category: string;
  units?: string[];
  inStock: boolean;
  selling_price?: number;
  variants?: any[];
}

const ProductCard = ({ data }: { data: Product }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  const productData = data as any;
  const defaultUnit = data.units?.[0] || "Standard";
  const variantsArray = productData?.variants || productData?.varients || [];
  const activeVariant = variantsArray.find((v: any) => v.unit === defaultUnit);

  const displayPrice = Number(activeVariant?.price) ||
    Number(productData?.selling_price) ||
    Number(productData?.price) || 0;

  const variantCount = variantsArray.length;

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

  const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = `नमस्ते Rabindra Store 🙏\nI want to know the current wholesale rate for: *${data.nameEn}* (${defaultUnit}).`;
    window.open(`https://wa.me/9779860117783?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${data.id}`;
    if (navigator.share) {
      navigator.share({ title: data.nameEn, text: `Check out ${data.nameEn} at Rabindra Store`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">

      {/* Stock Indicator Line */}
      <div className={`absolute top-0 left-0 w-full h-1 z-20 ${data.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      {/* Image */}
      <div
        onClick={() => router.push(`/product/${data.id}`)}
        className="relative w-full aspect-square mb-5 overflow-hidden rounded-[2rem] bg-slate-100/50 flex items-center justify-center isolate cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Image
          src={data.imageUrl || "/placeholder.png"}
          alt={data.nameEn}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3.5 py-2 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl text-[9px] font-black tracking-widest text-slate-800 uppercase shadow-lg">
            {data.category}
          </span>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={handleShare} className="w-9 h-9 bg-white/90 border border-white rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white shadow-lg transition-all active:scale-90">
            <Share2 size={14} />
          </button>
          <Link href={`/product/${data.id}`} className="w-9 h-9 bg-white/90 border border-white rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white shadow-lg transition-all active:scale-90">
            <Eye size={14} />
          </Link>
        </div>

        {/* Out of Stock Overlay */}
        {!data.inStock && (
          <div className="absolute inset-0 bg-white/60 z-15 flex items-center justify-center">
            <span className="px-4 py-2 bg-rose-500 text-white text-xs font-black rounded-full uppercase tracking-widest shadow-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 px-2 pb-1 bg-transparent">
        <Link href={`/product/${data.id}`} className="block group/text mb-4">
          <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-1 group-hover/text:text-indigo-600 transition-colors tracking-tight">
            {data.nameEn}
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-1 font-hindi opacity-80 uppercase tracking-wide">
            {data.nameNp || "—"}
          </p>
        </Link>

        {/* Pricing & Unit Bar */}
        <div className="flex items-center justify-between mb-5 mt-auto bg-slate-50/50 rounded-2xl p-3 md:p-4 border border-slate-100/80 transition-colors group-hover:bg-indigo-50/30 group-hover:border-indigo-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wholesale</span>
            <span className={cn(
              "text-sm font-black",
              displayPrice > 0 ? "text-indigo-600" : "text-amber-600 italic flex items-center gap-1"
            )}>
              {displayPrice > 0 ? (
                `Rs. ${displayPrice.toLocaleString('en-IN')}`
              ) : (
                <>On Request</>
              )}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200/80"></div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit</span>
            <span className="text-sm font-black text-slate-700">{defaultUnit}</span>
          </div>
        </div>

        {/* Variant Count Badge */}
        {variantCount > 1 && (
          <div className="mb-4 text-center">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {variantCount} sizes available
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full mt-auto">
          {!data.inStock ? (
            <motion.a
              whileTap={{ scale: 0.96 }}
              href="tel:+9779860117783"
              className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 py-3.5 rounded-xl font-black transition-colors shadow-sm text-sm relative overflow-hidden group/btn"
            >
              <PhoneCall size={18} strokeWidth={2.5} />
              <span className="relative z-10">Call for Stock</span>
            </motion.a>
          ) : displayPrice > 0 ? (
            <button
              onClick={handleAddToCart}
              className={cn(
                "w-full font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 text-sm relative overflow-hidden group/btn",
                isAdded
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-900 hover:bg-indigo-600 text-white shadow-lg shadow-slate-900/20 hover:shadow-indigo-600/30"
              )}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                {isAdded ? (
                  <><Check size={18} strokeWidth={3} className="animate-in zoom-in duration-300" /> Added to Cart</>
                ) : (
                  <><ShoppingCart size={18} /> Quick Add</>
                )}
              </span>
            </button>
          ) : (
            <button
              onClick={handleInquiry}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-black transition-all hover:bg-indigo-50 shadow-sm shadow-indigo-100 active:scale-95 text-sm"
            >
              <MessageCircle size={18} strokeWidth={3} />
              <span>Inquire Price</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;