"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-8 border-4 border-white p-10 bg-black">
        <h1 className="text-3xl tracking-widest">RETRO SHIFT</h1>

        <p className="text-xs text-gray-400">
          A 16 bit web adventure
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/game">
            <button className="px-6 py-3 border-2 border-white hover:bg-white hover:text-black transition">
              START GAME
            </button>
          </Link>

          <button
            className="px-6 py-3 border-2 border-gray-600 text-gray-500 cursor-not-allowed"
            disabled
          >
            SETTINGS
          </button>
        </div>

        <p className="text-[10px] text-gray-500 pt-4">
          PRESS START TO BEGIN
        </p>
      </div>
    </div>
  );
}
