"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingCart, FiCheck, FiHeart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";

interface QuickViewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = product ? wishlistItems.some(item => item.id === product.id) : false;

  const [addedItem, setAddedItem] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!product) return null;

  const defaultUnit = product.units?.[0] || "Standard";
  const variantsArray = product?.variants || product?.varients || [];
  const activeVariant = variantsArray.find((v: any) => v.unit === defaultUnit);
  const displayPrice = Number(activeVariant?.price) || Number(product?.selling_price) || 0;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: `${product.id}-${defaultUnit}`,
        name: product.nameEn,
        nepaliName: product.nameNp || "",
        srcUrl: product.imageUrl,
        imageUrl: product.imageUrl,
        unit: defaultUnit,
        quantity: 1,
        price: displayPrice,
      })
    );
    setAddedItem(true);
    setTimeout(() => setAddedItem(false), 2000);
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist({
      id: product.id,
      name: product.nameEn,
      price: displayPrice,
      imageUrl: product.imageUrl || "/placeholder.png",
      unit: defaultUnit
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-slate-100 backdrop-blur-md rounded-full text-slate-500 transition-colors"
            >
              <FiX size={20} />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 relative bg-slate-50 min-h-[300px] md:min-h-[500px]">
              <Image
                src={product.imageUrl || "/placeholder.png"}
                alt={product.nameEn}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-[10px] font-black text-slate-800 uppercase tracking-widest rounded-full shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                  {product.nameEn}
                </h2>
                {product.nameNp && (
                  <p className="text-sm font-bold text-slate-400 font-hindi opacity-80 uppercase tracking-widest mb-6">
                    {product.nameNp}
                  </p>
                )}

                <div className="flex items-end gap-4 mb-8 pb-8 border-b border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Wholesale Price</span>
                    <span className="text-4xl font-black text-indigo-600">
                      {displayPrice > 0 ? `Rs. ${displayPrice.toLocaleString('en-IN')}` : "On Request"}
                    </span>
                  </div>
                  <div className="flex flex-col mb-1.5">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Unit</span>
                    <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{defaultUnit}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Description</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {product.description || "Premium wholesale item available in bulk quantities. Perfect for retail stores and large-scale operations. Contact for custom bulk pricing."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-6 bg-white">
                <button
                  onClick={handleWishlist}
                  className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all",
                    isWishlisted 
                      ? "border-rose-500 text-rose-500 bg-rose-50" 
                      : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  )}
                >
                  <FiHeart size={24} className={cn(isWishlisted && "fill-current")} />
                </button>
                <button
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 font-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg active:scale-95 shadow-xl",
                    addedItem
                      ? "bg-emerald-500 text-white shadow-emerald-500/30"
                      : "bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/20 hover:shadow-indigo-600/30"
                  )}
                >
                  {addedItem ? (
                    <><FiCheck size={22} strokeWidth={3} /> Added to Cart</>
                  ) : (
                    <><FiShoppingCart size={22} /> Add to Order</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
