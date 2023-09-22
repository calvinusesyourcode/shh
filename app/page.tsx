'use client';

import { Webcall } from "@/components/webcall17";
import { AppContext } from "@/lib/context";
import { useUserData } from "@/lib/hooks";
import { GetServerSideProps } from "next";
import { useContext, useState, useEffect } from "react";
import { PcConnectionIcon } from "@/components/pc-connection-icon";
import Image from "next/image";
import { Svg } from "@/components/svgs";

export default function IndexPage() {
  const { user } = useContext(AppContext)
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Webcall/>
    </section>
  )
}
