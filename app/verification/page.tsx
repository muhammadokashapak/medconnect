"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";

export default function VerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [isLegacy, setIsLegacy] = useState(false);
  
  const [documents, setDocuments] = useState({
    licenseImage: "",
    cnicImage: "",
    selfieImage: "",
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<any>(null);

  const captureWebcam = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const e = { target: { files: [file] } } as any;
        setShowWebcam(false);
        handleFileUpload(e, "selfieImage");
      } catch (err) {
        console.error("Failed to capture image", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Failed to load profile");
      }
      const data = await res.json();
      setStatus(data.verificationStatus || "PENDING");
      setIsLegacy(data.createdAt ? new Date(data.createdAt) < new Date("2026-06-16T00:00:00Z") : false);
      if (data.verificationStatus === "VERIFIED" || data.verificationStatus === "PENDING") {
        setDocuments({
          licenseImage: data.licenseImage || "",
          cnicImage: data.cnicImage || "",
          selfieImage: data.selfieImage || "",
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
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

      setDocuments(prev => ({ ...prev, [fieldName]: result.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!documents.licenseImage || !documents.cnicImage || !documents.selfieImage) {
      setError("Please upload all three required documents.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/verification/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documents),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit verification");
      }

      setSuccess("Documents submitted successfully! Your account is now under review.");
      setStatus("PENDING");
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
          <button
            onClick={() => router.push("/feed")}
            className="text-indigo-600 hover:underline font-medium"
          >Back to Homepage</button>
        </div>

        {!isLegacy && status === "PENDING" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-red-800">Critical Action Required</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>You have <strong>3 days</strong> to complete your PMDC verification. If your profile is not verified within 3 days of registration, your account will be permanently deleted.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "VERIFIED" && (
          <div className="bg-green-50 text-green-800 p-6 rounded-lg mb-8 border border-green-200 flex items-center shadow-sm">
            <svg className="w-8 h-8 mr-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <div>
              <h3 className="font-bold text-lg">You are verified!</h3>
              <p>Your PMDC credentials have been approved. You have full access to MedConnect features.</p>
            </div>
          </div>
        )}

        {status === "REJECTED" && (
          <div className="bg-red-50 text-red-800 p-6 rounded-lg mb-8 border border-red-200 shadow-sm">
            <h3 className="font-bold text-lg flex items-center">
              <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Verification Rejected
            </h3>
            <p className="mt-2">Unfortunately, we could not verify your credentials. Please upload clear, readable documents below and submit again.</p>
          </div>
        )}

        {status === "PENDING" && documents.licenseImage && documents.cnicImage && documents.selfieImage && !success && (
          <div className="bg-amber-50 text-amber-800 p-6 rounded-lg mb-8 border border-amber-200 flex items-center shadow-sm">
            <svg className="w-8 h-8 mr-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <h3 className="font-bold text-lg">Verification Pending</h3>
              <p>Your documents are currently under review by our administrators. This usually takes 24-48 hours.</p>
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-6 border border-green-200">{success}</div>}

        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <p className="text-gray-600 mb-8">
            To ensure the integrity of the MedConnect platform, we require all users to verify their identity and PMDC registration. Please provide clear, unedited photos of the following documents.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PMDC Certificate */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. PMDC Registration Certificate</h3>
              <p className="text-sm text-gray-500 mb-4">A clear photo or scan of your valid PMDC certificate.</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="cursor-pointer bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition font-medium">
                  {uploadingField === "licenseImage" ? "Uploading..." : documents.licenseImage ? "Change Image" : "Upload Certificate"}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "licenseImage")} disabled={uploadingField !== null} />
                </label>
                {documents.licenseImage && <span className="text-sm text-green-600 flex items-center font-medium"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Uploaded successfully</span>}
              </div>
              {documents.licenseImage && (
                <div className="mt-4 w-full h-40 bg-white border rounded overflow-hidden">
                  <img src={documents.licenseImage} alt="PMDC Certificate" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* CNIC */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. CNIC (Front)</h3>
              <p className="text-sm text-gray-500 mb-4">A clear photo of the front of your National Identity Card.</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="cursor-pointer bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition font-medium">
                  {uploadingField === "cnicImage" ? "Uploading..." : documents.cnicImage ? "Change Image" : "Upload CNIC"}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "cnicImage")} disabled={uploadingField !== null} />
                </label>
                {documents.cnicImage && <span className="text-sm text-green-600 flex items-center font-medium"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Uploaded successfully</span>}
              </div>
              {documents.cnicImage && (
                <div className="mt-4 w-full h-40 bg-white border rounded overflow-hidden">
                  <img src={documents.cnicImage} alt="CNIC" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Selfie */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Doctor Selfie</h3>
              <p className="text-sm text-gray-500 mb-4">A clear photo of your face to verify against your CNIC and PMDC certificate.</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button 
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  disabled={uploadingField !== null}
                  className="cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg transition font-medium flex items-center shadow-sm disabled:bg-indigo-400"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {uploadingField === "selfieImage" ? "Uploading..." : "Take Live Selfie"}
                </button>
                <label className="cursor-pointer bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition font-medium">
                  Upload from Gallery
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "selfieImage")} disabled={uploadingField !== null} />
                </label>
                {documents.selfieImage && <span className="text-sm text-green-600 flex items-center font-medium"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Uploaded</span>}
              </div>
              {documents.selfieImage && (
                <div className="mt-4 w-40 h-40 bg-white border rounded-full overflow-hidden mx-auto sm:mx-0">
                  <img src={documents.selfieImage} alt="Selfie" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="pt-6 border-t">
              <button 
                type="submit" 
                disabled={submitting || uploadingField !== null || status === "VERIFIED"} 
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition"
              >
                {submitting ? "Submitting Documents..." : status === "VERIFIED" ? "Already Verified" : "Submit for Verification"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showWebcam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Take Live Selfie</h3>
              <button onClick={() => setShowWebcam(false)} className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden mb-6 bg-black aspect-[3/4] flex items-center justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowWebcam(false)} 
                className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={captureWebcam} 
                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition flex justify-center items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
