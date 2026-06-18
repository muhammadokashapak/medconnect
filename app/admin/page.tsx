"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("UNVERIFIED");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [statusFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/doctors?status=${statusFilter}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/login");
        throw new Error("Failed to fetch doctors");
      }
      const data = await res.json();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete Dr. ${name}? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete doctor");
      
      // Remove from UI
      setDoctors(prev => prev.filter(d => d.id !== id));
      setSuccessMsg("Doctor deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.fullName?.toLowerCase().includes(q) ||
      doc.pmdcNumber?.toLowerCase().includes(q) ||
      doc.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage doctor verifications and platform integrity.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                router.push("/login");
              }}
              className="text-indigo-600 hover:underline font-medium"
            >
              Logout Admin
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8 p-4 flex gap-4">
          <button 
            onClick={() => setStatusFilter("PENDING_REVIEW")}
            className={`px-4 py-2 rounded-md font-medium transition ${statusFilter === "PENDING_REVIEW" ? "bg-amber-100 text-amber-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Pending Review
          </button>
          <button 
            onClick={() => setStatusFilter("VERIFIED")}
            className={`px-4 py-2 rounded-md font-medium transition ${statusFilter === "VERIFIED" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Verified
          </button>
          <button 
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2 rounded-md font-medium transition ${statusFilter === "REJECTED" ? "bg-red-100 text-red-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Rejected
          </button>
          <button 
            onClick={() => setStatusFilter("SUSPENDED")}
            className={`px-4 py-2 rounded-md font-medium transition ${statusFilter === "SUSPENDED" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Suspended
          </button>
          <button 
            onClick={() => setStatusFilter("UNVERIFIED")}
            className={`px-4 py-2 rounded-md font-medium transition ${statusFilter === "UNVERIFIED" ? "bg-gray-200 text-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Unverified
          </button>
        </div>

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded mb-6 border border-green-200 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}
        {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, PMDC number, or email..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto animate-pulse">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PMDC / Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <div className="inline-block h-8 bg-gray-200 rounded w-16"></div>
                        <div className="inline-block h-8 bg-gray-200 rounded w-16"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-10 text-center text-gray-500">{searchQuery.trim() ? "No doctors match your search." : "No doctors found for this status."}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PMDC / Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Dr. {doc.fullName}</div>
                            <div className="text-sm text-gray-500">{doc.specialization || "General"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doc.pmdcNumber}</div>
                        <div className="text-sm text-gray-500">{doc.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${doc.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                            doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                            doc.verificationStatus === 'SUSPENDED' ? 'bg-orange-100 text-orange-800' : 
                            doc.verificationStatus === 'UNVERIFIED' ? 'bg-gray-100 text-gray-800' : 
                            'bg-amber-100 text-amber-800'}`}>
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => router.push(`/admin/doctor/${doc.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.fullName)}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
