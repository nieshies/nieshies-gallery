"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import usePaginatedMemories from "@/hooks/usePaginatedMemories";
import { normalizeMemoryItem } from "@/lib/normalizeGalleryItems";
import CinematicGalleryPage from "@/components/features/CinematicGalleryPage";
import CinematicPhotoModal from "@/components/features/CinematicPhotoModal";

const familyMembers = [
  { nick: "mantip", relation: "dad", emoji: "🏃" },
  { nick: "dr is", relation: "mom", emoji: "🐐" },
  { nick: "sabriena", relation: "older sister", emoji: "🎧" },
  { nick: "nishi", relation: "me", emoji: "🫠" },
  { nick: "wanman", relation: "brother", emoji: "😆" },
  { nick: "ain qissy", relation: "younger sister", emoji: "🇨🇳" },
];

function AddMemoryModal({ onClose, onAdd }) {
  const [memberName, setMemberName] = useState(familyMembers[0].nick);
  const [description, setDescription] = useState("");
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
      formData.append("memberName", memberName);
      formData.append("description", description.trim());
      const res = await fetch("/api/family", { method: "POST", body: formData });
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
        className="relative w-full max-w-lg rounded-[1.75rem] border border-white/12 bg-[rgba(12,12,12,0.96)] p-6"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-lg text-white/40 hover:text-white">&times;</button>
        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent/72">new family memory</p>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {familyMembers.map((member) => (
              <button
                key={member.nick}
                type="button"
                onClick={() => setMemberName(member.nick)}
                className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition ${
                  memberName === member.nick
                    ? "border-accent bg-accent text-white"
                    : "border-white/10 text-white/50 hover:text-white/75"
                }`}
              >
                {member.emoji} {member.nick}
              </button>
            ))}
          </div>
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-white/16 p-5 text-center">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="mx-auto max-h-52 rounded-xl object-contain" />
            ) : (
              <p className="text-sm text-white/45">Tap to add a family frame</p>
            )}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="what's the vibe?"
            rows={4}
            className="w-full rounded-2xl border border-white/12 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-white/22"
          />
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

export default function FamilyDump() {
  const [activeMember, setActiveMember] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState(null);
  const loaderRef = useRef(null);
  const query = useMemo(() => (activeMember ? { member: activeMember } : {}), [activeMember]);
  const { items: memories, setItems, loading, loadingMore, hasMore, fetchNext } = usePaginatedMemories("/api/family", query);

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

  const normalizedItems = useMemo(
    () =>
      memories.map((memory) => {
        const member = familyMembers.find((entry) => entry.nick === memory.memberName);
        return normalizeMemoryItem(memory, {
          meta: member ? { label: `${member.emoji} ${member.relation}` } : { label: "family" },
        });
      }),
    [memories],
  );

  const addMemory = useCallback((memory) => {
    setItems((prev) => [memory, ...prev]);
  }, [setItems]);

  const deleteMemory = useCallback(async (id) => {
    await fetch(`/api/family/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((memory) => memory.id !== id));
    setViewing(null);
  }, [setItems]);

  const topSlot = (
    <div className="px-6 py-10 sm:px-10 lg:pl-28 lg:pr-12">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveMember(null)}
          className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
            !activeMember ? "border-accent bg-accent text-white" : "border-white/10 text-white/46 hover:text-white/76"
          }`}
        >
          all
        </button>
        {familyMembers.map((member) => (
          <button
            key={member.nick}
            type="button"
            onClick={() => setActiveMember(member.nick)}
            className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
              activeMember === member.nick
                ? "border-accent bg-accent text-white"
                : "border-white/10 text-white/46 hover:text-white/76"
            }`}
          >
            {member.emoji} {member.nick}
          </button>
        ))}
      </div>
    </div>
  );

  const bottomSlot = (
    <div className="px-6 pb-14 sm:px-10 lg:pl-28 lg:pr-12">
      <div ref={loaderRef} className="mx-auto flex h-12 max-w-7xl items-center justify-center">
        {loading || loadingMore ? (
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/28">loading...</span>
        ) : !hasMore && memories.length ? (
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/18">all moments loaded</span>
        ) : null}
      </div>
      {!loading && !memories.length ? (
        <div className="mx-auto mt-8 max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.03] px-8 py-16 text-center">
          <p className="mb-3 text-4xl">👨‍👩‍👧‍👦</p>
          <p className="text-lg uppercase tracking-[0.2em] text-white/56">family dump is empty</p>
          <p className="mt-3 text-sm text-white/38">Add a family photo and it will join the shared cinematic flow.</p>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <CinematicGalleryPage
        items={normalizedItems}
        eyebrow="family"
        title="The whole crew in one sequence."
        description="Family frames now share the same cinematic system too, with member identity kept as soft metadata instead of a separate card style."
        onItemClick={setViewing}
        topSlot={topSlot}
        bottomSlot={bottomSlot}
      />

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl text-white shadow-2xl"
      >
        +
      </button>

      <AnimatePresence>
        {showAdd ? <AddMemoryModal onClose={() => setShowAdd(false)} onAdd={addMemory} /> : null}
        {viewing ? (
          <CinematicPhotoModal
            item={viewing}
            onClose={() => setViewing(null)}
            onDelete={deleteMemory}
            deleteLabel="Delete family memory"
            metaLine={(() => {
              const member = familyMembers.find((entry) => entry.nick === viewing.raw.memberName);
              return member ? `${member.emoji} ${member.nick} - ${member.relation}` : viewing.raw.date;
            })()}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
