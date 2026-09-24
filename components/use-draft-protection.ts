"use client";

import { useEffect, useRef, type MouseEvent } from "react";

export const unsavedDraftMessage = "Save or discard your changes before leaving this workspace or opening another item.";

// Keeps unsaved drafts in this tab so browser history or an accepted reload can restore them.
export function useDraftRecovery<T>(key: string, snapshot: T, dirty: boolean, restore: (snapshot: T) => void) {
  const initialized = useRef("");
  const serialized = JSON.stringify(snapshot);
  useEffect(() => {
    const storageKey = `get2gether-draft-v1:${key}`;
    try {
      if (initialized.current !== key) {
        initialized.current = key;
        const stored = sessionStorage.getItem(storageKey);
        if (stored) { restore(JSON.parse(stored) as T); return; }
      }
      if (dirty) sessionStorage.setItem(storageKey, serialized);
      else sessionStorage.removeItem(storageKey);
    } catch {
      // Navigation guards remain active when the browser disables session storage.
    }
  }, [key, serialized, dirty, restore]);
}

// Applies the same reload, close and in-app navigation protection to every manager editor.
export function useDraftProtection(dirty: boolean, locked: boolean, notify: (message: string) => void) {
  useEffect(() => {
    // Uses the browser's native warning when a document is about to be unloaded.
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    if (dirty || locked) window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, locked]);

  // Keeps the current draft intact until the manager explicitly saves or discards it.
  function canLeave() {
    if (!dirty && !locked) return true;
    notify(locked ? "Wait until saving or uploading has finished." : unsavedDraftMessage);
    return false;
  }

  // Separate-tab previews do not replace the editor and can safely remain available.
  function protectNavigation(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest("[data-admin-navigation]")) {
      if (!canLeave()) { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    const link = (event.target as Element).closest("a");
    if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || link.hasAttribute("download")) return;
    const url = new URL(link.href, window.location.href);
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    if (!canLeave()) { event.preventDefault(); event.stopPropagation(); }
  }

  return { canLeave, protectNavigation };
}
