"use client";

import { FormEvent, useRef, useState } from "react";

// Signs a manager in through the HttpOnly session endpoint and reloads the protected page.
export function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  // Prevents duplicate submissions and distinguishes throttling from invalid credentials.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: data.get("username"), password: data.get("password") }) });
      if (response.ok) { window.location.reload(); return; }
      if (response.status === 429) {
        const seconds = Number(response.headers.get("Retry-After"));
        const minutes = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds / 60) : 15;
        setError(`Too many sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
      } else if (response.status === 503) {
        setError("Sign-in is temporarily unavailable. Please try again later.");
      } else {
        setError("Sign-in failed. Check your manager credentials.");
      }
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return <main className="admin-login"><h1>Get2Gether manager</h1><p>Sign in to manage the DIY product catalogue.</p><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>{error && <p role="alert">{error}</p>}</form></main>;
}
