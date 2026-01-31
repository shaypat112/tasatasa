"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import NotUser from "../components/NoUserLogin";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  const [mathMode, setMathMode] = useState("simple");
  const [showHints, setShowHints] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficultySpeed, setDifficultySpeed] =
    useState<"slow" | "normal" | "fast">("normal");

  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user) return;

    setMathMode((user.publicMetadata.mathMode as string) || "simple");
    setShowHints((user.publicMetadata.showHints as boolean) ?? true);
    setTimerEnabled((user.publicMetadata.timerEnabled as boolean) ?? false);
    setSoundEnabled((user.publicMetadata.soundEnabled as boolean) ?? true);
    setDifficultySpeed(
      (user.publicMetadata.difficultySpeed as "slow" | "normal" | "fast") ??
        "normal"
    );
  }, [user]);

  async function saveSettings() {
    setStatus("SAVING...");

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        mathMode,
        showHints,
        timerEnabled,
        soundEnabled,
        difficultySpeed,
      }),
    });

    setStatus(res.ok ? "SAVED" : "ERROR");
  }

  if (!isLoaded || !user) return <NotUser/>;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div
        style={{
          width: "900px",
          border: "4px solid white",
          padding: "40px",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
          GAME SETTINGS FOR 
          <br/> <br/> <div style={{"fontSize":"24px"}}>{user.fullName}</div>
        </h1>

        {/* Math Mode */}
        <section style={{ marginBottom: "28px" }}>
          <p>MATH MODE</p>
          <select
            value={mathMode}
            onChange={(e) => setMathMode(e.target.value)}
            style={selectStyle}
          >
            <option value="simple">SIMPLE ARITHMETIC</option>
            <option value="math3">MATH 3</option>
            <option value="moderate">MODERATE MIX</option>
            <option value="ap-precalc">AP PRECALCULUS</option>
            <option value="calc-ab">CALCULUS AB</option>
          </select>
        </section>

        {/* Toggles */}
        <Toggle label="SHOW HINTS" value={showHints} onToggle={setShowHints} />
        <Toggle
          label="TIMER MODE"
          value={timerEnabled}
          onToggle={setTimerEnabled}
        />
        <Toggle
          label="SOUND"
          value={soundEnabled}
          onToggle={setSoundEnabled}
        />

        {/* Difficulty Speed */}
        <section style={{ marginBottom: "40px" }}>
          <p>ENEMY SPEED</p>
          <select
            value={difficultySpeed}
            onChange={(e) =>
              setDifficultySpeed(e.target.value as "slow" | "normal" | "fast")
            }
            style={selectStyle}
          >
            <option value="slow">SLOW</option>
            <option value="normal">NORMAL</option>
            <option value="fast">FAST</option>
          </select>
        </section>

        {/* Save */}
        <div style={{ textAlign: "center" }}>
          <button onClick={saveSettings} style={primaryButton}>
            SAVE SETTINGS
          </button>
        </div>

        {status && (
          <p style={{ textAlign: "center", marginTop: "20px" }}>{status}</p>
        )}

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/">
            <button style={secondaryButton}>BACK</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* --- small helpers --- */

function Toggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <section style={{ marginBottom: "24px" }}>
      <p>{label}</p>
      <button
        onClick={() => onToggle(!value)}
        style={secondaryButton}
      >
        {value ? "ON" : "OFF"}
      </button>
    </section>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "12px",
  background: "black",
  color: "white",
  border: "2px solid white",
  padding: "10px",
};

const primaryButton: React.CSSProperties = {
  border: "3px solid white",
  padding: "16px 40px",
  background: "black",
  color: "white",
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  marginTop: "10px",
  border: "2px solid white",
  background: "black",
  color: "white",
  padding: "10px 20px",
};
