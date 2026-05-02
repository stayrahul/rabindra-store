"use client";

import React, { Suspense } from "react"; // Added Suspense
import { useSearchParams } from "next/navigation";
import { ALL_PRODUCTS } from "@/data/inventory";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Local fallback for ProductCard
const ProductCard = ({ data }: { data: any }) => {
  return (
    <div className="bg-white rounded-md p-3 border border-slate-200">
      <div className="h-40 bg-slate-100 rounded-md mb-2 flex items-center justify-center text-slate-400">
        Image
      </div>
      <div className="text-sm font-medium text-slate-900">{data.name}</div>
      <div className="text-xs text-slate-500">{data.price}</div>
    </div>
  );
};

// 1. Move the search logic into a separate internal component
function ShopContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const filteredProducts = selectedCategory
    ? ALL_PRODUCTS.filter((p) => p.category === selectedCategory)
    : ALL_PRODUCTS;

  return (
    <div className="max-w-frame mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/categories" className="p-2 bg-white rounded-full border border-slate-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          {selectedCategory || "All Items"}
        </h1>
      </div>

      {/* 2-Column Grid for Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No items found in this category.
        </div>
      )}
    </div>
  );
}

// 2. Wrap the main page export in Suspense
export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] pb-20">
      <Suspense fallback={<div className="p-10 text-center">Loading Shop...</div>}>
        <ShopContent />
      </Suspense>
    </main>
  );
}