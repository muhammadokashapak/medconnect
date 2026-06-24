"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
}

export default function MedicalNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/news")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load news");
        return res.json();
      })
      .then(data => {
        if (data && data.items) {
          setNews(data.items);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Could not load the latest medical news at this time.");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <Link href="/knowledge" className="hover:text-blue-600 transition">Knowledge Base</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Live Medical News</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Global Health News</h1>
            <p className="text-gray-600 mt-2 text-lg">Real-time updates directly from the World Health Organization (WHO).</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 bg-white border border-gray-300 px-6 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition font-medium"
          >
            Go Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium animate-pulse">Fetching latest global updates...</p>
          </div>
        ) : news.length === 0 && !error ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No news items found</h3>
            <p className="text-gray-500">Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, idx) => (
              <a 
                key={idx} 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition group flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {item.source}
                    </span>
                    <span className="text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded">
                      {new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                    {item.contentSnippet}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Read Full Article 
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
