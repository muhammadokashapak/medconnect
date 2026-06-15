"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchMessages();
    socketInit();

    return () => {
      if (socket) {
        socket.emit("leave_room", params?.id);
        socket.disconnect();
      }
    };
  }, [params?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const socketInit = async () => {
    await fetch("/api/socket"); // ensure socket route is hit
    socket = io({ path: "/api/socket" });

    socket.on("connect", () => {
      socket.emit("join_room", params?.id);
    });

    socket.on("receive_message", (data: any) => {
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      // automatically mark read when receiving
      if (currentUser && data.senderId !== currentUser.id) {
        socket.emit("mark_read", { roomId: params?.id, messageId: data.id });
      }
    });

    socket.on("user_typing", (data: any) => {
      if (currentUser && data.doctorId !== currentUser.id) {
        setIsTyping(data.isTyping);
      }
    });
    
    socket.on("message_read", (data: any) => {
      setMessages((prev) => prev.map(m => m.id === data.messageId ? { ...m, isRead: true } : m));
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {}
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/messages/${params?.id}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/messages");
        throw new Error("Failed to load messages");
      }
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      if (showLoading) setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (socket && currentUser) {
      socket.emit("typing", { roomId: params?.id, doctorId: currentUser.id, isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { roomId: params?.id, doctorId: currentUser.id, isTyping: false });
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage;
    setNewMessage("");
    if (socket && currentUser) socket.emit("typing", { roomId: params?.id, doctorId: currentUser.id, isTyping: false });

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: params?.id, content, replyToId: replyToMessage?.id }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const savedMessage = await res.json();
      setReplyToMessage(null);
      
      // Emit via socket
      if (socket) {
        // Need to add fake sender data to mimic full payload
        const payload = {
          ...savedMessage.data,
          sender: {
            fullName: currentUser.fullName,
            profileImage: currentUser.profileImage
          },
          replyTo: replyToMessage ? {
            id: replyToMessage.id,
            content: replyToMessage.content,
            sender: { fullName: replyToMessage.sender?.fullName }
          } : null
        };
        socket.emit("send_message", payload);
      }
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading chat...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/messages")}
            className="text-gray-500 hover:text-indigo-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-gray-900">Clinical Consultation</h2>
            <p className="text-sm text-gray-500">Secure chat with your medical colleagues.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No messages yet. Send a message to start the consultation.</div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.senderId === currentUser?.id;
            const showAvatar = !isMine && (index === messages.length - 1 || messages[index + 1]?.senderId === currentUser?.id);

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>\
                {!isMine && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-2 flex-shrink-0 mt-auto">
                    {showAvatar && (
                      msg.sender?.profileImage ? (
                        <img src={msg.sender.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )
                    )}
                  </div>
                )}

                <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {!isMine && showAvatar && <span className="text-xs text-gray-500 mb-1 ml-1">Dr. {msg.sender?.fullName}</span>}
                  
                  <div className={`group relative flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {/* Reply Button (visible on hover) */}
                    <button 
                      onClick={() => setReplyToMessage(msg)}
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition p-1 bg-white rounded-full shadow-sm text-gray-500 hover:text-indigo-600 ${isMine ? '-left-8' : '-right-8'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                    </button>

                    <div 
                      className={`px-4 py-3 rounded-3xl ${
                        isMine 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                      } break-words whitespace-pre-wrap max-w-full flex flex-col`}
                    >
                      {msg.replyTo && (
                        <div className={`mb-2 pl-3 border-l-2 text-sm rounded py-1 px-2 ${isMine ? 'border-indigo-300 bg-indigo-700 text-indigo-100' : 'border-gray-400 bg-gray-100 text-gray-600'}`}>
                          <p className="font-bold text-xs mb-1">Replying to {msg.replyTo.sender?.fullName || 'Someone'}</p>
                          <p className="line-clamp-2 italic">{msg.replyTo.content}</p>
                        </div>
                      )}
                      <p>{msg.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-1 mx-1 space-x-1 text-xs text-gray-400">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && msg.isRead && (
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7m-9 9l4 4L23 7"></path></svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex justify-start mb-4 animate-fade-in">
            <div className="px-4 py-3 rounded-3xl bg-gray-100 text-gray-500 rounded-bl-none shadow-sm flex items-center space-x-1">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto w-full relative">
          {replyToMessage && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-100 border border-gray-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-xs font-bold text-indigo-600 mb-1">Replying to Dr. {replyToMessage.sender?.fullName}</p>
                <p className="text-sm text-gray-600 truncate">{replyToMessage.content}</p>
              </div>
              <button onClick={() => setReplyToMessage(null)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}

          {currentUser && currentUser.verificationStatus !== "VERIFIED" ? (
            <div className="bg-amber-50 p-3 rounded text-center text-sm text-amber-800">
              You must complete PMDC verification to send messages. <button onClick={() => router.push("/verification")} className="font-bold hover:underline">Verify</button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-100 rounded-full p-1 shadow-inner">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none py-3 px-5 focus:outline-none focus:ring-0 text-gray-800"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-indigo-600 text-white p-3 rounded-full shadow hover:bg-indigo-700 disabled:bg-indigo-300 transition flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
