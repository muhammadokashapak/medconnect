"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function DrugInteractionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDrugId = searchParams?.get("drug") || null;

  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(initialDrugId ? [initialDrugId] : []);
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<any[] | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch("/api/drugs")
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setDrugs)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  const toggleDrug = (id: string) => {
    if (selectedDrugs.includes(id)) {
      setSelectedDrugs(selectedDrugs.filter(d => d !== id));
    } else {
      setSelectedDrugs([...selectedDrugs, id]);
    }
    setInteractions(null);
  };

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return;
    setChecking(true);
    try {
      const res = await fetch("/api/drug-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugIds: selectedDrugs })
      });
      if (res.ok) {
        const data = await res.json();
        setInteractions(data.interactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Drug Interaction Checker
          </h1>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow border border-gray-100 h-fit max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Drugs to Check</h2>
            <p className="text-sm text-gray-500 mb-4">Choose at least two drugs from the database below.</p>
            
            <div className="space-y-2">
              {drugs.map(drug => (
                <label key={drug.id} className={`flex items-center p-3 rounded border cursor-pointer transition ${selectedDrugs.includes(drug.id) ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50 border-gray-100'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                    checked={selectedDrugs.includes(drug.id)}
                    onChange={() => toggleDrug(drug.id)}
                  />
                  <span className="ml-3 font-medium text-gray-800">{drug.name}</span>
                </label>
              ))}
            </div>

            <button 
              onClick={checkInteractions}
              disabled={selectedDrugs.length < 2 || checking}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3 px-4 rounded-lg transition flex justify-center items-center"
            >
              {checking ? <span className="animate-pulse">Checking...</span> : "Check Interactions"}
            </button>
          </div>

          <div className="md:col-span-2">
            {interactions === null ? (
              <div className="bg-white p-10 rounded-xl shadow border border-gray-100 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Results Yet</h3>
                <p className="text-gray-500 max-w-sm">Select multiple medications from the list and click "Check Interactions" to see potential risks.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Report</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedDrugs.map(id => {
                      const d = drugs.find(x => x.id === id);
                      return <span key={id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded font-medium text-sm">{d?.name}</span>
                    })}
                  </div>

                  <div className="space-y-4">
                    {interactions.map((interaction, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${
                        interaction.severity === 'Severe' ? 'bg-red-50 border-red-200' :
                        interaction.severity === 'Moderate' ? 'bg-orange-50 border-orange-200' :
                        interaction.severity === 'Minor' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          <span className={`font-bold text-sm px-2 py-1 rounded uppercase tracking-wide mr-3 ${
                            interaction.severity === 'Severe' ? 'bg-red-200 text-red-800' :
                            interaction.severity === 'Moderate' ? 'bg-orange-200 text-orange-800' :
                            interaction.severity === 'Minor' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {interaction.severity}
                          </span>
                          <span className="font-bold text-gray-800">{interaction.drugs.join(" + ")}</span>
                        </div>
                        <p className="text-gray-700">{interaction.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DrugInteractionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DrugInteractionContent />
    </Suspense>
  );
}
