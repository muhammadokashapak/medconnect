"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
let socket: Socket;
let SimplePeer: any;

export default function VideoCallRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [me, setMe] = useState("");
  const [stream, setStream] = useState<MediaStream>();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  useEffect(() => {
    SimplePeer = require("simple-peer");
    socket = io({ path: "/api/socket" });

    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        setName("Dr. " + data.fullName);
      });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    socket.on("connect", () => {
      setMe(socket.id!);
      // Join the room for targeted signaling if needed
      socket.emit("join_room", roomId);
    });

    socket.on("call_user", (data) => {
      // In a real app we'd verify room IDs, but we use Socket ID directly here
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("call_ended", () => {
      endCallLocally();
    });

    const timer = setInterval(() => {
      if (callStartTime && callAccepted && !callEnded) {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      socket.disconnect();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) connectionRef.current.destroy();
    };
  }, [roomId, callAccepted, callEnded, callStartTime]);

  const callUser = () => {
    // Prompt for the other user's socket ID (For simplicity in this 1-on-1 demo)
    // Normally, we'd use the roomId to automatically find the other user
    const idToCall = prompt("Enter the ID of the user you want to call (in a full app this is automatic):");
    if (!idToCall) return;

    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (data: any) => {
      socket.emit("call_user", {
        userToCall: idToCall,
        signalData: data,
        from: me,
        name: name
      });
    });

    peer.on("stream", (currentStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on("call_accepted", (signal) => {
      setCallAccepted(true);
      setCallStartTime(Date.now());
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    setCallStartTime(Date.now());

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (data: any) => {
      socket.emit("answer_call", { signal: data, to: caller });
    });

    peer.on("stream", (currentStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const endCallLocally = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    // Save to DB via API
    fetch("/api/call-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: roomId, // Using roomId as placeholder for receiverId
        type: stream?.getVideoTracks()[0].enabled ? "VIDEO" : "AUDIO",
        duration: callDuration,
        startedAt: new Date(callStartTime || Date.now()),
        endedAt: new Date()
      })
    });
    router.push("/dashboard");
  };

  const leaveCall = () => {
    socket.emit("end_call", { to: caller || roomId });
    endCallLocally();
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true } as any);
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (connectionRef.current && stream) {
          connectionRef.current.replaceTrack(stream.getVideoTracks()[0], videoTrack, stream);
        }
        
        if (myVideo.current) {
          myVideo.current.srcObject = screenStream;
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (stream && connectionRef.current) {
      const videoTrack = stream.getVideoTracks()[0];
      connectionRef.current.replaceTrack(connectionRef.current.streams[0].getVideoTracks()[0], videoTrack, stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    }
    setIsScreenSharing(false);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
          Telemedicine Consultation {callAccepted && !callEnded && `(${formatDuration(callDuration)})`}
        </h1>
        <div className="text-sm bg-gray-700 px-3 py-1 rounded border border-gray-600">
          Your ID: <span className="font-mono font-bold text-green-400">{me}</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 gap-4 place-items-center">
        {/* My Video */}
        <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 aspect-video">
          {stream ? (
            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">Camera off</div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium backdrop-blur-sm">
            {name || "You"}
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 aspect-video flex items-center justify-center flex-col">
          {callAccepted && !callEnded ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Waiting for patient/doctor to join...
            </div>
          )}
          {callAccepted && !callEnded && (
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium backdrop-blur-sm">
              Remote User
            </div>
          )}
        </div>
      </div>

      {/* Call Actions */}
      <div className="p-6 bg-gray-800 flex justify-center items-center gap-6">
        <button 
          onClick={toggleMic} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micOn ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
          )}
        </button>
        
        <button 
          onClick={toggleCamera} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${cameraOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          title={cameraOn ? "Turn off Camera" : "Turn on Camera"}
        >
          {cameraOn ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
          )}
        </button>

        {callAccepted && !callEnded && (
          <button 
            onClick={toggleScreenShare} 
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
            title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </button>
        )}

        {callAccepted && !callEnded ? (
          <button 
            onClick={leaveCall} 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
            title="End Call"
          >
            <svg className="w-8 h-8 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
        ) : (
          <button 
            onClick={callUser} 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105"
            title="Start Call"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
        )}
      </div>

      {/* Incoming Call Overlay */}
      {receivingCall && !callAccepted && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 text-center max-w-sm w-full mx-4">
            <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{name} is calling...</h2>
            <p className="text-gray-400 mb-8">Incoming video consultation</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={answerCall}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition"
              >
                Accept
              </button>
              <button 
                onClick={() => setReceivingCall(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
