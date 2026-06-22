"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Phone, Video, Calendar, PhoneOff, PhoneCall } from "lucide-react";

interface CallData {
  receiverId: string;
  callerId: string;
  callerName: string;
  roomId: string;
  type: "MEETING" | "VIDEO" | "AUDIO";
}

interface CallContextType {
  socket: Socket | null;
  me: string;
}

const CallContext = createContext<CallContextType>({ socket: null, me: "" });

export const useGlobalCall = () => useContext(CallContext);

export default function GlobalCallProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [me, setMe] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch profile to know who we are (for socket registration)
    fetch("/api/profile")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.id) {
          setCurrentUser(data);
          const newSocket = io({ 
            path: "/api/socket",
            reconnectionAttempts: 3,
            reconnectionDelayMax: 5000,
            timeout: 10000
          });
          setSocket(newSocket);

          newSocket.on("connect", () => {
            setMe(newSocket.id!);
            newSocket.emit("user_online", data.id); // register user online
          });

          newSocket.on("incoming_global_call", (callData: CallData) => {
            setIncomingCall(callData);
            if (audioRef.current) {
              audioRef.current.loop = true;
              audioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
            }
          });

          return () => {
            newSocket.disconnect();
          };
        }
      });
  }, []);

  const handleAccept = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const roomId = incomingCall?.roomId;
    setIncomingCall(null);
    if (roomId) {
      // Use join=true to distinguish answering vs calling
      router.push(`/video/${roomId}?join=true`);
    }
  };

  const handleReject = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (socket && incomingCall) {
      socket.emit("global_call_rejected", { callerId: incomingCall.callerId });
    }
    setIncomingCall(null);
  };

  return (
    <CallContext.Provider value={{ socket, me }}>
      {children}
      
      {/* Hidden audio element for ringing. A real app would have this asset, but we fallback gracefully if not. */}
      <audio ref={audioRef} src="/sounds/ringtone.mp3" preload="auto" />

      {/* Full Screen Incoming Call Overlay */}
      {incomingCall && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white/10 border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 text-center">
            
            {/* Avatar Pulse */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-28 h-28 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white/10">
                <span className="text-4xl font-bold text-white">
                  {incomingCall.callerName.replace("Dr. ", "").charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-2">
              {incomingCall.callerName}
            </h2>
            <p className="text-lg text-indigo-200 mb-8 font-medium">
              {incomingCall.type === "MEETING" 
                ? "has started a meeting with you. Kindly join."
                : `is calling you...`}
            </p>

            <div className="flex items-center gap-8 w-full justify-center">
              {/* Reject Button */}
              <button 
                onClick={handleReject}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <span className="text-rose-400 font-bold text-sm tracking-wide group-hover:text-rose-300 transition-colors">Decline</span>
              </button>

              {/* Accept Button */}
              <button 
                onClick={handleAccept}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95">
                  {incomingCall.type === "MEETING" ? <Video className="w-7 h-7" /> : <PhoneCall className="w-7 h-7" />}
                </div>
                <span className="text-emerald-400 font-bold text-sm tracking-wide group-hover:text-emerald-300 transition-colors">Accept</span>
              </button>
            </div>
            
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}
