"use client";

import { Rotate3D, RotateCcw, X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";
import type { StudioStationId } from "./AppliedIntelligenceStudio";

type SceneProps = {
  active: boolean;
  reduceMotion: boolean;
  selected: StudioStationId | null;
  resetSignal: number;
  onSelect: (station: StudioStationId | null) => void;
  onStageChange: (station: StudioStationId) => void;
};

const stations: Array<{
  id: StudioStationId;
  label: string;
  description: string;
  details: string[];
}> = [
  {
    id: "intake",
    label: "Input",
    description: "Raw ideas enter as incomplete signals, constraints, and possibilities.",
    details: ["User and business context", "Research and signal gathering", "Constraints, goals, and noise removal"],
  },
  {
    id: "context",
    label: "Context",
    description: "Evidence, domain knowledge, and structured data give the system something reliable to reason from.",
    details: ["Grounded retrieval", "Domain-aware context", "Structured information design"],
  },
  {
    id: "orchestration",
    label: "MS core",
    description: "The MS Orchestration Core plans the route and coordinates the entire system.",
    details: ["Problem framing", "Workflow planning", "Coordinated technical decisions"],
  },
  {
    id: "reasoning",
    label: "Reason",
    description: "Possible directions are challenged before an architecture is selected.",
    details: ["Architecture exploration", "Trade-off analysis", "Intentional technical decisions"],
  },
  {
    id: "assembly",
    label: "Build",
    description: "The strongest pieces become a complete, usable AI product—not an isolated model demo.",
    details: ["Models, agents, and data layers", "Interfaces and workflows", "End-to-end product engineering"],
  },
  {
    id: "validation",
    label: "Validate",
    description: "Failures return to the system as useful information and produce a stronger second iteration.",
    details: ["Evaluation and testing", "Human validation", "Revision before release"],
  },
  {
    id: "shipping",
    label: "Ship",
    description: "A product is only complete when it is deployed, observed, and ready to improve again.",
    details: ["Reliable deployment", "Outcome observation", "Product-minded iteration"],
  },
];

function StudioFallback() {
  return (
    <div className="studio-fallback" aria-hidden="true">
      <span className="studio-fallback__track studio-fallback__track--top" />
      <span className="studio-fallback__track studio-fallback__track--turn" />
      <span className="studio-fallback__track studio-fallback__track--middle" />
      <span className="studio-fallback__track studio-fallback__track--return" />
      <span className="studio-fallback__core"><strong>MS</strong><small>ORCHESTRATION CORE</small></span>
      <span className="studio-fallback__station studio-fallback__station--input" />
      <span className="studio-fallback__station studio-fallback__station--context" />
      <span className="studio-fallback__station studio-fallback__station--reason" />
      <span className="studio-fallback__station studio-fallback__station--build" />
      <span className="studio-fallback__station studio-fallback__station--validate" />
      <span className="studio-fallback__portal" />
    </div>
  );
}

export function HeroSystem() {
  const reduceMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [selected, setSelected] = useState<StudioStationId | null>(null);
  const [activeStation, setActiveStation] = useState<StudioStationId>("intake");
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "280px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!inView || Scene) return;
    let mounted = true;
    try {
      const canvas = document.createElement("canvas");
      const hasWebGl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
      if (hasWebGl) {
        void import("./AppliedIntelligenceStudio").then((module) => {
          if (mounted) setScene(() => module.AppliedIntelligenceStudio);
        });
      }
    } catch {
      setScene(null);
    }
    return () => {
      mounted = false;
    };
  }, [Scene, inView]);

  const selectedContent = stations.find((station) => station.id === selected);

  const resetView = () => {
    setSelected(null);
    setResetSignal((value) => value + 1);
  };

  return (
    <div className="studio-experience" ref={rootRef} aria-label="MS Orchestration Line: how Muhammadsahal plans, builds, validates, and ships reliable AI products">
      <div className="studio-experience__title" aria-hidden="true">
        <span>MS ORCHESTRATION LINE</span>
        <small><i /> PROCESS ACTIVE</small>
      </div>

      <div className="studio-controls">
        <span><Rotate3D size={14} aria-hidden="true" /> Drag · Ctrl/⌘-scroll to zoom</span>
        <button type="button" onClick={resetView} aria-label="Reset 3D studio view">
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>

      <div
        className="studio-canvas"
        aria-hidden="true"
        onWheelCapture={(event) => {
          if (!event.ctrlKey && !event.metaKey) event.stopPropagation();
        }}
      >
        {Scene ? (
          <Scene
            active={inView && pageVisible}
            reduceMotion={reduceMotion}
            selected={selected}
            resetSignal={resetSignal}
            onSelect={setSelected}
            onStageChange={setActiveStation}
          />
        ) : (
          <StudioFallback />
        )}
      </div>

      <div className="studio-station-nav" aria-label="Explore the MS Orchestration Line">
        {stations.map((station) => (
          <button
            type="button"
            key={station.id}
            className={`${activeStation === station.id ? "is-active" : ""} ${selected === station.id ? "is-selected" : ""}`}
            onClick={() => setSelected(station.id)}
          >
            <span />
            {station.label}
          </button>
        ))}
      </div>

      {selectedContent && (
        <aside className="studio-detail" aria-live="polite">
          <button type="button" className="studio-detail__close" onClick={() => setSelected(null)} aria-label="Close station details">
            <X size={16} aria-hidden="true" />
          </button>
          <p>{selectedContent.label}</p>
          <h3>{selectedContent.description}</h3>
          <ul>
            {selectedContent.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        </aside>
      )}

      <ol className="sr-only">
        {stations.map((station) => (
          <li key={station.id}>
            {station.label}. {station.description} {station.details.join(". ")}.
          </li>
        ))}
      </ol>
    </div>
  );
}
