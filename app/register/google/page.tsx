"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function GoogleRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [pmdcNumber, setPmdcNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const picture = searchParams.get("picture") || "";

  useEffect(() => {
    if (!email || !name) {
      router.push("/register");
    }
  }, [email, name, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/google/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          picture,
          pmdcNumber,
          phoneNumber
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/feed");
    } catch (err) {
      setError("An error occurred during registration.");
      setLoading(false);
    }
  };

  if (!email || !name) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          {picture && (
            <div className="flex justify-center mb-4">
              <img src={picture} alt="Profile" className="w-20 h-20 rounded-full border-4 border-indigo-100 shadow-sm" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Complete Registration</h1>
          <p className="text-gray-600 mt-2">
            Almost there, <strong>{name}</strong>! We just need a few more details to verify your medical credentials.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-center text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PMDC Number *
            </label>
            <input
              type="text"
              required
              value={pmdcNumber}
              onChange={(e) => setPmdcNumber(e.target.value)}
              placeholder="e.g. 12345-S"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+923001234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GoogleRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
      <GoogleRegisterContent />
    </Suspense>
  );
}
