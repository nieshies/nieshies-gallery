"use client";
import { useEffect, useState } from "react";

const STATUS_LABEL = {
  pending:  "pending",
  approved: "editor",
  denied:   "denied",
};

export default function OwnerPanel({ onClose }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(null); // email currently mutating
  const [filter,  setFilter]  = useState("all"); // all | pending | approved | denied

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const r = await fetch("/api/access", { cache: "no-store" });
      const d = await r.json();
      setRows(d.access || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Poll every 10s while the panel is open so newly-signed-in users appear
    // without forcing the owner to close + reopen the panel.
    const interval = setInterval(() => load(false), 10_000);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const update = async (email, status) => {
    setBusy(email);
    setRows(prev => prev.map(r => r.email === email ? { ...r, status } : r));
    try {
      await fetch("/api/access", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, status }),
      });
    } catch {
      load();
    }
    setBusy(null);
  };

  const filtered = filter === "all" ? rows : rows.filter(r => r.status === filter);
  const pendingCount = rows.filter(r => r.status === "pending").length;

  return (
    <div className="op-overlay" onClick={onClose}>
      <style>{`
        .op-overlay {
          position: fixed; inset: 0;
          z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,.6) 0%, rgba(0,0,0,.94) 75%);
          backdrop-filter: blur(22px) saturate(125%);
          -webkit-backdrop-filter: blur(22px) saturate(125%);
          animation: op-fade .28s ease forwards;
        }
        @keyframes op-fade { from { opacity: 0; } to { opacity: 1; } }

        .op-card {
          position: relative;
          width: 100%;
          max-width: 460px;
          max-height: 82vh;
          display: flex; flex-direction: column;
          gap: 18px;
          padding: 32px 24px 22px;
          animation: op-rise .5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes op-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .op-head { text-align: center; }
        .op-title {
          margin: 0;
          font-family: "Caveat","Bradley Hand",cursive;
          font-size: 32px;
          line-height: 1;
          color: rgba(255,245,230,.92);
        }
        .op-sub {
          margin: 8px 0 0;
          font-size: 10px;
          letter-spacing: .32em;
          text-transform: uppercase;
          color: rgba(255,245,230,.4);
          display: inline-flex; align-items: center; gap: 8px;
          justify-content: center;
        }
        .op-refresh {
          background: transparent; border: none; padding: 4px;
          color: rgba(255,245,230,.4); cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%;
          transition: color .2s ease, transform .4s ease;
          touch-action: manipulation;
        }
        .op-refresh:hover { color: rgba(255,245,230,.95); }
        .op-refresh:disabled { animation: op-spin 0.8s linear infinite; opacity: .6; }
        @keyframes op-spin { to { transform: rotate(360deg); } }

        .op-filter {
          display: flex; gap: 6px; justify-content: center;
          flex-wrap: wrap;
        }
        .op-chip {
          background: transparent;
          border: 0.5px solid rgba(255,245,230,.16);
          border-radius: 999px;
          color: rgba(255,245,230,.55);
          font-size: 10px;
          letter-spacing: .24em;
          text-transform: uppercase;
          padding: 6px 12px;
          cursor: pointer;
          transition: color .2s ease, border-color .2s ease, background .2s ease;
          touch-action: manipulation;
        }
        .op-chip:hover { color: rgba(255,245,230,.95); border-color: rgba(255,245,230,.4); }
        .op-chip.is-active {
          color: rgba(244,140,54,1);
          border-color: rgba(244,140,54,.5);
          background: rgba(244,140,54,.06);
        }

        .op-list {
          flex: 1;
          overflow-y: auto;
          display: flex; flex-direction: column;
          gap: 8px;
          padding-right: 2px;
        }
        .op-list::-webkit-scrollbar { width: 4px; }
        .op-list::-webkit-scrollbar-thumb { background: rgba(255,245,230,.12); border-radius: 2px; }

        .op-row {
          display: grid;
          grid-template-columns: 32px 1fr auto;
          grid-template-areas: "avatar meta actions";
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 0.5px solid rgba(255,245,230,.1);
          border-radius: 14px;
          background: rgba(255,245,230,.02);
        }
        .op-row .op-avatar  { grid-area: avatar; }
        .op-row .op-meta    { grid-area: meta; }
        .op-row .op-status,
        .op-row .op-actions { grid-area: actions; }
        .op-actions-stack {
          grid-area: actions;
          display: flex; align-items: center; gap: 6px;
          flex-wrap: nowrap;
        }
        .op-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(244,140,54,.18);
          color: rgba(255,245,230,.8);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600;
          overflow: hidden;
          flex-shrink: 0;
        }
        .op-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .op-meta { flex: 1; min-width: 0; }
        .op-name {
          font-size: 12px;
          color: rgba(255,245,230,.92);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .op-email {
          font-size: 10px;
          color: rgba(255,245,230,.45);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .op-status {
          font-size: 9px;
          letter-spacing: .28em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 999px;
          flex-shrink: 0;
        }
        .op-status.s-pending  { color: rgba(255,245,230,.5); background: rgba(255,245,230,.06); }
        .op-status.s-approved { color: rgba(116,200,140,1);   background: rgba(116,200,140,.1); }
        .op-status.s-denied   { color: rgba(220,110,110,1);   background: rgba(220,110,110,.1); }
        .op-status.s-owner    { color: rgba(244,140,54,1);    background: rgba(244,140,54,.1); }

        .op-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .op-status-wrap {
          display: inline-flex; align-items: center; gap: 6px;
          flex-shrink: 0;
        }
        .op-btn {
          background: transparent;
          border: 0.5px solid rgba(255,245,230,.18);
          color: rgba(255,245,230,.7);
          font-size: 9px;
          letter-spacing: .22em;
          text-transform: uppercase;
          padding: 5px 9px;
          border-radius: 999px;
          cursor: pointer;
          transition: color .2s ease, border-color .2s ease, background .2s ease;
          touch-action: manipulation;
        }
        .op-btn:disabled { opacity: .4; cursor: not-allowed; }
        .op-btn-approve:hover:not(:disabled) {
          color: rgba(116,200,140,1);
          border-color: rgba(116,200,140,.5);
          background: rgba(116,200,140,.06);
        }
        .op-btn-deny:hover:not(:disabled) {
          color: rgba(220,110,110,1);
          border-color: rgba(220,110,110,.5);
          background: rgba(220,110,110,.06);
        }

        .op-empty {
          text-align: center;
          padding: 28px 0;
          font-family: "Caveat","Bradley Hand",cursive;
          font-size: 18px;
          color: rgba(255,245,230,.4);
        }

        .op-close {
          position: fixed;
          top:   max(16px, calc(env(safe-area-inset-top) + 8px));
          right: max(16px, calc(env(safe-area-inset-right) + 8px));
          width: 36px; height: 36px;
          border: 0.5px solid rgba(255,245,230,.18);
          border-radius: 50%;
          background: rgba(0,0,0,.35);
          color: rgba(255,245,230,.4);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; line-height: 1;
          touch-action: manipulation;
          z-index: 1;
        }
        .op-close:hover { color: rgba(255,245,230,.9); border-color: rgba(255,245,230,.5); }

        /* Mobile — stack status + action buttons under the name so wide
           buttons don't push everything off-screen on narrow phones */
        @media (max-width: 480px) {
          .op-overlay { padding: 16px; }
          .op-card    { padding: 26px 18px 18px; gap: 14px; max-height: 88vh; }
          .op-title   { font-size: 28px; }
          .op-row {
            grid-template-columns: 32px 1fr;
            grid-template-areas:
              "avatar meta"
              "actions actions";
            row-gap: 8px;
            padding: 10px 11px;
          }
          .op-actions-stack {
            justify-content: flex-end;
            flex-wrap: wrap;
          }
          .op-status, .op-status-wrap { margin-left: auto; }
          .op-btn  { padding: 6px 10px; font-size: 9.5px; min-height: 30px; }
          .op-chip { padding: 6px 11px; font-size: 9.5px; min-height: 30px; }
        }
        @media (max-width: 360px) {
          .op-name  { font-size: 11.5px; }
          .op-email { font-size: 9.5px; }
        }
      `}</style>

      <button className="op-close" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close">×</button>

      <div className="op-card" onClick={(e) => e.stopPropagation()}>
        <div className="op-head">
          <h2 className="op-title">editor access</h2>
          <p className="op-sub">
            {pendingCount > 0 ? `${pendingCount} pending` : "no pending requests"}
            <button
              type="button"
              className="op-refresh"
              onClick={() => load(true)}
              disabled={loading}
              aria-label="Refresh list"
              title="Refresh"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M14 8a6 6 0 1 1-1.76-4.24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M14 2v3.5h-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </p>
        </div>

        <div className="op-filter">
          {["all", "pending", "approved", "denied"].map(k => (
            <button
              key={k}
              className={`op-chip ${filter === k ? "is-active" : ""}`}
              onClick={() => setFilter(k)}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="op-list">
          {loading ? (
            <p className="op-empty">loading…</p>
          ) : filtered.length === 0 ? (
            <p className="op-empty">nothing here</p>
          ) : (
            filtered.map(r => (
              <div key={r.email} className="op-row">
                <div className="op-avatar">
                  {r.image ? <img src={r.image} alt="" /> : (r.name?.[0] || r.email[0]).toUpperCase()}
                </div>
                <div className="op-meta">
                  <div className="op-name">{r.name || r.email.split("@")[0]}</div>
                  <div className="op-email">{r.email}</div>
                </div>
                {r.isOwner ? (
                  <div className="op-actions-stack">
                    <span className="op-status s-owner">owner</span>
                  </div>
                ) : (
                  <div className="op-actions-stack">
                    <span className={`op-status s-${r.status}`}>{STATUS_LABEL[r.status]}</span>
                    {r.status !== "approved" && (
                      <button
                        className="op-btn op-btn-approve"
                        disabled={busy === r.email}
                        onClick={() => update(r.email, "approved")}
                      >
                        allow
                      </button>
                    )}
                    {r.status !== "denied" && (
                      <button
                        className="op-btn op-btn-deny"
                        disabled={busy === r.email}
                        onClick={() => update(r.email, "denied")}
                      >
                        deny
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
