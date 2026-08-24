"use client";

import { useEffect, useRef, useState } from "react";

const SHOW_MS = 11800;
const EXIT_MS = 550;
const CONF_END_MS = 6900;
const RING_START_MS = 9550;
const RING_END_MS = 11350;
const STORAGE_KEY = "preloader-shown";

type Phase = "idle" | "run" | "exit";

const LAYERS = [
  { x: 400, n: 6 },
  { x: 560, n: 8 },
  { x: 720, n: 8 },
  { x: 880, n: 6 },
];

function nodeY(i: number, n: number) {
  return 330 + (i - (n - 1) / 2) * 46;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const portalAnchorRef = useRef<HTMLDivElement>(null);
  const confRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let skip = false;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        skip = true;
      } else {
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
      if (
        !skip &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        skip = true;
      }
    } catch {
      skip = true;
    }
    if (skip) return;

    document.documentElement.classList.add("pldr-lock");

    const startTimer = setTimeout(() => setPhase("run"), 0);
    const exitTimer = setTimeout(() => setPhase("exit"), SHOW_MS - EXIT_MS);
    const doneTimer = setTimeout(() => {
      document.documentElement.classList.remove("pldr-lock");
      setPhase("idle");
    }, SHOW_MS);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.documentElement.classList.remove("pldr-lock");
    };
  }, []);

  useEffect(() => {
    if (phase === "idle") return;
    const vp = viewportRef.current;
    if (!vp) return;

    const fit = () => {
      const s = Math.min(window.innerWidth / 1240, window.innerHeight / 740);
      vp.style.transform = `translate(-50%, -50%) scale(${s.toFixed(4)})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [phase]);

  useEffect(() => {
    if (phase === "idle") return;
    const el = confRef.current;
    if (!el) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const t = Math.min((performance.now() - start) / CONF_END_MS, 1);
      el.textContent = `conf ${(easeInOutCubic(t) * 0.992).toFixed(3)}`;
      if (t >= 1) window.clearInterval(id);
    }, 130);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "idle") return;
    const anchor = portalAnchorRef.current;
    const backdrop = backdropRef.current;
    const vp = viewportRef.current;
    if (!anchor || !backdrop || !vp) return;

    let raf = 0;
    let disposed = false;
    const start = performance.now();

    const applyHole = (cx: number, cy: number, r: number) => {
      const img = `radial-gradient(circle at ${cx.toFixed(1)}px ${cy.toFixed(1)}px, transparent ${Math.max(r * 0.88, 0).toFixed(1)}px, rgb(0, 0, 0) ${(r * 0.995).toFixed(1)}px)`;
      backdrop.style.maskImage = img;
      backdrop.style.webkitMaskImage = img;
      vp.style.maskImage = img;
      vp.style.webkitMaskImage = img;
    };

    applyHole(-9999, -9999, 0);

    const tick = (now: number) => {
      if (disposed) return;
      const t = now - start;
      const rect = anchor.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const ring = rootRef.current?.querySelectorAll<SVGCircleElement>("[data-oring]");
      if (t >= RING_START_MS) {
        const p = Math.min(
          (t - RING_START_MS) / (RING_END_MS - RING_START_MS),
          1
        );
        const grown = easeInOutCubic(p);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const r =
          14 +
          grown * (Math.hypot(vw, vh) * 0.68 - 14);
        ring?.forEach((c) => {
          c.setAttribute("r", r.toFixed(1));
          c.setAttribute("cx", cx.toFixed(1));
          c.setAttribute("cy", cy.toFixed(1));
        });
        applyHole(cx, cy, r * 0.94);
      }
      if (t < RING_END_MS + 400) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, [phase]);

  if (phase === "idle") return null;

  const stubs = [0, 1, 2, 3, 4].map((i) => ({
    x1: 332,
    y1: 240 + i * 45,
    x2: LAYERS[0].x,
    y2: nodeY(i, LAYERS[0].n),
  }));

  const chain = [
    ...LAYERS.map((l) => ({ x: l.x, n: l.n })),
    { x: 1040, n: 5 },
  ];

  const edges: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    l: number;
  }> = [];

  for (let li = 0; li < chain.length - 1; li++) {
    const a = chain[li];
    const b = chain[li + 1];
    for (let i = 0; i < a.n; i++) {
      for (let j = 0; j < b.n; j++) {
        edges.push({
          x1: a.x,
          y1: nodeY(i, a.n),
          x2: b.x,
          y2: nodeY(j, b.n),
          l: li,
        });
      }
    }
  }

  const allLinks = [
    ...stubs.map((s) => ({ ...s, l: -1 })),
    ...edges,
  ];

  const W1 = [2.65, 3.15, 3.65, 4.15, 4.65];
  const W2 = [4.75, 5.25, 5.75, 6.25, 6.75];

  return (
    <div
      ref={rootRef}
      className={`pldr${phase === "exit" ? " pldr--exit" : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <div ref={backdropRef} className="pldr__backdrop" aria-hidden="true" />

      <div ref={viewportRef} className="pldr__viewport">
        <div className="pldr__world">
          <svg className="pldr__net" width="1200" height="700" viewBox="0 0 1200 700" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="pldr-spark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffdf9e" />
                <stop offset="0.5" stopColor="#e8925a" />
                <stop offset="1" stopColor="#c96f3f" />
              </linearGradient>
            </defs>

            {allLinks.map((e, i) => (
              <g key={`l${i}`}>
                <line
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  pathLength={1}
                  className="pldr__link"
                  style={{ "--d": `${0.35 + Math.max(e.l, 0) * 0.26 + ((i * 29) % 18) / 100}s` } as React.CSSProperties}
                />
                <line
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  pathLength={1}
                  className="pldr__pulse"
                  style={
                    {
                      "--w1": `${W1[Math.max(e.l, 0)] + ((i * 37) % 30) / 100}s`,
                      "--w2": `${W2[Math.max(e.l, 0)] + ((i * 53) % 30) / 100}s`,
                    } as React.CSSProperties
                  }
                />
              </g>
            ))}

            {LAYERS.map((l, li) =>
              Array.from({ length: l.n }, (_, i) => (
                <circle
                  key={`n${li}-${i}`}
                  cx={l.x}
                  cy={nodeY(i, l.n)}
                  r="7"
                  className="pldr__node"
                  style={{ "--f1": `${W1[li + 1]}s`, "--f2": `${W2[li + 1]}s` } as React.CSSProperties}
                />
              ))
            )}

            {[192, 261, 330, 399, 468].map((y, i) => (
              <circle
                key={`o${i}`}
                cx={1040}
                cy={y}
                r={i === 2 ? 11 : 7}
                className={`pldr__node pldr__node--out${i === 2 ? " pldr__node--winner" : ""}`}
                style={{ "--f1": `${W1[4]}s`, "--f2": `${W2[4]}s` } as React.CSSProperties}
              />
            ))}
          </svg>

          {LAYERS.map((l, li) => (
            <span
              key={`lab${li}`}
              className="pldr__layer-label"
              style={{ left: l.x - 60 }}
            >
              {["dense · 128", "dense · 64", "relu", "hidden"][li]}
            </span>
          ))}
          <span className="pldr__layer-label" style={{ left: 980 }}>
            softmax
          </span>

          <div className="pldr__specimen">
            <div className="pldr__scanline" />
            <img
              src="/monogram.png"
              alt="MS monogram"
              className="pldr__monogram"
              aria-hidden="true"
            />
          </div>
          <span className="pldr__specimen-label">specimen · ms_00</span>
          <span className="pldr__layer-label pldr__layer-label--input">input · 400px</span>

          <div className="pldr__winner-rings" aria-hidden="true">
            <i />
            <i />
          </div>

          <div className="pldr__verdict">
            <strong>MS · 99.2%</strong>
            <span>Muhammadsahal Saiyed — AI/ML Engineer</span>
          </div>

          <div ref={portalAnchorRef} className="pldr__anchor" aria-hidden="true" />
        </div>
      </div>

      <svg className="pldr__portalfx" width="100%" height="100%" aria-hidden="true">
        <circle data-oring r="14" className="pldr__oring pldr__oring--glow" fill="none" stroke="url(#pldr-spark)" strokeWidth="18" strokeOpacity="0.22" />
        <circle data-oring r="14" className="pldr__oring pldr__oring--main" fill="none" stroke="url(#pldr-spark)" strokeWidth="6" />
        <circle data-oring r="14" className="pldr__oring pldr__oring--s1" fill="none" stroke="#ffdf9e" strokeWidth="2.5" strokeDasharray="34 130" />
        <circle data-oring r="14" className="pldr__oring pldr__oring--s2" fill="none" stroke="#e8925a" strokeWidth="1.5" strokeDasharray="16 210" />
      </svg>

      <div className="pldr__hud" aria-hidden="true">
        <span className="pldr__hud-item pldr__hud-item--tl">mnist-net · inference</span>
        <span className="pldr__hud-item pldr__hud-item--tr">fwd 2/2 · softmax</span>
        <span className="pldr__hud-item pldr__hud-item--bl">
          <span ref={confRef}>conf 0.310</span>
        </span>
        <span className="pldr__hud-item pldr__hud-item--br">portfolio © 2026</span>
      </div>
    </div>
  );
}
