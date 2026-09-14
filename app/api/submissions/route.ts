import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

export const runtime = "nodejs";

// Accepts bounded, same-origin submissions; the schema is applied manually, never on request.
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Invalid content type" }, { status: 415 });
  }
  // Bound the stream before parsing to avoid buffering oversized public requests.
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ error: "Invalid request" }, { status: 400 });
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 24000) {
      await reader.cancel();
      return Response.json({ error: "Request too large" }, { status: 413 });
    }
    chunks.push(value);
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Invalid object");
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { kind, language, submissionId, rating } = body;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (
    body.website ||
    !["inquiry", "review"].includes(String(kind)) ||
    !["el", "en"].includes(String(language)) ||
    typeof submissionId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      submissionId,
    ) ||
    !name ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    message.length < 10 ||
    message.length > 5000 ||
    (kind === "review" &&
      (!Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5))
  ) {
    return Response.json({ error: "Invalid fields" }, { status: 400 });
  }
  const details: Record<string, string> = {};
  for (const key of [
    "phone",
    "topic",
    "date",
    "guests",
    "location",
    "setting",
    "budget",
    "food",
    "activity",
  ]) {
    if (
      body[key] !== undefined &&
      (typeof body[key] !== "string" || (body[key] as string).length > 200)
    ) {
      return Response.json({ error: "Invalid details" }, { status: 400 });
    }
    if (typeof body[key] === "string")
      details[key] = (body[key] as string).trim();
  }
  if (
    (kind === "inquiry" && !details.topic) ||
    (details.guests &&
      (!/^\d+$/.test(details.guests) ||
        Number(details.guests) < 1 ||
        Number(details.guests) > 500)) ||
    (details.budget &&
      (!/^\d+(\.\d{1,2})?$/.test(details.budget) ||
        Number(details.budget) > 100000)) ||
    (details.date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(details.date) ||
        Number.isNaN(Date.parse(details.date)) ||
        details.date < new Date().toLocaleDateString("sv-SE"))) ||
    (details.setting &&
      !["outdoor", "indoor", "either"].includes(details.setting)) ||
    (details.food &&
      !["brunch", "food", "drinks", "none"].includes(details.food)) ||
    (details.activity && details.activity !== "yes")
  ) {
    return Response.json({ error: "Invalid details" }, { status: 400 });
  }
  const databasePath =
    process.env.GET2GETHER_DATABASE_PATH || "./data/get2gether.sqlite";
  if (!existsSync(databasePath))
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  let db: DatabaseSync | undefined;
  try {
    db = new DatabaseSync(databasePath);
    db.exec("PRAGMA busy_timeout = 5000; BEGIN IMMEDIATE");
    const existing = db
      .prepare("SELECT id FROM submissions WHERE id = ? AND email = ?")
      .get(submissionId, email);
    if (existing) {
      db.exec("COMMIT");
      return Response.json({ saved: true });
    }
    const count = db
      .prepare(
        "SELECT count(*) AS total FROM submissions WHERE email = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hour')",
      )
      .get(email) as { total: number };
    if (count.total >= 5) {
      db.exec("ROLLBACK");
      return Response.json(
        { error: "Please try again later" },
        { status: 429 },
      );
    }
    db.prepare(
      "INSERT INTO submissions (id, kind, language, name, email, message, rating, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      submissionId,
      String(kind),
      String(language),
      name,
      email,
      message,
      kind === "review" ? Number(rating) : null,
      JSON.stringify(details),
    );
    db.exec("COMMIT");
    return Response.json({ saved: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  } finally {
    db?.close();
  }
}
