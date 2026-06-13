"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HospitalsPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");

  const cities = ["All", "Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"];

  useEffect(() => {
    fetchData();
  }, [city]);

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/hospitals?";
    if (query) url += `query=${encodeURIComponent(query)}&`;
    if (city && city !== "All") url += `city=${encodeURIComponent(city)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Unauthorized");
      setHospitals(await res.json());
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Hospitals & Clinics
          </h1>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to Dashboard
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Search hospitals by name..." 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="md:w-48">
              <select 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-500 text-lg">No hospitals found matching your criteria.</p>
              </div>
            ) : (
              hospitals.map(hospital => (
                <div key={hospital.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                        {hospital.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-1 rounded">
                        {hospital.city}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {hospital.name}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{hospital.description}</p>
                    
                    <div className="flex gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center">
                         <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                         {hospital._count.memberships} Doctors
                      </div>
                      <div className="flex items-center">
                         <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                         {hospital._count.departments} Depts
                      </div>
                    </div>
                  </div>
                  <Link href={`/hospital/${hospital.id}`} className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-blue-600 font-bold py-2 rounded border border-gray-200 transition">
                    View Hospital Profile
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
