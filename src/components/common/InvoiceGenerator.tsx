"use client";

import React from "react";
import { useInventory } from "@/context/InventoryContext";
import { Printer, Download, X, FileText } from "lucide-react";

interface InvoiceItem {
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

interface InvoiceGeneratorProps {
  items: InvoiceItem[];
  onClose: () => void;
}

export default function InvoiceGenerator({ items, onClose }: InvoiceGeneratorProps) {
  const { settings } = useInventory();
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = settings?.enableTax ? Number(settings.taxPercentage || 0) : 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const deliveryCharge = Number(settings?.deliveryCharge || 0);
  const total = subtotal + taxAmount + deliveryCharge;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto print:bg-white print:p-0">
      
      {/* UI CONTROLS - Hidden when printing */}
      <div className="fixed top-6 right-6 flex items-center gap-3 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Printer size={18} /> Print / Save PDF
        </button>
        <button 
          onClick={onClose}
          className="p-3 bg-white text-slate-900 rounded-xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 border border-slate-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* THE ACTUAL INVOICE */}
      <div className="bg-white w-full max-w-4xl shadow-2xl rounded-[2rem] overflow-hidden flex flex-col print:shadow-none print:rounded-none print:max-w-none">
        
        {/* Invoice Header */}
        <div className="p-8 md:p-12 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-8 print:bg-white">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight lowercase">
              {settings?.storeName.split(' ')[0] || "rabindra"}<span className="text-indigo-600">.store</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2 max-w-xs">{settings?.storeDescription}</p>
            <div className="mt-6 space-y-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <p>{settings?.address || "Simraungadh, Bara, Nepal"}</p>
              <p>WhatsApp: {settings?.whatsappNumber}</p>
              <p>Email: {settings?.supportEmail}</p>
            </div>
          </div>
          <div className="md:text-right flex flex-col justify-between">
            <div>
              <h2 className="text-5xl font-black text-slate-200 uppercase tracking-tighter print:text-slate-100">Invoice</h2>
              <p className="text-indigo-600 font-black text-xl mt-1 tracking-tight">{invoiceNumber}</p>
            </div>
            <div className="mt-6 md:mt-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
              <p className="text-slate-900 font-black">{date}</p>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8 md:p-12 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Unit</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rate</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-6 pr-4">
                    <p className="font-black text-slate-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Wholesale Item</p>
                  </td>
                  <td className="py-6 text-center font-bold text-slate-600 text-sm">{item.unit}</td>
                  <td className="py-6 text-center font-black text-slate-900">{item.quantity}</td>
                  <td className="py-6 text-right font-bold text-slate-600 text-sm">Rs. {item.price.toLocaleString('en-IN')}</td>
                  <td className="py-6 text-right font-black text-slate-900">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="mt-12 flex flex-col md:flex-row justify-between gap-12">
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms & Notes</h4>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-slate-200">
                <ul className="text-[10px] font-bold text-slate-500 space-y-2 leading-relaxed">
                  <li>• This is a pro-forma invoice generated for wholesale inquiry.</li>
                  <li>• Final prices may vary based on live market rates at the time of pickup.</li>
                  <li>• All goods are subject to availability in Simraungadh warehouse.</li>
                  <li>• Please present this invoice ID during WhatsApp order confirmation.</li>
                </ul>
              </div>
            </div>
            
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="font-black text-slate-900">Rs. {subtotal.toLocaleString('en-IN')}</span>
              </div>
              {settings?.enableTax && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{settings.taxLabel || 'Tax'} ({settings.taxPercentage}%)</span>
                  <span className="font-black text-slate-900">Rs. {taxAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Delivery Charge</span>
                <span className="font-black text-slate-900">Rs. {deliveryCharge.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-slate-900 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Amount</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tight">Rs. {total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="p-8 md:p-12 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 print:bg-white print:text-slate-900 print:border-t print:border-slate-200">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 print:text-slate-400">Authorized Signatory</p>
            <div className="h-12 flex items-end">
              <p className="font-black text-lg italic tracking-tighter">Rabindra Store</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm font-black mb-1">Thank you for your business!</p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest print:text-slate-400">Simraungadh Wholesale Infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
