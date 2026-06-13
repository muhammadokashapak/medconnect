"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          throw new Error("Failed to fetch search results");
        }
        return res.json();
      })
      .then(data => {
        setResults(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
        <p className="text-gray-600 mb-8">Showing results for "{query}"</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">No doctors found</h2>
            <p className="text-gray-500">We couldn't find anyone matching "{query}". Try searching by name, specialty, or hospital.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {results.map((doctor) => (
              <Link key={doctor.id} href={`/doctor/${doctor.id}`} className="block p-6 hover:bg-gray-50 transition group">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200">
                    {doctor.profileImage ? (
                      <img src={doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-full h-full text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                  </div>
                  <div className="ml-5 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition flex items-center">
                      Dr. {doctor.fullName}
                      {doctor.isVerified && <svg className="w-5 h-5 text-blue-500 ml-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </h3>
                    <p className="text-gray-600 font-medium text-sm mt-0.5">{doctor.specialization || "General Medicine"}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-4">
                      {doctor.hospital && <span className="flex items-center"><span className="mr-1">🏥</span> {doctor.hospital}</span>}
                      {doctor.city && <span className="flex items-center"><span className="mr-1">📍</span> {doctor.city}</span>}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <button className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">View Profile</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
