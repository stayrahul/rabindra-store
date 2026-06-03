"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiSearch, FiHeart, FiUser } from "react-icons/fi";
import { cn } from "@/lib/utils";
import CartBtn from "./Navbar/TopNavbar/CartBtn";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Home", href: "/", icon: FiHome },
    { label: "Explore", href: "/shop", icon: FiSearch },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 w-full z-[120] bg-white/95 backdrop-blur-xl border-t border-slate-200/60 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95",
                isActive ? "text-indigo-600" : "text-slate-400"
              )}
            >
              <item.icon size={20} className={cn(isActive && "fill-indigo-100 stroke-[2.5]")} />
              <span className={cn("text-[9px] font-black uppercase tracking-widest", isActive && "text-indigo-600")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Central Cart Button */}
        <div className="flex flex-col items-center justify-center w-full h-full -translate-y-4">
          <CartBtn isMobileNav />
        </div>

        {/* Wishlist Link */}
        <Link
          href="/shop"
          className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95 text-slate-400"
        >
          <FiHeart size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Saved</span>
        </Link>
        
        {/* Profile/Admin Link */}
        <Link
          href="/admin"
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95",
            pathname?.startsWith("/admin") ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <FiUser size={20} className={cn(pathname?.startsWith("/admin") && "fill-indigo-100 stroke-[2.5]")} />
          <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
        </Link>
      </div>
    </div>
  );
}
