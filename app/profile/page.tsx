/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import VerificationBadge from "@/components/VerificationBadge";

type DoctorProfileData = {
  id: string;
  fullName: string;
  specialization?: string;
  hospital?: string;
  city?: string;
  qualification?: string;
  medicalCollege?: string;
  experienceYears?: number | null;
  bio?: string;
  websiteUrl?: string;
  profileImage?: string;
  coverImage?: string;
  isProfilePrivate?: boolean;
  email?: string;
  phoneNumber?: string;
  pmdcNumber?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  linkedinUrl?: string;
};

const COVER_PRESETS = [
  { name: "Clinical Blue", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80" },
  { name: "Lab Tech", url: "https://images.unsplash.com/photo-1579684389782-64d84b5e901f?w=1000&auto=format&fit=crop&q=80" },
  { name: "Clean Workspace", url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1000&auto=format&fit=crop&q=80" },
  { name: "Abstract Science", url: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=1000&auto=format&fit=crop&q=80" },
  { name: "Doctor Meeting", url: "https://images.unsplash.com/photo-1504813184591-01552ff75805?w=1000&auto=format&fit=crop&q=80" },
  { name: "Medical Abstract", url: "https://images.unsplash.com/photo-1584515901367-f134706ef53a?w=1000&auto=format&fit=crop&q=80" }
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarLightbox, setShowAvatarLightbox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showCoverLightbox, setShowCoverLightbox] = useState(false);
  const [showCoverPresetsModal, setShowCoverPresetsModal] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [doctor, setDoctor] = useState<DoctorProfileData | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    specialization: "",
    hospital: "",
    city: "",
    qualification: "",
    medicalCollege: "",
    experienceYears: "",
    bio: "",
    linkedinUrl: "",
    websiteUrl: "",
    profileImage: "",
    coverImage: "",
    isProfilePrivate: false,
  });

  const [myCases, setMyCases] = useState<any[]>([]);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "videos" | "photos" | "friends" | "about">("posts");

  const [friends, setFriends] = useState<any[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load profile");
        }
        const data = await res.json();
        setDoctor(data);
        setFormData({
          fullName: data.fullName || "",
          specialization: data.specialization || "",
          hospital: data.hospital || "",
          city: data.city || "",
          qualification: data.qualification || "",
          medicalCollege: data.medicalCollege || "",
          experienceYears: data.experienceYears ? data.experienceYears.toString() : "",
          bio: data.bio || "",
          linkedinUrl: data.linkedinUrl || "",
          websiteUrl: data.websiteUrl || "",
          profileImage: data.profileImage || "",
          coverImage: data.coverImage || "",
          isProfilePrivate: data.isProfilePrivate || false,
        });
        
        // Fetch posts for this doctor
        if (data.id) {
          fetch(`/api/cases?doctorId=${data.id}`)
            .then(r => r.json())
            .then(casesData => {
              if (Array.isArray(casesData)) {
                setMyCases(casesData);
              }
            }).catch(console.error);

          fetch(`/api/videos?doctorId=${data.id}`)
            .then(r => r.json())
            .then(videosData => {
              if (Array.isArray(videosData)) {
                setMyVideos(videosData);
              }
            }).catch(console.error);

          // Fetch friends
          fetch('/api/friends')
            .then(r => r.json())
            .then(friendsData => {
              setFriends(friendsData.friends || []);
              setFriendCount(friendsData.friendCount || 0);
            }).catch(console.error);
        }

        setLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleDeletePost = async (caseId: string) => {
    if (!confirm("Are you sure you want to delete this clinical case?")) return;
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyCases(prev => prev.filter(c => c.id !== caseId));
      } else {
        toast.error("Failed to delete case.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      setFormData(prev => ({ ...prev, profileImage: result.url }));
      
      // Auto save the new profile image to the backend immediately
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, profileImage: result.url }),
      });
      
      setDoctor(prev => prev ? { ...prev, profileImage: result.url } : null);
      setSuccess("Profile picture updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      setFormData(prev => ({ ...prev, coverImage: result.url }));

      // Auto save the new cover image to the backend immediately
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, coverImage: result.url }),
      });

      setDoctor(prev => prev ? { ...prev, coverImage: result.url } : null);
      setSuccess("Cover photo updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to upload cover image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await res.json()) as { doctor: DoctorProfileData; message?: string };

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setDoctor(data.doctor);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading your profile...</p>
      </div>
    );
  }

  const filteredFriends = friends.filter(f => 
    f.fullName.toLowerCase().includes(friendsSearchQuery.toLowerCase()) ||
    (f.specialization && f.specialization.toLowerCase().includes(friendsSearchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-12">
      {/* Header Container */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1100px] mx-auto">
          {/* Cover Photo */}
          <div 
            onClick={() => setShowCoverMenu(true)}
            className="h-48 sm:h-72 md:h-96 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative group overflow-hidden sm:rounded-b-2xl cursor-pointer hover:brightness-95 transition"
          >
            {(doctor?.coverImage) ? (
              <img src={doctor.coverImage || undefined} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500"></div>
            )}
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCoverMenu(true);
              }}
              className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white py-2 px-4 rounded-lg cursor-pointer shadow-md transition flex items-center gap-2 text-sm font-semibold backdrop-blur-sm z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>{uploading ? "Uploading..." : "Edit Cover Photo"}</span>
            </button>
            <input 
              type="file" 
              ref={coverFileInputRef}
              className="hidden" 
              accept="image/*" 
              onChange={handleCoverUpload} 
              disabled={uploading} 
            />
          </div>

          {/* Profile Name & Primary Actions */}
          <div className="px-4 pb-6 sm:px-8">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full md:w-auto mt-[-40px] md:mt-[-60px]">
                <div className="relative group/avatar shrink-0 z-10 mx-auto md:mx-0">
                  <div 
                    onClick={() => setShowAvatarMenu(true)}
                    className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl relative cursor-pointer group/img"
                  >
                    {doctor?.profileImage ? (
                      <img src={doctor.profileImage || undefined} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition duration-200">
                      <svg className="w-6 h-6 md:w-8 md:h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="text-[10px] md:text-xs font-bold text-center px-2">Update Photo</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAvatarMenu(true);
                    }}
                    className="absolute bottom-2 right-2 z-20 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full p-2.5 cursor-pointer shadow-md transition border-2 border-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploading} 
                  />
                </div>

                <div className="md:pt-16 text-center md:text-left w-full md:w-auto">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                    Dr. {doctor?.fullName}
                    {doctor && <VerificationBadge status={doctor.verificationStatus || (doctor.isVerified ? "VERIFIED" : "UNVERIFIED")} />}
                  </h1>
                  <p className="text-gray-600 font-medium text-lg mt-1">{doctor?.specialization || "General Medicine"}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 mt-4 text-sm text-gray-600 font-medium">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-gray-200">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                      License: {doctor?.pmdcNumber}
                    </span>
                    <button onClick={() => setActiveTab("friends")} className="bg-gray-100 px-3 py-1.5 rounded-full hover:bg-blue-50 transition text-gray-800 flex items-center gap-1.5 shadow-sm border border-gray-200">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      <span className="font-bold">{friendCount}</span> Connections
                    </button>
                    {doctor?.experienceYears && (
                      <span className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-gray-200">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="font-bold">{doctor.experienceYears} Yrs</span> Exp
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:pt-20">
                <button
                  onClick={() => router.push("/create-case")}
                  className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-full shadow-sm transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                  Add Case Post
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSuccess("");
                    setError("");
                  }}
                  className="flex-1 md:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2.5 px-6 rounded-full shadow-sm transition flex items-center justify-center gap-2 text-sm border border-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  Edit Profile
                </button>
                <button
                  onClick={() => router.push("/feed")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold p-2.5 rounded-full shadow-sm transition flex items-center justify-center border border-gray-200"
                  title="Back to Homepage"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pt-2 scrollbar-none">
              {(["posts", "videos", "photos", "friends", "about"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab !== "about") setIsEditing(false);
                  }}
                  className={`py-3.5 px-4 font-bold text-sm md:text-base border-b-4 transition whitespace-nowrap capitalize ${
                    activeTab === tab 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg"
                  }`}
                >
                  {tab === "posts" ? "Clinical Cases" : tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm">
            <p className="font-bold">Success</p>
            <p>{success}</p>
          </div>
        )}

        {/* Tab 1: Posts (Two-Column Layout) */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Sidebar Widgets) */}
            <div className="space-y-6">
              {/* Intro Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Intro</h2>
                <div className="space-y-4">
                  {doctor?.bio ? (
                    <p className="text-gray-800 text-sm text-center italic py-2 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      "{doctor.bio}"
                    </p>
                  ) : (
                    <button 
                      onClick={() => { setActiveTab("about"); setIsEditing(true); }}
                      className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold rounded-lg transition"
                    >
                      Add Bio
                    </button>
                  )}

                  <div className="space-y-3 text-sm text-gray-700">
                    {doctor?.specialization && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span>Specializes in <span className="font-semibold">{doctor.specialization}</span></span>
                      </div>
                    )}
                    {doctor?.hospital && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        <span>Works at <span className="font-semibold">{doctor.hospital}</span></span>
                      </div>
                    )}
                    {doctor?.city && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>Lives in <span className="font-semibold">{doctor.city}</span></span>
                      </div>
                    )}
                    {doctor?.experienceYears && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span><span className="font-semibold">{doctor.experienceYears} Years</span> of clinical experience</span>
                      </div>
                    )}
                    {doctor?.pmdcNumber && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span>PMDC No: <span className="font-semibold">{doctor.pmdcNumber}</span></span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <svg className={`w-5 h-5 shrink-0 ${doctor?.isVerified ? 'text-green-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className={`font-semibold ${doctor?.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                        {doctor?.isVerified ? 'Verified Account' : 'Verification Pending'}
                      </span>
                    </div>
                    {doctor?.linkedinUrl && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        <a href={doctor.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate font-semibold">LinkedIn Profile</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Friends Preview Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Friends</h2>
                    <p className="text-sm text-gray-500">{friendCount} friend{friendCount !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setActiveTab("friends")} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-semibold">
                    See all friends
                  </button>
                </div>
                
                {friends.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-sm">No friends added yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {friends.slice(0, 6).map(f => (
                      <div 
                        key={f.id} 
                        onClick={() => router.push(`/doctor/${f.id}`)}
                        className="cursor-pointer group text-center"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mb-1.5">
                          {f.profileImage ? (
                            <img src={f.profileImage || undefined} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                          ) : (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400 font-bold text-xl uppercase">
                              {f.fullName[0]}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-900 font-bold truncate">Dr. {f.fullName.split(" ")[0]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Clinical Feed & Post Button) */}
            <div className="lg:col-span-2 space-y-6">
              {/* "What's on your mind" Box */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {doctor?.profileImage ? (
                    <img src={doctor.profileImage || undefined} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">Dr</div>
                  )}
                </div>
                <button
                  onClick={() => router.push("/create-case")}
                  className="flex-1 text-left px-5 py-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-500 font-medium rounded-full transition text-sm sm:text-base outline-none"
                >
                  Share a clinical case or request consultation...
                </button>
              </div>

              {/* Feed List */}
              {myCases.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>
                  <p className="font-semibold text-lg text-gray-700">No Clinical Cases Posted Yet</p>
                  <p className="text-sm text-gray-400 mt-1">Cases you share will appear here on your feed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {myCases.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Post Header */}
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {doctor?.profileImage ? <img src={doctor.profileImage || undefined} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">Dr</div>}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm hover:underline cursor-pointer flex items-center gap-1.5">
                              Dr. {doctor?.fullName}
                              {doctor?.isVerified && (
                                <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                              )}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {c.specialty}</p>
                          </div>
                        </div>

                        {/* Post Actions Dropdown */}
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => router.push(`/create-case?edit=${c.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs font-bold"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePost(c.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-3 cursor-pointer" onClick={() => router.push(`/case/${c.id}`)}>
                        <h4 className="font-bold text-indigo-950 text-base md:text-lg mb-2">{c.title}</h4>
                        <p className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{c.description}</p>
                      </div>

                      {/* Post Image */}
                      {c.imageUrl && (
                        <div className="border-t border-b border-gray-100 overflow-hidden bg-gray-50 max-h-[450px] flex items-center justify-center cursor-pointer" onClick={() => router.push(`/case/${c.id}`)}>
                          <img src={c.imageUrl || undefined} alt={c.title} className="w-full object-contain max-h-[450px] hover:scale-[1.01] transition duration-200" />
                        </div>
                      )}

                      {/* Post Stats */}
                      <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center bg-blue-500 text-white rounded-full p-0.5"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a2 2 0 00-.8 1.6v.8z" /></svg></span>
                          <span>{c._count?.reactions || 0} Reactions</span>
                        </div>
                        <div className="flex gap-3">
                          <span>{c._count?.comments || 0} Comments</span>
                          <span>{c._count?.views || 0} Views</span>
                        </div>
                      </div>

                      {/* Post Interactive Buttons */}
                      <div className="px-2 py-1 flex gap-1 bg-white">
                        <button onClick={() => router.push(`/case/${c.id}`)} className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                          <span>Like</span>
                        </button>
                        <button onClick={() => router.push(`/case/${c.id}`)} className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                          <span>Comment</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Videos */}
        {activeTab === "videos" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Uploaded Videos</h2>
            {myVideos.length === 0 ? (
              <p className="text-center text-gray-500 py-10">You haven't uploaded any video cases yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myVideos.map(v => (
                  <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
                    <div className="aspect-video bg-gray-950 relative">
                      <video src={v.videoUrl} controls className="w-full h-full object-cover"></video>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{v.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">{new Date(v.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-700 text-sm line-clamp-2">{v.description}</p>
                      </div>
                      
                      <div className="flex gap-2 border-t border-gray-100 pt-4 mt-4">
                        <button 
                          onClick={() => {
                            const newTitle = prompt("Enter new title:", v.title);
                            if (newTitle === null) return;
                            const newDesc = prompt("Enter new description:", v.description);
                            if (newDesc === null) return;
                            
                            fetch(`/api/videos/${v.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ title: newTitle, description: newDesc })
                            }).then(res => {
                              if(res.ok) {
                                setMyVideos(myVideos.map(video => video.id === v.id ? {...video, title: newTitle, description: newDesc} : video));
                              } else {
                                toast.error('Failed to update video');
                              }
                            });
                          }} 
                          className="flex-1 text-center text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition font-bold text-sm"
                        >
                          Edit Details
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this video?")) {
                              fetch(`/api/videos/${v.id}`, { method: 'DELETE' })
                              .then(res => {
                                if(res.ok) {
                                  setMyVideos(myVideos.filter(video => video.id !== v.id));
                                } else {
                                  toast.error('Failed to delete video');
                                }
                              });
                            }
                          }} 
                          className="flex-1 text-center text-red-600 hover:bg-red-50 py-2 rounded-lg transition font-bold text-sm"
                        >
                          Delete Video
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Photos */}
        {activeTab === "photos" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Photos Directory</h2>
            {myCases.filter(c => c.imageUrl).length === 0 ? (
              <p className="text-center text-gray-500 py-10">You haven't uploaded any photos yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {myCases.filter(c => c.imageUrl).map(c => (
                  <div 
                    key={c.id} 
                    className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200 cursor-pointer"
                    onClick={() => router.push(`/case/${c.id}`)}
                  >
                    <img src={c.imageUrl || undefined} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-2.5">
                      <p className="text-white text-xs font-bold truncate w-full">{c.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Friends */}
        {activeTab === "friends" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Friends Directory</h2>
                <p className="text-sm text-gray-500">{friendCount} friend{friendCount !== 1 ? 's' : ''} total</p>
              </div>
              <div className="w-full sm:w-64 relative">
                <input 
                  type="text" 
                  placeholder="Search friends..." 
                  value={friendsSearchQuery}
                  onChange={(e) => setFriendsSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>

            {filteredFriends.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No friends found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredFriends.map(f => (
                  <div 
                    key={f.id} 
                    onClick={() => router.push(`/doctor/${f.id}`)}
                    className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center hover:shadow-md cursor-pointer transition bg-white"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {f.profileImage ? <img src={f.profileImage || undefined} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xl uppercase">{f.fullName[0]}</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 truncate">Dr. {f.fullName}</p>
                      <p className="text-xs text-blue-600 font-semibold truncate">{f.specialization || "Medical Practitioner"}</p>
                      {f.hospital && <p className="text-xs text-gray-500 truncate mt-0.5">{f.hospital}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: About (Details Card) */}
        {activeTab === "about" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              <button 
                type="button"
                onClick={() => setIsEditing(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-sm shadow-sm transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Details</h3>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p className="flex"><span className="w-24 text-gray-500 font-medium">Email:</span> <span className="font-semibold">{doctor?.email}</span></p>
                    <p className="flex"><span className="w-24 text-gray-500 font-medium">Phone:</span> <span className="font-semibold">{doctor?.phoneNumber}</span></p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Identity</h3>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p className="flex"><span className="w-24 text-gray-500 font-medium">PMDC No:</span> <span className="font-semibold">{doctor?.pmdcNumber}</span></p>
                    <p className="flex"><span className="w-24 text-gray-500 font-medium">Status:</span> <span className={`font-bold ${doctor?.isVerified ? 'text-green-600' : 'text-amber-500'}`}>{doctor?.isVerified ? '✓ Verified Practitioner' : 'Verification Pending'}</span></p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Career Summary</h3>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p className="flex"><span className="w-28 text-gray-500 font-medium">Hospital/Clinic:</span> <span className="font-semibold">{doctor?.hospital || "-"}</span></p>
                    <p className="flex"><span className="w-28 text-gray-500 font-medium">City:</span> <span className="font-semibold">{doctor?.city || "-"}</span></p>
                    <p className="flex"><span className="w-28 text-gray-500 font-medium">Experience:</span> <span className="font-semibold">{doctor?.experienceYears ? `${doctor.experienceYears} Years` : "-"}</span></p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Qualifications</h3>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p className="flex"><span className="w-24 text-gray-500 font-medium">Highest Cert:</span> <span className="font-semibold">{doctor?.qualification || "-"}</span></p>
                    <p className="flex"><span className="w-24 text-gray-500 font-medium">College:</span> <span className="font-semibold">{doctor?.medicalCollege || "-"}</span></p>
                  </div>
                </div>
              </div>

              {doctor?.bio && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bio / Professional Statement</h3>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{doctor.bio}</p>
                </div>
              )}

              {(doctor?.linkedinUrl || doctor?.websiteUrl) && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Links</h3>
                  <div className="flex gap-4">
                    {doctor?.linkedinUrl && <a href={doctor.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1.5"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.5 19H4.5V9h3v10zM6 7.5C4.62 7.5 3.5 6.38 3.5 5S4.62 2.5 6 2.5 8.5 3.62 8.5 5 7.38 7.5 6 7.5zM19.5 19h-3v-5.6c0-3.37-4-3.11-4 0V19h-3V9h3v1.77c1.4-2.59 7-2.78 7 2.48V19z"/></svg> LinkedIn</a>}
                    {doctor?.websiteUrl && <a href={doctor.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9"></path></svg> Website</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Facebook-style Avatar Options Modal */}
      {showAvatarMenu && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Profile Picture</h3>
              <button 
                type="button"
                onClick={() => setShowAvatarMenu(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1.5 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-3 space-y-1">
              {doctor?.profileImage && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarMenu(false);
                    setShowAvatarLightbox(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-xl transition text-gray-700 font-semibold text-sm"
                >
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">View Profile Picture</div>
                    <div className="text-xs text-gray-500 font-normal">See your profile photo in full size</div>
                  </div>
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setShowAvatarMenu(false);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-xl transition text-gray-700 font-semibold text-sm"
              >
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Upload New Photo</div>
                  <div className="text-xs text-gray-500 font-normal">Choose a photo from your device</div>
                </div>
              </button>
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAvatarMenu(false)}
                className="w-full py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-center transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Lightbox */}
      {showAvatarLightbox && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in">
          {/* Close button top right */}
          <button
            type="button"
            onClick={() => setShowAvatarLightbox(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition backdrop-blur-md z-[10000]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          {/* Image */}
          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <img 
              src={doctor?.profileImage || undefined} 
              alt="Profile" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
          
          {/* Name overlay footer */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <h4 className="text-white text-lg font-bold">Dr. {doctor?.fullName}</h4>
            <p className="text-gray-400 text-sm">{doctor?.specialization || "General Medicine"}</p>
          </div>
        </div>
      )}

      {/* Facebook-style Cover Photo Options Modal */}
      {showCoverMenu && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Cover Photo</h3>
              <button 
                type="button"
                onClick={() => setShowCoverMenu(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1.5 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-3 space-y-1">
              {doctor?.coverImage && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCoverMenu(false);
                    setShowCoverLightbox(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-xl transition text-gray-700 font-semibold text-sm"
                >
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">View Cover Photo</div>
                    <div className="text-xs text-gray-500 font-normal">See your cover background image in full size</div>
                  </div>
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setShowCoverMenu(false);
                  coverFileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-xl transition text-gray-700 font-semibold text-sm"
              >
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Upload New Photo</div>
                  <div className="text-xs text-gray-500 font-normal">Upload a background image from your device</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCoverMenu(false);
                  setShowCoverPresetsModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-xl transition text-gray-700 font-semibold text-sm"
              >
                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Choose from Presets</div>
                  <div className="text-xs text-gray-500 font-normal">Select from premium default background designs</div>
                </div>
              </button>
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCoverMenu(false)}
                className="w-full py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-center transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Photo Lightbox */}
      {showCoverLightbox && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in">
          {/* Close button top right */}
          <button
            type="button"
            onClick={() => setShowCoverLightbox(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition backdrop-blur-md z-[10000]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          {/* Image */}
          <div className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center">
            <img 
              src={doctor?.coverImage || undefined} 
              alt="Cover" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
          
          {/* Footer details */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <h4 className="text-white text-lg font-bold">Dr. {doctor?.fullName} — Cover Photo</h4>
          </div>
        </div>
      )}

      {/* Cover Presets Modal Dialog (Facebook style selection) */}
      {showCoverPresetsModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Select Cover Preset</h3>
              <button 
                type="button"
                onClick={() => setShowCoverPresetsModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1.5 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {COVER_PRESETS.map((preset) => (
                  <div 
                    key={preset.name}
                    onClick={async () => {
                      setShowCoverPresetsModal(false);
                      setUploading(true);
                      try {
                        setFormData(prev => ({ ...prev, coverImage: preset.url }));
                        await fetch("/api/profile", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...formData, coverImage: preset.url }),
                        });
                        setDoctor(prev => prev ? { ...prev, coverImage: preset.url } : null);
                        setSuccess("Cover photo updated successfully!");
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className={`relative cursor-pointer aspect-[3/1.8] rounded-xl overflow-hidden border-2 transition ${
                      doctor?.coverImage === preset.url ? "border-blue-600 ring-4 ring-blue-100" : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                      <span className="text-xs text-white font-bold text-center">{preset.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCoverPresetsModal(false)}
                className="py-2 px-5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-center transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Edit Profile Details</h3>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1.5 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                
                {/* Visuals Quick Edit Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between gap-3 border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">Profile Picture</h4>
                      <p className="text-xs text-gray-500">Update your account avatar</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setShowAvatarMenu(true);
                      }}
                      className="bg-white hover:bg-gray-50 border border-gray-300 text-blue-600 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Change
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between gap-3 border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">Cover Background</h4>
                      <p className="text-xs text-gray-500">Change your profile banner</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setShowCoverMenu(true);
                      }}
                      className="bg-white hover:bg-gray-50 border border-gray-300 text-blue-600 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specialization</label>
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hospital / Clinic</label>
                    <input type="text" name="hospital" value={formData.hospital} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Highest Qualification</label>
                    <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. MBBS, FCPS" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medical College</label>
                    <input type="text" name="medicalCollege" value={formData.medicalCollege} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Years of Experience</label>
                    <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} min="0" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn URL</label>
                    <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website URL</label>
                    <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition" />
                  </div>
                  
                  <div className="md:col-span-2 flex items-center gap-3 py-1 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-150">
                    <input
                      type="checkbox"
                      id="isProfilePrivate"
                      name="isProfilePrivate"
                      checked={formData.isProfilePrivate}
                      onChange={(e) => setFormData({ ...formData, isProfilePrivate: e.target.checked })}
                      className="h-4.5 w-4.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="isProfilePrivate" className="text-xs text-gray-700 font-bold cursor-pointer">Keep my clinical cases private (visible only to mutual friends)</label>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio (max 500 characters)</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} maxLength={500} rows={3} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm transition"></textarea>
                  </div>
                </div>

              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving || uploading} 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-sm transition text-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
