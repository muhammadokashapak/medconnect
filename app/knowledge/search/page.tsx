"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function FlipCard({ card, idx }: { card: any, idx: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-[320px] cursor-pointer group"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="w-full h-full relative transition-transform duration-700 ease-in-out"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
        }}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-indigo-100 flex flex-col items-center justify-center p-6 hover:shadow-xl hover:border-indigo-300 transition-colors"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-6 text-2xl font-bold shadow-md">
            {idx + 1}
          </div>
          <h3 className="text-2xl font-bold text-indigo-900 text-center">{card.title}</h3>
          <div className="mt-8 px-5 py-2 bg-white rounded-full text-indigo-600 text-sm font-bold tracking-wider uppercase shadow-sm flex items-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            Tap to Flip ⤵
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)' 
          }}
        >
          <div className="bg-indigo-600 px-5 py-3 flex justify-between items-center text-white shrink-0">
            <h3 className="font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">{idx + 1}</span>
              {card.title}
            </h3>
          </div>
          <div className="p-5 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-indigo-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {card.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchKnowledge = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        if (!res.ok) {
          setResult(`Error: ${data.error || data.message || "Failed to fetch response"}`);
          return;
        }
        setResult(data.response || "No response generated.");
      } catch (error) {
        setResult(`Error connecting to AI server: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => router.push("/knowledge")}
        className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center font-medium transition-colors"
      >
        ← Back to Knowledge Hub
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-8 text-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">🤖</span>
              <span className="text-indigo-100 font-medium tracking-wider uppercase text-sm">AI Clinical Analysis</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {query ? query.charAt(0).toUpperCase() + query.slice(1) : "Medical Query"}
            </h1>
            <p className="text-indigo-100 opacity-90 max-w-2xl text-lg">
              Comprehensive clinical breakdown generated by MedConnect AI Engine.
            </p>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {loading ? (
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mt-10"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ) : result ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                let flashcards = [];
                try {
                  const cleanJson = result.replace(/```json/gi, '').replace(/```/gi, '').trim();
                  flashcards = JSON.parse(cleanJson);
                  if (!Array.isArray(flashcards)) throw new Error("Not an array");
                } catch(e) {
                  return (
                    <div className="col-span-full p-6 bg-red-50 text-red-600 rounded-xl border border-red-100">
                      <h3 className="font-bold mb-2">Error formatting response</h3>
                      <p>The AI did not return a valid flashcard format. Raw response:</p>
                      <pre className="mt-4 p-4 bg-white rounded text-sm overflow-auto text-black">{result}</pre>
                    </div>
                  );
                }
                
                return flashcards.map((card, idx) => (
                  <FlipCard key={idx} card={card} idx={idx} />
                ));
              })()}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <span className="text-5xl block mb-4">🔍</span>
              <p className="text-xl">Please enter a disease or medical query to analyze.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeSearchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="p-8 text-center text-indigo-600 font-bold">Initializing AI Engine...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
