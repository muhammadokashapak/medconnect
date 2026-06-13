"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctor, setDoctor] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    specialty: "",
    description: "",
    imageUrl: "",
    isAnonymous: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          throw new Error("Failed to load profile");
        }
        const data = await res.json();
        setDoctor(data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setFormData(prev => ({ ...prev, imageUrl: result.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.title || !formData.specialty || !formData.description) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit case");
      }

      setSuccess("Case submitted successfully!");
      setTimeout(() => {
        router.push("/feed");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Post a Medical Case</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-6 border border-green-200">{success}</div>}

          {doctor && doctor.verificationStatus !== "VERIFIED" ? (
            <div className="text-center py-10">
              <svg className="w-16 h-16 mx-auto text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
              <p className="text-gray-600 mb-6">You must complete your PMDC identity verification to post medical cases for discussion.</p>
              <button onClick={() => router.push("/verification")} className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700">Verify Now</button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Title *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="E.g., 45yo Male presenting with persistent right lower quadrant pain"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
              <select 
                name="specialty" 
                value={formData.specialty} 
                onChange={handleInputChange} 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
              >
                <option value="">Select Specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgery">Surgery</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Description *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows={6}
                placeholder="Include patient history, symptoms, investigations, and your question..."
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Image / X-Ray (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg border border-gray-300 transition">
                  {uploading ? "Uploading..." : "Choose Image"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {formData.imageUrl && <span className="text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Image attached
                </span>}
              </div>
              {formData.imageUrl && (
                <div className="mt-4 relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border">
                  <img src={formData.imageUrl} alt="Case Preview" className="w-full h-full object-contain bg-gray-50" />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="isAnonymous" 
                name="isAnonymous" 
                checked={formData.isAnonymous} 
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                Post anonymously (hide my name from this case)
              </label>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading || uploading} 
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition"
              >
                {loading ? "Submitting Case..." : "Post Case for Discussion"}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
