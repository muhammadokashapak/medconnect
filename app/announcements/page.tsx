"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Unauthorized");
        setAnnouncements(await res.json());
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
            Hospital Announcements
          </h1>
          <Link href="/feed" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">Back to Homepage</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div></div>
        ) : (
          <div className="space-y-6">
            {announcements.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Announcements</h3>
                <p className="text-gray-500">Join a hospital to see their circulars and updates here.</p>
                <Link href="/hospitals" className="mt-4 inline-block text-blue-600 font-bold hover:underline">Find Hospitals</Link>
              </div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                       <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-lg mr-3 shadow-sm">
                          {ann.hospital.name.charAt(0)}
                       </div>
                       <div>
                         <h3 className="font-bold text-gray-900 text-lg leading-tight">{ann.title}</h3>
                         <p className="text-xs text-gray-500">{ann.hospital.name}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide inline-block mb-1 ${
                         ann.type === 'POLICY' ? 'bg-red-100 text-red-800' :
                         ann.type === 'CIRCULAR' ? 'bg-blue-100 text-blue-800' :
                         'bg-gray-100 text-gray-800'
                       }`}>
                         {ann.type}
                       </span>
                       <p className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap">
                    {ann.content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
