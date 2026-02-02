"use client";

import Link from "next/link";
import DifficultySelector from "./components/DifficultySelector";
import CodeWindow from "./components/CodeWindow/CodeWindow";

export default function HomePage() {
  return (
    <div>
      <main>
        <div>
          <h1>Dune Parodox II </h1>

          <p>
            A 16 bit
            <br />
            <br />
            Math-Focused
            <br />
            <br />
            Video Game
          </p>

          <div>
            <Link href="/game">
              <button className="retro-button">FIGHT MAP MONSTERS</button>
            </Link>

            <Link href="/chat">
              <button className="retro-button" aria-disabled="true">
                Player Chat
              </button>
            </Link>

            <Link href="/map">
              <button className="retro-button" aria-disabled="true">
                Explore Map
              </button>
            </Link>
            <Link href="/about">
              <button className="retro-button" aria-disabled="true">
                Docs
              </button>
            </Link>
          </div>
        </div>
      </main>

      <section className="flex">
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
      <section className="techstack-section py-12"></section>
    </div>
  );
}
