"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // New states for adding news
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Global Health");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["All", "Cardiology", "Neurology", "Oncology", "Pediatrics", "Global Health"];
  const formCategories = ["Cardiology", "Neurology", "Oncology", "Pediatrics", "Global Health"];

  useEffect(() => {
    fetchData();
  }, [category]);

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/news?";
    if (category && category !== "All") url += `category=${encodeURIComponent(category)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Unauthorized");
      setNews(await res.json());
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const openArticle = async (article: any) => {
    setSelectedArticle(article);
    try {
      await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId: article.id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory
        })
      });

      if (!res.ok) throw new Error("Failed to post news");

      // Reset form and reload
      setNewTitle("");
      setNewContent("");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to share news. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            Medical News
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition"
            >
              Share News
            </button>
            <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Feed */}
          <div className="md:w-2/3">
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${category === cat ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div></div>
            ) : (
              <div className="space-y-6">
                {news.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500 text-lg">No news found for this category.</p>
                  </div>
                ) : (
                  news.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:shadow-md transition cursor-pointer" onClick={() => openArticle(item)}>
                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-medium">
                        <span className="text-red-600 uppercase tracking-wide bg-red-50 px-2 py-1 rounded">{item.category}</span>
                        <span>•</span>
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{item.title}</h2>
                      <p className="text-gray-600 text-sm line-clamp-3">{item.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Article View Modal / Sidebar */}
          <div className="md:w-1/3">
             {selectedArticle ? (
               <div className="bg-white p-6 rounded-xl shadow border border-gray-200 sticky top-6">
                 <button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-gray-600 mb-4 flex justify-end w-full">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
                 <span className="text-red-600 text-xs font-bold uppercase tracking-wide">{selectedArticle.category}</span>
                 <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-4 leading-tight">{selectedArticle.title}</h2>
                 <p className="text-sm text-gray-500 mb-6 border-b pb-4">{selectedArticle.source} — {new Date(selectedArticle.publishedAt).toLocaleDateString()}</p>
                 <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                   {selectedArticle.content}
                 </div>
               </div>
             ) : (
               <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px] sticky top-6">
                 <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                 Select an article to read the full story
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Share News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Share Medical News</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handlePostNews} className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-black px-3 py-2 border" 
                    placeholder="Enter headline..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-black px-3 py-2 border"
                  >
                    {formCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content / Details</label>
                  <textarea 
                    required 
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-black px-3 py-2 border"
                    placeholder="Paste the article details or summary here..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post News"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
