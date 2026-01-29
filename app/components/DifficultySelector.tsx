"use client";

export type Difficulty =
  | "simple"
  | "math3"
  | "precalc"
  | "calculus";

interface Props {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}

export default function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="retro-panel">
      <label className="retro-label">DIFFICULTY</label>
      <select
        className="retro-select"
        value={value}
        onChange={(e) => onChange(e.target.value as Difficulty)}
      >
        <option value="simple">Simple Math</option>
        <option value="math3">Math 3</option>
        <option value="precalc">AP Precalculus</option>
        <option value="calculus">AB Calculus</option>
      </select>
    </div>
  );
}
