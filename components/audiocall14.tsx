'use client';

import { Button, buttonVariants } from "@/components/ui/button"
import { AppContext } from "@/lib/context";
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    getDoc,
    updateDoc,
    where,
    addDoc,
    serverTimestamp,
    query,
    Timestamp
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Close } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch";


export function StreamToAudience({ localStream, callId }: { localStream: any; callId: string }) {
    useEffect(() => {
      let pc: any = null;
      let remoteStream: MediaStream | null = null;
  
      const joinCall = async () => {
        const response = await fetch(`https://piano.metered.live/api/v1/turn/credentials?apiKey=${process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY}`);
        const stunAndTurnServers = await response.json();
        const servers = { iceServers: stunAndTurnServers, iceCandidatePoolSize: 10 };
  
        pc = new RTCPeerConnection(servers);
        remoteStream = new MediaStream();
  
        // Add tracks
        localStream.getTracks().forEach((track: any) => {
          pc.addTrack(track, localStream);
        });
  
        // Handle onTrack
        pc.ontrack = (e: any) => {
          e.streams[0].getTracks().forEach((track: any) => {
            if (remoteStream) {
              remoteStream.addTrack(track);
            }
          });
        };
  
        if (!callId) {
          console.error('callId not found');
          return;
        }
  
        const callDoc = doc(collection(db, 'calls'), callId);
        const answerCandidates = collection(callDoc, 'answerCandidates');
        const offerCandidates = collection(callDoc, 'offerCandidates');
  
        pc.onicecandidate = async (event: any) => {
          if (event.candidate) {
            await setDoc(doc(answerCandidates), { ...event.candidate.toJSON() });
          }
        };
        
        

        const callData: any = (await getDoc(callDoc)).data();
        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
  
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);
  
        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };
  
        await updateDoc(callDoc, { answer });
  
        const unsubscribe = onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              pc.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
  
        // Cleanup on unmount
        return () => {
          unsubscribe();
          if (pc) {
            pc.close();
          }
        };
      };
  
      joinCall();
  
    }, [localStream, callId]);  // Run effect only when localStream or callId changes
  
    return (
      <>
        <p>v0.0000001</p>
        <div className="flex flex-row gap-4">
          <video id="my-webcam" controls></video>
          <video id="their-webcam" controls></video>
        </div>
      </>
    );
}
export function ConnectToBroadcast() {
    const [isCallStarted, setCallStarted] = useState(false);
    let pc: any = null;
    let localStream: any = null;
    let remoteStream: any = null;
    let unsubscribeDoc: any = null;
    let unsubscribeCandidates: any = null;
  
    const startCall = async () => {
        setCallStarted(true)
        const response = await fetch(`https://piano.metered.live/api/v1/turn/credentials?apiKey=${process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY}`);
        const stunAndTurnServers = await response.json();
        const servers = { iceServers: stunAndTurnServers, iceCandidatePoolSize: 10 };
  
        pc = new RTCPeerConnection(servers);
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        remoteStream = new MediaStream();
  
        localStream.getTracks().forEach((track: any) => {
          pc.addTrack(track, localStream);
        });
        
        const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement;
        myWebcam.srcObject = localStream;
        myWebcam.play().catch(error => {console.error(error)});

        pc.ontrack = (e: any) => {
          e.streams[0].getTracks().forEach((track: any) => {
            remoteStream?.addTrack(track);
          });
        };
  
        const callDoc = collection(db, 'calls');
        const callId = (await addDoc(callDoc, {})).id;
  
        await updateDoc(doc(callDoc, 'newCalls'), { [callId]: { createdAt: serverTimestamp(), callId } });
  
        const offerCandidates = collection(doc(callDoc, callId), 'offerCandidates');
        const answerCandidates = collection(doc(callDoc, callId), 'answerCandidates');
  
        pc.onicecandidate = async (event: any) => {
          if (event.candidate) {
            await setDoc(doc(offerCandidates), { ...event.candidate.toJSON() });
          }
        };
  
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);
        await updateDoc(doc(callDoc, callId), { createdAt: serverTimestamp(), lastSeen: serverTimestamp(), offer: { sdp: offerDescription.sdp, type: offerDescription.type } });
  
        unsubscribeDoc = onSnapshot(doc(callDoc, callId), (snapshot) => {
          const data = snapshot.data();
          if (!pc?.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc?.setRemoteDescription(answerDescription);
          }
        });
  
        unsubscribeCandidates = onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              pc?.addIceCandidate(candidate);
            }
          });
        });
  
        setInterval(async () => {
          if (callId) {
            await updateDoc(doc(callDoc, callId), { lastSeen: serverTimestamp() });
          }
        }, 120000);

        const theirWebcam: HTMLVideoElement = document.getElementById("their-webcam") as HTMLVideoElement;
        theirWebcam.srcObject = remoteStream;
        theirWebcam.play().catch(error => {console.error(error)});
      };
  
    const endCall = () => {
      setCallStarted(false);
      unsubscribeDoc && unsubscribeDoc();
      unsubscribeCandidates && unsubscribeCandidates();
      pc?.close();
      pc = null;
      localStream = null;
      remoteStream = null;
    };
  
    useEffect(() => {
      return () => {
        endCall();
      };
    }, []);
  
    return (
      <>
        <p>v0.0000001</p>
        <div className="flex gap-2">
        {isCallStarted
        ? <Button onClick={() => endCall()} variant={"destructive"}>Disconnect</Button>
        : <Button onClick={() => startCall()} disabled={isCallStarted}>Connect</Button>
        }
        <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline">Info</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <p>A library this beautiful deserves some accompaniment!</p>
            <p>If only there were a way to hear the virtuosos play that upright piano, in real-time, from anywhere in the building...</p>
            <p><b>shhh</b>: the world&apos;s quietest live music app.</p>
            <p>A free, open-source, peer-to-peer streaming app by calvin.art.<sup>1</sup></p>
            <p>For more, check out the source code on <a href="https://github.com/calvinusesyourcode/webrtc-2" target="_blank" rel="noopener noreferrer"><u>github</u></a> or see my blog post to learn how it all works!</p>
            <DialogFooter>
            <p className="text-xs"><sup>1</sup> Help keep this app free by donating!</p>
            </DialogFooter>
        </DialogContent>
        </Dialog>


        </div>
        <div className="flex flex-row gap-4">
          <video id="my-webcam" controls />
          <video id="their-webcam" controls />
        </div>
      </>
    );
  }

