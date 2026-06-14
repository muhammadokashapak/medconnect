"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DrugsPage() {
  const router = useRouter();
  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/drugs?";
    if (query) url += `query=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Unauthorized");
      setDrugs(await res.json());
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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            Drug Database
          </h1>
          <div className="flex gap-4">
            <Link href="/drug-interaction" className="text-sm font-bold bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition">
              Interaction Checker
            </Link>
            <button onClick={() => router.push("/feed")} className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Search drugs by name, generic name, or indications..." 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-green-500 focus:border-green-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drugs.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-500 text-lg">No drugs found matching your criteria.</p>
              </div>
            ) : (
              drugs.map(drug => (
                <div key={drug.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between hover:border-green-300 transition">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight flex items-center">
                      {drug.name}
                    </h2>
                    <p className="text-green-700 text-sm font-mono mb-3">{drug.genericName}</p>
                    
                    <div className="mb-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Indications</span>
                      <p className="text-gray-700 text-sm line-clamp-2">{drug.indications}</p>
                    </div>
                  </div>
                  <Link href={`/drugs/${drug.id}`} className="text-green-600 font-bold text-sm hover:underline flex items-center mt-2">
                    View Full Details <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
