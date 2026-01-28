"use client";

import Link from "next/link";
import DifficultySelector from "./components/DifficultySelector";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Difficulty selector */}
      <div className="fixed top-2 right-2 z-[9999]">
        <DifficultySelector />
      </div>

      {/* Centered content */}
      <div className="flex items-center justify-center min-h-screen mt-220">
        <div className="text-center space-y-8 border-4 border-white p-10 bg-black">
          <h1 className="text-3xl tracking-widest">RETRO SHIFT</h1>

          <p className="text-xs text-gray-400">
            A 16 bit web adventure
          </p>

          <div className="flex flex-col gap-4">
            <Link href="/game">
              <button className="retro-button w-full">
                START GAME
              </button>
            </Link>

<Link href="/settings">
            <button
              className="retro-button opacity-40 cursor-not-allowed"
              disabled
            >
              SETTINGS
            </button>
            </Link>
          </div>

          <p className="text-[10px] text-gray-500 pt-4">
            PRESS START TO BEGIN
          </p>
        </div>
      </div>
    </div>
  );
}
