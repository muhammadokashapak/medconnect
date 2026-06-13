"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setPatient)
      .catch(() => router.push("/patients"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !patient) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/patients" className="text-blue-600 font-bold hover:underline flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Patients
          </Link>
          <div className="space-x-3">
             <button className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm text-sm hover:bg-gray-50">
               Edit Demographics
             </button>
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm text-sm">
               + New Clinical Visit
             </button>
          </div>
        </div>

        {/* Patient Header */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl shadow-sm flex-shrink-0">
               {patient.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{patient.fullName}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-600 font-medium">
                 <span>MRN: <span className="font-mono text-gray-900">{patient.mrn}</span></span>
                 <span>{patient.gender}, {age} yrs</span>
                 <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                 {patient.bloodGroup && <span className="text-red-600 font-bold">Blood: {patient.bloodGroup}</span>}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
             <p className="flex items-center text-gray-700 mb-1">
               <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
               {patient.phone || "No phone provided"}
             </p>
             <p className="flex items-center text-gray-700">
               <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
               CNIC: {patient.cnic || "Not provided"}
             </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - History & Allergies */}
          <div className="space-y-6">
            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
               <h3 className="text-red-800 font-bold flex items-center mb-3">
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 Allergies
               </h3>
               {patient.allergies.length === 0 ? (
                 <p className="text-sm text-red-600/70">No known allergies.</p>
               ) : (
                 <ul className="space-y-2">
                   {patient.allergies.map((a: any) => (
                     <li key={a.id} className="bg-white px-3 py-2 rounded shadow-sm border border-red-100 text-sm flex justify-between">
                       <span className="font-bold text-red-900">{a.allergen}</span>
                       <span className="text-red-500 text-xs">{a.severity}</span>
                     </li>
                   ))}
                 </ul>
               )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Medical History</h3>
              {patient.medicalHistory ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-bold tracking-wide">Chronic Diseases</span>
                    <p className="text-gray-800 mt-1">{patient.medicalHistory.chronicDiseases || "None"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-bold tracking-wide">Surgeries</span>
                    <p className="text-gray-800 mt-1">{patient.medicalHistory.surgeries || "None"}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-bold tracking-wide">Social History</span>
                    <p className="text-gray-800 mt-1">
                      Smoking: {patient.medicalHistory.smokingStatus || "Unknown"} <br/>
                      Alcohol: {patient.medicalHistory.alcoholUse || "Unknown"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">History not recorded yet.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center justify-between">
                Current Medications
                <button className="text-blue-600 hover:underline text-xs">+ Add</button>
              </h3>
              {patient.medications.length === 0 ? (
                 <p className="text-sm text-gray-500">No active medications.</p>
               ) : (
                 <ul className="space-y-3">
                   {patient.medications.map((m: any) => (
                     <li key={m.id} className="bg-blue-50/50 p-3 rounded border border-blue-100 text-sm">
                       <div className="font-bold text-blue-900">{m.name}</div>
                       <div className="text-gray-600 text-xs mt-1">{m.dosage} • {m.frequency}</div>
                     </li>
                   ))}
                 </ul>
               )}
            </div>
          </div>

          {/* Right Column - Timeline & Encounters */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vitals Snapshot */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-4 flex justify-between items-center">
                Latest Vitals
                {patient.vitalSigns[0] && <span className="text-xs text-gray-500 font-normal">Recorded: {new Date(patient.vitalSigns[0].recordedAt).toLocaleDateString()}</span>}
              </h3>
              {patient.vitalSigns.length === 0 ? (
                <p className="text-sm text-gray-500">No vitals recorded.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                     <span className="block text-xs text-gray-500 mb-1">Blood Pressure</span>
                     <span className="font-bold text-lg text-gray-900">{patient.vitalSigns[0].bp || "--"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                     <span className="block text-xs text-gray-500 mb-1">Heart Rate</span>
                     <span className="font-bold text-lg text-gray-900">{patient.vitalSigns[0].pulse || "--"} <span className="text-xs text-gray-400 font-normal">bpm</span></span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                     <span className="block text-xs text-gray-500 mb-1">Temperature</span>
                     <span className="font-bold text-lg text-gray-900">{patient.vitalSigns[0].temperature || "--"} <span className="text-xs text-gray-400 font-normal">°F</span></span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                     <span className="block text-xs text-gray-500 mb-1">Weight</span>
                     <span className="font-bold text-lg text-gray-900">{patient.vitalSigns[0].weight || "--"} <span className="text-xs text-gray-400 font-normal">kg</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Visits Timeline */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="font-bold text-gray-900 border-b pb-4 mb-6">Clinical Visits Timeline</h3>
              {patient.clinicalVisits.length === 0 ? (
                <p className="text-sm text-gray-500">No clinical visits recorded.</p>
              ) : (
                <div className="relative border-l-2 border-blue-200 ml-3 space-y-8">
                  {patient.clinicalVisits.map((visit: any) => (
                    <div key={visit.id} className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-[9px] top-1 border-4 border-white"></div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                         <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-gray-900">{new Date(visit.visitedAt).toLocaleDateString()}</h4>
                           <span className="text-xs text-gray-500 font-medium">Dr. {visit.doctor.fullName}</span>
                         </div>
                         <div className="text-sm space-y-2 mt-3">
                           <div>
                             <span className="font-bold text-gray-700">Chief Complaint:</span>
                             <p className="text-gray-600 mt-1">{visit.chiefComplaint}</p>
                           </div>
                           {visit.assessment && (
                             <div>
                               <span className="font-bold text-gray-700">Assessment:</span>
                               <p className="text-gray-600 mt-1">{visit.assessment}</p>
                             </div>
                           )}
                           {visit.plan && (
                             <div>
                               <span className="font-bold text-gray-700">Plan:</span>
                               <p className="text-gray-600 mt-1">{visit.plan}</p>
                             </div>
                           )}
                         </div>
                         <div className="mt-4 pt-3 border-t border-gray-200 flex gap-3">
                           <button className="text-blue-600 hover:text-blue-800 text-xs font-bold">View Full Record</button>
                           <button className="text-blue-600 hover:text-blue-800 text-xs font-bold">Print Summary</button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
