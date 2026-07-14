import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  GitHub,
  Linkedin,
  Mail,
  ExternalLink,
  Circle,
  X,
} from "lucide-react";
/**
 * PORTFOLIO — "Schematic" concept, interactive pass
 * - Scroll-spy nav with a sliding underline
 * - A signal dot that travels the trace line as you scroll
 * - Skill bars that charge up when they enter view
 * - Filterable project grid (click a tech tag to filter)
 * - Expandable project cards with a subtle tilt-on-hover
 * All motion respects prefers-reduced-motion.
 *
 * >>> Replace the CONTENT object below with your own details. <<<
 */

const CONTENT = {
  name: "Your Name",
  role: "Software Developer",
  location: "Nairobi, Kenya",
  status: "Open to work",
  tagline:
    "I build reliable web applications end to end — from data models to the pixels people touch.",
  about:
    "I'm a developer who likes taking a problem apart until it's simple enough to build. Most of my work sits at the intersection of backend systems and the interfaces people actually use — I care as much about a clean API as I do about a button that feels right under your thumb. When I'm not shipping, I'm usually reading about distributed systems or tinkering with something electronic.",
  email: "you@example.com",
  github: "https://github.com/yourhandle",
  linkedin: "https://linkedin.com/in/yourhandle",
  skills: [
    {
      group: "Languages",
      items: [
        { name: "JavaScript / TypeScript", level: 90 },
        { name: "Python", level: 80 },
        { name: "SQL", level: 75 },
      ],
    },
    {
      group: "Frameworks",
      items: [
        { name: "React", level: 90 },
        { name: "Node.js / Express", level: 80 },
        { name: "Django", level: 65 },
      ],
    },
    {
      group: "Tools",
      items: [
        { name: "Git / CI-CD", level: 85 },
        { name: "Docker", level: 70 },
        { name: "PostgreSQL", level: 75 },
      ],
    },
  ],
  projects: [
    {
      code: "PRJ-01",
      title: "Project One",
      description:
        "A short, concrete description of what this project does and the problem it solves — written for someone skimming, not someone who already knows the backstory.",
      details:
        "Add more depth here: the architecture decisions, the trade-offs you made, and what you'd do differently next time. This shows only when the card is expanded, so it's a good place for the details a recruiter would dig for.",
      stack: ["React", "Node.js", "PostgreSQL"],
      link: "#",
    },
    {
      code: "PRJ-02",
      title: "Project Two",
      description:
        "What it is, who it's for, and the one decision you're proudest of. Keep it to two sentences — the tech tags below carry the rest.",
      details:
        "Expanded detail for project two. Mention scale, performance numbers, or a specific hard problem you solved — concrete specifics read better than adjectives.",
      stack: ["TypeScript", "Next.js", "Redis"],
      link: "#",
    },
    {
      code: "PRJ-03",
      title: "Project Three",
      description:
        "A third project entry. Swap in real names, links, and screenshots as you build this out — placeholders are just here to hold the layout.",
      details:
        "Expanded detail for project three. This is also a good spot for a link to a demo video or a case-study write-up if you have one.",
      stack: ["Python", "Django", "Docker"],
      link: "#",
    },
  ],
  experience: [
    {
      period: "2024 — Present",
      role: "Software Developer",
      org: "Company Name",
      note: "One line on scope or impact — what you owned, what changed.",
    },
    {
      period: "2022 — 2024",
      role: "Junior Developer",
      org: "Previous Company",
      note: "One line on scope or impact.",
    },
    {
      period: "2021 — 2022",
      role: "Intern",
      org: "Earlier Company",
      note: "One line on what you learned or shipped.",
    },
  ],
};

