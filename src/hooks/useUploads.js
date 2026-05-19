"use client";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

async function fetchUploads({ pageParam }) {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  params.set("limit", "20");
  const res = await fetch(`/api/uploads?${params}`);
  if (!res.ok) throw new Error("Failed to fetch uploads");
  return res.json();
}

export function useUploads() {
  return useInfiniteQuery({
    queryKey: ["uploads"],
    queryFn: fetchUploads,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });
}

export function useUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads"] }),
  });
}

export function useUpdateCaptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, caption }) => {
      const res = await fetch(`/api/uploads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads"] }),
  });
}

export function useDeleteUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads"] }),
  });
}
