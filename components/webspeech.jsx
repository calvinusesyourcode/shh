"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { AudioLevelIndicator } from '@/components/audio-level'

export const SpeechRecognitionComponent = () => {
  const [transcript, setTranscript] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [adding, setAdding] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [sending, setSending] = useState(false)
  const [redoing, setRedoing] = useState(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition()

    if (isListening) recognition.start()
    else recognition.stop()
    
    if (!localStream) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          setLocalStream(stream)
        })
        .catch((err) => {
          console.error('Error getting user media', err)
        })
    }

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
      setAdding(false)
      setRedoing(false)
    }

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranscript(prevTranscript => {
        let transcript
        if (adding) {
          transcript = prevTranscript.concat(currentTranscript)
          setAdding(false)
        } else if (redoing) {
          transcript = prevTranscript.slice(0, -1).concat(currentTranscript)
          setRedoing(false)
        } else {
          transcript = [currentTranscript]
        }
        return transcript
      })
    }

    // return () => {
    //   recognition.onstart = null
    //   recognition.onend = null
    //   recognition.onresult = null
    // };
  }, [isListening])

  return (
    <div className="flex flex-col items-center justify-center gap-2 h-screen">
      <div className="flex flex-col items-center justify-center gap-1 w-fit">
        {localStream && <AudioLevelIndicator className=" max-w-full" localStream={localStream} />}
        <div className='flex gap-1'>
          <Button onClick={() => setIsListening(prevState => {
            return !prevState
            })}>
            {isListening ? <Icons.square /> : <Icons.circle />}
          </Button>
          <Button onClick={() => {
            setAdding(true)
            setIsListening(true)
            }} variant={adding && isListening ? "outline" : "default"}>
            <Icons.plus />
          </Button>
          <Button onClick={() => {
            setRedoing(true)
            setIsListening(true)
            }} variant={redoing && isListening ? "outline" : "default"}>
            <Icons.redo />
          </Button>
          <Button onClick={() => {
            setSending(true)
            }} variant={sending ? "outline" : "default"}>
            <Icons.paper_airplane />
          </Button>
        </div>
      </div>
      <p className='text-center max-w-md bg-muted rounded py-2 px-4'>{transcript.join(" \\ ")}</p>
    </div>
  )
}