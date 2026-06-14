/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  linkedinUrl?: string;
  websiteUrl?: string;
  profileImage?: string;
  isProfilePrivate?: boolean;
  email?: string;
  phoneNumber?: string;
  pmdcNumber?: string;
  isVerified?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
    isProfilePrivate: false,
  });

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
          isProfilePrivate: data.isProfilePrivate || false,
        });
        setLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

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

      setFormData({ ...formData, profileImage: result.url });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to upload image");
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
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Doctor Profile</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/feed")}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium"
            >Back to Homepage</button>
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setSuccess("");
                setError("");
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition w-full sm:w-auto text-center"
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-6">{success}</div>}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-indigo-100">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-600 text-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                Dr. {doctor?.fullName}
                {doctor?.isVerified && (
                  <svg className="w-6 h-6 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                )}
              </h2>
              <p className="text-gray-500">{doctor?.specialization || "Specialization not specified"}</p>
              <p className="text-sm text-gray-500 mt-1">PMDC: {doctor?.pmdcNumber} • {doctor?.isVerified ? "Verified" : "Verification Pending"}</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-2 text-gray-900">
                  <p>Email: {doctor?.email}</p>
                  <p>Phone: {doctor?.phoneNumber}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Professional Details</h3>
                <div className="mt-2 text-gray-900">
                  <p>Hospital: {doctor?.hospital || "-"}</p>
                  <p>City: {doctor?.city || "-"}</p>
                  <p>Experience: {doctor?.experienceYears ? `${doctor.experienceYears} Years` : "-"}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Education</h3>
                <div className="mt-2 text-gray-900">
                  <p>Qualification: {doctor?.qualification || "-"}</p>
                  <p>College: {doctor?.medicalCollege || "-"}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Links</h3>
                <div className="mt-2 text-blue-600">
                  {doctor?.linkedinUrl && <p><a href={doctor.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn Profile</a></p>}
                  {doctor?.websiteUrl && <p><a href={doctor.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">Personal Website</a></p>}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">{doctor?.bio || "No bio available."}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
                  <input type="text" name="hospital" value={formData.hospital} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                  <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. MBBS, FCPS" className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical College</label>
                  <input type="text" name="medicalCollege" value={formData.medicalCollege} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} min="0" className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isProfilePrivate"
                    name="isProfilePrivate"
                    checked={formData.isProfilePrivate}
                    onChange={(e) => setFormData({ ...formData, isProfilePrivate: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isProfilePrivate" className="text-sm text-gray-900 font-medium">Keep my profile posts private unless mutually friended</label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio (max 500 chars)</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} maxLength={500} rows={4} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200"></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
