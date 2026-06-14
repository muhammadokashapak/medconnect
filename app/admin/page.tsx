"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

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
      setDoctors(doctors.filter(d => d.id !== id));
      alert("Doctor deleted successfully.");
    } catch (err: any) {
      setError(err.message);
    }
  };

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
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2 rounded-md font-medium transition ${statusFilter === "PENDING" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
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
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No doctors found for this status.</div>
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
                  {doctors.map((doc) => (
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
                            'bg-yellow-100 text-yellow-800'}`}>
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
                        {(statusFilter === "PENDING" || statusFilter === "REJECTED") && (
                          <button
                            onClick={() => handleDelete(doc.id, doc.fullName)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        )}
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
