"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("security");
  
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load settings");
        }
        const data = await res.json();
        setIsTwoFactorEnabled(data.isTwoFactorEnabled || false);
        setLoading(false);

        // Check Push Subscription Status
        if ("serviceWorker" in navigator && "PushManager" in window) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              setIsPushEnabled(true);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load settings");
        setLoading(false);
      }
    };

    loadSettings();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTwoFactorEnabled }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      setSuccess("Settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Push notifications are not supported in your browser.");
      return;
    }

    setPushLoading(true);
    setError("");

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (isPushEnabled) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        setIsPushEnabled(false);
        setSuccess("Push notifications disabled.");
      } else {
        // Subscribe
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) throw new Error("VAPID key is missing.");

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });

        // Send to backend
        const res = await fetch("/api/webpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription }),
        });

        if (!res.ok) throw new Error("Failed to save subscription on server.");

        setIsPushEnabled(true);
        setSuccess("Push notifications enabled!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle push notifications.");
      setIsPushEnabled(false);
    } finally {
      setPushLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20 sm:pb-0">
      <div className="max-w-[1100px] mx-auto pt-8 px-4 flex flex-col md:flex-row gap-6">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
            <h1 className="text-2xl font-bold text-gray-900 px-6 py-5 border-b border-gray-100">Settings</h1>
            <nav className="p-3">
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition mb-1 ${activeTab === "security" ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100 font-medium"}`}
              >
                <div className={`p-2 rounded-full mr-3 ${activeTab === "security" ? "bg-blue-100" : "bg-gray-200"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                Password and security
              </button>
              
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition mb-1 ${activeTab === "notifications" ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100 font-medium"}`}
              >
                <div className={`p-2 rounded-full mr-3 ${activeTab === "notifications" ? "bg-blue-100" : "bg-gray-200"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                Notifications
              </button>

              <button
                onClick={() => router.push("/profile")}
                className="w-full flex items-center px-4 py-3 rounded-lg transition text-gray-700 hover:bg-gray-100 font-medium mb-1"
              >
                <div className="p-2 rounded-full mr-3 bg-gray-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                Personal details
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 max-w-3xl">
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 shadow-sm"><p className="font-bold">Error</p><p>{error}</p></div>}
          {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 shadow-sm"><p className="font-bold">Success</p><p>{success}</p></div>}

          {activeTab === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Password and security</h2>
                <p className="text-gray-500 mt-1">Manage your password, login options, and Two-Factor Authentication.</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Login & recovery</h3>
                <div className="flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg cursor-pointer transition">
                  <div>
                    <h4 className="font-semibold text-gray-900">Change password</h4>
                    <p className="text-sm text-gray-500">It's a good idea to use a strong password.</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>

                <div className="flex items-center justify-between py-4 hover:bg-gray-50 px-2 rounded-lg transition mt-2">
                  <div className="flex-1 pr-4">
                    <h4 className="font-semibold text-gray-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-gray-500 mt-1">We'll ask for a login code via email if we notice a login from an unrecognized device.</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isTwoFactorEnabled}
                      onClick={() => {
                        setIsTwoFactorEnabled(!isTwoFactorEnabled);
                        // Auto-save when toggled
                        setTimeout(() => handleSave(), 100);
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        isTwoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isTwoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-sm transition disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <p className="text-gray-500 mt-1">Choose how you receive notifications and updates.</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Push Notifications</h3>
                
                <div className="flex items-center justify-between py-4 hover:bg-gray-50 px-2 rounded-lg transition">
                  <div className="flex-1 pr-4">
                    <h4 className="font-semibold text-gray-900">Browser Push Alerts</h4>
                    <p className="text-sm text-gray-500 mt-1">Receive real-time alerts for messages and updates even when the app is closed.</p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center">
                    {pushLoading && <span className="text-sm text-gray-500 mr-3">Wait...</span>}
                    <button
                      type="button"
                      role="switch"
                      disabled={pushLoading}
                      aria-checked={isPushEnabled}
                      onClick={handlePushToggle}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        isPushEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      } ${pushLoading ? 'opacity-50' : ''}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isPushEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
