"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HospitalAdminPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital-admin");
      if (!res.ok) throw new Error("Unauthorized or Forbidden");
      setData(await res.json());
    } catch (err) {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (membershipId: string, action: string) => {
    setProcessing(membershipId);
    try {
      const res = await fetch("/api/hospital-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId, action })
      });
      if (res.ok) {
        alert(`Request ${action}D successfully.`);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.message || "Action failed.");
      }
    } catch (error) {
      alert("Error processing action");
    } finally {
      setProcessing(null);
    }
  };

  if (loading || !data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Hospital Admin Portal
          </h1>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to Dashboard
          </Link>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.stats.totalHospitals}</h3>
            <p className="text-gray-500 text-sm">Hospitals</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.stats.totalDepartments}</h3>
            <p className="text-gray-500 text-sm">Departments</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.stats.totalEvents}</h3>
            <p className="text-gray-500 text-sm">Events</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.stats.totalAnnouncements}</h3>
            <p className="text-gray-500 text-sm">Announcements</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              Pending Doctor Approvals
            </h2>
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
              {data.pendingRequests.length} Pending
            </span>
          </div>

          {data.pendingRequests.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">No pending requests at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Hospital</th>
                    <th className="px-6 py-4">Date Requested</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pendingRequests.map((req: any) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                             {req.doctor.fullName.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-gray-900">Dr. {req.doctor.fullName}</p>
                             <p className="text-xs">{req.doctor.specialization || "General"}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {req.hospital.name}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(req.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleAction(req.id, "APPROVE")}
                          disabled={processing === req.id}
                          className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-1 px-3 rounded transition"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, "REJECT")}
                          disabled={processing === req.id}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded transition"
                        >
                          Reject
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
