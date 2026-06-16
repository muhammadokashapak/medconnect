"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function HospitalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch(`/api/hospitals/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setHospital)
      .catch(() => router.push("/hospitals"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/hospitals/${id}/join`, { method: "POST" });
      if (res.ok) {
        setHospital((prev: any) => ({ ...prev, userMembership: "PENDING" }));
        setFeedback({ type: "success", message: "Join request sent successfully!" });
      } else {
        const data = await res.json();
        setFeedback({ type: "error", message: data.message || "Failed to send request." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Error sending request" });
    } finally {
      setJoining(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/feed" className="text-blue-600 font-bold hover:underline flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>Back to Homepage</Link>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${feedback.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}

        {/* Header Profile */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-4xl shadow-sm flex-shrink-0">
                {hospital.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">{hospital.name}</h1>
                  {hospital.userMembership === "APPROVED" && (
                     <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase flex items-center">
                       <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                       Member
                     </span>
                  )}
                </div>
                <p className="text-gray-500 flex justify-center md:justify-start items-center mb-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {hospital.address}, {hospital.city}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
                  {hospital.phone && <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{hospital.phone}</span>}
                  {hospital.website && <a href={hospital.website} target="_blank" className="flex items-center text-blue-600 hover:underline"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>Website</a>}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-center md:justify-end">
               {hospital.userMembership === "APPROVED" ? (
                 <div className="bg-gray-100 text-gray-500 font-bold py-2 px-6 rounded-lg text-sm border border-gray-200 cursor-not-allowed">
                   Already a Member
                 </div>
               ) : hospital.userMembership === "PENDING" ? (
                 <div className="bg-yellow-100 text-yellow-800 font-bold py-2 px-6 rounded-lg text-sm border border-yellow-200">
                   Membership Pending
                 </div>
               ) : (
                 <button 
                   onClick={handleJoin} 
                   disabled={joining}
                   className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-sm"
                 >
                   {joining ? "Requesting..." : "Join Hospital"}
                 </button>
               )}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">About Hospital</h3>
            <p className="text-gray-700 leading-relaxed">{hospital.description}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Announcements */}
            <section className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                Hospital Announcements
              </h2>
              {hospital.announcements.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent announcements.</p>
              ) : (
                <div className="space-y-4">
                  {hospital.announcements.map((ann: any) => (
                    <div key={ann.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-gray-900">{ann.title}</h3>
                         <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Departments */}
            <section className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Departments
              </h2>
              {hospital.departments.length === 0 ? (
                <p className="text-gray-500 text-sm">No departments listed.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hospital.departments.map((dept: any) => (
                    <Link key={dept.id} href={`/department/${dept.id}`} className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition bg-white">
                      <h3 className="font-bold text-indigo-700 mb-1">{dept.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{dept.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
             {/* Events */}
             <section className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Upcoming Events
              </h2>
              {hospital.events.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming events.</p>
              ) : (
                <div className="space-y-4">
                  {hospital.events.map((evt: any) => (
                    <div key={evt.id} className="border-l-4 border-green-500 pl-3 py-1">
                      <h3 className="font-bold text-gray-900 text-sm">{evt.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{new Date(evt.date).toLocaleString()}</p>
                      {evt.location && <p className="text-xs text-gray-500 mt-1">📍 {evt.location}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>

             {/* Verified Members */}
             <section className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Verified Members ({hospital.memberships.length})
              </h2>
              {hospital.memberships.length === 0 ? (
                <p className="text-gray-500 text-sm">No verified members yet.</p>
              ) : (
                <div className="space-y-3">
                  {(showAllMembers ? hospital.memberships : hospital.memberships.slice(0, 5)).map((mem: any) => (
                    <Link key={mem.id} href={`/doctor/${mem.doctor.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold font-mono">
                         {mem.doctor.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">Dr. {mem.doctor.fullName}</p>
                        <p className="text-xs text-gray-500">{mem.doctor.specialization || "General"}</p>
                      </div>
                    </Link>
                  ))}
                  {hospital.memberships.length > 5 && (
                    <div className="text-center pt-2">
                      <button onClick={() => setShowAllMembers(!showAllMembers)} className="text-xs font-bold text-purple-600 hover:underline">{showAllMembers ? "Show Less" : "View All Members"}</button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
