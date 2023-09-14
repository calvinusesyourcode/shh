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


