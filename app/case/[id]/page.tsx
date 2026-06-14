"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type DoctorSummary = {
  id: string;
  fullName: string;
  profileImage?: string | null;
  isVerified?: boolean;
};

type CaseComment = {
  id: string;
  content: string;
  createdAt: string;
  doctor: DoctorSummary;
};

type CasePost = {
  id: string;
  title: string;
  specialty: string;
  description: string;
  imageUrl?: string | null;
  isAnonymous: boolean;
  doctorId: string;
  createdAt: string;
  doctor: DoctorSummary;
  comments?: CaseComment[];
  _count: {
    views?: number;
    reactions?: number;
    comments?: number;
  };
};

type CurrentUser = {
  id: string;
  verificationStatus?: string;
};

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [casePost, setCasePost] = useState<CasePost | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    specialty: "",
    description: "",
    imageUrl: "",
    isAnonymous: false,
  });
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchCaseDetails = async () => {
    try {
      const res = await fetch(`/api/cases/${params?.id}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Failed to load case details");
      }
      const data = await res.json();
      setCasePost(data);
      if (!editMode) {
        setEditData({
          title: data.title,
          specialty: data.specialty,
          description: data.description,
          imageUrl: data.imageUrl || "",
          isAnonymous: data.isAnonymous || false,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load case details";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchCaseDetails();
      await fetchCurrentUser();
    };
    load();
  }, [params?.id]);

  const handleReact = async () => {
    try {
      await fetch("/api/cases/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casePostId: params?.id, type: "LIKE" }),
      });
      await fetchCaseDetails();
    } catch {
      // ignore
    }
  };

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setPostingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          casePostId: params?.id,
          content: commentContent,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();
      setCasePost(prev => prev ? { ...prev, comments: [...(prev.comments || []), data.comment] } : prev);
      setCommentContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post comment";
      alert(message);
    } finally {
      setPostingComment(false);
    }
  };

  const startEdit = () => {
    if (!casePost) return;
    setEditMode(true);
    setEditData({
      title: casePost.title,
      specialty: casePost.specialty,
      description: casePost.description,
      imageUrl: casePost.imageUrl || "",
      isAnonymous: casePost.isAnonymous,
    });
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!casePost) return;

    setSavingPost(true);
    try {
      const res = await fetch(`/api/cases/${params?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update post");
      setCasePost(data.casePost);
      setEditMode(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update post";
      alert(message);
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!casePost || !confirm("Are you sure you want to delete this post?")) return;
    setDeletingPost(true);
    try {
      const res = await fetch(`/api/cases/${params?.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete post");
      router.push("/feed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete post";
      alert(message);
    } finally {
      setDeletingPost(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading case details...</div>;
  }

  if (error || !casePost) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "Case not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push("/feed")} className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Homepage
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 mb-8">
          {editMode && (
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Edit Case Post</h2>
                <p className="text-sm text-gray-500">Update your case details and save changes.</p>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input name="title" value={editData.title} onChange={handleEditChange} required className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <input name="specialty" value={editData.specialty} onChange={handleEditChange} required className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={editData.description} onChange={handleEditChange} rows={5} required className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input name="imageUrl" value={editData.imageUrl} onChange={handleEditChange} className="w-full border p-2 rounded focus:ring focus:ring-indigo-200" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isAnonymous" name="isAnonymous" checked={editData.isAnonymous} onChange={handleEditChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  <label htmlFor="isAnonymous" className="text-sm text-gray-900">Post anonymously</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition">Cancel</button>
                  <button type="submit" disabled={savingPost} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50">{savingPost ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </div>
          )}
          <div className="flex items-center mb-6 border-b pb-6">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {casePost.doctor.profileImage ? (
                <img src={casePost.doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                Dr. {casePost.doctor.fullName}
                {casePost.doctor.isVerified && (
                  <svg className="w-5 h-5 text-blue-500 ml-1 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                )}
                {currentUser?.id !== casePost.doctorId && (
                  <button onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await fetch("/api/follow", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ followingId: casePost.doctorId })
                      });
                      alert("Friend request / Follow toggled!");
                    } catch {}
                  }} className="ml-3 px-3 py-1 rounded-full text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition">
                    Add Friend
                  </button>
                )}
              </h3>
              <p className="text-sm text-gray-500">{new Date(casePost.createdAt).toLocaleString()} • {casePost.specialty}</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{casePost.title}</h1>
          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap mb-8 text-lg leading-relaxed">{casePost.description}</div>
          {casePost.imageUrl && (
            <div className="w-full rounded-xl overflow-hidden border bg-gray-100 mb-8">
              <img src={casePost.imageUrl} alt="Case Clinical Image" className="w-full object-contain max-h-[600px]" />
            </div>
          )}
          <div className="flex items-center text-gray-500 border-t pt-4 gap-6">
            <button onClick={handleReact} className="flex items-center hover:text-blue-600 transition">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
              <span>{casePost._count?.reactions || 0}</span>
            </button>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              <span>{casePost.comments?.length || 0}</span>
            </div>
            <div className="flex items-center ml-auto text-sm text-gray-400 gap-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                <span>{casePost._count?.views || 0}</span>
              </div>
              {currentUser?.id === casePost.doctorId && (
                <div className="flex items-center gap-2">
                  <button onClick={startEdit} className="px-4 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition">Edit Post</button>
                  <button onClick={handleDeletePost} disabled={deletingPost} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50">{deletingPost ? "Deleting..." : "Delete Post"}</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Discussion Thread ({casePost.comments?.length || 0})</h3>
          <div className="space-y-6 mb-10">
            {casePost.comments?.map((comment) => (
              <div key={comment.id} className="flex space-x-4 bg-gray-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {comment.doctor.profileImage ? (
                    <img src={comment.doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold text-gray-900 flex items-center">
                      Dr. {comment.doctor.fullName}
                      {comment.doctor.isVerified && (
                        <svg className="w-4 h-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 ml-3">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
            {casePost.comments?.length === 0 && <p className="text-gray-500 italic">No comments yet. Be the first to share your opinion.</p>}
          </div>
          {currentUser && currentUser.verificationStatus !== "VERIFIED" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center mt-8">
              <p className="text-amber-800 font-medium">You must complete your PMDC identity verification to comment on cases.</p>
              <button onClick={() => router.push("/verification")} className="mt-2 text-indigo-600 hover:underline font-bold">Verify Now</button>
            </div>
          ) : (
            <form onSubmit={handleCommentSubmit} className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add your clinical opinion</label>
              <textarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)} rows={4} placeholder="What are your thoughts on this case?" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition mb-3"></textarea>
              <div className="flex justify-end">
                <button type="submit" disabled={postingComment || !commentContent.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition">{postingComment ? "Posting..." : "Post Comment"}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
