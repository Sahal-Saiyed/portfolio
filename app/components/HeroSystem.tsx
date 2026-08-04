"use client";

import { lazy, Suspense } from "react";

const AIWorkflowAnimation = lazy(() =>
  import("./AIWorkflowAnimation").then((module) => ({ default: module.AIWorkflowAnimation })),
);

export function HeroSystem() {
  return (
    <Suspense fallback={<div className="hero-intelligence-fallback" aria-hidden="true"><i /></div>}>
      <AIWorkflowAnimation interactive />
    </Suspense>
  );
}
