"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      if (data.doctor?.role === 'ADMIN') {
        router.push("/admin");
      } else {
        router.push("/feed");
      }
    } catch (err) {
      setError("An error occurred during login.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-96 p-6 border bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Doctor Login</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-center text-sm font-medium text-gray-800 shadow-sm">
            {error.includes("Account not found") ? (
              <span>The email you entered isn't connected to an account. <Link href="/register" className="font-bold text-blue-600 hover:underline">Find your account or register.</Link></span>
            ) : (
              <span>{error}</span>
            )}
          </div>
        )}

        <input
          className="w-full border p-2 mb-3 rounded text-black placeholder-black"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-2 rounded text-black placeholder-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end mb-4">
          <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-2 rounded transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}