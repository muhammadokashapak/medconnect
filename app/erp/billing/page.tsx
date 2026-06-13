"use client";

import Link from "next/link";

export default function ERPBilling() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             Billing & Finance
          </h1>
          <Link href="/erp" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to ERP
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-1">Today's Revenue</div>
            <div className="text-3xl font-black text-green-600">$0.00</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-1">Outstanding Invoices</div>
            <div className="text-3xl font-black text-red-600">0</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-gray-500 text-sm uppercase tracking-widest font-bold mb-1">Payments Processed</div>
            <div className="text-3xl font-black text-blue-600">0</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700">
              + Generate Invoice
            </button>
          </div>
          
          <div className="text-center py-10 text-gray-500">
             No invoices generated yet.
          </div>
        </div>
      </div>
    </div>
  );
}
