"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GuidelinesPage() {
  const router = useRouter();
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");

  const specialties = [
    "All", "Cardiology", "Neurology", "Pulmonology", "Endocrinology", "Gastroenterology",
    "Dermatology", "Orthopedics", "Pediatrics", "Gynecology",
    "Psychiatry", "Emergency Medicine"
  ];

  useEffect(() => {
    fetchData();
  }, [specialty]);

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/guidelines?";
    if (query) url += `query=${encodeURIComponent(query)}&`;
    if (specialty && specialty !== "All") url += `specialty=${encodeURIComponent(specialty)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Unauthorized");
      let data = await res.json();
      if (!specialty || specialty === "All") {
        data = [...data].sort((a: any, b: any) => a.title.localeCompare(b.title));
      }
      setGuidelines(data);
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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-6">
            <button onClick={() => router.push("/feed")} className="text-sm font-medium text-indigo-200 hover:text-white flex items-center transition">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Home
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Clinical Guidelines
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 max-w-2xl">
            Evidence-based medical protocols and standard operating procedures for healthcare professionals.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-indigo-100/40 border border-indigo-50 mb-8 flex flex-col gap-2 relative z-20">
          <div className="flex-grow flex items-center bg-gray-50/80 hover:bg-gray-50 transition-colors rounded-xl px-5 py-2 border border-gray-100 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
            <svg className="w-6 h-6 text-indigo-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search by keyword, disease, or protocol..." 
              className="w-full bg-transparent border-none py-3 focus:ring-0 text-gray-800 placeholder-gray-400 font-medium text-lg outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e as any)}
            />
            <button onClick={handleSearch} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ml-3">
              Search
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-10 pb-2 relative z-20">
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => {
                setSpecialty(spec);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                (specialty === spec || (spec === "All" && !specialty))
                  ? "bg-indigo-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-sm"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidelines.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">No Guidelines Found</h3>
                <p className="text-gray-500">We couldn't find any guidelines matching your criteria.</p>
              </div>
            ) : (
              guidelines.map(g => (
                <Link href={`/guidelines/${g.id}`} key={g.id} className="group bg-white p-6 rounded-2xl shadow-md shadow-gray-200/50 border border-gray-100 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-200/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border border-indigo-100 shadow-sm">
                        {g.specialty}
                      </span>
                      <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2.5 py-1 rounded-md">v{g.version}</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">{g.title}</h2>
                    <p className="text-gray-500 text-[15px] mb-6 line-clamp-3 leading-relaxed">{g.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                    <p className="text-[13px] text-indigo-600 flex items-center font-bold">
                      <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                      Verified Protocol
                    </p>
                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-sm">
                      <svg className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
