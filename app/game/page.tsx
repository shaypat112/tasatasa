"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";
import NotUser from "../components/NoUserLogin";

interface GameMetadata {
  difficulty: "simple" | "precalc" | "calculus";
  hp: number;
  maxHp: number;
  wins: number;
  losses: number;
  level: number;
  xp: number;
  gold: number;
  battleLog: BattleLogEntry[];
}

interface BattleLogEntry {
  id: number;
  date: string;
  enemy: string;
  result: "won" | "lost" | "fled";
  xpGained: number;
  goldGained: number;
}

interface Monster {
  id: number;
  name: string;
  type: "arithmetic" | "algebra" | "calculus";
  difficulty: "simple" | "precalc" | "calculus";
  description: string;
  level: number;
  xpReward: number;
  goldReward: number;
  unlocked: boolean;
  ascii: string[];
}

const MONSTERS: Monster[] = [
  {
    id: 1,
    name: "Arithmetic Golem",
    type: "arithmetic",
    difficulty: "simple",
    description: "Basic arithmetic operations",
    level: 1,
    xpReward: 10,
    goldReward: 5,
    unlocked: true,
    ascii: [
      "  ▄▄▄▄▄  ",
      " ███████ ",
      "██  ██  ██",
      "███    ███",
      " ███████ ",
      "  ▀▀▀▀▀  ",
    ],
  },
  {
    id: 2,
    name: "Fraction Fiend",
    type: "algebra",
    difficulty: "simple",
    description: "Fractions and basic algebra",
    level: 2,
    xpReward: 15,
    goldReward: 8,
    unlocked: true,
    ascii: [
      "   ███   ",
      "  █████  ",
      " ██▀▀▀██ ",
      "██▄▄▄▄▄██",
      " ███████ ",
      "  ▀▀▀▀▀  ",
    ],
  },
  {
    id: 3,
    name: "Trigonometry Titan",
    type: "algebra",
    difficulty: "precalc",
    description: "Trigonometric functions",
    level: 3,
    xpReward: 25,
    goldReward: 15,
    unlocked: false,
    ascii: [
      "  ▄▄▄▄▄▄  ",
      " ████████ ",
      "██░░░░░░██",
      "██░████░██",
      "██░░░░░░██",
      " ████████ ",
      "  ▀▀▀▀▀▀  ",
    ],
  },
  {
    id: 4,
    name: "Logarithmic Lich",
    type: "algebra",
    difficulty: "precalc",
    description: "Logarithms and exponents",
    level: 4,
    xpReward: 30,
    goldReward: 20,
    unlocked: false,
    ascii: [
      "   ▄▄▄   ",
      "  █████  ",
      " ██▀▀▀██ ",
      "███▄▄▄███",
      " ███████ ",
      "  ▀▀█▀▀  ",
    ],
  },
  {
    id: 5,
    name: "Derivative Dragon",
    type: "calculus",
    difficulty: "calculus",
    description: "Derivatives and rates of change",
    level: 5,
    xpReward: 50,
    goldReward: 30,
    unlocked: false,
    ascii: [
      "    ▄▄▄▄▄    ",
      "   ███████   ",
      "  ██▀▀▀▀▀██  ",
      " ██▄▄▄▄▄▄▄██ ",
      "██▀▀▀▀▀▀▀▀▀██",
      " ███████████ ",
      "  ▀▀▀▀▀▀▀▀▀  ",
    ],
  },
  {
    id: 6,
    name: "Integral Behemoth",
    type: "calculus",
    difficulty: "calculus",
    description: "Integration and area under curves",
    level: 6,
    xpReward: 60,
    goldReward: 35,
    unlocked: false,
    ascii: [
      "  ▄▄▄▄▄▄▄  ",
      " █████████ ",
      "██▄▄▄▄▄▄▄██",
      "██▀▀▀▀▀▀▀██",
      "██▄▄▄▄▄▄▄██",
      " █████████ ",
      "  ▀▀▀▀▀▀▀  ",
    ],
  },
];

