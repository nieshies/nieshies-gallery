"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VaultGate({ isOpen, onUnlock, onClose, title = "Private Vault" }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const correctPin = "1312";

  const reset = useCallback(() => {
    setPin(["", "", "", ""]);
    setError("");
    setShake(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      reset();
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  const handleChange = (idx, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newPin = [...pin];
    newPin[idx] = value;
    setPin(newPin);
    setError("");

    if (value && idx < 3) {
      inputRefs[idx + 1].current?.focus();
    }

    if (idx === 3 && value) {
      const entered = newPin.join("");
      if (entered === correctPin) {
        setTimeout(() => {
          onUnlock();
          reset();
        }, 200);
      } else {
        setError("Access denied");
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(["", "", "", ""]);
          inputRefs[0].current?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm"
          >
            <div className="border border-white/10 rounded-3xl bg-[rgba(13,13,26,0.95)] backdrop-blur-xl shadow-2xl p-8 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
              >
                &#10005;
              </button>

              <div className="text-4xl mb-4">&#128274;</div>
              <h2 className="m-0 font-display uppercase text-xl tracking-widest text-white mb-1">
                {title}
              </h2>
              <p className="text-white/40 text-xs font-mono mb-6">
                Enter PIN to access private archive
              </p>

              <motion.div
                animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex justify-center gap-3 mb-4"
              >
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-xl font-display rounded-xl border-2 bg-black/50 outline-none transition-all duration-150 ${
                      error
                        ? "border-red-500/50 text-red-400"
                        : digit
                          ? "border-a2/50 text-a2"
                          : "border-white/10 text-white/40"
                    }`}
                    autoComplete="off"
                  />
                ))}
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs font-mono mb-4"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="text-white/20 text-[10px] font-mono">
                Hint: the year of our first transmission
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
