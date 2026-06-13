"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SummarizeCasePage() {
  const router = useRouter();
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string>("");
  const [caseText, setCaseText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseText.trim()) return;

    setSummarizing(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to summarize case");

      setResult(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/ai")}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition font-medium"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to AI Assistant
        </button>

        <div className="bg-white rounded-xl shadow p-6 md:p-8 mb-8 border-t-4 border-purple-500">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Case Summarizer</h1>
          <p className="text-gray-600 mb-8">Paste long, unstructured clinical notes below to generate a concise summary.</p>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes / Case Description *</label>
              <textarea
                required
                rows={10}
                value={caseText}
                onChange={e => setCaseText(e.target.value)}
                className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm leading-relaxed"
                placeholder="Patient presented with 3-day history of... Labs showed... Imaging revealed..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={summarizing || !caseText.trim()}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-purple-700 transition disabled:opacity-50 flex justify-center items-center"
            >
              {summarizing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating Summary...
                </>
              ) : "Summarize"}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow overflow-hidden animate-fade-in-up">
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-purple-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                AI Summary
              </h2>
              <button 
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Copy
              </button>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">{result}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
