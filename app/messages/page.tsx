"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MessagesListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingAi, setStartingAi] = useState(false);
  const [error, setError] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Home
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 text-center border border-white/20">
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
            <ul className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <li 
                  key={conv.id} 
                  onClick={() => router.push(`/messages/${conv.id}`)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition flex items-center first:rounded-t-xl last:rounded-b-xl ${conv.hasUnread ? 'bg-indigo-50/30' : ''}`}
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
                  
                  <div className="ml-4 flex-1 min-w-0 flex items-start justify-between">
                    <div className="min-w-0 flex-1 pr-4">
                      <h3 className={`text-base font-semibold text-gray-900 truncate ${conv.hasUnread ? 'font-bold text-indigo-900' : ''}`}>
                        Dr. {conv.otherDoctor?.fullName || "Medical Chatbot"}
                      </h3>
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

                    <div className="flex flex-col items-end relative">
                      <p className="text-sm text-gray-500 whitespace-nowrap mb-1">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                      
                      {/* 3 Dots Menu Button */}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveMenu(activeMenu === conv.id ? null : conv.id); 
                        }}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === conv.id && (
                        <div className="absolute top-10 right-0 z-10 w-36 bg-white/90 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-1 border border-white/20">
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/messages/${conv.id}`); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Open Chat
                          </button>
                          <button onClick={async (e) => { 
                            e.stopPropagation(); 
                            if(confirm("Clear all messages in this chat?")) {
                              await fetch(`/api/messages/${conv.id}`, { method: 'DELETE' });
                              fetchConversations();
                            }
                            setActiveMenu(null); 
                          }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Clear Chat
                          </button>
                          <button onClick={async (e) => { 
                            e.stopPropagation(); 
                            try {
                              await fetch('/api/messages/mute', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ conversationId: conv.id, isMuted: true })
                              });
                              toast.success("Chat muted successfully!");
                            } catch (err) {
                              toast.error("Failed to mute chat");
                            }
                            setActiveMenu(null); 
                          }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Mute Chat
                          </button>
                          <button onClick={async (e) => { 
                            e.stopPropagation(); 
                            if(confirm("Are you sure you want to delete this chat completely?")) {
                              const res = await fetch(`/api/conversations/${conv.id}`, { method: 'DELETE' });
                              if(res.ok) {
                                setConversations(prev => prev.filter(c => c.id !== conv.id)); 
                              }
                            }
                            setActiveMenu(null); 
                          }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Delete Chat
                          </button>
                        </div>
                      )}
                    </div>
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
