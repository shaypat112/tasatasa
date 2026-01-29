"use client";

import Link from "next/link";
import NowPlaying from "../components/NowPlaying";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      {/* Retro window */}
      <div
        className="relative rounded-lg"
        style={{
          width: "1600px",
          height: "950px",
          backgroundColor: "#00000",
        }}
      >
        {/* Window header */}
        <div className="flex items-center px-4 py-3 border-b border-white/20">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff605c]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd44]" />
            <span className="w-3 h-3 rounded-full bg-[#00ca4e]" />
          </div>
        </div>

        {/* SETTINGS title – top center */}
        <h1 className="absolute top-16 left-1/2 -translate-x-1/2 text-9xl tracking-widest">
          SETTINGS
        </h1>

        {/* Main content area */}
        <div className="absolute inset-0 pt-32 px-20">
          {/* Upper empty space for future settings */}
          <div className="h-1/2" />

          {/* Bottom section: Now Playing */}
          <div className="flex justify-center">
            <NowPlaying />
          </div>
        </div>

        {/* Back button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <Link href="/">
            <button className="retro-button px-12">BACK</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
