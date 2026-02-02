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
  unlockedMonsters: number[];
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
  imageSrc: string;
}

const DIFFICULTY_UNLOCK_MAP: Record<GameMetadata["difficulty"], number | null> =
  {
    simple: 2, // upgrading from simple unlocks Fraction Fiend
    precalc: 3, // upgrading from precalc unlocks Derivative Dragon
    calculus: null, // nothing auto unlocks after this
  };

const MONSTERS: Monster[] = [
  {
    id: 1,
    name: "Arithmetic Golem",
    type: "arithmetic",
    difficulty: "simple",
    description: "Basic arithmetic operations",
    level: 1,
    xpReward: 20,
    goldReward: 5,
    unlocked: false,
    imageSrc: "/precalcmonster.png",
  },
  {
    id: 2,
    name: "Fraction Fiend",
    type: "algebra",
    difficulty: "simple",
    description: "Fractions and basic algebra",
    level: 2,
    xpReward: 50,
    goldReward: 8,
    unlocked: false,
    imageSrc: "/fraction-friend.png",
  },
  {
    id: 3,
    name: "Derivative Dragon",
    type: "calculus",
    difficulty: "calculus",
    description: "Derivatives and rates of change",
    level: 3,
    xpReward: 100,
    goldReward: 30,
    unlocked: false,
    imageSrc: "/derivative-dragon.png",
  },
  {
    id: 4,
    name: "Integral Behemoth",
    type: "calculus",
    difficulty: "calculus",
    description: "Integration and area under curves",
    level: 4,
    xpReward: 200,
    goldReward: 35,
    unlocked: false,
    imageSrc: "/integral-behemoth.png",
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
    unlockedMonsters: [1],
  });

  const [monsters, setMonsters] = useState<Monster[]>(MONSTERS);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const initializeGameData = useCallback(async () => {
    if (!user) return;

    try {
      const metadata = user.unsafeMetadata as Partial<GameMetadata>;

      // Check if user has existing data
      const hasExistingData = typeof metadata.xp === "number";
      if (!hasExistingData) {
        setIsUpdatingMetadata(true);

        const unlockedIds = [1];

        const initialData: GameMetadata = {
          difficulty: "simple",
          hp: 100,
          maxHp: 100,
          wins: 0,
          losses: 0,
          level: 1,
          xp: 0,
          gold: 0,
          battleLog: [],
          unlockedMonsters: unlockedIds,
        };

        await user.update({
          unsafeMetadata: initialData as unknown as Record<string, unknown>,
        });

        setGameData(initialData);

        setMonsters(
          MONSTERS.map((monster) => ({
            ...monster,
            unlocked: unlockedIds.includes(monster.id),
          })),
        );

        return;
      }

      // Load existing data
      const unlockedIds = Array.isArray(metadata.unlockedMonsters)
        ? Array.from(new Set([1, ...metadata.unlockedMonsters]))
        : [1];
      // Default to level 1 if not set

      const loaded: GameMetadata = {
        difficulty:
          (metadata.difficulty as GameMetadata["difficulty"]) || "simple",
        hp: typeof metadata.hp === "number" ? metadata.hp : 100,
        maxHp: typeof metadata.maxHp === "number" ? metadata.maxHp : 100,
        wins: typeof metadata.wins === "number" ? metadata.wins : 0,
        losses: typeof metadata.losses === "number" ? metadata.losses : 0,
        level: typeof metadata.level === "number" ? metadata.level : 1,
        xp: typeof metadata.xp === "number" ? metadata.xp : 0,
        gold: typeof metadata.gold === "number" ? metadata.gold : 0,
        battleLog: Array.isArray(metadata.battleLog)
          ? metadata.battleLog.slice(-5)
          : [],
        unlockedMonsters: unlockedIds,
      };

      setGameData(loaded);

      // Apply unlocks to monsters
      const updatedMonsters = MONSTERS.map((monster) => ({
        ...monster,
        unlocked: unlockedIds.includes(monster.id),
      }));
      setMonsters(updatedMonsters);
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
      // Show unlock option
      const xpCost = calculateUnlockCost(monster.level);
      const confirmUnlock = window.confirm(
        `Unlock ${monster.name} for ${xpCost} XP?\n\nLevel ${monster.level} monster - Rewards: ${monster.xpReward} XP & ${monster.goldReward} Gold`,
      );

      if (confirmUnlock) {
        handleUnlockMonster(monster);
      }
      return;
    }
    setSelectedMonster(monster);
  };

  const startBattle = () => {
    if (!selectedMonster) return;
    router.push(`/game/battle?monster=${selectedMonster.id}`);
  };
  const calculateXPToNextLevel = (currentLevel: number) => {
    const thresholds: Record<number, number> = {
      1: 100,
      2: 300,
      3: 600,
      4: 1000,
    };

    return thresholds[currentLevel] ?? currentLevel * 500;
  };

  const getXPProgress = () => {
    const previousThreshold =
      gameData.level > 1 ? calculateXPToNextLevel(gameData.level - 1) : 0;
    const nextThreshold = calculateXPToNextLevel(gameData.level);

    const xpInCurrentLevel = gameData.xp - previousThreshold;
    const xpNeededForNextLevel = nextThreshold - previousThreshold;

    return {
      percentage: (xpInCurrentLevel / xpNeededForNextLevel) * 100,
      xpInCurrentLevel,
      xpNeededForNextLevel,
    };
  };
  const calculateUnlockCost = (monsterLevel: number) => {
    const costs: Record<number, number> = {
      2: 200,
      3: 300,
      4: 1000,
    };
    return costs[monsterLevel] ?? monsterLevel * 250;
  };

  const handleUnlockMonster = async (monster: Monster) => {
    if (!user) return;

    if (monster.unlocked) {
      alert("Monster already unlocked!");
      return;
    }

    const xpCost = calculateUnlockCost(monster.level);

    if (gameData.xp < xpCost) {
      alert(
        `Need ${xpCost} XP to unlock ${monster.name}. You have ${gameData.xp} XP.\n\nFarm the Arithmetic Golem to earn more XP!`,
      );
      return;
    }

    try {
      setIsUpdatingMetadata(true);

      const metadata = user.unsafeMetadata as any;
      const newXP = gameData.xp - xpCost;
      const newUnlockedMonsters = [...gameData.unlockedMonsters, monster.id];

      // Update user metadata
      await user.update({
        unsafeMetadata: {
          ...metadata,
          xp: newXP,
          unlockedMonsters: newUnlockedMonsters,
        },
      });

      // Update local state
      setGameData((prev) => ({
        ...prev,
        xp: newXP,
        unlockedMonsters: newUnlockedMonsters,
      }));

      // Update monsters state
      setMonsters((prev) =>
        prev.map((m) => (m.id === monster.id ? { ...m, unlocked: true } : m)),
      );

      alert(
        ` ${monster.name} unlocked! -${xpCost} XP\n\nYou can now battle this monster for better rewards!`,
      );
    } catch (error) {
      console.error("Error unlocking monster:", error);
      alert("Failed to unlock monster. Please try again.");
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  const handleHeal = async () => {
    if (!user) return;

    if (gameData.gold < 10) {
      alert("Need 10 gold to heal!");
      return;
    }

    try {
      setIsUpdatingMetadata(true);
      const metadata = user.unsafeMetadata as any;

      await user.update({
        unsafeMetadata: {
          ...metadata,
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

    const cycle = ["simple", "precalc", "calculus"] as const;
    const currentIndex = cycle.indexOf(gameData.difficulty);
    const nextDifficulty = cycle[(currentIndex + 1) % cycle.length];

    const difficultyCost = currentIndex * 100;
    if (gameData.xp < difficultyCost) {
      alert(
        `Need ${difficultyCost} XP to upgrade to ${nextDifficulty.toUpperCase()} difficulty!`,
      );
      return;
    }

    try {
      setIsUpdatingMetadata(true);

      const metadata = user.unsafeMetadata as any;

      const monsterToUnlock = DIFFICULTY_UNLOCK_MAP[gameData.difficulty];

      const newUnlockedMonsters =
        monsterToUnlock && !gameData.unlockedMonsters.includes(monsterToUnlock)
          ? [...gameData.unlockedMonsters, monsterToUnlock]
          : gameData.unlockedMonsters;

      await user.update({
        unsafeMetadata: {
          ...metadata,
          difficulty: nextDifficulty,
          xp: gameData.xp - difficultyCost,
          unlockedMonsters: newUnlockedMonsters,
        },
      });

      setGameData((prev) => ({
        ...prev,
        difficulty: nextDifficulty,
        xp: prev.xp - difficultyCost,
        unlockedMonsters: newUnlockedMonsters,
      }));

      setMonsters((prev) =>
        prev.map((m) =>
          newUnlockedMonsters.includes(m.id) ? { ...m, unlocked: true } : m,
        ),
      );

      if (monsterToUnlock) {
        const monsterName = MONSTERS.find(
          (m) => m.id === monsterToUnlock,
        )?.name;

        alert(
          `Difficulty upgraded to ${nextDifficulty.toUpperCase()}!\n\n${monsterName} unlocked!`,
        );
      } else {
        alert(`Difficulty upgraded to ${nextDifficulty.toUpperCase()}!`);
      }
    } catch (error) {
      console.error("Error upgrading difficulty:", error);
      alert("Failed to upgrade difficulty. Please try again.");
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

  const getDifficultyXPRequirement = () => {
    const cycle = ["simple", "precalc", "calculus"] as const;
    const currentIndex = cycle.indexOf(gameData.difficulty);
    return currentIndex * 100; // 0 for simple, 200 for precalc, 400 for calculus
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

  const xpProgress = getXPProgress();
  const xpNeeded = calculateXPToNextLevel(gameData.level);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Dune Parodox II</h1>
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
                  <div className={styles.statSub}>XP: {gameData.xp}</div>
                  <div className={styles.xpProgressContainer}>
                    <div className={styles.xpProgressBar}>
                      <div
                        className={styles.xpProgressFill}
                        style={{
                          width: `${Math.min(100, xpProgress.percentage)}%`,
                        }}
                      ></div>
                    </div>
                    <div className={styles.xpProgressText}>
                      {xpProgress.xpInCurrentLevel}/
                      {xpProgress.xpNeededForNextLevel} XP to level{" "}
                      {gameData.level + 1}
                    </div>
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
                <div className={styles.settingItem}>
                  <span className={styles.settingLabel}>UPGRADE COST:</span>
                  <span className={styles.settingValue}>
                    {getDifficultyXPRequirement()} XP
                  </span>
                </div>
                <button
                  className={styles.actionButton}
                  onClick={handleUpgradeDifficulty}
                  disabled={gameData.xp < getDifficultyXPRequirement()}
                >
                  UPGRADE DIFFICULTY
                </button>
                {gameData.xp < getDifficultyXPRequirement() && (
                  <div className={styles.requirementHint}>
                    Need {getDifficultyXPRequirement() - gameData.xp} more XP
                  </div>
                )}
              </div>

              <div className={styles.actionsSection}>
                <h3 className={styles.sectionTitle}>QUICK ACTIONS</h3>
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.actionButton} ${styles.primary}`}
                    onClick={handleHeal}
                    disabled={gameData.gold < 10}
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
                {monsters.map((monster) => {
                  const isUnlocked = monster.unlocked;
                  const unlockCost = calculateUnlockCost(monster.level);

                  return (
                    <div
                      key={monster.id}
                      className={`${styles.monsterCard} ${
                        selectedMonster?.id === monster.id
                          ? styles.selected
                          : ""
                      } ${!isUnlocked ? styles.locked : ""}`}
                      onClick={() => handleMonsterSelect(monster)}
                    >
                      {!isUnlocked && (
                        <div className={styles.lockOverlay}>
                          <span className={styles.lockLevel}>
                            LEVEL {monster.level}+
                          </span>
                          <div className={styles.unlockInfo}>
                            <div className={styles.unlockRewards}>
                              Rewards: {monster.xpReward} XP &{" "}
                              {monster.goldReward} Gold
                            </div>
                            <div className={styles.unlockHint}>
                              Click to unlock with XP
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={styles.monsterImage}>
                        <img
                          src={monster.imageSrc}
                          alt={monster.name}
                          className={styles.image}
                          draggable={false}
                        />
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
                          {!isUnlocked && (
                            <span className={styles.monsterLocked}>
                              🔒 LOCKED
                            </span>
                          )}
                        </div>
                        <p className={styles.monsterDesc}>
                          {monster.description}
                        </p>
                        <div className={styles.monsterRewards}>
                          <span className={styles.reward}>
                            {monster.xpReward} XP
                          </span>
                          <span className={styles.reward}>
                            {monster.goldReward} Gold
                          </span>
                        </div>
                        {!isUnlocked && (
                          <div className={styles.unlockButtonContainer}>
                            <button
                              className={styles.unlockButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlockMonster(monster);
                              }}
                              disabled={gameData.xp < unlockCost}
                            >
                              🔓 Unlock ({unlockCost} XP)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                  {!selectedMonster.unlocked && (
                    <div className={styles.unlockPrompt}>
                      <p>
                        <strong>This monster is locked!</strong> You need{" "}
                        {calculateUnlockCost(selectedMonster.level)} XP to
                        unlock it.
                      </p>
                      <button
                        className={`${styles.actionButton} ${styles.primary}`}
                        onClick={() => handleUnlockMonster(selectedMonster)}
                        disabled={
                          gameData.xp <
                          calculateUnlockCost(selectedMonster.level)
                        }
                      >
                        🔓 UNLOCK FOR{" "}
                        {calculateUnlockCost(selectedMonster.level)} XP
                      </button>
                    </div>
                  )}
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
                      <strong>Start with Arithmetic Golem</strong> - Farm XP by
                      defeating level 1 enemies
                    </div>
                  </div>
                  <div className={styles.tutorialStep}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                      <strong>Save XP to unlock stronger monsters</strong> -
                      Click locked monsters to unlock them
                    </div>
                  </div>
                  <div className={styles.tutorialStep}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                      <strong>Progress through difficulties</strong> - Upgrade
                      difficulty for harder problems
                    </div>
                  </div>
                  <div className={styles.tutorialStep}>
                    <div className={styles.stepNumber}>4</div>
                    <div className={styles.stepContent}>
                      <strong>Complete the game</strong> - Defeat all 4 monsters
                      to win!
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
            <span className={styles.progressionStatus}>
              • PROGRESSION: {gameData.unlockedMonsters.length}/4 MONSTERS
              UNLOCKED
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
