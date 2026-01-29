'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

// Type definitions for game metadata
interface GameMetadata {
  difficulty: 'simple' | 'precalc' | 'calculus';
  hp: number;
  wins: number;
  losses: number;
  // Add other game stats as needed
}

// Map tile types for visual variety
type TileType = 'grass' | 'path' | 'water' | 'mountain' | 'town' | 'dungeon';

// Map node interface for grid-based navigation
interface MapNode {
  id: number;
  type: TileType;
  row: number;
  col: number;
  accessible: boolean;
}

export default function GamePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Game state
  const [gameData, setGameData] = useState<GameMetadata>({
    difficulty: 'simple',
    hp: 100,
    wins: 0,
    losses: 0
  });
  
  // Map grid state
  const [mapGrid, setMapGrid] = useState<MapNode[][]>([]);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  
  // Initialize game metadata when user loads
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    const initializeGameData = async () => {
      try {
        const metadata = user.publicMetadata;
        const currentDifficulty = metadata.difficulty as GameMetadata['difficulty'];
        
        // Check if difficulty exists in metadata, if not set default
        if (!currentDifficulty) {
          setIsUpdatingMetadata(true);
          
          // Update Clerk metadata with default game data
          await user.update({
            publicMetadata: {
              ...metadata,
              difficulty: 'simple',
              hp: 100,
              wins: 0,
              losses: 0
            }
          });
          
          setGameData({
            difficulty: 'simple',
            hp: 100,
            wins: 0,
            losses: 0
          });
        } else {
          // Load existing game data from metadata
          setGameData({
            difficulty: currentDifficulty || 'simple',
            hp: typeof metadata.hp === 'number' ? metadata.hp : 100,
            wins: typeof metadata.wins === 'number' ? metadata.wins : 0,
            losses: typeof metadata.losses === 'number' ? metadata.losses : 0
          });
        }
      } catch (error) {
        console.error('Error initializing game data:', error);
        // Fallback to default data
        setGameData({
          difficulty: 'simple',
          hp: 100,
          wins: 0,
          losses: 0
        });
      } finally {
        setIsUpdatingMetadata(false);
      }
    };
    
    initializeGameData();
  }, [user, isLoaded]);
  
  // Generate map grid on component mount
  useEffect(() => {
    generateMapGrid();
  }, []);
  
  // Generate a 8x8 map grid with various tile types
  const generateMapGrid = () => {
    const grid: MapNode[][] = [];
    const rows = 8;
    const cols = 8;
    
    // Player starting position (center of grid)
    const startRow = 3;
    const startCol = 3;
    
    for (let row = 0; row < rows; row++) {
      const rowNodes: MapNode[] = [];
      for (let col = 0; col < cols; col++) {
        // Determine tile type based on position
        let type: TileType = 'grass';
        
        // Create paths from center
        if (row === startRow || col === startCol) {
          type = 'path';
        }
        
        // Add special tiles
        if (row === 0 && col === 0) type = 'town';
        if (row === 7 && col === 7) type = 'dungeon';
        if ((row === 1 && col === 1) || (row === 6 && col === 6)) type = 'mountain';
        if ((row === 0 && col === 7) || (row === 7 && col === 0)) type = 'water';
        
        // Player starts at center, which is always accessible
        const accessible = row === startRow && col === startCol;
        
        rowNodes.push({
          id: row * cols + col,
          type,
          row,
          col,
          accessible
        });
      }
      grid.push(rowNodes);
    }
    
    setMapGrid(grid);
  };
  
  // Handle tile click - navigate to battle screen
  const handleTileClick = (node: MapNode) => {
    if (!node.accessible) {
      // In a full implementation, you might show a "can't reach" message
      console.log(`Tile at (${node.row}, ${node.col}) is not accessible yet`);
      return;
    }
    
    // Navigate to battle screen
    // For now, we're just stubbing the navigation
    router.push('/game/battle');
  };
  
  // Render difficulty badge with appropriate styling
  const renderDifficultyBadge = () => {
    const difficultyConfig = {
      simple: { label: 'Simple Math', color: '#4CAF50' },
      precalc: { label: 'AP Precalculus', color: '#2196F3' },
      calculus: { label: 'AP Calculus AB', color: '#9C27B0' }
    };
    
    const config = difficultyConfig[gameData.difficulty];
    
    return (
      <div 
        className={styles.difficultyBadge}
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </div>
    );
  };
  
  // Render health bar
  const renderHealthBar = () => {
    const percentage = Math.max(0, Math.min(100, gameData.hp));
    
    return (
      <div className={styles.healthBarContainer}>
        <div className={styles.healthBarLabel}>HP: {gameData.hp}/100</div>
        <div className={styles.healthBarBackground}>
          <div 
            className={styles.healthBarFill}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };
  
  if (!isLoaded || isUpdatingMetadata) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingPixel}></div>
        <p className={styles.loadingText}>Loading game data...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>Please sign in to play the game.</p>
      </div>
    );
  }
  
  return (
    <div className={styles.gameContainer}>
      {/* Game Header with Player Stats */}
      <header className={styles.gameHeader}>
        <div className={styles.playerInfo}>
          <h1 className={styles.gameTitle}>16-Bit Math Level Game</h1>
          <div className={styles.playerStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Player:</span>
              <span className={styles.statValue}>{user.firstName || 'Adventurer'}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Difficulty:</span>
              {renderDifficultyBadge()}
            </div>
          </div>
        </div>
        
        {/* Game Stats Display */}
        <div className={styles.gameStats}>
          {renderHealthBar()}
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{gameData.wins}</div>
              <div className={styles.statName}>Wins</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{gameData.losses}</div>
              <div className={styles.statName}>Losses</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>
                {gameData.wins + gameData.losses > 0 
                  ? Math.round((gameData.wins / (gameData.wins + gameData.losses)) * 100)
                  : 0}%
              </div>
              <div className={styles.statName}>Win Rate</div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Game Content - Map Grid */}
      <main className={styles.gameMain}>
        <div className={styles.mapContainer}>
          <div className={styles.mapBorder}>
            <h2 className={styles.mapTitle}>Math Adventure Map</h2>
            
            {/* Map Grid */}
            <div className={styles.mapGrid}>
              {mapGrid.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className={styles.mapRow}>
                  {row.map((node) => (
                    <button
                      key={node.id}
                      className={`${styles.mapTile} ${styles[node.type]} ${
                        node.accessible ? styles.accessible : styles.inaccessible
                      }`}
                      onClick={() => handleTileClick(node)}
                      aria-label={`${node.type} tile at position ${node.row}, ${node.col}`}
                      disabled={!node.accessible}
                    >
                      {/* Special icons for certain tile types */}
                      {node.type === 'town' && (
                        <span className={styles.tileIcon}>🏠</span>
                      )}
                      {node.type === 'dungeon' && (
                        <span className={styles.tileIcon}>🏰</span>
                      )}
                      {node.type === 'mountain' && (
                        <span className={styles.tileIcon}>⛰️</span>
                      )}
                      {node.type === 'water' && (
                        <span className={styles.tileIcon}>🌊</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Map Legend */}
            <div className={styles.mapLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendTile} ${styles.town}`}></div>
                <span>Town (Safe Zone)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendTile} ${styles.dungeon}`}></div>
                <span>Dungeon (Boss)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendTile} ${styles.path}`}></div>
                <span>Path (Travel)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendTile} ${styles.grass}`}></div>
                <span>Grass (Random Encounter)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Instructions */}
        <div className={styles.instructions}>
          <h3 className={styles.instructionsTitle}>How to Play</h3>
          <ul className={styles.instructionsList}>
            <li>Click on accessible tiles (highlighted) to move around the map</li>
            <li>Each tile represents a different type of math challenge</li>
            <li>Grass tiles: Random math problems based on your difficulty</li>
            <li>Dungeon tiles: Boss battles with complex problems</li>
            <li>Town tiles: Rest and recover health</li>
            <li>Win battles to increase your stats and unlock new areas!</li>
          </ul>
        </div>
      </main>
      
      {/* Footer with Game Controls */}
      <footer className={styles.gameFooter}>
        <div className={styles.controls}>
          <button 
            className={styles.controlButton}
            onClick={() => router.push('/game/battle')}
          >
            Test Battle Screen
          </button>
          <button 
            className={styles.controlButtonSecondary}
            onClick={() => window.location.reload()}
          >
            Refresh Game
          </button>
        </div>
        <div className={styles.gameHint}>
          <p>Tip: Complete battles to unlock new areas of the map!</p>
        </div>
      </footer>
    </div>
  );
}