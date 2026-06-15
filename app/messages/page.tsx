"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MessagesListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingAi, setStartingAi] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Failed to load conversations");
      }
      const data = await res.json();
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAiChat = async () => {
    try {
      setStartingAi(true);
      const res = await fetch("/api/ai/start-conversation", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      } else {
        setError(data.message || "Failed to start AI chat");
        setStartingAi(false);
      }
    } catch (err) {
      setError("Error starting AI chat");
      setStartingAi(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading messages...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">Your private clinical consultations.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/feed")}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/doctors")}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              New Consultation
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6 border border-red-200">{error}</div>}

        {conversations.length === 0 && !error ? (
          <div className="bg-white rounded-lg shadow p-10 text-center border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 mb-6">Start a conversation with a verified doctor to ask for clinical advice.</p>
            <button
              onClick={() => router.push("/doctors")}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Find Doctors
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <li 
                  key={conv.id} 
                  onClick={() => router.push(`/messages/${conv.id}`)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition flex items-center ${conv.hasUnread ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {conv.otherDoctor?.profileImage ? (
                        <img src={conv.otherDoctor.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )}
                    </div>
                    {conv.hasUnread && (
                      <span className="absolute top-0 right-0 block h-3.5 w-3.5 rounded-full bg-indigo-600 ring-2 ring-white"></span>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-base font-semibold text-gray-900 truncate ${conv.hasUnread ? 'font-bold text-indigo-900' : ''}`}>
                        Dr. {conv.otherDoctor?.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`text-sm mt-1 truncate ${conv.hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {conv.lastMessage ? (
                        <>
                          {conv.lastMessage.isMine && <span className="text-gray-400">You: </span>}
                          {conv.lastMessage.content}
                        </>
                      ) : (
                        <span className="italic text-gray-400">Start the conversation</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Floating AI Bot Button */}
      <button
        onClick={handleStartAiChat}
        disabled={startingAi}
        className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.6)] hover:scale-105 transition-all z-50 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed border-2 border-white"
        title="Chat with Medical AI"
      >
        {startingAi ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        )}
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-semibold">
          {startingAi ? "Connecting..." : "Medical Chatbot"}
        </span>
      </button>
    </div>
  );
}
