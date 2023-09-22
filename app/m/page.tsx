'use client';

import React, { useEffect, useState } from 'react';

export default function Matrix() {
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
  // useEffect(() => {
  //   const canvas = document.getElementById('canvas');
  //   const context = canvas.getContext('2d');
  
  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;
  
  //   // const alphabet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0987654321!@#$%^&*()';
  //   const alphabet = 'o'
  
  //   let fontSize = 8;
  //   const columns = canvas.width/fontSize;
  
  //   const rainDrops = Array.from({ length: columns }).fill(canvas.height);
  
  //   for( let x = 0; x < columns; x++ ) {
  //       rainDrops[x] = 1;
  //   }
  
  //   const draw = () => {
  //     // context.fillStyle = 'rgba(0, 0, 0, 0.04)';
  //     // context.fillRect(0, 0, canvas.width, canvas.height);
  
  //     context.fillStyle = '#00F';
  //     context.font = fontSize + 'px monospace';
  
  //     for(let i = 0; i < rainDrops.length; i++)
      
  //     {
  //       const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  //         context.fillText(text, i*fontSize, rainDrops[i]*fontSize);
  
  //         if(rainDrops[i]*fontSize > canvas.height/3){
  //         // if(rainDrops[i]*fontSize > canvas.height && Math.random() > 0.975){
  //             // rainDrops[i] = 0;
  //             if (intervalId) clearInterval(intervalId);
  //         }
  //         rainDrops[i]++;
  //     }
  //   };
  
  //   setIntervalId(() => {
  //     const intervalId = setInterval(draw, 100);
  //     return intervalId;
  //   })
    

  // }, [])



  return (
    <>
      <canvas id="canvas" className="title-mask h-50">yoooo</canvas>
    </>
  )
};

