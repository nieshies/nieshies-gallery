"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import PostActions from "./PostActions";
import { getPhotoUrl } from "@/utils/photo";

export default function PostCard({ upload, index = 0 }) {
  const [caption, setCaption] = useState(upload.caption || "");
  const [editing, setEditing] = useState(false);
  const { data: session } = useSession();
  const isOwner = session?.user?.email && upload.profile?.email === session.user.email;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.04 }}
      className="break-inside-avoid mb-4 border-2 border-white/27 rounded-2xl bg-[rgba(10,10,10,0.92)] p-2.5 shadow-[0_14px_26px_rgba(0,0,0,0.35),0_0_22px_rgba(244,140,54,0.25)]"
    >
      <div className="flex items-center gap-2 px-1 mb-2">
        <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
          {upload.profile?.image ? (
            <img src={upload.profile.image} alt="" className="w-full h-full object-cover" />
          ) : (
            upload.profile?.name?.charAt(0) || "?"
          )}
        </div>
        <span className="text-sm font-medium text-white/80">{upload.profile?.name || "Anonymous"}</span>
      </div>

      <img
        src={getPhotoUrl(upload.url, "medium")}
        alt={upload.name}
        className="w-full rounded-xl block max-h-[500px] object-cover"
        loading="lazy"
      />

      <div className="px-1 mt-2">
        <PostActions upload={upload} />
      </div>

      <div className="px-1 mt-1">
        {editing && isOwner ? (
          <input
            defaultValue={caption}
            className="w-full bg-white/7 text-white border-2 border-white/25 rounded-xl p-2 text-sm min-h-[36px]"
            onBlur={(e) => {
              const val = e.target.value.trim();
              setCaption(val);
              setEditing(false);
              fetch(`/api/uploads/${upload.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ caption: val }),
              }).catch(() => {});
            }}
            onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
            autoFocus
          />
        ) : (
          <p
            className="text-sm text-white/90 cursor-pointer"
            onClick={() => isOwner && setEditing(true)}
          >
            <strong className="text-white">{upload.profile?.name}</strong>{" "}
            {caption || (isOwner ? "Add a caption..." : "")}
          </p>
        )}
      </div>
    </motion.article>
  );
}
