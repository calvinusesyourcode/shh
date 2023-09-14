'use client';

import { Webcall } from "@/components/webcall";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await fetch("https://piano.metered.live/api/v1/turn/credentials?apiKey="+process.env.TURN_SERVER_API_KEY);
  const stunAndTurnServers = await response.json();
  const servers: object = {
    iceServers: stunAndTurnServers,
      iceCandidatePoolSize: 10,
    };  
  return {
    props: {
      servers,
    },
  };
};
export default function IndexPage({ servers }: {servers:any}) {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <Webcall servers={servers}/>
    </section>
  )
}
