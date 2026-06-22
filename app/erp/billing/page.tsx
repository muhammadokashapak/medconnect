"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Receipt, CircleDollarSign, AlertCircle } from "lucide-react";

export default function ERPBilling() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const totalRevenue = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === "UNPAID").length;

  useEffect(() => {
    fetch("/api/erp/billing")
      .then(res => res.json())
      .then(data => {
        if (data.invoices) setInvoices(data.invoices);
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
              <div className="p-2 bg-green-100 text-green-600 rounded-lg shadow-sm">
                <Receipt className="w-6 h-6" />
              </div>
              Billing & Finance
            </h1>
            <p className="mt-1 text-sm text-gray-500">Track hospital revenue, generated invoices, and outstanding payments.</p>
          </div>
          <Link href="/erp" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Back to ERP</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-md text-white relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <CircleDollarSign className="w-32 h-32" />
            </div>
            <div className="text-green-50 text-sm uppercase tracking-widest font-bold mb-2">Total Revenue (PAID)</div>
            <div className="text-4xl font-black">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-2xl shadow-md text-white relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <AlertCircle className="w-32 h-32" />
            </div>
            <div className="text-red-50 text-sm uppercase tracking-widest font-bold mb-2">Outstanding Invoices</div>
            <div className="text-4xl font-black">{outstanding}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800">Recent Invoices</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 shadow-sm shadow-green-200 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Generate Invoice
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">ID / Patient</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No invoices generated yet.</td></tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-green-50/30 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="font-bold text-gray-900">#{inv.id.slice(-6).toUpperCase()}</div>
                         <div className="text-xs text-gray-500 mt-1">{inv.patient?.fullName}</div>
                       </td>
                       <td className="px-6 py-4 font-bold text-green-700">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                           {inv.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-gray-500">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
