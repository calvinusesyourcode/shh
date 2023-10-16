'use client'

import { Button, buttonVariants } from "@/components/ui/button"
import { AppContext } from "@/lib/context"
import { db } from "@/lib/firebase"
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
  Timestamp,
  CollectionReference,
  FieldValue,
  DocumentReference
} from "firebase/firestore"
import { useContext, useEffect, useState, useRef } from "react"
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Close } from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PcConnectionIcon } from "./pc-connection-icon"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"


export function BroadcasterPanel({ user }: { user: any }) {
  const afkCheckInterval = 20 * 60 * 1000
  const audioMinimum = 2
  const broadcastTypes = ["Music Stream", "Podcast"]
  const placeholders: any = {
    "Music Stream": ["I love piano :D", "Music is cool I think...", "Notes flowing, your mind exploding.", "I am the Piano Man!"],
    "Podcast": ["Perhaps interesting...", "So many ideas, so little time...", "Hello world!"]
  }

  // test area
  const [myData, setMyData] = useState<any>(null)

  const [afkCheckTimerId, setAfkCheckTimerId] = useState<NodeJS.Timer | null>(null)
  const [announce, setAnnounce] = useState(true)
  const [anon, setAnon] = useState(true)
  const [audioInput, setAudioInput] =     useState<{label: string, value: string | undefined}>({label: "Default Microphone", value: undefined})
  const [audioInputLevel, setAudioInputLevel] = useState<number>(0)
  const [audioInputs, setAudioInputs] =   useState<{label: string, value: string}[]>([])
  const [audioOnly, setAudioOnly] = useState(true)
  const [audioOutput, setAudioOutput] =   useState<{label: string, value: string | undefined}>({label: "Default Speakers", value: undefined})
  const [audioOutputEnabled, setAudioOutputEnabled] = useState(false)
  const [audioOutputs, setAudioOutputs] = useState<{label: string, value: string}[]>([])
  const [broadcasting, setBroadcasting] = useState<boolean>(false)
  const [broadcastType, setBroadcastType] = useState<string>(broadcastTypes[0])
  const [config, setConfig] = useState<{name: string, message: string, type: string, lastSeen: FieldValue, startedAt: FieldValue, audioOnly: boolean, uid: string} | undefined>(undefined)
  const [dataStream, setDataStream] = useState<any>(null)
  const [info, setInfo] = useState<string>("")
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [msg, setMsg] = useState<string | undefined>(undefined)
  const [msgPlaceholder, setMsgPlaceholder] = useState<string>("Hello world!")
  const [music, setMusic] = useState<boolean>(true)
  const [name, setName] = useState<string | undefined>(undefined)
  const [showInputSettings, setShowInputSettings] = useState<boolean>(true)
  const [starting, setStarting] = useState<boolean>(false)
  const [testing, setTesting] = useState<boolean>(false)
  const [videoInput, setVideoInput] =     useState<{label: string, value: string | undefined}>({label: "Default Webcam", value: undefined})
  const [videoInputs, setVideoInputs] =   useState<{label: string, value: string}[]>([])

  useEffect(() => { // update on broadcastType change
    setMsgPlaceholder(placeholders[broadcastType][Math.floor(Math.random() * placeholders[broadcastType].length)])
    setMusic(broadcastType.toLowerCase().includes("music") ? true : false)
  }, [broadcastType])
  useEffect(() => { // on page load
    // fetch devices
    fetchDevices().then((devices) => {
      if (devices) {
        devices.forEach((device) => {
          const option = { label: device.label, value: device.deviceId }
          if (device.kind === "audioinput") {
            setAudioInputs((prevOptions) => [...prevOptions, option])
          } else if (device.kind === "audiooutput") {
            setAudioOutputs((prevOptions) => [...prevOptions, option])
          } else if (device.kind === "videoinput") {
            setVideoInputs((prevOptions) => [...prevOptions, option])
          }
        })
      }
    })
    // no input choice for iPhone users
    setShowInputSettings(!(/iPhone/i.test(navigator.userAgent))) 
  }, [])
  useEffect(() => { // draw audio input level
    if (localStream) {
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(localStream)
      const analyser = audioContext.createAnalyser()
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      source.connect(analyser)

      const draw = () => {
        analyser.getByteFrequencyData(dataArray)

        // Calculate the audio level
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const average = sum / dataArray.length
        setAudioInputLevel(average)
      }

      const intervalId = setInterval(() => {
        draw()
      }, 100)

      return () => {
        // Cleanup
        if (intervalId) {
          clearInterval(intervalId)
        }
        audioContext.close()
      }
    }
  }, [localStream])
  useEffect(() => { // re-init media
    initMedia()
  }, [audioInput, audioOutput, videoInput, audioOnly])

  const initMedia = async () => {
    if (localStream) { localStream.getTracks().forEach((track) => track.stop()) }

    let mediaDeviceConstraints = {}
    try { mediaDeviceConstraints = navigator.mediaDevices.getSupportedConstraints()
    } catch (error) {console.error(error)}
    
    const constraints: any = {
      audio: {
        echoCancellation: music ? false : true,
        noiseSuppression: music ? false: true,
        sampleSize: 24,
        deviceId: audioInput.value ? { exact: audioInput.value } : undefined
      },
      video: audioOnly ? false : { deviceId: videoInput.value ? { exact: videoInput.value } : undefined },
    }

    console.log(JSON.stringify(constraints))
    if ("volume" in mediaDeviceConstraints) { constraints.audio.volume = { exact: 1.0 } }
    else if ("autoGainControl" in mediaDeviceConstraints) { constraints.audio.autoGainControl = false }

    setInfo((prevInfo) => {
      return prevInfo + "\n" + JSON.stringify(mediaDeviceConstraints)
    })


    try {
      const localStreamObject = await navigator.mediaDevices.getUserMedia(constraints)
      setLocalStream(localStreamObject)
      const myWebcam: HTMLVideoElement = document.getElementById("my-webcam") as HTMLVideoElement
      myWebcam.srcObject = localStreamObject
      myWebcam.play().catch((error) => {console.log(error)})
    } catch (error) {
      console.error(error)
    }
  }
  const attemptBroadcast = async () => {
    await initMedia()
    if (audioInputLevel != 0) {startBroadcast()}
  }
  const startBroadcast = async () => {
    setStarting(true)
    const data = {
      name: anon ? "anonymous" : name ? name : user.displayName,
      message: msg ? msg : msgPlaceholder,
      type: broadcastType,
      lastSeen: serverTimestamp(),
      startedAt: serverTimestamp(),
      audioOnly: audioOnly,
      uid: user.uid,
    }
    setConfig(data)
    await setDoc(doc(collection(db, 'broadcasts'), user.uid), data)
    setBroadcasting(true)
    setStarting(false)
    setAfkCheckTimerId(() => {
        const intervalId = setInterval(() => {imStillHere()}, afkCheckInterval)
        return intervalId
    })
  }
  const imStillHere = async () => {
    if (broadcasting) await updateDoc(doc(collection(db, 'broadcasts'), user.uid), {lastSeen: serverTimestamp()})
  }
  const onValueChange = (value: string, type: string) => {
    let correspondingObject
  
    if (type === "audioInput") {
      correspondingObject = audioInputs.find(item => item.value === value)
      if (correspondingObject) {
        setAudioInput(correspondingObject)
      }
    } else if (type === "audioOutput") {
      correspondingObject = audioOutputs.find(item => item.value === value)
      if (correspondingObject) {
        setAudioOutput(correspondingObject)
      }
    } else if (type === "videoInput") {
      correspondingObject = videoInputs.find(item => item.value === value)
      if (correspondingObject) {
        setVideoInput(correspondingObject)
      }
    } else if (type === "broadcastType") {
      setBroadcastType(value)
    }
    
  }
  const fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
    {!broadcasting && (
      <Card className="max-w-[500px] self-center">
        <CardHeader>
          <CardTitle>Broadcast Settings</CardTitle>
          <CardDescription>*must be set <i>before</i> the broadcast begins*</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="flex flex-col gap-3 items-end">
        <Select onValueChange={(value) => {onValueChange(value, "broadcastType")}}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={broadcastType} />
          </SelectTrigger>
          <SelectContent>
            {broadcastTypes.map((item, index) => (
              <SelectItem key={index} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
          {showInputSettings && <Select onValueChange={(value) => {onValueChange(value, "audioInput")}}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder={audioInput.label} />
            </SelectTrigger>
            <SelectContent>
            {audioInputs.map((option, index) => (
              <SelectItem key={index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>}
          <Progress value={audioInputLevel} className="w-[260px]"/>
          {(!audioOnly && showInputSettings)&& <Select onValueChange={(value) => {onValueChange(value, "videoInput")}}>
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
        <div className="flex items-center justify-end space-x-2">
          <Label htmlFor="anonymousSwitch">Anonymous</Label>
          <Switch
            id="anonymousSwitch"
            checked={anon}
            onCheckedChange={() => setAnon(!anon)}
          />
        </div>
        {!anon &&
        <>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nameInput" className="text-right">Name</Label>
            <Input id="nameInput" value={name} className="col-span-3" placeholder={user.displayName} onChange={(event) => {setName(event.target.value)}}/>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="msgInput" className="text-right">Msg</Label>
            <Textarea id="msgInput" value={msg} className="col-span-3" placeholder={msgPlaceholder} onChange={(event) => {setMsg(event.target.value)}}/>
        </div>
        </>
        }
        <div className="flex items-center justify-end space-x-2">
          <Label htmlFor="audio-only" className="text-muted-foreground">Video Transmission </Label>
          <Switch
            id="audio-only"
            checked={!audioOnly}
          />
        </div>
        </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <p className="text-muted-foreground">{audioInputLevel == 0 ? "no audio detected" : audioInputLevel < audioMinimum ? "audio very quiet" : ""}</p>
          <Button disabled={starting} className={buttonVariants({variant: audioInputLevel < audioMinimum ? "outline" : "default"})} onClick={() => attemptBroadcast()}>Go live!</Button>  
        </CardFooter>
      </Card>
    )}
    {(broadcasting && localStream && config) && (
      <>
      <BroadcastHandler localStream={localStream} config={config} data={dataStream}/>
      <div className="grid grid-cols-4 items-center gap-4">
        <Textarea id="msgInput" value={msg} className="col-span-3" placeholder={msgPlaceholder} onChange={(event) => {setMyData(event.target.value)}}/>
        <Button onClick={() => setDataStream(myData)} className={buttonVariants({variant:"outline"})}>Send</Button>
      </div>
      </>
    )}
    </>
  )
}
export function BroadcastHandler({ localStream, config, data }: { localStream: MediaStream, config: {name: string, message: string, lastSeen: FieldValue, startedAt: FieldValue, audioOnly: boolean, uid: string}, data: any}) {

  const [callIds, setCallIds] = useState<string[]>([])
  const lastSeenAllowance = 30 * 60 * 1000
  const callsCollection = collection(doc(collection(db, "broadcasts"), config.uid), "calls")

  useEffect(() => { // register onSnapshot that monitors firestore for new calls
    const unsubscribe = onSnapshot(
        query(callsCollection,
        where("lastSeen", ">=", Timestamp.fromDate(new Date((Date.now()-lastSeenAllowance)))
        )), async (snapshot) => {
      setCallIds(oldCallIds => {
        let newCallIds = [...(oldCallIds || [])]
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id
          if (id) {
            if (change.type === "added") {
              console.log("doc "+id+" added")
              console.log(typeof change.doc.data().lastSeen, change.doc.data().lastSeen)
              if (!newCallIds.includes(id)) {
                newCallIds.push(id)
              }
            }
            if (change.type === "modified") {
            }
            if (change.type === "removed") {
              newCallIds = newCallIds.filter(call => call !== id)
            }
          }
        })
        console.log("newCallIds",newCallIds)
        return newCallIds
      })
    }, (error) => {
      console.error("Error in onSnapshot(collection(db, 'calls'))::", error)
    })

    return () => unsubscribe();  // Clean up subscription
  
  }, [])
  
  return (
    <>
    <div className="flex gap-2">
      {localStream && callIds.map(callId => (
        <BroadcastCall callsCollection={callsCollection} key={callId} localStream={localStream} callId={callId} data={data} />
      ))}
    </div>
    </>
  )
}
export function BroadcastCall({ callsCollection, localStream, callId, data }: { callsCollection: CollectionReference, localStream: any, callId: string, data: any }) {

  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null)
  const [status, setStatus] = useState(null)
  
  useEffect(() => {
    console.log("1432, data was updated")
      if (dataChannel) {
        const dataString = JSON.stringify(data)
        console.log("trying to send data:", dataString)
        dataChannel.send(dataString)
      }
  }, [data])

  useEffect(() => {
    let pc: RTCPeerConnection | null = null
    let remoteStream: MediaStream | null = null
    let myDataChannel: RTCDataChannel | null = null

    const joinCall = async () => {
      const response = await fetch(`https://piano.metered.live/api/v1/turn/credentials?apiKey=${process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY}`)
      const stunAndTurnServers = await response.json()
      const servers = { iceServers: stunAndTurnServers, iceCandidatePoolSize: 10 }

      pc = new RTCPeerConnection(servers)
      remoteStream = new MediaStream()
      myDataChannel = pc.createDataChannel("webtunnel")
      setDataChannel(myDataChannel)
      
      localStream.getTracks().forEach((track: any) => {
        if (pc) {pc.addTrack(track, localStream)}
        else {console.error("peerConnection was null")}
      })
      
      pc.ontrack = (e: any) => {
        e.streams[0].getTracks().forEach((track: any) => {
          if (remoteStream) {remoteStream.addTrack(track)}
          else {console.error("remoteStream was null")}
        })
      }

      if (!callId) {
        console.error('callId not found')
        return
      }

      const callDoc = doc(callsCollection, callId)
      const answerCandidates = collection(callDoc, 'answerCandidates')
      const offerCandidates = collection(callDoc, 'offerCandidates')

      pc.onicecandidate = async (event: any) => {
        if (event.candidate) {
          await setDoc(doc(answerCandidates), { ...event.candidate.toJSON() })
        }
      }
      
      const callData: any = (await getDoc(callDoc)).data()
      const offerDescription = callData.offer
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription))

      const answerDescription = await pc.createAnswer()
      await pc.setLocalDescription(answerDescription)

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      }
      
      await updateDoc(callDoc, { answer })
      
      
      const unsubscribe = onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data()
            if (pc) {pc.addIceCandidate(new RTCIceCandidate(data))}
          }
        })
      })
      
      return () => {
        unsubscribe()
        if (pc) {pc.close()}
      }
    }

    joinCall()

  }, [localStream, callId])

  return (
    <>
      {status && <PcConnectionIcon state={status} />}
    </>
  )
}

