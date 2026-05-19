"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "HOME" },
  { href: "/amnie", label: "AMNIE" },
  { href: "/family", label: "FAMILY" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.aside
        initial={{ x: -220, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 h-full z-50 hidden lg:flex flex-col"
        style={{
          width: "220px",
          background: "#0a0a0a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "2rem 1.5rem",
          gap: "2rem",
        }}
      >
        <div>
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.24em] text-accent">
            nieshies
          </p>
          <div className="w-6 h-[1px] bg-accent/40 mt-1.5" />
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4, ease: "easeOut" }}
              >
                <Link
                  href={link.href}
                  className="block relative pl-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.18em] transition-all duration-200"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    borderLeft: isActive ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          onClick={() => setShowUpload(true)}
          className="text-left text-[11px] font-display font-bold uppercase tracking-[0.18em] text-accent/70 hover:text-accent transition-colors"
        >
          + Add Photos
        </motion.button>
      </motion.aside>

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex lg:hidden items-center justify-center w-10 h-10 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="space-y-1">
          <span
            className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`}
          />
          <span
            className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-4 h-[1.5px] bg-white/60 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 bottom-0 w-56 p-6 pt-16"
              style={{
                background: "#0a0a0a",
                borderRight: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="space-y-2">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm font-display font-bold uppercase tracking-[0.18em] transition-all"
                      style={{
                        color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                        borderLeft: isActive ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setMobileOpen(false); setShowUpload(true); }}
                  className="block px-3 py-2 text-sm font-display font-bold uppercase tracking-[0.18em] text-accent/70 hover:text-accent transition-colors"
                >
                  + Add Photos
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {showUpload ? <UploadLightbox onClose={() => setShowUpload(false)} /> : null}
    </>
  );
}

function UploadLightbox({ onClose }) {
  const [files, setFiles] = useState([]);
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
        handleBgClick();
      }, 400);
    }
    setUploading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md lightbox-overlay ${closing ? "closing" : "open"}`}
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
