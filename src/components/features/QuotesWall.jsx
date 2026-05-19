"use client";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The purpose of life is not to be happy. It is to be useful, to be honorable.", author: "Ralph Waldo Emerson" },
  { text: "Get busy living or get busy dying.", author: "Stephen King" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Imagination is everything. It is the preview of life's coming attractions.", author: "Albert Einstein" },
  { text: "Art is the lie that enables us to realize the truth.", author: "Pablo Picasso" },
  { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
  { text: "Take risks: if you win, you will be happy; if you lose, you will be wise.", author: "Unknown" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "It's not what you look at that matters, it's what you see.", author: "Henry David Thoreau" },
  { text: "Art washes away from the soul the dust of everyday life.", author: "Pablo Picasso" },
  { text: "The eye is the lamp of the body. If your eyes are good, your whole body will be full of light.", author: "Unknown" },
  { text: "Nothing is impossible. The word itself says 'I'm possible'!", author: "Audrey Hepburn" },
  { text: "What you do speaks so loudly that I cannot hear what you say.", author: "Ralph Waldo Emerson" },
];

const tags = ["All", "Inspiration", "Creativity", "Life", "Art", "Wisdom", "Courage"];

function getTag(q) {
  const text = q.text.toLowerCase();
  if (text.includes("creativ") || text.includes("imagin") || text.includes("art")) return "Creativity";
  if (text.includes("life") || text.includes("live") || text.includes("moment")) return "Life";
  if (text.includes("art") || text.includes("artist") || text.includes("color")) return "Art";
  if (text.includes("courage") || text.includes("fear") || text.includes("risk")) return "Courage";
  if (text.includes("wisdom") || text.includes("know") || text.includes("learn")) return "Wisdom";
  return "Inspiration";
}

export default function QuotesWall({ photos = [] }) {
  const [activeTag, setActiveTag] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(new Set());

  const filtered = useMemo(() => {
    if (activeTag === "All") return quotes;
    return quotes.filter((q) => getTag(q) === activeTag);
  }, [activeTag]);

  const currentQuote = filtered[currentIndex % filtered.length];

  const randomPhoto = useMemo(() => {
    if (photos.length === 0) return null;
    return photos[Math.floor(Math.random() * photos.length)];
  }, [currentIndex, photos]);

  const next = useCallback(() => setCurrentIndex((i) => (i + 1) % filtered.length), [filtered.length]);
  const prev = useCallback(() => setCurrentIndex((i) => (i - 1 + filtered.length) % filtered.length), [filtered.length]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); setCurrentIndex(0); }}
            className={`px-4 py-2 rounded-full text-sm font-display font-bold uppercase tracking-wider transition-all ${
              activeTag === tag
                ? "bg-accent text-black shadow-[0_0_20px_rgba(244,140,54,0.4)]"
                : "bg-white/5 text-white/70 border border-white/20 hover:bg-white/10"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-[rgba(13,13,26,0.85)] backdrop-blur-sm"
        >
          {randomPhoto && (
            <div className="absolute inset-0 z-0">
              <img
                src={randomPhoto.url}
                alt=""
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,13,26,0.95)] via-[rgba(13,13,26,0.5)] to-[rgba(13,13,26,0.8)]" />
            </div>
          )}

          <div className="relative z-10 p-8 md:p-12 text-center">
            <div className="text-4xl text-accent opacity-50 mb-4">&#10077;</div>
            <p className="text-xl md:text-3xl font-display font-bold text-white leading-relaxed mb-6">
              {currentQuote?.text}
            </p>
            <p className="text-accent font-display text-sm uppercase tracking-widest">
              &mdash; {currentQuote?.author}
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white text-lg flex items-center justify-center hover:bg-white/20 transition-all"
              >
                &#8592;
              </button>
              <button
                onClick={() => setLiked((prev) => {
                  const next = new Set(prev);
                  if (next.has(currentIndex)) next.delete(currentIndex);
                  else next.add(currentIndex);
                  return next;
                })}
                className={`w-12 h-12 rounded-full border text-lg flex items-center justify-center transition-all ${
                  liked.has(currentIndex)
                    ? "bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(244,140,54,0.3)]"
                    : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"
                }`}
              >
                {liked.has(currentIndex) ? "♥" : "♡"}
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white text-lg flex items-center justify-center hover:bg-white/20 transition-all"
              >
                &#8594;
              </button>
            </div>
            <p className="text-white/40 text-xs mt-4 font-mono">
              {currentIndex + 1} / {filtered.length}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filtered.slice(0, 8).map((q, i) => (
          <motion.button
            key={i}
            onClick={() => setCurrentIndex(i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`text-left p-4 rounded-2xl border transition-all ${
              i === currentIndex
                ? "border-accent/30 bg-accent/10 shadow-[0_0_15px_rgba(244,140,54,0.2)]"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-white/80 text-sm line-clamp-2 mb-1">{q.text}</p>
            <p className="text-white/40 text-xs">— {q.author}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
