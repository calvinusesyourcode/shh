import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppContext } from "@/lib/context"
import { useContext } from "react"
import { auth, googleAuthProvider, db as firestore } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Svg } from "@/components/svgs"

// export function SiteHeader() {
//   const { user } = useContext(AppContext)
//   return (
//     <header className="bg-background sticky top-0 z-40 w-full border-b">
//       <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
//       <div className="flex gap-2 items-end">
//       <Svg.piano3 width="43" height="43" className="mb-1"/>
//         <h1 className="font-extrabold text-5xl">shh</h1>
//         <div className="flex flex-col gap-0 mb-1">
//           <p className="font-bold text-sm text-muted-foreground">v0.069 by calvin.art</p>
//           <p className="font-bold text-sm text-muted-foreground">open-source peer-to-peer streaming</p>
//         </div>
//       </div>
//         <div className="flex flex-1 items-center justify-end space-x-4">
//           <nav className="flex items-center space-x-1">
            
//           { user ? <LoggedInScreen /> : <SignInButton /> }
//             <Link
//               href={siteConfig.links.github}
//               target="_blank"
//               rel="noreferrer"
//             >
//               <div
//                 className={buttonVariants({
//                   size: "icon",
//                   variant: "ghost",
//                 })}
//               >
//                 <Icons.gitHub className="h-5 w-5" />
//                 <span className="sr-only">GitHub</span>
//               </div>
//             </Link>
//             <Link
//               href={siteConfig.links.twitter}
//               target="_blank"
//               rel="noreferrer"
//             >
//               <div
//                 className={buttonVariants({
//                   size: "icon",
//                   variant: "ghost",
//                 })}
//               >
//                 <Icons.twitter className="h-5 w-5 fill-current" />
//                 <span className="sr-only">Twitter</span>
//               </div>
//             </Link>
//             <ThemeToggle />
//           </nav>
//         </div>
//       </div>
//     </header>
//   )
// }

// export function SiteHeader() {
//   return (
//   <header className="m-4 mb-2">
//     <div className="flex gap-2 items-end w-[100%]">
//       <Svg.piano3 width="43" height="43" className="mb-1 min-w-43"/>
//       <h1 className="font-extrabold text-5xl">shh</h1>
//     </div>
//     <div className="flex flex-col gap-0 mb-1">
//       <p className="font-bold text-sm text-muted-foreground">open-source, peer-to-peer streaming</p>
//       <p className="font-bold text-sm text-muted-foreground">v0.069 by calvin.art</p>
//     </div>
//   </header>
//   )
// }

// function SignInButton() {
//   const signInWithGoogle = async () => {
//     await signInWithPopup(auth, googleAuthProvider)
//   }
//   return (
//     <Button onClick={signInWithGoogle}>login w/ google</Button>
//   )
// }

// function LoggedInScreen() {
//   return (
//             <Button onClick={() => auth.signOut()} className={buttonVariants({variant: "outline"})}>logout</Button>
//   )

// }

export function SiteHeader({home=false}) {

  return (
    <>
    {home ? (
      <div className="flex gap-1 text-xl justify-center animate-slide-down mt-1">
        <div className="flex"><span className="font-bold">s</span><span >onic</span></div>
        <div className="flex"><span className="font-bold">h</span><span >armony</span></div>
        <div className="flex"><span className="font-bold">h</span><span >ub</span></div>
      </div>
    ) : (
      <div className="flex gap-1 text-xl justify-center mt-1">
        <span className="font-extrabold">shh</span>
      </div>
    )}
    </>
  )
}