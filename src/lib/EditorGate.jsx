"use client";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import SignInModal from "@/components/features/SignInModal";
import OwnerPanel  from "@/components/features/OwnerPanel";

const EditorGateCtx = createContext({
  signedIn: false,
  isEditor: false,
  isOwner:  false,
  email:    null,
  pendingCount: 0,
  ensureEditor: () => false,
  openSignIn: () => {},
  openOwnerPanel: () => {},
  refreshPendingCount: () => {},
});

export function EditorGateProvider({ children }) {
  const { data: session, status } = useSession();
  const [modal, setModal] = useState(null); // null | "signin" | "not-editor" | "owner"
  const [pendingCount, setPendingCount] = useState(0);
  const polledRef = useRef(false);

  const signedIn = status === "authenticated" && !!session?.user;
  const email    = session?.user?.email   || null;
  const isEditor = !!session?.user?.isEditor;
  const isOwner  = !!session?.user?.isOwner;

  // Pull pending count from /api/auth/me whenever the owner signs in, on a
  // 20-second poll, when the tab regains focus, and after the owner panel
  // closes (so newly-requested or freshly-approved users show up live).
  const refreshPendingCount = useCallback(async () => {
    if (!isOwner) { setPendingCount(0); return; }
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const d = await r.json();
      setPendingCount(d.pendingCount || 0);
    } catch {}
  }, [isOwner]);

  // Any signed-in user: hit /api/auth/me once on mount. That endpoint
  // upserts a missing EditorAccess row defensively, guaranteeing they show
  // in the owner's panel even if the NextAuth signIn callback failed silently.
  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/auth/me", { cache: "no-store" }).catch(() => {});
  }, [signedIn]);

  // Owner only: live-poll the pending count.
  useEffect(() => {
    if (!isOwner) { polledRef.current = false; return; }
    refreshPendingCount();
    polledRef.current = true;

    const interval = setInterval(refreshPendingCount, 20_000);
    const onFocus  = () => refreshPendingCount();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [isOwner, refreshPendingCount]);

  const openSignIn    = useCallback(() => setModal("signin"),     []);
  const openNotEditor = useCallback(() => setModal("not-editor"), []);
  const openOwnerPanel = useCallback(() => setModal("owner"),     []);

  const ensureEditor = useCallback(() => {
    if (isEditor) return true;
    if (signedIn) openNotEditor();
    else          openSignIn();
    return false;
  }, [isEditor, signedIn, openSignIn, openNotEditor]);

  const closeModal = useCallback(() => {
    setModal(null);
    if (isOwner) refreshPendingCount();
  }, [isOwner, refreshPendingCount]);

  return (
    <EditorGateCtx.Provider value={{
      signedIn, isEditor, isOwner, email, pendingCount,
      ensureEditor, openSignIn, openOwnerPanel, refreshPendingCount,
    }}>
      {children}
      {modal === "signin"     && <SignInModal mode="signin"     email={email} onClose={closeModal} />}
      {modal === "not-editor" && <SignInModal mode="not-editor" email={email} onClose={closeModal} />}
      {modal === "owner"      && <OwnerPanel  onClose={closeModal} />}
    </EditorGateCtx.Provider>
  );
}

export function useEditorGate() {
  return useContext(EditorGateCtx);
}
