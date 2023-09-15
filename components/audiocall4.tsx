'use client';

import { Button } from "@/components/ui/button"
import { AppContext } from "@/lib/context";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, getDoc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useContext, useState } from "react";

export function WebcallOld(){
  let pc: any = null;
  
  let localStream: any = null;
  let remoteStream: any = null;

  const connectAsGuest = async () => {
    // await startWebcam()
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
    // await answerCall()
    let callId;
    (await getDocs(query(collection(db, 'calls'), orderBy("createdAt","desc"), limit(1)))).forEach((doc => {callId = doc.id}))
    // const callInputField: HTMLInputElement = document.getElementById("callInputField") as HTMLInputElement;
    // callId = "DVBaSUUxPefEmai9B9Fd"
    // if (callId) {callInputField.value = callId}
    if (!callId) {
        console.error("callId not found")
    }
    const callDoc = doc(collection(db, 'calls'), callId)
    // const callDocs = query(collection(db, 'calls'))
    // for (let i = 0, l = callDocs.length; i++) {}
    
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.onicecandidate = async (event: any) => {
      if (event.candidate) {
        console.log({event_candidate2: event.candidate})
        await setDoc(doc(answerCandidates), {...event.candidate.toJSON()})
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
          console.log({change_doc_data_2: change.doc.data()})
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      })
    })
    // await showVideo()
    console.log("PROVING TRACKS ARE AVAILABLE");
    console.log(remoteStream.getTracks());
    console.log(remoteStream);
    const theirWebcam: HTMLVideoElement = document.getElementById("their-webcam") as HTMLVideoElement;
    theirWebcam.srcObject = remoteStream;
    
    theirWebcam.play().catch(error => {
      console.error(error)
    });
  }
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

    await updateDoc(doc(callDoc, callId), { createdAt: serverTimestamp(), offer: {sdp: offerDescription.sdp, type: offerDescription.type }})
    
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

  }

  return (
    <>
      <p>v0.0000001</p>
      <Button onClick={() => {connectAsGuest()}}>connectAsGuest</Button>
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

function SendToHost({ localStream, remoteStream, callId }: { localStream: any; remoteStream: any; callId: string }) {
    let pc: any = null;
    const connectAsGuest = async () => {
        // await startWebcam()
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
        // const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement;
        
    
        // console.log(localStream);
        // console.log(remoteStream);
        // myWebcam.srcObject = localStream;
        // myWebcam.play().catch(error => {
        //   console.error(error)
        // });
        
        // await answerCall()
        // let callId;
        // (await getDocs(query(collection(db, 'calls'), orderBy("createdAt","desc"), limit(1)))).forEach((doc => {callId = doc.id}))
        // const callInputField: HTMLInputElement = document.getElementById("callInputField") as HTMLInputElement;
        // callId = "DVBaSUUxPefEmai9B9Fd"
        // if (callId) {callInputField.value = callId}
        if (!callId) {
            console.error("callId not found")
        }
        const callDoc = doc(collection(db, 'calls'), callId)
        // const callDocs = query(collection(db, 'calls'))
        // for (let i = 0, l = callDocs.length; i++) {}
        
        const answerCandidates = collection(callDoc, 'answerCandidates');
        const offerCandidates = collection(callDoc, 'offerCandidates');
    
        pc.onicecandidate = async (event: any) => {
          if (event.candidate) {
            console.log({event_candidate2: event.candidate})
            await setDoc(doc(answerCandidates), {...event.candidate.toJSON()})
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
              console.log({change_doc_data_2: change.doc.data()})
              let data = change.doc.data();
              pc.addIceCandidate(new RTCIceCandidate(data));
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
    
        await updateDoc(doc(callDoc, callId), { createdAt: serverTimestamp(), offer: {sdp: offerDescription.sdp, type: offerDescription.type }})
        
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
    let remoteStream: MediaStream | null = null;
    const [callId, setCallId] = useState<string | null>(null)
    const [callIds, setCallIds] = useState<string[]>([])

    const getCallId = async () => {
        const newCallIds: string[] = [];
        (await getDocs(query(collection(db, 'calls'), orderBy("createdAt","desc"), limit(3)))).forEach((doc => {newCallIds.push(doc.id)}))
        setCallIds(newCallIds)
    }
    getCallId()

    const initMedia = async () => {
        const localStreamObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
        setLocalStream(localStreamObject)
    }

    return (
        <>
        <Button onClick={() => {initMedia()}}>initProcess</Button>
        {callIds.map(callId => (
        <SendToHost key={callId} localStream={localStream} remoteStream={remoteStream} callId={callId} />
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