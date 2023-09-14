'use client';

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { useContext } from "react";
import { MyContext, servers } from "@/lib/context";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, query, where, getDoc, updateDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Webcall } from "@/components/webcall";

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Webcall />
    </section>
  )
}
