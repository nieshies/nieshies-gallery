"use client";
import { useEffect, useRef, useState } from "react";

export const SECTIONS = [
  { key: "home",              label: "home",        page: "home",   folder: "" },
  { key: "amnie-achievement", label: "achievement", page: "amnie",  folder: "achievement" },
  { key: "amnie-moments",     label: "moments",     page: "amnie",  folder: "moments" },
  { key: "family",            label: "family",      page: "family", folder: "" },
];

export default function UploadLightbox({
  defaultSection = "home",
  onClose,
  page: pageOverride,
  folder: folderOverride,
  label: labelOverride,
}) {
  const base = SECTIONS.find((s) => s.key === defaultSection) || SECTIONS[0];
  const cfg = {
    label:  labelOverride  ?? base.label,
    page:   pageOverride   ?? base.page,
    folder: folderOverride ?? base.folder,
  };

  const [files,     setFiles]     = useState([]);
  const [caption,   setCaption]   = useState("");
  const [status,    setStatus]    = useState("");
  const [uploading, setUploading] = useState(false);
  const [closing,   setClosing]   = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const previewsRef = useRef([]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 220);
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      previewsRef.current.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
    };
  }, []);

  const addFiles = (list) => {
    const selected = Array.from(list || []).filter((f) => f.type?.startsWith("image/"));
    if (selected.length) setFiles((prev) => [...prev, ...selected]);
  };

  const handleFile = (e) => addFiles(e.target.files);

  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const onDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const onDragLeave = (e) => {
    e.preventDefault();
    if (e.target === e.currentTarget) setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    addFiles(e.dataTransfer?.files);
  };

  const removeFile = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (!files.length || uploading) return;
    setUploading(true);
    let done = 0;
    const errors = [];
    for (const file of files) {
      setStatus(`saving ${done + 1} of ${files.length}`);
      try {
        const fd = new FormData();
        fd.append("file",    file);
        fd.append("caption", caption);
        fd.append("page",    cfg.page);
        fd.append("folder",  cfg.folder);
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errors.push(`${file.name}: ${data.error || "failed"}`);
        } else done += 1;
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }
    if (errors.length) {
      setStatus(errors[0]);
      setUploading(false);
    } else {
      setStatus(done === 1 ? "saved" : `${done} saved`);
      setTimeout(close, 750);
    }
  };

  const previewUrl = (file, i) => {
    if (!previewsRef.current[i]) previewsRef.current[i] = URL.createObjectURL(file);
    return previewsRef.current[i];
  };

  return (
    <div
      className={`ul-overlay ${closing ? "ul-closing" : ""}`}
      onClick={close}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <style>{`
        .ul-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.92) 75%);
          backdrop-filter: blur(22px) saturate(125%);
          -webkit-backdrop-filter: blur(22px) saturate(125%);
          animation: ul-fade-in 0.32s ease forwards;
        }
        .ul-overlay.ul-closing { animation: ul-fade-out 0.22s ease forwards; }
        @keyframes ul-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ul-fade-out { from { opacity: 1; } to { opacity: 0; } }

        .ul-content {
          position: relative;
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 34px;
          animation: ul-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes ul-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ul-head { text-align: center; }
        .ul-title {
          margin: 0;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 32px;
          line-height: 1;
          color: rgba(255,245,230,0.92);
        }
        .ul-dest {
          margin: 10px 0 0;
          font-size: 9px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(255,245,230,0.34);
        }

        .ul-drop {
          position: relative;
          width: 280px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 0.5px solid rgba(255,245,230,0.16);
          transition: border-color 0.35s ease, transform 0.35s ease, background 0.35s ease;
          overflow: hidden;
        }
        .ul-drop:hover { border-color: rgba(255,245,230,0.36); }
        .ul-drop.ul-drag {
          border-color: rgba(244,140,54,0.7);
          background: rgba(244,140,54,0.04);
          transform: scale(1.012);
        }

        .ul-plus {
          position: relative;
          width: 36px;
          height: 36px;
          opacity: 0.45;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .ul-drop:hover .ul-plus { opacity: 0.85; }
        .ul-drop.ul-drag .ul-plus { opacity: 1; transform: rotate(90deg); }
        .ul-plus::before, .ul-plus::after {
          content: "";
          position: absolute;
          background: rgba(255,245,230,0.95);
        }
        .ul-plus::before { top: 50%;  left: 0; right: 0; height: 0.5px; transform: translateY(-50%); }
        .ul-plus::after  { left: 50%; top: 0; bottom: 0; width:  0.5px; transform: translateX(-50%); }
        .ul-drop.ul-drag .ul-plus::before,
        .ul-drop.ul-drag .ul-plus::after { background: rgba(244,140,54,1); }

        .ul-thumbs {
          position: absolute;
          inset: 6px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 1fr;
          gap: 3px;
        }
        .ul-thumb { position: relative; overflow: hidden; }
        .ul-thumb img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .ul-thumb-x {
          position: absolute;
          top: 3px; right: 3px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: rgba(0,0,0,0.65);
          color: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          font-size: 11px;
          line-height: 1;
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .ul-thumb:hover .ul-thumb-x { opacity: 1; }
        @media (hover: none) { .ul-thumb-x { opacity: 0.85; } }
        .ul-more {
          position: absolute;
          bottom: 6px; right: 8px;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 14px;
          color: rgba(255,245,230,0.65);
          pointer-events: none;
          text-shadow: 0 1px 4px rgba(0,0,0,0.7);
        }

        .ul-caption-wrap {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ul-caption {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255,245,230,0.9);
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 19px;
          line-height: 1.35;
          padding: 4px 2px;
          resize: none;
          text-align: center;
        }
        .ul-caption::placeholder {
          color: rgba(255,245,230,0.28);
          font-style: italic;
        }
        .ul-caption-line {
          height: 0.5px;
          background: rgba(255,245,230,0.18);
        }

        .ul-status {
          margin: 0;
          min-height: 18px;
          font-family: "Caveat", "Bradley Hand", cursive;
          font-size: 15px;
          color: rgba(244,140,54,0.78);
        }

        .ul-save {
          background: transparent;
          border: none;
          color: rgba(255,245,230,0.5);
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          padding: 12px 22px;
          cursor: pointer;
          transition: color 0.28s ease, letter-spacing 0.28s ease;
          min-height: 44px;
          touch-action: manipulation;
        }
        .ul-save:hover {
          color: rgba(244,140,54,0.95);
          letter-spacing: 0.5em;
        }
        .ul-save:disabled {
          color: rgba(255,245,230,0.15);
          cursor: not-allowed;
          letter-spacing: 0.42em;
        }
        .ul-save:disabled:hover {
          color: rgba(255,245,230,0.15);
          letter-spacing: 0.42em;
        }

        .ul-close {
          position: fixed;
          top:   max(16px, calc(env(safe-area-inset-top) + 8px));
          right: max(16px, calc(env(safe-area-inset-right) + 8px));
          width: 36px;
          height: 36px;
          border: 0.5px solid rgba(255,245,230,0.18);
          border-radius: 50%;
          background: rgba(0,0,0,0.35);
          color: rgba(255,245,230,0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          transition: color 0.2s ease, border-color 0.2s ease;
          touch-action: manipulation;
          z-index: 1;
        }
        .ul-close:hover {
          color: rgba(255,245,230,0.9);
          border-color: rgba(255,245,230,0.5);
        }

        .ul-esc {
          position: fixed;
          bottom: max(18px, calc(env(safe-area-inset-bottom) + 10px));
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(255,245,230,0.2);
          pointer-events: none;
        }

        @media (max-width: 480px) {
          .ul-drop, .ul-caption-wrap { width: 240px; }
          .ul-drop { height: 240px; }
          .ul-title { font-size: 28px; }
          .ul-content { gap: 28px; }
        }
        @media (max-height: 640px) {
          .ul-drop { height: 220px; width: 220px; }
          .ul-caption-wrap { width: 220px; }
          .ul-content { gap: 22px; }
        }
      `}</style>

      <button
        className="ul-close"
        onClick={(e) => { e.stopPropagation(); close(); }}
        aria-label="Close"
      >
        ×
      </button>

      <div className="ul-content" onClick={(e) => e.stopPropagation()}>
        <div className="ul-head">
          <h2 className="ul-title">new memory</h2>
          <p className="ul-dest">{cfg.label}</p>
        </div>

        <label className={`ul-drop ${dragOver ? "ul-drag" : ""}`}>
          {files.length === 0 ? (
            <span className="ul-plus" aria-hidden="true" />
          ) : (
            <>
              <div className="ul-thumbs">
                {files.slice(0, 9).map((file, i) => (
                  <div key={`${file.name}-${i}`} className="ul-thumb">
                    <img src={previewUrl(file, i)} alt="" />
                    <button
                      type="button"
                      className="ul-thumb-x"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(i); }}
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {files.length > 9 && (
                <span className="ul-more">+{files.length - 9}</span>
              )}
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </label>

        <div className="ul-caption-wrap">
          <textarea
            className="ul-caption"
            rows={1}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="a caption…"
          />
          <div className="ul-caption-line" />
        </div>

        <p className="ul-status">{status}</p>

        <button
          type="button"
          className="ul-save"
          onClick={handleUpload}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!files.length || uploading}
        >
          {uploading ? "saving…" : "save"}
        </button>
      </div>

      <span className="ul-esc">esc to close</span>
    </div>
  );
}

export function UploadButton({
  defaultSection = "home",
  label = "+",
  children,
  style = {},
  className = "",
  ariaLabel = "Add a photo",
  page,
  folder,
  destLabel,
  onUploaded,
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={style}
        className={className}
        aria-label={ariaLabel}
      >
        {children ?? label}
      </button>
      {open && (
        <UploadLightbox
          defaultSection={defaultSection}
          page={page}
          folder={folder}
          label={destLabel}
          onClose={() => { setOpen(false); onUploaded?.(); }}
        />
      )}
    </>
  );
}
