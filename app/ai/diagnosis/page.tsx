"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AIDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [labs, setLabs] = useState("");
  const [vitals, setVitals] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Patient Selection for Saving
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [saving, setSaving] = useState(false);

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
      const res = await fetch("/api/ai/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, history, labs, vitals })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.response);
      } else {
        setResult("Error generating diagnosis.");
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
          chiefComplaint: symptoms,
          history: history,
          examination: vitals + "\n" + labs,
          assessment: "AI Diagnosis: " + result,
          plan: "Pending physician review"
        })
      });
      if (res.ok) {
        showFeedback("Saved to patient record successfully!");
      } else {
        showFeedback("Failed to save to record.");
      }
    } catch {
      showFeedback("Error saving to record.");
    } finally {
      setSaving(false);
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
             <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             AI Diagnostic Assistant
          </h1>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Data Input</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Chief Complaint & Symptoms</label>
                <textarea 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. 45yo male with severe chest pain..."
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Medical History</label>
                <textarea 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  rows={2}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Recent Labs / Imaging</label>
                <textarea 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  rows={2}
                  value={labs}
                  onChange={(e) => setLabs(e.target.value)}
                  placeholder="e.g. Elevated Troponin..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vitals</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  value={vitals}
                  onChange={(e) => setVitals(e.target.value)}
                  placeholder="e.g. BP 160/95, HR 110"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {loading ? "Analyzing..." : "Generate Differential Diagnosis"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
            <div className="flex-grow bg-gray-50 rounded-lg border border-gray-200 p-4 whitespace-pre-wrap text-sm text-gray-700 overflow-y-auto">
              {result ? (
                <div>{result}</div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-center">
                  Enter patient details and click Generate to see the AI's differential diagnosis and recommendations.
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
                     {saving ? "Saving..." : "Save Record"}
                   </button>
                 </div>
                 <button onClick={handleCopy} className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded font-bold text-sm hover:bg-gray-50">Copy to Clipboard</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
