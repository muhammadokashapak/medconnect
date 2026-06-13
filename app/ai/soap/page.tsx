"use client";

import { useState } from "react";
import Link from "next/link";

export default function AISOAP() {
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.response);
      } else {
        setResult("Error generating SOAP note.");
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
             <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             AI SOAP Note Generator
          </h1>
          <Link href="/ai" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to AI Hub
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Input Data</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Transcript or Raw Notes</label>
                <textarea 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  rows={10}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste raw visit notes, dictation, or conversation transcript here..."
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {loading ? "Generating..." : "Generate SOAP Note"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Structured Output</h2>
            <div className="flex-grow bg-gray-50 rounded-lg border border-gray-200 p-4 whitespace-pre-wrap text-sm text-gray-700 overflow-y-auto">
              {result ? (
                <div>{result}</div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-center">
                  Paste transcript and click Generate to see the structured SOAP note.
                </div>
              )}
            </div>
            {result && (
              <div className="mt-4 flex gap-2">
                 <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded font-bold text-sm hover:bg-gray-50">Save to EHR</button>
                 <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded font-bold text-sm hover:bg-gray-50">Copy</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
