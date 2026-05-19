"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import usePaginatedMemories from "@/hooks/usePaginatedMemories";
import ReferenceGalleryFlow from "@/components/features/ReferenceGalleryFlow";
import CinematicPhotoModal from "@/components/features/CinematicPhotoModal";

function AddMemoryModal({ onClose, onAdd }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!photoFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      const res = await fetch("/api/amnie", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onAdd(data.memory);
      }
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 22, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 22, opacity: 0, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[1.75rem] border border-white/12 bg-[rgba(12,12,12,0.96)] p-6"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-lg text-white/40 hover:text-white">&times;</button>
        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent/72">new amnie memory</p>
        <div className="space-y-4">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-white/16 p-5 text-center">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="mx-auto max-h-52 rounded-xl object-contain" />
            ) : (
              <p className="text-sm text-white/45">Tap to add a portrait frame</p>
            )}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          <button
            onClick={handleSubmit}
            disabled={!photoFile || uploading}
            className="w-full rounded-full bg-accent px-4 py-3 text-sm uppercase tracking-[0.22em] text-white transition disabled:opacity-35"
          >
            {uploading ? "saving..." : "add to dump"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AmnieDump() {
  const { items: memories, setItems, loading, loadingMore, hasMore, fetchNext } = usePaginatedMemories("/api/amnie");
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    const element = loaderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) fetchNext();
      },
      { rootMargin: "240px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchNext]);

  const flowPhotos = useMemo(
    () =>
      memories.map((memory) => ({
        id: memory.id,
        url: memory.photoUrl,
        uploadedAt: memory.createdAt || memory.date || Date.now(),
        width: memory.width,
        height: memory.height,
      })),
    [memories],
  );

  const addMemory = useCallback((memory) => {
    setItems((prev) => [memory, ...prev]);
  }, [setItems]);

  const deleteMemory = useCallback(async (id) => {
    await fetch(`/api/amnie/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((memory) => memory.id !== id));
    setViewing(null);
  }, [setItems]);

  const loaderSlot = (
    <div className="px-6 pb-14 sm:px-10 lg:pl-28 lg:pr-12">
      <div ref={loaderRef} className="mx-auto flex h-12 max-w-7xl items-center justify-center">
        {loading || loadingMore ? (
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/28">loading...</span>
        ) : !hasMore && memories.length ? (
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/18">end of sequence</span>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <ReferenceGalleryFlow
        photos={flowPhotos}
        title="amnie"
        onPhotoClick={(photo) => {
          const match = memories.find((memory) => memory.id === photo.id);
          if (match) setViewing({ raw: match, src: match.photoUrl });
        }}
        topAction={
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center rounded-full border border-white/16 bg-black/22 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/72 backdrop-blur-md transition hover:border-white/28 hover:bg-black/32 hover:text-white"
          >
            Add Photos
          </button>
        }
      />
      {loaderSlot}

      <AnimatePresence>
        {showAdd ? <AddMemoryModal onClose={() => setShowAdd(false)} onAdd={addMemory} /> : null}
        {viewing ? (
          <CinematicPhotoModal
            item={viewing}
            onClose={() => setViewing(null)}
            onDelete={deleteMemory}
            deleteLabel="Delete memory"
            metaLine={viewing.raw.date}
            hideText={true}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
