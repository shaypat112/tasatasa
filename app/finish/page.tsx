"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function FinishPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    if (!cardRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#000000",
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = "Dune-Parodox-II-finish.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} ref={cardRef}>
        <h1 className={styles.title}>GAME COMPLETE</h1>

        <p className={styles.subtitle}>You cleared the final challenge</p>

        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span>STATUS</span>
            <span>CLEARED</span>
          </div>
          <div className={styles.statRow}>
            <span>MODE</span>
            <span> Dune Parodox II</span>
          </div>
          <div className={styles.statRow}>
            <span>RESULT</span>
            <span>SUCCESS</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handleScreenshot} className={styles.button}>
            SAVE SCREENSHOT
          </button>

          <button
            onClick={() => router.push("/")}
            className={styles.buttonSecondary}
          >
            RETURN HOME
          </button>
        </div>
      </div>

      <div className={styles.footer}>© Dune Parodox II</div>
    </div>
  );
}
