"use client";

import { FormEvent, useState } from "react";

// Signs a manager in through the HttpOnly session endpoint and reloads the protected page.
export function AdminLogin() {
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: data.get("username"), password: data.get("password") }) });
    if (!response.ok) { setError("Sign-in failed. Check your manager credentials."); return; }
    window.location.reload();
  }
  return <main className="admin-login"><h1>Get2Gether manager</h1><p>Sign in to manage the DIY product catalogue.</p><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">Sign in</button>{error && <p role="alert">{error}</p>}</form></main>;
}
