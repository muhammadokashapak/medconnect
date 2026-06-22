"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function KnowledgeHubPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");

  const specialties = [
    "Cardiology", "Neurology", "Pulmonology", "Gastroenterology",
    "Dermatology", "Orthopedics", "Pediatrics", "Gynecology",
    "Psychiatry", "Emergency Medicine"
  ];

  useEffect(() => {
    fetch("/api/knowledge")
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setData)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/knowledge/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section with Central Search */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 py-16 px-4 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400 opacity-10 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Medical Knowledge Hub</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">Access clinical guidelines, drug databases, research papers, and interact with our Clinical AI.</p>
          </div>

          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto shadow-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 sm:pl-12 pr-24 sm:pr-32 py-4 sm:py-5 rounded-2xl bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-lg transition" 
              placeholder="Search diseases, drugs, guidelines..." 
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:px-6 rounded-xl transition text-sm sm:text-base">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* AI Quick Query Section */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden flex flex-col md:flex-row">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ask MedConnect AI</h3>
              <p className="text-sm text-gray-600">Get instant, synthesized clinical answers based on latest medical literature.</p>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="relative">
                <input 
                  type="text" 
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiSearchQuery.trim()) {
                      router.push(`/knowledge/search?q=${encodeURIComponent(aiSearchQuery.trim())}`);
                    }
                  }}
                  placeholder="e.g., What are the latest guidelines for treating Stage 2 Hypertension?" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-black transition" 
                />
                <button 
                  onClick={() => {
                    if (aiSearchQuery.trim()) {
                      router.push(`/knowledge/search?q=${encodeURIComponent(aiSearchQuery.trim())}`);
                    } else {
                      router.push("/ai");
                    }
                  }} 
                  className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white rounded-lg px-4 hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Powerful Clinical Tools Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <ToolCard icon="💊" title="Drug Interaction Checker" desc="Check multi-drug safety" href="/drug-interaction" color="green" />
          <ToolCard icon="🧮" title="Medical Calculators" desc="GFR, BMI, Scores" href="/calculators" color="purple" />
          <ToolCard icon="📋" title="Clinical Guidelines" desc="AHA, ADA, WHO" href="/guidelines" color="blue" />
          <ToolCard icon="🔬" title="Lab Values Reference" desc="Normal ranges & meaning" href="/knowledge/labs" color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rich Guidelines Cards */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Featured Guidelines</h2>
                <Link href="/guidelines" className="text-blue-600 font-semibold hover:text-blue-800 transition">View Directory &rarr;</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {data?.featured?.guidelines?.map((g: any, idx: number) => (
                  <Link key={g.id || idx} href={`/guidelines/${g.id}`} className="bg-white/80 backdrop-blur-xl rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 hover:shadow-md hover:border-blue-300 transition group block">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">{g.specialty}</span>
                      <span className="text-gray-400 text-sm">PDF</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition">{g.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">Updated clinical recommendations based on recent multi-center trials.</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Latest Medical News</h2>
                <Link href="/news" className="text-blue-600 font-semibold hover:text-blue-800 transition">More News &rarr;</Link>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden">
                {data?.featured?.news?.map((n: any, idx: number) => (
                  <Link key={n.id || idx} href={`/news`} className="flex flex-col sm:flex-row p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition group block">
                    <div className="sm:w-1/4 h-24 sm:h-auto bg-gray-200 rounded-lg mb-4 sm:mb-0 sm:mr-5 flex-shrink-0 overflow-hidden">
                      {/* Placeholder for actual image */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition">{n.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{n.source} • {new Date(n.publishedAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Specialty</h2>
              <div className="flex flex-wrap gap-2">
                {specialties.map(spec => (
                  <Link key={spec} href={`/knowledge?specialty=${spec}`} className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition">
                    {spec}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Recently Viewed
              </h2>
              {data?.recentlyViewed?.length > 0 ? (
                <ul className="space-y-4">
                  {data.recentlyViewed.map((view: any, idx: number) => (
                    <li key={view.id || idx} className="flex items-start group">
                      <div className="bg-gray-100 rounded p-2 mr-3 group-hover:bg-blue-50 transition">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide group-hover:text-blue-600 transition">{view.resourceType.substring(0,3)}</span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition">{view.resourceTitle}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">No recent activity.</p>
              )}
            </div>
            
            {/* Promo Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-md text-white">
              <h2 className="text-lg font-bold mb-2">MedConnect CME</h2>
              <p className="text-blue-100 text-sm mb-4">Earn Continuing Medical Education credits by completing interactive clinical cases and quizzes.</p>
              <Link href="/cme" className="inline-block bg-white text-blue-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition w-full text-center">
                Explore CME Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ icon, title, desc, href, color }: { icon: string, title: string, desc: string, href: string, color: 'blue'|'green'|'purple'|'yellow' }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:border-blue-300",
    green: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:border-green-300",
    purple: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 hover:border-purple-300",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100 hover:border-yellow-300",
  };

  return (
    <Link href={href} className={`p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 transition flex flex-col h-full bg-white/80 backdrop-blur-xl group hover:shadow-md ${colorMap[color].split(" ").filter(c => c.startsWith("hover:border")).join(" ")}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition ${colorMap[color].split(" ").filter(c => !c.startsWith("border") && !c.startsWith("hover:border")).join(" ")}`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 flex-1">{desc}</p>
    </Link>
  );
}
