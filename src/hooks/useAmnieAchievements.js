"use client";

import { useCallback, useEffect, useState } from "react";

export default function useAmnieAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/amnie/achievements", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setAchievements(data.achievements || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { achievements, setAchievements, loading, reload: load };
}
