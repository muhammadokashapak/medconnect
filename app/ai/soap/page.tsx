"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Share2, Brain, X } from "lucide-react";

export default function AISOAP() {
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Patient Selection for Saving
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [saving, setSaving] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ title: "", specialty: "General Practice", isAnonymous: false });
  const [sharingCase, setSharingCase] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    fetch("/api/patients?limit=50")
      .then(r => r.json())
      .then(data => {
        if (data.patients) setPatients(data.patients);
      })
      .catch(console.error);
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

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

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        showFeedback("Copied to clipboard!");
      } catch {
        showFeedback("Failed to copy.");
      }
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId || !result) {
      showFeedback("Please select a patient first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${selectedPatientId}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiefComplaint: "AI SOAP Note Generation",
          history: transcript,
          examination: "Derived from transcript",
          assessment: "SOAP Note: " + result,
          plan: "Pending physician review"
        })
      });
      if (res.ok) {
        showFeedback("Saved to EHR successfully!");
      } else {
        showFeedback("Failed to save to record.");
      }
    } catch {
      showFeedback("Error saving to record.");
    } finally {
      setSaving(false);
    }
  };

  const handleShareCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharingCase(true);
    try {
      const cleanResult = result ? result.replace(/[*#`]/g, '') : '';
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shareData.title,
          specialty: shareData.specialty,
          description: cleanResult,
          isAnonymous: shareData.isAnonymous,
        })
      });
      if (res.ok) {
        showFeedback("Case shared to Community Feed!");
        setShowShareModal(false);
      } else {
        showFeedback("Failed to share case.");
      }
    } catch (err) {
      showFeedback("Error sharing case.");
    } finally {
      setSharingCase(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {feedback}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             AI SOAP Note Generator
          </h1>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
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
              <div className="mt-4 flex flex-col gap-3">
                 <div className="flex gap-2">
                   <select 
                     className="flex-1 border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500"
                     value={selectedPatientId}
                     onChange={e => setSelectedPatientId(e.target.value)}
                   >
                     <option value="">-- Select Patient to Save --</option>
                     {patients.map(p => (
                       <option key={p.id} value={p.id}>{p.fullName} (MRN: {p.mrn})</option>
                     ))}
                   </select>
                   <button disabled={saving} onClick={handleSave} className="bg-indigo-600 border border-indigo-700 text-white py-2 px-4 rounded font-bold text-sm hover:bg-indigo-700 disabled:opacity-50">
                     {saving ? "Saving..." : "Save to EHR"}
                   </button>
                 </div>
                 <div className="flex gap-2 mt-1">
                   <button onClick={handleCopy} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded font-bold text-sm hover:bg-gray-50 transition-colors">Copy</button>
                   <button onClick={() => setShowShareModal(true)} className="flex-1 flex justify-center items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 py-2 rounded font-bold text-sm hover:bg-indigo-100 transition-colors">
                     <Share2 className="w-4 h-4" /> Share to Feed
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Case Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-indigo-600" /> Share as Public Case
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleShareCase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Case Title *</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={shareData.title} onChange={e => setShareData({...shareData, title: e.target.value})} placeholder="e.g. 45M presenting with acute chest pain" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialty Category</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={shareData.specialty} onChange={e => setShareData({...shareData, specialty: e.target.value})}>
                  <option value="General Practice">General Practice</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="anon" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" checked={shareData.isAnonymous} onChange={e => setShareData({...shareData, isAnonymous: e.target.checked})} />
                <label htmlFor="anon" className="text-sm text-gray-700 font-medium">Post Anonymously</label>
              </div>

              <div className="flex gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setShowShareModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={sharingCase} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {sharingCase ? <Brain className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
