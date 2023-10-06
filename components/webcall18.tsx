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
import { useContext, useEffect, useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress";
import { Close } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch";
import { PcConnectionIcon } from "./pc-connection-icon";
import Image from "next/image"


export function StreamToAudience({ localStream, callId }: { localStream: any; callId: string }) {
    const [status, setStatus] = useState(null);
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
        {status && <PcConnectionIcon state={status} />}
      </>
    );
}
export function ConnectToBroadcast() {
    const [isCallStarted, setCallStarted] = useState(false);
    const [status, setStatus] = useState("null");
    const [broadcastData, setBroadcastData] = useState<object>({});
    const [seenRecently, setSeenRecently] = useState(false);
    const [broadcasting, setBroadcasting] = useState<string>("unsure");
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
        
        // const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement;
        // myWebcam.srcObject = localStream;
        // myWebcam.play().catch(error => {console.error(error)});

        pc.ontrack = (e: any) => {
          e.streams[0].getTracks().forEach((track: any) => {
            remoteStream?.addTrack(track);
          });
        };

        pc.onconnectionstatechange = (event: any) => {
            setStatus(pc.connectionState);
        }
  
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

        const theirWebcam: HTMLAudioElement = document.getElementById("audio-playback") as HTMLAudioElement;
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
    
    const fetchBroadcastData = async () => {
        const callData: any = (await getDoc(doc(collection(db, 'calls'), "broadcast"))).data();
        setBroadcastData(callData);
        console.log(callData?.lastSeen.seconds, Math.round(Date.now() / 1000), Math.round(Date.now() / 1000) - callData?.lastSeen.seconds)
        if (Math.round(Date.now() / 1000) - callData?.lastSeen.seconds < 7 * 60) setBroadcasting("yes")
        else setBroadcasting("no");
    }

    useEffect(() => {
        fetchBroadcastData();
      return () => {
        endCall();
      };
    }, []);
  
    return (
        <>
        <div className="flex gap-2">
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
          { isCallStarted &&
          <Button onClick={() => endCall()} variant={"destructive"}>Disconnect</Button>
          }
          { !isCallStarted && broadcasting == "yes" &&
          <Button onClick={() => startCall()}>Connect</Button>
          }
        
        </div>
        {broadcasting == "yes" ? (
            <>
        <div className="flex gap-2">
          <audio id="audio-playback" controls />
          <p>status: {status}</p>
        </div>
        </>
        ) : null}
        {broadcasting == "unsure" ? (
            <>
            <p className="font-bold text-lg">checking for broadcast...</p>
            <Image src="/pikachu.gif" height={100} width={100} alt="Will Smith wondering where everybody is" />
            </>
        ) : null}
        {broadcasting == "no" ? (
            <>
            <p className="font-bold text-lg">nobody was home!</p>
            <Image src="/will.gif" height={100} width={100} alt="Will Smith wondering where everybody is" />
            </>
        ) : null}
        {/* <p>{JSON.stringify(broadcastData)}</p> */}
      </>
    );
}

