"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminDoctorReviewPage() {
  const router = useRouter();
  const params = useParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [params?.id]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/admin/doctors/${params?.id}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/dashboard");
        throw new Error("Failed to load doctor details");
      }
      const data = await res.json();
      setDoctor(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this doctor? This gives them full access.")) return;
    
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: params?.id }),
      });

      if (!res.ok) throw new Error("Failed to approve");
      
      alert("Doctor approved successfully.");
      router.push("/admin");
    } catch (err: any) {
      alert(err.message);
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert("Rejection notes are required.");
      return;
    }
    
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/reject", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: params?.id, notes }),
      });

      if (!res.ok) throw new Error("Failed to reject");
      
      alert("Doctor rejected successfully.");
      router.push("/admin");
    } catch (err: any) {
      alert(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading details...</div>;
  }

  if (error || !doctor) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "Not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Admin Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex justify-between items-start mb-6 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dr. {doctor.fullName}</h1>
              <p className="text-lg text-gray-600 flex items-center">
                PMDC: <span className="font-bold text-gray-900 ml-2">{doctor.pmdcNumber}</span>
              </p>
            </div>
            <div>
              <span className={`px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full 
                ${doctor.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                  doctor.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {doctor.verificationStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Contact Info</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><span className="text-gray-500 w-20 inline-block">Email:</span> <span className="font-medium text-gray-900">{doctor.email}</span></p>
                <p><span className="text-gray-500 w-20 inline-block">Phone:</span> <span className="font-medium text-gray-900">{doctor.phoneNumber}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Professional Info</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><span className="text-gray-500 w-24 inline-block">Specialty:</span> <span className="font-medium text-gray-900">{doctor.specialization || "-"}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Hospital:</span> <span className="font-medium text-gray-900">{doctor.hospital || "-"}</span></p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Verification Documents</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* PMDC Certificate */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-gray-100 px-4 py-2 border-b font-medium text-gray-700">PMDC Certificate</div>
              <div className="p-4 flex-1 flex items-center justify-center bg-gray-50">
                {doctor.licenseImage ? (
                  <a href={doctor.licenseImage} target="_blank" rel="noreferrer">
                    <img src={doctor.licenseImage} alt="PMDC" className="max-h-64 object-contain cursor-zoom-in" />
                  </a>
                ) : <span className="text-gray-400">Not uploaded</span>}
              </div>
            </div>

            {/* CNIC */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-gray-100 px-4 py-2 border-b font-medium text-gray-700">CNIC (Front)</div>
              <div className="p-4 flex-1 flex items-center justify-center bg-gray-50">
                {doctor.cnicImage ? (
                  <a href={doctor.cnicImage} target="_blank" rel="noreferrer">
                    <img src={doctor.cnicImage} alt="CNIC" className="max-h-64 object-contain cursor-zoom-in" />
                  </a>
                ) : <span className="text-gray-400">Not uploaded</span>}
              </div>
            </div>

            {/* Selfie */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-gray-100 px-4 py-2 border-b font-medium text-gray-700">Doctor Selfie</div>
              <div className="p-4 flex-1 flex items-center justify-center bg-gray-50">
                {doctor.selfieImage ? (
                  <a href={doctor.selfieImage} target="_blank" rel="noreferrer">
                    <img src={doctor.selfieImage} alt="Selfie" className="max-h-64 object-contain cursor-zoom-in" />
                  </a>
                ) : <span className="text-gray-400">Not uploaded</span>}
              </div>
            </div>
          </div>

          {doctor.verificationStatus === 'PENDING' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Actions</h3>
              
              {!showRejectBox ? (
                <div className="flex gap-4">
                  <button 
                    onClick={handleApprove}
                    disabled={processing}
                    className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 disabled:opacity-50 font-bold transition"
                  >
                    Approve Verification
                  </button>
                  <button 
                    onClick={() => setShowRejectBox(true)}
                    disabled={processing}
                    className="bg-red-600 text-white px-6 py-3 rounded shadow hover:bg-red-700 disabled:opacity-50 font-bold transition"
                  >
                    Reject Verification
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason (will be shown to doctor)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="E.g., CNIC image is blurry, please re-upload."
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-4"
                  ></textarea>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleReject}
                      disabled={processing || !notes.trim()}
                      className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 disabled:opacity-50 font-bold transition"
                    >
                      Confirm Rejection
                    </button>
                    <button 
                      onClick={() => setShowRejectBox(false)}
                      disabled={processing}
                      className="bg-gray-300 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {doctor.verificationStatus === 'REJECTED' && doctor.verificationNotes && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded p-4">
              <h3 className="font-bold text-red-800 mb-2">Rejection Notes:</h3>
              <p className="text-red-700">{doctor.verificationNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
