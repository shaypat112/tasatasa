"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { gameState } from "@/lib/gameState";
// Remove incorrect import and add UIPanel import
import UIPanel from "../components/UIPanel"; // Make sure this path is correct

// Dynamic imports for performance
const GameCanvas = dynamic(() => import("../components/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingOverlay}>
      <div className={styles.pixelLoader}></div>
      <div className={styles.loadingText}>INITIALIZING 16-BIT SYSTEM...</div>
    </div>
  ),
});

const AchievementPopup = dynamic(
  () => import("../components/AchievementPopup"),
  {
    ssr: false,
  },
);

export default function MapPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  // Game State
  const [panelVisible, setPanelVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [tokensCollected, setTokensCollected] = useState(0);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isInCombat, setIsInCombat] = useState(false);
  const [bossActive, setBossActive] = useState(false);
  const [showFinishLine, setShowFinishLine] = useState(false);
  const [showMathGate, setShowMathGate] = useState(false);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathError, setMathError] = useState(false);

  // NEW: Heart system states
  const [hearts, setHearts] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [hitCooldown, setHitCooldown] = useState(false);

  // UI States
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState({
    title: "",
    desc: "",
    icon: "",
  });
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [comboCounter, setComboCounter] = useState(0);
  const [lastActionTime, setLastActionTime] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<
    "exploration" | "combat" | "boss" | "final"
  >("exploration");

  // References
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameCanvasRef = useRef<any>(null);
  const powerUpTimerRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);

  const combatAudioRef = useRef<HTMLAudioElement>(null);
  const bgmAudioRef = useRef<HTMLAudioElement>(null);

  // Initialize game
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        gameState.initialize(user.id).then(() => {
          console.log("Game initialized for user:", user.id);
        });
      }
      startGameTimer();
      playBackgroundMusic();
    }

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    };
  }, [isLoaded, isSignedIn, user]);

  // NEW: Game over logic
  useEffect(() => {
    if (hearts <= 0 && !gameOver) {
      setGameOver(true);
      setIsPaused(true);
      // Stop game timer
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    }
  }, [hearts, gameOver]);

  // Game timer
  const startGameTimer = () => {
    gameTimerRef.current = window.setInterval(() => {
      setGameTime((prev) => prev + 1);
    }, 1000);
  };

  // Audio
  const playBackgroundMusic = () => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = 0.3;
      bgmAudioRef.current.loop = true;
      bgmAudioRef.current.play().catch(() => {
        console.log("Audio play prevented by browser policy");
      });
    }
  };

  const playCombatSound = () => {
    if (combatAudioRef.current) {
      combatAudioRef.current.currentTime = 0;
      combatAudioRef.current.play().catch(() => {});
    }
  };

  // NEW: Handle enemy damage
  const handleEnemyHit = useCallback(() => {
    if (hitCooldown || gameOver) return;

    setHitCooldown(true);
    setHearts((prev) => Math.max(0, prev - 1));

    // Visual feedback
    if (gameContainerRef.current) {
      gameContainerRef.current.style.filter = "brightness(1.5)";
      setTimeout(() => {
        if (gameContainerRef.current) {
          gameContainerRef.current.style.filter = "brightness(1)";
        }
      }, 200);
    }

    // Reset cooldown after 1 second
    setTimeout(() => {
      setHitCooldown(false);
    }, 1000);
  }, [hitCooldown, gameOver]);

  // Game Event Handlers
  const handleTokenCollected = useCallback(
    (value: string) => {
      const newCount = tokensCollected + 1;
      setTokensCollected(newCount);
      setPlayerScore((prev) => prev + 100);

      // Update combo
      const now = Date.now();
      if (now - lastActionTime < 2000) {
        setComboCounter((prev) => prev + 1);
        setPlayerScore((prev) => prev + comboCounter * 50);
      } else {
        setComboCounter(1);
      }
      setLastActionTime(now);

      // YOUR BOT SPAWNING LOGIC HERE
      if (newCount === 5) {
        // Spawn second bot at 5 tokens
        if (gameCanvasRef.current?.spawnEnemy) {
          gameCanvasRef.current.spawnEnemy();
        }
        showAchievementPopup(
          "Second Bot Activated!",
          "A second enemy has spawned!",
          "🤖",
        );
      }
      if (newCount === 8) {
        // Spawn third bot at 8 tokens
        if (gameCanvasRef.current?.spawnEnemy) {
          gameCanvasRef.current.spawnEnemy();
        }
        showAchievementPopup(
          "Third Bot Activated!",
          "A third enemy has spawned!",
          "🤖",
        );
      }

      // Original achievements
      if (newCount === 10) {
        showAchievementPopup(
          "Final Challenge!",
          "Answer to finish the game",
          "🧠",
        );

        // Pause the game
        setIsPaused(true);

        // Open math question popup
        setShowMathGate(true);

        // Move to final phase (for UI text if you want)
        setGamePhase("final");
      }

      // Trigger game phases
      if (newCount >= 3 && gamePhase === "exploration") {
        setGamePhase("combat");
        // Activate enemy
        if (gameCanvasRef.current?.activateEnemy) {
          gameCanvasRef.current.activateEnemy();
        }
      }
      if (newCount >= 7 && gamePhase === "combat") {
        setGamePhase("boss");
        setBossActive(true);
      }
    },
    [tokensCollected, lastActionTime, comboCounter, gamePhase],
  );

  const handlePlayerHit = useCallback(
    (damage: number, enemyType?: string) => {
      // NEW: Use heart system instead of health bar
      handleEnemyHit();

      playCombatSound();
      setIsInCombat(true);

      // Flash screen effect
      if (gameContainerRef.current) {
        gameContainerRef.current.style.boxShadow =
          "0 0 60px rgba(255, 0, 0, 0.7)";
        setTimeout(() => {
          if (gameContainerRef.current) {
            gameContainerRef.current.style.boxShadow = "";
          }
        }, 200);
      }

      // Reset combo on hit
      setComboCounter(0);
    },
    [handleEnemyHit],
  );

  const handleEnemyDefeated = useCallback(
    (enemyType: string, xp: number) => {
      setEnemiesDefeated((prev) => prev + 1);
      setPlayerScore((prev) => prev + 500);
      setPlayerXP((prev) => prev + xp);

      // Level up check
      const xpNeeded = playerLevel * 100;
      if (playerXP + xp >= xpNeeded) {
        setPlayerLevel((prev) => prev + 1);
        // Heal 1 heart on level up
        setHearts((prev) => Math.min(3, prev + 1));
        showAchievementPopup(
          "Level Up!",
          `Reached Level ${playerLevel + 1}`,
          "⭐",
        );
      }

      // Special achievements
      if (enemyType === "boss") {
        showAchievementPopup(
          "BOSS DEFEATED!",
          "The final guardian is vanquished!",
          "💀",
        );
        setBossActive(false);
        setShowFinishLine(true);
      }

      if (enemiesDefeated + 1 === 10) {
        showAchievementPopup("Monster Hunter", "Defeated 10 enemies!", "⚔️");
      }

      setIsInCombat(false);
    },
    [enemiesDefeated, playerXP, playerLevel],
  );

  const handlePowerUpCollected = useCallback((type: string) => {
    setActivePowerUps((prev) => [...prev, type]);

    switch (type) {
      case "health":
        // Add 1 heart for health powerup
        setHearts((prev) => Math.min(3, prev + 1));
        break;
      case "speed":
        // Speed boost effect
        break;
      case "double":
        setPlayerScore((prev) => prev * 2);
        break;
      case "invincible":
        // Invincibility effect
        break;
    }

    // Remove powerup after 30 seconds
    powerUpTimerRef.current = window.setTimeout(() => {
      setActivePowerUps((prev) => prev.filter((p) => p !== type));
    }, 30000);
  }, []);

  const handleFinishLineReached = useCallback(() => {
    if (tokensCollected >= 10) {
      // Save final score
      gameState.saveProgress({
        score: playerScore,
        level: playerLevel,
        tokens: tokensCollected,
        completed: true,
        finishedAt: Date.now(),
      });

      // Show victory animation
      if (gameCanvasRef.current?.playVictoryAnimation) {
        gameCanvasRef.current.playVictoryAnimation();
      }

      // Navigate to finish page after delay
      setTimeout(() => {
        router.push("/finish");
      }, 3000);
    }
  }, [tokensCollected, playerScore, playerLevel, router]);

  // UI Functions
  const showAchievementPopup = (title: string, desc: string, icon: string) => {
    setAchievementData({ title, desc, icon });
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 3000);
  };

  const handleSync = async () => {
    if (!user) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 2000);
      return;
    }

    setSyncStatus("syncing");
    try {
      const progress = {
        tokens: tokensCollected,
        score: playerScore,
        level: playerLevel,
        hearts: hearts,
        enemiesDefeated,
        gameTime,
      };

      const success = await gameState.saveProgress(progress);
      setSyncStatus(success ? "success" : "error");
      setTimeout(() => setSyncStatus("idle"), 2000);

      if (success) {
        showAchievementPopup(
          "Progress Saved!",
          "Game state synced to cloud!",
          "☁️",
        );
      }
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  };

  const handleGameReset = () => {
    if (window.confirm("Reset entire game? All progress will be lost!")) {
      gameState.resetAllProgress();
      window.location.reload();
    }
  };

  const handleFullscreen = () => {
    if (!gameContainerRef.current) return;

    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleAttack = () => {
    if (gameCanvasRef.current?.playerAttack) {
      gameCanvasRef.current.playerAttack();
    }
  };

  const handleSpecialMove = () => {
    if (gameCanvasRef.current?.specialAttack) {
      gameCanvasRef.current.specialAttack();
    }
  };

  const handleRestartGame = () => {
    window.location.reload();
  };

  // Calculate XP progress percentage
  const xpProgress =
    ((playerXP % (playerLevel * 100)) / (playerLevel * 100)) * 100;

  // Loading state
  if (!isLoaded) {
    return (
      <div className={styles.splashScreen}>
        <div className={styles.splashContent}>
          <div className={styles.splashLogo}>🎮</div>
          <h1 className={styles.splashTitle}>RETRO QUEST</h1>
          <div className={styles.splashLoader}>
            <div className={styles.splashBar}></div>
          </div>
          <p className={styles.splashText}>LOADING EPIC ADVENTURE...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hidden Audio Elements */}
      <audio ref={bgmAudioRef} src="/audio/bgm-retro.mp3" preload="auto" />
      <audio ref={combatAudioRef} src="/audio/combat.mp3" preload="auto" />

      <div className={styles.container}>
        {/* Scanlines Overlay */}
        <div className={styles.scanlines}></div>

        {/* CRT Monitor Effect */}
        <div className={styles.crtEffect}></div>

        {/* Main Game Header */}
        <div className={styles.header}>
          <div className={styles.headerRight}></div>
        </div>

        {/* Main Game Container */}
        <div
          ref={gameContainerRef}
          className={`${styles.gameContainer} ${isInCombat ? styles.inCombat : ""} ${bossActive ? styles.bossActive : ""}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " ") e.preventDefault();
          }}
        >
          {/* Game Canvas */}
          <GameCanvas
            ref={gameCanvasRef}
            width={800}
            height={600}
            onTokenCollected={handleTokenCollected}
            onPlayerHit={handlePlayerHit}
            onEnemyDefeated={handleEnemyDefeated}
            onPowerUpCollected={handlePowerUpCollected}
            gamePhase={gamePhase}
            isPaused={isPaused}
            playerLevel={playerLevel}
            hearts={hearts}
            gameOver={gameOver}
          />

          {/* Top HUD */}
          <div className={styles.topHud}>
            {/* Heart System */}
            <div className={styles.hudSection}>
              <div className={styles.hudLabel}>HEARTS</div>
              <div className={styles.heartsContainer}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.heart} ${i < hearts ? styles.heartFull : styles.heartEmpty}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className={styles.hudSection}>
              <div className={styles.missionInfo}>
                <div className={styles.missionItem}>
                  <span className={styles.missionIcon}></span>
                  <span className={styles.missionText}>
                    TOKENS: {tokensCollected}/10
                  </span>
                </div>
                <div className={styles.missionItem}>
                  <span className={styles.missionIcon}></span>
                  <span className={styles.missionText}>
                    ENEMIES: {enemiesDefeated}
                  </span>
                </div>
                <div className={styles.missionItem}>
                  <span className={styles.missionIcon}></span>
                  <span className={styles.missionText}>
                    SCORE: {playerScore.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "10px 18px",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "14px",
                  color: "#e5e7eb",
                  backgroundColor: "#008000",
                  borderRadius: "4px",
                  cursor: "pointer",
                  imageRendering: "pixelated",
                  transition:
                    "background-color 0.15s ease, transform 0.1s ease",
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translate(2px, 2px)";
                  e.currentTarget.style.boxShadow = "0 0 0 #020617";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translate(0, 0)";
                  e.currentTarget.style.boxShadow = "2px 2px 0 #020617";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translate(0, 0)";
                  e.currentTarget.style.boxShadow = "2px 2px 0 #020617";
                }}
              >
                HOME
              </button>
            </div>

            <div className={styles.hudSection}>
              <div className={styles.powerUpDisplay}>
                {activePowerUps.map((powerup, index) => (
                  <div key={index} className={styles.powerUpItem}>
                    {powerup === "health" && "❤️"}
                    {powerup === "speed" && "⚡"}
                    {powerup === "double" && "2️⃣"}
                    {powerup === "invincible" && "🛡️"}
                  </div>
                ))}
                {activePowerUps.length === 0 && (
                  <div className={styles.noPowerUps}>NO ACTIVE POWER-UPS</div>
                )}
              </div>
            </div>
          </div>

          {/* Control Hints */}
          <div className={styles.controlHints}>
            <div className={styles.hintItem}>
              <kbd>WASD</kbd>
              <span>MOVE</span>
            </div>
          </div>

          {/* Game Panel */}
          {panelVisible && (
            <UIPanel
              isVisible={panelVisible}
              onClose={() => setPanelVisible(false)}
              onSync={handleSync}
              onReset={handleGameReset}
              playerHealth={playerHealth}
              playerLevel={playerLevel}
              playerScore={playerScore}
              tokensCollected={tokensCollected}
              enemiesDefeated={enemiesDefeated}
              gameTime={gameTime}
              activePowerUps={activePowerUps}
              gamePhase={gamePhase}
              hearts={hearts}
              inventory={gameState.getInventory()}
            />
          )}

          {/* Sync Status */}
          {syncStatus !== "idle" && (
            <div className={`${styles.syncStatus} ${styles[syncStatus]}`}>
              <div className={styles.syncContent}>
                {syncStatus === "syncing" && "🔄 SYNCING PROGRESS..."}
                {syncStatus === "success" && "✅ GAME SAVED TO CLOUD!"}
                {syncStatus === "error" && "❌ SYNC FAILED"}
              </div>
            </div>
          )}

          {/* Math Gate Overlay */}
          {showMathGate && (
            <div className={styles.mathGateOverlay}>
              <div className={styles.mathGateBox}>
                <h2 className={styles.mathGateTitle}>FINAL CHALLENGE</h2>

                <p className={styles.mathGateQuestion}>What is 6 × 7?</p>

                <input
                  className={styles.mathGateInput}
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="Enter answer"
                  autoFocus
                />

                {mathError && (
                  <div className={styles.mathGateError}>
                    Incorrect. Restarting...
                  </div>
                )}

                <button
                  className={styles.mathGateButton}
                  onClick={() => {
                    if (mathAnswer === "42") {
                      router.push("/finish");
                    } else {
                      setMathError(true);
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    }
                  }}
                >
                  SUBMIT
                </button>
              </div>
            </div>
          )}
          {/* Game Over Overlay */}
          {gameOver && (
            <div className={styles.gameOverOverlay}>
              <div className={styles.gameOverContent}>
                <h2 className={styles.gameOverTitle}>GAME OVER</h2>
                <p className={styles.gameOverText}>
                  You collected {tokensCollected} tokens and defeated{" "}
                  {enemiesDefeated} enemies
                </p>
                <div className={styles.gameOverStats}>
                  <div className={styles.gameOverStat}>
                    <span className={styles.gameOverStatLabel}>
                      FINAL SCORE
                    </span>
                    <span className={styles.gameOverStatValue}>
                      {playerScore}
                    </span>
                  </div>
                  <div className={styles.gameOverStat}>
                    <span className={styles.gameOverStatLabel}>
                      LEVEL REACHED
                    </span>
                    <span className={styles.gameOverStatValue}>
                      {playerLevel}
                    </span>
                  </div>
                  <div className={styles.gameOverStat}>
                    <span className={styles.gameOverStatLabel}>
                      TIME PLAYED
                    </span>
                    <span className={styles.gameOverStatValue}>
                      {Math.floor(gameTime / 60)}:
                      {String(gameTime % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.restartButton}
                  onClick={handleRestartGame}
                >
                  RESTART GAME
                </button>
              </div>
            </div>
          )}

          {/* User Profile */}
          {user && (
            <div className={styles.userProfile}>
              <div className={styles.profileAvatar}>
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || "Player"} />
                ) : (
                  <div className={styles.avatarFallback}>
                    {user.fullName?.[0] ||
                      user.emailAddresses[0]?.emailAddress?.[0] ||
                      "P"}
                  </div>
                )}
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>
                  {user.fullName || "ANONYMOUS HERO"}
                </div>
                <div className={styles.profileStats}>
                  <span className={styles.profileStat}>
                    RANK: #{Math.floor(Math.random() * 1000) + 1}
                  </span>
                  <span className={styles.profileStat}>CLOUD SAVE: ON</span>
                </div>
              </div>
              <SignOutButton>
                <button className={styles.logoutButton}>LOGOUT</button>
              </SignOutButton>
            </div>
          )}

          {/* Phase Indicators */}
          {gamePhase === "combat" && (
            <div className={styles.phaseIndicator}>
              <div className={styles.phaseContent}>
                MONSTERS!!!! COLLECT COINS AND FINISH GAME
              </div>
            </div>
          )}

          {bossActive && (
            <div className={styles.bossIndicator}>
              <div className={styles.bossContent}>
                💀 BOSS BATTLE! DEFEAT THE DUNGEON GUARDIAN!
              </div>
            </div>
          )}

          {showFinishLine && (
            <div className={styles.finishIndicator}>
              <div className={styles.finishContent}>
                🏁 FINISH LINE ACTIVE! REACH THE EXIT TO WIN!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Popup */}
      {showAchievement && (
        <AchievementPopup
          title={achievementData.title}
          description={achievementData.desc}
          icon={achievementData.icon}
          onClose={() => setShowAchievement(false)}
        />
      )}
    </>
  );
}
