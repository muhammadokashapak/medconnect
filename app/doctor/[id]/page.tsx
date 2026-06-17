/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import VerificationBadge from "@/components/VerificationBadge";

type DoctorProfile = {
  id: string;
  fullName: string;
  specialization?: string;
  hospital?: string;
  city?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  pmdcNumber?: string;
  experienceYears?: number | null;
  qualification?: string;
  medicalCollege?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  isProfilePrivate?: boolean;
  isFriend?: boolean;
  friendRequestStatus?: string | null;
  posts?: Array<{
    id: string;
    title: string;
    specialty: string;
    description: string;
    imageUrl?: string | null;
    createdAt: string;
    _count: { reactions: number; comments: number; views: number };
  }>;
  videos?: Array<{
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    createdAt: string;
  }>;
  appointment?: any;
};

export default function DoctorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [friendUpdating, setFriendUpdating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "videos" | "photos" | "friends" | "about">("posts");

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [notes, setNotes] = useState("");

  const [friends, setFriends] = useState<any[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [mutualFriends, setMutualFriends] = useState<any[]>([]);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const [showAvatarLightbox, setShowAvatarLightbox] = useState(false);
  const [showCoverLightbox, setShowCoverLightbox] = useState(false);

  const loadDoctorProfile = async () => {
    try {
      const res = await fetch(`/api/doctors/${params?.id}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to load doctor profile");
      }
      const doctorData = await res.json();
      setDoctor(doctorData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load doctor profile";
      setError(message);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, doctorRes] = await Promise.all([
          fetch("/api/profile"),
          fetch(`/api/doctors/${params?.id}`),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentDoctorId(profileData.id);

          // Fetch mutual friends (only if viewing another doctor's profile)
          if (profileData.id !== String(params?.id)) {
            const mutualRes = await fetch(`/api/friends/mutual?doctorId=${params?.id}`);
            if (mutualRes.ok) {
              const mutualData = await mutualRes.json();
              setMutualFriends(mutualData.mutualFriends || []);
            }
          }
        }

        if (!doctorRes.ok) {
          if (doctorRes.status === 401) {
            router.push("/login");
            return;
          }
          const errorData = await doctorRes.json();
          throw new Error(errorData?.message || "Failed to load doctor profile");
        }

        const doctorData = await doctorRes.json();
        setDoctor(doctorData);

        // Fetch friends
        const friendsRes = await fetch(`/api/friends?doctorId=${params?.id}`);
        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          setFriends(friendsData.friends || []);
          setFriendCount(friendsData.friendCount || 0);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load doctor profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [params?.id, router]);

  const handleFriendToggle = async () => {
    if (!doctor || doctor.isFriend || doctor.friendRequestStatus === "PENDING") return;
    setFriendUpdating(true);

    try {
      const res = await fetch("/api/friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", targetId: doctor.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Unable to send friend request");
      }

      await loadDoctorProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send friend request";
      toast.error(message);
    } finally {
      setFriendUpdating(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!doctor || !proposedDate || !proposedTime) return;
    setBookingAppointment(true);

    try {
      const dateTime = new Date(`${proposedDate}T${proposedTime}`);
      
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultantId: doctor.id,
          scheduledAt: dateTime.toISOString(),
          notes: notes
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Unable to book appointment");
      }

      setShowAppointmentModal(false);
      await loadDoctorProfile();
      toast.success("Appointment request sent successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to book appointment";
      toast.error(message);
    } finally {
      setBookingAppointment(false);
    }
  };

  const handleMessageClick = async () => {
    if (!doctor) return;
    setMessaging(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDoctorId: doctor.id }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      } else {
        toast.error("Failed to start conversation.");
      }
    } catch (err) {
      toast.error("Error starting conversation.");
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5] px-4 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-bold text-xl">{error || "Doctor profile not found"}</p>
        <button onClick={() => router.back()} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-indigo-700 transition">Go Back</button>
      </div>
    );
  }

  const renderFriendButton = () => {
    if (doctor.isFriend) {
      return (
        <div className="relative flex-1 sm:flex-none">
          <button 
            onClick={() => setShowUnfriendConfirm(!showUnfriendConfirm)} 
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg shadow-sm font-bold transition text-sm flex items-center justify-center gap-1.5 bg-green-600 text-white hover:bg-green-700"
          >
            <span>✓ Friends</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {showUnfriendConfirm && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 w-48">
              <button 
                onClick={async () => {
                  setShowUnfriendConfirm(false);
                  setFriendUpdating(true);
                  try {
                    await fetch('/api/friend-request', { 
                      method: 'POST', 
                      headers: {'Content-Type':'application/json'}, 
                      body: JSON.stringify({ action: 'unfriend', targetId: doctor.id }) 
                    });
                    await loadDoctorProfile();
                    const friendsRes = await fetch(`/api/friends?doctorId=${params?.id}`);
                    if (friendsRes.ok) { 
                      const d = await friendsRes.json(); 
                      setFriends(d.friends||[]); 
                      setFriendCount(d.friendCount||0); 
                    }
                  } catch(e) { 
                    toast.error('Failed to unfriend'); 
                  }
                  setFriendUpdating(false);
                }}
                className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-bold text-sm transition"
              >
                Unfriend Dr. {doctor.fullName.split(" ")[0]}
              </button>
            </div>
          )}
        </div>
      );
    } else if (doctor.friendRequestStatus === "PENDING") {
      return (
        <button disabled className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg shadow-sm font-bold text-sm flex items-center justify-center bg-gray-200 text-gray-600 cursor-not-allowed">
          Request Sent
        </button>
      );
    } else {
      return (
        <button
          onClick={handleFriendToggle}
          disabled={friendUpdating}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg shadow-sm font-bold text-sm flex items-center justify-center bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 transition"
        >
          {friendUpdating ? "Sending..." : "Add Friend"}
        </button>
      );
    }
  };

  const isProfileAccessible = !doctor.isProfilePrivate || doctor.isFriend || currentDoctorId === doctor.id;

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
            onClick={() => doctor.coverImage && setShowCoverLightbox(true)}
            className={`h-48 sm:h-72 md:h-96 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden sm:rounded-b-2xl ${
              doctor.coverImage ? "cursor-pointer hover:brightness-95 transition" : ""
            }`}
          >
            {doctor.coverImage ? (
              <img src={doctor.coverImage || undefined} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            )}
          </div>

          {/* Profile Details Header */}
          <div className="px-4 py-6 sm:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-16 md:-mt-24 gap-4 pb-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                <div 
                  onClick={() => doctor.profileImage && setShowAvatarLightbox(true)}
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl relative z-10 shrink-0 ${
                    doctor.profileImage ? "cursor-pointer group/avatar hover:brightness-95 transition" : ""
                  }`}
                >
                  {doctor.profileImage ? (
                    <img src={doctor.profileImage || undefined} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-400 text-5xl font-bold">
                      {doctor.fullName[0]}
                    </div>
                  )}
                  {doctor.profileImage && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition duration-200">
                      <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="md:pt-4">
                  <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                    Dr. {doctor.fullName}
                    <VerificationBadge status={doctor.verificationStatus || (doctor.isVerified ? "VERIFIED" : "UNVERIFIED")} />
                  </h1>
                  <p className="text-gray-600 font-semibold text-lg">{doctor.specialization || "General Medicine"}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2 text-sm text-gray-500">
                    <span>License/Reg No: {doctor.pmdcNumber || "N/A"}</span>
                    <span>•</span>
                    <span className="font-bold text-gray-800">{friendCount} friend{friendCount !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Mutual Friends Stack */}
                  {currentDoctorId && currentDoctorId !== doctor.id && mutualFriends.length > 0 && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-xs text-gray-500">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {mutualFriends.slice(0, 3).map(mf => (
                          <div key={mf.id} className="w-6 h-6 rounded-full border border-white overflow-hidden bg-gray-200" title={mf.fullName}>
                            {mf.profileImage ? <img src={mf.profileImage || undefined} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-500">{mf.fullName[0]}</div>}
                          </div>
                        ))}
                      </div>
                      <p>
                        <span className="font-bold text-gray-700">{mutualFriends.length} mutual friend{mutualFriends.length !== 1 ? 's' : ''}</span>
                        {mutualFriends.length > 0 && <> including <span className="font-semibold text-gray-800">Dr. {mutualFriends[0].fullName}</span></>}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-center">
                <button
                  onClick={handleMessageClick}
                  disabled={messaging}
                  className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  <span>{messaging ? "Wait..." : "Message"}</span>
                </button>

                {currentDoctorId && currentDoctorId !== doctor.id && (
                  <>
                    {/* Voice Call */}
                    <button
                      onClick={() => {
                        const roomId = `call_${[currentDoctorId, doctor.id].sort().join('_')}`;
                        fetch('/api/call-notify', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ targetDoctorId: doctor.id, callType: 'AUDIO', roomId }) });
                        router.push(`/video/${roomId}`);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg shadow-sm transition flex items-center justify-center"
                      title="Voice Call"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </button>

                    {/* Video Call */}
                    <button
                      onClick={() => {
                        const roomId = `call_${[currentDoctorId, doctor.id].sort().join('_')}`;
                        fetch('/api/call-notify', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ targetDoctorId: doctor.id, callType: 'VIDEO', roomId }) });
                        router.push(`/video/${roomId}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg shadow-sm transition flex items-center justify-center"
                      title="Video Call"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>

                    {doctor.appointment ? (
                      <button disabled className="px-5 py-2.5 rounded-lg shadow-sm font-bold text-sm flex items-center justify-center bg-gray-100 text-gray-500 cursor-not-allowed">
                        {doctor.appointment.status === "PENDING" ? "Pending Appt" : "Scheduled"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAppointmentModal(true)}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm font-bold text-sm flex items-center justify-center"
                      >
                        Book Appt
                      </button>
                    )}
                    
                    {renderFriendButton()}
                  </>
                )}
                <button
                  onClick={() => router.back()}
                  className="bg-[#E4E6EB] hover:bg-[#D8DADF] text-gray-900 font-bold p-2.5 rounded-lg shadow-sm transition flex items-center justify-center"
                  title="Go Back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pt-2 scrollbar-none">
              {(["posts", "videos", "photos", "friends", "about"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 px-4 font-bold text-sm md:text-base border-b-4 transition whitespace-nowrap capitalize ${
                    activeTab === tab 
                      ? "border-indigo-600 text-indigo-600" 
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
        {/* If private and not mutually friended */}
        {!isProfileAccessible && activeTab !== "about" ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md mx-auto shadow-sm mt-8">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">This Profile is Private</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">Only mutual friends of Dr. {doctor.fullName} can view their clinical cases, videos, photos and friends directory.</p>
            {doctor.friendRequestStatus === "PENDING" ? (
              <span className="inline-block bg-gray-100 text-gray-500 font-bold px-6 py-2.5 rounded-lg text-sm">Friend Request Pending</span>
            ) : (
              <button 
                onClick={handleFriendToggle}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition"
              >
                Send Friend Request
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Tab 1: Posts (Two-Column Layout) */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Sidebar Widgets) */}
                <div className="space-y-6">
                  {/* Intro Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Intro</h2>
                    <div className="space-y-4">
                      {doctor.bio && (
                        <p className="text-gray-800 text-sm text-center italic py-2 bg-gray-50 rounded-lg whitespace-pre-wrap">
                          "{doctor.bio}"
                        </p>
                      )}

                      <div className="space-y-3 text-sm text-gray-700">
                        {doctor.specialization && (
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span>Specializes in <span className="font-semibold text-gray-950">{doctor.specialization}</span></span>
                          </div>
                        )}
                        {doctor.hospital && (
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            <span>Works at <span className="font-semibold text-gray-950">{doctor.hospital}</span></span>
                          </div>
                        )}
                        {doctor.city && (
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>Based in <span className="font-semibold text-gray-950">{doctor.city}</span></span>
                          </div>
                        )}
                        {doctor.experienceYears && (
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>Has <span className="font-semibold text-gray-950">{doctor.experienceYears} Years</span> of clinical experience</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Friends Preview Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Friends</h2>
                        <p className="text-sm text-gray-500">{friendCount} friend{friendCount !== 1 ? 's' : ''}</p>
                      </div>
                      <button onClick={() => setActiveTab("friends")} className="text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition font-semibold">
                        See all
                      </button>
                    </div>
                    
                    {friends.length === 0 ? (
                      <p className="text-center text-gray-500 py-6 text-sm">No friends to show.</p>
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
                            <p className="text-xs text-gray-950 font-bold truncate">Dr. {f.fullName.split(" ")[0]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (Clinical Posts) */}
                <div className="lg:col-span-2 space-y-6">
                  {(!doctor.posts || doctor.posts.length === 0) ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>
                      <p className="font-semibold text-lg text-gray-700">No Clinical Cases Shared Yet</p>
                      <p className="text-sm text-gray-400 mt-1">Check back later or invite them to share case files.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {doctor.posts.map(post => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          {/* Post Header */}
                          <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                {doctor.profileImage ? <img src={doctor.profileImage || undefined} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">{doctor.fullName[0]}</div>}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm hover:underline cursor-pointer flex items-center gap-1.5">
                                  Dr. {doctor.fullName}
                                  <VerificationBadge status={doctor.verificationStatus || (doctor.isVerified ? "VERIFIED" : "UNVERIFIED")} className="w-4 h-4" />
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {post.specialty}</p>
                              </div>
                            </div>
                          </div>

                          {/* Post Content */}
                          <div className="px-4 pb-3 cursor-pointer" onClick={() => router.push(`/case/${post.id}`)}>
                            <h4 className="font-bold text-indigo-950 text-base md:text-lg mb-2">{post.title}</h4>
                            <p className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{post.description}</p>
                          </div>

                          {/* Post Image */}
                          {post.imageUrl && (
                            <div className="border-t border-b border-gray-100 overflow-hidden bg-gray-50 max-h-[450px] flex items-center justify-center cursor-pointer" onClick={() => router.push(`/case/${post.id}`)}>
                              <img src={post.imageUrl || undefined} alt={post.title} className="w-full object-contain max-h-[450px]" />
                            </div>
                          )}

                          {/* Post Stats */}
                          <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between text-xs text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center justify-center bg-blue-500 text-white rounded-full p-0.5"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a2 2 0 00-.8 1.6v.8z" /></svg></span>
                              <span>{post._count?.reactions || 0} Reactions</span>
                            </div>
                            <div className="flex gap-3">
                              <span>{post._count?.comments || 0} Comments</span>
                              <span>{post._count?.views || 0} Views</span>
                            </div>
                          </div>

                          {/* Post Interactive Buttons */}
                          <div className="px-2 py-1 flex gap-1 bg-white">
                            <button onClick={() => router.push(`/case/${post.id}`)} className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm transition">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                              <span>Like</span>
                            </button>
                            <button onClick={() => router.push(`/case/${post.id}`)} className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm transition">
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Videos Shared</h2>
                {(!doctor.videos || doctor.videos.length === 0) ? (
                  <p className="text-center text-gray-500 py-10">No videos available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {doctor.videos.map(v => (
                      <div key={v.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                        <div className="aspect-video bg-gray-900 relative">
                          <video src={v.videoUrl} controls className="w-full h-full object-cover"></video>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{v.title}</h3>
                          <p className="text-xs text-gray-500 mb-2">{new Date(v.createdAt).toLocaleDateString()}</p>
                          <p className="text-gray-700 text-sm line-clamp-2">{v.description}</p>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Photos</h2>
                {(!doctor.posts || doctor.posts.filter(p => p.imageUrl).length === 0) ? (
                  <p className="text-center text-gray-500 py-10">No photos shared.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {doctor.posts.filter(p => p.imageUrl).map(post => (
                      <div 
                        key={post.id} 
                        className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200 cursor-pointer"
                        onClick={() => router.push(`/case/${post.id}`)}
                      >
                        <img src={post.imageUrl || undefined} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-2.5">
                          <p className="text-white text-xs font-bold truncate w-full">{post.title}</p>
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
                    <p className="text-sm text-gray-500">{friendCount} total friends</p>
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
                          <p className="text-xs text-blue-600 font-semibold truncate">{f.specialization || "Practitioner"}</p>
                          {f.hospital && <p className="text-xs text-gray-500 truncate mt-0.5">{f.hospital}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab 5: About (Always accessible even if profile is private) */}
        {activeTab === "about" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">About Dr. {doctor.fullName}</h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hospital Affiliation</h3>
                  <p className="text-sm text-gray-800 font-semibold">{doctor.hospital || "Not Specified"}</p>
                  <p className="text-xs text-gray-500 mt-1">{doctor.city || ""}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clinical Qualifications</h3>
                  <p className="text-sm text-gray-800 font-semibold">{doctor.qualification || "-"}</p>
                  <p className="text-xs text-gray-500 mt-1">Graduated from: {doctor.medicalCollege || "Not Specified"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Years Active</h3>
                  <p className="text-sm text-gray-800 font-semibold">{doctor.experienceYears ? `${doctor.experienceYears} Years` : "-"}</p>
                  <p className="text-xs text-gray-500 mt-1">Clinical field practice</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Details</h3>
                  <p className="text-xs text-gray-500">Contact detail visibility is determined by account privacy.</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-800">
                    <p className="flex"><span className="w-24 text-gray-500 font-medium">License No:</span> <span className="font-semibold">{doctor.pmdcNumber || "-"}</span></p>
                  </div>
                </div>
              </div>

              {doctor.bio && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Biography</h3>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{doctor.bio}</p>
                </div>
              )}

              {(doctor.linkedinUrl || doctor.websiteUrl) && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Directory Links</h3>
                  <div className="flex gap-4">
                    {doctor.linkedinUrl && <a href={doctor.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm font-semibold flex items-center gap-1.5"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.5 19H4.5V9h3v10zM6 7.5C4.62 7.5 3.5 6.38 3.5 5S4.62 2.5 6 2.5 8.5 3.62 8.5 5 7.38 7.5 6 7.5zM19.5 19h-3v-5.6c0-3.37-4-3.11-4 0V19h-3V9h3v1.77c1.4-2.59 7-2.78 7 2.48V19z"/></svg> LinkedIn</a>}
                    {doctor.websiteUrl && <a href={doctor.websiteUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm font-semibold flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9"></path></svg> Website</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unfriend Dropdown Trigger Overlay */}
      {showUnfriendConfirm && <div className="fixed inset-0 z-40" onClick={() => setShowUnfriendConfirm(false)}></div>}

      {/* Appointment Booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Book Appointment</h3>
              <button onClick={() => setShowAppointmentModal(false)} className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">Suggest a date and time for your appointment request with Dr. {doctor.fullName}. The exact consultation schedule will be finalized once they approve.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Proposed Date</label>
                  <input type="date" value={proposedDate} onChange={e => setProposedDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-black transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Proposed Time</label>
                  <input type="time" value={proposedTime} onChange={e => setProposedTime(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-black transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Consultation Notes (Optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Provide details about symptoms, queries, or clinical concern..." className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-black transition"></textarea>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button disabled={bookingAppointment} onClick={() => setShowAppointmentModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold transition text-sm">Cancel</button>
                <button disabled={bookingAppointment || !proposedDate || !proposedTime} onClick={handleBookAppointment} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold disabled:opacity-50 transition text-sm">
                  {bookingAppointment ? "Sending..." : "Send Request"}
                </button>
              </div>
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
              src={doctor.profileImage || undefined} 
              alt="Profile" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
          
          {/* Name overlay footer */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <h4 className="text-white text-lg font-bold">Dr. {doctor.fullName}</h4>
            <p className="text-gray-400 text-sm">{doctor.specialization || "General Medicine"}</p>
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
              src={doctor.coverImage || undefined} 
              alt="Cover" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
          
          {/* Footer details */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <h4 className="text-white text-lg font-bold">Dr. {doctor.fullName} — Cover Photo</h4>
          </div>
        </div>
      )}
    </div>
  );
}
