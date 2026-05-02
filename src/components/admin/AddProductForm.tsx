"use client";

import { useState } from "react";
import { 
  FiUploadCloud, FiPlus, FiTrash2, FiAlertCircle, FiRefreshCw, 
  FiChevronDown, FiImage, FiStar, FiZap, FiCheckCircle, FiDollarSign 
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useInventory } from "@/context/InventoryContext"; 

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dtoyfm9xk";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Rabindra-store";

// Define the new Variant structure
interface ProductVariant {
  unit: string;
  price: string;
  showPrice: boolean;
}

export default function AddProductForm({ onSuccess, initialData }: any) {
  const { addProduct, updateProduct, categories } = useInventory(); 
  
  const [localName, setLocalName] = useState(""); 
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "");
  const [nameNp, setNameNp] = useState(initialData?.nameNp || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || categories[0] || "Uncategorized");
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  
  // UPGRADE: Handle new variant structure with backward compatibility for old "units" array
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || 
    (initialData?.units 
      ? initialData.units.map((u: string) => ({ unit: u, price: "", showPrice: false })) 
      : [{ unit: "", price: "", showPrice: false }])
  );
  
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false); 
  const [isGeneratingEn, setIsGeneratingEn] = useState(false);       
  const [error, setError] = useState("");

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

  // --- AI GENERATION LOGIC ---
  const handleGenerateFromLocal = async () => {
    if (!localName || localName.length < 2) return setError("Please enter a local word first.");
    setIsGeneratingLocal(true);
    setError("");
    try {
      const response = await fetch('/api/generate-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'from-local', query: localName, categories })
      });
      if (!response.ok) throw new Error("AI Generation failed");
      const data = await response.json();
      if (data.englishName) setNameEn(data.englishName);
      if (data.nepaliName) setNameNp(data.nepaliName);
      if (data.description) setDescription(data.description);
      if (data.category && categories.includes(data.category)) setCategory(data.category);
    } catch (err) {
      setError("Could not generate details. Please try manually.");
    } finally {
      setIsGeneratingLocal(false);
    }
  };

  const handleGenerateFromEnglish = async () => {
    if (!nameEn || nameEn.length < 2) return setError("Please enter an English name first.");
    setIsGeneratingEn(true);
    setError("");
    try {
      const response = await fetch('/api/generate-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'from-english', query: nameEn })
      });
      if (!response.ok) throw new Error("AI Generation failed");
      const data = await response.json();
      if (data.nepaliName && !nameNp) setNameNp(data.nepaliName);
      if (data.description && !description) setDescription(data.description);
    } catch (err) {
      setError("Could not generate details. Please try manually.");
    } finally {
      setIsGeneratingEn(false);
    }
  };

  // --- VARIANT MANAGEMENT ---
  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSaveProduct = async () => {
    if (!nameEn) return setError("English name is required.");
    if (!imageUrl) return setError("Please upload a product photo.");
    
    // Clean variants (remove empties)
    const validVariants = variants.filter(v => v.unit.trim() !== "");
    if (validVariants.length === 0) return setError("Please add at least one valid packaging size/unit.");
    
    setError("");

    const productData = {
      id: isEditMode ? initialData.id : "prod_" + Date.now(), 
      nameEn, 
      nameNp, 
      category, 
      description,
      variants: validVariants, // UPGRADED: Saving full objects now
      units: validVariants.map(v => v.unit), // Extract units for backwards compatibility
      imageUrl,
      inStock: isEditMode ? (initialData?.inStock ?? true) : true,
    };

    isEditMode ? await updateProduct(productData.id, productData) : await addProduct(productData);
    if (onSuccess) onSuccess(); 
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 lg:gap-10 max-w-[90rem] mx-auto p-4 md:p-8 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* LEFT COLUMN: MAIN FORM */}
      <div className="w-full xl:w-[65%] flex flex-col gap-8 order-1">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{isEditMode ? "Edit Product" : "Add New Item"}</h2>
          <p className="text-slate-500 mt-2 text-base">Configure pricing, packaging variants, and auto-fill details via AI.</p>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100">
                  <FiAlertCircle className="text-xl shrink-0" /> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 1: AI LOCAL WORD ASSISTANT */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700 p-8 rounded-[2rem] shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"><FiZap className="text-[12rem] text-white" /></div>
          <div className="relative z-10">
            <h3 className="text-white font-black text-xl mb-2 flex items-center gap-2 tracking-wide"><FiZap className="text-yellow-400 drop-shadow-md" /> AI Quick Start</h3>
            <p className="text-indigo-100 text-sm md:text-base mb-6 font-medium max-w-xl">Type the local or informal name of the item. Our AI will automatically translate, categorize, and describe it for you.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" value={localName} onChange={(e) => setLocalName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400 outline-none transition-all font-bold backdrop-blur-md shadow-inner" placeholder="e.g. Kalo dal, Bhujia, Jeera Masino..." />
              <button onClick={handleGenerateFromLocal} disabled={isGeneratingLocal || !localName} className="shrink-0 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                {isGeneratingLocal ? <><FiRefreshCw className="animate-spin text-xl" /> Thinking...</> : <><FiStar className="text-indigo-500" /> Auto-Fill</>}
              </button>
            </div>
          </div>
        </div>

        {/* STEP 2: PRODUCT IDENTITY */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 space-y-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Product Identity</h3>
          <div className="flex flex-col sm:flex-row gap-5 items-end">
            <div className="w-full">
              <label className="block text-sm font-bold text-slate-700 mb-2">Standard English Name *</label>
              <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-bold text-slate-900" placeholder="e.g. Premium Basmati Rice" />
            </div>
            <button onClick={handleGenerateFromEnglish} disabled={isGeneratingEn || !nameEn} className="w-full sm:w-auto shrink-0 bg-indigo-50/80 text-indigo-700 border border-indigo-100 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isGeneratingEn ? <FiRefreshCw className="animate-spin" /> : <FiStar />} Magic Fill
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nepali Name</label>
              <input type="text" value={nameNp} onChange={(e) => setNameNp(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-bold text-slate-900" placeholder="e.g. बासमती चामल" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer">
                  {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Product Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-medium text-slate-800 resize-none leading-relaxed" placeholder="Highlight origin, quality, and minimum order requirements..." />
          </div>
        </div>

        {/* STEP 3: MEDIA & UPGRADED VARIANT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* PHOTO UPLOAD */}
          <div className="xl:col-span-4 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col">
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">Product Photo *</label>
            <div className={`relative w-full flex-1 min-h-[16rem] rounded-[1.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer group ${imageUrl ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-300 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300'}`}>
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <FiRefreshCw className="animate-spin text-4xl text-indigo-500" />
                  <span className="text-sm font-bold text-indigo-600 tracking-wide">Uploading...</span>
                </div>
              ) : imageUrl ? (
                <>
                  <Image src={imageUrl} alt="Preview" fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                    <span className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2"><FiUploadCloud className="text-indigo-600"/> Change</span>
                  </div>
                </>
              ) : (
                <div className="text-center px-4 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors"><FiUploadCloud className="w-8 h-8" /></div>
                  <p className="text-sm font-bold text-slate-700">Tap or drag photo</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
            </div>
          </div>

          {/* UPGRADED VARIANT PRICING */}
          <div className="xl:col-span-8 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Pricing & Variants</label>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-wider">Dynamic</span>
            </div>
            
            <div className="space-y-4 w-full flex-1">
              <AnimatePresence>
                {variants.map((variant, i) => (
                  <motion.div layout key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} 
                    className="flex flex-col sm:flex-row items-center gap-3 w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                  >
                    {/* Unit Name Input */}
                    <input 
                      type="text" 
                      value={variant.unit} 
                      onChange={(e) => updateVariant(i, "unit", e.target.value)} 
                      className="w-full sm:flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 text-sm outline-none transition-all" 
                      placeholder="Size (e.g. 1kg, 25kg Sack)" 
                    />
                    
                    <div className="flex w-full sm:w-auto items-center gap-3">
                      {/* Price Toggle */}
                      <button 
                        onClick={() => updateVariant(i, "showPrice", !variant.showPrice)}
                        className={`shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto ${
                          variant.showPrice 
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                            : "bg-slate-200 text-slate-500 border border-slate-300"
                        }`}
                      >
                        <FiDollarSign size={14} /> {variant.showPrice ? "Priced" : "Hidden"}
                      </button>

                      {/* Price Input (Only visible if toggled ON) */}
                      {variant.showPrice && (
                        <div className="relative w-full sm:w-32 shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">Rs.</span>
                          <input 
                            type="number" 
                            value={variant.price} 
                            onChange={(e) => updateVariant(i, "price", e.target.value)} 
                            className="w-full pl-8 pr-3 py-3 rounded-xl border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 text-sm outline-none transition-all" 
                            placeholder="Amount" 
                          />
                        </div>
                      )}

                      {/* Delete Button */}
                      {variants.length > 1 && (
                        <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="shrink-0 p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all shadow-sm">
                          <FiTrash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <button onClick={() => setVariants([...variants, { unit: "", price: "", showPrice: false }])} className="mt-5 w-full flex items-center justify-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 transition-all border-2 border-dashed border-indigo-200 hover:border-indigo-400 px-4 py-4 rounded-xl text-sm">
              <FiPlus className="text-lg" /> Add Variant
            </button>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
          <button onClick={() => onSuccess && onSuccess()} className="px-8 py-4.5 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 w-full sm:w-auto transition-all shadow-sm order-2 sm:order-1">Cancel</button>
          <button onClick={handleSaveProduct} className="px-10 py-4.5 rounded-2xl font-black text-white bg-slate-900 hover:bg-indigo-600 w-full sm:w-auto transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.3)] hover:-translate-y-0.5 active:translate-y-0 order-1 sm:order-2 flex justify-center items-center gap-2">
            <FiCheckCircle className="text-lg" /> {isEditMode ? "Save Changes" : "Publish to Store"}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: STICKY LIVE PREVIEW */}
      <div className="w-full xl:w-[35%] xl:sticky xl:top-8 order-2 h-fit">
        <h3 className="hidden xl:flex text-xs font-black text-slate-400 uppercase tracking-widest mb-6 items-center gap-3 pl-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Storefront Preview
        </h3>
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden pointer-events-none transition-all duration-300">
          <div className="relative w-full aspect-square bg-slate-50 flex items-center justify-center border-b border-slate-100 p-8 group">
            {imageUrl ? (
              <Image src={imageUrl} alt="Preview" fill className="object-contain p-8 drop-shadow-xl" />
            ) : (
              <div className="text-slate-300 flex flex-col items-center gap-4"><FiImage className="text-7xl opacity-50" /><span className="text-xs font-bold tracking-widest uppercase opacity-50">No Image</span></div>
            )}
            <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200/50 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{category}</span></div>
          </div>
          <div className="p-8">
            <h2 className="font-black text-slate-900 text-2xl leading-tight tracking-tight">{nameEn || "Product Title"}</h2>
            <p className="text-sm font-bold text-indigo-500 mt-1">{nameNp || "नेपाली नाम"}</p>
            {description ? (
              <p className="text-sm text-slate-600 mt-4 leading-relaxed font-medium line-clamp-3">{description}</p>
            ) : (
              <div className="space-y-3 mt-5 opacity-30"><div className="h-2.5 bg-slate-300 rounded-full w-full"></div><div className="h-2.5 bg-slate-300 rounded-full w-4/5"></div></div>
            )}
            
            {/* UPGRADED LIVE PREVIEW PRICING */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Available Variants</span>
              <div className="flex flex-col gap-2">
                {variants.map((v, i) => v.unit && (
                  <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-200/60">
                    <span className="text-sm font-bold text-slate-700">{v.unit}</span>
                    {v.showPrice ? (
                      <span className="text-sm font-black text-emerald-600">
                        {v.price ? `Rs. ${v.price}` : "Rs. 0"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Call for Price</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}