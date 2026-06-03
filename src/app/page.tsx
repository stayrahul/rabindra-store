"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart, FiSearch, FiCheck, FiArrowRight, FiPackage, FiFilter, FiX, FiHeart, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import { useInventory, Product } from "@/context/InventoryContext";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { toggleWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { RootState } from "@/lib/store";
import QuickViewModal from "@/components/product/QuickViewModal";
import { cn } from "@/lib/utils";

import Header from "@/components/homepage/Header";
import SplashScreen from "@/components/common/SplashScreen";
import HeroCarousel from "@/components/homepage/HeroCarousel";

export default function HomePage() {
  const { products, isLoading, settings } = useInventory();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items || []);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const availableProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => product.inStock);
  }, [products]);

  const activeCategories = useMemo(() => {
    if (availableProducts.length === 0) return ["All"];
    const cats = new Set(availableProducts.map(p => p.category).filter(Boolean));
    const uniqueCats = Array.from(cats).filter(c => c.toLowerCase() !== "all");
    return ["All", ...uniqueCats];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    let result = availableProducts.filter(p => {
      const matchesSearch = query === "" ||
        p.nameEn.toLowerCase().includes(query) ||
        (p.nameNp && p.nameNp.includes(query));

      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => {
        const aPrice = Number(a.variants?.[0]?.price) || Number((a as any).selling_price) || 0;
        const bPrice = Number(b.variants?.[0]?.price) || Number((b as any).selling_price) || 0;
        return aPrice - bPrice;
      });
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => {
        const aPrice = Number(a.variants?.[0]?.price) || Number((a as any).selling_price) || 0;
        const bPrice = Number(b.variants?.[0]?.price) || Number((b as any).selling_price) || 0;
        return bPrice - aPrice;
      });
    }

    return result;
  }, [availableProducts, search, selectedCategory, sortBy]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const productData = product as any;
    const defaultUnit = product.units?.[0] || "Standard";

    const variantsArray = productData?.variants || productData?.varients || [];
    const activeVariant = variantsArray.find((v: any) => v.unit === defaultUnit);

    const price = Number(activeVariant?.price) || Number(productData?.selling_price) || 0;

    dispatch(
      addToCart({
        id: `${product.id}-${defaultUnit}`,
        name: product.nameEn,
        nepaliName: product.nameNp || "",
        srcUrl: product.imageUrl,
        imageUrl: product.imageUrl,
        unit: defaultUnit,
        quantity: 1,
        price: price,
      })
    );

    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 selection:text-indigo-900 relative">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[100%] rounded-full opacity-60 pointer-events-none blur-[120px]" style={{ background: 'radial-gradient(ellipse, rgba(79,70,229,0.2) 0%, rgba(167,243,208,0.1) 50%, transparent 80%)' }} />
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[80%] rounded-full opacity-50 pointer-events-none blur-[100px]" style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, rgba(252,211,77,0.1) 50%, transparent 80%)' }} />
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[40%] rounded-full opacity-30 pointer-events-none blur-[80px]" style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
      </div>

      <SplashScreen />
      <Header />

      <main id="catalog" className="max-w-[90rem] mx-auto p-4 md:p-8 pb-32">

        <HeroCarousel />

        {/* SEARCH AND FILTER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Explore Catalog</h2>
            <p className="text-slate-500 font-medium mt-1">Find the best wholesale deals for your business.</p>
          </div>
          <div className="relative w-full md:w-[420px] group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500 animate-pulse" />
            <div className="relative bg-white border border-slate-200/60 rounded-2xl shadow-xl flex items-center overflow-hidden transition-all group-focus-within:shadow-[0_8px_30px_rgb(79,70,229,0.15)] group-focus-within:border-indigo-500 group-focus-within:ring-4 ring-indigo-500/10">
              <div className="pl-5 pr-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <FiSearch size={22} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search premium inventory..."
                className="w-full py-4 bg-transparent focus:outline-none font-semibold text-slate-800 placeholder-slate-400 text-sm md:text-base"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mr-2 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX size={16} />
                </button>
              )}
              <div className="pr-4 pl-2 hidden md:block">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-black shadow-inner tracking-widest">
                  ESC
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter and Sorting */}
        <div className="relative z-40 bg-[#F8FAFC] pt-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0 mb-8 border-b border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          {!isLoading && activeCategories.length > 1 && (
            <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                <FiFilter size={18} />
              </div>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1 flex-1">
                {activeCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                      selectedCategory === cat
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sorting */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 ring-indigo-500/20 transition-all cursor-pointer appearance-none pr-8 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
            >
              <option value="Featured">Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/50 border border-slate-100 rounded-3xl shadow-sm" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-slate-100 shadow-xl max-w-3xl mx-auto"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3">
              <FiPackage className="text-slate-400 text-4xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">No Items Found</h3>
            <p className="text-slate-500 font-medium mt-2 max-w-sm">We couldn't find any items matching your current filters or search query.</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/20"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8"
          >
            {filteredProducts.map((product, i) => {
              const productData = product as any;
              const defaultUnit = product.units?.[0] || "Standard";
              const variantsArray = productData?.variants || productData?.varients || [];
              const activeVariant = variantsArray.find((v: any) => v.unit === defaultUnit);
              const displayPrice = Number(activeVariant?.price) || Number(productData?.selling_price) || 0;

              return (
                <motion.div
                  variants={itemVariants}
                  key={product.id}
                  className="group relative bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] border border-slate-100 overflow-hidden transition-all duration-700 flex flex-col hover:-translate-y-4"
                >
                  <Link href={`/product/${product.id}`} className="relative w-full aspect-square bg-slate-50 overflow-hidden block">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Image
                      src={product.imageUrl || "/placeholder.png"}
                      alt={product.nameEn}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      priority={i < 6}
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-[9px] font-black text-slate-800 uppercase tracking-widest rounded-full shadow-sm border border-white/20">
                        {product.category}
                      </span>
                    </div>

                    {/* Quick Actions (Wishlist & Quick View) */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          dispatch(toggleWishlist({
                            id: product.id,
                            name: product.nameEn,
                            price: displayPrice,
                            imageUrl: product.imageUrl || "/placeholder.png",
                            unit: defaultUnit
                          }));
                        }}
                        className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm border border-white/20 transition-colors"
                      >
                        <FiHeart size={16} strokeWidth={2.5} className={cn(wishlistItems.some((w: any) => w.id === product.id) && "fill-rose-500 text-rose-500")} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          setQuickViewProduct(product);
                        }}
                        className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-white/20 transition-colors"
                      >
                        <FiEye size={16} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-full py-3 bg-white/95 backdrop-blur-md rounded-xl text-xs font-black text-center text-indigo-600 shadow-xl border border-white/20">
                        View Details
                      </div>
                    </div>
                  </Link>

                  <div className="p-5 md:p-6 flex flex-col flex-1 relative bg-white z-20">
                    <Link href={`/product/${product.id}`} className="block group/text">
                      <h2 className="font-black text-slate-900 text-lg leading-tight line-clamp-1 group-hover/text:text-indigo-600 transition-colors tracking-tight">
                        {product.nameEn}
                      </h2>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 line-clamp-1 font-hindi opacity-80 uppercase tracking-widest">
                        {product.nameNp || "—"}
                      </p>
                    </Link>

                    {/* PRICING BAR */}
                    <div className="flex items-center justify-between mt-5 mb-5 bg-slate-50/50 rounded-2xl p-3 md:p-4 border border-slate-100/80 transition-colors group-hover:bg-indigo-50/30 group-hover:border-indigo-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wholesale</span>
                        <span className="text-sm font-black text-indigo-600">
                          {displayPrice > 0 ? `Rs. ${displayPrice.toLocaleString('en-IN')}` : "On Request"}
                        </span>
                      </div>
                      <div className="h-8 w-[1px] bg-slate-200/80"></div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit</span>
                        <span className="text-sm font-black text-slate-700">{defaultUnit}</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={cn(
                          "w-full font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 text-sm relative overflow-hidden group/btn",
                          addedItem === product.id
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-slate-900 hover:bg-indigo-600 text-white shadow-lg shadow-slate-900/20 hover:shadow-indigo-600/30"
                        )}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative flex items-center gap-2">
                          {addedItem === product.id ? (
                            <><FiCheck size={18} strokeWidth={3} /> Added to Cart</>
                          ) : (
                            <><FiShoppingCart size={18} /> Quick Add</>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${settings?.whatsappNumber || "9779860117783"}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 transition-all active:scale-95 md:bottom-8 md:right-8"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
}