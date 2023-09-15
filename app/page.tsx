'use client';

import { Webcall } from "@/components/audiocall3";
import { AppContext } from "@/lib/context";
import { useUserData } from "@/lib/hooks";
import { GetServerSideProps } from "next";
import { useContext } from "react";

export default function IndexPage() {
  const { user } = useContext(AppContext)
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Webcall/>
    </section>
  )
}
