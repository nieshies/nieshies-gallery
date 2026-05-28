"use client";
import { useEffect } from "react";
import { signIn, signOut } from "next-auth/react";

export default function SignInModal({ mode = "signin", email, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const isSignIn = mode === "signin";

  return (
    <div className="si-overlay" onClick={onClose}>
      <style>{`
        .si-overlay {
          position: fixed; inset: 0;
          z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          background: radial-gradient(ellipse at center, rgba(8,10,18,.78) 0%, rgba(4,6,12,.96) 78%);
          backdrop-filter: blur(28px) saturate(125%);
          -webkit-backdrop-filter: blur(28px) saturate(125%);
          animation: si-fade .32s ease forwards;
        }
        @keyframes si-fade { from { opacity: 0; } to { opacity: 1; } }

        .si-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: 32px 32px 26px;
          border-radius: 22px;
          background: rgba(255,255,255,.04);
          border: 0.5px solid rgba(255,255,255,.1);
          box-shadow:
            0 24px 60px rgba(0,0,0,.5),
            inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter: blur(40px) saturate(140%);
          -webkit-backdrop-filter: blur(40px) saturate(140%);
          display: flex; flex-direction: column;
          gap: 22px;
          animation: si-rise .55s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes si-rise {
          from { opacity: 0; transform: translateY(16px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .si-tag {
          font-size: 10px;
          letter-spacing: .42em;
          text-transform: uppercase;
          color: rgba(255,255,255,.42);
          margin: 0;
        }

        .si-headline {
          margin: 0;
          font-size: 36px;
          line-height: 1.05;
          letter-spacing: -.02em;
          font-weight: 600;
          color: rgba(255,255,255,.96);
        }

        .si-body {
          margin: 0;
          font-size: 13px;
          line-height: 1.65;
          color: rgba(255,255,255,.58);
        }
        .si-email {
          display: inline-block;
          margin-top: 4px;
          font-size: 11px;
          letter-spacing: .04em;
          color: rgba(244,140,54,.85);
        }

        .si-google {
          margin-top: 6px;
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          width: 100%;
          padding: 15px 22px;
          background: rgba(255,255,255,.96);
          color: #111;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -.005em;
          transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
          touch-action: manipulation;
          min-height: 48px;
          box-shadow: 0 8px 24px rgba(0,0,0,.25);
        }
        .si-google:hover {
          background: #fff;
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(0,0,0,.3);
        }
        .si-g-icon { width: 18px; height: 18px; flex-shrink: 0; }

        .si-secondary {
          margin-top: 6px;
          background: transparent;
          border: 0.5px solid rgba(255,255,255,.18);
          border-radius: 999px;
          color: rgba(255,255,255,.7);
          font-size: 12px;
          letter-spacing: .04em;
          padding: 13px 22px;
          cursor: pointer;
          transition: color .2s ease, border-color .2s ease, background .2s ease;
          min-height: 44px;
          touch-action: manipulation;
        }
        .si-secondary:hover {
          color: rgba(255,255,255,1);
          border-color: rgba(255,255,255,.4);
          background: rgba(255,255,255,.04);
        }

        .si-foot {
          margin: 0;
          padding-top: 4px;
          font-size: 10px;
          line-height: 1.55;
          color: rgba(255,255,255,.32);
        }

        .si-close {
          position: fixed;
          top:   max(16px, calc(env(safe-area-inset-top) + 8px));
          right: max(16px, calc(env(safe-area-inset-right) + 8px));
          width: 36px; height: 36px;
          border: 0.5px solid rgba(255,255,255,.18);
          border-radius: 50%;
          background: rgba(0,0,0,.35);
          color: rgba(255,255,255,.45);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; line-height: 1;
          transition: color .2s ease, border-color .2s ease;
          touch-action: manipulation;
        }
        .si-close:hover { color: rgba(255,255,255,.95); border-color: rgba(255,255,255,.5); }

        @media (max-width: 480px) {
          .si-card     { padding: 24px 22px 20px; border-radius: 20px; gap: 16px; }
          .si-headline { font-size: 28px; }
          .si-body     { font-size: 12.5px; }
          .si-google   { padding: 14px 18px; font-size: 13.5px; }
          .si-tag      { font-size: 9.5px; letter-spacing: .38em; }
        }
        @media (max-width: 360px) {
          .si-card     { padding: 22px 20px 18px; gap: 14px; }
          .si-headline { font-size: 25px; }
        }
        /* Landscape phones — shrink so the card fits without scrolling */
        @media (max-height: 600px) and (orientation: landscape) {
          .si-card     { padding: 20px 22px 18px; gap: 12px; }
          .si-headline { font-size: 24px; line-height: 1.1; }
          .si-body     { font-size: 12px; line-height: 1.5; }
          .si-google   { padding: 12px 18px; min-height: 42px; }
          .si-foot     { font-size: 9.5px; }
        }
      `}</style>

      <button className="si-close" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close">×</button>

      <div className="si-card" onClick={(e) => e.stopPropagation()}>
        {isSignIn ? (
          <>
            <p className="si-tag">protected editor</p>
            <h2 className="si-headline">Sign in to contribute.</h2>
            <p className="si-body">
              Browsing the gallery is open to everyone. Adding, editing, or deleting memories needs you to sign in first — the owner will approve new editors.
            </p>
            <button
              className="si-google"
              onClick={() => signIn("google", { callbackUrl: window.location.href })}
            >
              <svg className="si-g-icon" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.79 2.72v2.27h2.9c1.7-1.56 2.69-3.87 2.69-6.64z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.83.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.96v2.34A9 9 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.95 10.72A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.29-1.72V4.94H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.06l2.99-2.34z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l2.99 2.34C4.66 5.15 6.65 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
            <p className="si-foot">
              We only use your name and email to know who's editing. Sessions last 30 days.
            </p>
          </>
        ) : (
          <>
            <p className="si-tag">awaiting approval</p>
            <h2 className="si-headline">Almost in.</h2>
            <p className="si-body">
              You're signed in as <span className="si-email">{email}</span>. The owner has been notified — once they approve your account you'll be able to add and edit memories. Refresh the page after they say yes.
            </p>
            <button
              className="si-secondary"
              onClick={() => signOut({ callbackUrl: window.location.href })}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
