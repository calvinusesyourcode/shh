'use client';

import { auth, googleAuthProvider, db as firestore } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { AppContext } from '@/lib/context';
import { useContext } from "react";
import Image from 'next/image';
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function EnterPage({}) {
  const { user } = useContext(AppContext);
  return (
    <>
    <section>
        <div className="flex flex-col gap-2 justify-start items-start m-5">
      { user ? <LoggedInScreen /> : <SignInButton /> }
      </div>
    </section>
    </>
  )
}

function SignInButton() {
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleAuthProvider)
  }
  return (
    <Button onClick={signInWithGoogle} className="mx-50">Sign in with Google</Button>
  )
}

function LoggedInScreen() {
  return (
    <>
            <Link href='/' className={buttonVariants({variant: "outline"})}>Home</Link>
            <Button onClick={() => auth.signOut()} className={buttonVariants({variant: "outline"})}>Sign out</Button>
    </>
  )

}
