"use client";

import Link from "next/link";

export default function ERPBeds() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
             Bed & Ward Management
          </h1>
          <Link href="/erp" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to ERP
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">General Ward A</h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-gray-50 p-4 rounded border">
                 <div className="font-bold">Bed 101-A</div>
                 <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">AVAILABLE</span>
               </div>
               <div className="flex justify-between items-center bg-gray-50 p-4 rounded border">
                 <div className="font-bold">Bed 101-B</div>
                 <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">OCCUPIED</span>
               </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Intensive Care Unit (ICU)</h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-gray-50 p-4 rounded border">
                 <div className="font-bold">ICU-Bed-1</div>
                 <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">AVAILABLE</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
