import {
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
    value: "@Sahal-Saiyed",
    href: "https://github.com/Sahal-Saiyed",
    icon: Code2,
  },
  {
    label: "LinkedIn",
    value: "sahal-saiyed",
    href: "https://www.linkedin.com/in/sahal-saiyed",
    icon: BriefcaseBusiness,
  },
  {
    label: "Email",
    value: "sahalsyed144@gmail.com",
    href: "mailto:sahalsyed144@gmail.com",
    icon: Mail,
  },
];

const footerLinks = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Home() {
  return (
    <main>
      <Header />

      <section id="top" className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero__copy">
          <BlurFade inView={false}>
            <p className="hero__kicker">Muhammadsahal Saiyed · Applied AI</p>
          </BlurFade>

          <BlurFade inView={false} delay={0.08}>
            <h1 id="hero-title">
              AI/ML Engineer building{" "}
              <span className="headline-accent">reliable intelligent products.</span>
            </h1>
          </BlurFade>

          <BlurFade inView={false} delay={0.16}>
            <p className="hero__description">
              I design and ship RAG systems, AI agents, multimodal applications,
              and machine-learning products—from model logic to deployed user
              experiences.
            </p>
          </BlurFade>

          <BlurFade inView={false} delay={0.24}>
            <div className="hero__actions">
              <InteractiveHoverButton href="#work">
                View selected work
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

          <BlurFade inView={false} delay={0.3}>
            <div className="hero__meta">
              <div className="availability-pill">
                <span aria-hidden="true" />
                Open to roles &amp; selected freelance work
              </div>
              <div className="hero__location">
                <MapPin size={15} aria-hidden="true" />
                Ahmedabad, India
                <span aria-hidden="true">·</span>
                Remote
                <span aria-hidden="true">·</span>
                Open to relocation
              </div>
            </div>
          </BlurFade>
        </div>

        <BlurFade inView={false} delay={0.18} className="hero__visual">
          <HeroSystem />
        </BlurFade>

      </section>

      <section id="work" className="work-section section-shell section-block section-block--first">
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

        <div className="additional-work">
          <BlurFade>
            <article>
              <div>
                <p className="section-label">More work</p>
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
        </div>
      </section>

      <section id="experience" className="experience-section section-shell section-block">
        <BlurFade>
          <div className="section-heading">
            <div>
              <p className="section-label">02 / Experience</p>
              <h2>Experience grounded in shipped work.</h2>
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

      <section id="capabilities" className="capabilities-section section-block">
        <div className="section-shell">
          <BlurFade>
            <div className="section-heading section-heading--light">
              <div>
                <p className="section-label">03 / Engineering range</p>
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
            <div className="about-availability" aria-label="Current availability">
              <span>Full-time AI/ML roles</span>
              <span>Remote opportunities</span>
              <span>Selected freelance work</span>
            </div>
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

      <section id="contact" className="contact-section section-block">
        <div className="section-shell contact-grid">
          <BlurFade className="contact-section__intro">
            <p className="section-label">05 / Contact</p>
            <h2>Let’s build something useful.</h2>
            <p>
              Whether you’re hiring for an AI/ML role or exploring a focused
              product collaboration, tell me what you’re working on.
            </p>

            <a className="contact-email" href="mailto:sahalsyed144@gmail.com">
              <span>Email me directly</span>
              <strong>sahalsyed144@gmail.com</strong>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>

            <div className="contact-links">
              {socialLinks.filter(({ label }) => label !== "Email").map(({ label, value, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>
                    <strong>{label}</strong>
                    <small>{value}</small>
                  </span>
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
          <div className="site-footer__main">
            <div className="site-footer__identity">
              <strong>Muhammadsahal Saiyed</strong>
              <p>AI/ML Engineer building dependable intelligent products.</p>
              <a href="mailto:sahalsyed144@gmail.com">sahalsyed144@gmail.com</a>
            </div>

            <nav className="site-footer__nav" aria-label="Footer navigation">
              <span>Navigate</span>
              {footerLinks.map((link) => (
                <a key={link.href} href={link.href}>{link.label}</a>
              ))}
            </nav>

            <div className="site-footer__connect">
              <span>Connect</span>
              <a href="https://github.com/Sahal-Saiyed" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/sahal-saiyed" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <a href="/Muhammadsahal_Saiyed_Resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a>
            </div>
          </div>

          <div className="site-footer__bottom">
            <span>© 2026 Muhammadsahal Saiyed</span>
            <span>Ahmedabad, India · Open to remote work</span>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
