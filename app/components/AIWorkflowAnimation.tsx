"use client";

import { Canvas } from "@react-three/fiber";
import { motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { WorkflowBackgroundScene } from "./intelligence/WorkflowBackgroundScene";

export type AIWorkflowAnimationProps = {
  interactive?: boolean;
};

export function AIWorkflowAnimation({ interactive = true }: AIWorkflowAnimationProps) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      className="hero-intelligence-background"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <Canvas
        className="hero-intelligence-background__canvas"
        camera={{ position: [0, 0, 7.4], fov: 45, near: 0.1, far: 20 }}
        dpr={[1, 1.6]}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#05080e", 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <WorkflowBackgroundScene
          interactive={interactive && !reducedMotion}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </motion.div>
  );
}
