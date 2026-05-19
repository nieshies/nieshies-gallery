"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLikeMutation, useCommentMutation } from "@/hooks/useInteractions";

export default function PostActions({ upload }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: session } = useSession();

  const likeMut = useLikeMutation();
  const commentMut = useCommentMutation();

  const liked = upload.likes?.some((l) => l.profileId === session?.user?.id);
  const likeCount = upload._count?.likes ?? 0;
  const commentCount = upload._count?.comments ?? 0;

  const handleLike = () => {
    if (!session) return;
    likeMut.mutate(upload.id);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMut.mutate(
      { uploadId: upload.id, content: commentText.trim() },
      { onSuccess: () => setCommentText("") }
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={!session}
          className="flex items-center gap-1.5 text-sm cursor-pointer bg-transparent border-none text-white/80 hover:text-a1 transition-colors disabled:opacity-40"
        >
          <span className="text-lg">{liked ? "❤" : "♡"}</span>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm cursor-pointer bg-transparent border-none text-white/80 hover:text-a2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{commentCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-2 space-y-1.5">
          {upload.comments?.map((c) => (
            <div key={c.id} className="flex gap-1.5 text-sm">
              <strong className="text-white/80 shrink-0">{c.profile?.name}:</strong>
              <span className="text-white/70">{c.content}</span>
            </div>
          ))}
          {session && (
            <form onSubmit={handleComment} className="flex gap-2 mt-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-white/7 text-white border border-white/25 rounded-lg px-2.5 py-1.5 text-sm min-h-[32px]"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commentMut.isPending}
                className="text-sm text-a2 font-bold bg-transparent border-none cursor-pointer disabled:opacity-40"
              >
                Post
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
