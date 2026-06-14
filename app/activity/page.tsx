"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (error) {} finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading activity...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Activity Timeline
          </h1>
          <button onClick={() => router.push("/feed")} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">Back to Homepage</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
          {activities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No recent activity found.</div>
          ) : (
            <div className="relative border-l border-gray-200 ml-3">
              {activities.map((activity, idx) => (
                <div key={activity.id} className={`mb-8 pl-6 ${idx === activities.length - 1 ? '' : 'relative'}`}>
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[6.5px] top-1.5 border-2 border-white"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{activity.type}</span>
                    <span className="text-gray-700 mt-1">{activity.description}</span>
                    <span className="text-xs text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
