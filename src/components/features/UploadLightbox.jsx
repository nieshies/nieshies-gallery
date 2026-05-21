"use client";
import { useEffect, useState } from "react";

export const SECTIONS = [
  { key: "home",              label: "Home",        hint: "uploads bucket",      page: "home",   folder: "" },
  { key: "amnie-achievement", label: "Achievement", hint: "amnie › achievement", page: "amnie",  folder: "achievement" },
  { key: "amnie-moments",     label: "Moments",     hint: "amnie › moments",     page: "amnie",  folder: "moments" },
  { key: "family",            label: "Family",      hint: "family bucket",       page: "family", folder: "" },
];

export default function UploadLightbox({ defaultSection = "home", onClose }) {
  const [section, setSection]     = useState(defaultSection);
  const [files, setFiles]         = useState([]);
  const [caption, setCaption]     = useState("");
  const [status, setStatus]       = useState("");
  const [uploading, setUploading] = useState(false);
  const [closing, setClosing]     = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { setClosing(true); setTimeout(onClose, 200); }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBgClick = () => { setClosing(true); setTimeout(onClose, 200); };

  const handleFile = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, idx) => idx !== index));

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    let done = 0;
    const errors = [];

    for (const file of files) {
      setStatus(`Uploading ${done + 1}/${files.length}...`);
      try {
        const sectionConfig = SECTIONS.find((s) => s.key === section);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("caption", caption);
        fd.append("page", sectionConfig?.page || section);
        fd.append("folder", sectionConfig?.folder || "");
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errors.push(`${file.name}: ${data.error || "Failed"}`);
        } else {
          done += 1;
        }
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }

    if (errors.length) setStatus(errors[0]);
    else { setStatus(`${done} photo${done !== 1 ? "s" : ""} uploaded ✓`); setTimeout(handleBgClick, 600); }
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
          onClick={() => { setClosing(true); setTimeout(onClose, 200); }}
          className="absolute right-4 top-4 text-lg text-white/40 hover:text-white"
        >
          &times;
        </button>

        <p className="mb-5 text-lg uppercase tracking-[0.3em] text-white/62">add photos</p>

        <div className="mb-4">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/28">Section</p>
          <div className="flex gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                style={{
                  flex: 1,
                  padding: "0.45rem 0",
                  borderRadius: "10px",
                  border: section === s.key ? "1px solid rgba(244,140,54,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  background: section === s.key ? "rgba(244,140,54,0.1)" : "transparent",
                  color: section === s.key ? "rgba(244,140,54,0.9)" : "rgba(255,255,255,0.35)",
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p style={{ marginTop: "0.35rem", fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
            → {SECTIONS.find((s) => s.key === section)?.hint}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-white/28">Caption (optional)</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption or description..."
              rows={2}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "0.6rem 0.8rem",
                color: "rgba(255,255,255,0.7)",
                fontSize: "13px",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/28">Photos ({files.length})</p>
            <label className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-white/20 p-4 text-center transition-colors hover:border-accent/50">
              {files.length ? (
                <div className="flex max-h-32 flex-wrap justify-center gap-2 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="group relative">
                      <img src={URL.createObjectURL(file)} className="h-16 w-16 rounded-lg object-cover" alt="" />
                      <button
                        onClick={(e) => { e.preventDefault(); removeFile(index); }}
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

          {status && <p className="text-center text-sm text-accent">{status}</p>}

          <button
            onClick={handleUpload}
            disabled={!files.length || uploading}
            className="w-full rounded-xl border border-accent/40 py-3 text-sm uppercase tracking-[0.24em] text-accent transition-all hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {uploading ? "uploading..." : `upload to ${SECTIONS.find((s) => s.key === section)?.hint || section}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UploadButton({ defaultSection = "home", label = "+", style = {}, className = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={style} className={className}>
        {label}
      </button>
      {open && <UploadLightbox defaultSection={defaultSection} onClose={() => setOpen(false)} />}
    </>
  );
}
