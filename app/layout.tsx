'use client';

import "@/styles/globals.css"
import { Metadata } from "next"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect, useState } from "react";
import { useUserData } from "@/lib/hooks";
import { AppContext } from "@/lib/context";

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const userData = useUserData()

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppContext.Provider value={userData}>
            {/* <AppContext.Provider value={{user: null, role: "noob"}}> */}
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1 m-4 mt-0">{children}</div>
            </div>
            <TailwindIndicator />
            </AppContext.Provider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
