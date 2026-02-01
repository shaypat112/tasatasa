"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./page.module.css";

interface BattleStats {
  playerHp: number;
  enemyHp: number;
  playerMaxHp: number;
  enemyMaxHp: number;
  turn: "player" | "enemy";
  battleStatus: "active" | "won" | "lost" | "fled";
  round: number;
}

interface MathProblem {
  id: number;
  question: string;
  answer: number;
  choices: number[];
  difficulty: "simple" | "precalc" | "calculus";
  explanation: string;
  timeLimit: number;
}

interface Enemy {
  id: number;
  name: string;
  type: "arithmetic" | "algebra" | "calculus";
  difficulty: "simple" | "precalc" | "calculus";
  description: string;
  damage: number;
  maxHp: number;
  xpReward: number;
  goldReward: number;
  imageSrc: string;
}

const ENEMIES: Enemy[] = [
  {
    id: 1,
    name: "Arithmetic Golem",
    type: "arithmetic",
    difficulty: "simple",
    description: "Basic arithmetic operations",
    damage: 8, // VERY LOW
    maxHp: 100, // VERY LOW
    xpReward: 50,
    goldReward: 20,
    imageSrc: "/precalcmonster.png",
  },
  {
    id: 2,
    name: "Fraction Fiend",
    type: "algebra",
    difficulty: "simple",
    description: "Fractions and basic algebra",
    damage: 10,
    maxHp: 100,
    xpReward: 100,
    goldReward: 30,
    imageSrc: "/fraction-friend.png",
  },
  {
    id: 3,
    name: "Derivative Dragon",
    type: "calculus",
    difficulty: "calculus",
    description: "Derivatives and rates of change",
    damage: 12,
    maxHp: 100,
    xpReward: 200,
    goldReward: 50,
    imageSrc: "/derivative-dragon.png",
  },
  {
    id: 4,
    name: "Integral Behemoth",
    type: "calculus",
    difficulty: "calculus",
    description: "Integration and area under curves",
    damage: 15,
    maxHp: 120,
    xpReward: 300,
    goldReward: 105,
    imageSrc: "/integral-behemoth.png",
  },
];

