"use client";

import Link from "next/link";
import DifficultySelector from "./components/DifficultySelector";
import TechStacks from "./components/TechStacks";
import CodeWindow from "./components/CodeWindow/CodeWindow";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top-left difficulty selector */}

      {/* Main Hero */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center border-4 border-white p-10 bg-black max-w-md w-full space-y-8">
          <h1 className="text-3xl tracking-widest">RETRO SHIFT</h1>

          <p className="text-xs text-gray-400 leading-relaxed">
            A 16 bit
            <br />
            <br />
            Math-Focused
            <br />
            <br />
            Video Game
          </p>

          <div className="flex flex-col gap-4">
            <Link href="/game">
              <button className="retro-button w-full">START GAME</button>
            </Link>

            <Link href="/chat">
              <button
                className="retro-button w-full opacity-40 cursor-not-allowed"
                aria-disabled="true"
              >
                ChatRoom
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Loader / ambience */}
      <section className="flex justify-center py-10">
        <div className="loader">
          <div className="loader-square" />
          <div className="loader-square" />
          <div className="loader-square" />
          <div className="loader-square" />
          <div className="loader-square" />
          <div className="loader-square" />
          <div className="loader-square" />
        </div>
      </section>
      <section>
        <CodeWindow />
      </section>

      {/* Tech stack */}
      <section className="techstack-section py-12">
        <TechStacks />
      </section>
    </div>
  );
}
