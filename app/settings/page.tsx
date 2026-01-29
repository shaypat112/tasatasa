"use client";


import styles from "./NowPlaying.module.css";
import Link from "next/link";
import NowPlaying from "../components/NowPlaying";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      {/* Retro window */}
      <div
        className="relative rounded-lg"
        style={{
          width: "1200px",
          height: "800px",
          backgroundColor: "#011522",
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

        {/* Content */}
        <div className="h-full grid grid-cols-2 gap-12 p-10">
          {/* LEFT: Settings */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
<h1 className="absolute top-6 left-1/2 -translate-x-1/2 text-xl tracking-widest">
  SETTINGS
</h1>
            
            </div>

           


         
          </div>

          {/* RIGHT: Now Playing */}
          <div className="flex items-center justify-center">
            <NowPlaying />
          </div>
        </div>
      </div>
      <section>
           <Link href="/">
              <button className="retro-button w-full">BACK</button>
            </Link>
      </section>
    </div>

  );
}

