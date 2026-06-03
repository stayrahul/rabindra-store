"use client";

import { useState, useRef } from "react";
import {
  FiChevronDown, FiImage, FiZap, FiCheckCircle, FiDollarSign,
  FiChevronRight, FiChevronLeft, FiRefreshCw, FiAlertCircle,
  FiUploadCloud, FiTrash2, FiPlus, FiEye, FiTarget, FiInfo, FiX, FiPackage
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useInventory } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dtoyfm9xk";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Rabindra-store";

interface ProductVariant {
  unit: string;
  price: string;
  showPrice: boolean;
}

export default function AddProductForm({ onSuccess, initialData }: any) {
  const { addProduct, updateProduct, categories } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localName, setLocalName] = useState("");
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "");
  const [nameNp, setNameNp] = useState(initialData?.nameNp || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // Handle categories gracefully whether it's an array of strings or objects
  const firstCategory = categories && categories.length > 0 ? categories[0] : null;
  const defaultCategory = firstCategory
    ? (typeof firstCategory === 'object' ? (firstCategory as any).name : firstCategory)
    : "Uncategorized";
  const [category, setCategory] = useState(initialData?.category || defaultCategory);

  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);

  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants ||
    (initialData?.units
      ? initialData.units.map((u: string) => ({ unit: u, price: "", showPrice: false }))
      : [{ unit: "", price: "", showPrice: false }])
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const totalSteps = 3;

  const isEditMode = !!initialData;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await response.json();
      if (data.secure_url) setImageUrl(data.secure_url);
      else throw new Error(data.error?.message || "Upload failed");
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateFromLocal = async () => {
    if (!localName || localName.length < 2) return setError("Please enter a local word first.");
    setIsGeneratingLocal(true);
    setError("");
    try {
      const response = await fetch('/api/generate-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'from-local', query: localName, categories })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "AI Generation failed");
      }
      const data = await response.json();
      if (data.englishName) setNameEn(data.englishName);
      if (data.nepaliName) setNameNp(data.nepaliName);
      if (data.description) setDescription(data.description);
      if (data.category) setCategory(data.category);
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || "Could not generate details. Please try manually.");
    } finally {
      setIsGeneratingLocal(false);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!description || description.length < 5) return setError("Please type some description to enhance.");
    setIsEnhancingDesc(true);
    setError("");
    try {
      const response = await fetch('/api/generate-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'enhance', query: description })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "AI Enhancement failed");
      }
      const data = await response.json();
      if (data.description) setDescription(data.description);
    } catch (err: any) {
      setError(err.message || "Could not enhance description.");
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSaveProduct = async () => {
    if (!nameEn) return setError("English name is required.");
    if (!imageUrl) return setError("Please upload a product photo.");

    const validVariants = variants.filter(v => v.unit.trim() !== "");
    if (validVariants.length === 0) return setError("Please add at least one valid packaging size/unit.");

    setError("");

    // Calculate official database price
    const firstPricedVariant = validVariants.find(v => v.showPrice && v.price);
    const parsedPrice = firstPricedVariant ? parseFloat(firstPricedVariant.price) : null;

    const productData = {
      ...initialData, // Preserve things like created_at implicitly
      nameEn,
      nameNp,
      category,
      description,
      variants: validVariants,
      units: validVariants.map(v => v.unit),
      imageUrl,
      selling_price: parsedPrice, // Standardized snake_case
      inStock: isEditMode ? (initialData?.inStock ?? true) : true,
    } as any;

    // 🔥 CRITICAL DATA CLEANING 🔥
    const cleanData = { ...productData };
    delete cleanData.updated_at;
    delete cleanData.created_at;

    try {
      if (isEditMode) {
        delete cleanData.id;
        await updateProduct(initialData.id, cleanData);
      } else {
        cleanData.id = "prod_" + Date.now();
        await addProduct(cleanData);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Save Error:", err);
      setError("Failed to save product to database.");
    }
  };

  const steps = [
    { id: 1, label: "Core Identity", icon: FiPackage },
    { id: 2, label: "Visual Assets", icon: FiImage },
    { id: 3, label: "Market Specs", icon: FiDollarSign },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-12 max-w-[95rem] mx-auto p-4 lg:p-12 pb-12 font-sans selection:bg-indigo-100">

      {/* ── LEFT: FORM ORCHESTRATOR ── */}
      <div className="flex-1 space-y-6 sm:space-y-10">

        {/* Navigation & Progress Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isEditMode ? "Update Asset" : "New Asset Ingress"}
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Stage {currentStep} of {totalSteps}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreviewMobile(!showPreviewMobile)}
              className="xl:hidden w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              <FiEye size={18} />
            </button>
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    currentStep === step.id ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : currentStep > step.id ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"
                  )}
                >
                  {currentStep > step.id ? <FiCheckCircle size={18} /> : <step.icon size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-4 text-xs font-black border border-rose-100 shadow-sm">
                <FiAlertCircle size={20} className="shrink-0" /> {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Step Content */}
        <div className="min-h-[400px] sm:min-h-[500px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-6 sm:space-y-10">
                {/* 🧠 NEURAL PROCESSOR (AI) - BILINGUAL & MOBILE OPTIMIZED */}
                <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-0" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                          <FiZap size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">AI Local Ingress</h3>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">स्थानीय भाषा पहिचान</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={localName}
                          onChange={(e) => setLocalName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 sm:py-5 text-sm sm:text-base font-bold outline-none focus:bg-white/10 focus:border-indigo-400 transition-all placeholder:text-white/20"
                          placeholder="उदा: मस्यौरा, कालो दाल..."
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none hidden sm:block">
                          <FiTarget size={20} />
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateFromLocal}
                        disabled={isGeneratingLocal || !localName}
                        className="bg-indigo-600 hover:bg-indigo-500 px-8 h-[56px] sm:h-[68px] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/40 disabled:opacity-30 flex items-center justify-center gap-3 active:scale-95"
                      >
                        {isGeneratingLocal ? (
                          <><FiRefreshCw className="animate-spin" /> Processing...</>
                        ) : (
                          <>Analyze <span className="hidden sm:inline">& Auto-Fill</span></>
                        )}
                      </button>
                    </div>
                    <p className="mt-4 text-[10px] text-white/40 font-bold italic px-2">Type a local word to automatically fill all fields using AI.</p>
                  </div>
                </div>

                {/* CORE ATTRIBUTES - BILINGUAL */}
                <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 space-y-10 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">English Name</label>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">अंग्रेजी नाम</span>
                      </div>
                      <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-lg font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                        placeholder="e.g. Red Lentils"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nepali Identity</label>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">नेपाली नाम</span>
                      </div>
                      <input
                        type="text"
                        value={nameNp}
                        onChange={(e) => setNameNp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-lg font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                        placeholder="उदा: मुसुरोको दाल"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Classification / वर्ग</label>
                    <div className="relative group">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-[64px] bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none appearance-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                      >
                        {categories?.map((cat: any) => {
                          if (!cat) return null;
                          const catName = typeof cat === 'object' ? cat.name : cat;
                          return <option key={catName} value={catName}>{catName}</option>
                        })}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <FiChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Narrative</label>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">विवरण (Nepali support)</span>
                      </div>
                      <button onClick={handleEnhanceDescription} disabled={isEnhancingDesc || !description} className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all shadow-sm">
                        {isEnhancingDesc ? <FiRefreshCw className="animate-spin" /> : <FiZap />} AI Rewrite
                      </button>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-base font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all leading-relaxed resize-none shadow-sm"
                      placeholder="Define quality, origin, and wholesale specs..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-6 sm:space-y-8">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100">
                  <div className="mb-6 text-center">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Visual Documentation</h3>
                    <p className="text-slate-400 font-bold text-xs mt-1">High-fidelity imagery for storefront rendering</p>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative w-full aspect-square sm:aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer",
                      imageUrl ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300"
                    )}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-6">
                        <FiRefreshCw className="animate-spin text-6xl text-indigo-600" />
                        <span className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">Uploading to Cloud...</span>
                      </div>
                    ) : imageUrl ? (
                      <>
                        <Image src={imageUrl} alt="Asset Preview" fill sizes="(max-width: 768px) 100vw, 800px" className="object-contain p-16 transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-sm">
                          <div className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3">
                            <FiUploadCloud /> Replace Asset
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-6 transform transition-transform group-hover:-translate-y-4">
                        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto border border-slate-100 text-slate-300 group-hover:text-indigo-600 transition-colors">
                          <FiUploadCloud size={40} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-slate-900 tracking-tight">Ingest Visual Data</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Supports high-res JPG, PNG, WEBP</p>
                        </div>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-6 sm:space-y-10">
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 border-b border-slate-100 pb-6 gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Market Specifications</h3>
                      <p className="text-slate-400 font-bold text-xs sm:text-sm mt-1">Configure packaging units and prices</p>
                    </div>
                    <button
                      onClick={() => setVariants([...variants, { unit: "", price: "", showPrice: false }])}
                      className="w-full sm:w-auto px-6 py-4 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center justify-center gap-2"
                    >
                      <FiPlus size={16} /> Add Variant
                    </button>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <AnimatePresence>
                      {variants.map((variant, i) => (
                        <motion.div
                          key={`variant-${i}`}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 sm:gap-6 p-6 sm:p-10 bg-slate-50/50 border border-slate-200 rounded-[2.5rem] relative group"
                        >
                          <div className="w-full xl:flex-1 space-y-3">
                            <div className="flex justify-between items-end px-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Packaging Size</label>
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">एकाइ / साइज</span>
                            </div>
                            <input
                              type="text"
                              value={variant.unit}
                              onChange={(e) => updateVariant(i, "unit", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4.5 font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm"
                              placeholder="e.g. 25KG Bag"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 w-full xl:w-auto">
                            <div className="flex-1 xl:w-[220px] space-y-3">
                              <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</label>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">दृश्यता</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateVariant(i, "showPrice", !variant.showPrice)}
                                className={cn(
                                  "w-full h-[60px] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                  variant.showPrice ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200"
                                )}
                              >
                                {variant.showPrice ? <><FiEye className="inline mr-2" /> Price Public</> : <><FiInfo className="inline mr-2" /> Call To Buy</>}
                              </button>
                            </div>

                            {variant.showPrice && (
                              <div className="flex-1 xl:w-[200px] space-y-3">
                                <div className="flex justify-between items-end px-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (Rs.)</label>
                                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">मूल्य (रु)</span>
                                </div>
                                <div className="relative">
                                  <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                                  <input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                                    className="w-full pl-12 pr-4 h-[60px] bg-white border border-emerald-100 rounded-2xl font-black text-slate-900 outline-none focus:border-emerald-500 shadow-sm text-lg"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            )}

                            {variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                                className="h-[60px] w-full sm:w-[60px] bg-white border border-slate-200 text-slate-300 hover:text-rose-600 hover:border-rose-200 rounded-2xl transition-all flex items-center justify-center shrink-0 shadow-sm active:scale-90"
                              >
                                <FiTrash2 size={24} /> <span className="sm:hidden ml-3 text-[10px] font-black uppercase tracking-widest text-inherit">Remove Variant</span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT: NEURAL PREVIEW ENGINE ── */}
      <div className={cn(
        "w-full xl:w-[480px] space-y-6 xl:block transition-all duration-500",
        showPreviewMobile ? "block fixed inset-0 z-[100] bg-slate-50 p-4 sm:p-6 overflow-y-auto" : "hidden"
      )}>
        <div className="sticky top-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <FiEye className="text-indigo-600" /> Live Preview / प्रत्यक्ष अवलोकन
            </h3>
            <button onClick={() => setShowPreviewMobile(false)} className="xl:hidden p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-slate-900">
              <FiX size={24} />
            </button>
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="relative w-full aspect-square bg-slate-50 flex items-center justify-center p-8 border-b border-slate-50">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-contain p-12 drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="text-slate-200 flex flex-col items-center gap-4">
                  <FiPackage size={64} className="opacity-20" />
                  <span className="text-[9px] font-black uppercase tracking-widest">No Visual Data</span>
                </div>
              )}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm flex items-center gap-2">
                <FiTarget className="text-indigo-600" size={14} />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{category}</span>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">{nameEn || "Product Identity"}</h2>
                <p className="text-lg font-bold text-slate-400 font-hindi">{nameNp || "नाम (नेपाली)"}</p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                  {description || "Awaiting narrative ingestion..."}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-1 bg-indigo-100/50 rounded-full flex-1" />)}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wholesale Tiers</p>
                <div className="space-y-3">
                  {variants.filter(v => v.unit).length === 0 ? (
                    <div className="h-14 bg-slate-50 rounded-2xl border border-slate-100 border-dashed" />
                  ) : (
                    variants.filter(v => v.unit).map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100">
                        <span className="text-xs font-black text-slate-700">{v.unit}</span>
                        {v.showPrice ? (
                          <span className="text-sm font-black text-emerald-600">Rs. {v.price || '0'}</span>
                        ) : (
                          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">On Request</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl" />
            <FiInfo className="absolute -bottom-6 -right-6 text-white/5 text-9xl rotate-12" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3">System Insight</p>
            <p className="text-xs font-bold leading-relaxed relative z-10 opacity-70">
              The Neural Engine automatically cross-references local names with global wholesale standards for peak discoverability.
            </p>
          </div>
        </div>
      </div>

      {/* ── STATIC NAVIGATION BUTTONS (NO BG, COMPACT) ── */}
      <div className="mt-6 pb-12">
        <div className="max-w-[95rem] mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all",
              currentStep === 1 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-slate-900 bg-slate-50 border border-slate-100"
            )}
          >
            <FiChevronLeft size={20} /> <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex-1 flex justify-end gap-3 sm:gap-6">
            <button
              onClick={() => onSuccess && onSuccess()}
              className="px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-all active:scale-95"
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-8 sm:px-14 py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
              >
                Continue <FiChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSaveProduct}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 sm:px-14 py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
              >
                Commit Asset <FiCheckCircle size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}