"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DrugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [drug, setDrug] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/drugs/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setDrug)
      .catch(() => router.push("/drugs"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/drugs" className="text-green-600 font-bold hover:underline flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>Back to Drugs</Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow border border-gray-100">
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{drug.name}</h1>
            <p className="text-xl font-mono text-green-700">{drug.genericName}</p>
          </div>

          <div className="space-y-6">
            <section className="bg-blue-50 p-5 rounded-lg border border-blue-100">
              <h2 className="text-lg font-bold text-blue-900 flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Indications & Usage
              </h2>
              <p className="text-gray-800 leading-relaxed">{drug.indications}</p>
            </section>

            <section className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
              <h2 className="text-lg font-bold text-yellow-900 flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Dosage & Administration
              </h2>
              <p className="text-gray-800 leading-relaxed font-mono">{drug.dosage}</p>
            </section>

            <section className="bg-red-50 p-5 rounded-lg border border-red-100">
              <h2 className="text-lg font-bold text-red-900 flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Contraindications
              </h2>
              <p className="text-gray-800 leading-relaxed">{drug.contraindications}</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Adverse Reactions / Side Effects</h2>
                <p className="text-gray-700 leading-relaxed">{drug.sideEffects}</p>
              </section>

              <section className="p-5 rounded-lg border border-orange-200 bg-orange-50">
                <h2 className="text-lg font-bold text-orange-900 mb-2">Drug Interactions</h2>
                <p className="text-gray-800 leading-relaxed">{drug.interactions}</p>
              </section>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
             <Link href={`/drug-interaction?drug=${drug.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition shadow">
               Check Interactions for {drug.name}
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
