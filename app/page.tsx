'use client';

import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority"

export default function IndexPage() {
  return (
    <>
    <div className="flex flex-col items-center min-h-screen">
      <SiteHeader home={true} />
      <div className="animate-fade-in">
        <Fancy
          title="open-source peer-to-peer live music"
          color="pinkblue"
          subtitle="free forever decentralized streaming"
          description={<p>a project by <Link href="https://calvin.art" className="underline">calvin.art</Link></p>}
          buttons={["broadcast", "listen"]}
          />
      </div>
      <Fancy
        title="inspired by chill lofi beats to study to"
        color="yellowgreen"
        subtitle='soothing sound waves but "shhhhh" quiet'
        description="using electromagnetic waves instead"
        buttons={["how it works"]}
      />
      <Fancy
        title="scientifically vibe-worthy"
        color="orangepurple"
        subtitle="music as mental massage"
        description="researchers find that a 10-30 minute break of music listening can improve flow state"
      />
    </div>
    </>
  )
}


function Fancy({ title, subtitle, description, color, children=<></>, buttons=[] }: { title: string, subtitle: string, description: React.ReactNode, color: string, children?: React.ReactNode, buttons?: string[] }) {
  return (
    <div className="flex flex-col my-[10rem] items-center text-center">
        <p className={`${gradients({variant:color})}`}>{title}</p>
        {/* <p className={`max-w-[20rem] text-5xl font-medium py-4 bg-gradient-to-br from-${colors[0]}-500 to-${colors[1]}-500 bg-clip-text text-transparent`}>{title}</p> */}
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
  )
}

const gradients = cva(
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