export function Broadcast() {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [callIds, setCallIds] = useState<string[]>([])
    const lastSeenAllowance = 5 * 60 * 1000
    const [audioOnly, setAudioOnly] = useState(true);
    const [anon, setAnon] = useState(true);
    const [announce, setAnnounce] = useState(true)


    useEffect(() => {
        const unsubscribe = onSnapshot(
            query(collection(db, 'calls'),
            where("lastSeen", ">=", Timestamp.fromDate(new Date((Date.now()-lastSeenAllowance)))
            )), async (snapshot) => {
          setCallIds(oldCallIds => {
            let newCallIds = [...(oldCallIds || [])];
            snapshot.docChanges().forEach((change) => {
              const id = change.doc.id
              if (id) {
                if (change.type === "added") {
                  console.log("doc "+id+" added");
                  console.log(typeof change.doc.data().lastSeen, change.doc.data().lastSeen)
                  if (!newCallIds.includes(id)) {
                    newCallIds.push(id);
                  }
                }
                if (change.type === "modified") {
                }
                if (change.type === "removed") {
                  newCallIds = newCallIds.filter(call => call !== id);
                }
              }
            });
            console.log("newCallIds",newCallIds)
            return newCallIds;
          });
        }, (error) => {
          console.error("Error in onSnapshot(collection(db, 'calls'))::", error);
        });
    
        return () => unsubscribe();  // Clean up subscription
    
      }, []);

    const initMedia = async () => {
        const localStreamObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
        setLocalStream(localStreamObject)
    }

    return (
        <>
        <div className="flex gap-2">
        <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline">Settings</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Broadcast settings</DialogTitle>
            <DialogDescription>
                Don&apos;t forget to save your changes.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="flex items-center justify-end space-x-2">
              <Label htmlFor="anonymous">Anonymous</Label>
              <Switch
                id="anonymous"
                checked={anon}
                onCheckedChange={() => setAnon(!anon)}
              />
            </div>
            {!anon &&
            <>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value="Piano Wizard" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">Bio</Label>
                <Input id="bio" value="I like to play piano." className="col-span-3" />
            </div>
            </>
            }
            <div className="flex items-center justify-end space-x-2">
              <Label htmlFor="announce">Announce Broadcast Start</Label>
              <Switch
                id="announce"
                checked={announce}
                onCheckedChange={() => {setAnnounce(!announce)}}
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Label htmlFor="audio-only" className="text-muted-foreground">Video Transmission </Label>
              <Switch
                id="audio-only"
                checked={!audioOnly}
              />
            </div>
            </div>
            <DialogFooter>
              <Close className={buttonVariants({variant: "default"})}>
                Save changes
              </Close>
            </DialogFooter>
        </DialogContent>
        </Dialog>
        <Button onClick={() => {initMedia()}}>initProcess</Button>
        </div>
        {localStream && callIds.map(callId => (
        <StreamToAudience key={callId} localStream={localStream} callId={callId} />
      ))}
        </>
    )



}

export function AttendBroadcast() {
    return (
        <>
        <ConnectToBroadcast />
        </>
    )
}

export function Webcall() {
    const { user, role } = useContext(AppContext)
    return (
        <>
            {user && role == "admin" ? <Broadcast /> : <AttendBroadcast />}
        </>
    )
}

