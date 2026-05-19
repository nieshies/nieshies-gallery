"use client";
import usePhotos from "@/hooks/usePhotos";
import ScrollGallery from "@/components/ScrollGallery";
import Providers from "./providers";
import InteractiveEffects from "@/components/features/InteractiveEffects";

export default function Page() {
  const { photos } = usePhotos();

  return (
    <Providers>
      <InteractiveEffects />
      <ScrollGallery photos={photos} />
    </Providers>
  );
}
