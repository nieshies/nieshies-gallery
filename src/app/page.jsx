"use client";
import dynamic from "next/dynamic";
import usePhotos from "@/hooks/usePhotos";
import useHeaders from "@/hooks/useHeaders";
import Providers from "./providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

const ReferenceGalleryFlow = dynamic(() => import("@/components/features/ReferenceGalleryFlow"), { ssr: false });

export default function Page() {
  const { photos } = usePhotos();
  const { photos: heroPhotos } = useHeaders();

  return (
    <Providers>
      <InteractiveEffects />
      <ReferenceGalleryFlow photos={photos} heroPhotos={heroPhotos} title="nieshies' dump" />
    </Providers>
  );
}
