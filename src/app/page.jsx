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
import { UploadButton } from "@/components/features/UploadLightbox";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const isLandscape = (p) => p.width && p.height && p.width > p.height;

const LABEL = {
  display: "block",
  textAlign: "center",
  fontSize: "9px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "transparent",
  paddingTop: "3.5rem",
  paddingBottom: "0.75rem",
  userSelect: "none",
  pointerEvents: "none",
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

  const all    = photos;
  const horiz  = all.filter(isLandscape);
  const vert   = all.filter((p) => !isLandscape(p));

  // Gallery: landscape-first, up to 5
  const gallery = [...horiz, ...vert].slice(0, 5);
  const usedIds = new Set(gallery.map((p) => p.id));

  // Remaining photos in original shuffle order
  const rest    = all.filter((p) => !usedIds.has(p.id));
  const n       = rest.length;

  const s0 = 0;
  const s1 = Math.min(s0 + 6, n);   // moments:   6 photos
  const s2 = Math.min(s1 + 10, n);  // scattered: 10 photos
  const s3 = Math.min(s2 + 8, n);   // stories:    8 photos
  const s4 = n;                      // masonry:   remainder

  const strip   = rest.slice(s0, s1);
  const scatter = rest.slice(s1, s2);
  const story   = rest.slice(s2, s3);
  const masonry = rest.slice(s3, s4);
  // EndCard: landscape-first summary of all photos
  const endcard = [...horiz, ...vert];

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

      <UploadButton
        defaultSection="home"
        label="+"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 50,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "1px solid rgba(244,140,54,0.4)",
          background: "rgba(0,0,0,0.7)",
          color: "rgba(244,140,54,0.85)",
          fontSize: "22px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: 1,
        }}
      />
    </Providers>
  );
}
