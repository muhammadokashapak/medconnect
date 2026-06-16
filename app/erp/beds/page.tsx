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
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
          <div>
            <p className="font-semibold text-amber-800">Module Under Development</p>
            <p className="text-sm text-amber-600">This module is currently being built and shows sample data. Full functionality coming soon.</p>
          </div>
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
