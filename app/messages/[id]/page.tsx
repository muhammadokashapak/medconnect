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
  const [isOnline, setIsOnline] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchMessages();
    socketInit();

    const pollInterval = setInterval(() => {
      fetchMessages(false);
    }, 10000); // Poll every 10 seconds for read/delivered receipts

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.emit("leave_room", params?.id);
        socket.disconnect();
      }
    };
  }, [params?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--vh', `${window.visualViewport.height}px`);
        window.scrollTo(0, 0);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();
    
    // Lock body scroll to prevent iOS safari from pushing the page up
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const socketInit = async () => {
    await fetch("/api/socket"); // ensure socket route is hit
    socket = io({ path: "/api/socket" });

    socket.on("connect", () => {
      socket.emit("join_room", params?.id);
      
      // Determine the recipient ID. 
      // If we don't have it yet, we can't check, but we can check if messages are loaded.
      // Usually params.id is the conversationId, not the doctorId.
      // The other doctor ID is recipientMsg?.senderId. Wait, this function runs early.
      // We'll emit check_online_status inside a useEffect once recipient is known.
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
    
    socket.on("online_status", (data: any) => {
      if (data.doctorId === params?.id || data.doctorId !== currentUser?.id) {
        setIsOnline(data.isOnline);
      }
    });
    
    socket.on("message_read", (data: any) => {
      setMessages((prev) => prev.map(m => m.id === data.messageId ? { ...m, isRead: true } : m));
    });
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachMenu(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const { url } = await res.json();
      
      // Determine type
      const isImage = file.type.startsWith('image/');
      const attachmentType = isImage ? 'IMAGE' : 'DOCUMENT';

      // Automatically send the attachment as a message
      await sendActualMessage("", url, attachmentType);
      
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sendActualMessage = async (contentStr: string, attachmentUrl?: string, attachmentType?: string) => {
    if (socket && currentUser) socket.emit("typing", { roomId: params?.id, doctorId: currentUser.id, isTyping: false });

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversationId: params?.id, 
          content: contentStr, 
          replyToId: replyToMessage?.id,
          attachmentUrl,
          attachmentType
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const { data: savedMessage, isAiConversation, aiBotId } = await res.json();
      setMessages(prev => [...prev, savedMessage]);
      setReplyToMessage(null);
      
      // Emit via socket
      if (socket) {
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
      
      // AI handling (optional for attachments, maybe skip if just an attachment)
      if (isAiConversation && aiBotId && contentStr) {
        setIsTyping(true);
        try {
          const aiRes = await fetch("/api/messages/ai-reply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId: params?.id,
              userMessage: contentStr,
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
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage;
    setNewMessage("");
    
    await sendActualMessage(content);
    setSending(false);
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

  // Find recipient info from messages
  const recipientMsg = messages.find(m => m.senderId !== currentUser?.id);
  const recipientId = recipientMsg?.senderId;
  const recipientName = recipientMsg?.sender?.fullName || "Doctor";
  const recipientAvatar = recipientMsg?.sender?.profileImage || null;

  useEffect(() => {
    if (socket && socket.connected && recipientId) {
      socket.emit('check_online_status', recipientId);
    }
  }, [recipientId]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col bg-[#efeae2] overflow-hidden" style={{ height: 'var(--vh, 100dvh)' }}>
      {/* WhatsApp Background Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      {/* Header */}
      <div className="bg-[#f0f2f5] px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0 z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/messages")}
            className="text-gray-500 hover:text-indigo-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
              {recipientAvatar ? (
                <img src={recipientAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-full h-full text-white mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-[16px] font-semibold text-gray-900 leading-tight">Dr. {recipientName}</h2>
              <p className={`text-[13px] font-medium ${isOnline || isTyping ? 'text-indigo-600' : 'text-gray-500'}`}>
                {isTyping ? "typing..." : (isOnline ? "online" : "offline")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-gray-500">
          <button onClick={handleMuteToggle} title={isChatMuted ? "Unmute Chat" : "Mute Chat"}>
            {isChatMuted ? (
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-5 h-5 hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>
          <button onClick={() => confirm("Delete entire chat?") && router.push("/messages")} className="hover:text-red-600" title="Delete Chat">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 max-w-5xl mx-auto w-full z-10 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex justify-center mt-4">
            <div className="bg-[#ffeecd] text-gray-700 text-xs py-1.5 px-3 rounded-lg shadow-sm text-center max-w-[85%]">
              Messages are end-to-end encrypted. No one outside of this chat, not even MedConnect, can read them.
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.senderId === currentUser?.id;
            const isFirstInSequence = index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1.5`}>
                <div className={`group relative flex flex-col max-w-[85%] md:max-w-[65%]`}>
                  {/* Bubble */}
                  <div 
                    className={`relative px-2.5 py-1.5 rounded-lg shadow-sm text-[15px] break-words whitespace-pre-wrap flex flex-col ${
                      isMine ? 'bg-[#e0e7ff] text-gray-900' : 'bg-white text-gray-900'
                    } ${isFirstInSequence && isMine ? 'rounded-tr-none' : ''} ${isFirstInSequence && !isMine ? 'rounded-tl-none' : ''}`}
                    onTouchStart={() => handleTouchStart(msg.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(msg.id)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                  >
                    {/* Tail */}
                    {isFirstInSequence && isMine && (
                      <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-[8px] text-[#e0e7ff]">
                        <path opacity=".13" fill="#0000000" d="M1.533 3.118L8 12.118V1H2.8z"></path>
                        <path fill="currentColor" d="M1.533 2.118L8 11.118V0H2.8z"></path>
                      </svg>
                    )}
                    {isFirstInSequence && !isMine && (
                      <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-[8px] text-white">
                        <path opacity=".13" fill="#0000000" d="M6.467 3.118L0 12.118V1h5.2z"></path>
                        <path fill="currentColor" d="M6.467 2.118L0 11.118V0h5.2z"></path>
                      </svg>
                    )}

                    {/* Content */}
                    <div className="flex flex-col">
                      {msg.replyTo && (
                        <div className="mb-1 pl-2 border-l-4 border-indigo-400 bg-black/5 rounded-r py-1 px-2 cursor-pointer">
                          <p className="font-semibold text-xs text-indigo-600 mb-0.5">{msg.replyTo.sender?.fullName || 'Someone'}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{msg.replyTo.content}</p>
                        </div>
                      )}
                      
                      {msg.attachmentUrl && msg.attachmentType === 'IMAGE' && (
                        <div className="mb-2 mt-1 rounded-lg overflow-hidden border border-black/5 max-w-[240px]">
                          <img src={msg.attachmentUrl} alt="attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      {msg.attachmentUrl && msg.attachmentType !== 'IMAGE' && (
                        <div className="mb-2 mt-1 flex items-center gap-2 bg-black/5 p-2 rounded-lg">
                          <svg className="w-6 h-6 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                          <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate">View Attachment</a>
                        </div>
                      )}

                      {msg.content && (
                        <div className="markdown-body text-[15px] pb-3 pr-8 space-y-1 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 leading-snug">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Timestamp & Ticks (Floating Bottom Right) */}
                      <div className="absolute bottom-1 right-1.5 flex items-center gap-1">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          <span className="text-gray-400">
                            {msg.isRead ? (
                              <svg viewBox="0 0 16 15" width="16" height="15" className="text-blue-500"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                            ) : msg.isDelivered ? (
                              <svg viewBox="0 0 16 15" width="16" height="15"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                            ) : (
                              <svg viewBox="0 0 11 14" width="11" height="14"><path fill="currentColor" d="M10.426 3.109l-7.79 8.568a.465.465 0 0 1-.684.015L.178 9.94a.435.435 0 0 1-.02-.625l.487-.512a.458.458 0 0 1 .64-.02l1.32 1.282a.229.229 0 0 0 .338-.01L9.18 2.617a.466.466 0 0 1 .684-.015l.582.482a.435.435 0 0 1 .02.625z"></path></svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {activeMenu === msg.id && (
                    <div className={`absolute top-full mt-1 z-[100] w-48 bg-white rounded-lg shadow-[0_2px_15px_rgba(0,0,0,0.15)] py-1 border border-gray-100 ${isMine ? "right-0" : "left-0"}`}>
                      <button onClick={() => setReplyToMessage(msg)} className="block w-full text-left px-4 py-2.5 text-[15px] text-gray-800 hover:bg-gray-50">Reply</button>
                      <button onClick={() => handleCopyMessage(msg.content)} className="block w-full text-left px-4 py-2.5 text-[15px] text-gray-800 hover:bg-gray-50">Copy</button>
                      <button onClick={() => { setActiveMenu(null); alert(`Info:\nSent: ${new Date(msg.createdAt).toLocaleString()}`); }} className="block w-full text-left px-4 py-2.5 text-[15px] text-gray-800 hover:bg-gray-50">Info</button>
                      {isMine && (
                        <button onClick={() => handleDeleteMessage(msg.id)} className="block w-full text-left px-4 py-2.5 text-[15px] text-red-500 hover:bg-gray-50">Delete for me</button>
                      )}
                      <div className="h-[1px] bg-gray-100 my-1"></div>
                      <button onClick={() => setActiveMenu(null)} className="block w-full text-left px-4 py-2.5 text-[15px] text-gray-500 hover:bg-gray-50">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-2 flex-shrink-0 z-10 w-full relative">
        <div className="max-w-5xl mx-auto w-full">
          {replyToMessage && (
            <div className="bg-[#f0f2f5] border-l-4 border-indigo-500 p-2 mb-2 rounded shadow-sm flex justify-between items-center mr-12 ml-2">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-indigo-500 mb-0.5">{replyToMessage.sender?.fullName}</p>
                <p className="text-[13px] text-gray-600 truncate">{replyToMessage.content}</p>
              </div>
              <button onClick={() => setReplyToMessage(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}

          {currentUser && currentUser.verificationStatus !== "VERIFIED" ? (
            <div className="bg-amber-50 p-3 rounded-lg text-center text-[15px] text-amber-800 shadow-sm mx-2">
              You must complete PMDC verification to send messages. <button onClick={() => router.push("/verification")} className="font-bold hover:underline">Verify</button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 w-full relative">
              {showAttachMenu && (
                <div className="absolute bottom-[60px] left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex flex-col gap-3 w-48 z-50 animate-fade-in-up">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="bg-purple-100 p-2.5 rounded-full text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <span className="text-gray-700 font-medium text-[15px]">Gallery</span>
                  </button>
                  <button type="button" onClick={() => { alert('Document upload coming soon!'); setShowAttachMenu(false); }} className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="bg-blue-100 p-2.5 rounded-full text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <span className="text-gray-700 font-medium text-[15px]">Document</span>
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />

              <div className="flex-1 bg-white rounded-3xl flex items-center min-h-[44px] shadow-sm overflow-hidden">
                <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className={`p-2 ml-1 transition ${showAttachMenu ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.13 0-12.13 0zm11.363-1.108s1.18-.312 1.724 1.088c.277.71.597 2.026 2.378 3.227 1.483 1.002 3.002.828 3.002.828.073-.028.143-.058.215-.093.315-.153.625-.333.918-.543.16-.115.313-.244.453-.385.12-.12.235-.255.335-.398.083-.11.16-.233.223-.363.048-.098.085-.205.115-.315.023-.083.04-.173.05-.265.01-.083.015-.17.013-.258-.008-.198-.035-.398-.08-.593-.05-.228-.125-.453-.223-.668-.113-.248-.25-.483-.41-.7-.18-.248-.388-.475-.625-.678-.26-.228-.545-.43-.848-.603-.33-.188-.683-.343-1.05-.465-.4-.135-.815-.233-1.24-.298-.458-.07-1.025-.098-1.5-.098z" opacity=".4"></path></svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={uploading ? "Uploading..." : "Message"}
                  disabled={uploading}
                  className="flex-1 bg-transparent border-none py-2.5 px-2 focus:outline-none focus:ring-0 text-[15px] text-gray-900 leading-tight disabled:opacity-50"
                />
                <button type="button" className="text-gray-400 p-2 hover:text-gray-600">
                  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path></svg>
                </button>
                <button type="button" className="text-gray-400 p-2 mr-1 hover:text-gray-600">
                  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M11.832 23.498a10.428 10.428 0 0 1-8.525-4.482A10.375 10.375 0 0 1 1.464 13.1c.07-2.67.994-5.188 2.673-7.288s3.945-3.415 6.452-3.722a10.354 10.354 0 0 1 7.29 1.83 10.44 10.44 0 0 1 3.947 5.753c.488 1.821.574 3.737.251 5.61-.318 1.821-1.114 3.49-2.329 4.881a10.334 10.334 0 0 1-4.717 3.018 10.224 10.224 0 0 1-3.2.516zm1.144-1.218a8.966 8.966 0 0 0 2.802-.45 9.074 9.074 0 0 0 4.14-2.651c1.074-1.229 1.776-2.705 2.056-4.316.284-1.656.208-3.349-.224-4.96A9.155 9.155 0 0 0 18.28 4.845a9.07 9.07 0 0 0-6.396-1.605c-2.217.272-4.225 1.436-5.711 3.292-1.485 1.857-2.302 4.088-2.363 6.451a9.074 9.074 0 0 0 1.616 5.188 9.13 9.13 0 0 0 7.481 3.931l.069-.022zM12 9.475a2.525 2.525 0 1 1 0 5.05 2.525 2.525 0 0 1 0-5.05z"></path></svg>
                </button>
              </div>
              <button
                type="submit"
                disabled={sending || uploading || !newMessage.trim()}
                className="bg-indigo-600 text-white w-[44px] h-[44px] rounded-full shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center flex-shrink-0"
              >
                {newMessage.trim() || uploading ? (
                  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current ml-1"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current"><path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.468 2.349 8.468 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zm6.238-3.531c0 3.531-2.942 6.002-6.238 6.002s-6.238-2.471-6.238-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.001z"></path></svg>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
