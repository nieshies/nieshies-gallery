"use client";
import { createContext, useContext, useState, useCallback } from "react";

const MODES = ["grid", "scattered", "filmstrip"];

const ViewModeContext = createContext({
  mode: "grid",
  setMode: () => {},
  modes: MODES,
});

export function ViewModeProvider({ children }) {
  const [mode, setMode] = useState("grid");

  const handleSetMode = useCallback((m) => {
    if (MODES.includes(m)) setMode(m);
  }, []);

  return (
    <ViewModeContext.Provider value={{ mode, setMode: handleSetMode, modes: MODES }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
