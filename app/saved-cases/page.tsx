"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SavedCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedCases();
  }, []);

  const fetchSavedCases = async () => {
    try {
      const res = await fetch("/api/save-case");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const unsaveCase = async (caseId: string) => {
    try {
      await fetch(`/api/save-case?casePostId=${caseId}`, { method: "DELETE" });
      setCases(prev => prev.filter(c => c.casePostId !== caseId));
    } catch (error) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
            Saved Clinical Cases
          </h1>
          <button onClick={() => router.push("/feed")} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {cases.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
              You haven't saved any cases yet. <Link href="/feed" className="text-indigo-600 font-medium hover:underline">Explore Feed</Link>
            </div>
          ) : (
            cases.map((saved) => (
              <div key={saved.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{saved.casePost.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">By Dr. {saved.casePost.doctor.fullName} • {saved.casePost.specialty}</p>
                  </div>
                  <button onClick={() => unsaveCase(saved.casePostId)} className="text-gray-400 hover:text-red-500" title="Remove from saved">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                  </button>
                </div>
                <p className="text-gray-700 line-clamp-2 mb-4">{saved.casePost.description}</p>
                <Link href={`/case/${saved.casePostId}`} className="text-indigo-600 font-medium hover:underline inline-flex items-center">
                  View Full Case
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
