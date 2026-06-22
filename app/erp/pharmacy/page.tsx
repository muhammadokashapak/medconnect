"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Pill, AlertTriangle } from "lucide-react";

export default function ERPPharmacy() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/erp/pharmacy")
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg shadow-sm">
                <Pill className="w-6 h-6" />
              </div>
              Pharmacy & Inventory
            </h1>
            <p className="mt-1 text-sm text-gray-500">Track medication stock, consumables, and low-inventory alerts.</p>
          </div>
          <Link href="/erp" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Back to ERP</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800">Current Stock</h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 shadow-sm shadow-red-200 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Receive Stock
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Item Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No inventory items found.</td></tr>
                ) : (
                  items.map(item => {
                    const isLowStock = item.quantity <= item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-red-50/30 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLowStock ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                               <Package className="w-4 h-4" />
                             </div>
                             <div className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">{item.name}</div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                             {item.category}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                               {item.quantity} units
                             </span>
                             {isLowStock && (
                               <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-bold border border-red-200 animate-pulse">
                                 <AlertTriangle className="w-3 h-3" /> LOW
                               </span>
                             )}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-gray-600">${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
