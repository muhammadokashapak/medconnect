"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ERPStaff() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
             <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             Staff & HR Management
          </h1>
          <Link href="/erp" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to ERP
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Hospital Staff</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700">
              + Add Staff
            </button>
          </div>
          
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data for visual representation until API is hooked up */}
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                 <td className="px-6 py-4 font-bold text-gray-900">Nurse Joy</td>
                 <td className="px-6 py-4">NURSE</td>
                 <td className="px-6 py-4 text-blue-600">nurse.joy@hospital.com</td>
                 <td className="px-6 py-4"><span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">ACTIVE</span></td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                 <td className="px-6 py-4 font-bold text-gray-900">Mike Tech</td>
                 <td className="px-6 py-4">LAB_TECH</td>
                 <td className="px-6 py-4 text-blue-600">lab.tech@hospital.com</td>
                 <td className="px-6 py-4"><span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">ACTIVE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
