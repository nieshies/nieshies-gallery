"use client";
import dynamic from "next/dynamic";
import Providers from "../providers";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });
const AmnieDump = dynamic(() => import("@/components/features/AmnieDump"), { ssr: false });

export default function AmniePage() {
  return (
    <Providers>
      <DotNav />
      <AmnieDump />
    </Providers>
  );
}
