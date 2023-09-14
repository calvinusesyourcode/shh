'use client';

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { useContext } from "react";
import { MyContext, servers } from "@/lib/context";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, query, where, getDoc, updateDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";


export default function IndexPage() {
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
    console.log(theirWebcam.srcObject);
  }

  const deleteAllCalls = async () => {
    const callsCollection = collection(db, 'calls');
    const q = query(callsCollection);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });
    
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <p>HOLY SHIT IT WORKS</p>
      <Button onClick={() => {startWebcam()}}>start webcam</Button>
      <Button onClick={() => {startCall()}}>start call</Button>
      <input id="callInputField" />
      <Button onClick={() => {answerCall()}}>answer call</Button>
      <Button onClick={() => {showVideo()}}>show video</Button>
      <Button variant="destructive" onClick={() => {deleteAllCalls()}}>delete calls</Button>
      <Button onClick={() => {getInfoPls()}}>get info</Button>
      <video id="my-webcam" controls>
      </video>
      <video id="their-webcam" controls>
      </video>
    </section>
  )
}
