"use client";
import { useEffect, useState, useCallback } from "react";
import usePhotos from "@/hooks/usePhotos";
import useHeaders from "@/hooks/useHeaders";
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
import StoryLightbox from "@/components/features/StoryLightbox";

function UploadLightbox({ onClose, onUpload }) {
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") { setClosing(true); setTimeout(onClose, 200); } };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleBgClick = () => { setClosing(true); setTimeout(onClose, 200); };

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
      setTimeout(() => { onUpload(); handleBgClick(); }, 400);
    }
    setUploading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 lightbox-overlay ${closing ? "closing" : "open"}`}
      onClick={handleBgClick}
    >
      <div onClick={(e) => e.stopPropagation()} className="relative max-w-lg w-full p-6 rounded-2xl border border-white/15 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl">
        <button onClick={() => { setClosing(true); setTimeout(onClose, 200); }} className="absolute top-4 right-4 text-white/40 hover:text-white text-lg">&times;</button>
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
                      <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 text-white/60 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
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
      </div>
    </div>
  );
}

export default function Home() {
  const { photos, reload } = usePhotos();
  const { photos: headers } = useHeaders();
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [uploadBtnVisible, setUploadBtnVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { const t = setTimeout(() => setUploadBtnVisible(true), 1000); return () => clearTimeout(t); }, []);

  const handlePhotoClick = useCallback((photo) => {
    setLightboxPhoto(photo);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxPhoto(null);
  }, []);

  const handleDelete = useCallback(() => {
    reload();
    setLightboxPhoto(null);
  }, [reload]);

  const lightboxIndex = lightboxPhoto ? photos.findIndex((p) => p.id === lightboxPhoto.id) : -1;
  const lightboxOpen = lightboxIndex >= 0;

  const { horizontal, vertical } = detectOrientation(photos);
  const vertSections = slicePhotos(vertical, 5);

  return (
    <>
      <div>
        <HeroSection photos={headers} />
        <FilmStrip photos={vertSections[0]} onPhotoClick={handlePhotoClick} />
        <StackStory photos={vertSections[1]} onPhotoClick={handlePhotoClick} />
        <ParallaxLayers photos={vertSections[2]} onPhotoClick={handlePhotoClick} />
        <FloatingCloud photos={vertSections[3]} onPhotoClick={handlePhotoClick} />
        <HorizontalJourney photos={horizontal} onPhotoClick={handlePhotoClick} />
        <CollageGrid photos={vertSections[4]} onPhotoClick={handlePhotoClick} />
        <CinematicViewer photos={photos.slice(0, 1)} onPhotoClick={handlePhotoClick} />
        <MemoryWall photos={photos} onPhotoClick={handlePhotoClick} />
      </div>

      <button
        onClick={() => setShowUpload(true)}
        className={`fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl text-white text-xl upload-btn ${uploadBtnVisible ? "visible" : ""}`}
        style={{ background: "#f48c36" }}
      >
        +
      </button>

      {showUpload && <UploadLightbox onClose={() => setShowUpload(false)} onUpload={() => reload()} />}

      {lightboxOpen && (
        <StoryLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={handleLightboxClose}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
