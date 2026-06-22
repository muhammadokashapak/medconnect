"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, Brain, X } from "lucide-react";

export default function AnalyzeCasePage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ title: "", specialty: "Internal Medicine", isAnonymous: false });
  const [sharingCase, setSharingCase] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [formData, setFormData] = useState({
    symptoms: "",
    history: "",
    age: "",
    gender: "",
    labResults: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/analyze-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to analyze case");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShareCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharingCase(true);
    try {
      let content = `Symptoms: ${formData.symptoms}\nHistory: ${formData.history || 'N/A'}\nAge/Gender: ${formData.age} ${formData.gender}\n\n`;
      if (result.possibleDiagnoses?.length) content += `Possible Diagnoses:\n${result.possibleDiagnoses.join('\n')}\n\n`;
      if (result.differentialDiagnoses?.length) content += `Differential Diagnoses:\n${result.differentialDiagnoses.join('\n')}\n\n`;
      if (result.redFlags?.length) content += `Red Flags: ${result.redFlags.join(', ')}\n\n`;
      if (result.recommendedTests?.length) content += `Recommended Tests:\n${result.recommendedTests.join('\n')}\n\n`;
      if (result.specialistReferral) content += `Specialist Referral: ${result.specialistReferral}`;

      const cleanResult = content.replace(/[*#`]/g, '');

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
        setFeedbackMsg("Case shared to Community Feed!");
        setShowShareModal(false);
        setTimeout(() => setFeedbackMsg(""), 3000);
      } else {
        setFeedbackMsg("Failed to share case.");
        setTimeout(() => setFeedbackMsg(""), 3000);
      }
    } catch (err) {
      setFeedbackMsg("Error sharing case.");
      setTimeout(() => setFeedbackMsg(""), 3000);
    } finally {
      setSharingCase(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/ai")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>Back to Homepage</button>

        <div className="bg-white rounded-xl shadow p-6 md:p-8 mb-8 border-t-4 border-blue-500">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Case Analysis</h1>
          <p className="text-gray-600 mb-8">Enter patient details below to receive AI-generated differential diagnoses.</p>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}
          {feedbackMsg && <div className="bg-green-50 text-green-700 p-4 rounded mb-6 border border-green-200 text-center font-medium">{feedbackMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  required
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Symptoms *</label>
              <textarea
                required
                rows={3}
                value={formData.symptoms}
                onChange={e => setFormData({...formData, symptoms: e.target.value})}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Describe the main symptoms..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
              <textarea
                rows={2}
                value={formData.history}
                onChange={e => setFormData({...formData, history: e.target.value})}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Any relevant past medical history..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lab Results / Vitals</label>
              <textarea
                rows={2}
                value={formData.labResults}
                onChange={e => setFormData({...formData, labResults: e.target.value})}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="BP, HR, or relevant lab values..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analyzing Case...
                </>
              ) : "Analyze Case"}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow overflow-hidden animate-fade-in-up">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-900">AI Analysis Report</h2>
              <button 
                onClick={() => setShowShareModal(true)} 
                className="flex items-center text-sm font-semibold bg-white text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-50 transition border border-indigo-100"
              >
                <Share2 className="w-4 h-4 mr-1.5" /> Share as Case
              </button>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Possible Diagnoses
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {result.possibleDiagnoses?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                  Differential Diagnoses
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {result.differentialDiagnoses?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>

              {result.redFlags && result.redFlags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Red Flags Detected
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-red-700">
                    {result.redFlags.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Recommended Tests</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {result.recommendedTests?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Specialist Referral</h3>
                  <p className="text-gray-700">{result.specialistReferral}</p>
                </div>
              </div>

            </div>
          </div>
        )}
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