export function Broadcast() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [callIds, setCallIds] = useState<string[]>([])
  const lastSeenAllowance = 5 * 60 * 1000
  const [audioOnly, setAudioOnly] = useState(true);
  const [audioOutputEnabled, setAudioOutputEnabled] = useState(false);
  const [anon, setAnon] = useState(true);
  const [announce, setAnnounce] = useState(true);
  const [afkCheckTimerId, setAfkCheckTimerId] = useState<NodeJS.Timer | null>(null);
  // stream settings
  const [audioInput, setAudioInput] =     useState<{label: string, value: string | undefined}>({label: "System Default", value: undefined});
  const [audioOutput, setAudioOutput] =   useState<{label: string, value: string | undefined}>({label: "System Default", value: undefined});
  const [videoInput, setVideoInput] =     useState<{label: string, value: string | undefined}>({label: "System Default", value: undefined});
  const [audioInputs, setAudioInputs] =   useState<{label: string, value: string}[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<{label: string, value: string}[]>([]);
  const [videoInputs, setVideoInputs] =   useState<{label: string, value: string}[]>([]);
  const [audioInputLevel, setAudioInputLevel] = useState<number>(0);
  // debug stream
  const [info, setInfo] = useState<string>("")

  useEffect(() => { // register onSnapshot that monitors firestore for new calls
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
  useEffect(() => { // fetch devices
    fetchDevices().then((devices) => {
      if (devices) {
        devices.forEach((device) => {
          const option = { label: device.label, value: device.deviceId };
          if (device.kind === "audioinput") {
            setAudioInputs((prevOptions) => [...prevOptions, option]);
          } else if (device.kind === "audiooutput") {
            setAudioOutputs((prevOptions) => [...prevOptions, option]);
          } else if (device.kind === "videoinput") {
            setVideoInputs((prevOptions) => [...prevOptions, option]);
          }
        });
      }
    });
  }, []);
  // useEffect(() => { // draw audio input level

  //   if (localStream) {
  //     const audioContext = new AudioContext();
  //     const source = audioContext.createMediaStreamSource(localStream);
  //     const analyser = audioContext.createAnalyser();
  //     const dataArray = new Uint8Array(analyser.frequencyBinCount);

  //     source.connect(analyser);

  //     const draw = () => {
  //       analyser.getByteFrequencyData(dataArray);

  //       // Calculate the audio level
  //       let sum = 0;
  //       for (let i = 0; i < dataArray.length; i++) {
  //         sum += dataArray[i];
  //       }
  //       const average = sum / dataArray.length;
  //       setAudioInputLevel(average);
  //     };

  //     const intervalId = setInterval(() => {
  //       draw();
  //     }, 100);

  //     return () => {
  //       // Cleanup
  //       if (intervalId) {
  //         clearInterval(intervalId);
  //       }
  //       audioContext.close();
  //     };
  //   }
  // }, [localStream]);
  useEffect(() => { // re-init media
    initMedia();
  }, [audioInput, audioOutput, videoInput, audioOnly]);
  
  const initMedia = async () => {

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    const constraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
        sampleSize: 24,
        deviceId: audioInput.value ? { exact: audioInput.value } : undefined
      },
      video: !audioOnly ? false : { deviceId: videoInput.value ? { exact: videoInput.value } : undefined },
    };

    let localStreamObject = null;

    try {
      localStreamObject = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(localStreamObject);
      const myConstraints = await navigator.mediaDevices.getSupportedConstraints()
      setInfo((prevInfo) => {
        return prevInfo + "\n" + JSON.stringify(myConstraints)
      })
      const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement;
      myWebcam.srcObject = localStreamObject;
      myWebcam.play().catch((error) => {console.log(error)});
    } catch (error) {
      console.error(error);
    }
  }
  const initProcess = async () => {
    await initMedia();
    updateDoc(doc(collection(db, 'calls'), 'broadcast'), {
        lastSeen: serverTimestamp(),
        audioOnly: audioOnly,
        name: "anon",
        description: "music is cool",
    })
    setAfkCheckTimerId(() => {
        const intervalId = setInterval(() => {imStillHere()}, 5*60*1000)
        return intervalId
    })
  }
  const imStillHere = async () => {
    if (callIds.length > 0) await updateDoc(doc(collection(db, 'calls'), 'broadcast'), {lastSeen: serverTimestamp()})
  }
  const onValueChange = (value: string, type: string) => {
    let correspondingObject;
  
    if (type === "audioInput") {
      correspondingObject = audioInputs.find(item => item.value === value);
      if (correspondingObject) {
        setAudioInput(correspondingObject);
      }
    } else if (type === "audioOutput") {
      correspondingObject = audioOutputs.find(item => item.value === value);
      if (correspondingObject) {
        setAudioOutput(correspondingObject);
      }
    } else if (type === "videoInput") {
      correspondingObject = videoInputs.find(item => item.value === value);
      if (correspondingObject) {
        setVideoInput(correspondingObject);
      }
    }
    
  };
  const fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices;
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <>
      <Progress value={audioInputLevel} className="w-[60%]"/>
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
          <div className="flex flex-col gap-2">
            <Select onValueChange={(value) => {onValueChange(value, "audioInput")}}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder={"hi"} />
              </SelectTrigger>
              <SelectContent>
              {audioInputs.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
            {audioOutputEnabled && <Select onValueChange={(value) => {onValueChange(value, "audioOutput")}}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder={audioOutput.label} />
              </SelectTrigger>
              <SelectContent>
              {audioOutputs.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>}
            {!audioOnly && <Select onValueChange={(value) => {onValueChange(value, "videoInput")}}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder={videoInput.label} />
              </SelectTrigger>
              <SelectContent>
              {videoInputs.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>}
          </div>
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
      <Button onClick={() => {initProcess()}}>initProcess!</Button>
      </div>
      <video id="my-webcam" muted />
      <div className="flex gap-2">

      {localStream && callIds.map(callId => (
          <StreamToAudience key={callId} localStream={localStream} callId={callId} />
          ))}
      <p>{info}</p>
    </div>
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
    const [text1, setText1] = useState<string>("")
    const [text2, setText2] = useState<string>("")

    useEffect(() => {
      setText1(JSON.stringify(navigator.userAgent))
      setText2(JSON.stringify(/iPhone/i.test(navigator.userAgent)))
    })
    return (
        <>
            {user && role == "admin" ? <Broadcast /> : <AttendBroadcast />}
            {/* <Broadcast /> */}
            <p>{text1}</p>
            <p>{text2}</p>
        </>
    )
}