'use client';

import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority"
import { gradientSteps } from "@/lib/test";
import React, { RefObject } from 'react';
import { BeautifulGradientCanvas, BeautifulWaveCanvas } from "@/components/canvases";
import { AnimateOnceVisible, useIntersectionObserver } from "@/components/animation";

export default function IndexPage() {
  return (
    <>
    <div className="flex flex-col min-h-screen">
      {/* <SiteHeader home={true}/> */}
      {/* <ColorTest startColor="#3b82f6" endColor="#ec4899" n={10} /> */}
      <div className="animate-fade-in">
        <Fancy
          cousin={<SiteHeader home={true}/>}
          title="open-source peer-to-peer live music"
          colors={["#3b82f6","#ec4899"]}
          subtitle="free forever decentralized streaming"
          description={<p>a project by <Link href="https://calvin.art" className="underline">calvin.art</Link></p>}
          buttons={["broadcast", "listen"]}
          />
      </div>
      <Fancy
        title="inspired by chill lofi beats to study to"
        colors={["#eab308","#22c55e"]}
        subtitle='soothing sound waves but "shhhhh" quiet'
        description="using electromagnetic waves instead"
        buttons={["how it works"]}
        />
      <Fancy
        title="scientifically vibe-worthy"
        colors={["#f97316","#a855f7"]}
        subtitle="music as mental massage"
        description="researchers find that a 10-30 minute break of music listening can improve flow state"
      />
    </div>
    </>
  )
}

function Fancy({ title, subtitle, description, colors, cousin=<></>, buttons=[] }: { title: string, subtitle: string, description: React.ReactNode, colors: string[], cousin?: React.ReactNode, buttons?: string[] }) {
  const [isVisible, ref]: [boolean, RefObject<HTMLDivElement>] = useIntersectionObserver(true)
  const customClass = isVisible ? `animate-fade-in` : `opacity-0`
  
  return (
      <>
          <div ref={ref} className={`${customClass} flex-none relative w-screen h-screen`}>
            <div className="absolute z-10 w-full h-full mix-blend-screen">
              <BeautifulGradientCanvas startColor={colors[0]} endColor={colors[1]} isVisible={isVisible}/>
            </div>
            <div className="absolute z-30 w-full h-full">
              {cousin}
              <div className="flex flex-col my-[10rem] items-center text-center">
                  <p className={`bg-clip-text text-transparent max-w-[20rem] font-medium text-5xl pb-4 pt-2`} style={{ backgroundImage: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`}}>{title}</p>
                  <p className="max-w-[30rem] text-xl font-normal">{subtitle}</p>
                  <div className="max-w-[30rem] text-xl font-extralight text-muted-foreground">{description}</div>
                  {buttons.length != 0 && (
                    <div className="flex gap-3 my-3">
                      {buttons.map((name, i) => (
                        <>
                        {buttons.length == i+1 ? (
                          <Link key={name} className={buttonVariants({variant:"gradient"})} href={`/${name.replace(/ /g, "-")}`} style={{  backgroundImage: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})` }}>{name}</Link>
                          ) : (
                            <Link key={name} className={buttonVariants({variant:"outline"})} href={`/${name.replace(/ /g, "-")}`}>{name}</Link>
                        )}
                        </>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
      </>
  )
}



function ColorTest({startColor, endColor, n}: {startColor: string, endColor: string, n: number}) {
  const colors = gradientSteps(startColor, endColor, n);
  return (
    <>
    <div className="flex">
      {colors?.map((color) => (
        <p key={color} style={{ color: color }} >hello</p>
      ))}
    </div>
    </>
  )

}

