"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  MessageCircle,
  Share2,
  ArrowRight,
  AlertTriangle,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventory } from "@/context/InventoryContext";
import { motion } from "framer-motion";
import Rating from "@/components/ui/Rating";

export default function ProductDetailsClient({ id }: { id: string }) {
  const { products, isLoading, settings } = useInventory();
  const product = products.find((p) => p.id === id);
  const dispatch = useDispatch();

  // --- STATE ---
  const [selectedUnit, setSelectedUnit] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [customNote, setCustomNote] = useState("");

  const isCustomOrder = customNote.trim().length > 0;
  const isClosed = settings?.holidayMode || (settings && !settings.allowOnlineOrders);

  // Check if admin is logged in (using simple localStorage flag for now)
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const adminStatus = localStorage.getItem("is_admin") === "true";
    setIsAdmin(adminStatus);
  }, []);

  // Related products from same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id && p.inStock)
      .slice(0, 4);
  }, [products, product]);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: product?.nameEn, text: `Check out ${product?.nameEn} at ${settings?.storeName || "Rabindra Store"}`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  // --- PRICING ENGINE ---
  const productData = product as any;
  const currentUnit = selectedUnit || (productData?.units?.[0]) || "Standard";

  const activeVariant = productData?.variants?.find((v: any) => v.unit === currentUnit)
    || productData?.varients?.find((v: any) => v.unit === currentUnit);

  const basePrice = Number(activeVariant?.price)
    || Number(productData?.selling_price)
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

  // WhatsApp Inquiry
  const handleInquiry = () => {
    const phoneNumber = settings?.whatsappNumber || "9779860117783";
    const message = isClosed
      ? `नमस्ते ${settings?.storeName || "Rabindra Store"} 🙏\nI want to order: *${product?.nameEn}* (${currentUnit}). Are you open?`
      : `नमस्ते ${settings?.storeName || "Rabindra Store"} 🙏\nI want to know the current wholesale rate for: *${product?.nameEn}* (${currentUnit}).`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToCart = () => {
    if (!product || isClosed) return;

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
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Loading Details...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
        <ShoppingCart size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product not found!</h2>
      <p className="text-slate-500 font-medium mt-2">The item might have been removed from our inventory.</p>
      <Link href="/" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20">
        Return to Catalog
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 md:pb-24 selection:bg-indigo-100 selection:text-indigo-900">

      {/* TOP NAV (MOBILE) */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between md:hidden">
        <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-900" />
        </Link>
        <span className="font-black text-slate-900 uppercase tracking-tight text-xs">Product Details</span>
        <button onClick={handleShare} className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors">
          <Share2 size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto md:pt-12 md:px-6">
        <div className="flex flex-col lg:flex-row bg-white md:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* LEFT: IMAGE SECTION */}
          <div className="relative w-full lg:w-1/2 bg-slate-50/50 flex items-center justify-center p-8 md:p-16">
            <div className="absolute top-10 left-10 hidden md:block">
              <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] transition-all group bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md uppercase tracking-widest">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
              </Link>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative w-full aspect-square max-w-[450px] drop-shadow-2xl hover:scale-[1.03] transition-all duration-700 ease-out group"
            >
              <Image
                src={product.imageUrl || "/placeholder.png"}
                alt={product.nameEn}
                fill
                className="object-contain group-hover:drop-shadow-[0_30px_60px_rgba(79,70,229,0.3)] group-hover:-translate-y-4 transition-all duration-700 ease-out z-10"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Premium Image Glow Effect */}
              <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full scale-75 group-hover:scale-110 opacity-40 group-hover:opacity-100 transition-all duration-700 -z-10" />
              <div className="absolute inset-10 bg-emerald-500/10 blur-[60px] rounded-full scale-50 group-hover:scale-100 opacity-0 group-hover:opacity-80 transition-all duration-1000 -z-10" />
            </motion.div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="p-6 md:p-12 lg:p-20 lg:w-1/2 flex flex-col">
            <header className="mb-8">
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3.5 py-2 rounded-lg border border-indigo-100">
                    {product.category}
                  </span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-2 rounded-lg border",
                    product.inStock ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"
                  )}>
                    {product.inStock ? "In Stock" : "Restocking Soon"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link
                      href={`/admin?tab=inventory&edit=${product.id}`}
                      className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                      title="Edit Product"
                    >
                      <Edit2 size={20} />
                    </Link>
                  )}
                  <button
                    onClick={handleShare}
                    className="hidden md:flex p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group"
                    title="Share Product"
                  >
                    <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight mb-3 leading-none">
                {product.nameEn}
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-slate-400 font-hindi mb-4">
                {product.nameNp}
              </p>

              {/* RATING SNIPPET */}
              <div className="flex items-center gap-2 mb-8">
                <Rating initialValue={4.5} size={20} readonly allowFraction fillColor="#4f46e5" />
                <span className="text-sm font-bold text-slate-500">(128 Reviews)</span>
              </div>

              {/* PRICING DISPLAY (UPGRADED) */}
              <div className="flex items-end gap-3 pb-8 mb-6 border-b border-slate-100 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-50/50 via-emerald-50/30 to-transparent -z-10 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
                {isCustomOrder ? (
                  <div className="flex flex-col bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-xl shadow-slate-900/20">
                    <span className="text-3xl font-black tracking-tight flex items-center gap-2"><Sparkles className="text-indigo-400" size={24}/> Custom Request</span>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Rates confirmed on WhatsApp</span>
                  </div>
                ) : basePrice > 0 ? (
                  <div className="flex flex-col group cursor-default">
                    <div className="flex items-start">
                      <span className="text-2xl font-black text-slate-400 mt-2 mr-2 group-hover:text-indigo-400 transition-colors">Rs.</span>
                      <span className="text-7xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{formatCurrency(basePrice)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Per {selectedUnit}</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">Wholesale Rate</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col py-4 px-8 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                    <span className="text-3xl font-black text-indigo-600 flex items-center gap-2"><MessageCircle size={24} /> Live Rate Inquiry</span>
                    <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mt-1">Check current market price with agent</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 bg-white shadow-sm px-5 py-3 rounded-2xl border border-slate-100/50 uppercase tracking-[0.2em] group">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag size={14} className="text-emerald-500" /> 
                  </div>
                  Live Market Rates
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 bg-white shadow-sm px-5 py-3 rounded-2xl border border-slate-100/50 uppercase tracking-[0.2em] group">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck size={14} className="text-indigo-500" /> 
                  </div>
                  Direct Hub Delivery
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 bg-white shadow-sm px-5 py-3 rounded-2xl border border-slate-100/50 uppercase tracking-[0.2em] group">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck size={14} className="text-amber-500" /> 
                  </div>
                  Verified Quality
                </div>
              </div>
            </header>

            {/* UNIT SELECTION */}
            {!isClosed && (
              <div className={cn("mb-10 transition-all duration-500", isCustomOrder ? "opacity-30 grayscale pointer-events-none" : "opacity-100")}>
                <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-5 flex items-center gap-3">
                  Wholesale Unit <span className="flex-1 h-px bg-slate-100"></span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.units?.map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setSelectedUnit(unit)}
                      className={cn(
                        "px-8 py-4 rounded-[1.25rem] font-black text-sm transition-all border-2 relative overflow-hidden group",
                        selectedUnit === unit
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]"
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                      )}
                    >
                      {selectedUnit === unit && (
                        <motion.div layoutId="unitGlow" className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 -z-10" />
                      )}
                      <span className="relative z-10">{unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOM ORDER BOX */}
            {!isClosed && (
              <div className={cn(
                "mb-10 p-6 rounded-[2.5rem] transition-all duration-500 border-2",
                isCustomOrder ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20" : "bg-slate-50 border-slate-100"
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className={isCustomOrder ? "text-indigo-400" : "text-indigo-500"} />
                  <h3 className={cn("font-black text-[10px] uppercase tracking-[0.2em]", isCustomOrder ? "text-white" : "text-slate-900")}>
                    Specific Requirements
                  </h3>
                </div>
                <textarea
                  placeholder="Need a custom weight or bulk variant? Type here..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl p-5 text-sm font-bold outline-none transition-all resize-none h-24",
                    isCustomOrder ? "bg-white/10 text-white placeholder:text-slate-500 border-transparent" : "bg-white text-slate-700 placeholder:text-slate-400 border-slate-200 focus:border-indigo-300"
                  )}
                />
              </div>
            )}

            {/* CLOSED MESSAGE */}
            {isClosed && (
              <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
                <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-black text-rose-900 text-sm">Online Ordering Unavailable</p>
                  <p className="text-xs font-bold text-rose-700 mt-1 leading-relaxed">
                    We are currently not accepting orders through the website. Please contact us directly for urgent requirements.
                  </p>
                </div>
              </div>
            )}

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-4 mt-auto pt-8 border-t border-slate-100">
              {!isCustomOrder && !isClosed && basePrice > 0 && (
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-[1.5rem] p-2 shadow-inner">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all hover:bg-rose-50 hover:text-rose-600"><Minus size={20} /></button>
                  <span className="w-16 text-center font-black text-2xl text-slate-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all hover:bg-emerald-50 hover:text-emerald-600"><Plus size={20} /></button>
                </div>
              )}

              <button
                onClick={isClosed ? handleInquiry : (basePrice > 0 || isCustomOrder ? handleAddToCart : handleInquiry)}
                disabled={!product.inStock}
                className={cn(
                  "flex-1 flex items-center justify-between px-8 py-5 rounded-[1.75rem] transition-all shadow-2xl relative group overflow-hidden",
                  isAdded ? "bg-emerald-500 text-white shadow-emerald-200/50" :
                    (isClosed ? "bg-slate-900 hover:bg-indigo-600 text-white" : (basePrice > 0 || isCustomOrder ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white")),
                  !product.inStock && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  {isAdded ? <Check size={26} strokeWidth={4} /> :
                    (isClosed ? <MessageCircle size={26} /> : (basePrice > 0 || isCustomOrder ? <ShoppingCart size={26} /> : <MessageCircle size={26} />))}
                  <span className="font-black text-xl tracking-tight">
                    {isAdded ? 'Added to Cart' : (isClosed ? 'Contact Store' : (isCustomOrder ? 'Request Custom' : (basePrice > 0 ? 'Add to Cart' : 'Check Live Rate')))}
                  </span>
                </div>

                {!isCustomOrder && !isAdded && basePrice > 0 && !isClosed && (
                  <div className="relative z-10 flex flex-col items-end text-right border-l border-white/20 pl-6">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">EST. TOTAL</span>
                    <span className="font-black text-xl leading-none">Rs. {formatCurrency(totalPrice)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-[1.75rem] z-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION & RELATED SECTION */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-16 space-y-16">
        {product.description && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full" /> Product Specifications
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{(product as any).description}</p>
            </div>
          </motion.div>
        )}

        {/* REVIEWS SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-600 rounded-full" /> Customer Reviews
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-5xl font-black text-slate-900">4.8</span>
                <div>
                  <Rating initialValue={4.8} size={24} readonly allowFraction fillColor="#4f46e5" />
                  <p className="text-sm font-bold text-slate-500 mt-1">Based on 128 verified ratings</p>
                </div>
              </div>
            </div>
            <button className="hidden md:block px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Review Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">A</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Amit S.</h4>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Buyer
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">2 days ago</span>
              </div>
              <Rating initialValue={5} size={16} readonly fillColor="#4f46e5" />
              <h5 className="font-black text-slate-900 mt-3 mb-2">Excellent Quality and Fast Delivery</h5>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                We order this in bulk every month. The quality is always consistent, and the delivery to our store is incredibly fast. Highly recommended!
              </p>
            </div>

            {/* Review Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">R</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Rahul Enterprises</h4>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Buyer
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">1 week ago</span>
              </div>
              <Rating initialValue={4.5} size={16} readonly allowFraction fillColor="#4f46e5" />
              <h5 className="font-black text-slate-900 mt-3 mb-2">Best Wholesale Rates in Simraungadh</h5>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Switched to Rabindra Store recently. Their transparent pricing and direct hub delivery have saved us a lot of logistics hassle.
              </p>
            </div>
          </div>
          <button className="md:hidden mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-transform">
            Write a Review
          </button>
        </motion.div>

        {relatedProducts.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-end justify-between mb-8 px-2">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">You May Also Need</h2>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">Complementary Wholesale Items</p>
              </div>
              <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hidden sm:flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                View Full Category <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map(rp => {
                const rpData = rp as any;
                const rpUnit = rp.units?.[0] || "Standard";
                const rpVariants = rpData?.variants || rpData?.varients || [];
                const rpVariant = rpVariants.find((v: any) => v.unit === rpUnit);
                const rpPrice = Number(rpVariant?.price) || Number(rpData?.selling_price) || 0;
                return (
                  <Link key={rp.id} href={`/product/${rp.id}`} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-3">
                    <div className="relative aspect-square bg-slate-50/50 overflow-hidden">
                      <Image src={rp.imageUrl || "/placeholder.png"} alt={rp.nameEn} fill className="object-contain p-6 group-hover:scale-110 transition-transform duration-700" sizes="25vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-7">
                      <h3 className="font-black text-slate-900 text-base md:text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">{rp.nameEn}</h3>
                      <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{rpUnit}</p>
                      <div className="flex items-center justify-between mt-6">
                        <p className="text-base font-black text-indigo-600">
                          {rpPrice > 0 ? `Rs. ${rpPrice.toLocaleString('en-IN')}` : "On Request"}
                        </p>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-5 pb-safe md:hidden shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        {!isCustomOrder && basePrice > 0 && !isClosed && (
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Total</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Rs. {formatCurrency(totalPrice)}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isCustomOrder && basePrice > 0 && !isClosed && (
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-inner h-16">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center active:scale-90"><Minus size={18} strokeWidth={3} /></button>
              <span className="w-12 text-center font-black text-xl text-slate-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center active:scale-90"><Plus size={18} strokeWidth={3} /></button>
            </div>
          )}
          <button
            onClick={isClosed ? handleInquiry : (basePrice > 0 || isCustomOrder ? handleAddToCart : handleInquiry)}
            disabled={!product.inStock}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 h-16 rounded-2xl font-black text-lg transition-all shadow-xl",
              isAdded ? "bg-emerald-500 text-white" :
                (isClosed ? "bg-slate-900 text-white" : (basePrice > 0 || isCustomOrder ? "bg-indigo-600 text-white" : "bg-slate-900 text-white")),
              !product.inStock && "opacity-50"
            )}
          >
            {isAdded ? <Check size={24} strokeWidth={4} /> :
              (isClosed ? <MessageCircle size={24} /> : (basePrice > 0 || isCustomOrder ? <ShoppingCart size={24} /> : <MessageCircle size={24} />))}
            {isAdded ? 'Added!' : (isClosed ? 'Contact Store' : (isCustomOrder ? 'Custom Order' : (basePrice > 0 ? 'Add to Cart' : 'Check Rate')))}
          </button>
        </div>
      </div>
    </div>
  );
}
