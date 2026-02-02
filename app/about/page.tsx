"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";
import {
  FiTerminal,
  FiCpu,
  FiDatabase,
  FiLock,
  FiCode,
  FiShield,
} from "react-icons/fi";
import {
  SiReact,
  SiNextdotjs,
  SiVercel,
  SiFirebase,
  SiClerk,
  SiFramer,
} from "react-icons/si";

export default function AboutPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("overview");

  const techStack = [
    {
      name: "React",
      icon: <SiReact />,
      description: "Frontend library for building user interfaces",
      role: "UI Components & State Management",
    },
    {
      name: "Next.js",
      icon: <SiNextdotjs />,
      description: "React framework with server-side rendering",
      role: "Page Routing & API Routes",
    },
    {
      name: "Vercel",
      icon: <SiVercel />,
      description: "Cloud platform for static sites & serverless functions",
      role: "Deployment & Hosting",
    },
    {
      name: "Firebase",
      icon: <SiFirebase />,
      description: "Backend-as-a-Service platform",
      role: "Real-time Database & Analytics",
    },
    {
      name: "Clerk",
      icon: <SiClerk />,
      description: "User authentication & management",
      role: "Authentication & User Profiles",
    },
    {
      name: "Framer Motion",
      icon: <SiFramer />,
      description: "Animation library for React",
      role: "Animations & Transitions",
    },
    {
      name: "React Icons",
      icon: <FiCode />,
      description: "Icon library for React",
      role: "UI Icons & Visual Elements",
    },
    {
      name: "TypeScript",
      icon: <FiTerminal />,
      description: "Typed superset of JavaScript",
      role: "Type Safety & Developer Experience",
    },
  ];

  const designPrinciples = [
    {
      principle: "Retro Aesthetic",
      description: "Emulating 16-bit era visual style with modern rendering",
      implementation: "ASCII art, terminal UI, monochrome color scheme",
    },
    {
      principle: "Modern Architecture",
      description: "Contemporary web stack with retro presentation",
      implementation: "React components, real-time updates, responsive design",
    },
    {
      principle: "Progressive Enhancement",
      description:
        "Core gameplay works everywhere, enhanced on modern browsers",
      implementation: "Fallback systems, graceful degradation",
    },
    {
      principle: "Accessible Design",
      description: "Retro style without sacrificing accessibility",
      implementation:
        "Keyboard navigation, screen reader support, color contrast",
    },
  ];

  const promptRequirements = [
    {
      requirement: "Retro Revival Theme",
      satisfied: true,
      description: "Reimagines 16-bit era gaming with modern web technologies",
    },
    {
      requirement: "No Copyrighted Material",
      satisfied: true,
      description:
        "Original ASCII art, custom monsters, unique gameplay mechanics",
    },
    {
      requirement: "Modern Twist",
      satisfied: true,
      description:
        "Traditional RPG mechanics enhanced with real-time multiplayer capabilities",
    },
    {
      requirement: "Educational Value",
      satisfied: true,
      description:
        "Math-based combat system that reinforces mathematical concepts",
    },
  ];

  const systemArchitecture = [
    {
      component: "Frontend",
      tech: ["React", "Next.js", "TypeScript"],
      description: "Server-side rendered pages with client-side interactivity",
    },
    {
      component: "Authentication",
      tech: ["Clerk"],
      description: "Secure user authentication with social login options",
    },
    {
      component: "Database",
      tech: ["Firebase Firestore"],
      description: "Real-time player stats and game state persistence",
    },
    {
      component: "Hosting",
      tech: ["Vercel"],
      description: "Global CDN with automatic SSL and continuous deployment",
    },
    {
      component: "Styling",
      tech: ["CSS Modules", "Custom Properties"],
      description: "Modular CSS with retro design system",
    },
  ];

  return (
    <div className={styles.terminal}>
      <div className={styles.screen}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <button
              className={styles.backButton}
              onClick={() => router.push("/game")}
            >
              ◄ BACK TO GAME
            </button>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>SYSTEM DOCUMENTATION</h1>
              <p className={styles.subtitle}>
                Dune Parodox II - Documentation and Design
              </p>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <button
            className={`${styles.navButton} ${activeSection === "overview" ? styles.active : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            SYSTEM OVERVIEW
          </button>
          <button
            className={`${styles.navButton} ${activeSection === "tech" ? styles.active : ""}`}
            onClick={() => setActiveSection("tech")}
          >
            TECH STACK
          </button>
          <button
            className={`${styles.navButton} ${activeSection === "design" ? styles.active : ""}`}
            onClick={() => setActiveSection("design")}
          >
            DESIGN PHILOSOPHY
          </button>
        </nav>

        <main className={styles.mainContent}>
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FiTerminal className={styles.sectionIcon}></FiTerminal>
                <FiTerminal className={styles.sectionIcon} />
                <h2> Design </h2>
              </div>

              <div className={styles.architecture}>
                <h3>ARCHITECTURE DIAGRAM</h3>
                <div className={styles.archDiagram}>
                  <div className={styles.archRow}>
                    <div className={styles.archNode}>
                      <div className={styles.archLabel}>CLIENT</div>
                      <div className={styles.archDetail}>Browser (Next.js)</div>
                    </div>
                    <div className={styles.archArrow}>→</div>
                    <div className={styles.archNode}>
                      <div className={styles.archLabel}>AUTH</div>
                      <div className={styles.archDetail}>Clerk API</div>
                    </div>
                    <div className={styles.archArrow}>→</div>
                    <div className={styles.archNode}>
                      <div className={styles.archLabel}>DATABASE</div>
                      <div className={styles.archDetail}>Firebase</div>
                    </div>
                  </div>
                  <div className={styles.archRow}>
                    <div className={styles.archArrow}>↓</div>
                    <div className={styles.archArrow}>↓</div>
                    <div className={styles.archArrow}>↓</div>
                  </div>
                  <div className={styles.archRow}>
                    <div className={styles.archNode}>
                      <div className={styles.archLabel}>GAME LOGIC</div>
                      <div className={styles.archDetail}>React State</div>
                    </div>
                    <div className={styles.archArrow}>→</div>
                    <div className={styles.archNode}>
                      <div className={styles.archLabel}>UI RENDER</div>
                      <div className={styles.archDetail}>Retro Components</div>
                    </div>
                    <div className={styles.archArrow}>→</div>
                    <div className={styles.archNode}>
                      <div className={styles.archLabel}>PLAYER</div>
                      <div className={styles.archDetail}>Game Experience</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tech Stack Section */}
          {activeSection === "tech" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FiCode className={styles.sectionIcon} />
                <h2>TECHNOLOGY STACK</h2>
              </div>

              <div className={styles.contentCard}>
                <div className={styles.techIntro}>
                  <pre className={styles.ascii}>
                    {`
  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  █░▒▓█  TECH STACKS WE USED  █▓▒░█
  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`}
                  </pre>
                </div>
                <div className={styles.techGrid}>
                  {techStack.map((tech, index) => (
                    <div key={tech.name} className={styles.techCard}>
                      <div className={styles.techHeader}>
                        <div className={styles.techIcon}>{tech.icon}</div>
                        <h3>{tech.name}</h3>
                      </div>
                      <div className={styles.techDescription}>
                        {tech.description}
                      </div>
                      <div className={styles.techRole}>
                        <span className={styles.roleLabel}>ROLE:</span>
                        <span className={styles.roleValue}>{tech.role}</span>
                      </div>
                      <div className={styles.techIndex}>
                        [{index + 1}/{techStack.length}]
                      </div>
                    </div>
                  ))}
                </div>
                 
              </div>
            </div>
          )}

          {/* Design Philosophy Section */}
          {activeSection === "design" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FiCode className={styles.sectionIcon} />
                <h2>DESIGN PHILOSOPHY</h2>
              </div>

              <div className={styles.contentCard}>
                <div className={styles.designIntro}>
                  <pre className={styles.ascii}>
                    {`
  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  █░▒▓█ Dune Parodox II PROMPT █▓▒░█
  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

  The annual theme: Create a 16-bit era
  gaming experience using 2024 web technologies,
  without direct imitation of copyrighted works.
`}
                  </pre>
                </div>

                <div className={styles.principlesGrid}>
                  {designPrinciples.map((principle, index) => (
                    <div key={index} className={styles.principleCard}>
                      <div className={styles.principleHeader}>
                        <div className={styles.principleNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <h3>{principle.principle}</h3>
                      </div>
                      <div className={styles.principleDescription}>
                        {principle.description}
                      </div>
                      <div className={styles.principleImplementation}>
                        <strong>IMPLEMENTATION:</strong>{" "}
                        {principle.implementation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.terminalPrompt}>
              <span className={styles.promptPrefix}>
                system@Dune Parodox II:~$
              </span>
              <span className={styles.promptText}> _</span>
              <span className={styles.cursor}>█</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
