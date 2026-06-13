"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DoctorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctor();
  }, [params?.id]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/doctors/${params?.id}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Failed to load doctor profile or doctor not verified");
      }
      const data = await res.json();
      setDoctor(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async () => {
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
    } catch (err: any) {
      alert(err.message);
      setMessaging(false);
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
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div className="relative -mt-16 mb-4 md:mb-0">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
                  {doctor.profileImage ? (
                    <img src={doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </div>
              </div>
              
              <div className="mt-4 md:mt-6">
                <button
                  onClick={handleMessageClick}
                  disabled={messaging}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow hover:bg-indigo-700 transition font-bold disabled:opacity-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  {messaging ? "Starting Chat..." : "Message Doctor"}
                </button>
              </div>
            </div>

            <div className="mt-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                Dr. {doctor.fullName}
                <svg className="w-6 h-6 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </h1>
              <p className="text-xl text-indigo-600 font-medium mt-1">{doctor.specialization || "General Medicine"}</p>
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
                  <div className="flex space-x-4">
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
        </div>
      </div>
    </div>
  );
}
