"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LearningDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learning")
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setData)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            My Learning Dashboard
          </h1>
          <Link href="/feed" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">
            Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Saved Resources</p>
              <h2 className="text-3xl font-bold text-indigo-600">{data?.stats?.totalSaved || 0}</h2>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Topics Viewed</p>
              <h2 className="text-3xl font-bold text-green-600">{data?.stats?.totalViews || 0}</h2>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Interaction Checks</p>
              <h2 className="text-3xl font-bold text-red-600">{data?.stats?.interactionChecks || 0}</h2>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Saved Content */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Saved Guidelines</h2>
              {data?.savedGuidelines?.length === 0 ? (
                <p className="text-sm text-gray-500">No saved guidelines.</p>
              ) : (
                <ul className="space-y-3">
                  {data?.savedGuidelines?.map((item: any) => (
                    <li key={item.id} className="border border-gray-100 p-3 rounded hover:bg-gray-50">
                      <Link href={`/guidelines/${item.guideline.id}`}>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">{item.guideline.specialty}</span>
                        <h3 className="font-bold text-gray-800">{item.guideline.title}</h3>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Saved Research Papers</h2>
              {data?.savedResearch?.length === 0 ? (
                <p className="text-sm text-gray-500">No saved research papers.</p>
              ) : (
                <ul className="space-y-3">
                  {data?.savedResearch?.map((item: any) => (
                    <li key={item.id} className="border border-gray-100 p-3 rounded hover:bg-gray-50">
                      <Link href={`/research`}>
                        <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide block mb-1">{item.researchPaper.specialty}</span>
                        <h3 className="font-bold text-gray-800 line-clamp-1">{item.researchPaper.title}</h3>
                        <p className="text-xs text-gray-500 italic mt-1">{item.researchPaper.authors}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Activity/Recent */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Recently Viewed</h2>
            {data?.recentViews?.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : (
              <ul className="space-y-4">
                {data?.recentViews?.map((view: any) => (
                  <li key={view.id} className="flex items-start">
                    <div className={`mt-1 w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                      view.resourceType === 'DRUG' ? 'bg-green-500' :
                      view.resourceType === 'GUIDELINE' ? 'bg-blue-500' :
                      view.resourceType === 'RESEARCH' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{view.resourceType}</p>
                      <p className="text-gray-800 font-medium">{view.resourceTitle}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(view.viewedAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
