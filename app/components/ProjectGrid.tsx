"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "../data";

/**
 * The tap-to-expand metadata interaction is adapted from Isaiah's
 * Animated Project Cards on 21st.dev.
 * Source: https://21st.dev/community/components/isaiahbjork/animated-project-cards
 */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="project-grid">
      {projects.map((project) => {
        const isExpanded = expanded === project.slug;
        return (
          <motion.article
            key={project.slug}
            layout={!reduceMotion}
            className={`project-card project-card--${project.accent} ${
              isExpanded ? "project-card--expanded" : ""
            }`}
          >
            <div className="project-card__visual">
              <div className="project-card__meta">
                <span>{project.index}</span>
                <span>{project.eyebrow}</span>
              </div>
              <Image
                src={project.image}
                alt={project.imageAlt}
                width={420}
                height={260}
                unoptimized
                className={`project-card__image project-card__image--${project.slug}`}
              />
              <div className="project-card__signal" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="project-card__body">
              <div>
                <div className="tag-row">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <h3>{project.shortTitle}</h3>
                <p>{project.summary}</p>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    className="project-card__details"
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="micro-label">Selected stack</span>
                    <div className="project-card__stack">
                      {project.stack.slice(0, 6).map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="project-card__actions">
                <Link href={`/work/${project.slug}`}>
                  View case study <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : project.slug)}
                >
                  {isExpanded ? "Less" : "Quick view"}
                  <ChevronDown
                    size={15}
                    className={isExpanded ? "rotate" : ""}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
