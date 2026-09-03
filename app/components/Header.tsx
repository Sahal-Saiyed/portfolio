"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

type HeaderProps = {
  overlayOnHero?: boolean;
};

export function Header({ overlayOnHero = false }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!overlayOnHero) return;

    const updateHeader = () => setHasScrolled(window.scrollY > 48);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, [overlayOnHero]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <header
      className={`site-header ${overlayOnHero && !hasScrolled ? "site-header--uncontained" : "site-header--contained"}`}
    >
      <Link className="brand-mark" href="/" aria-label="Muhammadsahal Saiyed, home">
        <span className="brand-mark__monogram">MS</span>
        <span className="brand-mark__copy">
          <strong>Muhammadsahal Saiyed</strong>
          <small>AI/ML Engineer</small>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <button
          className="resume-link desktop-resume !ml-0 cursor-pointer"
          onClick={() => window.dispatchEvent(new Event('open-shiori-chat'))}
          aria-label="Ask Shiori"
        >
          <div className="w-[22px] h-[22px] rounded-full overflow-hidden shrink-0 flex items-center justify-center -ml-1">
            <img src="/Eve-static.png" alt="" className="w-full h-full object-cover scale-[1.3] select-none" />
          </div>
          Ask Shiori
        </button>
        <a
          className="resume-link desktop-resume !ml-0"
          href="/Muhammadsahal_Saiyed_Resume.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Résumé <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </div>

      <button
        type="button"
        className="menu-button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>

      <div
        id="mobile-navigation"
        className={`mobile-nav ${open ? "mobile-nav--open" : ""}`}
      >
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <button
            className="mobile-resume-link text-left cursor-pointer"
            onClick={() => {
              window.dispatchEvent(new Event('open-shiori-chat'));
              setOpen(false);
            }}
          >
            Ask Shiori 
            <div className="w-[22px] h-[22px] rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              <img src="/Eve-static.png" alt="" className="w-full h-full object-cover scale-[1.3] select-none" />
            </div>
          </button>
          <a
            className="mobile-resume-link"
            href="/Muhammadsahal_Saiyed_Resume.pdf"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            Download résumé
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}
