import * as React from "react";

// Assuming MyContextType is defined somewhere in "@/lib/context"
interface MyContextType {
    peerConnection: RTCPeerConnection | null;
    setPeerConnection: React.Dispatch<React.SetStateAction<RTCPeerConnection | null>>;
    localStream: any;
    setLocalStream: React.Dispatch<React.SetStateAction<any>>;
    remoteStream: any;
    setRemoteStream: React.Dispatch<React.SetStateAction<any>>;
  }
export const MyContext = React.createContext<MyContextType | null>(null);

export const servers = {
  iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:a.relay.metered.ca:80",
        username: "546a8a72a60f269db3114243",
        credential: "L0QjIY5fd7e6AG/i",
      },
      {
        urls: "turn:a.relay.metered.ca:80?transport=tcp",
        username: "546a8a72a60f269db3114243",
        credential: "L0QjIY5fd7e6AG/i",
      },
      {
        urls: "turn:a.relay.metered.ca:443",
        username: "546a8a72a60f269db3114243",
        credential: "L0QjIY5fd7e6AG/i",
      },
      {
        urls: "turn:a.relay.metered.ca:443?transport=tcp",
        username: "546a8a72a60f269db3114243",
        credential: "L0QjIY5fd7e6AG/i",
      },
  ],
    iceCandidatePoolSize: 10,
  };  