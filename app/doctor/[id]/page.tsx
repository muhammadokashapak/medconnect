/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type DoctorProfile = {
  id: string;
  fullName: string;
  specialization?: string;
  hospital?: string;
  city?: string;
  bio?: string;
  profileImage?: string;
  experienceYears?: number | null;
  qualification?: string;
  medicalCollege?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  isVerified?: boolean;
  isProfilePrivate?: boolean;
  isFriend?: boolean;
  posts?: Array<{
    id: string;
    title: string;
    specialty: string;
    description: string;
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
  const [activeTab, setActiveTab] = useState<"posts" | "videos" | "photos">("posts");

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
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load doctor profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [params?.id, router]);

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
      if (!res.ok) throw new Error(data.message || "Failed to start conversation");
      router.push(`/messages/${data.conversationId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start conversation";
      alert(message);
    } finally {
      setMessaging(false);
    }
  };

  const handleFriendToggle = async () => {
    if (!doctor) return;
    setFriendUpdating(true);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: doctor.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Unable to update friend status");
      }

      await loadDoctorProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update friend status";
      alert(message);
    } finally {
      setFriendUpdating(false);
    }
  };

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (error || !doctor) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "Doctor not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition font-medium"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </button>

        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="bg-indigo-600 h-32"></div>
          <div className="px-6 md:px-10 pb-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-16 mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg shrink-0">
                {doctor.profileImage ? (
                  <img src={doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left mt-2 md:mt-16">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                  Dr. {doctor.fullName}
                  {doctor.isVerified && (
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  )}
                </h1>
                <p className="text-lg md:text-xl text-indigo-600 font-medium mt-1">{doctor.specialization || "General Medicine"}</p>
                
                {/* Buttons Row */}
                <div className="flex flex-row justify-center md:justify-start gap-3 mt-4 w-full sm:w-auto">
                  <button
                    onClick={handleMessageClick}
                    disabled={messaging}
                    className="flex-1 sm:flex-none bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-indigo-700 transition font-bold disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 mr-2 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    {messaging ? "Wait..." : "Message"}
                  </button>
                  
                  {currentDoctorId && currentDoctorId !== doctor.id && (
                    <button
                      onClick={handleFriendToggle}
                      disabled={friendUpdating}
                      className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg shadow font-bold transition text-sm sm:text-base flex items-center justify-center ${doctor.isFriend ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'}`}
                    >
                      {doctor.isFriend ? 'Friends' : 'Add Friend'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t pt-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Professional Details</h3>
                <div className="space-y-3 text-gray-900">
                  <p className="flex"><span className="w-32 text-gray-500 font-medium">Hospital:</span> {doctor.hospital || "-"}</p>
                  <p className="flex"><span className="w-32 text-gray-500 font-medium">City:</span> {doctor.city || "-"}</p>
                  <p className="flex"><span className="w-32 text-gray-500 font-medium">Experience:</span> {doctor.experienceYears ? `${doctor.experienceYears} Years` : "-"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Education</h3>
                <div className="space-y-3 text-gray-900">
                  <p className="flex"><span className="w-32 text-gray-500 font-medium">Qualification:</span> {doctor.qualification || "-"}</p>
                  <p className="flex"><span className="w-32 text-gray-500 font-medium">College:</span> {doctor.medicalCollege || "-"}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Biography</h3>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {doctor.bio || "No professional biography provided."}
                </p>
              </div>

              {(doctor.linkedinUrl || doctor.websiteUrl) && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Links</h3>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 gap-2">
                    {doctor.linkedinUrl && (
                      <a href={doctor.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">LinkedIn Profile</a>
                    )}
                    {doctor.websiteUrl && (
                      <a href={doctor.websiteUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">Personal Website</a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Activity</h2>
                <p className="text-sm text-gray-500">{doctor.isProfilePrivate ? 'Content is visible only to mutual friends.' : 'Anyone can view this content.'}</p>
              </div>
              {doctor.isProfilePrivate && !doctor.isFriend && currentDoctorId !== doctor.id && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Private</span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'posts' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('posts')}
              >
                Cases / Posts
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'photos' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('photos')}
              >
                Photos
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'videos' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('videos')}
              >
                Videos
              </button>
            </div>

            {activeTab === 'posts' && (
              doctor.posts?.length ? (
                <div className="space-y-4">
                  {doctor.posts.map((post) => (
                    <div key={post.id} className="border rounded-2xl p-4 hover:shadow-lg transition bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                          <h3 className="text-lg font-semibold text-gray-900 mt-2">{post.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{post.specialty}</span>
                          <span className="px-2 py-1 bg-white border rounded-full">{post._count.reactions} Likes</span>
                          <span className="px-2 py-1 bg-white border rounded-full">{post._count.comments} Comments</span>
                        </div>
                      </div>
                      <p className="mt-3 text-gray-700 line-clamp-3">{post.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => router.push(`/case/${post.id}`)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {currentDoctorId === doctor.id
                    ? 'You have no posts yet. Share a case to start engagement.'
                    : (doctor.isProfilePrivate && !doctor.isFriend ? 'This profile is private. Add as friend to see posts.' : 'No posts available yet.')
                  }
                </div>
              )
            )}

            {activeTab === 'photos' && (
              doctor.posts?.filter(p => p.imageUrl).length ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {doctor.posts.filter(p => p.imageUrl).map(post => (
                    <div key={post.id} className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200" onClick={() => router.push(`/case/${post.id}`)}>
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <p className="text-white text-sm font-bold px-2 text-center truncate w-full">{post.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {currentDoctorId === doctor.id
                    ? 'You have no photos yet. Share a case with an image to show it here.'
                    : (doctor.isProfilePrivate && !doctor.isFriend ? 'This profile is private. Add as friend to see photos.' : 'No photos available yet.')
                  }
                </div>
              )
            )}

            {activeTab === 'videos' && (
              doctor.videos?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctor.videos.map(v => (
                    <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                      <div className="aspect-video bg-gray-900 relative">
                        <video src={v.videoUrl} controls className="w-full h-full object-cover"></video>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{v.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{new Date(v.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-700 line-clamp-2">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {currentDoctorId === doctor.id
                    ? 'You have no videos yet. Upload a video to share with others.'
                    : (doctor.isProfilePrivate && !doctor.isFriend ? 'This profile is private. Add as friend to see videos.' : 'No videos available yet.')
                  }
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