export default function BattlePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monsterId = searchParams.get("monster");
  const isRandom = searchParams.get("random") === "true";

  const [battleStats, setBattleStats] = useState<BattleStats>({
    playerHp: 100,
    enemyHp: 100,
    playerMaxHp: 100,
    enemyMaxHp: 100,
    turn: "player",
    battleStatus: "active",
    round: 1,
  });

  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(
    null,
  );
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [battleLog, setBattleLog] = useState<string[]>([
    "Battle initialized. Prepare for combat!",
  ]);
  const [playerDifficulty, setPlayerDifficulty] = useState<
    "simple" | "precalc" | "calculus"
  >("simple");
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [unlockedMonsters, setUnlockedMonsters] = useState<number[]>([1]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const initializeBattle = async () => {
      try {
        // Use unsafeMetadata for all game data
        const metadata = user.unsafeMetadata as any;
        const difficulty = metadata.difficulty || "simple";
        setPlayerDifficulty(difficulty);

        const playerHp = typeof metadata.hp === "number" ? metadata.hp : 100;

        // Get unlocked monsters from metadata
        const userUnlockedMonsters = Array.isArray(metadata.unlockedMonsters)
          ? Array.from(new Set([1, ...metadata.unlockedMonsters]))
          : [1];

        setUnlockedMonsters(userUnlockedMonsters);

        // Select enemy
        let enemy: Enemy;
        if (monsterId) {
          const requestedId = parseInt(monsterId);

          if (requestedId === 1) {
            enemy = ENEMIES[0];
          } else if (userUnlockedMonsters.includes(requestedId)) {
            enemy = ENEMIES.find((e) => e.id === requestedId) || ENEMIES[0];
          } else {
            alert(
              "This monster is locked! You need to unlock it first in the dashboard.",
            );
            router.push("/game");
            return;
          }

          // Check if monster is unlocked
          if (userUnlockedMonsters.includes(requestedId)) {
            enemy = ENEMIES.find((e) => e.id === requestedId) || ENEMIES[0];
          } else {
            // If trying to fight locked monster, redirect to dashboard with message
            alert(
              "This monster is locked! You need to unlock it first in the dashboard.",
            );
            router.push("/game");
            return;
          }
        } else if (isRandom) {
          // Only select from unlocked enemies for random battles
          const unlockedEnemies = ENEMIES.filter((e) =>
            userUnlockedMonsters.includes(e.id),
          );

          if (unlockedEnemies.length === 0) {
            enemy = ENEMIES[0]; // Fallback to level 1
          } else {
            enemy =
              unlockedEnemies[
                Math.floor(Math.random() * unlockedEnemies.length)
              ];
          }
        } else {
          // Default to first enemy (level 1)
          enemy = ENEMIES[0];
        }

        setCurrentEnemy(enemy);

        // Generate first problem based on player's difficulty
        const problem = generateMathProblem(enemy);
        setCurrentProblem(problem);

        setBattleStats((prev) => ({
          ...prev,
          playerHp,
          enemyHp: enemy.maxHp,
          enemyMaxHp: enemy.maxHp,
        }));

        addToBattleLog(`ENCOUNTER: ${enemy.name}`);
        addToBattleLog(`DIFFICULTY: ${difficulty.toUpperCase()}`);
        addToBattleLog(
          `REWARDS: ${enemy.xpReward} XP | ${enemy.goldReward} Gold`,
        );

        // Start timer
        setTimeLeft(problem.timeLimit);
      } catch (error) {
        console.error("Error initializing battle:", error);
        const enemy = ENEMIES[0];
        const problem = generateMathProblem(enemy);
        setCurrentEnemy(enemy);
        setCurrentProblem(problem);
        addToBattleLog("Battle initialized with simple difficulty.");
      }
    };

    initializeBattle();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, isLoaded, monsterId, isRandom, router]);

  useEffect(() => {
    if (battleStats.battleStatus !== "active" || !currentProblem) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [battleStats.battleStatus, currentProblem]);

  useEffect(() => {
    if (inputRef.current && battleStats.turn === "player") {
      inputRef.current.focus();
    }
  }, [battleStats.turn, currentProblem]);

  const addToBattleLog = (message: string) => {
    setBattleLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 8),
    ]);
  };

  const generateMathProblem = useCallback((enemy: Enemy): MathProblem => {
    let question = "";
    let answer = 0;
    let explanation = "";
    let timeLimit = 30;

    switch (enemy.id) {
      // Arithmetic Golem
      case 1: {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const op = ["+", "-"][Math.floor(Math.random() * 2)];

        if (op === "+") {
          question = `${a} + ${b} = ?`;
          answer = a + b;
          explanation = "Add the numbers";
        } else {
          question = `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
          answer = Math.max(a, b) - Math.min(a, b);
          explanation = "Subtract the numbers";
        }

        timeLimit = 20;
        break;
      }

      // Fraction Fiend
      case 2: {
        const n1 = Math.floor(Math.random() * 9) + 1;
        const d1 = Math.floor(Math.random() * 9) + 1;
        const n2 = Math.floor(Math.random() * 9) + 1;
        const d2 = Math.floor(Math.random() * 9) + 1;

        const op = ["+", "-"][Math.floor(Math.random() * 2)];

        if (op === "+") {
          question = `${n1}/${d1} + ${n2}/${d2} = ? (decimal)`;
          answer = Math.round((n1 / d1 + n2 / d2) * 100) / 100;
          explanation = "Add the fractions";
        } else {
          question = `${n1}/${d1} - ${n2}/${d2} = ? (decimal)`;
          answer = Math.round((n1 / d1 - n2 / d2) * 100) / 100;
          explanation = "Subtract the fractions";
        }

        timeLimit = 30;
        break;
      }

      // Derivative Dragon
      case 3: {
        const coeff = Math.floor(Math.random() * 5) + 1;
        const power = Math.floor(Math.random() * 3) + 1;

        question = `d/dx (${coeff}x^${power})`;
        answer = coeff * power;
        explanation = "Power rule: multiply coefficient by exponent";

        timeLimit = 40;
        break;
      }

      // Integral Behemoth
      case 4: {
        const coeff = Math.floor(Math.random() * 4) + 1;
        const power = Math.floor(Math.random() * 3) + 1;

        question = `∫ ${coeff}x^${power} dx (ignore +C)`;
        answer = coeff / (power + 1);
        explanation = "Increase power by 1 and divide";

        timeLimit = 45;
        break;
      }
    }

    const choices = [answer];
    while (choices.length < 4) {
      const wrong = Math.round((answer + (Math.random() * 2 - 1)) * 100) / 100;
      if (!choices.includes(wrong)) choices.push(wrong);
    }

    choices.sort(() => Math.random() - 0.5);

    return {
      id: Date.now(),
      question,
      answer,
      choices,
      difficulty: enemy.difficulty,
      explanation,
      timeLimit,
    };
  }, []);

  const handleTimeOut = () => {
    if (battleStats.battleStatus !== "active") return;
    const damage =
      currentEnemy?.id === 1
        ? 2
        : currentEnemy?.id === 2
          ? 4
          : currentEnemy?.damage || 10;

    const newPlayerHp = Math.max(0, battleStats.playerHp - damage);

    setBattleStats((prev) => ({
      ...prev,
      playerHp: newPlayerHp,
      turn: "enemy",
    }));

    setFeedback("TIME OUT! You took damage!");
    setCombo(0);
    addToBattleLog(`Time out! Took ${damage} damage.`);

    if (newPlayerHp <= 0) {
      handleBattleLoss();
      return;
    }

    setTimeout(handleEnemyTurn, 1000);
  };

  const handleSubmitAnswer = async () => {
    if (
      !currentProblem ||
      !currentEnemy ||
      isProcessing ||
      battleStats.battleStatus !== "active"
    )
      return;

    setIsProcessing(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const submittedAnswer = parseFloat(userAnswer);
    const isCorrect = Math.abs(submittedAnswer - currentProblem.answer) < 0.001;

    if (isCorrect) {
      // Calculate damage based on time left and combo
      const timeBonus = Math.floor(timeLeft / 5);
      const comboBonus = combo * 2;
      const baseDamage =
        currentEnemy.id === 1
          ? 22
          : currentEnemy.id === 2
            ? 20
            : currentEnemy.id === 3
              ? 18
              : 16;

      const totalDamage = baseDamage + timeBonus + comboBonus;

      const newEnemyHp = Math.max(0, battleStats.enemyHp - totalDamage);
      const newCombo = combo + 1;
      const newScore = score + timeLeft * 10 + combo * 50;

      // FIX: Update enemy HP with calculated damage instead of random
      setBattleStats((prev) => ({
        ...prev,
        enemyHp: newEnemyHp,
        round: prev.round + 1,
      }));

      setCombo(newCombo);
      setScore(newScore);

      setFeedback(`CORRECT! ${totalDamage} damage! Combo: x${newCombo}`);
      addToBattleLog(`Hit! ${totalDamage} damage (Combo: x${newCombo})`);

      if (newEnemyHp <= 0) {
        await handleBattleWin();
        setIsProcessing(false);
        return;
      }

      // Enemy turn
      setTimeout(() => {
        handleEnemyTurn();
      }, 1500);
    } else {
      // Incorrect answer
      const damage = currentEnemy.damage + Math.floor(Math.random() * 5);
      const newPlayerHp = Math.max(0, battleStats.playerHp - damage);

      setBattleStats((prev) => ({
        ...prev,
        playerHp: newPlayerHp,
        turn: "enemy",
      }));

      setCombo(0);
      setFeedback(
        `WRONG! Answer was ${currentProblem.answer}. Took ${damage} damage!`,
      );
      addToBattleLog(`Wrong! Took ${damage} damage.`);

      if (newPlayerHp <= 0) {
        await handleBattleLoss();
        setIsProcessing(false);
        return;
      }
    }

    // Generate new problem
    setTimeout(() => {
      const newProblem = generateMathProblem(currentEnemy);
      setCurrentProblem(newProblem);
      setUserAnswer("");
      setTimeLeft(newProblem.timeLimit);
      setFeedback("");
      setBattleStats((prev) => ({ ...prev, turn: "player" }));
      setIsProcessing(false);
    }, 1000);
  };

  const handleEnemyTurn = () => {
    if (!currentEnemy || battleStats.battleStatus !== "active") return;

    const variance = currentEnemy.id <= 2 ? 2 : 6;

    const damage = currentEnemy.damage + Math.floor(Math.random() * variance);
    const newPlayerHp = Math.max(0, battleStats.playerHp - damage);

    setBattleStats((prev) => ({
      ...prev,
      playerHp: newPlayerHp,
      turn: "player",
    }));

    addToBattleLog(`${currentEnemy.name} attacks for ${damage} damage!`);

    if (newPlayerHp <= 0) {
      handleBattleLoss();
    } else {
      // Start timer for next player turn
      if (currentProblem) {
        setTimeLeft(currentProblem.timeLimit);
      }
    }
  };

  const handleBattleWin = async () => {
    setBattleStats((prev) => ({ ...prev, battleStatus: "won" }));
    setFeedback("VICTORY! Monster defeated!");
    addToBattleLog("*** VICTORY ***");

    if (user && currentEnemy) {
      try {
        // Get current metadata from unsafeMetadata
        const metadata = user.unsafeMetadata as any;
        const currentWins =
          typeof metadata.wins === "number" ? metadata.wins : 0;
        const currentLosses =
          typeof metadata.losses === "number" ? metadata.losses : 0;
        const currentGold =
          typeof metadata.gold === "number" ? metadata.gold : 0;
        const currentXP = typeof metadata.xp === "number" ? metadata.xp : 0;
        const currentLevel =
          typeof metadata.level === "number" ? metadata.level : 1;

        // Get current unlocked monsters
        const currentUnlockedMonsters = Array.isArray(metadata.unlockedMonsters)
          ? Array.from(new Set([1, ...metadata.unlockedMonsters]))
          : [1];

        // Get battle log
        const battleLog = Array.isArray(metadata.battleLog)
          ? metadata.battleLog
          : [];

        // Calculate new XP
        const newXP = currentXP + currentEnemy.xpReward;

        // Calculate new level based on XP thresholds (matching dashboard)
        let newLevel = currentLevel;
        const levelThresholds = [0, 100, 300, 600, 1000];
        for (let i = levelThresholds.length - 1; i >= 1; i--) {
          if (newXP >= levelThresholds[i]) {
            newLevel = i + 1;
            break;
          }
        }

        // Create battle log entry
        const logEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          enemy: currentEnemy.name,
          result: "won" as const,
          xpGained: currentEnemy.xpReward,
          goldGained: currentEnemy.goldReward,
        };

        // Update user metadata in unsafeMetadata
        await user.update({
          unsafeMetadata: {
            ...metadata,
            wins: currentWins + 1,
            gold: currentGold + currentEnemy.goldReward,
            xp: newXP,
            level: newLevel,
            hp: Math.min(
              100,
              battleStats.playerHp + (currentEnemy.id <= 2 ? 35 : 20),
            ),
            unlockedMonsters: currentUnlockedMonsters,
            battleLog: [...battleLog, logEntry].slice(-10),
          },
        });
      } catch (error) {
        console.error("Error updating metadata:", error);
      }
    }

    setTimeout(() => {
      router.push("/game");
    }, 3000);
  };

  const handleBattleLoss = async () => {
    setBattleStats((prev) => ({ ...prev, battleStatus: "lost" }));
    setFeedback("DEFEAT! Try again!");
    addToBattleLog("*** DEFEAT ***");

    if (user && currentEnemy) {
      try {
        const metadata = user.unsafeMetadata as any;
        const currentLosses =
          typeof metadata.losses === "number" ? metadata.losses : 0;
        const currentXP = typeof metadata.xp === "number" ? metadata.xp : 0;
        const battleLog = Array.isArray(metadata.battleLog)
          ? metadata.battleLog
          : [];

        // Grant reduced XP on loss (20% of enemy's XP reward)
        const reducedXP = Math.floor(currentEnemy.xpReward * 0.2);
        const newXP = currentXP + reducedXP;

        const logEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          enemy: currentEnemy.name,
          result: "lost" as const,
          xpGained: reducedXP,
          goldGained: 0,
        };

        await user.update({
          unsafeMetadata: {
            ...metadata,
            losses: currentLosses + 1,
            hp: 50, // Reset to 50 HP on loss
            xp: newXP,
            battleLog: [...battleLog, logEntry].slice(-10),
          },
        });
      } catch (error) {
        console.error("Error updating metadata:", error);
      }
    }

    setTimeout(() => {
      router.push("/game");
    }, 3000);
  };

  const handleFlee = async () => {
    if (battleStats.battleStatus !== "active") return;

    setBattleStats((prev) => ({ ...prev, battleStatus: "fled" }));
    setFeedback("Retreated from battle!");
    addToBattleLog("Retreated from battle.");

    if (user) {
      try {
        const metadata = user.unsafeMetadata as any;
        const currentLosses =
          typeof metadata.losses === "number" ? metadata.losses : 0;
        const battleLog = Array.isArray(metadata.battleLog)
          ? metadata.battleLog
          : [];

        const logEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          enemy: currentEnemy?.name || "Unknown",
          result: "fled" as const,
          xpGained: 0,
          goldGained: 0,
        };

        await user.update({
          unsafeMetadata: {
            ...metadata,
            losses: currentLosses + 1,
            hp: Math.max(1, battleStats.playerHp - 20),
            battleLog: [...battleLog, logEntry].slice(-10),
          },
        });
      } catch (error) {
        console.error("Error updating metadata:", error);
      }
    }

    setTimeout(() => {
      router.push("/game");
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !isProcessing &&
      battleStats.battleStatus === "active"
    ) {
      handleSubmitAnswer();
    } else if (e.key === "Escape") {
      router.push("/game");
    }
  };

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>LOADING BATTLE...</p>
      </div>
    );
  }

  return (
    <div className={styles.battleContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/game")}
          >
            ← BACK TO DASHBOARD
          </button>
          <h1 className={styles.title}>MATH BATTLE ARENA</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.scoreDisplay}>
            SCORE: <span className={styles.scoreValue}>{score}</span>
          </div>
          <div className={styles.comboDisplay}>
            COMBO: <span className={styles.comboValue}>x{combo}</span>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Battle Arena */}
        <div className={styles.battleArena}>
          {/* Player Section */}
          <div className={styles.playerSection}>
            <div className={styles.characterCard}>
              <div className={styles.characterImage}>
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Hero Avatar"
                    className={styles.heroImage}
                    draggable={false}
                  />
                ) : (
                  <div className={styles.heroFallback}>HERO</div>
                )}
              </div>

              <div className={styles.characterInfo}>
                <h3>{user?.firstName?.toUpperCase() || "HERO"}</h3>
                <div className={styles.hpBar}>
                  <div className={styles.hpLabel}>HP</div>
                  <div className={styles.hpBarContainer}>
                    <div
                      className={styles.hpBarFill}
                      style={{
                        width: `${(battleStats.playerHp / battleStats.playerMaxHp) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className={styles.hpValue}>
                    {battleStats.playerHp}/{battleStats.playerMaxHp}
                  </div>
                </div>
                <div className={styles.statusInfo}>
                  <span className={styles.statusItem}>
                    Difficulty: {playerDifficulty.toUpperCase()}
                  </span>
                  <span className={styles.statusItem}>
                    Turn: {battleStats.turn === "player" ? "YOURS" : "ENEMY"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* VS Separator */}
          <div className={styles.vsSection}>
            <div className={styles.vsBadge}>VS</div>
            <div className={styles.roundInfo}>ROUND {battleStats.round}</div>
          </div>

          {/* Enemy Section */}
          <div className={styles.enemySection}>
            <div className={styles.characterCard}>
              <div className={styles.characterInfo}>
                <h3>{currentEnemy?.name || "LOADING..."}</h3>
                <div className={styles.enemyType}>
                  {currentEnemy?.type.toUpperCase()}
                </div>
                <div className={styles.hpBar}>
                  <div className={styles.hpLabel}>HP</div>
                  <div className={styles.hpBarContainer}>
                    <div
                      className={styles.hpBarFill}
                      style={{
                        width: `${(battleStats.enemyHp / battleStats.enemyMaxHp) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className={styles.hpValue}>
                    {battleStats.enemyHp}/{battleStats.enemyMaxHp}
                  </div>
                </div>
                <div className={styles.rewardInfo}>
                  <span className={styles.rewardItem}>
                    {currentEnemy?.xpReward || 0} XP
                  </span>
                  <span className={styles.rewardItem}>
                    {currentEnemy?.goldReward || 0} Gold
                  </span>
                </div>
              </div>
              <div className={styles.characterAscii}>
                <div className={styles.imageBox}>
                  {currentEnemy ? (
                    <img
                      src={currentEnemy.imageSrc}
                      alt={currentEnemy.name}
                      className={styles.enemyImageAnimated}
                      draggable={false}
                    />
                  ) : (
                    <div className={styles.loadingImage}>Loading...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Math Problem Section */}
        <div className={styles.problemSection}>
          <div className={styles.problemHeader}>
            <h2>MATH CHALLENGE</h2>
            <div className={styles.timer}>
              <div className={styles.timerLabel}>TIME</div>
              <div
                className={`${styles.timerValue} ${timeLeft < 10 ? styles.warning : ""}`}
              >
                {timeLeft}s
              </div>
            </div>
          </div>

          <div className={styles.problemBox}>
            {currentProblem && (
              <>
                <div className={styles.problemDisplay}>
                  <div className={styles.problemText}>
                    {currentProblem.question}
                  </div>
                  <div className={styles.difficultyBadge}>
                    {currentProblem.difficulty.toUpperCase()}
                  </div>
                </div>

                <div className={styles.answerSection}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>YOUR ANSWER:</label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={
                        isProcessing || battleStats.battleStatus !== "active"
                      }
                      className={styles.answerInput}
                      placeholder="Enter answer..."
                    />
                    <button
                      className={styles.submitButton}
                      onClick={handleSubmitAnswer}
                      disabled={
                        isProcessing ||
                        battleStats.battleStatus !== "active" ||
                        !userAnswer
                      }
                    >
                      SUBMIT
                    </button>
                  </div>

                  <div className={styles.quickChoices}>
                    <span className={styles.quickLabel}>QUICK SELECT:</span>
                    {currentProblem.choices.map((choice, index) => (
                      <button
                        key={index}
                        className={styles.quickChoice}
                        onClick={() => setUserAnswer(choice.toString())}
                        disabled={
                          isProcessing || battleStats.battleStatus !== "active"
                        }
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {feedback && (
              <div
                className={`${styles.feedback} ${
                  feedback.includes("CORRECT")
                    ? styles.success
                    : feedback.includes("WRONG")
                      ? styles.error
                      : feedback.includes("TIME")
                        ? styles.warning
                        : styles.info
                }`}
              >
                {feedback}
              </div>
            )}
          </div>
        </div>

        {/* Battle Log */}
        <div className={styles.logSection}>
          <div className={styles.logHeader}>
            <h3>BATTLE LOG</h3>
            <button
              className={styles.fleeButton}
              onClick={handleFlee}
              disabled={isProcessing || battleStats.battleStatus !== "active"}
            >
              FLEE BATTLE
            </button>
          </div>
          <div className={styles.logContent}>
            {battleLog.map((entry, index) => (
              <div key={index} className={styles.logEntry}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Battle Result Overlay */}
      {battleStats.battleStatus !== "active" && (
        <div className={styles.resultOverlay}>
          <div
            className={`${styles.resultModal} ${styles[battleStats.battleStatus]}`}
          >
            <h2 className={styles.resultTitle}>
              {battleStats.battleStatus === "won"
                ? "VICTORY!"
                : battleStats.battleStatus === "lost"
                  ? "DEFEAT!"
                  : "RETREAT!"}
            </h2>

            <div className={styles.resultContent}>
              {battleStats.battleStatus === "won" && currentEnemy && (
                <>
                  <div className={styles.resultRewards}>
                    <div className={styles.rewardItem}>
                      <div className={styles.rewardIcon}></div>
                      <div className={styles.rewardText}>
                        <div className={styles.rewardLabel}>XP GAINED</div>
                        <div className={styles.rewardValue}>
                          +{currentEnemy.xpReward}
                        </div>
                      </div>
                    </div>
                    <div className={styles.rewardItem}>
                      <div className={styles.rewardIcon}></div>
                      <div className={styles.rewardText}>
                        <div className={styles.rewardLabel}>GOLD GAINED</div>
                        <div className={styles.rewardValue}>
                          +{currentEnemy.goldReward}
                        </div>
                      </div>
                    </div>
                    <div className={styles.rewardItem}>
                      <div className={styles.rewardIcon}></div>
                      <div className={styles.rewardText}>
                        <div className={styles.rewardLabel}>FINAL SCORE</div>
                        <div className={styles.rewardValue}>{score}</div>
                      </div>
                    </div>
                  </div>
                  <p className={styles.resultMessage}>
                    You defeated the {currentEnemy.name}!
                  </p>
                </>
              )}

              {battleStats.battleStatus === "lost" && (
                <>
                  <p className={styles.resultMessage}>
                    The {currentEnemy?.name} was too strong. Try again!
                  </p>
                  <p className={styles.resultHint}>
                    Don't give up! You still earned some XP. Farm the Arithmetic
                    Golem to build your strength.
                  </p>
                </>
              )}

              {battleStats.battleStatus === "fled" && (
                <p className={styles.resultMessage}>
                  You retreated from battle.
                </p>
              )}

              <div className={styles.resultTimer}>
                Returning to dashboard in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
