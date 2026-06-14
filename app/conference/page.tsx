"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

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
    <video playsInline autoPlay ref={ref} className="w-full h-full object-cover rounded-xl shadow-2xl border-2 border-gray-700 bg-black aspect-video" />
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

  useEffect(() => {
    SimplePeer = require("simple-peer");
    socket = io({ path: "/api/socket" });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    return () => {
      socket.disconnect();
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
      // In a robust app, we'd remove specific peers. Here we just rely on page refresh for demo.
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
    window.location.href = "/dashboard";
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
        // Find current video track
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

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Conference</h1>
          <p className="text-gray-500 mb-6">Join a multi-party medical conference room to discuss clinical cases.</p>
          
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room Code"
            className="w-full border-gray-300 border p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-4 text-center font-mono text-lg font-bold uppercase"
          />
          <button
            onClick={joinRoom}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Join Conference
          </button>
          <button onClick={() => router.push("/feed")} className="mt-4 text-sm text-gray-500 hover:text-gray-800">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
          Case Conference Room: <span className="uppercase ml-2 tracking-widest text-indigo-400">{roomId}</span>
        </h1>
        <div className="text-sm bg-gray-700 px-3 py-1 rounded border border-gray-600 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          {peers.length + 1} Participants
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center bg-gray-950">
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500">
          <video playsInline muted ref={userVideo} autoPlay className="w-full h-full object-cover transform scale-x-[-1]" />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium backdrop-blur-sm">
            You (Active)
          </div>
        </div>

        {peers.map((peer, index) => (
          <div key={index} className="relative w-full aspect-video">
            <Video peer={peer.peer} />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium backdrop-blur-sm">
              Doctor Participant
            </div>
          </div>
        ))}
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

        <button 
          onClick={toggleScreenShare} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
          title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </button>

        <button 
          onClick={leaveRoom} 
          className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
          title="Leave Conference"
        >
          <svg className="w-8 h-8 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
        </button>
      </div>
    </div>
  );
}
