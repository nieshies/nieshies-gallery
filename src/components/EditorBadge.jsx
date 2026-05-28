"use client";
import { signOut } from "next-auth/react";
import { useEditorGate } from "@/lib/EditorGate";

export default function EditorBadge() {
  const {
    signedIn, isEditor, isOwner, email, pendingCount,
    openSignIn, openOwnerPanel,
  } = useEditorGate();

  // Two labels — long is used on >480px screens, short on narrow phones.
  const longLabel =
    isOwner   ? "owner" :
    isEditor  ? "editing" :
    signedIn  ? "awaiting approval" :
    "view only · sign in";

  const shortLabel =
    isOwner   ? "owner" :
    isEditor  ? "editing" :
    signedIn  ? "pending" :
    "sign in";

  const handleClick = () => {
    if (isOwner)   { openOwnerPanel(); return; }
    if (signedIn)  { signOut({ callbackUrl: window.location.href }); return; }
    openSignIn();
  };

  return (
    <>
      <style>{`
        .ed-wrap {
          position: fixed;
          bottom: max(14px, calc(env(safe-area-inset-bottom) + 8px));
          left:   max(14px, calc(env(safe-area-inset-left)   + 8px));
          z-index: 55;
          display: inline-flex; align-items: center; gap: 6px;
          max-width: calc(100vw - 28px);
        }
        .ed-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 12px;
          background: rgba(0,0,0,.5);
          color: rgba(255,245,230,.7);
          border: 0.5px solid rgba(255,245,230,.16);
          border-radius: 999px;
          font-size: 10px;
          letter-spacing: .28em;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(14px) saturate(125%);
          -webkit-backdrop-filter: blur(14px) saturate(125%);
          transition: color .2s ease, border-color .2s ease, background .2s ease;
          touch-action: manipulation;
          min-height: 34px;
          position: relative;
          white-space: nowrap;
        }
        .ed-badge:hover { color: rgba(255,245,230,.95); border-color: rgba(255,245,230,.4); }
        .ed-badge.is-editor { color: rgba(244,140,54,.85); border-color: rgba(244,140,54,.35); }
        .ed-badge.is-editor:hover { color: rgba(244,140,54,1); border-color: rgba(244,140,54,.6); }
        .ed-badge.is-owner { color: rgba(244,140,54,.95); border-color: rgba(244,140,54,.45); }
        .ed-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,245,230,.5);
          flex-shrink: 0;
        }
        .ed-badge.is-editor .ed-dot,
        .ed-badge.is-owner  .ed-dot {
          background: rgba(244,140,54,1);
          box-shadow: 0 0 8px rgba(244,140,54,.6);
        }
        .ed-label-long  { display: inline; }
        .ed-label-short { display: none; }

        .ed-notif {
          position: absolute;
          top: -4px; right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: rgba(220,110,110,1);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 2px rgba(0,0,0,.7);
        }
        .ed-signout {
          background: transparent;
          border: 0.5px solid rgba(255,245,230,.14);
          color: rgba(255,245,230,.4);
          border-radius: 999px;
          font-size: 13px;
          line-height: 1;
          padding: 0;
          width: 34px;
          height: 34px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: color .2s ease, border-color .2s ease;
          touch-action: manipulation;
          flex-shrink: 0;
        }
        .ed-signout:hover { color: rgba(255,245,230,.85); border-color: rgba(255,245,230,.4); }

        /* Narrow phones — swap to short labels so badge fits without truncation */
        @media (max-width: 480px) {
          .ed-label-long  { display: none; }
          .ed-label-short { display: inline; }
          .ed-badge {
            font-size: 9.5px;
            letter-spacing: .22em;
            padding: 7px 11px;
          }
        }

        /* Hide while a family-member modal is open (matches site nav rule) */
        body.fam-collage-open .ed-wrap {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
      `}</style>
      <div className="ed-wrap">
        <button
          className={`ed-badge ${isOwner ? "is-owner" : isEditor ? "is-editor" : ""}`}
          onClick={handleClick}
          title={signedIn ? `signed in as ${email}` : "sign in"}
          aria-label={isOwner ? "Open approval panel" : signedIn ? "Sign out" : "Sign in"}
        >
          <span className="ed-dot" />
          <span className="ed-label-long">{longLabel}</span>
          <span className="ed-label-short">{shortLabel}</span>
          {isOwner && pendingCount > 0 && (
            <span className="ed-notif">{pendingCount}</span>
          )}
        </button>
        {isOwner && (
          <button
            className="ed-signout"
            onClick={() => signOut({ callbackUrl: window.location.href })}
            title="sign out"
            aria-label="Sign out"
          >
            ↩
          </button>
        )}
      </div>
    </>
  );
}
