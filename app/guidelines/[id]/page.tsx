"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function GuidelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [guideline, setGuideline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guidelines/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setGuideline)
      .catch(() => router.push("/guidelines"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSave = async () => {
    const action = guideline.isSaved ? "unsave" : "save";
    try {
      const res = await fetch(`/api/guidelines/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setGuideline((prev: any) => ({ ...prev, isSaved: !prev.isSaved }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/guidelines" className="text-blue-600 font-bold hover:underline flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Guidelines
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {guideline.specialty}
                </span>
                <span className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {guideline.version}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{guideline.title}</h1>
              <p className="text-gray-600 text-lg">{guideline.description}</p>
            </div>
            <div className="mt-4 md:mt-0 flex-shrink-0">
              <button 
                onClick={toggleSave}
                className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm transition-colors ${guideline.isSaved ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <svg className="w-5 h-5 mr-2" fill={guideline.isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                {guideline.isSaved ? "Saved" : "Save Guideline"}
              </button>
            </div>
          </div>

          <div className="prose max-w-none prose-blue">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
              {guideline.content}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
            <span>Last Updated: {new Date(guideline.updatedAt).toLocaleDateString()}</span>
            <span>Reference ID: {guideline.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
