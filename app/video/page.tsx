"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VideoFeed() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      setVideos(data);
    } catch (err) {}
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!videoUrl && !file)) return;

    setUploading(true);
    try {
      let finalVideoUrl = videoUrl;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        finalVideoUrl = uploadData.url;
      }

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, videoUrl: finalVideoUrl })
      });
      if (res.ok) {
        setShowUploadModal(false);
        setTitle("");
        setDescription("");
        setVideoUrl("");
        setFile(null);
        fetchVideos();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to upload video");
      }
    } catch (err) {
      toast.error("Error uploading video");
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Videos...</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 text-white">
          <button onClick={() => router.push("/feed")} className="text-indigo-400 hover:text-indigo-300 flex items-center font-medium bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition shadow-sm border border-gray-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to MedConnect
          </button>
          <button onClick={() => setShowUploadModal(true)} className="bg-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            + Upload Video
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-2">No Medical Videos Yet</h3>
            <p className="text-gray-400 mb-6">Share clinical procedures, tutorials, or educational reels.</p>
            <button onClick={() => setShowUploadModal(true)} className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold hover:bg-blue-700">Upload Now</button>
          </div>
        ) : (
          <div className="space-y-8">
            {videos.map(v => (
              <div key={v.id} className="bg-black rounded-xl overflow-hidden shadow-xl border border-gray-800 relative">
                {/* Simplified Video Embed (Supporting YouTube/Direct URL for now) */}
                <div className="aspect-video w-full bg-gray-900 flex items-center justify-center relative group">
                  {v.videoUrl.includes("youtube.com") || v.videoUrl.includes("youtu.be") ? (
                     <iframe 
                       src={v.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                       className="w-full h-full" 
                       allowFullScreen 
                     />
                  ) : (
                     <video src={v.videoUrl} controls className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="p-4 bg-gray-900">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 mr-3">
                      {v.doctor.profileImage ? (
                        <img src={v.doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-full h-full text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Dr. {v.doctor.fullName}</h3>
                      <p className="text-gray-400 text-xs">{v.doctor.specialization || "Doctor"}</p>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">{v.title}</h2>
                  {v.description && <p className="text-gray-300 text-sm mb-2">{v.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full p-6 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Upload Medical Video</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Video Title *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Endoscopic Procedure" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Brief details about the video..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Video URL or Upload File *</label>
                  <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} disabled={!!file} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none mb-3" placeholder="YouTube, Vimeo, or direct .mp4 link" />
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">OR</span>
                    <input type="file" accept="video/*" onChange={handleFileChange} disabled={!!videoUrl} className="text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Note: To save database storage, you can provide an external video link (e.g., YouTube URL) or upload a short clip.</p>
                </div>
                <button type="submit" disabled={uploading || !title || (!videoUrl && !file)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition mt-4">
                  {uploading ? "Uploading..." : "Publish Video"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
