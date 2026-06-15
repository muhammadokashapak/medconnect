"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 sm:pb-0 sm:pl-64">
      <Navigation />
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and preferences.</p>
        </div>

        {error && <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Security
            </h2>

            <div className="flex items-start sm:items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="flex-1 pr-4">
                <h3 className="font-medium text-gray-900">Two-Factor Authentication (2FA)</h3>
                <p className="text-sm text-gray-500 mt-1">Protect your account by requiring an email OTP code when logging in.</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isTwoFactorEnabled}
                  onClick={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    isTwoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
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

            <div className="flex items-start sm:items-center justify-between p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="flex-1 pr-4">
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
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
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    isPushEnabled ? 'bg-indigo-600' : 'bg-gray-200'
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
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
