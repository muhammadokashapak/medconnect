"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ProfileBanner() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if not on auth, admin, or messages pages
    if (
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/messages")
    ) {
      setLoading(false);
      return;
    }

    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
      })
      .catch(() => {
        // Ignore errors, likely not logged in
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pathname]);

  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
    return null; // Force hide on auth/admin pages
  }

  if (loading || !profile) {
    return null; // Don't show anything while loading or if not logged in
  }

  // Check if profile is incomplete
  // A new user might only have fullName, email, phoneNum, pmdcNumber.
  // We can consider it incomplete if specialization, city, or bio is missing.
  const isIncomplete = !profile.specialization || !profile.city || !profile.bio;

  if (!isIncomplete) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-yellow-100">
              <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <p className="ml-3 font-medium text-yellow-800 truncate">
              <span>Your profile is incomplete! Complete your profile to build trust with patients and peers.</span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Link
              href="/profile"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
