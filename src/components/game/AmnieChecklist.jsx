"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "nieshies-amnie-checklist";

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export default function AmnieChecklist() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => loadItems());
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const addItem = useCallback(() => {
    const t = text.trim();
    if (!t) return;
    const next = [...items, { id: Date.now().toString(36), text: t, done: false }];
    setItems(next);
    saveItems(next);
    setText("");
    inputRef.current?.focus();
  }, [text, items]);

  const toggleItem = useCallback((id) => {
    const next = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    setItems(next);
    saveItems(next);
  }, [items]);

  const deleteItem = useCallback((id) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveItems(next);
  }, [items]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter") addItem();
  }, [addItem]);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 15 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-20 z-50 w-11 h-11 rounded-full flex items-center justify-center text-sm border backdrop-blur-md transition-all duration-300"
        style={{
          backgroundColor: open ? "rgba(255,105,180,0.12)" : "rgba(255,105,180,0.06)",
          borderColor: "rgba(255,105,180,0.2)",
          color: "rgba(255,105,180,0.7)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Checklist"
      >
        &#9744;
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-20 z-50 w-64 rounded-xl backdrop-blur-xl border shadow-xl overflow-hidden"
            style={{
              backgroundColor: "rgba(18,18,24,0.94)",
              borderColor: "rgba(255,105,180,0.12)",
            }}
          >
            <div className="px-3 py-2.5 border-b" style={{ borderColor: "rgba(255,105,180,0.06)" }}>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-display uppercase tracking-widest"
                  style={{ color: "rgba(255,105,180,0.5)" }}
                >
                  checklist &#10047;
                </span>
                <span className="text-[9px] font-mono" style={{ color: "rgba(255,105,180,0.25)" }}>
                  {items.filter((i) => i.done).length}/{items.length}
                </span>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto px-1 py-1">
              {items.length === 0 && (
                <p className="text-[11px] font-mono text-center py-4" style={{ color: "rgba(255,105,180,0.2)" }}>
                  add something nice for amnie &#10047;
                </p>
              )}
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg group hover:transition-colors"
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      onClick={() => toggleItem(item.id)}
                      className="flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center text-[8px] transition-all duration-200"
                      style={{
                        borderColor: item.done ? "rgba(255,105,180,0.3)" : "rgba(255,105,180,0.15)",
                        backgroundColor: item.done ? "rgba(255,105,180,0.15)" : "transparent",
                        color: "rgba(255,105,180,0.6)",
                      }}
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span
                      onClick={() => toggleItem(item.id)}
                      className="flex-1 text-xs font-mono transition-all duration-200"
                      style={{
                        color: item.done ? "rgba(255,105,180,0.3)" : "rgba(255,255,255,0.6)",
                        textDecoration: item.done ? "line-through" : "none",
                      }}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] flex-shrink-0"
                      style={{ color: "rgba(255,105,180,0.2)" }}
                    >
                      &#10005;
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="px-2 py-2 border-t flex gap-1" style={{ borderColor: "rgba(255,105,180,0.06)" }}>
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="add item..."
                className="flex-1 bg-transparent text-xs outline-none px-2 py-1 rounded-md"
                style={{ color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,105,180,0.04)" }}
              />
              <button
                onClick={addItem}
                disabled={!text.trim()}
                className="px-2 py-1 rounded-md text-[10px] font-mono transition-all disabled:opacity-20"
                style={{
                  backgroundColor: "rgba(255,105,180,0.1)",
                  color: "rgba(255,105,180,0.6)",
                }}
              >
                + add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
