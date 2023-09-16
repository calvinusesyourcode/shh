'use client';

import { Button } from "@/components/ui/button"
import { AppContext } from "@/lib/context";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, getDoc, updateDoc, where, addDoc, serverTimestamp, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";


function SendToHost({ localStream, callId }: { localStream: any; callId: string }) {
    let pc: any = null;
    let remoteStream: MediaStream | null = null
    const connectAsGuest = async () => {
        // await startWebcam()
        const response = await fetch("https://piano.metered.live/api/v1/turn/credentials?apiKey="+process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY);
        const stunAndTurnServers = await response.json();
        const servers: object = { iceServers: stunAndTurnServers, iceCandidatePoolSize: 10 };  
        pc = new RTCPeerConnection(servers);
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
        remoteStream = new MediaStream();
        
        localStream.getTracks().forEach((track: any) => {
          console.log("added localStream track to peer connection:", track);
          pc.addTrack(track, localStream);
        });
    
        pc.ontrack = (e: any) => {
          e.streams[0].getTracks().forEach((track: any) => {
            console.log("adding track from peer connection to remoteStream:", track)
            if (remoteStream) {remoteStream.addTrack(track)}
          });
        }
        // const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement;
        
    
        // console.log(localStream);
        // console.log(remoteStream);
        // myWebcam.srcObject = localStream;
        // myWebcam.play().catch(error => {
        //   console.error(error)
        // });

        if (!callId) {console.error("callId not found")}
        const callDoc = doc(collection(db, 'calls'), callId)
        
        const answerCandidates = collection(callDoc, 'answerCandidates');
        const offerCandidates = collection(callDoc, 'offerCandidates');
    
        pc.onicecandidate = async (event: any) => {
          if (event.candidate) {
            await setDoc(doc(answerCandidates), {...event.candidate.toJSON()})
            console.log("found ICE answer candidate:", event.candidate)
          }
        }
    
        const callData: any = (await getDoc(callDoc)).data();
        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);
    
        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };
    
        await updateDoc(callDoc, {answer});
    
        onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            console.log(change);
            if (change.type === 'added') {
              const data = change.doc.data();
              pc.addIceCandidate(new RTCIceCandidate(data));
              console.log("adding ice offer candidate to peer connection:", data)
            }
          })
        })
        // await showVideo()
        console.log("PROVING TRACKS ARE AVAILABLE");
        console.log(remoteStream.getTracks());
        console.log(remoteStream);
        // const theirWebcam: HTMLVideoElement = document.getElementById("their-webcam") as HTMLVideoElement;
        // theirWebcam.srcObject = remoteStream;
        
        // theirWebcam.play().catch(error => {
        //   console.error(error)
        // });
    }
    connectAsGuest()
    return (
        <>
          <p>v0.0000001</p>
          <div className="flex flex-row gap-4">
          <video id="my-webcam" controls>
          </video>
          <video id="their-webcam" controls>
          </video>
          </div>
        </>
      )
}
function SendToGuest() {
    let pc: any = null;
    let localStream: any = null;
    let remoteStream: any = null;
    const connectAsHost = async () => {
        //startWebcam
        const response = await fetch("https://piano.metered.live/api/v1/turn/credentials?apiKey="+process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY);
        const stunAndTurnServers = await response.json();
        const servers: object = {
          iceServers: stunAndTurnServers,
            iceCandidatePoolSize: 10,
          };  
        pc = new RTCPeerConnection(servers);
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
        remoteStream = new MediaStream();
        
        localStream.getTracks().forEach((track: any) => {
          pc.addTrack(track, localStream);
        });
    
        pc.ontrack = (e: any) => {
          e.streams[0].getTracks().forEach((track: any) => {
            console.log("TRYING TO DISPLAY REMOTE STREAM");
            console.log(track);
            const hello = remoteStream.addTrack(track);
            console.log(hello)
          });
        }

        const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement;
        
    
        console.log(localStream);
        console.log(remoteStream);
        myWebcam.srcObject = localStream;
        myWebcam.play().catch(error => {
          console.error(error)
        });
        //startCall
        const callDoc = collection(db, 'calls');
        const callId = (await addDoc(callDoc, {})).id;
        await updateDoc(doc(callDoc, "newCalls"), {[callId]: {createdAt:serverTimestamp(), callId: callId}})
        // const callInputField: HTMLInputElement = document.getElementById("callInputField") as HTMLInputElement;
        // callInputField.value = callId;
    
        const offerCandidates = collection(doc(callDoc, callId), 'offerCandidates');
        const answerCandidates = collection(doc(callDoc, callId), 'answerCandidates');
    
        
        pc.onicecandidate = async (event: any) => {
          if (event.candidate) {
            console.log({event_candidate1: event.candidate});
            await setDoc(doc(offerCandidates), {...event.candidate.toJSON()})
          }
        }
    
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);
    
        await updateDoc(doc(callDoc, callId), { createdAt: serverTimestamp(), lastSeen: serverTimestamp(), offer: {sdp: offerDescription.sdp, type: offerDescription.type }})
        
        onSnapshot(doc(callDoc, callId), (snapshot) => {
          const data = snapshot.data();
          console.log(data);
          if (!pc.currentRemoteDescription && data?.answer) {
            console.log({data_answer1: data.answer});
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
          }
        })
    
        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              console.log({change_doc_data1: change.doc.data()});
              const candidate = new RTCIceCandidate(change.doc.data());
              pc.addIceCandidate(candidate);
            }
          })
        })
        //showVideo
        console.log("PROVING TRACKS ARE AVAILABLE");
        console.log(remoteStream.getTracks());
        console.log(remoteStream);
        const theirWebcam: HTMLVideoElement = document.getElementById("their-webcam") as HTMLVideoElement;
        theirWebcam.srcObject = remoteStream;
        
        theirWebcam.play().catch(error => {
          console.error(error)
        });
        
        setInterval(async () => {
            await updateDoc(doc(callDoc, callId), { lastSeen: serverTimestamp() })
        }, 60000)
    
    }
    return (
        <>
          <p>v0.0000001</p>
          <Button onClick={() => {connectAsHost()}}>connectAsHost</Button>
          <div className="flex flex-row gap-4">
          <video id="my-webcam" controls>
          </video>
          <video id="their-webcam" controls>
          </video>
          </div>
        </>
      )
}

export function WebcallAsAdmin() {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [callIds, setCallIds] = useState<string[]>([])
    const lastSeenAllowance = 5 * 60 * 1000

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
        <Button onClick={() => {initMedia()}}>initProcess</Button>
        {callIds.map(callId => (
        <SendToHost key={callId} localStream={localStream} callId={callId} />
      ))}
        </>
    )



}

export function WebcallAsNoob() {
    return (
        <>
        <SendToGuest />
        </>
    )
}

export function Webcall() {
    const { user, role } = useContext(AppContext)
    return (
        <>
            {user && role == "admin" ? <WebcallAsAdmin /> : <WebcallAsNoob />}
        </>
    )
}