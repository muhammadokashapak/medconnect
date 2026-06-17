"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

let socket: Socket;
let SimplePeer: any;

const Video = ({ peer }: { peer: any }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", (stream: MediaStream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <video playsInline autoPlay ref={ref} className="w-full h-full object-cover rounded-xl shadow-lg bg-[#3c4043]" />
  );
};

export default function ConferenceRoom() {
  const router = useRouter();
  const [peers, setPeers] = useState<any[]>([]);
  const [stream, setStream] = useState<MediaStream>();
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<any[]>([]);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    SimplePeer = require("simple-peer");
    socket = io({ path: "/api/socket" });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    }).catch(err => {
      console.error("Failed to get media", err);
      toast.error("Please allow camera and microphone access to join the conference.");
    });

    return () => {
      if (socket) socket.disconnect();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(p => p.peer.destroy());
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim()) return;
    setJoined(true);

    socket.emit("join_conference", roomId);

    socket.on("user_joined_conference", (userId) => {
      const peer = createPeer(userId, socket.id!, stream!);
      peersRef.current.push({
        peerID: userId,
        peer,
      });
      setPeers((users) => [...users, { peerID: userId, peer }]);
    });

    socket.on("conference_user_joined", (payload) => {
      const peer = addPeer(payload.signal, payload.callerID, stream!);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
      });
      setPeers((users) => [...users, { peerID: payload.callerID, peer }]);
    });

    socket.on("receiving_returned_signal", (payload) => {
      const item = peersRef.current.find((p) => p.peerID === payload.id);
      if (item) {
        item.peer.signal(payload.signal);
      }
    });

    socket.on("call_ended", () => {
      // Handle user disconnect (for demo, relying on refresh)
    });
  };

  const createPeer = (userToSignal: string, callerID: string, stream: MediaStream) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal: any) => {
      socket.emit("send_conference_signal", { userToSignal, callerID, signal });
    });

    return peer;
  };

  const addPeer = (incomingSignal: any, callerID: string, stream: MediaStream) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal: any) => {
      socket.emit("return_conference_signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
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

  const leaveRoom = () => {
    window.location.href = "/feed";
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true } as any);
        const videoTrack = screenStream.getVideoTracks()[0];
        
        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(stream!.getVideoTracks()[0], videoTrack, stream);
        });
        
        if (userVideo.current) {
          userVideo.current.srcObject = screenStream;
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
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      peersRef.current.forEach(({ peer }) => {
        const currentVideoTrack = peer.streams[0]?.getVideoTracks()[0];
        if (currentVideoTrack) {
           peer.replaceTrack(currentVideoTrack, videoTrack, stream);
        }
      });
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    }
    setIsScreenSharing(false);
  };

  // Pre-join screen (Google Meet style)
  if (!joined) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Video Preview */}
          <div className="relative w-full aspect-video bg-[#3c4043] rounded-2xl overflow-hidden shadow-xl flex items-center justify-center border border-gray-700">
             {cameraOn ? (
               <video ref={userVideo} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center bg-[#202124]">
                 <div className="w-24 h-24 rounded-full bg-[#3c4043] flex items-center justify-center">
                   <svg className="w-12 h-12 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                 </div>
                 <p className="text-white mt-4 font-medium">Camera is off</p>
               </div>
             )}
             
             {/* Preview Controls */}
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
               <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-transparent border border-gray-300 text-white hover:bg-white/10' : 'bg-[#ea4335] text-white border-none'}`}>
                 {micOn ? (
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
                 ) : (
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.8 4.9c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2l-.01 3.91L15 10.6V5c0-1.66-1.34-3-3-3S9 3.34 9 5v1.6l1.8 1.8V4.9zM19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.55-.98.9-2.12.9-3.28zm-9.8 8.72v3.28h2v-3.28c2.61-.37 4.71-2.08 5.61-4.41l-1.42-1.42c-.67 1.57-2.22 2.71-3.99 2.82l-2.2-2.2V14c0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.45 1.45C13.56 18.79 12.8 19 12 19c-3.31 0-6-2.69-6-6H4.3c0 3.32 2.68 6.09 5.9 6.72zM2.1 2.1L.69 3.51 5.18 8C5.06 8.31 5 8.65 5 9v2h1.7V9c0-.18.03-.35.07-.51l2.53 2.53v.08c0 1.66 1.34 3 3 3 .35 0 .68-.06.99-.17l4.2 4.2 1.41-1.41L2.1 2.1z"/></svg>
                 )}
               </button>
               <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${cameraOn ? 'bg-transparent border border-gray-300 text-white hover:bg-white/10' : 'bg-[#ea4335] text-white border-none'}`}>
                 {cameraOn ? (
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                 ) : (
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.81 2.81L1.39 4.22l2.27 2.27H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h10.78l3.6 3.6 1.41-1.41L2.81 2.81zM5 16V8.83l7.17 7.17H5zm12-5.5v-3.5c0-.55-.45-1-1-1H5.83l2 2H16v6.17l2 2v-1.67l4 4v-11l-4 4z"/></svg>
                 )}
               </button>
             </div>
          </div>
          
          {/* Right: Join Info */}
          <div className="text-center md:text-left text-white px-4">
            <h1 className="text-4xl font-normal mb-8 leading-tight">Ready to join?</h1>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room Code"
              className="w-full bg-transparent border border-gray-500 rounded-md p-3 focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none mb-6 text-white text-lg transition"
            />
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={joinRoom}
                className="w-full sm:w-auto bg-[#8ab4f8] hover:bg-[#93bbff] text-[#202124] font-medium py-2.5 px-8 rounded-full text-sm transition"
              >
                Join now
              </button>
              <button 
                onClick={toggleScreenShare} 
                className="w-full sm:w-auto bg-transparent border border-gray-400 hover:border-[#8ab4f8] hover:text-[#8ab4f8] text-[#8ab4f8] font-medium py-2.5 px-6 rounded-full text-sm transition"
              >
                Present
              </button>
            </div>
            <button onClick={() => router.push("/feed")} className="mt-8 text-sm text-[#8ab4f8] hover:underline font-medium block">
              Back to MedConnect
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Determine grid columns
  const totalVideos = peers.length + 1;
  const gridColsClass = totalVideos === 1 ? 'grid-cols-1' : totalVideos === 2 ? 'grid-cols-1 md:grid-cols-2' : totalVideos <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="h-screen bg-[#202124] flex flex-col overflow-hidden text-white">
      
      {/* Video Grid Area */}
      <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
        <div className={`w-full h-full max-w-[1400px] grid ${gridColsClass} gap-4 auto-rows-fr place-items-center`}>
          
          {/* Local User */}
          <div className="relative w-full h-full max-h-full aspect-video bg-[#3c4043] rounded-xl overflow-hidden shadow-lg border border-[#3c4043]">
            {cameraOn ? (
              <video playsInline muted ref={userVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#202124]">
                <div className="w-20 h-20 rounded-full bg-[#3c4043] flex items-center justify-center">
                  <svg className="w-10 h-10 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium tracking-wide">
              You
            </div>
            {!micOn && (
              <div className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 shadow">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M10.8 4.9c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2l-.01 3.91L15 10.6V5c0-1.66-1.34-3-3-3S9 3.34 9 5v1.6l1.8 1.8V4.9zM19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.55-.98.9-2.12.9-3.28zm-9.8 8.72v3.28h2v-3.28c2.61-.37 4.71-2.08 5.61-4.41l-1.42-1.42c-.67 1.57-2.22 2.71-3.99 2.82l-2.2-2.2V14c0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.45 1.45C13.56 18.79 12.8 19 12 19c-3.31 0-6-2.69-6-6H4.3c0 3.32 2.68 6.09 5.9 6.72zM2.1 2.1L.69 3.51 5.18 8C5.06 8.31 5 8.65 5 9v2h1.7V9c0-.18.03-.35.07-.51l2.53 2.53v.08c0 1.66 1.34 3 3 3 .35 0 .68-.06.99-.17l4.2 4.2 1.41-1.41L2.1 2.1z"/></svg>
              </div>
            )}
          </div>

          {/* Peers */}
          {peers.map((peer, index) => (
            <div key={index} className="relative w-full h-full max-h-full aspect-video bg-[#3c4043] rounded-xl overflow-hidden shadow-lg border border-[#3c4043]">
              <Video peer={peer.peer} />
              <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium tracking-wide">
                Participant
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="h-20 bg-[#202124] flex items-center justify-between px-6 shrink-0 z-50">
        
        {/* Left Info */}
        <div className="flex-1 flex items-center text-sm font-medium text-white tracking-wide">
          <span className="hidden sm:inline">{currentTime}</span>
          <span className="hidden sm:inline mx-2">|</span>
          <span className="uppercase">{roomId}</span>
        </div>

        {/* Center Controls */}
        <div className="flex gap-4 items-center justify-center flex-1">
          <button 
            onClick={toggleMic} 
            className={`w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-[#3c4043] hover:bg-[#4a4f52] text-white' : 'bg-[#ea4335] text-white shadow-lg'}`}
            title={micOn ? "Turn off microphone" : "Turn on microphone"}
          >
            {micOn ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10.8 4.9c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2l-.01 3.91L15 10.6V5c0-1.66-1.34-3-3-3S9 3.34 9 5v1.6l1.8 1.8V4.9zM19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.55-.98.9-2.12.9-3.28zm-9.8 8.72v3.28h2v-3.28c2.61-.37 4.71-2.08 5.61-4.41l-1.42-1.42c-.67 1.57-2.22 2.71-3.99 2.82l-2.2-2.2V14c0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.45 1.45C13.56 18.79 12.8 19 12 19c-3.31 0-6-2.69-6-6H4.3c0 3.32 2.68 6.09 5.9 6.72zM2.1 2.1L.69 3.51 5.18 8C5.06 8.31 5 8.65 5 9v2h1.7V9c0-.18.03-.35.07-.51l2.53 2.53v.08c0 1.66 1.34 3 3 3 .35 0 .68-.06.99-.17l4.2 4.2 1.41-1.41L2.1 2.1z"/></svg>
            )}
          </button>
          
          <button 
            onClick={toggleCamera} 
            className={`w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center transition-colors ${cameraOn ? 'bg-[#3c4043] hover:bg-[#4a4f52] text-white' : 'bg-[#ea4335] text-white shadow-lg'}`}
            title={cameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {cameraOn ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.81 2.81L1.39 4.22l2.27 2.27H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h10.78l3.6 3.6 1.41-1.41L2.81 2.81zM5 16V8.83l7.17 7.17H5zm12-5.5v-3.5c0-.55-.45-1-1-1H5.83l2 2H16v6.17l2 2v-1.67l4 4v-11l-4 4z"/></svg>
            )}
          </button>

          <button 
            onClick={toggleScreenShare} 
            className={`hidden sm:flex w-[50px] h-[50px] rounded-full items-center justify-center transition-colors ${isScreenSharing ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4a4f52] text-white'}`}
            title={isScreenSharing ? "Stop presenting" : "Present now"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-7v2h-3v3h-2v-3H8v-2h3V7h2v3h3z"/></svg>
          </button>

          <button 
            onClick={leaveRoom} 
            className="h-[40px] px-4 sm:h-[50px] sm:px-6 rounded-full flex items-center justify-center bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg transition-transform hover:scale-105 ml-2"
            title="Leave call"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
          </button>
        </div>

        {/* Right Info */}
        <div className="flex-1 flex items-center justify-end gap-4 text-white">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[#3c4043] cursor-pointer transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span className="font-medium text-sm">{totalVideos}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
