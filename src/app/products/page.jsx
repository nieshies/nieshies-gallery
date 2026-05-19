"use client";
import dynamic from "next/dynamic";
import InteractiveEffects from "@/components/features/InteractiveEffects";
import ProductsContent from "./ProductsContent";
import Providers from "../providers";
import { ViewModeProvider } from "@/lib/ViewModeContext";

const DotNav = dynamic(() => import("@/components/features/DotNav"), { ssr: false });

export default function ProductsPage() {
  return (
    <Providers>
      <InteractiveEffects />
      <DotNav />
      <ViewModeProvider>
        <ProductsContent />
      </ViewModeProvider>
    </Providers>
  );
}
