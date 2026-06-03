"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

const CAROUSEL_ITEMS = [
  {
    id: 1,
    title: "Premium Wholesale Infrastructure",
    subtitle: "Source top-tier inventory at industrial rates.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop",
    cta: "Shop Now",
    gradient: "from-indigo-950/90 via-indigo-900/60 to-transparent",
  },
  {
    id: 2,
    title: "Fresh Harvest Collection",
    subtitle: "Direct from the finest farms to your business.",
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=1600&auto=format&fit=crop",
    cta: "Explore Fresh",
    gradient: "from-emerald-950/90 via-emerald-900/60 to-transparent",
  },
  {
    id: 3,
    title: "Exclusive Spices & Oils",
    subtitle: "Authentic flavors, unbeatable bulk pricing.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop",
    cta: "View Spices",
    gradient: "from-amber-950/90 via-amber-900/60 to-transparent",
  },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full max-w-[90rem] mx-auto rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl bg-slate-950 mb-12 border border-slate-200/20 group/carousel">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {CAROUSEL_ITEMS.map((item, index) => {
            const isActive = selectedIndex === index;
            return (
              <div key={item.id} className="relative flex-[0_0_100%] min-w-0 h-[450px] md:h-[600px] overflow-hidden">
                {/* Parallax Image Background */}
                <motion.div
                  initial={false}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ duration: 7, ease: "easeOut" }}
                  className="absolute inset-0 z-0"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                </motion.div>
                
                {/* Dynamic Gradient Overlay */}
                <div className={cn("absolute inset-0 bg-gradient-to-r z-10 transition-opacity duration-1000", item.gradient, isActive ? "opacity-100" : "opacity-0")} />
                
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-20 max-w-4xl">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={`content-${index}`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] inline-block w-full"
                      >
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="inline-block px-4 py-1.5 mb-6 text-[10px] md:text-xs font-black tracking-[0.2em] text-white uppercase bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-inner"
                        >
                          Featured Collection
                        </motion.span>
                        <motion.h1 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-5"
                        >
                          {item.title}
                        </motion.h1>
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-lg md:text-2xl text-white/80 font-medium mb-10 max-w-xl leading-relaxed"
                        >
                          {item.subtitle}
                        </motion.p>
                        <motion.button 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] active:scale-95 group"
                        >
                          {item.cta}
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <FiArrowRight className="group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                          </div>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30 bg-slate-900/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
        {CAROUSEL_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              selectedIndex === index ? "w-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "w-2 bg-white/30 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] z-10 pointer-events-none group-hover/carousel:opacity-100 opacity-50 transition-opacity duration-1000" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] z-10 pointer-events-none group-hover/carousel:opacity-100 opacity-50 transition-opacity duration-1000" />
    </div>
  );
}
