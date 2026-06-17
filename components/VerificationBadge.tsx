"use client";

import React, { useState } from "react";

type VerificationStatus = "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "SUSPENDED" | "PENDING"; // Included PENDING for backward compat

interface VerificationBadgeProps {
  status: VerificationStatus | string | null;
  className?: string;
  showText?: boolean;
}

export default function VerificationBadge({ status, className = "", showText = false }: VerificationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!status || status === "UNVERIFIED" || status === "REJECTED" || status === "SUSPENDED") {
    return null;
  }

  if (status === "PENDING_REVIEW" || status === "PENDING") {
    return (
      <div className={`inline-flex items-center text-amber-500 ${className}`} title="Verification Pending Review">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {showText && <span className="text-sm font-medium">Pending Review</span>}
      </div>
    );
  }

  if (status === "VERIFIED") {
    return (
      <div 
        className={`inline-flex items-center relative ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 cursor-help">
          <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-bold tracking-wide">Verified by MedConnect</span>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg">
            This professional has completed MedConnect's verification process. MedConnect is an independent platform and is not affiliated with PMDC.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
