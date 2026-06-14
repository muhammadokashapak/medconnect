"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setStats)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Professional Analytics
          </h1>
          <button onClick={() => router.push("/feed")} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Followers</span>
            <span className="text-3xl font-bold text-indigo-600">{stats?.followers || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Following</span>
            <span className="text-3xl font-bold text-indigo-600">{stats?.following || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Appointments</span>
            <span className="text-3xl font-bold text-purple-600">{stats?.totalAppointments || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Video Calls</span>
            <span className="text-3xl font-bold text-pink-600">{stats?.totalVideoCalls || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Audio Calls</span>
            <span className="text-3xl font-bold text-teal-600">{stats?.totalAudioCalls || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Avg Consult (sec)</span>
            <span className="text-3xl font-bold text-orange-600">{stats?.avgConsultationDuration || 0}s</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Cases Posted</span>
            <span className="text-3xl font-bold text-green-600">{stats?.casesPosted || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">AI Requests</span>
            <span className="text-3xl font-bold text-red-600">{stats?.aiRequestsUsed || 0}</span>
          </div>
        </div>

        {/* Phase 9 Stats */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Knowledge & Learning Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Guidelines Viewed</span>
            <span className="text-3xl font-bold text-blue-800">{stats?.guidelinesViewed || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Drugs Searched</span>
            <span className="text-3xl font-bold text-green-800">{stats?.drugsViewed || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Research Downloads</span>
            <span className="text-3xl font-bold text-yellow-600">{stats?.researchDownloads || 0}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">News Read</span>
            <span className="text-3xl font-bold text-red-800">{stats?.newsViewed || 0}</span>
          </div>
        </div>

        {/* Phase 10 Stats */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Hospital & Events Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center text-center">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">CME Credits Earned</span>
            <span className="text-3xl font-bold text-purple-800">{stats?.totalCmeCredits || 0}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
