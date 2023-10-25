"use client"

import React, { useEffect, useState } from 'react';

interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  // ... other fields
}

const VoiceList: React.FC = () => {
  const [voices, setVoices] = useState<any[]>([]);

  useEffect(() => {
    // Fetch voices from the API
    fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'xi-api-key': '2d32b3670387831381587d7ff6624445',
      }})
      .then((response) => response.json())
      .then((data) => {
        setVoices(data.voices);
      })
      .catch((error) => {
        console.error("There was an error fetching voices:", error);
      });
  }, []);

  return (
    <div>
      <h1>Available Voices</h1>
      {voices.map((voice) => (
        <div key={voice.voice_id}>
          <h2>{voice.name}</h2>
          <h2>{voice.voice_id}</h2>
          {voice.preview_url && (
            <audio controls>
              <source src={voice.preview_url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      ))}
    </div>
  );
};

export default VoiceList;
