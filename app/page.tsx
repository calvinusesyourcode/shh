'use client';

import { Webcall } from "@/components/webcall16";
import { AppContext } from "@/lib/context";
import { useUserData } from "@/lib/hooks";
import { GetServerSideProps } from "next";
import { useContext, useState, useEffect } from "react";
import { PcConnectionIcon } from "@/components/pc-connection-icon";

export default function IndexPage() {
  const { user } = useContext(AppContext)
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Webcall/>
      <div className="flex gap-2">
        <PcConnectionIcon state="connecting" />
      </div>
    </section>
  )
}
