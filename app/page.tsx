'use client';

import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority"
import { gradientSteps } from "@/lib/test";
import { BeautifulGradientCanvas, BeautifulWaveCanvas } from "@/components/canvases";

export default function IndexPage() {
  return (
    <>
    <div className="flex flex-col min-h-screen">
      {/* <SiteHeader home={true}/> */}
      {/* <ColorTest startColor="#3b82f6" endColor="#ec4899" n={10} /> */}
      <div className="animate-fade-in">
        <Fancy
          children={<><SiteHeader home={true}/></>}
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


function FancyOld({ title, subtitle, description, color, children=<></>, buttons=[] }: { title: string, subtitle: string, description: React.ReactNode, color: string, children?: React.ReactNode, buttons?: string[] }) {
  return (
      <>
      <div className="flex-none relative w-screen h-screen">
        <div className="absolute z-10 w-full h-full mix-blend-screen">
          <BeautifulGradientCanvas startColor="#3b82f6" endColor="#ec4899"/>
        </div>
        <div className="absolute z-30 w-full h-full">
          <div className="flex flex-col my-[10rem] items-center text-center">
              <p className={`${gradients({variant:color})}`}>{title}</p>
              <p className="max-w-[30rem] text-xl font-light">{subtitle}</p>
              <div className="max-w-[30rem] text-xl font-light text-muted-foreground">{description}</div>
              {buttons.length != 0 && (
                <div className="flex gap-3 my-3">
                  {buttons.map((name, i) => (
                    <Link key={name} className={buttons.length - 1 == i ? gradients({variant:color, type:"button"}) : buttonVariants({variant:"outline"})} href={`/${name.replace(/ /g, "-")}`}>{name}</Link>
                  ))}
                </div>
              )}
              {children}
          </div>
        </div>
      </div>
      </>
  )
}
function Fancy({ title, subtitle, description, colors, children=<></>, buttons=[] }: { title: string, subtitle: string, description: React.ReactNode, colors: string[], children?: React.ReactNode, buttons?: string[] }) {
  return (
      <>
      
      <div className="flex-none relative w-screen h-screen">
        <div className="absolute z-10 w-full h-full mix-blend-screen">
          <BeautifulGradientCanvas startColor={colors[0]} endColor={colors[1]}/>
        </div>
        <div className="absolute z-30 w-full h-full">
              {children}
          <div className="flex flex-col my-[10rem] items-center text-center">
              <p className={`bg-clip-text text-transparent max-w-[20rem] font-medium text-5xl pb-4 pt-2`} style={{ backgroundImage: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`}}>{title}</p>
              <p className="max-w-[30rem] text-xl font-normal">{subtitle}</p>
              <div className="max-w-[30rem] text-xl font-normal text-muted-foreground">{description}</div>
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

const gradients: any = cva(
  "",
  {
    variants: {
      type: {
        title: "bg-clip-text text-transparent max-w-[20rem] font-medium text-5xl py-4",
        button: "h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:opacity-70 text-background"
      },
      variant: {
        pinkblue: "bg-gradient-to-br from-pink-500 to-blue-500",
        yellowgreen: "bg-gradient-to-br from-yellow-500 to-green-500",
        orangepurple: "bg-gradient-to-br from-orange-500 to-purple-500",
      },
    },
    defaultVariants: {
      type: "title",
      variant: "pinkblue",
    },
  }
)

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

