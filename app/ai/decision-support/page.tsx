"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Share2, X } from "lucide-react";

export default function AIDecisionSupportPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [patientData, setPatientData] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Share to Feed States
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    title: "",
    specialty: "General Medicine",
    isAnonymous: false
  });
  const [sharingCase, setSharingCase] = useState(false);

  const cleanMarkdown = (text: string) => {
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
      let fullDescription = `Query / Context: ${cleanMarkdown(query)}\n\n`;
      
      if (response) {
        if (response.treatmentRecommendations) {
          fullDescription += `Treatment Recommendations:\n${response.treatmentRecommendations.map((r: string) => "- " + cleanMarkdown(r)).join('\n')}\n\n`;
        }
        if (response.guidelineSuggestions) {
          fullDescription += `Guideline Suggestions:\n${response.guidelineSuggestions.map((g: string) => "- " + cleanMarkdown(g)).join('\n')}\n\n`;
        }
        if (response.riskFactorAnalysis) {
          fullDescription += `Risk Factor Analysis:\n${response.riskFactorAnalysis.map((r: string) => "- " + cleanMarkdown(r)).join('\n')}\n\n`;
        }
        if (response.drugInteractionAlerts) {
          fullDescription += `Drug Interaction Alerts:\n${response.drugInteractionAlerts.map((d: string) => "- " + cleanMarkdown(d)).join('\n')}\n\n`;
        }
      }

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shareData.title,
          description: fullDescription.trim(),
          specialty: shareData.specialty,
          isAnonymous: shareData.isAnonymous,
          type: "AI_DECISION_SUPPORT"
        })
      });

      if (res.ok) {
        toast.success("Case shared to feed successfully!");
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
        else toast.error("Failed to get AI response. Ensure Patient Data is valid JSON if provided.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid JSON in Patient Data or Network Error.");
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
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
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
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                  <h2 className="text-xl font-bold text-gray-900">AI Analysis Report</h2>
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share to Feed
                  </button>
                </div>
                
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Share as Case Study</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                <p className="text-sm text-blue-800 text-center">
                  Share this AI analysis with the MedConnect community for discussion. Markdown stars will be stripped.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Case Title</label>
                <input 
                  type="text" 
                  value={shareData.title}
                  onChange={(e) => setShareData({...shareData, title: e.target.value})}
                  placeholder="e.g., AFib with Hypertension Management"
                  className="w-full border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Specialty Tag</label>
                <select 
                  value={shareData.specialty}
                  onChange={(e) => setShareData({...shareData, specialty: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-70 flex items-center"
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