const NAV_ITEMS = ["About", "Skills", "Projects", "Experience", "Contact"];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function SectionMarker({ index, label }) {
  return (
    <div className="flex items-center gap-3 mb-8 md:mb-10">
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: 34,
          height: 34,
          border: "1.5px solid var(--copper)",
          background: "var(--paper-2)",
          color: "var(--copper)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
        }}
      >
        {index}
      </div>
      <h2
        className="tracking-wide uppercase"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "clamp(18px, 2.2vw, 22px)",
          letterSpacing: "0.08em",
          color: "var(--ink)",
        }}
      >
        {label}
      </h2>
      <div className="flex-1 hidden sm:block" style={{ height: 1, background: "var(--grid)" }} />
    </div>
  );
}

function MountHoles() {
  const pos = [
    { top: 10, left: 10 },
    { top: 10, right: 10 },
    { bottom: 10, left: 10 },
    { bottom: 10, right: 10 },
  ];
  return pos.map((p, i) => (
    <span
      key={i}
      className="absolute rounded-full"
      style={{ ...p, width: 8, height: 8, border: "1.5px solid var(--grid)" }}
    />
  ));
}

function SkillBar({ name, level, animate }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span>{name}</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--ink-soft)",
          }}
        >
          {animate ? level : 0}%
        </span>
      </div>
      <div style={{ height: 5, background: "var(--grid)", borderRadius: 2, overflow: "hidden" }}>
        <div
          className="skill-fill"
          style={{
            height: "100%",
            width: animate ? `${level}%` : "0%",
            background: "var(--copper)",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project, expanded, onToggle, dimmed, reducedMotion }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
  };
  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className="proj-card relative border p-5 block cursor-pointer"
      style={{
        borderColor: expanded ? "var(--copper)" : "var(--grid)",
        background: "var(--paper-2)",
        opacity: dimmed ? 0.4 : 1,
        transitionProperty: "opacity, border-color, transform",
      }}
    >
      <MountHoles />
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--copper)" }}>
          {project.code}
        </span>
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open ${project.title}`}
        >
          <ExternalLink size={14} color="var(--ink-soft)" />
        </a>
      </div>
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 17 }} className="mb-2">
        {project.title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }} className="mb-3">
        {project.description}
      </p>

      <div
        style={{
          maxHeight: expanded ? 200 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--ink-soft)",
            borderTop: "1px dashed var(--grid)",
            paddingTop: 10,
            marginBottom: 12,
          }}
        >
          {project.details}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 rounded-sm"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                border: "1px solid var(--grid)",
                color: "var(--ink-soft)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--teal)",
          }}
        >
          {expanded ? "− less" : "+ more"}
        </span>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState("About");
  const [scrollPct, setScrollPct] = useState(0);
  const [skillsInView, setSkillsInView] = useState(false);
  const [projectFilter, setProjectFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const reducedMotion = useReducedMotion();
  const sectionRefs = useRef({});
  const skillsSectionRef = useRef(null);

  const allTags = useMemo(() => {
    const s = new Set();
    CONTENT.projects.forEach((p) => p.stack.forEach((t) => s.add(t)));
    return ["All", ...Array.from(s)];
  }, []);

  const filteredProjects = useMemo(() => {
    if (projectFilter === "All") return CONTENT.projects;
    return CONTENT.projects.filter((p) => p.stack.includes(projectFilter));
  }, [projectFilter]);

  // scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.dataset.section);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.toLowerCase());
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // skills reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSkillsInView(true);
      },
      { threshold: 0.25 }
    );
    if (skillsSectionRef.current) observer.observe(skillsSectionRef.current);
    return () => observer.disconnect();
  }, []);

  // scroll progress for the trace signal dot
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
        setScrollPct(pct);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopyEmail = () => {
    if (navigator?.clipboard) navigator.clipboard.writeText(CONTENT.email).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "'IBM Plex Sans', sans-serif",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        :root {
          --paper: #EDE6D6;
          --paper-2: #F7F3EA;
          --ink: #23272B;
          --ink-soft: #5A5347;
          --copper: #B87333;
          --teal: #2F6F6B;
          --grid: #C9BFA8;
        }
        html { scroll-behavior: smooth; }
        .schem-bg {
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 28px 28px;
          background-position: -1px -1px;
          opacity: 0.35;
        }
        .trace-line {
          position: absolute;
          left: 33px;
          top: 0;
          bottom: 0;
          width: 1.5px;
          background: repeating-linear-gradient(
            to bottom,
            var(--copper) 0px, var(--copper) 5px,
            transparent 5px, transparent 10px
          );
          opacity: 0.5;
        }
        .signal-dot {
          position: absolute;
          left: 33px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 0 4px rgba(47,111,107,0.15);
          transform: translate(-50%, -50%);
          transition: top 0.1s linear;
        }
        .nav-link { position: relative; padding-bottom: 4px; color: var(--ink-soft); }
        .nav-link.active { color: var(--copper); }
        .nav-link::after {
          content: ""; position: absolute; left: 0; right: 100%; bottom: 0;
          height: 1.5px; background: var(--copper);
          transition: right 0.25s ease;
        }
        .nav-link.active::after { right: 0; }
        .tag-chip { transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; cursor: pointer; }
        a, button { transition: color 0.15s ease, border-color 0.15s ease, transform 0.15s ease; }
        a:focus-visible, button:focus-visible, [role="button"]:focus-visible {
          outline: 2px solid var(--teal); outline-offset: 2px;
        }
        .proj-card { transition: opacity 0.25s ease, border-color 0.15s ease, transform 0.15s ease; }
        .skill-fill { transition: width 1s cubic-bezier(0.16,1,0.3,1); }
        .role-cursor::after {
          content: "▌"; margin-left: 4px; color: var(--copper);
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .proj-card { transition: none !important; transform: none !important; }
          .skill-fill { transition: none; }
          .role-cursor::after { animation: none; }
          .signal-dot { transition: none; }
        }
      `}</style>

      <div className="schem-bg absolute top-0 left-0 right-0" style={{ height: 520, pointerEvents: "none" }} />

      {/* NAV */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: "rgba(237,230,214,0.92)", backdropFilter: "blur(6px)", borderBottom: "1px solid var(--grid)" }}
      >
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 14, letterSpacing: "0.04em" }}>
          {CONTENT.name.toUpperCase()}
        </span>
        <div className="hidden sm:flex gap-6" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.05em" }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`nav-link uppercase ${active === item ? "active" : ""}`}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 md:px-12">
        <div className="trace-line hidden md:block" />
        <div className="signal-dot hidden md:block" style={{ top: `${scrollPct}%` }} />

        {/* HERO */}
        <header className="relative pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-[1.3fr,1fr] gap-10 items-start">
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--copper)", fontSize: 13, letterSpacing: "0.1em" }} className="uppercase mb-4 role-cursor">
                // {CONTENT.role}
              </p>
              <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.05, color: "var(--ink)" }}>
                {CONTENT.name}
              </h1>
              <p className="mt-6 max-w-md" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-soft)" }}>
                {CONTENT.tagline}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <a href="#projects" className="px-5 py-2.5 rounded-sm text-sm" style={{ background: "var(--ink)", color: "var(--paper-2)", fontFamily: "'JetBrains Mono', monospace" }}>
                  View projects
                </a>
                <a href="#contact" className="px-5 py-2.5 rounded-sm text-sm border" style={{ borderColor: "var(--ink)", color: "var(--ink)", fontFamily: "'JetBrains Mono', monospace" }}>
                  Get in touch
                </a>
              </div>
            </div>

            <div className="relative border p-5" style={{ borderColor: "var(--grid)", background: "var(--paper-2)" }}>
              <MountHoles />
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-soft)" }} className="uppercase mb-3 pb-2 border-b">
                Spec sheet
              </p>
              {[["Role", CONTENT.role], ["Location", CONTENT.location], ["Status", CONTENT.status], ["Stack", "JS / TS · React · Node"]].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 text-sm" style={{ borderBottom: "1px dashed var(--grid)" }}>
                  <span style={{ color: "var(--ink-soft)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ABOUT */}
        <section id="about" data-section="About" className="relative pb-20 md:pb-24">
          <SectionMarker index="01" label="About" />
          <div className="md:pl-12 max-w-2xl">
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--ink-soft)" }}>{CONTENT.about}</p>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" data-section="Skills" ref={skillsSectionRef} className="relative pb-20 md:pb-24">
          <SectionMarker index="02" label="Skills" />
          <div className="md:pl-12 grid sm:grid-cols-3 gap-8">
            {CONTENT.skills.map((group) => (
              <div key={group.group}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.06em", color: "var(--teal)" }} className="uppercase mb-4">
                  {group.group}
                </p>
                <div className="space-y-4">
                  {group.items.map((skill) => (
                    <SkillBar key={skill.name} name={skill.name} level={skill.level} animate={skillsInView || reducedMotion} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" data-section="Projects" className="relative pb-20 md:pb-24">
          <SectionMarker index="03" label="Projects" />
          <div className="md:pl-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setProjectFilter(tag)}
                  className="tag-chip px-3 py-1.5 rounded-sm text-xs"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    border: `1px solid ${projectFilter === tag ? "var(--copper)" : "var(--grid)"}`,
                    background: projectFilter === tag ? "var(--copper)" : "transparent",
                    color: projectFilter === tag ? "var(--paper-2)" : "var(--ink-soft)",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {CONTENT.projects.map((project) => {
                const included = filteredProjects.includes(project);
                return (
                  <ProjectCard
                    key={project.code}
                    project={project}
                    expanded={expandedId === project.code}
                    dimmed={!included}
                    reducedMotion={reducedMotion}
                    onToggle={() => setExpandedId(expandedId === project.code ? null : project.code)}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" data-section="Experience" className="relative pb-20 md:pb-24">
          <SectionMarker index="04" label="Experience" />
          <div className="md:pl-12 max-w-2xl">
            {CONTENT.experience.map((job, i) => (
              <div
                key={job.role + job.period}
                className="relative pl-7 pb-8"
                style={{ borderLeft: i === CONTENT.experience.length - 1 ? "none" : "1px dashed var(--grid)" }}
              >
                <Circle size={9} fill="var(--teal)" color="var(--teal)" style={{ position: "absolute", left: -5, top: 5 }} />
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--copper)" }} className="mb-1">
                  {job.period}
                </p>
                <h3 style={{ fontWeight: 600, fontSize: 16 }}>
                  {job.role} · <span style={{ color: "var(--ink-soft)" }}>{job.org}</span>
                </h3>
                <p style={{ fontSize: 14, color: "var(--ink-soft)" }} className="mt-1">
                  {job.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" data-section="Contact" className="relative pb-24">
          <SectionMarker index="05" label="Contact" />
          <div className="relative md:ml-12 border p-8 md:p-10" style={{ borderColor: "var(--grid)", background: "var(--paper-2)" }}>
            <MountHoles />
            <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 480 }}>
              Have a project in mind or just want to say hi? My inbox is open.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm"
                style={{ background: "var(--ink)", color: "var(--paper-2)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Mail size={15} />
                {copied ? "Copied!" : CONTENT.email}
              </button>
              <a href={CONTENT.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm border" style={{ borderColor: "var(--ink)", color: "var(--ink)" }}>
                <Github size={15} /> GitHub
              </a>
              <a href={CONTENT.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm border" style={{ borderColor: "var(--ink)", color: "var(--ink)" }}>
                <Linkedin size={15} /> LinkedIn
              </a>
            </div>
          </div>

          <p className="text-center mt-14" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.05em" }}>
            BUILT WITH REACT — {new Date().getFullYear()}
          </p>
        </section>
      </div>
    </div>
  );
}