"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Share2, X } from "lucide-react";

export default function SummarizeCasePage() {
  const router = useRouter();
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string>("");
  const [caseText, setCaseText] = useState("");

  // Share to Feed States
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    title: "",
    specialty: "General Medicine",
    isAnonymous: false
  });
  const [sharingCase, setSharingCase] = useState(false);

  const cleanMarkdown = (text: string) => {
    if (!text) return "";
    return text.replace(/[*_~`#]/g, '').trim();
  };

  const handleShareCase = async () => {
    if (!shareData.title) {
      toast.error("Please enter a title for your case");
      return;
    }

    setSharingCase(true);
    try {
      // Construct a clean description without markdown stars
      let fullDescription = `Original Notes:\n${caseText}\n\n`;
      fullDescription += `AI Summary:\n${cleanMarkdown(result)}`;

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shareData.title,
          description: fullDescription.trim(),
          specialty: shareData.specialty,
          isAnonymous: shareData.isAnonymous,
          type: "AI_SUMMARIZE"
        })
      });

      if (res.ok) {
        toast.success("Case summary shared to feed successfully!");
        setShowShareModal(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to share case");
      }
    } catch (err) {
      toast.error("An error occurred while sharing.");
    } finally {
      setSharingCase(false);
    }
  };

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
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>Back to Homepage</button>

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
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 bg-purple-100 px-3 py-1.5 rounded-lg transition"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Feed
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success("Copied to clipboard!");
                  }}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Copy
                </button>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">{result}</p>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Share Case Summary</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-4">
                <p className="text-sm text-purple-800 text-center">
                  Share this AI summary with the community for discussion. Markdown stars will be stripped.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Case Title</label>
                <input 
                  type="text" 
                  value={shareData.title}
                  onChange={(e) => setShareData({...shareData, title: e.target.value})}
                  placeholder="e.g., 65yo Male with AFib Summary"
                  className="w-full border-gray-300 rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Specialty Tag</label>
                <select 
                  value={shareData.specialty}
                  onChange={(e) => setShareData({...shareData, specialty: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option>General Medicine</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Pediatrics</option>
                  <option>Oncology</option>
                  <option>Emergency Medicine</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="anonymous"
                  checked={shareData.isAnonymous}
                  onChange={(e) => setShareData({...shareData, isAnonymous: e.target.checked})}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700 font-medium">Post Anonymously</label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
              <button 
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleShareCase}
                disabled={sharingCase}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition disabled:opacity-70 flex items-center"
              >
                {sharingCase ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Sharing...
                  </>
                ) : "Share to Feed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
