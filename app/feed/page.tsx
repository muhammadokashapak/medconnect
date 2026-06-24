/* eslint-disable @next/next/no-img-element */
"use client";

import { MouseEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';

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
    <button onClick={toggleFollow} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${isFollowing ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5'}`}>
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
    <button disabled={status === "Request Sent"} onClick={sendRequest} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${status === "Request Sent" ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:shadow-md hover:-translate-y-0.5'}`}>
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

  const fetcher = (url: string) => fetch(url).then(r => r.json());
  
  // Note: For simplicity and speed, we will keep the custom pagination for `cases` but SWR-ize the rest.
  const swrConfig = { revalidateOnFocus: false, revalidateIfStale: false, dedupingInterval: 60000 };
  const { data: trendingData } = useSWR("/api/trending", fetcher, swrConfig);
  const { data: savedData } = useSWR("/api/save-case", fetcher, swrConfig);
  const { data: profileData } = useSWR("/api/profile", fetcher, swrConfig);
  const { data: friendsData } = useSWR("/api/friends", fetcher, swrConfig);
  const { data: followData } = useSWR("/api/follow", fetcher, swrConfig);

  useEffect(() => {
    if (trendingData) setTrending(trendingData);
    if (profileData) setCurrentUser(profileData);
    if (friendsData) {
      setFriendsSet(new Set(friendsData.friends || []));
      setPendingFriendsSet(new Set(friendsData.pending || []));
    }
    if (followData && Array.isArray(followData.following)) {
      setFollowingSet(new Set(followData.following.map((f: any) => f.followingId)));
    }
    if (savedData && Array.isArray(savedData)) {
      setSavedCaseIds(new Set(savedData.map((s: any) => s.casePostId)));
    }
  }, [trendingData, profileData, friendsData, followData, savedData]);

  const fetchData = async () => {
    try {
      const casesRes = await fetch("/api/cases?page=1&limit=10");
      const casesJson = await casesRes.json();
      setCases(casesJson.data || casesJson);
      setHasMore(casesJson.meta?.hasMore || false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Loading discussion feed...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed Column */}
        <div className="flex-1 max-w-3xl mx-auto w-full">
          {/* Create Post Input Box */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-5 mb-8">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={(e) => { e.stopPropagation(); router.push('/profile'); }} className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 ring-2 ring-slate-50 transition-transform hover:scale-105">
                  {currentUser?.profileImage ? (
                    <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-slate-400 mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </button>
              <button onClick={() => router.push("/create-case")} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 text-left px-5 py-3.5 rounded-2xl transition-all duration-200 font-medium border border-slate-200/60 shadow-inner">
                Discuss a clinical case, doctor...
              </button>
            </div>
            <div className="flex border-t border-slate-100 pt-4 gap-4">
              <button onClick={() => router.push("/create-case")} className="flex-1 flex justify-center items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-3 rounded-xl transition-all font-bold text-sm shadow-sm hover:-translate-y-0.5 active:translate-y-0">
                <span className="text-xl">📷</span> Photo/Case
              </button>
              <button onClick={() => router.push("/ai/diagnosis")} className="flex-1 flex justify-center items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-3 rounded-xl transition-all font-bold text-sm shadow-sm hover:-translate-y-0.5 active:translate-y-0">
                <span className="text-xl">🤖</span> AI Analysis
              </button>
            </div>
          </div>

          {/* AI Quick Query Section */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col md:flex-row mb-8 relative">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 md:w-1/3 flex flex-col justify-center text-white">
              <h3 className="text-xl font-bold mb-1 flex items-center">
                <span className="text-2xl mr-2">✨</span> Ask AI Doctor
              </h3>
              <p className="text-indigo-100 text-sm opacity-90">Get instant clinical answers in flashcards.</p>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center relative bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search diseases, symptoms, guidelines..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white text-slate-900 transition-all font-medium placeholder-slate-400 shadow-inner" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      router.push(`/knowledge/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                    }
                  }}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value.trim()) {
                      router.push(`/knowledge/search?q=${encodeURIComponent(input.value.trim())}`);
                    }
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 border border-red-200 flex items-center shadow-sm"><svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>{error}</div>}

          {cases.length === 0 && !error ? (
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center border border-slate-100 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 8M6 8h4m-4 4h4m-4 4h4" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No cases posted yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm">Be the first to post a clinical case for discussion with your peers.</p>
              <button onClick={() => router.push("/create-case")} className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold">
                Create First Post
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {cases.map((c) => (
                <div 
                  key={c.id} 
                  data-case-id={c.id}
                  className="post-card-observer bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 cursor-pointer animate-fade-in-up"
                  onClick={() => router.push(`/case/${c.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 ring-4 ring-slate-50 shadow-sm">
                        {c.doctor.profileImage ? (
                          <img src={c.doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-full h-full text-slate-300 mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="text-lg font-bold text-slate-900 truncate">
                            Dr. {c.doctor.fullName}
                          </h3>
                          {c.doctor.isVerified && <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{new Date(c.createdAt).toLocaleDateString()} • {c.specialty}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:ml-auto pl-14 sm:pl-0">
                      {currentUser?.id !== c.doctor.id && (
                        <>
                          <FollowButton doctorId={c.doctor.id} followingSet={followingSet} setFollowingSet={setFollowingSet} />
                          {!friendsSet.has(c.doctor.id) && !pendingFriendsSet.has(c.doctor.id) && (
                            <FriendButton doctorId={c.doctor.id} friendsSet={friendsSet} pendingFriendsSet={pendingFriendsSet} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="pl-0 sm:pl-[72px]">
                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{c.title}</h2>
                    <p className="text-slate-600 line-clamp-3 mb-6 text-base leading-relaxed">{c.description}</p>
                    
                    {c.imageUrl && (
                      <div className="w-full h-56 sm:h-80 rounded-2xl overflow-hidden border border-slate-100 mb-6 bg-slate-50 relative group">
                        <img src={c.imageUrl} alt="Case Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center text-slate-500 border-t border-slate-100 pt-5 gap-y-4 gap-x-6">
                      <button onClick={async (e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
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
                            setCases(prev => prev.map(cs => cs.id === c.id ? {...cs, _count: {...cs._count, reactions: Math.max(0, (oldCases.find(oc => oc.id === c.id)?._count?.reactions || 0) + change)}} : cs));
                          } else {
                            setCases(oldCases);
                          }
                        } catch (error) {
                          console.error('Like failed:', error);
                          setCases(oldCases);
                        }
                      }} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-semibold transition-colors group">
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <span>{c._count?.reactions || 0}</span>
                      </button>
                      
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-semibold transition-colors cursor-pointer group">
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <span>{c._count?.comments || 0}</span>
                      </div>

                      <button onClick={(e) => toggleSave(e, c.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-colors group z-10 ${savedCaseIds.has(c.id) ? 'text-amber-500 bg-amber-50' : 'hover:bg-amber-50 hover:text-amber-600'}`}>
                        <svg className={`w-6 h-6 group-hover:scale-110 transition-transform`} fill={savedCaseIds.has(c.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                        <span>{savedCaseIds.has(c.id) ? 'Saved' : 'Save'}</span>
                      </button>

                      <div className="flex items-center gap-2 ml-auto px-3 py-2 text-slate-400 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        <span>{c._count?.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button 
                    onClick={loadMore} 
                    disabled={isLoadingMore}
                    className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-full font-bold hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Loading...
                      </span>
                    ) : "Load More Posts"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trending Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sticky top-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6 pt-2">
              <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path></svg>
              </span>
              Trending Cases
            </h2>
            
            {trending.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-400 font-medium">No trending cases yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {trending.map((t, idx) => (
                  <div key={t.id} onClick={() => router.push(`/case/${t.id}`)} className="cursor-pointer group flex items-start gap-4">
                    <span className="text-2xl font-black text-slate-200 mt-1">{idx + 1}</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 line-clamp-2 transition-colors leading-snug">{t.title}</h3>
                      <p className="text-sm font-medium text-slate-500 mt-1.5 flex items-center gap-2">
                        <span>Dr. {t.doctor.fullName}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md text-xs">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                          {t._count?.comments || 0}
                        </span>
                      </p>
                    </div>
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
