"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JitsiMeeting } from "@jitsi/react-sdk";
import toast from "react-hot-toast";

export default function VideoCallRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;
  
  const [name, setName] = useState("Doctor Participant");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Lock body scroll for immersive full screen
    document.body.style.overflow = 'hidden';

    // Fetch user profile to set their display name in the meeting
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if(data && data.fullName) {
          setName(data.role === "DOCTOR" ? "Dr. " + data.fullName : data.fullName);
        }
        setIsLoaded(true);
      }).catch(() => {
        setIsLoaded(true); // Proceed even if fails
      });

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium">Preparing Secure Meeting Room...</p>
      </div>
    );
  }

  // Creating a robust, unique room name specifically for MedConnect
  const uniqueRoomName = `MedConnect-SecureClinic-Room-${roomId}`;

  return (
    <div className="h-screen w-full bg-gray-900 relative">
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => router.push('/consultations')}
          className="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Leave Meeting
        </button>
      </div>

      <JitsiMeeting
        roomName={uniqueRoomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          startScreenSharing: true,
          enableEmailInStats: false,
          prejoinPageEnabled: true // Shows a prejoin page to check camera
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#111827',
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat',
            'settings', 'raisehand', 'videoquality', 'filmstrip', 'tileview'
          ]
        }}
        userInfo={{
          displayName: name
        }}
        onApiReady={(externalApi) => {
          externalApi.addListener('videoConferenceLeft', () => {
             toast.success("Meeting ended.");
             router.push('/consultations');
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
