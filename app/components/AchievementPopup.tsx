"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./AchievementPopup.module.css";

interface AchievementPopupProps {
  title: string;
  description: string;
  icon: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  points?: number;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  title,
  description,
  icon,
  rarity = "common",
  points = 10,
  onClose,
  autoClose = true,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }>
  >([]);
  const popupRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const particlesRef = useRef<NodeJS.Timeout | null>(null);

  // Rarity configurations
  const rarityConfig = {
    common: {
      color: "#4cc9f0",
      bgColor: "rgba(76, 201, 240, 0.1)",
      borderColor: "#4cc9f0",
      glow: "rgba(76, 201, 240, 0.5)",
    },
    rare: {
      color: "#4361ee",
      bgColor: "rgba(67, 97, 238, 0.1)",
      borderColor: "#4361ee",
      glow: "rgba(67, 97, 238, 0.5)",
    },
    epic: {
      color: "#f72585",
      bgColor: "rgba(247, 37, 133, 0.1)",
      borderColor: "#f72585",
      glow: "rgba(247, 37, 133, 0.5)",
    },
    legendary: {
      color: "#ffd166",
      bgColor: "rgba(255, 209, 102, 0.1)",
      borderColor: "#ffd166",
      glow: "rgba(255, 209, 102, 0.5)",
    },
  };

  const config = rarityConfig[rarity];

  // Generate particles
  const generateParticles = () => {
    const newParticles = [];
    const particleCount =
      rarity === "legendary"
        ? 25
        : rarity === "epic"
          ? 15
          : rarity === "rare"
            ? 8
            : 5;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: 50 + Math.random() * 100 - 50,
        y: 50 + Math.random() * 100 - 50,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 4,
        speedY: (Math.random() - 0.5) * 4,
        color: config.color,
      });
    }

    setParticles(newParticles);
  };

  // Update particles animation
  useEffect(() => {
    if (particles.length === 0) return;

    particlesRef.current = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.speedX,
            y: p.y + p.speedY,
            size: p.size * 0.98,
          }))
          .filter(
            (p) =>
              p.size > 0.5 && p.x > -50 && p.x < 150 && p.y > -50 && p.y < 150,
          ),
      );
    }, 50);

    return () => {
      if (particlesRef.current) clearInterval(particlesRef.current);
    };
  }, [particles]);

  // Progress timer
  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const totalTime = duration;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / totalTime) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        progressRef.current = setTimeout(updateProgress, 50);
      } else {
        handleClose();
      }
    };

    progressRef.current = setTimeout(updateProgress, 50);

    return () => {
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [autoClose, duration]);

  // Play sound effect
  useEffect(() => {
    const audio = new Audio(getSoundEffect());
    audio.volume = 0.3;
    audio.play().catch(() => {});

    generateParticles();

    // Add to global achievement list
    const achievement = {
      title,
      description,
      icon,
      rarity,
      points,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    const achievements = JSON.parse(
      localStorage.getItem("retroQuestAchievements") || "[]",
    );
    achievements.unshift(achievement);
    localStorage.setItem(
      "retroQuestAchievements",
      JSON.stringify(achievements.slice(0, 50)),
    ); // Keep last 50
  }, []);

  const getSoundEffect = () => {
    switch (rarity) {
      case "legendary":
        return "/audio/achievement-legendary.mp3";
      case "epic":
        return "/audio/achievement-epic.mp3";
      case "rare":
        return "/audio/achievement-rare.mp3";
      default:
        return "/audio/achievement-common.mp3";
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 500);
  };

  const getRarityText = () => {
    switch (rarity) {
      case "common":
        return "COMMON ACHIEVEMENT";
      case "rare":
        return "RARE ACHIEVEMENT";
      case "epic":
        return "EPIC ACHIEVEMENT";
      case "legendary":
        return "LEGENDARY ACHIEVEMENT";
      default:
        return "ACHIEVEMENT";
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      {/* Particle Background */}
      <div className={styles.particlesContainer}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.size / 6,
            }}
          />
        ))}
      </div>

      {/* Main Popup */}
      <div
        ref={popupRef}
        className={`${styles.popup} ${styles[rarity]}`}
        style={
          {
            "--achievement-color": config.color,
            "--achievement-glow": config.glow,
          } as React.CSSProperties
        }
      >
        {/* Glow Effect */}
        <div className={styles.glowEffect}></div>

        {/* Border Animation */}
        <div className={styles.borderAnimation}></div>

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.rarityBadge}>{getRarityText()}</div>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close achievement"
            >
              ✕
            </button>
          </div>

          {/* Icon Section */}
          <div className={styles.iconSection}>
            <div className={styles.iconContainer}>
              <div className={styles.iconBackground}>
                <span className={styles.icon}>{icon}</span>
              </div>
              <div className={styles.iconGlow}></div>
            </div>
            <div className={styles.pointsBadge}>+{points} XP</div>
          </div>

          {/* Text Content */}
          <div className={styles.textContent}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>

          {/* Progress Bar */}
          {autoClose && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>RARITY:</span>
              <span className={styles.statValue}>{rarity.toUpperCase()}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>UNLOCKED:</span>
              <span className={styles.statValue}>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div className={styles.cornerAccentTL}></div>
        <div className={styles.cornerAccentTR}></div>
        <div className={styles.cornerAccentBL}></div>
        <div className={styles.cornerAccentBR}></div>
      </div>
    </div>
  );
};

export default AchievementPopup;