export default function GameDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [gameData, setGameData] = useState<GameMetadata>({
    difficulty: "simple",
    hp: 100,
    maxHp: 100,
    wins: 0,
    losses: 0,
    level: 1,
    xp: 0,
    gold: 0,
    battleLog: [],
  });

  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const initializeGameData = useCallback(async () => {
    if (!user) return;

    try {
      const metadata = user.publicMetadata;
      const currentDifficulty =
        metadata.difficulty as GameMetadata["difficulty"];

      if (!currentDifficulty) {
        setIsUpdatingMetadata(true);

        await user.update({
          unsafeMetadata: {
            difficulty: "simple",
            hp: 100,
            maxHp: 100,
            wins: 0,
            losses: 0,
            level: 1,
            xp: 0,
            gold: 0,
            battleLog: [],
          },
        });

        setGameData({
          difficulty: "simple",
          hp: 100,
          maxHp: 100,
          wins: 0,
          losses: 0,
          level: 1,
          xp: 0,
          gold: 0,
          battleLog: [],
        });
      } else {
        setGameData({
          difficulty: currentDifficulty || "simple",
          hp: typeof metadata.hp === "number" ? metadata.hp : 100,
          maxHp: 100,
          wins: typeof metadata.wins === "number" ? metadata.wins : 0,
          losses: typeof metadata.losses === "number" ? metadata.losses : 0,
          level: typeof metadata.level === "number" ? metadata.level : 1,
          xp: typeof metadata.xp === "number" ? metadata.xp : 0,
          gold: typeof metadata.gold === "number" ? metadata.gold : 0,
          battleLog: Array.isArray(metadata.battleLog)
            ? metadata.battleLog.slice(-5)
            : [],
        });

        // Update monster unlocks based on level
        const playerLevel =
          typeof metadata.level === "number" ? metadata.level : 1;
        MONSTERS.forEach((monster) => {
          monster.unlocked = monster.level <= playerLevel;
        });
      }
    } catch (error) {
      console.error("Error initializing game data:", error);
    } finally {
      setIsUpdatingMetadata(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    initializeGameData();
  }, [isLoaded, user, initializeGameData]);

  const handleMonsterSelect = (monster: Monster) => {
    if (!monster.unlocked) {
      alert(`Unlock this monster at level ${monster.level}`);
      return;
    }
    setSelectedMonster(monster);
  };

  const startBattle = () => {
    if (!selectedMonster) return;
    router.push(`/game/battle?monster=${selectedMonster.id}`);
  };

  const calculateXPToNextLevel = (currentLevel: number, currentXP: number) => {
    const baseXP = 100;
    const multiplier = 1.5;
    return Math.floor(baseXP * Math.pow(multiplier, currentLevel - 1));
  };

  const handleHeal = async () => {
    if (!user) return;

    if (gameData.gold < 10) {
      alert("Need 10 gold to heal!");
      return;
    }

    try {
      setIsUpdatingMetadata(true);
      await user.update({
        unsafeMetadata: {
          ...user.publicMetadata,
          hp: 100,
          gold: gameData.gold - 10,
        },
      });

      setGameData((prev) => ({
        ...prev,
        hp: 100,
        gold: prev.gold - 10,
      }));
      alert("Healed to full HP! -10 gold");
    } catch (error) {
      console.error("Error healing:", error);
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  const handleUpgradeDifficulty = async () => {
    if (!user) return;

    const difficultyUpgradeMap = {
      simple: "precalc",
      precalc: "calculus",
      calculus: "calculus",
    } as const;

    const nextDifficulty = difficultyUpgradeMap[gameData.difficulty];

    if (nextDifficulty === gameData.difficulty) {
      alert("Already at maximum difficulty!");
      return;
    }

    if (gameData.level < 3 && nextDifficulty === "precalc") {
      alert("Reach level 3 to unlock Pre-Calculus!");
      return;
    }

    if (gameData.level < 5 && nextDifficulty === "calculus") {
      alert("Reach level 5 to unlock Calculus!");
      return;
    }

    try {
      setIsUpdatingMetadata(true);
      await user.update({
        unsafeMetadata: {
          ...user.publicMetadata,
          difficulty: nextDifficulty,
        },
      });

      setGameData((prev) => ({ ...prev, difficulty: nextDifficulty }));
      alert(`Difficulty upgraded to ${nextDifficulty.toUpperCase()}!`);
    } catch (error) {
      console.error("Error upgrading difficulty:", error);
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "simple":
        return "#00cc00";
      case "precalc":
        return "#ff9900";
      case "calculus":
        return "#ff3300";
      default:
        return "#ffffff";
    }
  };

  const getProgressPercentage = () => {
    const xpNeeded = calculateXPToNextLevel(gameData.level, gameData.xp);
    const currentProgress = gameData.xp % 100;
    return Math.min(100, (currentProgress / xpNeeded) * 100);
  };

  if (!isLoaded || isUpdatingMetadata) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>LOADING DASHBOARD...</p>
      </div>
    );
  }

  if (!user) {
    return <NotUser />;
  }

  const xpNeeded = calculateXPToNextLevel(gameData.level, gameData.xp);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>MATH BATTLE RPG</h1>
          <p className={styles.subtitle}>A Retro Dashboard Interface</p>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user.firstName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className={styles.userDetails}>
            <h3>{user.firstName || "Adventurer"}</h3>
            <p>Level {gameData.level} Mathematician</p>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Left Column - Stats */}
        <div className={styles.statsColumn}>
          {/* Player Stats Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>PLAYER STATS</h2>
              <span className={styles.cardBadge}>ACTIVE</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.statGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>HEALTH</div>
                  <div className={styles.statBar}>
                    <div
                      className={styles.statBarFill}
                      style={{
                        width: `${(gameData.hp / gameData.maxHp) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className={styles.statValue}>
                    {gameData.hp}/{gameData.maxHp}
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>LEVEL</div>
                  <div className={styles.statValueLarge}>{gameData.level}</div>
                  <div className={styles.statSub}>
                    XP: {gameData.xp}/{xpNeeded}
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>GOLD</div>
                  <div className={styles.statValueLarge}>{gameData.gold}</div>
                  <div className={styles.statSub}>Coins</div>
                </div>
              </div>

              <div className={styles.statRow}>
                <div className={styles.statMini}>
                  <div className={styles.statMiniLabel}>WINS</div>
                  <div className={styles.statMiniValue}>{gameData.wins}</div>
                </div>
                <div className={styles.statMini}>
                  <div className={styles.statMiniLabel}>LOSSES</div>
                  <div className={styles.statMiniValue}>{gameData.losses}</div>
                </div>
                <div className={styles.statMini}>
                  <div className={styles.statMiniLabel}>RATIO</div>
                  <div className={styles.statMiniValue}>
                    {gameData.wins + gameData.losses > 0
                      ? (
                          (gameData.wins / (gameData.wins + gameData.losses)) *
                          100
                        ).toFixed(1) + "%"
                      : "0%"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty & Actions Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>GAME SETTINGS</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.difficultySection}>
                <div className={styles.settingItem}>
                  <span className={styles.settingLabel}>DIFFICULTY:</span>
                  <span
                    className={styles.settingValue}
                    style={{ color: getDifficultyColor(gameData.difficulty) }}
                  >
                    {gameData.difficulty.toUpperCase()}
                  </span>
                </div>
                <button
                  className={styles.actionButton}
                  onClick={handleUpgradeDifficulty}
                  disabled={
                    gameData.level < (gameData.difficulty === "simple" ? 3 : 5)
                  }
                >
                  UPGRADE DIFFICULTY
                </button>
              </div>

              <div className={styles.actionsSection}>
                <h3 className={styles.sectionTitle}>QUICK ACTIONS</h3>
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.actionButton} ${styles.primary}`}
                    onClick={handleHeal}
                  >
                    HEAL (-10 GOLD)
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => router.push("/game/battle?random=true")}
                  >
                    QUICK BATTLE
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => setShowTutorial(!showTutorial)}
                  >
                    {showTutorial ? "HIDE TUTORIAL" : "SHOW TUTORIAL"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Battle Log Card */}
          {gameData.battleLog.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>RECENT BATTLES</h2>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.battleLog}>
                  {gameData.battleLog.map((log, index) => (
                    <div key={log.id} className={styles.logEntry}>
                      <div className={styles.logDate}>
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                      <div className={styles.logDetails}>
                        <span className={styles.logEnemy}>{log.enemy}</span>
                        <span
                          className={`${styles.logResult} ${styles[log.result]}`}
                        >
                          {log.result.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.logRewards}>
                        +{log.xpGained} XP • +{log.goldGained} Gold
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Monsters */}
        <div className={styles.monstersColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>MATH MONSTERS</h2>
              <button
                onClick={() => router.push("/")}
                style={{ borderRadius: "10px" }}
              >
                Go Back to Home
              </button>
              <span className={styles.cardBadge}>SELECT TO BATTLE</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.monsterGrid}>
                {MONSTERS.map((monster) => (
                  <div
                    key={monster.id}
                    className={`${styles.monsterCard} ${
                      selectedMonster?.id === monster.id ? styles.selected : ""
                    } ${!monster.unlocked ? styles.locked : ""}`}
                    onClick={() => handleMonsterSelect(monster)}
                  >
                    {!monster.unlocked && (
                      <div className={styles.lockOverlay}>
                        <span>LEVEL {monster.level}+</span>
                      </div>
                    )}
                    <div className={styles.monsterAscii}>
                      {monster.ascii.map((line, i) => (
                        <div key={i} className={styles.asciiLine}>
                          {line}
                        </div>
                      ))}
                    </div>
                    <div className={styles.monsterInfo}>
                      <h3>{monster.name}</h3>
                      <div className={styles.monsterTags}>
                        <span className={styles.monsterType}>
                          {monster.type.toUpperCase()}
                        </span>
                        <span className={styles.monsterLevel}>
                          LVL {monster.level}
                        </span>
                      </div>
                      <p className={styles.monsterDesc}>
                        {monster.description}
                      </p>
                      <div className={styles.monsterRewards}>
                        <span className={styles.reward}>
                          🎯 {monster.xpReward} XP
                        </span>
                        <span className={styles.reward}>
                          💰 {monster.goldReward} Gold
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedMonster && (
                <div className={styles.selectedMonsterInfo}>
                  <div className={styles.selectedHeader}>
                    <h3>SELECTED: {selectedMonster.name}</h3>
                    <button
                      className={`${styles.actionButton} ${styles.primary} ${styles.large}`}
                      onClick={startBattle}
                    >
                      START BATTLE →
                    </button>
                  </div>
                  <p className={styles.selectedDescription}>
                    Prepare to fight a {selectedMonster.difficulty} level{" "}
                    {selectedMonster.type} monster. Victory rewards:{" "}
                    {selectedMonster.xpReward} XP & {selectedMonster.goldReward}{" "}
                    Gold.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tutorial Card */}
          {showTutorial && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>HOW TO PLAY</h2>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.tutorial}>
                  <div className={styles.tutorialStep}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                      <strong>Select a Math Monster</strong> from the grid above
                    </div>
                  </div>
                  <div className={styles.tutorialStep}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                      <strong>Solve math problems</strong> to damage the monster
                    </div>
                  </div>
                  <div className={styles.tutorialStep}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                      <strong>Win battles</strong> to earn XP and Gold
                    </div>
                  </div>
                  <div className={styles.tutorialStep}>
                    <div className={styles.stepNumber}>4</div>
                    <div className={styles.stepContent}>
                      <strong>Level up</strong> to unlock more difficult
                      monsters
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <span className={styles.footerLink}>© 2024 Math Battle RPG</span>
            <span className={styles.footerLink}>•</span>
            <span className={styles.footerLink}>Retro Dashboard v1.0</span>
            <span className={styles.footerLink}>•</span>
            <button
              className={styles.button}
              onClick={() => router.push("/about")}
            >
              About
            </button>
          </div>
          <div className={styles.statusIndicator}>
            <div className={styles.statusDot}></div>
            <span>SERVER: ONLINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
