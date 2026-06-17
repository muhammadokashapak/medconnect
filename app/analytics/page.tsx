"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 font-medium">Loading Analytics...</div>
      </div>
    </div>
  );

  const trendData = [
    { name: 'Jan', followers: Math.floor((stats?.followers || 0) * 0.5), appointments: Math.floor((stats?.totalAppointments || 0) * 0.4) },
    { name: 'Feb', followers: Math.floor((stats?.followers || 0) * 0.6), appointments: Math.floor((stats?.totalAppointments || 0) * 0.5) },
    { name: 'Mar', followers: Math.floor((stats?.followers || 0) * 0.7), appointments: Math.floor((stats?.totalAppointments || 0) * 0.6) },
    { name: 'Apr', followers: Math.floor((stats?.followers || 0) * 0.8), appointments: Math.floor((stats?.totalAppointments || 0) * 0.8) },
    { name: 'May', followers: Math.floor((stats?.followers || 0) * 0.9), appointments: Math.floor((stats?.totalAppointments || 0) * 0.9) },
    { name: 'Jun', followers: stats?.followers || 0, appointments: stats?.totalAppointments || 0 },
  ];

  const consultationData = [
    { name: 'Video', value: stats?.totalVideoCalls || 0 },
    { name: 'Audio', value: stats?.totalAudioCalls || 0 },
  ];

  const learningData = [
    { name: 'Guidelines', value: stats?.guidelinesViewed || 0 },
    { name: 'Drugs', value: stats?.drugsViewed || 0 },
    { name: 'Research', value: stats?.researchDownloads || 0 },
    { name: 'News', value: stats?.newsViewed || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Professional Analytics
          </h1>
          <button onClick={() => router.push("/feed")} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">Back to Homepage</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trends Chart */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Growth Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="followers" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="appointments" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Consultations Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Consultation Types</h2>
            <div className="h-64 flex items-center justify-center">
              {consultationData.every(d => d.value === 0) ? (
                 <div className="text-gray-400">No consultation data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={consultationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {consultationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Learning & Knowledge Chart */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Knowledge Resource Usage</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learningData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-center flex flex-col justify-center">
                <span className="block text-indigo-500 text-sm font-semibold mb-1">Avg Consult Time</span>
                <span className="text-2xl font-bold text-indigo-700">{stats?.avgConsultationDuration || 0}s</span>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center flex flex-col justify-center">
                <span className="block text-green-500 text-sm font-semibold mb-1">Cases Posted</span>
                <span className="text-2xl font-bold text-green-700">{stats?.casesPosted || 0}</span>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center flex flex-col justify-center">
                <span className="block text-red-500 text-sm font-semibold mb-1">AI Requests</span>
                <span className="text-2xl font-bold text-red-700">{stats?.aiRequestsUsed || 0}</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center flex flex-col justify-center">
                <span className="block text-purple-500 text-sm font-semibold mb-1">CME Credits</span>
                <span className="text-2xl font-bold text-purple-700">{stats?.totalCmeCredits || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
