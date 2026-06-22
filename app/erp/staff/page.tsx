"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Phone, Mail, Plus } from "lucide-react";

export default function ERPStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/erp/staff")
      .then(res => res.json())
      .then(data => {
        if (data.staff) setStaff(data.staff);
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
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              Staff & HR Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">Manage hospital personnel, roles, and contact information.</p>
          </div>
          <Link href="/erp" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Back to ERP</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800">Hospital Staff Directory</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : staff.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No staff found.</td></tr>
                ) : (
                  staff.map(s => (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-sm">
                             {s.fullName.charAt(0).toUpperCase()}
                           </div>
                           <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{s.fullName}</div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                           {s.role}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex flex-col gap-1 text-sm">
                           <div className="flex items-center gap-2 text-gray-600">
                             <Mail className="w-3.5 h-3.5 text-gray-400" />
                             {s.email}
                           </div>
                           <div className="flex items-center gap-2 text-gray-600">
                             <Phone className="w-3.5 h-3.5 text-gray-400" />
                             {s.phone}
                           </div>
                         </div>
                       </td>
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
