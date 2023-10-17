"use client";

import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { BroadcasterPanel } from "@/components/webcall";
import { AppContext } from "@/lib/context";
import { useContext, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleAuthProvider } from "@/lib/firebase";

export default function BroadcastPage() {
    const { user } = useContext(AppContext)
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider)
    }
    return (
        <>
        <div className="min-h-screen">
            <SiteHeader />
            <div className="flex justify-center mt-6">
                {user ? (
                    <BroadcasterPanel user={user} />
                ) : (
                    <Button onClick={signInWithGoogle} className={`mx-50 ${buttonVariants({ variant: "outline"})}`}>Sign in with Google</Button>
                )}
            </div>
        </div>
        </>
    )
}