"use client";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function BatchUploader({ onUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState({});
  const inputRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const entries = valid.map((f) => ({
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: URL.createObjectURL(f),
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = (id) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const startUpload = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);

    for (const entry of files) {
      if (entry.status === "done") continue;
      setProgress((prev) => ({ ...prev, [entry.id]: 0 }));

      try {
        const fd = new FormData();
        fd.set("file", entry.file);

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress((prev) => ({
              ...prev,
              [entry.id]: Math.round((e.loaded / e.total) * 100),
            }));
          }
        };

        await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error("Upload failed"));
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.open("POST", "/api/upload");
          xhr.send(fd);
        });

        setProgress((prev) => ({ ...prev, [entry.id]: 100 }));
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: "done" } : f))
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: "error" } : f))
        );
      }
    }

    setUploading(false);
    onUploaded?.();
  };

  const allDone = files.length > 0 && files.every((f) => f.status === "done" || f.status === "error");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border border-white/10 rounded-2xl bg-[rgba(10,10,10,0.75)] backdrop-blur-sm shadow-lg p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg">&#x1F4E4;</span>
        <h3 className="m-0 font-display uppercase text-sm tracking-widest text-white/60">
          Batch Upload
        </h3>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/10 scale-[1.01]"
            : "border-white/15 hover:border-white/30 bg-white/[0.02]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <svg className="w-8 h-8 mb-2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-xs text-white/40 font-mono">
          Drop images here or click to browse
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-2 max-h-64 overflow-y-auto scrollbar-thin"
          >
            {files.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/30">
                  <img
                    src={entry.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate">{entry.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            entry.status === "error"
                              ? "#ff4444"
                              : "linear-gradient(90deg, #f48c36, #ffb347)",
                          width: `${progress[entry.id] || 0}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress[entry.id] || 0}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-[10px] text-white/30 font-mono w-10 text-right">
                      {entry.status === "done"
                        ? "Done"
                        : entry.status === "error"
                          ? "Error"
                          : progress[entry.id] != null
                            ? `${progress[entry.id]}%`
                            : formatBytes(entry.size)}
                    </span>
                  </div>
                </div>
                {entry.status === "pending" && (
                  <button
                    onClick={() => removeFile(entry.id)}
                    className="text-white/20 hover:text-white/60 transition-colors text-xs"
                  >
                    &#10005;
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && !allDone && (
        <div className="flex justify-end mt-4">
          <button
            onClick={startUpload}
            disabled={uploading}
            className="min-h-10 px-5 rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-display uppercase tracking-wider hover:bg-accent/20 disabled:opacity-40 transition-all"
          >
            {uploading
              ? `Uploading ${Object.keys(progress).length}/${files.length}...`
              : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {allDone && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-[10px] text-accent/60 font-mono">
            {files.filter((f) => f.status === "done").length} uploaded
            {files.some((f) => f.status === "error")
              ? `, ${files.filter((f) => f.status === "error").length} failed`
              : ""}
          </span>
          <button
            onClick={() => { setFiles([]); setProgress({}); }}
            className="text-xs text-white/30 hover:text-white/60 font-mono transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </motion.div>
  );
}
