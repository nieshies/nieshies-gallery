"use client";
import usePhotos from "@/hooks/usePhotos";
import useHeaders from "@/hooks/useHeaders";
import ScrollGallery from "@/components/ScrollGallery";
import Providers from "./providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

export default function Page() {
  const { photos } = usePhotos();
  const { photos: heroPhotos } = useHeaders();

  return (
    <Providers>
      <InteractiveEffects />
      <ScrollGallery photos={photos} heroPhotos={heroPhotos} />
    </Providers>
  );
}
