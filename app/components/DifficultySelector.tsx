"use client";

import { useState } from "react";

export type Difficulty =
  | "simple"
  | "math3"
  | "precalc"
  | "calculus";

export default function DifficultySelector() {
  const [difficulty, setDifficulty] = useState<Difficulty>("simple");

  return (
    <div className="retro-panel">
      <label className="retro-label">DIFFICULTY</label>
      <select
        className="retro-select"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
      >
        <option value="simple">Simple Math</option>
        <option value="math3">Math 3</option>
        <option value="precalc">AP Precalculus</option>
        <option value="calculus">AB Calculus</option>
      </select>
    </div>
  );
}
