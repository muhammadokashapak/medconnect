"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/login");
        throw new Error("Unauthorized");
      }
      setQueue(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (tokenId: string, status: string) => {
    try {
      await fetch("/api/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, status })
      });
      fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const inConsultation = queue.find(q => q.status === "IN_CONSULTATION");
  const waitingList = queue.filter(q => q.status === "WAITING");

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             Live Patient Queue
          </h1>
          <div className="space-x-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-800">
              Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Current Consultation */}
            <div className="md:col-span-1">
              <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white text-center h-full flex flex-col justify-center">
                <h2 className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-4">Now Serving</h2>
                {inConsultation ? (
                  <>
                    <div className="text-7xl font-black mb-4">{inConsultation.tokenNumber}</div>
                    <div className="text-xl font-bold mb-1">{inConsultation.patient.fullName}</div>
                    <div className="text-blue-200 text-sm mb-8">{inConsultation.patient.gender} • {inConsultation.patient.mrn}</div>
                    <button 
                      onClick={() => updateStatus(inConsultation.id, "COMPLETED")}
                      className="bg-white text-blue-700 font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-gray-100 transition w-full"
                    >
                      Finish Consultation
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-6xl text-blue-400 font-black mb-4">--</div>
                    <div className="text-blue-200 text-sm">No active consultation. Call the next patient.</div>
                  </>
                )}
              </div>
            </div>

            {/* Waiting List */}
            <div className="md:col-span-2">
               <div className="bg-white rounded-xl shadow border border-gray-100 p-6 h-full">
                 <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                   <h2 className="text-xl font-bold text-gray-900">Waiting List</h2>
                   <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                     {waitingList.length} Waiting
                   </span>
                 </div>
                 
                 {waitingList.length === 0 ? (
                   <div className="text-center py-10 text-gray-500">
                     No patients in queue.
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {waitingList.map(token => (
                       <div key={token.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-xl font-black text-gray-900 border-2 border-gray-200">
                             {token.tokenNumber}
                           </div>
                           <div>
                             <div className="font-bold text-gray-900">{token.patient.fullName}</div>
                             <div className="text-xs text-gray-500">MRN: {token.patient.mrn}</div>
                           </div>
                         </div>
                         <div className="flex gap-2">
                           <button 
                             onClick={() => updateStatus(token.id, "IN_CONSULTATION")}
                             disabled={!!inConsultation}
                             className={`px-4 py-2 rounded font-bold text-sm transition ${inConsultation ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                           >
                             Call Next
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
