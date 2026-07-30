import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlurFade } from "../../components/ui/BlurFade";
import { Header } from "../../components/Header";
import { projects } from "../../data";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};

  return {
    title: project.shortTitle,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const currentIndex = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <main className="case-study">
      <Header />

      <section className="case-hero section-shell">
        <BlurFade inView={false}>
          <Link className="back-link" href="/#work">
            <ArrowLeft size={16} aria-hidden="true" /> All selected work
          </Link>
        </BlurFade>

        <div className="case-hero__grid">
          <div>
            <BlurFade inView={false} delay={0.06}>
              <p className="section-label">
                {project.index} / {project.eyebrow}
              </p>
            </BlurFade>
            <BlurFade inView={false} delay={0.12}>
              <h1>{project.title}</h1>
            </BlurFade>
            <BlurFade inView={false} delay={0.18}>
              <p className="case-hero__summary">{project.summary}</p>
            </BlurFade>
            <BlurFade inView={false} delay={0.24}>
              <div className="case-hero__links">
                {project.links.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="case-primary-link"
                  >
                    <ExternalLink size={17} aria-hidden="true" /> Open live project
                  </a>
                )}
                {project.links.source && (
                  <a
                    href={project.links.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Code2 size={17} aria-hidden="true" /> View source
                  </a>
                )}
              </div>
            </BlurFade>
          </div>

          <BlurFade inView={false} delay={0.18}>
            <div
              className={`case-hero__visual case-hero__visual--${project.accent}`}
            >
              <div className="case-hero__visual-meta">
                <span>PROJECT / {project.index}</span>
                <span>SELECTED WORK</span>
              </div>
              <Image
                src={project.image}
                alt={project.imageAlt}
                width={480}
                height={300}
                unoptimized
                className={`case-hero__image case-hero__image--${project.slug}`}
                priority
              />
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="case-overview">
        <div className="section-shell case-overview__grid">
          <BlurFade>
            <div>
              <p className="section-label">Overview</p>
              <h2>From problem framing to a working system.</h2>
            </div>
          </BlurFade>
          <BlurFade delay={0.08}>
            <div className="case-overview__copy">
              <p className="case-overview__lead">{project.description}</p>
              <div>
                <span className="micro-label">My contribution</span>
                <p>{project.contribution}</p>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="section-shell case-content">
        <BlurFade>
          <div className="case-two-column">
            <article>
              <span className="case-number">01</span>
              <p className="section-label">The problem</p>
              <h2>What needed to change</h2>
              <p>{project.problem}</p>
            </article>
            <article>
              <span className="case-number">02</span>
              <p className="section-label">The solution</p>
              <h2>What I built</h2>
              <p>{project.solution}</p>
            </article>
          </div>
        </BlurFade>

        <BlurFade>
          <div className="architecture-panel">
            <div className="architecture-panel__heading">
              <div>
                <p className="section-label">System flow</p>
                <h2>How it works</h2>
              </div>
              <span>INPUT → VALIDATION → OUTPUT</span>
            </div>
            <div className="architecture-flow">
              {project.architecture.map((step, index) => (
                <div className="architecture-flow__step" key={step}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                  </div>
                  {index < project.architecture.length - 1 && (
                    <span className="architecture-flow__connector" aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </BlurFade>

        <div className="decisions-section">
          <BlurFade>
            <div className="section-heading">
              <div>
                <p className="section-label">Engineering decisions</p>
                <h2>The thinking behind the system.</h2>
              </div>
            </div>
          </BlurFade>
          <div className="decision-grid">
            {project.decisions.map((decision, index) => (
              <BlurFade key={decision.title} delay={index * 0.07}>
                <article className="decision-card">
                  <ShieldCheck size={21} aria-hidden="true" />
                  <h3>{decision.title}</h3>
                  <p>{decision.detail}</p>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>

        <div className="outcomes-grid">
          <BlurFade>
            <article className="outcomes-card">
              <p className="section-label">Delivered</p>
              <h2>What the system supports</h2>
              <ul>
                {project.results.map((result) => (
                  <li key={result}>
                    <Check size={17} aria-hidden="true" /> {result}
                  </li>
                ))}
              </ul>
            </article>
          </BlurFade>

          <BlurFade delay={0.08}>
            <article className="outcomes-card outcomes-card--muted">
              <p className="section-label">Honest scope</p>
              <h2>Current limitations</h2>
              <ul>
                {project.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </article>
          </BlurFade>
        </div>

        <BlurFade>
          <section className="stack-section">
            <p className="section-label">Technology</p>
            <div className="stack-list">
              {project.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            {project.links.extra && (
              <a
                href={project.links.extra.href}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {project.links.extra.label}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </section>
        </BlurFade>
      </section>

      <section className="next-project">
        <div className="section-shell">
          <p className="section-label">Next case study</p>
          <Link href={`/work/${nextProject.slug}`}>
            <span>{nextProject.index}</span>
            <strong>{nextProject.shortTitle}</strong>
            <ArrowUpRight size={28} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
