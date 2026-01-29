"use client";

import Link from "next/link";
import DifficultySelector from "./components/DifficultySelector";
import TechStacks from "./components/TechStacks";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Difficulty selector */}
     

      {/* Centered content */}
      <div className="flex items-center justify-center min-h-screen mt-320">
        <div className="text-center space-y-8 border-4 border-white p-10 bg-black">
          <h1 className="text-3xl tracking-widest mr-300">RETRO SHIFT</h1>

          <p className="text-xs text-gray-400">
            A 16 bit <br/>
            <br/> Math Focused
            <br/>
            <br/> Video game 
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
            >
              SETTINGS
            </button>
            </Link>
          </div>
          <section>

          </section>

        </div>
      </div>
      <section>
<div className="loader">
<div className="loader-square"></div>
<div className="loader-square"></div>
<div className="loader-square"></div>
<div className="loader-square"></div>
<div className="loader-square"></div>
<div className="loader-square"></div>
<div className="loader-square"></div>
</div>
      </section>
     <section className="techstack-section">
  <TechStacks />
</section>

    </div>
  );
}
