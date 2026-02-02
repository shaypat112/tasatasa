"use client";

import { useState } from "react";

export interface UIPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSync: () => void;
  onReset: () => void;

  playerHealth: number;
  playerLevel: number;
  playerScore: number;
  tokensCollected: number;
  enemiesDefeated: number;
  gameTime: number;
  activePowerUps: string[];
  gamePhase: "exploration" | "combat" | "boss" | "final";
  hearts: number;

  inventory: {
    id: string;
    value: string;
    collectedAt: string;
  }[];
}

const UIPanel: React.FC<UIPanelProps> = ({
  isVisible,
  onClose,
  onSync,
  onReset,
  inventory,
}) => {
  const [panelVisible, setPanelVisible] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await onSync();
    setSyncing(false);
  };

  return (
    <>
      <div id="tool-button" onClick={() => setPanelVisible(!panelVisible)}>
        ⚙️
      </div>

      {panelVisible && (
        <div id="panel">
          <div className="panel-section">
            <div className="panel-title">🎮 Game Controls</div>
            <p>WASD or Arrow Keys: Move</p>
            <p>Space: Action (coming soon)</p>
          </div>

          <div className="panel-section">
            <div className="panel-title">💰 Collected Tokens</div>
            <div id="collected-items">
              {inventory.map((item, index) => (
                <div key={item.id ?? index} className="token">
                  {item.value}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="panel-title">⚡ Game Settings</div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={hintsEnabled}
                  onChange={(e) => setHintsEnabled(e.target.checked)}
                />
                Show Hints
              </label>
            </div>
            <div style={{ marginTop: "10px" }}>
              <button
                id="sync-button"
                className="button"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? "Syncing..." : "🔄 Sync Progress"}
              </button>
              <button id="reset-button" className="button" onClick={onReset}>
                🔄 Reset Local
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UIPanel;
