"use client";

import { useState } from "react";
import styles from "./AchievementPopup.module.css";

interface AchievementListProps {
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    points: number;
    timestamp: string;
  }>;
  totalPoints: number;
}

const AchievementList: React.FC<AchievementListProps> = ({
  achievements,
  totalPoints,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const rarityColors = {
    common: "#4cc9f0",
    rare: "#4361ee",
    epic: "#f72585",
    legendary: "#ffd166",
  };

  if (!isVisible) {
    return (
      <div className={styles.achievementList}>
        <button
          className={styles.achievementButton}
          onClick={() => setIsVisible(true)}
        >
          🏆 ACHIEVEMENTS
          <span className={styles.achievementCounter}>
            {achievements.length}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.achievementList}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <div
            className={styles.rarityBadge}
            style={{ color: "#ffd166", borderColor: "#ffd166" }}
          >
            ACHIEVEMENT HALL OF FAME
          </div>
          <button
            className={styles.closeButton}
            onClick={() => setIsVisible(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.stats} style={{ border: "none", padding: "0" }}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>TOTAL ACHIEVEMENTS</span>
            <span className={styles.statValue} style={{ color: "#ffd166" }}>
              {achievements.length}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>TOTAL POINTS</span>
            <span className={styles.statValue} style={{ color: "#ffd166" }}>
              {totalPoints}
            </span>
          </div>
        </div>

        <div
          style={{ maxHeight: "400px", overflowY: "auto", marginTop: "20px" }}
        >
          {achievements.map((achievement, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                marginBottom: "10px",
                background: "rgba(0, 0, 0, 0.3)",
                borderLeft: `4px solid ${rarityColors[achievement.rarity]}`,
              }}
            >
              <div style={{ fontSize: "1.5rem", marginRight: "15px" }}>
                {achievement.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "0.8rem",
                    }}
                  >
                    {achievement.title}
                  </span>
                  <span
                    style={{
                      color: rarityColors[achievement.rarity],
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "0.7rem",
                    }}
                  >
                    +{achievement.points} XP
                  </span>
                </div>
                <div
                  style={{
                    color: "#4cc9f0",
                    fontSize: "0.8rem",
                    marginBottom: "5px",
                  }}
                >
                  {achievement.description}
                </div>
                <div
                  style={{
                    color: "#888",
                    fontSize: "0.7rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{achievement.rarity.toUpperCase()}</span>
                  <span>
                    {new Date(achievement.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {achievements.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            No achievements unlocked yet. Play the game to earn achievements!
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementList;
