"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  }, [id, router]);

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 pt-8 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/guidelines" className="inline-flex items-center text-sm font-medium text-indigo-200 hover:text-white transition mb-8 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Library
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-indigo-500/30 text-indigo-100 border border-indigo-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {guideline.specialty}
            </span>
            <span className="text-indigo-200 text-sm font-mono bg-black/20 px-2 py-1 rounded">
              v{guideline.version}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            {guideline.title}
          </h1>
          <p className="text-lg text-indigo-100/90 max-w-3xl leading-relaxed">
            {guideline.description}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
          {/* Action Bar */}
          <div className="bg-gray-50/80 px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center text-sm text-gray-500 font-medium">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
              Verified Medical Protocol
            </div>
            <button 
              onClick={toggleSave}
              className={`flex items-center px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${guideline.isSaved ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              <svg className={`w-5 h-5 mr-2 ${guideline.isSaved ? 'text-indigo-600' : 'text-gray-400'}`} fill={guideline.isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              {guideline.isSaved ? "Saved to Library" : "Save Guideline"}
            </button>
          </div>

          {/* Document Content */}
          <div className="p-8 md:p-12 bg-white">
            <div className="prose prose-lg max-w-none 
              prose-headings:font-extrabold prose-headings:text-indigo-950
              prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:mb-8 prose-h1:border-b-2 prose-h1:border-indigo-100 prose-h1:pb-4
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6 prose-h2:text-indigo-900
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-indigo-800
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-indigo-600 prose-a:font-semibold hover:prose-a:text-indigo-800
              prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-indigo-500 prose-li:text-gray-700 prose-li:mb-2
              prose-ol:list-decimal prose-ol:pl-6
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/80 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:text-indigo-900 prose-blockquote:font-medium prose-blockquote:shadow-sm prose-blockquote:not-italic
              prose-table:w-full prose-table:border-collapse prose-table:my-6 prose-table:shadow-sm prose-table:rounded-xl prose-table:overflow-hidden
              prose-th:bg-indigo-50 prose-th:text-indigo-900 prose-th:font-bold prose-th:text-left prose-th:p-4 prose-th:border-b-2 prose-th:border-indigo-100
              prose-td:p-4 prose-td:border-b prose-td:border-gray-100 prose-tr:hover:bg-gray-50/50 transition-colors
              prose-strong:text-indigo-900 prose-strong:font-bold
              prose-em:text-gray-800 prose-em:italic
            ">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto w-full my-8 border border-gray-100 rounded-xl shadow-sm">
                      <table className="w-full text-sm text-left m-0" {...props} />
                    </div>
                  )
                }}
              >
                {guideline.content}
              </ReactMarkdown>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 text-xs text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>Last Updated: {new Date(guideline.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="font-mono">Reference ID: {guideline.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
