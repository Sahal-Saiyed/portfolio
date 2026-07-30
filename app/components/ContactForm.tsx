"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/sahalsyed144@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...payload,
            _subject: `Portfolio inquiry: ${payload.inquiry}`,
            _template: "table",
          }),
        },
      );

      if (!response.ok) throw new Error("Unable to send");
      setState("success");
      setMessage("Thanks — your message is on its way. I’ll reply as soon as I can.");
      form.reset();
    } catch {
      setState("error");
      setMessage(
        "The form could not send right now. Please email me directly at sahalsyed144@gmail.com.",
      );
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        className="honeypot"
        aria-hidden="true"
      />

      <div className="form-row">
        <label>
          <span>Your name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Jane Smith"
            required
          />
        </label>
        <label>
          <span>Email address</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="jane@company.com"
            required
          />
        </label>
      </div>

      <label>
        <span>What would you like to discuss?</span>
        <select name="inquiry" defaultValue="Job opportunity" required>
          <option>Job opportunity</option>
          <option>Freelance project</option>
          <option>Founder collaboration</option>
          <option>General inquiry</option>
        </select>
      </label>

      <label>
        <span>Message</span>
        <textarea
          name="message"
          rows={6}
          minLength={20}
          placeholder="Tell me about the role, project, or problem you’re working on…"
          required
        />
      </label>

      <div className="contact-form__footer">
        <button type="submit" disabled={state === "sending" || state === "success"}>
          {state === "sending" ? (
            <LoaderCircle className="spin" size={18} aria-hidden="true" />
          ) : state === "success" ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <Send size={17} aria-hidden="true" />
          )}
          {state === "sending"
            ? "Sending…"
            : state === "success"
              ? "Message sent"
              : "Send message"}
        </button>
        <p className={`form-status form-status--${state}`} aria-live="polite">
          {message}
        </p>
      </div>
    </form>
  );
}

