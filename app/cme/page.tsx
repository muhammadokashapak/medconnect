"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CMEPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const [printCert, setPrintCert] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/cme");
      if (!res.ok) throw new Error("Unauthorized");
      setData(await res.json());
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (courseId: string) => {
    setClaiming(courseId);
    try {
      const res = await fetch("/api/cme/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });
      if (res.ok) {
        alert("Certificate claimed successfully!");
        fetchData();
      } else {
        const d = await res.json();
        alert(d.message || "Failed to claim");
      }
    } catch (error) {
      alert("Error claiming certificate");
    } finally {
      setClaiming(null);
    }
  };

  const handlePrint = (course: any) => {
    setPrintCert(course);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintCert(null), 100);
    }, 100);
  };

  if (loading || !data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print { position: absolute; left: 0; top: 0; width: 100%; text-align: center; }
        }
      `}} />

      {printCert && (
        <div id="certificate-print" className="p-20 bg-white border-8 border-double border-indigo-200">
           <h1 className="text-5xl font-bold text-indigo-900 mb-8">Certificate of Completion</h1>
           <p className="text-xl mb-4">This certifies that the holder has successfully completed</p>
           <h2 className="text-3xl font-bold mb-8 text-gray-900">{printCert.title}</h2>
           <p className="text-lg mb-4">Provided by <strong>{printCert.provider}</strong></p>
           <p className="text-lg mb-12">Date: {new Date(printCert.date).toLocaleDateString()}</p>
           <div className="flex justify-center items-center gap-4">
             <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center border-4 border-yellow-500 shadow">
               <span className="font-bold text-yellow-700">{printCert.credits} CME</span>
             </div>
           </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-10 px-4 screen-only">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              Continuing Medical Education (CME)
            </h1>
            <Link href="/feed" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">Back to Homepage</Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard Stats */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-xl shadow text-white mb-6">
                 <h2 className="text-lg font-bold opacity-90 mb-2">Total CME Credits Earned</h2>
                 <p className="text-5xl font-bold">{data.totalCredits}</p>
                 <p className="text-sm opacity-80 mt-4">Keep learning to maintain your professional credentials!</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">My Certificates</h3>
                {data.userCertificates.length === 0 ? (
                  <p className="text-sm text-gray-500">No certificates earned yet.</p>
                ) : (
                  <div className="space-y-4">
                    {data.userCertificates.map((cert: any) => (
                      <div key={cert.id} className="flex justify-between items-center border p-3 rounded hover:bg-gray-50">
                        <div>
                           <p className="text-sm font-bold text-gray-900 line-clamp-1">{cert.course.title}</p>
                           <p className="text-xs text-gray-500">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => handlePrint(cert.course)}
                          className="text-indigo-600 hover:text-indigo-800 p-2"
                          title="Print Certificate"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Course List */}
            <div className="lg:col-span-2">
               <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                 <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Available Courses</h2>
                 {data.courses.length === 0 ? (
                   <p className="text-gray-500">No courses available at the moment.</p>
                 ) : (
                   <div className="space-y-6">
                     {data.courses.map((course: any) => {
                       const isClaimed = course.certificates.length > 0;
                       return (
                         <div key={course.id} className="border border-gray-100 rounded-lg p-5 hover:shadow-sm transition">
                           <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                             <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                               {course.credits} Credits
                             </span>
                           </div>
                           <p className="text-sm text-gray-500 font-medium mb-2">Provider: {course.provider}</p>
                           <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                           <div className="flex justify-between items-center">
                             <span className="text-xs text-gray-400">Date: {new Date(course.date).toLocaleDateString()}</span>
                             {isClaimed ? (
                               <span className="text-green-600 font-bold text-sm flex items-center">
                                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                 Claimed
                               </span>
                             ) : (
                               <button 
                                 onClick={() => handleClaim(course.id)}
                                 disabled={claiming === course.id}
                                 className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded text-sm transition"
                               >
                                 {claiming === course.id ? "Claiming..." : "Claim Certificate"}
                               </button>
                             )}
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
