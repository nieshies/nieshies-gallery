"use client";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useReducedMotion, AnimatePresence } from "framer-motion";
import usePhotos from "@/hooks/usePhotos";
import Button from "@/components/ui/Button";
import { useGame } from "@/lib/ExperienceContext";
import GalleryGrid from "./GalleryGrid";

function UploadLightbox({ onClose, onUpload }) {
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelected(file);
      if (!name) setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!selected) return;
    setStatus("Uploading...");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(selected);
      });
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || selected.name, dataUrl })
      });
      if (!res.ok) throw new Error("Upload failed");
      setStatus("Uploaded ✓");
      setTimeout(() => { onUpload(); onClose(); }, 400);
    } catch { setStatus("Upload failed"); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full p-6 rounded-2xl border border-white/15 bg-[rgba(17,17,17,0.95)] backdrop-blur-xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-lg">&#10005;</button>

        <p className="text-white/60 text-lg font-display uppercase tracking-widest mb-6">ADD PHOTO</p>

        <div className="space-y-4">
          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Photo</p>
            <label className="block w-full border-2 border-dashed border-white/25 rounded-xl p-6 text-center cursor-pointer hover:border-a2/50 transition-colors">
              {selected ? (
                <p className="text-a2 text-sm font-display">{selected.name}</p>
              ) : (
                <p className="text-white/40 text-sm font-display">Click to select a photo</p>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Name</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Photo name"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-base outline-none focus:border-a2/40 placeholder:text-white/20" />
          </div>

          {status && <p className="text-a2 text-sm text-center">{status}</p>}

          <button onClick={handleUpload} disabled={!selected}
            className="w-full py-3 rounded-xl border border-a2/40 text-a2 text-sm font-display uppercase tracking-widest hover:bg-a2/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            UPLOAD
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuoteAddLightbox({ onClose, onAdd }) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd({ text: text.trim(), author: author.trim() || "Anonymous" });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full p-6 rounded-2xl border border-white/15 bg-[rgba(17,17,17,0.95)] backdrop-blur-xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-lg">&#10005;</button>

        <p className="text-white/60 text-lg font-display uppercase tracking-widest mb-6">ADD QUOTE</p>

        <div className="space-y-4">
          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Quote</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your quote..." rows={3}
              className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-white text-base outline-none resize-none focus:border-a2/40 placeholder:text-white/20" />
          </div>

          <div>
            <p className="text-white/30 text-xs font-display uppercase tracking-[0.2em] mb-2">Your name</p>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Name"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-base outline-none focus:border-a2/40 placeholder:text-white/20" />
          </div>

          <button onClick={handleAdd} disabled={!text.trim()}
            className="w-full py-3 rounded-xl border border-a2/40 text-a2 text-sm font-display uppercase tracking-widest hover:bg-a2/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            ADD
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const vibes = [
  "Take 3 sunset photos", "Dump your best food shots", "Add one nostalgic blurry pic",
  "Post your loudest color photo", "Upload your favorite selfie",
  "Capture something that moves you", "Find beauty in the ordinary", "Document today's light",
];

const defaultQuotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
];

function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function QuoteLightbox({ quote, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-xl w-full p-8 rounded-2xl border border-white/15 bg-[rgba(17,17,17,0.95)] backdrop-blur-xl text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-lg">&#10005;</button>
        <p className="text-white/85 text-xl md:text-2xl leading-relaxed font-display">&ldquo;{quote.text}&rdquo;</p>
        <div className="w-8 h-px bg-white/20 mx-auto my-4" />
        <p className="text-a2/60 text-sm font-display uppercase tracking-widest">— {quote.author}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const { photos, reload } = usePhotos();
  const [vibe, setVibe] = useState("Tap to reveal vibe");
  const [showUpload, setShowUpload] = useState(false);
  const [showAddQuote, setShowAddQuote] = useState(false);

  const { dispatch, playSound } = useGame();
  const [quotes, setQuotes] = useState(defaultQuotes);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("customQuotes");
    if (stored) {
      try { setQuotes([...defaultQuotes, ...JSON.parse(stored)]); } catch {}
    }
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const addQuote = (q) => {
    const updated = [...quotes, q];
    setQuotes(updated);
    const custom = updated.slice(defaultQuotes.length);
    localStorage.setItem("customQuotes", JSON.stringify(custom));
  };

  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.6 });

  const stats = [
    { label: "PHOTOS", value: photos.length, color: "#BC13FE" },
    { label: "FAVORITES", value: photos.filter((p) => p.favorite).length, color: "#00FFFF" },
    { label: "MEMORY", value: `${((photos.reduce((a, b) => a + (b.sizeBytes || 0), 0)) / (1024 * 1024)).toFixed(1)} MB`, color: "#00FF2B" },
  ];

  return (
    <>
      {!prefersReducedMotion && (
        <motion.div className="fixed top-0 left-0 h-[1px] w-full origin-left z-50 bg-gradient-to-r from-a1 via-a5 to-a2" style={{ scaleX: smooth }} />
      )}

      <section id="origin" className="min-h-screen flex flex-col items-center justify-center text-center relative px-4 snap-start">
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/30 text-sm font-display uppercase tracking-[0.3em] mb-6">
          A signal into the visual void
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="m-0 mb-4 font-display uppercase text-[clamp(3.5rem,14vw,10rem)] leading-[.82] tracking-tight">
          <span className="block bg-gradient-to-r from-a1 via-a5 to-a2 bg-clip-text text-transparent">nieshies</span>
          <span className="block text-[clamp(2.2rem,9vw,6rem)] mt-[-0.08em] text-white/60">gallery</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/25 max-w-lg text-base md:text-lg leading-relaxed mb-12">
          A cosmic collection of moments — surreal, playful, and alive.
          Every photo tells a story waiting to be discovered.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
          className="flex gap-4 flex-wrap justify-center">
          <Button onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}>VIEW GALLERY</Button>
          <Button variant="ghost" onClick={() => { setVibe(vibes[Math.floor(Math.random() * vibes.length)]); dispatch("vibe_spin"); playSound("click"); }}>SPIN VIBE</Button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-a3 mt-4 text-sm font-display">{vibe}</motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/15 text-xs font-display uppercase tracking-[0.3em]">Scroll to discover</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-px h-6 bg-white/20" />
        </motion.div>
      </section>

      <section id="about" className="min-h-screen flex flex-col items-center justify-center relative px-4 py-20 snap-start">
        <motion.p initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-white/20 text-sm font-display uppercase tracking-[0.3em] mb-8">ABOUT</motion.p>

        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="m-0 font-display uppercase text-[clamp(2.5rem,7vw,5rem)] leading-[.92] text-white text-center">
          A DIGITAL GALLERY<br /><span className="text-a1">BEYOND THE ORDINARY</span>
        </motion.h2>

        <FadeIn delay={0.2} className="mt-6 max-w-xl text-center">
          <p className="text-white/40 text-base md:text-lg leading-relaxed">
            Layer after layer, moments distilled into pixels that unlock new levels of memory.
            A space where form, motion, and perspective converge to draw you into a visual universe.
          </p>
        </FadeIn>

        <div className="grid grid-cols-3 gap-3 mt-12 max-w-lg w-full">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={0.2 + i * 0.1} className="text-center">
              <p className="text-2xl md:text-3xl font-display" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-white/30 text-xs font-display uppercase tracking-widest mt-1">{stat.label}</p>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5} className="mt-10 text-center">
          <p className="text-white/60 text-base font-display uppercase tracking-widest">FEEL BEFORE YOU SEE</p>
          <p className="text-white/25 text-sm mt-1 max-w-md">Emphasis on visual storytelling, converting moments into future memories.</p>
        </FadeIn>
      </section>

      <section id="gallery" className="min-h-screen relative px-4 py-20 snap-start">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.p initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-white/20 text-sm font-display uppercase tracking-[0.3em]">GALLERY</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="m-0 font-display uppercase text-[clamp(2.5rem,7vw,5rem)] leading-[.92] text-white">
                PHOTO <span className="text-a3">COLLECTION</span>
              </motion.h2>
            </div>

            <motion.button initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              onClick={() => setShowUpload(true)}
              className="w-12 h-12 rounded-full border-2 border-white/30 text-white/70 hover:text-white hover:border-a2/50 hover:bg-a2/10 text-2xl flex items-center justify-center transition-all flex-shrink-0"
              title="Add photo">+</motion.button>
          </div>

          <FadeIn delay={0.2}>
            <p className="text-white/30 text-base mt-4 max-w-xl">Every capture holds a fragment of time. Browse, upload, and curate your visual diary.</p>
          </FadeIn>

          <FadeIn delay={0.4}>
            {photos.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/30 text-lg font-display">No photos yet</p>
                <p className="text-white/20 text-sm mt-1">Tap + to upload your first capture</p>
              </div>
            ) : (
              <>
                <GalleryGrid photos={photos} />
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex justify-center mt-10">
                  <Button variant="ghost" to="/products">VIEW ALL ({photos.length})</Button>
                </motion.div>
              </>
            )}
          </FadeIn>
        </div>
      </section>

      <section id="quotes" className="min-h-screen flex flex-col items-center justify-center relative px-4 py-20 snap-start">
        <motion.p initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-white/20 text-sm font-display uppercase tracking-[0.3em] mb-8">REAL RESULTS</motion.p>

        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="m-0 font-display uppercase text-[clamp(2.5rem,7vw,5rem)] leading-[.92] text-white text-center">
          WORDS THAT <span className="text-a3">MOVE</span>
        </motion.h2>

        <div className="w-full max-w-5xl flex justify-end mb-4">
          <motion.button initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            onClick={() => setShowAddQuote(true)}
            className="w-12 h-12 rounded-full border-2 border-white/30 text-white/70 hover:text-white hover:border-a2/50 hover:bg-a2/10 text-2xl flex items-center justify-center transition-all"
            title="Add quote">+</motion.button>
        </div>

        <FadeIn delay={0.2}>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-5xl w-full">
            {quotes.map((q, i) => (
              <motion.div key={`${q.text}-${i}`} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.02 }}
                onClick={() => { setSelectedQuote(q); dispatch("quote_read"); playSound("pop"); }}
                className="break-inside-avoid mb-4 p-5 rounded-xl border border-white/10 bg-[rgba(17,17,17,0.4)] backdrop-blur-sm hover:border-a2/30 hover:bg-[rgba(17,17,17,0.6)] transition-all cursor-pointer group">
                <p className="text-white/60 text-base leading-relaxed group-hover:text-white/80 transition-colors line-clamp-3">&ldquo;{q.text}&rdquo;</p>
                <p className="text-a2/40 text-xs font-display uppercase tracking-widest mt-2">— {q.author}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.5} className="mt-8">
          <Button variant="ghost" to="/real-results">VIEW ALL QUOTES</Button>
        </FadeIn>
      </section>

      <section id="connect" className="min-h-screen flex flex-col items-center justify-center relative px-4 py-20 snap-start">
        <motion.p initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-white/20 text-sm font-display uppercase tracking-[0.3em] mb-8">CONNECT</motion.p>

        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="m-0 font-display uppercase text-[clamp(2.5rem,7vw,5rem)] leading-[.92] text-white text-center">
          KEEP IN <span className="text-a1">TOUCH</span>
        </motion.h2>

        <FadeIn delay={0.2}>
          <p className="text-white/30 text-base mt-4 text-center max-w-md">Follow the journey. Every photo, every moment, every story.</p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {[
              { label: "GALLERY", href: "/products" }, { label: "QUOTES", href: "/real-results" },
              { label: "DASHBOARD", href: "/dashboard" }, { label: "FEED", href: "/feed" },
              { label: "FAMILY", href: "/family" }, { label: "AMNIE", href: "/amnie" },
              { label: "INSTAGRAM", href: "https://www.instagram.com/dnssssh/" },
            ].map((link) => (
              <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined}
                className="px-5 py-2.5 rounded-full border border-white/15 text-white/50 text-xs font-display uppercase tracking-[0.25em] hover:border-a2/40 hover:text-a2 transition-all">
                {link.label}
              </a>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.5} className="mt-16">
          <div className="text-center">
            <p className="text-white/15 text-xs font-mono tracking-wider">NIESHIES GALLERY &mdash; A COSMIC COLLECTION OF MOMENTS</p>
            <div className="w-8 h-px bg-white/10 mx-auto mt-4" />
          </div>
        </FadeIn>
      </section>

      <AnimatePresence>
        {showUpload && <UploadLightbox onClose={() => setShowUpload(false)} onUpload={() => reload()} />}
        {showAddQuote && <QuoteAddLightbox onClose={() => setShowAddQuote(false)} onAdd={addQuote} />}
        {selectedQuote && <QuoteLightbox quote={selectedQuote} onClose={() => setSelectedQuote(null)} />}
      </AnimatePresence>
    </>
  );
}
