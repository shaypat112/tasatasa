"use client";

import { useState, useEffect } from "react";
import styles from "./CodeWindow.module.css";

export default function CodeWindow() {
  const [tab, setTab] = useState<"code" | "gameplay">("code");
  const [minimized, setMinimized] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("codeWindowMinimized");
    setMinimized(saved === "true");
  }, []);

  function setMinimizedAndSave(value: boolean) {
    setMinimized(value);
    localStorage.setItem("codeWindowMinimized", String(value));
  }
  if (minimized === null) return null;

  if (minimized) {
    return (
      <div className={styles.minimizedContainer}>
        <button
          className={styles.restoreButton}
          onClick={() => setMinimizedAndSave(false)}
        >
          SHOW DEMO
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.dots}>
            <span />
            <span />
            <span />
          </div>

          <div className={styles.tabs}>
            <button
              className={tab === "code" ? styles.activeTab : styles.tab}
              onClick={() => setTab("code")}
            >
              CODE
            </button>
            <button
              className={tab === "gameplay" ? styles.activeTab : styles.tab}
              onClick={() => setTab("gameplay")}
            >
              GAMEPLAY
            </button>
          </div>

          <button
            className={`${styles.minimizeButton} ${
              tab === "gameplay" ? styles.mobileMinimize : ""
            }`}
            onClick={() => setMinimizedAndSave(true)}
            aria-label="Minimize"
          >
            Return
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {tab === "code" ? (
            <pre className={styles.code}>
              {`function generateProblem(mode) {
  switch (mode) {
    case "simple":
      return addOrSubtract();

    case "math3":
      return linearEquations();

    case "ap-precalc":
      return trigOrPolynomial();

    case "calc-ab":
      return derivative();
  }
}

if (player.answer === correct) {
  enemy.hp -= damage;
} else {
  player.hp -= penalty;
}`}
            </pre>
          ) : (
            <div className={styles.gameplay}>
              <p className={styles.gameplayTitle}>MATH BATTLE DEMO</p>

              {/* Battle field */}
              <div className={styles.battleField}>
                {/* Player */}
                <div className={styles.character}>
                  <p className={styles.label}>PLAYER</p>
                  <div className={styles.spriteBox}>
                    <img
                      src="/math.png"
                      alt="Player User "
                      className={styles.sprite}
                    />
                  </div>

                  <div className={styles.bar}>
                    <div className={styles.playerFill} />
                  </div>
                </div>

                {/* Center prompt */}
                <div className={styles.mathPrompt}>
                  <p className={styles.promptTitle}>SOLVE</p>
                  <p className={styles.promptText}>4x + 9x + 3x = 2000</p>
                  <p className={styles.cursor}>▌</p>
                </div>

                {/* Enemy */}
                <div className={styles.character}>
                  <p className={styles.label}>ENEMY</p>
                  <div className={styles.spriteBox}>
                    <img
                      src="/evilAI.png"
                      alt="AI Bot "
                      className={styles.sprite}
                    />
                  </div>
                  <div className={styles.bar}>
                    <div className={styles.enemyFill} />
                  </div>
                </div>
              </div>

              {/* Math levels */}
              <div className={styles.levelStrip}>
                <span className={styles.levelActive}>SIMPLE</span>
                <span>MATH 3</span>
                <span>MODERATE</span>
                <span>AP PRECALC</span>
                <span>CALC AB</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
