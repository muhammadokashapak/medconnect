"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");

  // Resend code cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message && data.message.includes("Account not found")) {
          router.push("/register?error=account_not_found");
          return;
        }
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      if (data.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      if (data.doctor?.role === 'ADMIN') {
        setShowAdminPrompt(true);
      } else {
        router.push("/feed");
      }
    } catch (err) {
      setError("An error occurred during login.");
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setTwoFaError("");
    setTwoFaLoading(true);

    try {
      const res = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTwoFaError(data.message || "Invalid 2FA code.");
        setTwoFaLoading(false);
        return;
      }

      if (data.doctor?.role === 'ADMIN') {
        setRequires2FA(false);
        setShowAdminPrompt(true);
      } else {
        router.push("/feed");
      }
    } catch (err) {
      setTwoFaError("An error occurred verifying 2FA.");
      setTwoFaLoading(false);
    }
  };

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;
    setTwoFaError("");
    setResendCooldown(60);
    try {
      await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      setTwoFaError("Failed to resend code.");
    }
  }, [email, password, resendCooldown]);

  if (requires2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600 mb-6">Enter the 6-digit code sent to your verified phone number (or email).</p>
          
          {twoFaError && <div className="mb-4 text-red-600 text-sm font-medium">{twoFaError}</div>}

          <input
            className="w-full border p-3 mb-6 rounded-lg text-center text-3xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-black"
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
          />

          <button
            onClick={handleVerify2FA}
            disabled={twoFaLoading || otpCode.length !== 6}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {twoFaLoading ? "Verifying..." : "Verify Code"}
          </button>

          {/* Resend Code */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
            </button>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              setRequires2FA(false);
              setOtpCode("");
              setTwoFaError("");
            }}
            className="w-full mt-4 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-lg transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (showAdminPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Admin</h2>
          <p className="text-gray-600 mb-8">How would you like to proceed with your session today?</p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push("/admin")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-sm flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Act as Admin
            </button>
            <button
              onClick={() => router.push("/feed")}
              className="w-full bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-4 rounded-lg transition shadow-sm flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Act as Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 border border-gray-200 bg-white rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Doctor Login</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-center text-sm font-medium text-gray-800 shadow-sm">
            {error.includes("Account not found") ? (
              <span>The email you entered isn't connected to an account. <Link href="/register" className="font-bold text-blue-600 hover:underline">Find your account or register.</Link></span>
            ) : (
              <span>{error}</span>
            )}
          </div>
        )}

        <input
          className="w-full border border-gray-300 p-3 mb-3 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password with show/hide toggle */}
        <div className="relative mb-3">
          <input
            className="w-full border border-gray-300 p-3 pr-12 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 013.168-4.477M6.343 6.343A9.972 9.972 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.168 4.477M6.343 6.343L3 3m3.343 3.343l2.829 2.829M17.657 17.657L21 21m-3.343-3.343l-2.829-2.829M9.878 9.878a3 3 0 104.243 4.243" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Remember me & Forgot password row */}
        <div className="flex items-center justify-between mb-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold p-3 rounded-lg transition shadow-sm"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}