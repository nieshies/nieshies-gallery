"use client";

import slicePhotos from "@/lib/slicePhotos";
import detectOrientation from "@/lib/detectOrientation";
import HeroSection from "@/components/sections/HeroSection";
import FilmStrip from "@/components/sections/FilmStrip";
import StackStory from "@/components/sections/StackStory";
import ParallaxLayers from "@/components/sections/ParallaxLayers";
import FloatingCloud from "@/components/sections/FloatingCloud";
import HorizontalJourney from "@/components/sections/HorizontalJourney";
import CollageGrid from "@/components/sections/CollageGrid";
import CinematicViewer from "@/components/sections/CinematicViewer";
import MemoryWall from "@/components/sections/MemoryWall";
import DayCounter from "@/components/features/DayCounter";

export default function ReferenceGalleryFlow({ photos, heroPhotos, title = "nishi's dump", onPhotoClick, topAction }) {
  const { horizontal, vertical } = detectOrientation(photos);
  const verticalSections = slicePhotos(vertical, 5);
  const resolvedHeroPhotos = heroPhotos?.length ? heroPhotos : photos.slice(0, 6);

  return (
    <div className="relative">
      {topAction ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-end px-5 pt-5 md:px-8 md:pt-8">
          <div className="pointer-events-auto">{topAction}</div>
        </div>
      ) : null}

      <HeroSection photos={resolvedHeroPhotos} title={title} />
      <FilmStrip photos={verticalSections[0] || []} onPhotoClick={onPhotoClick} />
      <StackStory photos={verticalSections[1] || []} onPhotoClick={onPhotoClick} />
      <ParallaxLayers photos={verticalSections[2] || []} onPhotoClick={onPhotoClick} />
      <FloatingCloud photos={verticalSections[3] || []} onPhotoClick={onPhotoClick} />
      <HorizontalJourney photos={horizontal} onPhotoClick={onPhotoClick} />
      <CollageGrid photos={verticalSections[4] || []} onPhotoClick={onPhotoClick} />
      <CinematicViewer photos={photos.slice(0, 2)} onPhotoClick={onPhotoClick} />
      <MemoryWall photos={photos.slice(0, 12)} onPhotoClick={onPhotoClick} />
      <DayCounter />
    </div>
  );
}
