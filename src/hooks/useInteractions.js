"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLikeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uploadId) => {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like", uploadId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads"] }),
  });
}

export function useCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uploadId, content }) => {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "comment", uploadId, content }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["uploads"] }),
  });
}
