"use client";
import { useUploads } from "@/hooks/useUploads";
import PostCard from "./PostCard";
import UploadZone from "../ui/UploadZone";

export default function GlobalFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useUploads();
  const uploads = data?.pages.flatMap((p) => p.uploads) ?? [];

  return (
    <section>
      <UploadZone onUploaded={() => {}} />
      {isLoading ? (
        <p className="text-center text-white/50 py-12">Loading feed...</p>
      ) : uploads.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg mb-2">No posts yet</p>
          <p className="text-white/30 text-sm">Drag photos above to start the feed</p>
        </div>
      ) : (
        <section className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {uploads.map((upload, i) => (
            <PostCard key={upload.id} upload={upload} index={i} />
          ))}
        </section>
      )}
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-h-11 px-6 rounded-full border-3 border-a3 border-dashed text-white font-display font-extrabold tracking-wider uppercase cursor-pointer bg-white/5 disabled:opacity-40"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
