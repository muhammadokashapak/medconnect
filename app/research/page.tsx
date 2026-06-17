"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ResearchPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/research?";
    if (query) url += `query=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Unauthorized");
      setPapers(await res.json());
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const downloadPaper = async (paper: any) => {
    // Record view/download
    try {
      await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view", paperId: paper.id })
      });
      // In a real app, trigger actual download here
      window.open(paper.pdfUrl, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  const savePaper = async (paperId: string) => {
    try {
      await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", paperId })
      });
      toast.success("Paper saved to your Learning Dashboard!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Research Papers Hub
          </h1>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-800">Back to Homepage</Link>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Search papers by title, authors, or abstract..." 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition">
              Search Literature
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div></div>
        ) : (
          <div className="space-y-6">
            {papers.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-500 text-lg">No research papers found matching your criteria.</p>
              </div>
            ) : (
              papers.map(paper => (
                <div key={paper.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                        {paper.specialty}
                      </span>
                      <span className="text-gray-400 text-xs">Published: {new Date(paper.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{paper.title}</h2>
                    <p className="text-gray-600 text-sm font-medium mb-3 italic">{paper.authors}</p>
                    <p className="text-gray-700 text-sm line-clamp-3">{paper.abstract}</p>
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-3 flex-shrink-0 md:min-w-[150px]">
                    <button 
                      onClick={() => downloadPaper(paper)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-2 px-4 rounded transition flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Read PDF
                    </button>
                    <button 
                      onClick={() => savePaper(paper.id)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2 px-4 rounded transition flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                      Save
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
