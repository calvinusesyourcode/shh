'use client';

import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const VideoSettings = () => {
  const [audioInput, setAudioInput] = useState("");
  const [audioOutput, setAudioOutput] = useState("");
  const [videoInput, setVideoInput] = useState("");
  const [audioInputs, setAudioInputs] = useState<{label: string, value: string}[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<{label: string, value: string}[]>([]);
  const [videoInputs, setVideoInputs] = useState<{label: string, value: string}[]>([]);
  const [stream, setStream] = useState(null);
  const videoElement = useRef(null);

  console.log(audioInput ? audioInput : "goodbye")

  const handleError = (error: any) => {
    console.error("Error:", error.message, error.name);
  };

  const attachSinkId = async (element, sinkId) => {
    if (typeof element.sinkId !== "undefined") {
      try {
        await element.setSinkId(sinkId);
        console.log(`Success, audio output device attached: ${sinkId}`);
      } catch (error) {
        let errorMessage = error;
        if (error.name === "SecurityError") {
          errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
        }
        console.error(errorMessage);
        setAudioOutput(""); // Set back to default
      }
    } else {
      console.warn("Browser does not support output device selection.");
    }
  };

  const fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices;
    } catch (error) {
      handleError(error);
    }
  };

  const gotStream = (newStream) => {
    setStream(newStream);
    videoElement.current.srcObject = newStream;
    return fetchDevices();
  };

  const start = async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    const constraints = {
      audio: { deviceId: audioInput ? { exact: audioInput } : undefined },
      video: { deviceId: videoInput ? { exact: videoInput } : undefined },
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      gotStream(newStream);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
  fetchDevices().then((devices) => {

    setAudioInputs([{ label: "System Default", value: "default" }]);
    setAudioOutputs([{ label: "System Default", value: "default" }]);
    setVideoInputs([{ label: "System Default", value: "default" }]);

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
  start();
}, []);


  useEffect(() => {
    if (audioOutput && videoElement.current) {
      attachSinkId(videoElement.current, audioOutput);
    }
  }, [audioOutput]);

  const onValueChange = (value: string, type: string) => {
    if (type === "audioInput") {
      setAudioInput(value);
    } else if (type === "audioOutput") {
      setAudioOutput(value);
    } else if (type === "videoInput") {
      setVideoInput(value);
    }
  };

  return (
    
    <div className="p-4 flex gap-2">
      <Select onValueChange={(value) => {onValueChange(value, "audioInput")}}>
        <SelectTrigger className="w-[260px]">
          <SelectValue placeholder="System Default" />
        </SelectTrigger>
        <SelectContent>
        {audioInputs.map((option, index) => (
          <SelectItem key={index} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => {onValueChange(value, "audioOutput")}}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="System Default" />
        </SelectTrigger>
        <SelectContent>
        {audioOutputs.map((option, index) => (
          <SelectItem key={index} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => {onValueChange(value, "videoInput")}}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="System Default" />
        </SelectTrigger>
        <SelectContent>
        {videoInputs.map((option, index) => (
          <SelectItem key={index} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
      <video className="m-4" autoPlay />
    </div>
  );
};

export default VideoSettings;

