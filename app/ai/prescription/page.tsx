"use client";

import { useState } from "react";
import Link from "next/link";

export default function AIPrescription() {
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications, allergies })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.response);
      } else {
        setResult("Error generating safety check.");
      }
    } catch (err) {
      setResult("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
             AI Prescription Assistant
          </h1>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Check Input</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Proposed Medications</label>
                <textarea 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  rows={4}
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Lisinopril 10mg, Spironolactone 25mg"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Patient Allergies / Conditions</label>
                <textarea 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  rows={3}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Asthma, Penicillin allergy"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {loading ? "Checking..." : "Run Safety Check"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Report</h2>
            <div className="flex-grow bg-gray-50 rounded-lg border border-gray-200 p-4 whitespace-pre-wrap text-sm text-gray-700 overflow-y-auto">
              {result ? (
                <div>{result}</div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-center">
                  Enter medications and click Run to check for drug-drug interactions and contraindications.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
