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

  // Pull pending count from /api/auth/me whenever the owner signs in or the
  // owner panel is closed (so a fresh approval updates the badge dot).
  const refreshPendingCount = useCallback(async () => {
    if (!isOwner) { setPendingCount(0); return; }
    try {
      const r = await fetch("/api/auth/me");
      const d = await r.json();
      setPendingCount(d.pendingCount || 0);
    } catch {}
  }, [isOwner]);

  useEffect(() => {
    if (isOwner && !polledRef.current) {
      polledRef.current = true;
      refreshPendingCount();
    }
    if (!isOwner) polledRef.current = false;
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
