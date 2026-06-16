"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Long-press detection refs
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchData = async () => {
    try {
      const [notifRes, freqRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/friend-request")
      ]);
      
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const muted = JSON.parse(localStorage.getItem("muted_notification_types") || "[]");
        setNotifications(notifData.filter((n: any) => !muted.includes(n.type)));
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

  const markSingleRead = useCallback(async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {}
  }, []);

  const deleteAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await fetch("/api/notifications?all=true", { method: "DELETE" });
      setNotifications([]);
    } catch (error) {}
  };

  const deleteSingle = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedNotification(null);
      setToast("Notification deleted");
    } catch (error) {}
  };

  const muteType = (type: string) => {
    const muted = JSON.parse(localStorage.getItem("muted_notification_types") || "[]");
    if (!muted.includes(type)) {
      muted.push(type);
      localStorage.setItem("muted_notification_types", JSON.stringify(muted));
    }
    // Also remove from preferred if it was there
    const preferred = JSON.parse(localStorage.getItem("preferred_notification_types") || "[]");
    localStorage.setItem("preferred_notification_types", JSON.stringify(preferred.filter((t: string) => t !== type)));

    setNotifications(prev => prev.filter(n => n.type !== type));
    setSelectedNotification(null);
    setToast(`Notifications of type "${type}" have been muted`);
  };

  const preferType = (type: string) => {
    const preferred = JSON.parse(localStorage.getItem("preferred_notification_types") || "[]");
    if (!preferred.includes(type)) {
      preferred.push(type);
      localStorage.setItem("preferred_notification_types", JSON.stringify(preferred));
    }
    // Also remove from muted if it was there
    const muted = JSON.parse(localStorage.getItem("muted_notification_types") || "[]");
    localStorage.setItem("muted_notification_types", JSON.stringify(muted.filter((t: string) => t !== type)));

    setSelectedNotification(null);
    setToast(`You'll receive more "${type}" notifications`);
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

  // Simple click: navigate directly to notification content (Facebook-style)
  const handleSimpleClick = useCallback((n: any) => {
    if (!n.isRead) markSingleRead(n.id);
    if (n.actionUrl) {
      router.push(n.actionUrl);
    } else {
      // No actionUrl — just mark as read, show brief feedback
      setToast("Notification marked as read");
    }
  }, [router, markSingleRead]);

  // Open options modal (for long-press or 3-dots)
  const openOptionsModal = useCallback((n: any) => {
    if (!n.isRead) markSingleRead(n.id);
    setSelectedNotification(n);
  }, [markSingleRead]);

  // Long-press handlers
  const handlePressStart = useCallback((n: any) => {
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      openOptionsModal(n);
    }, 2000); // 2 seconds for long press
  }, [openOptionsModal]);

  const handlePressEnd = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback((n: any) => {
    // Only handle simple click if it wasn't a long press
    if (!isLongPress.current) {
      handleSimpleClick(n);
    }
    isLongPress.current = false;
  }, [handleSimpleClick]);

  const handleOpenAction = (n: any) => {
    setSelectedNotification(null);
    if (n.actionUrl) {
      router.push(n.actionUrl);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><span className="text-gray-500 font-medium">Loading notifications...</span></div></div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path></svg></div>;
      case 'FOLLOW':
        return <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg></div>;
      case 'SYSTEM':
        return <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg></div>;
      default:
        return <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            Notifications
            {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {notifications.length > 0 && (
              <button onClick={deleteAll} className="text-sm font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-2 rounded-lg transition">
                Delete All
              </button>
            )}
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg transition">
                Mark all as read
              </button>
            )}
            <button onClick={() => router.push("/feed")} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">Back</button>
          </div>
        </div>

        {/* Tip for users */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span><strong>Tip:</strong> Tap a notification to open it. Hold for 2 seconds or tap the ⋮ icon for more options.</span>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You have no notifications.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => {
                return (
                  <li
                    key={n.id}
                    className={`hover:bg-gray-50 transition cursor-pointer select-none ${!n.isRead ? 'bg-indigo-50/50' : ''}`}
                    onClick={() => handleClick(n)}
                    onMouseDown={() => handlePressStart(n)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={() => handlePressStart(n)}
                    onTouchEnd={handlePressEnd}
                  >
                    <div className="p-4 flex items-start justify-between w-full">
                      <div className="flex items-start flex-1 pr-4">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(n.type)}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">{n.title}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                            {n.actionUrl && (
                              <span className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                Tap to open
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        {!n.isRead && <div className="w-2 h-2 bg-red-500 rounded-full mb-2"></div>}
                        <button
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); openOptionsModal(n); }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-[slideUp_0.3s_ease-out]">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {toast}
          </div>
        </div>
      )}

      {/* Options Modal (long-press or 3-dots) */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 sm:p-0" onClick={() => setSelectedNotification(null)}>
          <div className="bg-white rounded-2xl w-full sm:w-96 shadow-2xl transform transition-all overflow-hidden animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
            {/* Modal header with notification preview */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Notification Options</h3>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition" onClick={() => setSelectedNotification(null)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
                {getIcon(selectedNotification.type)}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{selectedNotification.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{selectedNotification.message}</p>
                </div>
              </div>
            </div>

            <div className="p-2 flex flex-col gap-1">
              {/* Open Notification */}
              {selectedNotification.actionUrl && (
                <button onClick={() => handleOpenAction(selectedNotification)} className="w-full text-left px-4 py-3 text-indigo-600 hover:bg-indigo-50 font-bold rounded-lg flex items-center gap-3 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  Open Notification
                </button>
              )}

              {/* Receive more info like this (NEW) */}
              <button onClick={() => preferType(selectedNotification.type)} className="w-full text-left px-4 py-3 text-emerald-600 hover:bg-emerald-50 font-bold rounded-lg flex items-center gap-3 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                Receive more info like this
              </button>

              {/* Mute Similar Alerts */}
              <button onClick={() => muteType(selectedNotification.type)} className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 font-bold rounded-lg flex items-center gap-3 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
                Mute Similar Alerts
              </button>

              {/* Delete Notification - always prominent */}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button onClick={() => deleteSingle(selectedNotification.id)} className="w-full text-left px-4 py-3 text-rose-600 hover:bg-rose-50 font-bold rounded-lg flex items-center gap-3 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
