"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             Billing & Finance
          </h1>
          <Link href="/erp" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to ERP</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-1">Total Revenue (PAID)</div>
            <div className="text-3xl font-black text-green-600">${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-1">Outstanding Invoices</div>
            <div className="text-3xl font-black text-red-600">{outstanding}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700">
              + Generate Invoice
            </button>
          </div>
          
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID / Patient</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">No invoices generated yet.</td></tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                     <td className="px-6 py-4 font-bold text-gray-900">
                       #{inv.id.slice(-6).toUpperCase()}<br/>
                       <span className="font-normal text-xs text-gray-500">{inv.patient?.fullName}</span>
                     </td>
                     <td className="px-6 py-4 font-bold text-green-700">${inv.amount.toFixed(2)}</td>
                     <td className="px-6 py-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
  );
}
