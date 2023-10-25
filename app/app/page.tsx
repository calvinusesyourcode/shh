"use client"

import { labs_key } from '@/components/labs-key';
import React, { useEffect, useState } from 'react';

function App() {
    return (
      <div className="App">
        <h1>Text to Speech Audio Player</h1>
        <AudioPlayer />
      </div>
    );
  }

const AudioPlayer: React.FC = () => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [speech, setSpeech] = useState<string | null>(null)

  useEffect(() => {
    fetch("https://shh-git-test-calvinusesyourcode.vercel.app/api8")
    .then((response) => response.json())
    .then((data) => {setSpeech(data["data"])})
  }, [])

  useEffect(() => {
    if (!speech) return;
    fetch('https://api.elevenlabs.io/v1/text-to-speech/C4hn9fnfYxYKktLkgAx2/stream', {
      method: 'POST',
      headers: {
        'accept': 'audio/mpeg',
        'xi-api-key': labs_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: speech,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      setAudioSrc(url);
    })
    .catch((error) => {
      console.error("There was an error fetching audio:", error);
    });
  }, [speech]);

  return (
    <div className='flex h-screen w-[100%] flex-col items-center justify-center'>
      {audioSrc && <audio controls loop src={audioSrc} >Your browser does not support the audio tag.</audio>}
    </div>
  );
}

export default AudioPlayer;
