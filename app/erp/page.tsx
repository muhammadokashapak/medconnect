import Link from "next/link";

export default function ERPDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Hospital ERP Dashboard
          </h1>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to MedConnect
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/erp/staff" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Staff & HR</h2>
            <p className="text-gray-500 text-sm">Manage doctors, nurses, technicians, and their shifts.</p>
          </Link>

          <Link href="/erp/beds" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bed Management</h2>
            <p className="text-gray-500 text-sm">Track ward occupancy, ICU availability, and assignments.</p>
          </Link>

          <Link href="/erp/billing" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Billing & Finance</h2>
            <p className="text-gray-500 text-sm">Generate invoices, track payments, and view revenue.</p>
          </Link>

          <Link href="/erp/pharmacy" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pharmacy & Inventory</h2>
            <p className="text-gray-500 text-sm">Manage medicine stock, suppliers, and dispensing.</p>
          </Link>

          <Link href="/erp/laboratory" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Laboratory</h2>
            <p className="text-gray-500 text-sm">Process lab orders, track samples, and generate reports.</p>
          </Link>
          
          <Link href="/erp/radiology" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-600 group-hover:text-white transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Radiology</h2>
            <p className="text-gray-500 text-sm">Manage imaging orders (X-Ray, MRI) and interpretations.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
