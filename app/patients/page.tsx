"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (searchQuery = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Unauthorized");
      setPatients(await res.json());
    } catch (err) {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(query);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            My Patients (EHR)
          </h1>
          <div className="space-x-4">
            <Link href="/patient/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm text-sm">
              + New Patient
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-800">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search by Name, MRN, or Phone..." 
              className="flex-grow border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            {patients.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Patients Found</h3>
                <p className="text-gray-500">You haven't added any patients matching this criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">MRN</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Gender & Age</th>
                    <th className="px-6 py-4">Last Visit</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient: any) => {
                     const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
                     const lastVisit = patient.clinicalVisits && patient.clinicalVisits.length > 0 
                        ? new Date(patient.clinicalVisits[0].visitedAt).toLocaleDateString()
                        : "No visits";

                     return (
                      <tr key={patient.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                          {patient.mrn}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 text-base">{patient.fullName}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            {patient.phone || "No phone"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {patient.gender}, {age} yrs
                        </td>
                        <td className="px-6 py-4">
                          {lastVisit}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/patient/${patient.id}`} className="text-blue-600 hover:text-blue-800 font-bold px-3 py-2 hover:bg-blue-50 rounded transition">
                            View Chart
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
