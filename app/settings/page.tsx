"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import NotUser from "../components/NoUserLogin";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Settings state - now with chatroom settings
  const [settings, setSettings] = useState({
    // Game Settings
    mathMode: "simple" as
      | "simple"
      | "math3"
      | "moderate"
      | "ap-precalc"
      | "calc-ab",
    difficultySpeed: "normal" as "slow" | "normal" | "fast",

    // Chatroom Settings (5 toggles)
    chatSounds: true,
    chatNotifications: true,
    chatTimestamps: true,
    chatAutoScroll: true,
    chatTypingIndicator: true,

    // Game Toggles
    showHints: true,
    timerEnabled: false,
    soundEnabled: true,
  });

  // Load settings from user metadata
  useEffect(() => {
    if (!isLoaded || !user) return;

    const userMetadata = user.publicMetadata || {};

    if (Object.keys(userMetadata).length > 0) {
      setSettings((prev) => ({
        ...prev,
        mathMode:
          (userMetadata.mathMode as typeof settings.mathMode) || "simple",
        difficultySpeed:
          (userMetadata.difficultySpeed as typeof settings.difficultySpeed) ||
          "normal",
        showHints: (userMetadata.showHints as boolean) ?? true,
        timerEnabled: (userMetadata.timerEnabled as boolean) ?? false,
        soundEnabled: (userMetadata.soundEnabled as boolean) ?? true,
        chatSounds: (userMetadata.chatSounds as boolean) ?? true,
        chatNotifications: (userMetadata.chatNotifications as boolean) ?? true,
        chatTimestamps: (userMetadata.chatTimestamps as boolean) ?? true,
        chatAutoScroll: (userMetadata.chatAutoScroll as boolean) ?? true,
        chatTypingIndicator:
          (userMetadata.chatTypingIndicator as boolean) ?? true,
      }));
    }
  }, [isLoaded, user]);

  // Save all settings to the backend
  async function saveSettings() {
    if (!user) return;

    setIsSaving(true);
    setStatus({ message: "Saving settings...", type: "info" });

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          message: "Settings saved successfully!",
          type: "success",
        });

        // Update user metadata in Clerk
        await user.update({
          unsafeMetadata: settings,
        });
      } else {
        setStatus({
          message: data.error || "Error saving settings",
          type: "error",
        });
      }
    } catch (error) {
      setStatus({
        message: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  }

  // Handle toggle changes
  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle select changes
  const handleSelect = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="card-skeleton animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <NotUser />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Game Settings</h1>
          <p className="text-gray-400">Configure your gaming experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Settings Card */}
          <div className="card-dark">
            <div className="title-dark">Game Settings</div>
            <div className="settings-container">
              {/* Math Mode */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Math Mode</span>
                  <p className="setting-description">
                    Choose your difficulty level
                  </p>
                </div>
                <div className="setting-control">
                  <select
                    value={settings.mathMode}
                    onChange={(e) => handleSelect("mathMode", e.target.value)}
                    className="select-dark"
                  >
                    <option value="simple">Simple Arithmetic</option>
                    <option value="math3">Math 3</option>
                    <option value="moderate">Moderate Mix</option>
                    <option value="ap-precalc">AP Precalculus</option>
                    <option value="calc-ab">Calculus AB</option>
                  </select>
                </div>
              </div>

              {/* Enemy Speed */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Enemy Speed</span>
                  <p className="setting-description">Adjust game difficulty</p>
                </div>
                <div className="setting-control">
                  <div className="speed-buttons">
                    {["slow", "normal", "fast"].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSelect("difficultySpeed", speed)}
                        className={`speed-button ${settings.difficultySpeed === speed ? "speed-button-active" : ""}`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Toggles */}
              <div className="space-y-4 mt-6">
                <ToggleRow
                  label="Show Hints"
                  description="Display helpful gameplay hints"
                  checked={settings.showHints}
                  onChange={() => handleToggle("showHints")}
                />
                <ToggleRow
                  label="Timer Mode"
                  description="Enable time-based challenges"
                  checked={settings.timerEnabled}
                  onChange={() => handleToggle("timerEnabled")}
                />
                <ToggleRow
                  label="Game Sounds"
                  description="Enable in-game sound effects"
                  checked={settings.soundEnabled}
                  onChange={() => handleToggle("soundEnabled")}
                />
              </div>
            </div>
          </div>

          {/* Chatroom Settings Card */}
          <div className="card-dark">
            <div className="title-dark">Chatroom Settings</div>
            <div className="settings-container">
              <p className="text-gray-400 text-sm mb-6">
                Customize your chat experience with these 5 settings:
              </p>

              <div className="space-y-4">
                <ToggleRow
                  label="Chat Sounds"
                  description="Play sounds for new messages"
                  checked={settings.chatSounds}
                  onChange={() => handleToggle("chatSounds")}
                />
                <ToggleRow
                  label="Notifications"
                  description="Show desktop notifications"
                  checked={settings.chatNotifications}
                  onChange={() => handleToggle("chatNotifications")}
                />
                <ToggleRow
                  label="Message Timestamps"
                  description="Show time on messages"
                  checked={settings.chatTimestamps}
                  onChange={() => handleToggle("chatTimestamps")}
                />
                <ToggleRow
                  label="Auto-scroll"
                  description="Automatically scroll to new messages"
                  checked={settings.chatAutoScroll}
                  onChange={() => handleToggle("chatAutoScroll")}
                />
                <ToggleRow
                  label="Typing Indicators"
                  description="Show when others are typing"
                  checked={settings.chatTypingIndicator}
                  onChange={() => handleToggle("chatTypingIndicator")}
                />
              </div>

              {/* Status Preview */}
              <div className="mt-8 p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-green-500 bg-green-500/20 px-2 py-1 rounded">
                        Online
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Chat settings applied in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            {status && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/game">
              <button className="secondary-button">Back to Battle</button>
            </Link>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="primary-button"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Save All Settings"
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Settings sync automatically across all your devices</p>
          <p className="mt-1">Last sync: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

// Toggle Row Component
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        <p className="toggle-description">{description}</p>
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="toggle-input"
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}
