"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type BlurFadeProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
};

/**
 * Adapted for this portfolio from Magic UI's Blur Fade component on 21st.dev.
 * Source: https://21st.dev/community/components/magicui/blur-fade
 */
export function BlurFade({
  children,
  className,
  delay = 0,
  inView = true,
}: BlurFadeProps) {
  const reduceMotion = useReducedMotion();
  const motionProps = inView
    ? {
        initial: reduceMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 18, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-8%" },
      }
    : {
        initial: reduceMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 18, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      };

  return (
    <motion.div
      {...motionProps}
      transition={{ duration: reduceMotion ? 0 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

