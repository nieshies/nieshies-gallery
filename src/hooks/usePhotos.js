import { useEffect, useState } from "react";

export default function usePhotos() {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/photos", { cache: "no-store" });
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {
      setStatus("Could not load photos");
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return { photos, setPhotos, status, setStatus, reload: load };
}
