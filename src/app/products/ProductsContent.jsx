"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import usePhotos from "@/hooks/usePhotos";
import GalleryGrid from "@/components/features/GalleryGrid";
import GalleryOmnibar from "@/components/features/GalleryOmnibar";
import SkeletonGrid from "@/components/features/SkeletonGrid";
import ScatteredGallery from "@/components/features/ScatteredGallery";
import ViewModeToggle from "@/components/features/ViewModeToggle";
import ThemeToggle from "@/components/features/ThemeToggle";
import Section from "@/components/ui/Section";
import { useViewMode } from "@/lib/ViewModeContext";
import { useTheme } from "@/lib/ThemeContext";

const GALLERY_VIEWS = {
  grid: GalleryGrid,
  scattered: ScatteredGallery,
  filmstrip: GalleryGrid,
};

export default function ProductsContent() {
  const { photos, status } = usePhotos();
  const { mode } = useViewMode();
  const { theme } = useTheme();
  const [filtered, setFiltered] = useState([]);
  const loading = photos.length === 0 && !status;

  const handleFilter = useCallback((result) => {
    setFiltered(result);
  }, []);

  const displayPhotos =
    filtered.length > 0 || photos.length === 0 ? filtered : photos;
  const GalleryComponent = GALLERY_VIEWS[mode] || GalleryGrid;

  return (
    <div className="space-y-6">
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="text-xs font-display uppercase tracking-[0.2em] mb-2 text-accent"
          >
            My Collection
          </p>
          <h1
            className="m-0 font-display uppercase text-[clamp(2.2rem,6vw,4.5rem)] leading-[.92]"
            style={{ color: theme === "light" ? "#1a1a1a" : undefined }}
          >
            Picture <span className="text-accent">Gallery</span>
          </h1>
          <p
            className="mt-3 max-w-xl"
            style={{
              color: theme === "light"
                ? "rgba(0,0,0,0.5)"
                : "rgba(255,255,255,0.5)",
            }}
          >
            Every photo tells a story. Browse, zoom, and get lost in the moments.
          </p>
        </motion.div>
      </Section>

      <div
        className="p-[22px] mb-[18px] transition-colors duration-300"
        style={{
          border: "4px solid rgba(244,140,54,0.3)",
          borderRadius: "24px",
          background: theme === "light"
            ? "rgba(255,255,255,0.7)"
            : "rgba(10,10,10,0.82)",
          boxShadow: theme === "light"
            ? "0 1px 3px rgba(0,0,0,0.06)"
            : "0 0 28px rgba(244,140,54,0.35), 10px 10px 0 rgba(244,140,54,0.3)",
        }}
      >
        {loading ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <GalleryOmnibar photos={photos} onFilter={handleFilter} />
              <div className="flex items-center gap-2">
                <ViewModeToggle />
                <ThemeToggle />
              </div>
            </div>

            {status && (
              <p
                className="text-xs font-mono text-center"
                style={{ color: theme === "light" ? "#dc2626" : "#f87171" }}
              >
                {status}
              </p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GalleryComponent photos={displayPhotos} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
