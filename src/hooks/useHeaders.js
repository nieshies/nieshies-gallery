import { useEffect, useState } from "react";

export default function useHeaders() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch("/api/headers", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {});
  }, []);

  return { photos };
}
