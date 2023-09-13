'use client';

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { useContext } from "react";
import { MyContext, servers } from "@/lib/context";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, query, where, getDoc, updateDoc, addDoc } from "firebase/firestore";


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
        remoteStream.addTrack(track, remoteStream);
      });
    }
    const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement;
    const theirWebcam: HTMLVideoElement = document.getElementById("their-webcam") as HTMLVideoElement;

    console.log(localStream);
    myWebcam.srcObject = localStream;
    myWebcam.play().catch(error => {
      console.error(error)
    });
  }
  const startCall = async () => {
    const callDoc = collection(db, 'calls');
    const offerCandidates = collection(doc(callDoc), 'offerCandidates');
    const answerCandidates = collection(doc(callDoc), 'answerCandidates');
    
    
    pc.onicecandidate = async (event: any) => {
      if (event.candidate) {
        let data = event.candidate.toJSON()
        await setDoc(doc(offerCandidates), {data})
      }
    }

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    }

    const newCallDoc = await addDoc(callDoc, { offer })
    const callInputField: HTMLInputElement = document.getElementById("callInputField") as HTMLInputElement;
    callInputField.value = newCallDoc.id;
    
    onSnapshot(doc(callDoc), (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    })

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
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
        const data = event.candidate.toJSON();
        await setDoc(doc(answerCandidates), {data})
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
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      })
    })
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Button onClick={() => {startWebcam()}}>start webcam</Button>
      <Button onClick={() => {startCall()}}>start call</Button>
      <input id="callInputField" />
      <Button onClick={() => {answerCall()}}>answer call</Button>
      <video id="my-webcam">
      </video>
      <video id="their-webcam">
      </video>
    </section>
  )
}
