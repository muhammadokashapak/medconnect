"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             Laboratory Management
          </h1>
          <Link href="/erp" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to ERP</Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Lab Orders</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-purple-700">
              + New Lab Order
            </button>
          </div>
          
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ordered At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center">No lab orders found.</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                     <td className="px-6 py-4 font-bold text-gray-900">{o.testName}</td>
                     <td className="px-6 py-4 text-purple-600">{o.patientId.slice(-6).toUpperCase()}</td>
                     <td className="px-6 py-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${o.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
  );
}
