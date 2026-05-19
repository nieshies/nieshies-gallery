"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import usePhotos from "@/hooks/usePhotos";
import StoryLightbox from "@/components/features/StoryLightbox";
import CinematicGalleryPage from "@/components/features/CinematicGalleryPage";
import { normalizePhotoItem } from "@/lib/normalizeGalleryItems";

function UploadLightbox({ onClose, onUpload }) {
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setClosing(true);
        setTimeout(onClose, 200);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBgClick = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  const handleFile = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    let done = 0;
    const errors = [];

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
          done += 1;
        }
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (errors.length) setStatus(errors[0]);
    else {
      setStatus(`Uploaded ${done} ✓`);
      setTimeout(() => {
        onUpload();
        handleBgClick();
      }, 400);
    }
    setUploading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md lightbox-overlay ${closing ? "closing" : "open"}`}
      onClick={handleBgClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-[1.75rem] border border-white/12 bg-[rgba(10,10,10,0.95)] p-6 backdrop-blur-xl"
      >
        <button
          onClick={() => {
            setClosing(true);
            setTimeout(onClose, 200);
          }}
          className="absolute right-4 top-4 text-lg text-white/40 hover:text-white"
        >
          &times;
        </button>
        <p className="mb-6 text-lg uppercase tracking-[0.3em] text-white/62">add photos</p>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/28">Photos ({files.length})</p>
            <label className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-white/20 p-4 text-center transition-colors hover:border-accent/50">
              {files.length ? (
                <div className="flex max-h-32 flex-wrap justify-center gap-2 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="group relative">
                      <img src={URL.createObjectURL(file)} className="h-16 w-16 rounded-lg object-cover" alt="" />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-[10px] text-white/60 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">Click to select photos</p>
              )}
              <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/28">Caption</p>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-base text-white outline-none placeholder:text-white/20 focus:border-accent/40"
            />
          </div>
          {status ? <p className="text-center text-sm text-accent">{status}</p> : null}
          <button
            onClick={handleUpload}
            disabled={!files.length || uploading}
            className="w-full rounded-xl border border-accent/40 py-3 text-sm uppercase tracking-[0.24em] text-accent transition-all hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {uploading ? "uploading..." : "upload all"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { photos, reload } = usePhotos();
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [uploadBtnVisible, setUploadBtnVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setUploadBtnVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const normalizedItems = useMemo(() => photos.map((photo) => normalizePhotoItem(photo)), [photos]);

  const handleItemClick = useCallback((item) => {
    setLightboxPhoto(item.raw);
  }, []);

  const handleDelete = useCallback(() => {
    reload();
    setLightboxPhoto(null);
  }, [reload]);

  const lightboxIndex = lightboxPhoto ? photos.findIndex((photo) => photo.id === lightboxPhoto.id) : -1;
  const lightboxOpen = lightboxIndex >= 0;

  return (
    <>
      <CinematicGalleryPage
        items={normalizedItems}
        eyebrow="nieshies gallery"
        title="A portrait-led memory sequence."
        description="Your homepage now flows like one cinematic roll: taller frames, calmer hover motion, and scroll sections that reveal memories in order instead of switching visual systems every few seconds."
        onItemClick={handleItemClick}
      />

      <button
        onClick={() => setShowUpload(true)}
        className={`upload-btn fixed bottom-6 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-xl text-white shadow-2xl ${uploadBtnVisible ? "visible" : ""}`}
        style={{ background: "#f48c36" }}
      >
        +
      </button>

      {showUpload ? <UploadLightbox onClose={() => setShowUpload(false)} onUpload={() => reload()} /> : null}

      {lightboxOpen ? (
        <StoryLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxPhoto(null)}
          onDelete={handleDelete}
        />
      ) : null}
    </>
  );
}
