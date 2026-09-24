"use client";

import { useRef, useState } from "react";

// Ends the browser session only after the editor's navigation guard permits leaving.
export function AdminLogout() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Keeps the editor open if clearing the session fails or the network is unavailable.
  async function signOut() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "DELETE" });
      if (!response.ok) throw new Error("Sign-out failed");
      window.location.replace("/admin");
    } catch {
      setError("Could not sign out. Please try again.");
      pending.current = false;
      setBusy(false);
    }
  }

  return <div className="admin-logout">
    <button type="button" className="admin-nav-item admin-logout-button" data-admin-navigation disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out"}</button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