export function ListenerPanel() {
  const lastSeenAllowance = 40 * 60 * 1000
  const [broadcastIds, setBroadcastIds] = useState<string[]>([])
  const [broadcastId, setBroadcastId] = useState<string | null>(null)

  useEffect(() => { // monitor firestore for new broadcasts
    const unsubscribe = onSnapshot(
        query(collection(db, "broadcasts"),
        where("lastSeen", ">=", Timestamp.fromDate(new Date((Date.now() - lastSeenAllowance)))
        )), async (snapshot) => {
            setBroadcastIds(oldBroadcastIds => {
                let newBroadcastIds = [...(oldBroadcastIds || [])]
                snapshot.docChanges().forEach((change) => {
                    const id = change.doc.id
                    console.log(id)
                    if (id) {
                        if (change.type === "added") {
                            console.log("doc " + id + " added")
                            console.log(typeof change.doc.data().lastSeen, change.doc.data().lastSeen)
                            if (!newBroadcastIds.includes(id)) {
                                newBroadcastIds.push(id)
                            }
                        }
                        if (change.type === "modified") {
                            // handle any modifications if needed
                        }
                        if (change.type === "removed") {
                            newBroadcastIds = newBroadcastIds.filter(broadcast => broadcast !== id)
                        }
                    }
                })
                console.log("newBroadcastIds", newBroadcastIds)
                return newBroadcastIds
            })
        }, (error) => {
            console.error("Error in onSnapshot(collection(db, 'broadcasts'))::", error)
        })

    return () => unsubscribe()
  }, [])

  return (
    <>
    {!broadcastId && <div className="flex justify-start gap-3 flex-wrap m-4">
      {broadcastIds.length > 0
        ? <>
          {broadcastIds.map(id => (
            <div className="rounded-lg border hover:bg-primary/20 hover:cursor-pointer animate-fade-in" onClick={() => {setBroadcastId(id); console.log("CLICK")}}>
              <BroadcastInfo id={id} key={id}/>
            </div>
          ))}
        </>
        : <>
          <p>There are currently no broadcasts.</p>
        </>
        }
    
    </div>
    }
    {broadcastId && <ListenerCall broadcastId={broadcastId}/> }
    </>
  )
}
export function BroadcastInfo({ id }: { id: string }) {
  const broadcastDocRef = doc(collection(db, "broadcasts"), id)
  const [data, setData] = useState<any>({})
  const [ago, setAgo] = useState<string | null>(null)
  
  const getData = async () => {
    const theData = (await getDoc(broadcastDocRef)).data()
    setData(theData)
    setAgo(() => {
      const secondsBetween = (Date.now() / 1000) - (theData?.lastSeen?.seconds)
      return "started streaming " + (secondsBetween > 60 ? Math.floor(secondsBetween/60).toString() + " minutes ago" : Math.floor(secondsBetween).toString() + " seconds ago")
    })
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <>
      <div className="p-3 pt-1">
        <div className="flex gap-2 items-center">
          <h1 className="text-lg font-bold">{data?.name}</h1>
          <p className="text-muted-foreground text-xs">{ago}</p>
        </div>
        <p className="text-muted-foreground text-sm">{data?.message}</p>
      </div>
    </>
  )
}
export function ListenerCall({ broadcastId} : { broadcastId: string}) {

  const [broadcastData, setBroadcastData] = useState<object>({})
  const [broadcasting, setBroadcasting] = useState<string>("unsure")
  const [isCallStarted, setCallStarted] = useState(false)
  const [seenRecently, setSeenRecently] = useState(false)
  const [status, setStatus] = useState("null")
  const [dataReceived, setDataReceived] = useState<any>(null)
  const broadcastDocRef = doc(collection(db, "broadcasts"), broadcastId)
  
  let localStream: any = null
  let pc: RTCPeerConnection | null = null
  let remoteStream: MediaStream | null = null
  let unsubscribeCandidates: any = null
  let unsubscribeDoc: any = null

  const startCall = async () => {
      setCallStarted(true)
      const response = await fetch(`https://piano.metered.live/api/v1/turn/credentials?apiKey=${process.env.NEXT_PUBLIC_TURN_SERVER_API_KEY}`)
      const stunAndTurnServers = await response.json()
      const servers = {
        iceServers: stunAndTurnServers,
        iceCandidatePoolSize: 10,
      }

      pc = new RTCPeerConnection(servers)
      localStream = new MediaStream()
      remoteStream = new MediaStream()
      
      localStream.addTrack((new AudioContext()).createMediaStreamDestination().stream.getAudioTracks()[0])
      localStream.getTracks().forEach((track: any) => {
        pc?.addTrack(track, localStream)
      })

      pc.ontrack = (e: any) => {
        e.streams[0].getTracks().forEach((track: any) => {
          remoteStream?.addTrack(track)
        })
      }

      pc.ondatachannel = (event) => {
        event.channel.onmessage = (msgevent) => {
          setDataReceived((oldData: any) => {
            if (oldData) {return [...oldData, msgevent.data]}
            else {return [msgevent.data]}
          })
        }
      }

      pc.onconnectionstatechange = (event: any) => {
        setStatus(pc ? pc.connectionState : "null")
      }

      const callDoc = collection(broadcastDocRef, "calls")
      const callId = (await addDoc(callDoc, {})).id

      // await updateDoc(doc(callDoc, 'newCalls'), { [callId]: { createdAt: serverTimestamp(), callId } })

      const offerCandidates = collection(doc(callDoc, callId), 'offerCandidates')
      const answerCandidates = collection(doc(callDoc, callId), 'answerCandidates')

      pc.onicecandidate = async (event: any) => {
        if (event.candidate) {
          await setDoc(doc(offerCandidates), { ...event.candidate.toJSON() })
        }
      }

      const offerDescription = await pc.createOffer()
      await pc.setLocalDescription(offerDescription)
      await updateDoc(doc(callDoc, callId), { createdAt: serverTimestamp(), lastSeen: serverTimestamp(), offer: { sdp: offerDescription.sdp, type: offerDescription.type } })

      unsubscribeDoc = onSnapshot(doc(callDoc, callId), (snapshot) => {
        const data = snapshot.data()
        if (!pc?.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer)
          pc?.setRemoteDescription(answerDescription)
        }
      })

      unsubscribeCandidates = onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            pc?.addIceCandidate(candidate)
          }
        })
      })

      setInterval(async () => {
        if (callId) {
          await updateDoc(doc(callDoc, callId), { lastSeen: serverTimestamp() })
        }
      }, 120000)

      const theirWebcam: HTMLAudioElement = document.getElementById("audio-playback") as HTMLAudioElement
      theirWebcam.srcObject = remoteStream
      theirWebcam.play().catch(error => {console.error(error)})
    }

  const endCall = () => {
    setCallStarted(false)
    unsubscribeDoc && unsubscribeDoc()
    unsubscribeCandidates && unsubscribeCandidates()
    pc?.close()
    pc = null
    localStream = null
    remoteStream = null
  }
  
  const fetchBroadcastData = async () => {
      const callData: any = (await getDoc(broadcastDocRef)).data()
      setBroadcastData(callData)
      console.log(callData?.lastSeen.seconds, Math.round(Date.now() / 1000), Math.round(Date.now() / 1000) - callData?.lastSeen.seconds)
      if (Math.round(Date.now() / 1000) - callData?.lastSeen.seconds < 7 * 60) setBroadcasting("yes")
      else setBroadcasting("no")
  }

  useEffect(() => {
      fetchBroadcastData()
    return () => {
      endCall()
    }
  }, [])

  return (
      <>
      <div className="p-4">
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
          <p>{JSON.stringify(dataReceived)}</p>
        </div>
        </>
        ) : null}
        {broadcasting == "unsure" ? (
            <>
            <p className="font-bold text-lg">checking for broadcasts...</p>
            <Image src="/pikachu.gif" height={100} width={100} alt="Curious pikachu" />
            </>
        ) : null}
        {broadcasting == "no" ? (
            <>
            <p className="font-bold text-lg">nobody was home!</p>
            <Image src="/will.gif" height={100} width={100} alt="Will Smith wondering where everybody is" />
            </>
        ) : null}
        <p className="text-muted-foreground">{JSON.stringify(broadcastData)}</p>
      </div>
    </>
  )
}

export function Webcall() {
    const { user, role } = useContext(AppContext)

    return (
        <>
            {(user && role == "admin") ? <BroadcasterPanel user={user}/> : <ListenerPanel />}
            {/* <BroadcasterPanel user={{uid: "VrIvTvpkA7Rp89v0k0bzwcfg6P92", displayName: "Calvin"}}/> */}
        </>
    )
}