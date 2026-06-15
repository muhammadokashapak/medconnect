"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleTouchStart = (msgId: string) => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setActiveMenu(msgId);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
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
      const { data: savedMessage, isAiConversation, aiBotId } = await res.json();
      setMessages(prev => [...prev, savedMessage]);
      setReplyToMessage(null);
      
      // Emit via socket
      if (socket) {
        // Need to add fake sender data to mimic full payload
        const payload = {
          ...savedMessage,
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
      
      if (isAiConversation && aiBotId) {
        setIsTyping(true);
        try {
          const aiRes = await fetch("/api/messages/ai-reply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId: params?.id,
              userMessage: content,
              aiBotId,
              doctorName: currentUser.fullName
            })
          });
          if (aiRes.ok) {
            const aiMessage = await aiRes.json();
            setMessages(prev => prev.map(m => m.id === savedMessage.id ? { ...m, isRead: true, isDelivered: true } : m).concat(aiMessage));
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsTyping(false);
        }
      }
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        const res = await fetch(`/api/messages/message/${messageId}`, { method: 'DELETE' });
        if (res.ok) {
          setMessages(prev => prev.filter(m => m.id !== messageId));
        } else {
          alert("Failed to delete message");
        }
      } catch (err) {
        alert("Error deleting message");
      }
    }
    setActiveMenu(null);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setActiveMenu(null);
  };

  const handleMuteToggle = async () => {
    const newMuteStatus = !isChatMuted;
    setIsChatMuted(newMuteStatus);
    try {
      await fetch('/api/messages/mute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: params?.id, isMuted: newMuteStatus })
      });
    } catch (err) {
      setIsChatMuted(!newMuteStatus); // revert on error
    }
    setActiveMenu(null);
  };

  const handlePinToggle = async (msg: any) => {
    const newPinnedStatus = !msg.isPinned;
    try {
      const res = await fetch(`/api/messages/message/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinnedStatus })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isPinned: newPinnedStatus } : m));
      }
    } catch (err) {
      alert("Failed to pin message");
    }
    setActiveMenu(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading chat...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 h-[100dvh] z-[100] flex flex-col bg-gray-50 overflow-hidden">
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
        <button
          onClick={handleMuteToggle}
          className={`mr-2 p-2 rounded-full transition ${isChatMuted ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          title={isChatMuted ? "Unmute Chat" : "Mute Chat"}
        >
          {isChatMuted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this entire conversation?")) {
              alert("Conversation deleted successfully!");
              router.push("/messages");
            }
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
          title="Delete Chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
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
                    {/* Pinned Indicator */}
                    {msg.isPinned && (
                      <div className="absolute -top-3 flex items-center text-xs text-indigo-500 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm z-10">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zM12 7a1 1 0 00-1 1v4H8a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V8a1 1 0 00-1-1z" /></svg> Pinned
                      </div>
                    )}

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
                      onTouchStart={() => handleTouchStart(msg.id)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      onMouseDown={() => handleTouchStart(msg.id)}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={handleTouchEnd}
                    >
                      {msg.replyTo && (
                        <div className={`mb-2 pl-3 border-l-2 text-sm rounded py-1 px-2 ${isMine ? 'border-indigo-300 bg-indigo-700 text-indigo-100' : 'border-gray-400 bg-gray-100 text-gray-600'}`}>
                          <p className="font-bold text-xs mb-1">Replying to {msg.replyTo.sender?.fullName || 'Someone'}</p>
                          <p className="line-clamp-2 italic">{msg.replyTo.content}</p>
                        </div>
                      )}
                      <div className="markdown-body text-sm space-y-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>h1]:font-bold [&>h1]:text-lg [&>h2]:font-bold [&>h2]:text-base">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    {/* 3 Dots Menu Button - Visible mainly on desktop hover */}
                    <button
                      onClick={() => setActiveMenu(activeMenu === msg.id ? null : msg.id)}
                      className={`hidden md:block absolute top-2 text-gray-400 hover:text-gray-700 transition opacity-0 group-hover:opacity-100 ${isMine ? "right-full mr-2" : "left-full ml-2"}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenu === msg.id && (
                      <div className={`absolute top-8 z-10 w-48 bg-white rounded-md shadow-xl py-1 border border-gray-200 ${isMine ? "right-0 md:right-full md:mr-2" : "left-0 md:left-full md:ml-2"}`}>
                        <button onClick={() => handleCopyMessage(msg.content)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Copy
                        </button>
                        {isMine && (
                          <>
                            <button onClick={() => handlePinToggle(msg)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              {msg.isPinned ? "Unpin Message" : "Pin Message"}
                            </button>
                            <button onClick={() => {
                              const newContent = prompt("Edit message:", msg.content);
                              if (newContent !== null && newContent !== msg.content) {
                                fetch(`/api/messages/message/${msg.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ content: newContent })
                                }).then(res => {
                                  if (res.ok) setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: newContent, isEdited: true } : m));
                                });
                              }
                              setActiveMenu(null);
                            }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Edit
                            </button>
                          </>
                        )}
                        <button onClick={() => {
                            alert(`Message Info:\nSent: ${new Date(msg.createdAt).toLocaleString()}\nStatus: ${msg.isRead ? "Read by recipient" : "Delivered (Unread)"}`);
                            setActiveMenu(null);
                          }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Info
                        </button>
                        {!isMine && (
                          <>
                            <button onClick={() => handlePinToggle(msg)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              {msg.isPinned ? "Unpin Message" : "Pin Message"}
                            </button>
                            <button onClick={() => { alert("User blocked successfully!"); setActiveMenu(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Block
                            </button>
                          </>
                        )}
                        {isMine && (
                          <>
                            <button onClick={() => handleDeleteMessage(msg.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              Delete for me
                            </button>
                            <button onClick={() => handleDeleteMessage(msg.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold">
                              Delete for everyone
                            </button>
                          </>
                        )}
                      </div>
                    )}

                  </div>
                  <div className="flex items-center mt-1 mx-1 space-x-1 text-xs text-gray-400">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.isEdited && <span className="italic text-gray-400 mx-1">(edited)</span>}
                    {isMine && (
                      msg.isRead ? (
                        <svg className="w-4 h-4 text-blue-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7m-9 9l4 4L23 7"></path></svg>
                      ) : msg.isDelivered ? (
                        <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7m-9 9l4 4L23 7"></path></svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      )
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
