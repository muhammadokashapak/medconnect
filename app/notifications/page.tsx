"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "PUT" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading notifications...</div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            Notifications
            {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>}
          </h1>
          <div className="flex space-x-4">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Mark all as read
              </button>
            )}
            <button onClick={() => router.push("/feed")} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">Back to Homepage</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You have no notifications.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <li key={n.id} className={`p-4 hover:bg-gray-50 transition ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {n.type === 'MESSAGE' && <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path></svg></div>}
                      {n.type === 'FOLLOW' && <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg></div>}
                      {n.type === 'SYSTEM' && <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg></div>}
                      {!['MESSAGE','FOLLOW','SYSTEM'].includes(n.type) && <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg></div>}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-bold text-gray-900">{n.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
