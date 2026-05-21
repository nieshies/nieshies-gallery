"use client";
import { useEffect, useState } from "react";
import Providers from "./providers";
import HeroSection from "@/components/sections/HeroSection";
import PhotoStrip from "@/components/features/PhotoStrip";
import ScrollSlider from "@/components/features/ScrollSlider";
import ScatterSection from "@/components/sections/ScatterSection";
import StoryViewer from "@/components/features/StoryViewer";
import MasonryGallery from "@/components/features/MasonryGallery";
import EndCard from "@/components/sections/EndCard";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

const SEC = { paddingBottom: "2rem" };

export default function Page() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch("/api/photos?page=home")
      .then((r) => r.json())
      .then((d) => setPhotos(shuffle(d.photos || [])))
      .catch(() => {});
  }, []);

  const n = photos.length;

  // Distribute photos across sections with NO repeats (except endcard which reuses all)
  // Section sizes tuned for 30+ photos; each section gets a distinct slice
  const s0 = 0;
  const s1 = Math.min(s0 + 6, n);   // moments:  6 photos
  const s2 = Math.min(s1 + 5, n);   // gallery:  5 photos
  const s3 = Math.min(s2 + 10, n);  // scattered: 10 photos
  const s4 = Math.min(s3 + 8, n);   // stories:  8 photos
  const s5 = n;                      // memories: remainder

  const strip   = photos.slice(s0, s1);
  const gallery = photos.slice(s1, s2);
  const scatter = photos.slice(s2, s3);
  const story   = photos.slice(s3, s4);
  const masonry = photos.slice(s4, s5);
  const endcard = photos; // all — EndCard is the summary

  return (
    <Providers>
      <div data-hero>
        <HeroSection />
      </div>

      {strip.length > 0 && (
        <div style={SEC}>
          <span style={LABEL}>moments</span>
          <div style={{ overflow: "hidden" }}>
            <PhotoStrip photos={strip} />
          </div>
        </div>
      )}

      {gallery.length > 0 && (
        <div style={SEC}>
          <span style={LABEL}>gallery</span>
          <ScrollSlider photos={gallery} />
        </div>
      )}

      {scatter.length > 0 && (
        <div>
          <span style={LABEL}>scattered</span>
          <ScatterSection photos={scatter} />
        </div>
      )}

      {story.length > 0 && (
        <div style={{ ...SEC, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1rem 2rem" }}>
          <span style={LABEL}>stories</span>
          <StoryViewer photos={story} />
        </div>
      )}

      {masonry.length > 0 && (
        <div style={{ padding: "0 0.75rem 2rem" }}>
          <span style={LABEL}>memories</span>
          <MasonryGallery photos={masonry} />
        </div>
      )}

      {endcard.length >= 6 && (
        <div>
          <span style={LABEL}>until next time</span>
          <EndCard photos={endcard} />
        </div>
      )}
    </Providers>
  );
}
