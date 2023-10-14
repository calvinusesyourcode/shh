'use client'

import React, { useEffect, useState, useRef } from 'react';
import { gradientSteps } from '@/lib/test';

export function BeautifulWaveCanvas() {
    // const [renderStrokes, setRenderStrokes] = useState(true);
    const renderStrokes = useRef(true)
  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (canvas && context) {
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    context.globalAlpha = 1
    context.lineWidth = 0.1;
    const colors = ["#0AE7FF", "#DA4167"]
    context.strokeStyle = colors[Math.floor(Math.random()*colors.length)]
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';


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
      if (context.globalAlpha != 0) {
        // context.fillStyle = "rgba(0, 0, 0, 0.04)"
        // context.fillRect(0, 0, width, height)
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
      }
    };

    render();

    const opacityFade = () => {
      context.globalAlpha -= 0.1;
      if (context.globalAlpha > 0.1) {
        setTimeout(() => {opacityFade()}, 200)
      } else {
        context.globalAlpha = 0;
      }
    }
    setTimeout(() => {opacityFade()}, 2000)

  }}, []);

  const getValue = (x: number, y: number, a: number, b: number, c: number, d: number, width: number, height: number) => {
    const scale = 0.005;
    x = (x - width / 2) * scale;
    y = (y - height / 2) * scale;

    const x1 = Math.sin(a * y) + c * Math.cos(a * x);
    const y1 = Math.sin(b * x) + d * Math.cos(b * y);

    return Math.atan2(y1 - y, x1 - x);
  }

  return (<canvas className='w-full h-full' id="canvas"/>)
}

const gradientSeeds = [
  [-1.80,1.86,-0.67,-0.07],
  [1.34,-1.32,-0.28,0.86],
  [-0.95,0.60,-0.54,-0.27],
  [-1.64,1.45,0.98,1.00],
  [1.06,-0.42,-0.45,0.44],
  [1.41,-0.55,0.59,-0.58],
  [1.41,0.28,0.65,1.60],
  [-1.91,0.73,0.71,-0.13],
  [-1.59,0.25,0.82,0.21],
  [0.03,0.30,1.34,-0.91],
  [1.32,-0.57,0.53,0.22],
  [-1.15,1.18,-0.71,-1.19],
]

export function BeautifulGradientCanvas({startColor, endColor, isVisible}: {startColor: string, endColor: string, isVisible: boolean}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  let [a, b, c, d] = gradientSeeds[Math.floor(Math.random() * gradientSeeds.length)]

  a += Math.random() - 0.5
  b += Math.random() - 0.5
  c += Math.random() - 0.5
  d += Math.random() - 0.5

  useEffect(() => {
    console.log(isVisible ? "VISIBLE" : "NOPE")
    if (isVisible) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (canvas && context) {
      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;

      context.globalAlpha = 1
      context.lineWidth = 0.2;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      
      // let a = 2
      // let b = 1
      // let c = 0
      // let d = 3
      
      const points: {x: number, y: number, vx: number, vy: number, c: string}[] = [];
      const colors = gradientSteps(startColor, endColor, height);
      if (colors) {
        for (let y = 0; y < height; y += 5) {
          points.push({
            x: 0,
            y: y,
            vx: 0,
            vy: 0,
            c: colors[y]
          });
        }
      }

      const render = () => {
        if (context.globalAlpha != 0) {
          // context.fillStyle = "rgba(0, 0, 0, 0.04)"
          // context.fillRect(0, 0, width, height)
          for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const value = getValue(p.x, p.y, a, b, c, d, width, height);
            p.vx += Math.cos(value) * 0.3;
            p.vy += Math.sin(value) * 0.3;
            
            context.strokeStyle = p.c;

            context.beginPath();
            context.moveTo(p.x, p.y);

            p.x += p.vx;
            p.y += p.vy;
            context.lineTo(p.x, p.y);
            context.stroke();

            p.vx *= 0.99;
            p.vy *= 0.99;

            // if (p.x > width) p.x = 0;
            // if (p.y > height) p.y = 0;
            // if (p.x < 0) p.x = width;
            // if (p.y < 0) p.y = height;
          }

          requestAnimationFrame(render);
        }
      };

      render();

      const opacityFade = () => {
        context.globalAlpha -= 0.1;
        if (context.globalAlpha > 0.1) {
          setTimeout(() => {opacityFade()}, 200)
        } else {
          context.globalAlpha = 0;
        }
      }
      setTimeout(() => {opacityFade()}, 2000)
    }
  }}, [isVisible]);

  const getValue = (x: number, y: number, a: number, b: number, c: number, d: number, width: number, height: number) => {
    const scale = 0.005;
    x = (x - width / 2) * scale;
    y = (y - height / 2) * scale;

    const x1 = Math.sin(a * y) + c * Math.cos(a * x);
    const y1 = Math.sin(b * x) + d * Math.cos(b * y);

    return Math.atan2(y1 - y, x1 - x);
  }

  return (
  <>
  {/* <p>{`[${a.toFixed(2)},${b.toFixed(2)},${c.toFixed(2)},${d.toFixed(2)}]`}</p> */}
  <canvas className='w-screen h-screen' ref={canvasRef}/>
  </>
  );
}
