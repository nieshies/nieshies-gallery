"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Providers from "../providers";
import MasonryGallery from "@/components/features/MasonryGallery";
import { getPhotoUrl } from "@/utils/photo";

// ── constants ────────────────────────────────────────────────────────────────

const BG      = "#0c0804";
const SURFACE = "#1a110a";
const BORDER  = "rgba(255,220,180,0.07)";
const LABEL_C = "rgba(255,220,180,0.32)";

const MEMBERS = [
  { nick: "mantip",    relation: "dad",            emoji: "🏃" },
  { nick: "dr is",     relation: "mom",            emoji: "🐐" },
  { nick: "sabriena",  relation: "older sister",   emoji: "🎧" },
  { nick: "nishi",     relation: "me",             emoji: "🫠" },
  { nick: "wanman",    relation: "brother",        emoji: "😆" },
  { nick: "ain qissy", relation: "younger sister", emoji: "🇨🇳" },
];

// ── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{
      margin: 0,
      textAlign: "center",
      fontSize: "9px",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: LABEL_C,
      paddingTop: "3.5rem",
      paddingBottom: "0.75rem",
      userSelect: "none",
    }}>
      {children}
    </p>
  );
}

// ── 1. Hero ──────────────────────────────────────────────────────────────────

function FamHero() {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetch("/api/headers")
      .then((r) => r.json())
      .then((d) => {
        const list = d.photos || [];
        if (list.length) setPhoto(list[Math.floor(Math.random() * list.length)]);
      })
      .catch(() => {});
  }, []);

  return (
    <section style={{
      position: "relative",
      width: "100%",
      height: "60vh",
      minHeight: "280px",
      overflow: "hidden",
      background: BG,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {photo && (
        <Image
          src={getPhotoUrl(photo.url, "medium")}
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center", filter: "brightness(0.25) saturate(0.6)" }}
          sizes="100vw"
          priority
        />
      )}

      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(to bottom, ${BG}44 0%, ${BG} 100%)`,
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        pointerEvents: "none",
        padding: "0 1rem",
      }}>
        <h1 style={{
          margin: 0,
          color: "#fff",
          fontWeight: 300,
          fontSize: "clamp(48px, 13vw, 100px)",
          letterSpacing: "0.24em",
        }}>
          FAMILY
        </h1>
        <p style={{
          margin: "0.6rem 0 0",
          color: "rgba(255,255,255,0.22)",
          fontSize: "10px",
          letterSpacing: "0.34em",
          textTransform: "uppercase",
        }}>
          always &amp; forever
        </p>
      </div>
    </section>
  );
}

// ── 2. Family member cards ───────────────────────────────────────────────────

function MemberCard({ member, photoUrl }) {
  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
        {photoUrl ? (
          <Image
            src={getPhotoUrl(photoUrl, "thumb")}
            alt={member.nick}
            fill
            style={{ objectFit: "cover", filter: "brightness(0.88)" }}
            sizes="(max-width: 639px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,220,180,0.03)",
            fontSize: "2.5rem",
          }}>
            {member.emoji}
          </div>
        )}
      </div>

      <div style={{ padding: "0.7rem 0.8rem 0.85rem" }}>
        <p style={{
          margin: 0,
          color: "rgba(255,255,255,0.88)",
          fontSize: "0.82rem",
          fontWeight: 500,
          letterSpacing: "0.03em",
          textTransform: "capitalize",
        }}>
          {member.nick}
        </p>
        <p style={{
          margin: "0.2rem 0 0",
          color: "rgba(255,220,180,0.35)",
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          {member.relation}
        </p>
      </div>
    </div>
  );
}

function FamilyCards() {
  const [memberPhotos, setMemberPhotos] = useState({});

  useEffect(() => {
    fetch("/api/family?limit=50")
      .then((r) => r.json())
      .then((d) => {
        const byMember = {};
        for (const mem of d.items || []) {
          if (!byMember[mem.memberName]) byMember[mem.memberName] = mem.photoUrl;
        }
        setMemberPhotos(byMember);
      })
      .catch(() => {});
  }, []);

  return (
    <section style={{ background: BG, padding: "0 1.25rem" }}>
      <SectionLabel>the crew</SectionLabel>
      <>
        <style>{`
          .fam-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.65rem;
            max-width: 680px;
            margin: 0 auto;
          }
          @media (max-width: 639px) {
            .fam-grid { grid-template-columns: repeat(2, 1fr); }
          }
        `}</style>
        <div className="fam-grid">
          {MEMBERS.map((member) => (
            <MemberCard
              key={member.nick}
              member={member}
              photoUrl={memberPhotos[member.nick] || null}
            />
          ))}
        </div>
      </>
    </section>
  );
}

// ── 3. Photo dump ─────────────────────────────────────────────────────────────

function FamPhotoDump() {
  return (
    <section style={{ background: BG, padding: "0 1.25rem 4rem" }}>
      <SectionLabel>memories</SectionLabel>
      <MasonryGallery page="family" />
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FamilyPage() {
  return (
    <Providers>
      <div style={{ background: BG, minHeight: "100vh" }}>
        <FamHero />
        <FamilyCards />
        <FamPhotoDump />
      </div>
    </Providers>
  );
}
