"use client";
import { useRef, useState } from "react";
import { useUploadMutation } from "@/hooks/useUploads";

export default function UploadZone({ onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef();
  const upload = useUploadMutation();

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPreviews(valid.map((f) => ({ file: f, preview: URL.createObjectURL(f), name: f.name })));
  };

  const handleUpload = async () => {
    for (const p of previews) {
      const fd = new FormData();
      fd.set("file", p.file);
      await upload.mutateAsync(fd);
    }
    setPreviews([]);
    onUploaded?.();
  };

  return (
    <div className="mb-6">
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${dragOver ? "border-a2 bg-a2/10" : "border-white/25 hover:border-white/50"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        {previews.length === 0 ? (
          <>
            <svg className="w-10 h-10 mb-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-white/60">Drag photos here or click to browse</p>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {previews.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
      {previews.length > 0 && (
        <div className="flex justify-end mt-3">
          <button
            onClick={handleUpload}
            disabled={upload.isPending}
            className="min-h-11 px-5 rounded-full border-3 border-a3 text-white font-display font-extrabold tracking-wider uppercase cursor-pointer bg-gradient-to-r from-a1 via-a5 to-a2 disabled:opacity-50"
          >
            {upload.isPending ? "Uploading..." : `Upload ${previews.length} file${previews.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
