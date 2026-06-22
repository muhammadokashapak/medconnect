"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brain, Stethoscope, Activity, FileText, ClipboardList, UserPlus, Share2, Save, Copy, X } from "lucide-react";

export default function AIDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [labs, setLabs] = useState("");
  const [vitals, setVitals] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Patient Selection
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [saving, setSaving] = useState(false);

  // Modals
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({ fullName: "", gender: "Male", dob: "", phone: "" });
  const [creatingPatient, setCreatingPatient] = useState(false);

  // Share Case Form State
  const [shareData, setShareData] = useState({ title: "", specialty: "General Practice", isAnonymous: false });
  const [sharingCase, setSharingCase] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    fetch("/api/patients?limit=50")
      .then(r => r.json())
      .then(data => {
        if (data.data) setPatients(data.data); // Fixed data.patients to data.data based on API response
      })
      .catch(console.error);
  };

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
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
        showFeedbackMsg("Copied to clipboard!");
      } catch {
        showFeedbackMsg("Failed to copy.");
      }
    }
  };

  const handleSaveToPatient = async () => {
    if (!selectedPatientId || !result) {
      showFeedbackMsg("Please select a patient first.");
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
          assessment: "AI Diagnosis: \n" + result,
          plan: "Pending physician review"
        })
      });
      if (res.ok) {
        showFeedbackMsg("Saved to patient record successfully!");
      } else {
        showFeedbackMsg("Failed to save to record.");
      }
    } catch {
      showFeedbackMsg("Error saving to record.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPatient(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient)
      });
      const data = await res.json();
      if (res.ok) {
        showFeedbackMsg("Patient created successfully!");
        setShowPatientModal(false);
        fetchPatients();
        setSelectedPatientId(data.id); // Auto-select the newly created patient
      } else {
        showFeedbackMsg("Failed to create patient.");
      }
    } catch {
      showFeedbackMsg("Error creating patient.");
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleShareCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharingCase(true);
    try {
      const description = `**Symptoms/Complaint:**\n${symptoms}\n\n**History:**\n${history}\n\n**Vitals:**\n${vitals}\n\n**Labs:**\n${labs}\n\n**AI Diagnosis Suggestion:**\n${result}`;
      
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shareData.title,
          specialty: shareData.specialty,
          description: description,
          isAnonymous: shareData.isAnonymous,
          privacy: "PUBLIC"
        })
      });
      if (res.ok) {
        showFeedbackMsg("Case shared to Community Feed!");
        setShowShareModal(false);
      } else {
        showFeedbackMsg("Failed to share case.");
      }
    } catch {
      showFeedbackMsg("Error sharing case.");
    } finally {
      setSharingCase(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium animate-pulse flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          {feedback}
        </div>
      )}

      {/* Create Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> Add New Patient
              </h3>
              <button onClick={() => setShowPatientModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={newPatient.fullName} onChange={e => setNewPatient({...newPatient, fullName: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={newPatient.dob} onChange={e => setNewPatient({...newPatient, dob: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone (Optional)</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} placeholder="+92 300 1234567" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPatientModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={creatingPatient} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {creatingPatient ? <Brain className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Case Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" /> Share as Public Case
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleShareCase} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-2">This will publish the symptoms and AI diagnosis to the community feed for other doctors to review.</p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Case Title</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={shareData.title} onChange={e => setShareData({...shareData, title: e.target.value})} placeholder="e.g. 45M presenting with acute chest pain" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Specialty</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={shareData.specialty} onChange={e => setShareData({...shareData, specialty: e.target.value})}>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>General Practice</option>
                  <option>Pediatrics</option>
                  <option>Dermatology</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="anon" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" checked={shareData.isAnonymous} onChange={e => setShareData({...shareData, isAnonymous: e.target.checked})} />
                <label htmlFor="anon" className="text-sm font-medium text-gray-700">Post Anonymously</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowShareModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={sharingCase} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {sharingCase ? <Brain className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
               <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                 <Brain className="w-8 h-8" />
               </div>
               AI Diagnostic Assistant
            </h1>
            <p className="mt-1 text-sm text-gray-500">Enter patient presentation to get an AI-powered differential diagnosis.</p>
          </div>
          <Link href="/feed" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Back to Homepage</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden h-fit">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">Clinical Presentation</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <ClipboardList className="w-4 h-4 text-gray-400" /> Chief Complaint & Symptoms
                </label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner bg-gray-50/50 placeholder-gray-400" 
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. 45yo male with severe crushing chest pain radiating to left arm..."
                  required
                ></textarea>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" /> Medical History
                </label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner bg-gray-50/50 placeholder-gray-400" 
                  rows={2}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="e.g. History of Hypertension, Type 2 Diabetes..."
                ></textarea>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <Activity className="w-4 h-4 text-gray-400" /> Vitals & Examination
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner bg-gray-50/50 placeholder-gray-400" 
                  value={vitals}
                  onChange={(e) => setVitals(e.target.value)}
                  placeholder="e.g. BP 160/95, HR 110, Temp 98.6F"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" /> Recent Labs / Imaging
                </label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner bg-gray-50/50 placeholder-gray-400" 
                  rows={2}
                  value={labs}
                  onChange={(e) => setLabs(e.target.value)}
                  placeholder="e.g. Elevated Troponin, Normal ECG..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !symptoms}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <><Brain className="w-5 h-5 animate-pulse" /> Analyzing Case...</>
                ) : (
                  <><Brain className="w-5 h-5" /> Generate Diagnosis</>
                )}
              </button>
            </form>
          </div>

          {/* AI Result Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 flex flex-col h-full min-h-[600px] overflow-hidden">
             <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-indigo-50/50">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-indigo-900">AI Differential Diagnosis</h2>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto bg-gray-50/30">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-indigo-400">
                  <div className="relative">
                    <Brain className="w-16 h-16 animate-bounce" />
                    <div className="absolute inset-0 border-4 border-indigo-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <p className="font-semibold animate-pulse">Running advanced diagnostic algorithms...</p>
                </div>
              ) : result ? (
                <div className="prose prose-sm md:prose-base prose-indigo max-w-none text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
                  <Stethoscope className="w-16 h-16 opacity-20" />
                  <p className="max-w-xs">Enter clinical presentation on the left and click generate to receive an AI-assisted differential diagnosis.</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-4">
               {/* Patient Saving */}
               <div className="flex flex-col sm:flex-row gap-3">
                 <div className="flex-1 flex gap-2">
                   <select 
                     className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                     value={selectedPatientId}
                     onChange={e => setSelectedPatientId(e.target.value)}
                   >
                     <option value="">-- Select Patient to Save To --</option>
                     {patients.map(p => (
                       <option key={p.id} value={p.id}>{p.fullName} (MRN: {p.mrn})</option>
                     ))}
                   </select>
                   <button 
                     type="button"
                     onClick={() => setShowPatientModal(true)}
                     className="bg-gray-100 text-gray-700 p-2.5 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors flex items-center justify-center group"
                     title="Create New Patient"
                   >
                     <UserPlus className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                   </button>
                 </div>
                 
                 <button 
                   disabled={saving || !result} 
                   onClick={handleSaveToPatient} 
                   className="bg-indigo-600 text-white py-2.5 px-5 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                 >
                   {saving ? <Brain className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save to Record
                 </button>
               </div>

               {/* Auxiliary Actions */}
               <div className="flex gap-3">
                 <button 
                   disabled={!result}
                   onClick={() => setShowShareModal(true)} 
                   className="flex-1 bg-white border border-indigo-200 text-indigo-700 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2"
                 >
                   <Share2 className="w-4 h-4" /> Share as Case
                 </button>
                 <button 
                   disabled={!result}
                   onClick={handleCopy} 
                   className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   <Copy className="w-4 h-4" /> Copy Text
                 </button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
