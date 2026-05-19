"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicPhotoModal({ item, onClose, onDelete, deleteLabel = "Delete", metaLine }) {
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

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4"
      >
        <motion.div
          initial={{ y: 18, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 18, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/12 bg-[rgba(10,10,10,0.92)] shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-xl text-white/70 transition hover:bg-black/60 hover:text-white"
          >
            &times;
          </button>

          <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="relative min-h-[50vh] bg-black">
              <img
                src={item.src}
                alt=""
                className="h-full max-h-[82vh] w-full object-contain"
              />
            </div>

            <div className="flex flex-col justify-between border-t border-white/10 bg-[rgba(16,16,16,0.82)] p-6 md:border-l md:border-t-0">
              <div>
                <p className="mb-3 text-[10px] font-display uppercase tracking-[0.32em] text-accent/70">
                  memory frame
                </p>
                {metaLine ? (
                  <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/38">{metaLine}</p>
                ) : null}
                <p className="text-base leading-relaxed text-white/82">
                  {item.caption || "A quiet moment in the roll."}
                </p>
              </div>

              {onDelete ? (
                <button
                  onClick={() => {
                    if (window.confirm("Delete this memory?")) onDelete(item.raw.id);
                  }}
                  className="mt-8 rounded-full border border-red-400/24 px-4 py-2 text-left text-xs uppercase tracking-[0.18em] text-red-300 transition hover:border-red-300/40 hover:text-red-200"
                >
                  {deleteLabel}
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
