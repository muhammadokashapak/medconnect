"use client";

import Link from "next/link";

export default function ERPRadiology() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             Radiology Management
          </h1>
          <Link href="/erp" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to ERP
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="text-center py-10 text-gray-500">
             No pending radiology orders.
          </div>
        </div>
      </div>
    </div>
  );
}
