"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactLenis } from "lenis/react";
import usePhotos from "@/hooks/usePhotos";
import useHeaders from "@/hooks/useHeaders";
import slicePhotos from "@/lib/slicePhotos";
import AmbientGlow from "@/components/features/AmbientGlow";
import HeroSection from "@/components/sections/HeroSection";
import FilmStrip from "@/components/sections/FilmStrip";
import HorizontalJourney from "@/components/sections/HorizontalJourney";
import CameraRoll from "@/components/sections/CameraRoll";
import FloatingCloud from "@/components/sections/FloatingCloud";
import StackStory from "@/components/sections/StackStory";
import CollageGrid from "@/components/sections/CollageGrid";
import CinematicViewer from "@/components/sections/CinematicViewer";
import MemoryWall from "@/components/sections/MemoryWall";
import ParallaxLayers from "@/components/sections/ParallaxLayers";
import FooterSection from "@/components/sections/FooterSection";

function UploadLightbox({ onClose, onUpload }) {
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleFile = (e) => {
    const f = Array.from(e.target.files || []);
    if (f.length) setFiles((prev) => [...prev, ...f]);
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let done = 0;
    let errors = [];
    for (const file of files) {
      setStatus(`Uploading ${done + 1}/${files.length}...`);
      try {
        const fd = new FormData();
        fd.append("file", file);
        if (caption.trim()) fd.append("caption", caption.trim());
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errors.push(`${file.name}: ${data.error || "Failed"}`);
        } else {
          done++;
        }
      } catch (e) {
        errors.push(`${file.name}: ${e.message}`);
      }
    }
    if (errors.length) {
      setStatus(errors[0]);
    } else {
      setStatus(`Uploaded ${done} ✓`);
      setTimeout(() => { onUpload(); onClose(); }, 400);
    }
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full p-6 rounded-2xl border border-white/15 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-lg">&#10005;</button>
        <p className="text-white/60 text-lg font-display uppercase tracking-widest mb-6">ADD PHOTOS</p>
        <div className="space-y-4">
          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Photos ({files.length})</p>
            <label className="block w-full border-2 border-dashed border-white/25 rounded-xl p-4 text-center cursor-pointer hover:border-accent/50 transition-colors">
              {files.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="relative group">
                      <img src={URL.createObjectURL(f)} className="w-16 h-16 rounded-lg object-cover" alt="" />
                      <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 text-white/60 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&#10005;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm font-display">Click to select photos</p>
              )}
              <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Caption (optional)</p>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..."
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-base outline-none focus:border-accent/40 placeholder:text-white/20" />
          </div>
          {status && <p className="text-accent text-sm text-center">{status}</p>}
          <button onClick={handleUpload} disabled={files.length === 0 || uploading}
            className="w-full py-3 rounded-xl border border-accent/40 text-accent text-sm font-display uppercase tracking-widest hover:bg-accent/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            {uploading ? "UPLOADING..." : "UPLOAD ALL"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { photos, reload } = usePhotos();
  const { photos: headers } = useHeaders();
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sliced = slicePhotos(photos);

  return (
    <>
      <AmbientGlow />
      <ReactLenis root>
      <HeroSection photos={headers} />
      <FilmStrip photos={sliced.filmStrip} />
      <HorizontalJourney photos={sliced.horizontalJourney} />
      <CameraRoll photos={sliced.cameraRoll} />
      <FloatingCloud photos={sliced.floatingCloud} />
      <StackStory photos={sliced.stackStory} />
      <CollageGrid photos={sliced.collageGrid} />
      <CinematicViewer photos={sliced.cinematicViewer} />
      <MemoryWall photos={sliced.memoryWall} />
      <ParallaxLayers photos={sliced.parallaxLayers} />
      <FooterSection />
      </ReactLenis>

      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl text-white text-xl"
        style={{ background: "#f48c36" }}
      >
        +
      </motion.button>

      <AnimatePresence>
        {showUpload && <UploadLightbox onClose={() => setShowUpload(false)} onUpload={() => reload()} />}
      </AnimatePresence>
    </>
  );
}
