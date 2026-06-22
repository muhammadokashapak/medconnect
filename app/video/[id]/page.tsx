"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
let socket: Socket;
let SimplePeer: any;

export default function VideoCallRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [preJoin, setPreJoin] = useState(true);
  const [me, setMe] = useState("");
  const [stream, setStream] = useState<MediaStream>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [remoteName, setRemoteName] = useState("Other Participant");
  
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const [myId, setMyId] = useState("");
  const [receiverId, setReceiverId] = useState("");

  useEffect(() => {
    // Lock body scroll for immersive full screen
    document.body.style.overflow = 'hidden';
    
    SimplePeer = require("simple-peer");
    socket = io({ path: "/api/socket" });

    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if(data && data.fullName) {
          setName("Dr. " + data.fullName);
          setMyId(data.id);
        }
      }).catch(()=>{});

    // Fetch appointment to get receiverId
    fetch(`/api/appointments`)
      .then(res => res.json())
      .then(appointments => {
        const currentAppt = appointments.find((a: any) => a.id === roomId);
        if (currentAppt) {
          fetch("/api/profile").then(res => res.json()).then(me => {
            const isConsultant = currentAppt.consultantId === me.id;
            setReceiverId(isConsultant ? currentAppt.doctorId : currentAppt.consultantId);
          });
        }
      }).catch(()=>{});

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    }).catch(err => {
        toast.error("Camera/Microphone permissions are required.");
    });

    socket.on("connect", () => {
      setMe(socket.id!);
    });

    // When someone joins the conference, call them automatically
    socket.on('user_joined_conference', (userId: string) => {
      // Initiate call to this user automatically
      callUser(userId);
    });

    // When someone calls us, answer automatically
    socket.on("call_user", (data) => {
      setRemoteName(data.name || "Remote User");
      answerCall(data.signal, data.from);
    });

    socket.on("call_ended", () => {
      endCallLocally();
    });

    return () => {
      document.body.style.overflow = '';
      socket.disconnect();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) connectionRef.current.destroy();
    };
  }, [roomId]);

  // Ensure my local video element updates when stream is ready in waiting/preJoin state
  useEffect(() => {
    if (stream && myVideo.current) {
        myVideo.current.srcObject = stream;
    }
  }, [stream, preJoin, callAccepted]);

  // 30 minute timeout timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (callStartTime && callAccepted && !callEnded) {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        setCallDuration(duration);
        
        // 30 minutes = 1800 seconds
        if (duration >= 1800) {
            toast.error("Maximum meeting duration of 30 minutes reached. Disconnecting...");
            leaveCall();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [callStartTime, callAccepted, callEnded]);

  const [callDeclined, setCallDeclined] = useState(false);

  useEffect(() => {
    socket.on("global_call_rejected", () => {
      setCallDeclined(true);
      setPreJoin(false); // Drop them out of prejoin directly to the declined screen
    });

    return () => {
      socket.off("global_call_rejected");
    }
  }, []);

  const joinMeeting = () => {
    setPreJoin(false);
    socket.emit("join_conference", roomId);

    const isJoining = new URLSearchParams(window.location.search).get("join") === "true";
    if (!isJoining && receiverId) {
      // Ring the other user
      socket.emit("start_global_call", {
        receiverId: receiverId,
        callerId: myId,
        callerName: name,
        roomId: roomId,
        type: "MEETING"
      });
    }
  };

  const callUser = (idToCall: string) => {
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

    socket.on("call_accepted", (signal: any) => {
      setCallAccepted(true);
      if(!callStartTime) setCallStartTime(Date.now());
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = (callerSignal: any, callerId: string) => {
    setCallAccepted(true);
    if(!callStartTime) setCallStartTime(Date.now());

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (data: any) => {
      socket.emit("answer_call", { signal: data, to: callerId });
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
        receiverId: roomId,
        type: stream?.getVideoTracks()[0]?.enabled ? "VIDEO" : "AUDIO",
        duration: callDuration,
        startedAt: new Date(callStartTime || Date.now()),
        endedAt: new Date()
      })
    }).catch(()=>{});
    
    // Redirect back to MedConnect after small delay
    setTimeout(() => {
        router.push("/appointments");
    }, 1500);
  };

  const leaveCall = () => {
    socket.emit("end_call", { to: roomId }); // generic end call to everyone
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

  // UI Components
  
  if (preJoin) {
    return (
      <div className="min-h-screen bg-[#202124] text-white flex flex-col justify-center items-center p-4 z-[100] fixed inset-0">
        <h1 className="text-3xl font-normal mb-8">Ready to join?</h1>
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Preview Window */}
          <div className="relative w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-700">
            {stream && cameraOn ? (
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#3c4043]">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#8ab4f8] text-[#202124] flex items-center justify-center text-5xl sm:text-6xl font-normal shadow-lg tracking-wider">
                  {name ? name.replace('Dr. ', '').trim().charAt(0).toUpperCase() : "Y"}
                </div>
                <span className="text-[15px] mt-6 text-gray-300 font-medium tracking-wide">Camera is off</span>
              </div>
            )}
            
            {/* Small Mic Indicator Top Right */}
            <div className="absolute top-4 right-4 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
              {micOn ? (
                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              ) : (
                 <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
              )}
            </div>

            {/* Controls in Preview */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg border border-transparent ${micOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-white border-gray-600/50' : 'bg-[#ea4335] hover:bg-[#f25244] text-white'}`} title={micOn ? "Turn off mic" : "Turn on mic"}>
                {micOn ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
                )}
              </button>
              <button onClick={toggleCamera} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg border border-transparent ${cameraOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-white border-gray-600/50' : 'bg-[#ea4335] hover:bg-[#f25244] text-white'}`} title={cameraOn ? "Turn off camera" : "Turn on camera"}>
                {cameraOn ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Join Actions */}
          <div className="flex flex-col items-center md:items-start max-w-xs">
            <h2 className="text-2xl font-medium mb-6 text-center md:text-left">{name || "Doctor"}</h2>
            <button 
              onClick={joinMeeting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors text-lg shadow-md w-full md:w-auto mb-4"
            >
              Join Meeting
            </button>
            <p className="text-gray-400 text-sm text-center md:text-left">
              Ensure you are in a quiet environment before joining the consultation. Meetings are limited to 30 minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#202124] flex flex-col fixed inset-0 z-[100]">
      {/* Header Info */}
      <div className="absolute top-0 left-0 p-4 z-10 flex gap-4 text-white text-sm">
        {callAccepted && !callEnded && (
            <div className="bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {formatDuration(callDuration)} / 30:00
            </div>
        )}
      </div>

      {/* Main Video Area */}
      <div className="flex-grow relative flex items-center justify-center p-2 md:p-6 overflow-hidden">
        {callAccepted && !callEnded ? (
          // Connected State
          <div className="w-full h-full relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
            {/* Remote Video (Full Screen) */}
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-contain" />
            
            {/* My Video (Picture in Picture style) */}
            <div className="absolute bottom-4 right-4 w-32 sm:w-60 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-600 z-20">
              {stream && cameraOn ? (
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-900 text-sm">
                  You
                </div>
              )}
            </div>
            
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-md text-white text-sm font-medium backdrop-blur-sm z-20">
              {remoteName}
            </div>
          </div>
        ) : callDeclined ? (
            // Call Declined State
            <div className="text-white text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h1 className="text-4xl font-bold mb-2">Call Declined</h1>
                <p className="text-gray-400 mb-8 max-w-md">The other participant has declined your meeting request. They may be busy right now.</p>
                <button onClick={() => router.push("/appointments")} className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors">Return to Dashboard</button>
            </div>
        ) : callEnded ? (
            // Call Ended State
            <div className="text-white text-center flex flex-col items-center">
                <h1 className="text-4xl mb-4">You left the meeting</h1>
                <button onClick={() => router.push("/appointments")} className="text-blue-400 hover:underline">Return to home screen</button>
            </div>
        ) : (
          // Waiting State
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-gray-700 mb-6 shadow-xl">
              {stream && cameraOn ? (
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                  <svg className="w-16 h-16 md:w-24 md:h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                </div>
              )}
            </div>
            <h2 className="text-xl md:text-2xl text-white font-medium mb-2 text-center">Waiting for others to join...</h2>
            <p className="text-gray-400 text-center max-w-sm px-4">The call will automatically start when the other participant joins.</p>
            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Google Meet Bottom Controls */}
      {!callEnded && (
        <div className="h-20 bg-[#202124] flex items-center justify-center gap-4 px-4 pb-safe border-t border-gray-800/50 flex-shrink-0">
          <button 
            onClick={toggleMic} 
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-white' : 'bg-[#ea4335] hover:bg-[#f25244] text-white'}`}
            title={micOn ? "Turn off microphone" : "Turn on microphone"}
          >
            {micOn ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
            )}
          </button>
          
          <button 
            onClick={toggleCamera} 
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${cameraOn ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-white' : 'bg-[#ea4335] hover:bg-[#f25244] text-white'}`}
            title={cameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {cameraOn ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            )}
          </button>

          {callAccepted && (
            <button 
              onClick={toggleScreenShare} 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-[#8ab4f8] text-gray-900' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'}`}
              title={isScreenSharing ? "Stop presenting" : "Present now"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </button>
          )}

          <button 
            onClick={leaveCall} 
            className="w-16 h-12 sm:w-20 sm:h-14 rounded-full flex items-center justify-center bg-[#ea4335] hover:bg-[#f25244] text-white shadow-lg transition-transform ml-2 sm:ml-4"
            title="Leave call"
          >
            <svg className="w-6 h-6 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
}
