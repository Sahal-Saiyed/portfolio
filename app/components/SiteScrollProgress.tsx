"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

export function SiteScrollProgress() {
  const animationFrameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      animationFrameRef.current = null;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const shouldShow = maxScroll > 120;
      const nextProgress = maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0;

      setProgress(nextProgress);
      setVisible(shouldShow);
      document.documentElement.classList.toggle("custom-scroll-ready", shouldShow);
    };

    const requestUpdate = () => {
      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      document.documentElement.classList.remove("custom-scroll-ready");
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="site-scroll-progress"
      style={{ "--site-scroll-progress": progress } as CSSProperties}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <i />
    </div>
  );
}
