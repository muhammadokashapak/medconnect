"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConsultationsPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/consultations");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/login");
        return;
      }
      setConsultations(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/feed" className="text-indigo-600 font-bold hover:underline flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>Back to Homepage
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Consultation Notes</h1>

        {consultations.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold text-gray-700">No consultations found.</h2>
            <p className="text-gray-500 mt-2">You don't have any saved consultation notes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {consultations.map((cons) => (
              <div key={cons.id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-indigo-700">
                      Consultation: Dr. {cons.appointment.doctor.fullName} & Dr. {cons.appointment.consultant.fullName}
                    </h2>
                    <p className="text-sm text-gray-500">{new Date(cons.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                    {(() => { const d = cons.duration; const mins = Math.floor(d / 60); const secs = d % 60; return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`; })()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-1">Diagnosis</h3>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-100 min-h-[60px]">
                      {cons.diagnosis || "No diagnosis provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-1">Recommendations</h3>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-100 min-h-[60px]">
                      {cons.recommendations || "No recommendations provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-1">Treatment Plan</h3>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-100 min-h-[60px]">
                      {cons.treatmentPlan || "No treatment plan provided"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
