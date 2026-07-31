import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Mail,
  MapPin,
} from "lucide-react";
import type { Metadata } from "next";
import { BlurFade } from "./components/ui/BlurFade";
import { ContactForm } from "./components/ContactForm";
import { Header } from "./components/Header";
import { HeroSystem } from "./components/HeroSystem";
import { ProjectGrid } from "./components/ProjectGrid";
import { InteractiveHoverButton } from "./components/ui/InteractiveHoverButton";
import { capabilities, experience, projects } from "./data";

export const metadata: Metadata = {
  title: "Muhammadsahal Saiyed — AI/ML Engineer",
  description:
    "AI/ML Engineer in Ahmedabad building RAG systems, AI agents, multimodal applications, machine-learning products, and full-stack intelligent systems.",
};

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/Sahal-Saiyed",
    icon: Code2,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sahal-saiyed",
    icon: BriefcaseBusiness,
  },
  {
    label: "Email",
    href: "mailto:sahalsyed144@gmail.com",
    icon: Mail,
  },
];

export default function Home() {
  return (
    <main>
      <Header />

      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero__copy">
          <BlurFade inView={false}>
            <div className="availability-pill">
              <span aria-hidden="true" />
              Open to AI/ML opportunities
            </div>
          </BlurFade>

          <BlurFade inView={false} delay={0.08}>
            <p className="hero__kicker">Muhammadsahal Saiyed · AI/ML Engineer</p>
          </BlurFade>

          <BlurFade inView={false} delay={0.14}>
            <h1 id="hero-title">
              I build AI systems that move from{" "}
              <span className="headline-accent">models to real products.</span>
            </h1>
          </BlurFade>

          <BlurFade inView={false} delay={0.22}>
            <p className="hero__description">
              Applied AI engineer specializing in RAG, agentic workflows,
              multimodal systems, machine learning, and the product engineering
              that makes them useful.
            </p>
          </BlurFade>

          <BlurFade inView={false} delay={0.3}>
            <div className="hero__actions">
              <InteractiveHoverButton href="#work">
                Explore my work
              </InteractiveHoverButton>
              <a
                className="text-link"
                href="/Muhammadsahal_Saiyed_Resume.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Download résumé <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </BlurFade>

          <BlurFade inView={false} delay={0.36}>
            <div className="hero__location">
              <MapPin size={15} aria-hidden="true" />
              Ahmedabad, India
              <span aria-hidden="true">·</span>
              Remote
              <span aria-hidden="true">·</span>
              Open to relocation
            </div>
          </BlurFade>
        </div>

        <BlurFade inView={false} delay={0.18} className="hero__visual">
          <HeroSystem />
        </BlurFade>

        <a className="scroll-cue" href="#work">
          Selected work <ArrowDown size={14} aria-hidden="true" />
        </a>
      </section>

      <section className="metrics-strip" aria-label="Portfolio highlights">
        <div className="section-shell metrics-strip__inner">
          <div>
            <strong>4</strong>
            <span>featured systems</span>
          </div>
          <div>
            <strong>3</strong>
            <span>live products</span>
          </div>
          <div>
            <strong>1</strong>
            <span>freelance engagement</span>
          </div>
          <div>
            <strong>RAG → ML</strong>
            <span>end-to-end range</span>
          </div>
        </div>
      </section>

      <section id="work" className="section-shell section-block">
        <BlurFade>
          <div className="section-heading">
            <div>
              <p className="section-label">01 / Selected work</p>
              <h2>Systems designed around real problems.</h2>
            </div>
            <p>
              From grounded legal retrieval to NEEV AI POC workflows,
              multimodal generation, and revenue forecasting.
            </p>
          </div>
        </BlurFade>
        <BlurFade delay={0.08}>
          <ProjectGrid projects={projects} />
        </BlurFade>
      </section>

      <section className="capabilities-section section-block">
        <div className="section-shell">
          <BlurFade>
            <div className="section-heading section-heading--light">
              <div>
                <p className="section-label">02 / Engineering range</p>
                <h2>Useful AI needs more than a model.</h2>
              </div>
              <p>
                I work across the system—from data and retrieval to validation,
                APIs, product experience, and deployment.
              </p>
            </div>
          </BlurFade>

          <div className="capability-grid">
            {capabilities.map((capability, index) => (
              <BlurFade key={capability.title} delay={index * 0.08}>
                <article className="capability-card">
                  <span className="capability-card__number">
                    {capability.number}
                  </span>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                  <div className="capability-card__tags">
                    {capability.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="section-shell section-block">
        <BlurFade>
          <div className="section-heading">
            <div>
              <p className="section-label">03 / Experience</p>
              <h2>Building through practice.</h2>
            </div>
            <p>
              A foundation in computer engineering, strengthened through
              internships, deployment, hackathons, and paid client work.
            </p>
          </div>
        </BlurFade>

        <div className="experience-list">
          {experience.map((item, index) => (
            <BlurFade key={`${item.role}-${item.period}`} delay={index * 0.06}>
              <article className="experience-item">
                <span className="experience-item__period">{item.period}</span>
                <div>
                  <h3>{item.role}</h3>
                  <p className="experience-item__org">{item.organization}</p>
                </div>
                <p className="experience-item__detail">{item.detail}</p>
              </article>
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="about" className="about-section section-block">
        <div className="section-shell about-grid">
          <BlurFade className="about-section__heading">
            <p className="section-label">04 / About</p>
            <h2>
              Curious about the space between an AI demo and a dependable
              product.
            </h2>
          </BlurFade>

          <BlurFade delay={0.08} className="about-section__body">
            <p className="about-section__lead">
              I’m an AI/ML engineer based in Ahmedabad who enjoys building
              intelligent systems around real, domain-specific problems.
            </p>
            <p>
              My work spans retrieval-augmented generation, AI agents,
              multimodal applications, forecasting, and full-stack development.
              I care about the less visible engineering that makes AI useful:
              retrieval quality, validation, structured workflows, persistence,
              clear interfaces, and deployment.
            </p>
            <p>
              I’m open to remote AI/ML roles, willing to relocate for the right
              opportunity, and available for focused freelance collaborations
              with founders and product teams.
            </p>
            <a
              className="text-link"
              href="https://github.com/Sahal-Saiyed"
              target="_blank"
              rel="noreferrer"
            >
              Explore my GitHub <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </BlurFade>
        </div>
      </section>

      <section className="additional-work section-shell">
        <BlurFade>
          <article>
            <div>
              <p className="section-label">Additional work</p>
              <h3>HydroSense</h3>
            </div>
            <p>
              A machine-learning web application for predicting water
              potability from chemical and physical measurements using a Random
              Forest classifier.
            </p>
            <a
              href="https://hydrosense.streamlit.app/"
              target="_blank"
              rel="noreferrer"
              aria-label="Open HydroSense live application"
            >
              Live project <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
        </BlurFade>
      </section>

      <section id="contact" className="contact-section section-block">
        <div className="section-shell contact-grid">
          <BlurFade className="contact-section__intro">
            <p className="section-label">05 / Contact</p>
            <h2>Have a role, product idea, or difficult AI problem?</h2>
            <p>
              I’m open to AI/ML roles, remote opportunities, freelance projects,
              and collaborations with teams building useful intelligent
              products.
            </p>

            <div className="contact-links">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </BlurFade>

          <BlurFade delay={0.08}>
            <ContactForm />
          </BlurFade>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-shell site-footer__inner">
          <div>
            <strong>Muhammadsahal Saiyed</strong>
            <span>AI/ML Engineer · Ahmedabad, India</span>
          </div>
          <p>Designed around useful systems, thoughtful details, and real work.</p>
          <a href="#hero-title">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
