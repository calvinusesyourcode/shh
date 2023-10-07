"use client";

import { useRef, useEffect } from 'react';

// export function CanvasWithFont() {
//   const canvasRef = useRef(null);

//   const musicalAlphabet = '♩♪♫♬';

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const fontSize = 30;
//     const columns = canvas.width / fontSize;

//     const polynomial = (x: number) => {
//       let a = -0.0000001;
//       let b = 0.001;
//       let c = -0.01;
//       let d = 1;
//       return a*x**3 + d;
//     }

//     // Initialize each column's y-coordinate
//     const streams = Array.from({ length: columns }, (_, i) => {
//       return {
//         x: 4 * fontSize,
//         y: polynomial((5 * fontSize) - (canvas.width/2)) * canvas.height,
//         char: musicalAlphabet[Math.floor(Math.random()*musicalAlphabet.length)]
//       };
//     });

//     const draw = () => {
//       ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       ctx.fillStyle = '#3bccdf';
//       ctx.font = `${fontSize}px "Noto Music"`;
        
//       for (var i = 0, l = streams.length; i < l; i++) {
//         let stream = streams[i]
//         // const text = musicalAlphabet.charAt(Math.floor(Math.random() * musicalAlphabet.length));
//         ctx.fillText(stream.char, stream.x, stream.y);

//         stream.x += 1; // Move stream to the right
//         stream.y = (polynomial(stream.x - (canvas.width/2)) * canvas.height) - (canvas.height/2) + (i*fontSize); // Adjust the y-coordinate based on polynomial

//         // if (stream.x > canvas.width) {
//         //   stream.x = 1; // Reset stream to the beginning
//         // }
//         // if (stream.y < 0) {
//         //   stream.y = canvas.height - 5; // Reset stream to the beginning
//         // }
//       };
//     };

//     const animationInterval = setInterval(draw, 100);  // Adjust the interval for desired speed

//     return () => clearInterval(animationInterval); // Cleanup on unmount
//   }, []);

//   return <canvas ref={canvasRef}></canvas>;
// }

export function BeautifulWaveCanvas() {
    useEffect(() => {
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const context = canvas.getContext("2d");
      if (canvas && context) {

      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;
      context.fillStyle = "white"
  
      context.lineWidth = 2;
  
      let a = Math.random() * 4 - 2;
      let b = Math.random() * 4 - 2;
      let c = Math.random() * 4 - 2;
      let d = Math.random() * 4 - 2;
  
      const points: {x: number, y: number, vx: number, vy: number}[] = [];
      for (let y = 0; y < height; y += 5) {
        points.push({
          x: 0,
          y: y,
          vx: 0,
          vy: 0
        });
      }
  
      const render = () => {
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const value = getValue(p.x, p.y, a, b, c, d, width, height);
          p.vx += Math.cos(value) * 0.3;
          p.vy += Math.sin(value) * 0.3;
  
          context.beginPath();
          context.moveTo(p.x, p.y);
  
          p.x += p.vx;
          p.y += p.vy;
          context.lineTo(p.x, p.y);
          context.stroke();
  
          p.vx *= 0.99;
          p.vy *= 0.99;
  
          if (p.x > width) p.x = 0;
          if (p.y > height) p.y = 0;
          if (p.x < 0) p.x = width;
          if (p.y < 0) p.y = height;
        }
  
        requestAnimationFrame(render);
      };
  
      render();
  
    }}, []);
  
    const getValue = (x: number, y: number, a: number, b: number, c: number, d: number, width: number, height: number) => {
      const scale = 0.005;
      x = (x - width / 2) * scale;
      y = (y - height / 2) * scale;
  
      const x1 = Math.sin(a * y) + c * Math.cos(a * x);
      const y1 = Math.sin(b * x) + d * Math.cos(b * y);
  
      return Math.atan2(y1 - y, x1 - x);
    }
  
    return (
    <canvas id="canvas" />
    )
}