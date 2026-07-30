"use client";

import { motion, useReducedMotion } from "framer-motion";

const nodes = ["Data", "Retrieve", "Reason", "Validate", "Ship"];

export function HeroSystem() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="hero-system" aria-label="Applied AI workflow: data, retrieve, reason, validate, ship">
      <div className="hero-system__topline">
        <span>APPLIED_AI.SYSTEM</span>
        <span className="system-live">
          <span aria-hidden="true" /> LIVE
        </span>
      </div>
      <div className="hero-system__canvas">
        <div className="hero-system__grid" aria-hidden="true" />
        <div className="pipeline">
          {nodes.map((node, index) => (
            <div className="pipeline__step" key={node}>
              <motion.div
                className={`pipeline__node pipeline__node--${index + 1}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.35 + index * 0.12,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{node}</strong>
              </motion.div>
              {index < nodes.length - 1 && (
                <div className="pipeline__line" aria-hidden="true">
                  <motion.span
                    initial={reduceMotion ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.48 + index * 0.12, duration: 0.45 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="hero-system__caption">
          <span>Grounded systems</span>
          <span>Human-validated</span>
          <span>Product-minded</span>
        </div>
      </div>
    </div>
  );
}

