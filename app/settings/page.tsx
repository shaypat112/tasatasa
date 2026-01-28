"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="border-4 border-white p-8 text-center space-y-6">
        <h1 className="text-xl tracking-widest">
          SETTINGS
        </h1>

        <p className="text-xs text-gray-400">
          More options coming soon
        </p>

        <Link href="/">
          <button className="retro-button">
            BACK
          </button>
        </Link>
      </div>
    </div>
  );
}
