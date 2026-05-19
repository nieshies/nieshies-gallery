"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function usePaginatedMemories(endpoint, query = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const cursorRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const stableQuery = useMemo(() => query, [JSON.stringify(query)]);

  const fetchPage = useCallback(async ({ reset = false } = {}) => {
    if (!reset) {
      if (!cursorRef.current || loadingMoreRef.current || !hasMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
      cursorRef.current = null;
      hasMoreRef.current = true;
    }

    try {
      const params = new URLSearchParams({ limit: "24" });
      if (!reset && cursorRef.current) params.set("cursor", cursorRef.current);
      for (const [key, value] of Object.entries(stableQuery)) {
        if (value) params.set(key, value);
      }

      const res = await fetch(`${endpoint}?${params}`);
      if (!res.ok) return;

      const data = await res.json();
      setItems((prev) => (reset ? data.items || [] : [...prev, ...(data.items || [])]));
      cursorRef.current = data.nextCursor;
      hasMoreRef.current = !!data.nextCursor;
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } finally {
      loadingMoreRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [endpoint, stableQuery]);

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    fetchPage({ reset: true });
  }, [fetchPage]);

  return {
    items,
    setItems,
    loading,
    loadingMore,
    hasMore,
    cursor,
    fetchNext: () => fetchPage({ reset: false }),
    reload: () => fetchPage({ reset: true }),
  };
}
