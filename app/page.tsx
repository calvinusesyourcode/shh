'use client';

import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority"
import { gradientSteps } from "@/lib/test";
import React, { RefObject } from 'react';
import { BeautifulGradientCanvas, BeautifulPianoCanvas, BeautifulWaveCanvas } from "@/components/canvases";
import { AnimateOnceVisible, TypingText, useIntersectionObserver } from "@/components/animation";

export default function IndexPage() {
  return (
    <>
    <div className="flex flex-col min-h-screen">
      <Fancy
        cousin={<SiteHeader simple={false}/>}
        title="open-source peer-to-peer "
        typedText={["live music","live podcasts","livestreams"]}
        colors={["#3b82f6","#ec4899"]}
        subtitle="free forever decentralized streaming"
        description={<p>a project by <Link href="https://calvin.art" className="underline">calvin.art</Link></p>}
        buttons={[["broadcast","/broadcast"], ["listen", "/listen"]]}
        />
      <Fancy
        title={<span>inspired by <i>chill lofi beats to study to</i></span>}
        colors={["#eab308","#22c55e"]}
        subtitle='soothing sound waves but "shhhhh" quiet'
        description="using electromagnetic waves instead"
        buttons={[["how it works","/explained"]]}
        />
      <Fancy
        title="scientifically vibe-worthy"
        colors={["#f97316","#a855f7"]}
        subtitle="music as mental massage"
        description="researchers find that a 10-30 minute break of music listening can improve flow state"
        buttons={[["neuroscience of music","/huberman"]]}
      />
      <Fancy
        title="evolving like a pokemon"
        colors={["#55ff55","#5555ff"]}
        subtitle="contributions welcome!"
        description={<p>built by and for the UBC community,<br/>star the project on github!</p>}
        buttons={[["request a feature","/feedback?feedbackType=featureRequest"],["github","https://github.com/calvinusesyourcode/shh"]]}
      />
    </div>
    </>
  )
}

function Fancy({ title, subtitle, description, typedText, colors, cousin=<></>, buttons=[] }: { title: React.ReactNode, subtitle: string, description: React.ReactNode, typedText?: string[], colors: string[], cousin?: React.ReactNode, buttons?: string[] | string[][] }) {
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
              <div className="flex flex-col align-center h-full">
                <div className="flex flex-col my-[10rem] items-center justify-center -translate-y-10 text-center h-full">
                    <p className={`drop-shadow-custom1 bg-clip-text text-transparent max-w-[20rem] font-medium text-5xl pb-4 pt-2`} style={{ backgroundImage: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`}}>
                      {title}
                      {typedText && (<TypingText textArray={typedText} interval={6}/>)}
                    </p>
                    <p className="drop-shadow-custom1 max-w-[30rem] text-xl font-normal">{subtitle}</p>
                    <div className="drop-shadow-custom1 max-w-[30rem] text-xl font-extralight text-muted-foreground px-2">{description}</div>
                    {buttons.length != 0 && (
                      <div className="flex gap-3 my-3">
                        {buttons.map((item, i) => (
                          <>
                          {buttons.length == i+1 ? (
                            <Link key={i} className={buttonVariants({variant:"gradient"})} href={item[1]} style={{  backgroundImage: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})` }}>{item[0]}</Link>
                            ) : (
                              <Link key={i} className={buttonVariants({variant:"outline"})} href={item[1]}>{item[0]}</Link>
                              )}
                          </>
                        ))}
                      </div>
                    )}
                </div>
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

