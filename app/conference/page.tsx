"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JitsiMeeting } from "@jitsi/react-sdk";
import toast from "react-hot-toast";

export default function ConferenceRoom() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("Doctor Participant");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if(data && data.fullName) {
          setName(data.role === "DOCTOR" ? "Dr. " + data.fullName : data.fullName);
        }
        setIsLoaded(true);
      }).catch(() => {
        setIsLoaded(true);
      });
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return toast.error("Please enter a room ID");
    setJoined(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-screen bg-[#202124] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MedConnect Conf</h1>
            <p className="text-gray-500">Join a secure video conference</p>
          </div>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting ID</label>
              <input
                type="text"
                placeholder="Enter meeting ID or link"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-lg font-medium"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/30 text-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Join Meeting
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
             <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline font-medium">
               Return to Dashboard
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#202124] relative">
       <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => setJoined(false)}
          className="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Leave
        </button>
      </div>

      <JitsiMeeting
        roomName={`MedConnect-Conference-${roomId}`}
        configOverwrite={{
          startWithAudioMuted: false,
          disableModeratorIndicator: true,
          startScreenSharing: true,
          enableEmailInStats: false,
          prejoinPageEnabled: true
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          DEFAULT_BACKGROUND: '#202124',
        }}
        userInfo={{
          displayName: name
        }}
        onApiReady={(externalApi) => {
          externalApi.addListener('videoConferenceLeft', () => {
             setJoined(false);
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
          iframeRef.style.border = 'none';
        }}
      />
    </div>
  );
}
