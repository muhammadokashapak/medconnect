"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Microscope, Beaker } from "lucide-react";

export default function ERPLab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/erp/laboratory")
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
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
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shadow-sm">
                <Microscope className="w-6 h-6" />
              </div>
              Laboratory Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">Manage patient lab orders, test results, and diagnostics.</p>
          </div>
          <Link href="/erp" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Back to ERP</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800">Lab Orders</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-700 shadow-sm shadow-purple-200 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Lab Order
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Test Name</th>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ordered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No lab orders found.</td></tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-purple-50/30 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                             <Beaker className="w-4 h-4" />
                           </div>
                           <div className="font-bold text-gray-900">{o.testName}</div>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-purple-600 font-mono text-xs">{o.patientId.slice(-6).toUpperCase()}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${o.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                           {o.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-gray-500">{new Date(o.orderedAt).toLocaleString()}</td>
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
