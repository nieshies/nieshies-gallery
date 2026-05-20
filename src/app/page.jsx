"use client";
import { useEffect, useState } from "react";
import Providers from "./providers";
import HeroSection from "@/components/sections/HeroSection";
import StoryViewer from "@/components/features/StoryViewer";
import MasonryGallery from "@/components/features/MasonryGallery";

const LABEL = {
  display: "block",
  textAlign: "center",
  fontSize: "9px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(244,140,54,0.55)",
  paddingTop: "3.5rem",
  paddingBottom: "0.75rem",
  userSelect: "none",
};

export default function Page() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  return (
    <Providers>
      <div data-hero>
        <HeroSection />
      </div>

      {photos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1rem 3rem" }}>
          <span style={LABEL}>stories</span>
          <StoryViewer photos={photos.slice(0, 10)} />
        </div>
      )}

      {photos.length > 0 && (
        <div style={{ padding: "0 0.75rem 5rem" }}>
          <span style={LABEL}>memories</span>
          <MasonryGallery photos={photos} />
        </div>
      )}
    </Providers>
  );
}
