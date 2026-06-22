/* eslint-disable @next/next/no-img-element */
"use client";

import { MouseEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  interface FollowButtonProps {
    doctorId: string;
    followingSet: Set<string>;
    setFollowingSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  }

  function FollowButton({ doctorId, followingSet, setFollowingSet }: FollowButtonProps) {
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
      } catch (error) {
        console.error('Follow toggle failed:', error);
      }
    };

    return (
      <button onClick={toggleFollow} className={`ml-3 px-3 py-1 rounded-full text-sm font-medium transition ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    );
  }

  interface FriendButtonProps {
    doctorId: string;
    friendsSet: Set<string>;
    pendingFriendsSet: Set<string>;
  }

  function FriendButton({ doctorId, friendsSet, pendingFriendsSet }: FriendButtonProps) {
    const initialStatus = friendsSet.has(doctorId) ? "Friends" : pendingFriendsSet.has(doctorId) ? "Request Sent" : "Add Friend";
    const [status, setStatus] = useState<string>(initialStatus);

    useEffect(() => {
      setStatus(friendsSet.has(doctorId) ? "Friends" : pendingFriendsSet.has(doctorId) ? "Request Sent" : "Add Friend");
    }, [doctorId, friendsSet, pendingFriendsSet]);
    
    const sendRequest = async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (status !== "Add Friend") return;
      
      try {
        const res = await fetch("/api/friend-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send", targetId: doctorId })
        });
        if (res.ok) {
          setStatus("Request Sent");
        } else {
          setStatus("Error");
        }
      } catch (error) {
        console.error('Friend request failed:', error);
      }
    };

    return (
      <button disabled={status === "Request Sent"} onClick={sendRequest} className={`ml-2 px-3 py-1 rounded-full text-sm font-medium transition ${status === "Request Sent" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
        {status}
      </button>
    );
  }

export default function FeedPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CasePost[]>([]);
  const [trending, setTrending] = useState<TrendingCase[]>([]);
  const [savedCaseIds, setSavedCaseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchFollowings = async () => {
    try {
      const res = await fetch('/api/follow', { cache: 'no-store' });
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

  const [currentUser, setCurrentUser] = useState<{ id: string; profileImage?: string; } | null>(null);
  const [friendsSet, setFriendsSet] = useState<Set<string>>(new Set());
  const [pendingFriendsSet, setPendingFriendsSet] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      const [casesRes, trendingRes, savedRes, profileRes, friendsRes] = await Promise.all([
        fetch("/api/cases?page=1&limit=10", { cache: 'no-store' }),
        fetch("/api/trending", { cache: 'no-store' }),
        fetch("/api/save-case", { cache: 'no-store' }),
        fetch("/api/profile", { cache: 'no-store' }),
        fetch("/api/friends", { cache: 'no-store' }),
      ]);

      const casesJson = await casesRes.json();
      const casesData = casesJson.data || casesJson;
      const meta = casesJson.meta || {};
      
      const trendingData = (await trendingRes.json()) as TrendingCase[];
      const savedData = (await savedRes.json()) as SavedCase[];
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setCurrentUser(profileData);
      }

      if (friendsRes.ok) {
        const fData = await friendsRes.json();
        setFriendsSet(new Set(fData.friends || []));
        setPendingFriendsSet(new Set(fData.pending || []));
      }

      setCases(casesData);
      setTrending(trendingData);
      setHasMore(meta.hasMore || false);
      
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

  const handleView = async (caseId: string) => {
    try {
      await fetch("/api/cases/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casePostId: caseId })
      });
    } catch (e) {}
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const caseId = entry.target.getAttribute("data-case-id");
            if (caseId) {
              handleView(caseId);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = document.querySelectorAll(".post-card-observer");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [cases]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/cases?page=${nextPage}&limit=10`, { cache: 'no-store' });
      const json = await res.json();
      const newData = json.data || json;
      setCases(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const filteredNew = newData.filter((c: CasePost) => !existingIds.has(c.id));
        return [...prev, ...filteredNew];
      });
      setPage(nextPage);
      setHasMore(json.meta?.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

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
    } catch (error) {
      console.error('Save toggle failed:', error);
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
                  {currentUser?.profileImage ? (
                    <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </button>
              <button onClick={() => router.push("/create-case")} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full transition font-medium">
                Discuss a clinical case, doctor...
              </button>
            </div>
            <div className="flex border-t border-gray-100 pt-3 mt-3 gap-3">
              <button onClick={() => router.push("/create-case")} className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm hover:shadow active:scale-95">
                <span className="text-emerald-500 text-lg">📷</span> Photo/Case
              </button>
              <button onClick={() => router.push("/ai/diagnosis")} className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm hover:shadow active:scale-95">
                <span className="text-indigo-500 text-lg">🤖</span> AI Analysis
              </button>
            </div>
          </div>

          {/* AI Quick Query Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                <span className="text-xl mr-2">🤖</span> Ask AI Doctor
              </h3>
              <p className="text-xs text-gray-600">Get instant clinical answers in flashcards.</p>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center relative">
              <input 
                type="text" 
                placeholder="Search diseases, symptoms, guidelines..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-black transition text-sm" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    router.push(`/knowledge/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
              />
              <button 
                className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value.trim()) {
                    router.push(`/knowledge/search?q=${encodeURIComponent(input.value.trim())}`);
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
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
                <div 
                  key={c.id} 
                  data-case-id={c.id}
                  className="post-card-observer bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-indigo-900/5 border border-white/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in-up"
                  onClick={() => router.push(`/case/${c.id}`)}
                >
                  


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
                        {currentUser?.id !== c.doctor.id && (
                          <>
                            <FollowButton doctorId={c.doctor.id} followingSet={followingSet} setFollowingSet={setFollowingSet} />
                            {!friendsSet.has(c.doctor.id) && !pendingFriendsSet.has(c.doctor.id) && (
                              <FriendButton doctorId={c.doctor.id} friendsSet={friendsSet} pendingFriendsSet={pendingFriendsSet} />
                            )}
                          </>
                        )}
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
                      // Optimistic Update: toggle +1 or -1 based on assuming it's a like if we don't have user state
                      // Actually, since we don't have user hasLiked state natively in this simple case, we just assume +1 if we react, or we just do a naive +1 optimistically
                      const oldCases = [...cases];
                      setCases(prev => prev.map(cs => cs.id === c.id ? {...cs, _count: {...cs._count, reactions: (cs._count?.reactions || 0) + 1}} : cs));
                      try {
                        const res = await fetch("/api/cases/react", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ casePostId: c.id, type: "LIKE" })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          const change = data.reacted ? 1 : -1;
                          // fix optimistic update with actual result
                          setCases(prev => prev.map(cs => cs.id === c.id ? {...cs, _count: {...cs._count, reactions: Math.max(0, (oldCases.find(oc => oc.id === c.id)?._count?.reactions || 0) + change)}} : cs));
                        } else {
                          // revert
                          setCases(oldCases);
                        }
                      } catch (error) {
                        console.error('Like failed:', error);
                        setCases(oldCases);
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
              
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={loadMore} 
                    disabled={isLoadingMore}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
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
                    <p className="text-xs text-gray-500 mt-1">Dr. {t.doctor.fullName} • {t._count?.comments || 0} Comments</p>
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
