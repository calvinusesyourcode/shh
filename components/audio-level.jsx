import React, { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'

export const AudioLevelIndicator = ({ className, localStream }) => {
  const [audioInputLevel, setAudioInputLevel] = useState(0)

  useEffect(() => {
    let audioContext, source, analyser, intervalId

    if (localStream) {
      audioContext = new AudioContext()
      source = audioContext.createMediaStreamSource(localStream)
      analyser = audioContext.createAnalyser()
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

      intervalId = setInterval(() => {
        draw()
      }, 100)
    }

    return () => {
      // Cleanup
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [localStream])

  return <Progress className={className} value={audioInputLevel} />
}
