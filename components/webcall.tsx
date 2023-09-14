'use client';

import { Button } from "@/components/ui/button"
import { servers } from "@/lib/context";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, getDoc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";


export function Webcall() {
  let pc: any = null;
  
  let localStream: any = null;
  let remoteStream: any = null;
  const startWebcam = async () => {
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
  }
  const startCall = async () => {
    const callDoc = collection(db, 'calls');
    const callId = (await addDoc(callDoc, {})).id;
    const callInputField: HTMLInputElement = document.getElementById("callInputField") as HTMLInputElement;
    callInputField.value = callId;

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

    await updateDoc(doc(callDoc, callId), { offer: {sdp: offerDescription.sdp, type: offerDescription.type }})
    
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
    
  }
  const answerCall = async () => {
    const callInputField: HTMLInputElement = document.getElementById("callInputField") as HTMLInputElement;
    const callId = callInputField.value;
    const callDoc = doc(collection(db, 'calls'), callId);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.onicecandidate = async (event: any) => {
      if (event.candidate) {
        console.log({event_candidate2: event.candidate})
        // const data = {...event.candidate.toJSON(), hello2: "world2"};
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
  }

  const showVideo = async () => {
    console.log("PROVING TRACKS ARE AVAILABLE");
    console.log(remoteStream.getTracks());
    console.log(remoteStream);
    const theirWebcam: HTMLVideoElement = document.getElementById("their-webcam") as HTMLVideoElement;
    theirWebcam.srcObject = remoteStream;
    
    theirWebcam.play().catch(error => {
      console.error(error)
    });
  }
  const getInfoPls = async () => {
    const theirWebcam: HTMLVideoElement = document.getElementById("their-webcam") as HTMLVideoElement;
    let docId;
    (await getDocs(query(collection(db, 'calls'), orderBy("createdAt","desc"), limit(1)))).forEach((doc => {docId = doc.id}))
    console.log(docId);
    }

  const connectAsGuest = async () => {
    // await startWebcam()
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
      <Button onClick={() => {connectAsGuest()}}>connectAsGuest</Button>
      <Button onClick={() => {connectAsHost()}}>connectAsHost</Button>
      {/* <Button onClick={() => {startWebcam()}}>start webcam</Button>
      <Button onClick={() => {startCall()}}>start call</Button>
      <input id="callInputField" />
      <Button onClick={() => {answerCall()}}>answer call</Button>
      <Button onClick={() => {showVideo()}}>show video</Button>
      <Button onClick={() => {getInfoPls()}}>get info</Button> */}
      <div className="flex flex-row gap-4">
      <video id="my-webcam" controls>
      </video>
      <video id="their-webcam" controls>
      </video>
      </div>
    </>
  )
}
