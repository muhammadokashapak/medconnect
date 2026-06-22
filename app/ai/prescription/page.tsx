"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Share2, X } from "lucide-react";

export default function AIPrescription() {
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [result, setResult] = useState<string | null>(null);

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
      let fullDescription = `Proposed Medications: ${medications}\n`;
      if (allergies) {
        fullDescription += `Patient Allergies / Conditions: ${allergies}\n`;
      }
      fullDescription += `\nSafety Report:\n${cleanMarkdown(result || "")}`;

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shareData.title,
          description: fullDescription.trim(),
          specialty: shareData.specialty,
          isAnonymous: shareData.isAnonymous,
          type: "AI_PRESCRIPTION"
        })
      });

      if (res.ok) {
        toast.success("Prescription safety check shared to feed successfully!");
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Safety Report</h2>
              {result && (
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Feed
                </button>
              )}
            </div>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Share Safety Check</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
                <p className="text-sm text-indigo-800 text-center">
                  Share this safety check with the community for discussion. Markdown stars will be stripped.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Case Title</label>
                <input 
                  type="text" 
                  value={shareData.title}
                  onChange={(e) => setShareData({...shareData, title: e.target.value})}
                  placeholder="e.g., Lisinopril Interaction Check"
                  className="w-full border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Specialty Tag</label>
                <select 
                  value={shareData.specialty}
                  onChange={(e) => setShareData({...shareData, specialty: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition disabled:opacity-70 flex items-center"
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
