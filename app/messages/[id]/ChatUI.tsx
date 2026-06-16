"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatUI({ id }: { id: string }) {
  const router = useRouter();
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
  const [showNewMsgIndicator, setShowNewMsgIndicator] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentUserRef = useRef<any>(null);

  // Keep the ref in sync with state so socket handlers have latest value
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Recipient derived from messages
  const recipientMsg = messages.find(m => m.senderId !== currentUser?.id);
  const recipientId = recipientMsg?.senderId;
  const recipientName = recipientMsg?.sender?.fullName || "Doctor";
  const recipientAvatar = recipientMsg?.sender?.profileImage || null;

  // Emit check_online_status when we know the recipient
  useEffect(() => {
    if (socketRef.current?.connected && recipientId) {
      socketRef.current.emit('check_online_status', recipientId);
    }
  }, [recipientId]);

  useEffect(() => {
    fetchProfile();
    fetchMessages();
    socketInit();

    const pollInterval = setInterval(() => {
      fetchMessages(false);
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      if (socketRef.current) {
        socketRef.current.emit("leave_room", id);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else {
      setShowNewMsgIndicator(true);
    }
  }, [messages]);

  // Track scroll position to show/hide new message indicator
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 80;
      setIsAtBottom(atBottom);
      if (atBottom) setShowNewMsgIndicator(false);
    }
  };

  // Generate a date separator label
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleCall = async (callType: 'AUDIO' | 'VIDEO') => {
    if (!recipientId || !currentUser) return;
    const roomId = `call_${[currentUser.id, recipientId].sort().join('_')}`;
    try {
      await fetch('/api/call-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDoctorId: recipientId, callType, roomId })
      });
    } catch (err) {
      console.error('Failed to send call notification:', err);
    }
    router.push(`/video/${roomId}`);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--vh', `${window.visualViewport.height}px`);
        window.scrollTo(0, 0);
        scrollToBottom();
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();
    
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
    try {
      await fetch("/api/socket");
    } catch (err) {
      console.error("Failed to initialize socket route:", err);
    }

    const socket = io({ path: "/api/socket" });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Join the conversation room using the conversationId
      socket.emit("join_room", id);

      // Register this user as online (use currentUserRef for latest value)
      const user = currentUserRef.current;
      if (user?.id) {
        socket.emit("user_online", user.id);
      }
    });

    socket.on("receive_message", (data: any) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      // Auto mark as read using ref for latest user data
      const user = currentUserRef.current;
      if (user && data.senderId !== user.id) {
        socket.emit("mark_read", { roomId: id, messageId: data.id });
      }
    });

    socket.on("user_typing", (data: any) => {
      const user = currentUserRef.current;
      if (user && data.doctorId !== user.id) {
        setIsTyping(data.isTyping);
      }
    });
    
    socket.on("online_status", (data: any) => {
      const user = currentUserRef.current;
      // Only update online status for the other person (not ourselves)
      if (user && data.doctorId !== user.id) {
        setIsOnline(data.isOnline);
      }
    });
    
    socket.on("message_read", (data: any) => {
      setMessages((prev) => prev.map(m => m.id === data.messageId ? { ...m, isRead: true } : m));
    });
  };

  // Once we have currentUser, register online status
  useEffect(() => {
    if (currentUser?.id && socketRef.current?.connected) {
      socketRef.current.emit("user_online", currentUser.id);
    }
  }, [currentUser]);

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
      const res = await fetch(`/api/messages/${id}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/messages");
          return;
        }
        const text = await res.text();
        throw new Error(`Failed to load messages (Status: ${res.status}). Details: ${text.substring(0, 50)}`);
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
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    const socket = socketRef.current;
    if (socket && currentUser) {
      socket.emit("typing", { roomId: id, doctorId: currentUser.id, isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { roomId: id, doctorId: currentUser.id, isTyping: false });
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
      const isImage = file.type.startsWith('image/');
      const attachmentType = isImage ? 'IMAGE' : 'DOCUMENT';
      await sendActualMessage("", url, attachmentType);
      
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sendActualMessage = async (contentStr: string, attachmentUrl?: string, attachmentType?: string) => {
    const socket = socketRef.current;
    if (socket && currentUser) socket.emit("typing", { roomId: id, doctorId: currentUser.id, isTyping: false });

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversationId: id, 
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
      
      // Emit via socket with the conversationId as roomId (FIXED)
      if (socket) {
        const payload = {
          ...savedMessage,
          roomId: id, // FIX: Include the roomId so socket server can broadcast correctly
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
      
      // AI handling
      if (isAiConversation && aiBotId && contentStr) {
        setIsTyping(true);
        try {
          const aiRes = await fetch("/api/messages/ai-reply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId: id,
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
        body: JSON.stringify({ conversationId: id, isMuted: newMuteStatus })
      });
    } catch (err) {
      setIsChatMuted(!newMuteStatus);
    }
    setActiveMenu(null);
  };

  const handleDeleteChat = async () => {
    if (!confirm("Delete entire chat? This will remove all messages permanently.")) return;
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      router.push("/messages");
    } catch (err) {
      alert("Failed to delete chat");
    }
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
    return <div className="min-h-screen flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><span className="text-gray-500 font-medium">Loading chat...</span></div></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm mx-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button onClick={() => router.push("/messages")} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition">Back to Messages</button>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => recipientId && router.push(`/doctor/${recipientId}`)}>
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
        <div className="flex gap-3 text-gray-500 items-center">
          {/* Voice Call */}
          <button onClick={() => handleCall('AUDIO')} className="hover:text-green-600 transition" title="Voice Call">
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </button>
          {/* Video Call */}
          <button onClick={() => handleCall('VIDEO')} className="hover:text-blue-600 transition" title="Video Call">
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>
          {/* Mute */}
          <button onClick={handleMuteToggle} title={isChatMuted ? "Unmute Chat" : "Mute Chat"}>
            {isChatMuted ? (
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-5 h-5 hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>
          {/* Delete */}
          <button onClick={handleDeleteChat} className="hover:text-red-600" title="Delete Chat">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 max-w-5xl mx-auto w-full z-10 flex flex-col relative">
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
            const showDateSep = index === 0 || getDateLabel(msg.createdAt) !== getDateLabel(messages[index - 1].createdAt);

            return (
              <div key={msg.id}>
                {/* Date Separator */}
                {showDateSep && (
                  <div className="flex justify-center my-3">
                    <span className="bg-white text-gray-500 text-[12px] font-medium py-1 px-4 rounded-lg shadow-sm">{getDateLabel(msg.createdAt)}</span>
                  </div>
                )}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1.5`}>
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

                      {/* Timestamp & Ticks */}
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
                      <button onClick={() => { setReplyToMessage(msg); setActiveMenu(null); }} className="block w-full text-left px-4 py-2.5 text-[15px] text-gray-800 hover:bg-gray-50">Reply</button>
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
              </div>
            </div>);
          })
        )}
        <div ref={messagesEndRef} className="h-1" />

        {/* New Messages Floating Indicator */}
        {showNewMsgIndicator && (
          <button
            onClick={() => { scrollToBottom(); setShowNewMsgIndicator(false); }}
            className="sticky bottom-2 mx-auto bg-white text-indigo-600 px-4 py-1.5 rounded-full shadow-lg border border-gray-200 text-sm font-medium flex items-center gap-1.5 hover:bg-indigo-50 transition z-20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            New messages
          </button>
        )}
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={uploading ? "Uploading..." : "Message"}
                  disabled={uploading}
                  autoFocus
                  className="flex-1 bg-transparent border-none py-2.5 px-2 focus:outline-none focus:ring-0 text-[15px] text-gray-900 leading-tight disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={sending || uploading || !newMessage.trim()}
                className="bg-indigo-600 text-white w-[44px] h-[44px] rounded-full shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center flex-shrink-0"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current ml-1"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
