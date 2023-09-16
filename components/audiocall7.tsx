'use client';

import { Button } from "@/components/ui/button"
import { AppContext } from "@/lib/context";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, getDoc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit, getDocs, Timestamp, deleteDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";


function StreamToAudience({ localStream, callOptions, callId }: { localStream: any; callOptions: any; callId: string }) {
    let pc: any = null;
    let remoteStream: MediaStream | null = null
    const joinCall = async () => {
        // await startWebcam()
        const response = await fetch("https://piano.metered.live/api/v1/turn/credentials?apiKey="+process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY);
        const stunAndTurnServers = await response.json();
        const servers: object = { iceServers: stunAndTurnServers, iceCandidatePoolSize: 5 };  
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
    useEffect(() => {
      joinCall()
    }, [])
    return (
        <>
          <p>{callId}</p>
          <div className="flex flex-row gap-4">
          <video id="their-webcam" controls>
          </video>
          </div>
        </>
      )
}

function StreamFromBroadcaster() {
    let pc: any = null;
    let localStream: any = null;
    let remoteStream: any = null;
    const startCall = async () => {
        //startWebcam
        const response = await fetch("https://piano.metered.live/api/v1/turn/credentials?apiKey="+process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY);
        const stunAndTurnServers = await response.json();
        const servers: object = {
          iceServers: stunAndTurnServers,
            iceCandidatePoolSize: 5,
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

        window.addEventListener('beforeunload', async (e) => {
          await deleteDoc(doc(callDoc, callId));
        });
        console.log("added beforeunload event")
    
    }
    return (
        <>
          <p>v0.0000001</p>
          <Button onClick={() => {startCall()}}>startCall</Button>
          <div className="flex flex-row gap-4">
          <video id="my-webcam" controls>
          </video>
          <video id="their-webcam" controls>
          </video>
          </div>
        </>
      )
}

export function Broadcast() {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [callIds, setCallIds] = useState<string[]>([])
    const [info, setInfo] = useState<string>("info")
    const [callOptions, setCallOptions] = useState<object>({})

    // const getCallId = async () => {
    //     const newCallIds: string[] = [];
    //     (await getDocs(query(collection(db, 'calls'), orderBy("createdAt","desc"), limit(3)))).forEach((doc => {newCallIds.push(doc.id)}))
    //     setCallIds(newCallIds)
    // }
    // useEffect(() => {
    //     getCallId()
    // },[])

    onSnapshot(collection(db, 'calls'), async (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data()
        if (change.type === "added") {
          setInfo(old => old + "\n" + JSON.stringify(data))
          if (!(data.callId in callIds)) {
            setCallIds(oldIds => [...oldIds, data.callId])
          }
        }
        if (change.type === "modified") {
        }
        if (change.type === "removed") {
          if (data.callId in callIds) {
            setCallIds(oldIds => oldIds.filter(id => id !== data.callId));
            setInfo(oldInfo => oldInfo + "\n" + "removed callId " + data.callId)
          }
          
        }
      })
    }, (error) => {
      console.error("Error in onSnapshot(collection(db, 'calls'))::", error
    )})

    
    // await updateDoc(doc(callDoc, "newCalls"), {[callId]: {createdAt:serverTimestamp(), callId: callId}})
    // const ref = doc(collection(db, 'calls'), 'newCalls')
    // onSnapshot(ref, (snapshot) => {
    //   console.log("onSnapshot991")
    //   const data = snapshot.data()
    //   for (let key in data) {
    //     const callId = data[key].callId;
    //     const lastSeen = data[key].lastSeen;
    //     console.log("lastSeen", typeof lastSeen, lastSeen)
    //     if (callId && !callIds.includes(callId)) {
    //       setCallIds((prevCallIds) => [...prevCallIds, callId]);
    //     }
    //   }
    // });

    const initMedia = async () => {
        const localStreamObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
        setLocalStream(localStreamObject)
    }


    return (
        <>
        <Button onClick={() => {initMedia()}}>initProcess</Button>
        <p className='text-sm'>{info}</p>
        {callIds.map(callId => (
        <StreamToAudience key={callId} localStream={localStream} callOptions={callOptions} callId={callId} />
      ))}
        </>
    )



}

export function ListenToBroadcast() {
    return (
        <>
        <StreamFromBroadcaster />
        </>
    )
}

export function Webcall() {
    const { user, role } = useContext(AppContext)
    return (
        <>
            {user && role == "admin" ? <Broadcast /> : <ListenToBroadcast />}
        </>
    )
}