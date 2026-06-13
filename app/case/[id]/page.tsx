"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [casePost, setCasePost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [commentContent, setCommentContent] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
    fetchCurrentUser();
  }, [params?.id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {}
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
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
      setCasePost({
        ...casePost,
        comments: [...casePost.comments, data.comment],
      });
      setCommentContent("");
    } catch (err: any) {
      alert(err.message || "Failed to post comment");
    } finally {
      setPostingComment(false);
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
        <button
          onClick={() => router.push("/feed")}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Feed
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 mb-8">
          <div className="flex items-center mb-6 border-b pb-6">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {casePost.doctor.profileImage ? (
                <img src={casePost.doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                Dr. {casePost.doctor.fullName}
                {casePost.doctor.isVerified && (
                  <svg className="w-5 h-5 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                )}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(casePost.createdAt).toLocaleString()} • {casePost.specialty}
              </p>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{casePost.title}</h1>
          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap mb-8 text-lg leading-relaxed">
            {casePost.description}
          </div>
          
          {casePost.imageUrl && (
            <div className="w-full rounded-xl overflow-hidden border bg-gray-100 mb-8">
              <img src={casePost.imageUrl} alt="Case Clinical Image" className="w-full object-contain max-h-[600px]" />
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
            Discussion Thread ({casePost.comments?.length || 0})
          </h3>

          <div className="space-y-6 mb-10">
            {casePost.comments?.map((comment: any) => (
              <div key={comment.id} className="flex space-x-4 bg-gray-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {comment.doctor.profileImage ? (
                    <img src={comment.doctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
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
            {casePost.comments?.length === 0 && (
              <p className="text-gray-500 italic">No comments yet. Be the first to share your opinion.</p>
            )}
          </div>

          {currentUser && currentUser.verificationStatus !== "VERIFIED" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center mt-8">
              <p className="text-amber-800 font-medium">You must complete your PMDC identity verification to comment on cases.</p>
              <button onClick={() => router.push("/verification")} className="mt-2 text-indigo-600 hover:underline font-bold">Verify Now</button>
            </div>
          ) : (
          <form onSubmit={handleCommentSubmit} className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add your clinical opinion</label>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
              placeholder="What are your thoughts on this case?"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition mb-3"
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={postingComment || !commentContent.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition"
              >
                {postingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
