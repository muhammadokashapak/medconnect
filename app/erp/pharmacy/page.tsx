"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
             Pharmacy & Inventory
          </h1>
          <Link href="/erp" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to ERP</Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Current Stock</h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-red-700">
              + Receive Stock
            </button>
          </div>
          
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">No inventory items found.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                     <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                     <td className="px-6 py-4">{item.category}</td>
                     <td className={`px-6 py-4 font-bold ${item.quantity <= item.minStock ? 'text-red-600' : 'text-green-600'}`}>
                       {item.quantity} units {item.quantity <= item.minStock && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded ml-2">LOW</span>}
                     </td>
                     <td className="px-6 py-4">${item.unitPrice.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
