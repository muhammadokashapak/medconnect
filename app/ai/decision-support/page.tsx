"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AIDecisionSupportPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [patientData, setPatientData] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query && !patientData) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/decision-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, patientData: patientData ? JSON.parse(patientData) : {} })
      });
      if (res.ok) {
        setResponse(await res.json());
      } else {
        if (res.status === 401) router.push("/login");
        else alert("Failed to get AI response. Ensure Patient Data is valid JSON if provided.");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid JSON in Patient Data or Network Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Clinical Decision Support
          </h1>
          <Link href="/ai" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to AI Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Case Input</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Clinical Query / Context</label>
                <textarea 
                  rows={4}
                  className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Best approach for a 65yo male with new-onset AFib and hypertension..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Patient Data (Optional JSON)</label>
                <textarea 
                  rows={4}
                  className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder='{"age": 65, "gender": "Male", "bp": "150/90", "hr": 110}'
                  value={patientData}
                  onChange={(e) => setPatientData(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || (!query && !patientData)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {loading ? "Analyzing Case..." : "Get AI Recommendations"}
              </button>
            </form>
          </div>

          {/* AI Output */}
          <div>
            {response ? (
              <div className="bg-white p-6 rounded-xl shadow border border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">AI Analysis Report</h2>
                
                <div className="space-y-6">
                  {response.treatmentRecommendations && (
                    <div>
                      <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Treatment Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-800">
                        {response.treatmentRecommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}

                  {response.guidelineSuggestions && (
                    <div>
                      <h3 className="text-sm font-bold text-green-600 uppercase tracking-wide mb-2">Guideline Suggestions</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-800">
                        {response.guidelineSuggestions.map((g: string, i: number) => <li key={i}>{g}</li>)}
                      </ul>
                    </div>
                  )}

                  {response.riskFactorAnalysis && (
                    <div>
                      <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-wide mb-2">Risk Factor Analysis</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-800">
                        {response.riskFactorAnalysis.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}

                  {response.drugInteractionAlerts && (
                    <div>
                      <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-2">Drug Interaction Alerts</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-800">
                        {response.drugInteractionAlerts.map((d: string, i: number) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center p-10 h-full text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h3 className="text-gray-500 font-medium">Awaiting Case Input...</h3>
                <p className="text-sm text-gray-400 mt-2">Submit clinical data to receive AI-powered decision support, guidelines, and interaction checks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
