/* eslint-disable @next/next/no-img-element */
"use client";

import { MouseEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();
  type DoctorPreview = {
    id: string;
    fullName: string;
    profileImage?: string;
    isVerified?: boolean;
  };

  type CasePost = {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    specialty: string;
    imageUrl?: string;
    doctor: DoctorPreview;
    _count?: { reactions?: number; comments?: number; views?: number };
  };

  type TrendingCase = {
    id: string;
    title: string;
    doctor: DoctorPreview;
    _count?: { comments?: number };
  };

  type SavedCase = { casePostId: string };

  const [cases, setCases] = useState<CasePost[]>([]);
  const [trending, setTrending] = useState<TrendingCase[]>([]);
  const [savedCaseIds, setSavedCaseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  // FollowButton component local to feed
  function FollowButton({ doctorId }: { doctorId: string }) {
    const isFollowing = followingSet.has(doctorId);

    const toggleFollow = async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: doctorId })
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.following) {
          setFollowingSet(prev => new Set(prev).add(doctorId));
        } else {
          setFollowingSet(prev => {
            const next = new Set(prev);
            next.delete(doctorId);
            return next;
          });
        }
      } catch {
      }
    };

    return (
      <button onClick={toggleFollow} className={`ml-3 px-3 py-1 rounded-full text-sm ${isFollowing ? 'bg-gray-200 text-gray-700' : 'bg-indigo-600 text-white'}`}>
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    );
  }

  const fetchFollowings = async () => {
    try {
      const res = await fetch('/api/follow');
      if (!res.ok) return;
      const data = await res.json();
      const s = new Set<string>();
      if (Array.isArray(data.following)) {
        data.following.forEach((f: { followingId: string }) => s.add(f.followingId));
      }
      setFollowingSet(s);
    } catch {
    }
  };

  const fetchData = async () => {
    try {
      const [casesRes, trendingRes, savedRes] = await Promise.all([
        fetch("/api/cases"),
        fetch("/api/trending"),
        fetch("/api/save-case"),
      ]);

      const casesData = (await casesRes.json()) as CasePost[];
      const trendingData = (await trendingRes.json()) as TrendingCase[];
      const savedData = (await savedRes.json()) as SavedCase[];

      setCases(casesData);
      setTrending(trendingData);
      
      const savedIds = new Set<string>();
      if (Array.isArray(savedData)) {
        savedData.forEach((s) => savedIds.add(s.casePostId));
      }
      setSavedCaseIds(savedIds);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initFeed() {
      await fetchData();
      await fetchFollowings();
    }

    void initFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSave = async (e: MouseEvent<HTMLButtonElement>, caseId: string) => {
    e.stopPropagation();
    const isSaved = savedCaseIds.has(caseId);
    
    try {
      if (isSaved) {
        await fetch(`/api/save-case?casePostId=${caseId}`, { method: "DELETE" });
        setSavedCaseIds(prev => {
          const next = new Set(prev);
          next.delete(caseId);
          return next;
        });
      } else {
        await fetch("/api/save-case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ casePostId: caseId })
        });
        setSavedCaseIds(prev => new Set(prev).add(caseId));
      }
    } catch {
      // ignore save errors
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading discussion feed...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed Column */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          {/* Create Post Input Box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
                <button onClick={(e) => { e.stopPropagation(); router.push('/profile'); }} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </button>
              <button onClick={() => router.push("/create-case")} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full transition font-medium">
                Discuss a clinical case, doctor...
              </button>
            </div>
            <div className="flex border-t border-gray-100 pt-2 mt-2">
              <button onClick={() => router.push("/create-case")} className="flex-1 flex justify-center items-center gap-2 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition font-medium text-sm">
                <span className="text-green-500 text-lg">📷</span> Photo/Case
              </button>
              <button onClick={() => router.push("/ai/diagnosis")} className="flex-1 flex justify-center items-center gap-2 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition font-medium text-sm">
                <span className="text-blue-500 text-lg">🤖</span> AI Analysis
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}

          {cases.length === 0 && !error ? (
            <div className="bg-white rounded-lg shadow p-10 text-center border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No cases posted yet</h3>
              <p className="text-gray-500 mb-6">Be the first to post a clinical case for discussion.</p>
              <button onClick={() => router.push("/create-case")} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition font-bold">
                Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cases.map((c) => (
                <div key={c.id} onClick={() => router.push(`/case/${c.id}`)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md cursor-pointer transition relative">
                  


                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {c.doctor.profileImage ? (
                        <img src={c.doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          Dr. {c.doctor.fullName}
                        </h3>
                        {c.doctor.isVerified && <svg className="w-4 h-4 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                        <FollowButton doctorId={c.doctor.id} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{new Date(c.createdAt).toLocaleDateString()} • {c.specialty}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-2 pr-10">{c.title}</h2>
                  <p className="text-gray-700 line-clamp-3 mb-4">{c.description}</p>
                  
                  {c.imageUrl && (
                    <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden border mb-4">
                      <img src={c.imageUrl} alt="Case Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-500 border-t pt-4 gap-6">
                    <button onClick={async (e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      try {
                        await fetch("/api/cases/react", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ casePostId: c.id, type: "LIKE" })
                        });
                        fetchData(); // Simplest way to refresh counts for now
                      } catch {
                      }
                    }} className="flex items-center hover:text-blue-600 transition">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                      <span>{c._count?.reactions || 0}</span>
                    </button>
                    
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      <span>{c._count?.comments || 0}</span>
                    </div>

                    <button onClick={(e) => toggleSave(e, c.id)} className="flex items-center text-gray-400 hover:text-yellow-500 transition z-10">
                      <svg className={`w-5 h-5 mr-1 ${savedCaseIds.has(c.id) ? 'text-yellow-500' : ''}`} fill={savedCaseIds.has(c.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                      <span>{savedCaseIds.has(c.id) ? 'Saved' : 'Save'}</span>
                    </button>

                    <div className="flex items-center ml-auto text-sm text-gray-400">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      <span>{c._count?.views || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-indigo-900 flex items-center mb-4 border-b border-indigo-200 pb-2">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path></svg>
              Trending Cases
            </h2>
            
            {trending.length === 0 ? (
              <p className="text-sm text-gray-500">No trending cases yet.</p>
            ) : (
              <div className="space-y-4">
                {trending.map((t, idx) => (
                  <div key={t.id} onClick={() => router.push(`/case/${t.id}`)} className="cursor-pointer group">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-2 transition">{idx + 1}. {t.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Dr. {t.doctor.fullName} • {t._count.comments} Comments</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
