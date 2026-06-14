"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AIDashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Clinical Assistant
            </h1>
            <p className="text-gray-600 mt-2">Leverage artificial intelligence to enhance your clinical workflow.</p>
          </div>
          <button
            onClick={() => router.push("/feed")}
            className="text-indigo-600 hover:underline font-medium"
          >Back to Homepage</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Analyze Case */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyze Case</h3>
            <p className="text-gray-600 mb-6 flex-1">Input patient symptoms, history, and lab results to receive AI-generated differential diagnoses and red flags.</p>
            <button
              onClick={() => router.push("/ai/analyze")}
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Start Analysis
            </button>
          </div>

          {/* Medical Chatbot */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Chatbot</h3>
            <p className="text-gray-600 mb-6 flex-1">Have a conversation with our AI about drug interactions, procedural guidelines, or general medical queries.</p>
            <button
              onClick={() => router.push("/ai/chat")}
              className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded hover:bg-indigo-700 transition"
            >
              Open Chat
            </button>
          </div>

          {/* Summarize Tool */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Case Summarizer</h2>
            <p className="text-gray-500 mb-4 h-12">Instantly summarize lengthy clinical notes and patient histories.</p>
            <Link href="/ai/summarize" className="text-purple-600 font-medium hover:underline flex items-center">
              Summarize Notes <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>

          {/* Decision Support Tool */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Clinical Decision Support</h2>
            <p className="text-gray-500 mb-4 h-12">Get treatment recommendations and drug interaction alerts.</p>
            <Link href="/ai/decision-support" className="text-indigo-600 font-medium hover:underline flex items-center">
              Get Recommendations <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
