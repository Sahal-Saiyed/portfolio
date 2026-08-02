"use client";

import { Check, CheckCircle2, ChevronDown, LoaderCircle, Send } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type FormState = "idle" | "sending" | "success" | "error";

const inquiryOptions = [
  "Job opportunity",
  "Freelance project",
  "Founder collaboration",
  "General inquiry",
];

function InquirySelect() {
  const [value, setValue] = useState(inquiryOptions[0]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setOpen(true);
      setActiveIndex((index) =>
        (index + direction + inquiryOptions.length) % inquiryOptions.length,
      );
      return;
    }

    if (open && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setValue(inquiryOptions[activeIndex]);
      setOpen(false);
    }
  }

  return (
    <div className={`select-field ${open ? "select-field--open" : ""}`} ref={rootRef}>
      <input type="hidden" name="inquiry" value={value} />
      <button
        type="button"
        className="select-field__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="inquiry-options"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <span>{value}</span>
        <ChevronDown size={17} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {open && (
        <div className="select-field__menu" id="inquiry-options" role="listbox">
          {inquiryOptions.map((option, index) => (
            <button
              type="button"
              id={`inquiry-option-${index}`}
              role="option"
              aria-selected={value === option}
              className={activeIndex === index ? "is-active" : ""}
              key={option}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                setValue(option);
                setActiveIndex(index);
                setOpen(false);
              }}
            >
              <span>{option}</span>
              {value === option && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <InquirySelect />
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
        <button
          type="submit"
          className="contact-form__submit"
          disabled={state === "sending" || state === "success"}
        >
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
