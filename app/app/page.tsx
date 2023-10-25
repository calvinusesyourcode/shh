"use client"

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

  useEffect(() => {
    fetch('https://api.elevenlabs.io/v1/text-to-speech/lLOmG1inTl8aUwlKXl9H', {
      method: 'POST',
      headers: {
        'accept': 'audio/mpeg',
        'xi-api-key': process.env.LABS11_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "God is real. Love is real. Truth is possible... I believe in you and so does fate, if you act properly.",
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
  }, []);

  return (
    <div>
      {audioSrc && <audio controls src={audioSrc}>Your browser does not support the audio tag.</audio>}
    </div>
  );
}

export default AudioPlayer;
