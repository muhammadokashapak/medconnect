"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notifRes, freqRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/friend-request")
      ]);
      
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
      
      if (freqRes.ok) {
        const freqData = await freqRes.json();
        if (freqData.requests) setFriendRequests(freqData.requests);
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

  const markSingleRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {}
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch("/api/friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, requestId })
      });
      if (res.ok) {
        setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (error) {}
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading notifications...</div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

        {friendRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <h2 className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 font-bold text-indigo-900">Friend Requests</h2>
            <ul className="divide-y divide-gray-100">
              {friendRequests.map((req) => (
                <li key={req.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <Link href={`/doctor/${req.senderId}`} className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {req.sender.profileImage ? (
                        <img src={req.sender.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 hover:text-indigo-600 transition">Dr. {req.sender.fullName}</p>
                      <p className="text-sm text-gray-500">{req.sender.specialization || "Doctor"}</p>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => handleFriendRequest(req.id, 'accept')} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition">Accept</button>
                    <button onClick={() => handleFriendRequest(req.id, 'decline')} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-300 transition">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You have no notifications.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => {
                const NotificationContent = (
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
                );

                return (
                  <li key={n.id} className={`hover:bg-gray-50 transition ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                    {n.actionUrl ? (
                      <Link href={n.actionUrl} onClick={() => { if (!n.isRead) markSingleRead(n.id); }} className="p-4 block w-full h-full">
                        {NotificationContent}
                      </Link>
                    ) : (
                      <div onClick={() => { if (!n.isRead) markSingleRead(n.id); }} className="p-4 block w-full h-full cursor-pointer">
                        {NotificationContent}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
