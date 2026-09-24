"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { Language } from "@/lib/language";
import type { SiteCopy } from "@/lib/site-content-schema";

type Props = {
  language: Language;
  content: SiteCopy["text"];
  kind: "review" | "inquiry";
  topic?: string;
  detailed?: boolean;
};

// Validates the form in the browser and shows success only after durable server storage.
export function ExperienceForm({
  language,
  kind,
  topic = "",
  detailed = false,
  content: t,
}: Props) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [rating, setRating] = useState(0);
  const submissionId = useRef<string | null>(null);

  // Keep the idempotency key for retries so a lost response cannot create duplicate requests.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setState("sending");
    submissionId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          language,
          kind,
          inquiryType: detailed ? "private" : "workshop",
          rating,
          submissionId: submissionId.current,
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "success")
    return (
      <div className="form-success" role="status">
        <span aria-hidden="true"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="m5 12 4 4L19 6" /></svg></span>
        <p>{kind === "review" ? t.reviewSuccess : t.success}</p>
      </div>
    );
  return (
    <form className="experience-form" onSubmit={submit}>
      <fieldset disabled={state === "sending"}>
        <div className="form-grid">
          <label htmlFor={`${id}-name`}>
            {t.name}
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              required
              maxLength={120}
            />
          </label>
          <label htmlFor={`${id}-email`}>
            {t.email}{kind === "review" && (language === "el" ? " (προαιρετικό)" : " (optional)")}
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required={kind === "inquiry"}
              maxLength={254}
            />
          </label>
          {kind === "inquiry" && (
            <>
              <label>
                {t.phone}
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                />
              </label>
              <label>
                {t.occasion}
                <input
                  name="topic"
                  defaultValue={topic}
                  maxLength={160}
                  required
                />
              </label>
            </>
          )}
          {detailed && (
            <>
              <label>
                {t.date}
                <input
                  name="date"
                  type="date"
                  min={new Date().toLocaleDateString("sv-SE")}
                  required
                />
              </label>
              <label>
                {t.guests}
                <input
                  name="guests"
                  type="number"
                  min="1"
                  max="500"
                  defaultValue="10"
                  required
                />
              </label>
              <label>
                {t.location}
                <input name="location" maxLength={200} required />
              </label>
              <label>
                {t.setting}
                <select name="setting" defaultValue="" required>
                  <option value="" disabled>
                    {t.choose}
                  </option>
                  <option value="outdoor">{t.outdoor}</option>
                  <option value="indoor">{t.indoor}</option>
                  <option value="either">{t.both}</option>
                </select>
              </label>
              <label>
                {t.budget}
                <input name="budget" type="number" min="0" max="100000" />
              </label>
              <label>
                {t.food}
                <select name="food" defaultValue="">
                  <option value="">{t.choose}</option>
                  {t.foodOptions.map((option, i) => (
                    <option
                      value={["brunch", "food", "drinks", "none"][i]}
                      key={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkbox-label wide">
                <input name="activity" type="checkbox" value="yes" />
                {t.activity}
              </label>
            </>
          )}
        </div>
        {kind === "review" && (
          <fieldset className="rating-field">
            <legend>{t.rating}</legend>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className={value <= rating ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    required
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    aria-label={`${value} ${t.ratingUnit}`}
                  />
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
                  </svg>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label htmlFor={`${id}-message`}>
          {kind === "review" ? t.experience : t.message}
          <textarea
            id={`${id}-message`}
            name="message"
            rows={4}
            required
            minLength={10}
            maxLength={5000}
          />
        </label>
        <label className="honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <p className="form-privacy">{t.privacy}{" "}<a href={`/privacy-policy?lang=${language}`} target="_blank" rel="noopener noreferrer">{t.navItems.find(item => item.href === "/privacy-policy")?.label}<span aria-hidden="true"> ↗</span><span className="sr-only">{language === "el" ? " (ανοίγει σε νέα καρτέλα)" : " (opens in a new tab)"}</span></a></p>
        {state === "error" && (
          <p className="form-error" role="alert">
            {t.error}
          </p>
        )}
        <button className="button" type="submit">
          {state === "sending"
            ? t.sending
            : kind === "review"
              ? t.reviewSubmit
              : t.submit}
          <Arrow />
        </button>
      </fieldset>
    </form>
  );
}

// Shared, accessible decorative arrow for calls to action and carousel controls.
export function Arrow({ reverse = false }: { reverse?: boolean }) {
  return (
    <svg
      className={reverse ? "arrow reverse" : "arrow"}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}
