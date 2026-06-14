"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorsDirectoryPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useState({
    query: "",
    specialty: "",
    city: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, [searchParams.specialty, searchParams.city]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(searchParams);
      const res = await fetch(`/api/doctors?${queryParams}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/login");
        throw new Error("Failed to load doctors");
      }
      const data = await res.json();
      setDoctors(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Directory</h1>
            <p className="text-gray-600 mt-2">Find and consult with verified medical professionals.</p>
          </div>
          <button
            onClick={() => router.push("/feed")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Back to Homepage
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Name, PMDC, or Hospital</label>
              <input
                type="text"
                value={searchParams.query}
                onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                placeholder="Search..."
                className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                value={searchParams.specialty}
                onChange={(e) => setSearchParams({ ...searchParams, specialty: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition">
                Search
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow text-gray-500">
            No doctors found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {doctor.profileImage ? (
                      <img src={doctor.profileImage} alt={doctor.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      Dr. {doctor.fullName}
                      <svg className="w-4 h-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </h3>
                    <p className="text-indigo-600 text-sm font-medium">{doctor.specialization || "General"}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1 mb-6 flex-1">
                  <p><strong>Hospital:</strong> {doctor.hospital || "-"}</p>
                  <p><strong>City:</strong> {doctor.city || "-"}</p>
                  <p><strong>Experience:</strong> {doctor.experienceYears ? `${doctor.experienceYears} years` : "-"}</p>
                </div>
                
                <button
                  onClick={() => router.push(`/doctor/${doctor.id}`)}
                  className="w-full bg-gray-50 text-gray-800 border border-gray-200 py-2 rounded font-medium hover:bg-gray-100 transition"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
