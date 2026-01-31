'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import styles from './page.module.css';
import NotUser from '../components/NoUserLogin';

interface GameMetadata {
  difficulty: 'simple' | 'precalc' | 'calculus';
  hp: number;
  wins: number;
  losses: number;
  level: number;
  xp: number;
  gold: number;
}

type TileType = 'grass' | 'path' | 'water' | 'mountain' | 'town' | 'dungeon';

interface MapNode {
  id: number;
  type: TileType;
  row: number;
  col: number;
  accessible: boolean;
  hasEncounter: boolean;
}

export default function GamePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [gameData, setGameData] = useState<GameMetadata>({
    difficulty: 'simple',
    hp: 100,
    wins: 0,
    losses: 0,
    level: 1,
    xp: 0,
    gold: 0
  });
  
  const [mapGrid, setMapGrid] = useState<MapNode[][]>([]);
  const [playerPos, setPlayerPos] = useState({ row: 3, col: 3 });
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);

  const initializeGameData = useCallback(async () => {
    if (!user) return;
    
    try {
      const metadata = user.publicMetadata;
      const currentDifficulty = metadata.difficulty as GameMetadata['difficulty'];
      
      if (!currentDifficulty) {
        setIsUpdatingMetadata(true);
        
        await user.update({
          unsafeMetadata: {
            difficulty: 'simple',
            hp: 100,
            wins: 0,
            losses: 0,
            level: 1,
            xp: 0,
            gold: 0
          }
        });
        
        setGameData({
          difficulty: 'simple',
          hp: 100,
          wins: 0,
          losses: 0,
          level: 1,
          xp: 0,
          gold: 0
        });
      } else {
        setGameData({
          difficulty: currentDifficulty || 'simple',
          hp: typeof metadata.hp === 'number' ? metadata.hp : 100,
          wins: typeof metadata.wins === 'number' ? metadata.wins : 0,
          losses: typeof metadata.losses === 'number' ? metadata.losses : 0,
          level: typeof metadata.level === 'number' ? metadata.level : 1,
          xp: typeof metadata.xp === 'number' ? metadata.xp : 0,
          gold: typeof metadata.gold === 'number' ? metadata.gold : 0
        });
      }
    } catch (error) {
      console.error('Error initializing game data:', error);
    } finally {
      setIsUpdatingMetadata(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;
    
    initializeGameData();
  }, [isLoaded, user, initializeGameData]);

  useEffect(() => {
    generateMapGrid();
  }, []);

  const generateMapGrid = () => {
    const grid: MapNode[][] = [];
    const rows = 8;
    const cols = 8;
    
    for (let row = 0; row < rows; row++) {
      const rowNodes: MapNode[] = [];
      for (let col = 0; col < cols; col++) {
        let type: TileType = 'grass';
        
        // Create a path network
        if ((row + col) % 3 === 0 || Math.abs(row - playerPos.row) + Math.abs(col - playerPos.col) <= 2) {
          type = 'path';
        }
        
        // Place special tiles
        if (row === 0 && col === 0) type = 'town';
        if (row === 7 && col === 7) type = 'dungeon';
        if ((row === 2 && col === 2) || (row === 5 && col === 5)) type = 'mountain';
        if ((row === 0 && col === 7) || (row === 7 && col === 0)) type = 'water';
        
        // Determine accessibility (within 1 tile range)
        const distance = Math.abs(row - playerPos.row) + Math.abs(col - playerPos.col);
        const accessible = distance <= 1 && !(row === playerPos.row && col === playerPos.col);
        
        // Random encounters on grass/path tiles
        const hasEncounter = accessible && (type === 'grass' || type === 'path') && Math.random() > 0.5;
        
        rowNodes.push({
          id: row * cols + col,
          type,
          row,
          col,
          accessible,
          hasEncounter
        });
      }
      grid.push(rowNodes);
    }
    
    // Mark player position
    grid[playerPos.row][playerPos.col].accessible = true;
    grid[playerPos.row][playerPos.col].type = 'path';
    
    setMapGrid(grid);
  };

  const handleTileClick = async (node: MapNode) => {
    if (!node.accessible) return;
    
    // Move player
    setPlayerPos({ row: node.row, col: node.col });
    
    // Update metadata with new position
    if (user) {
      try {
        await user.update({
          unsafeMetadata: {
            ...user.publicMetadata,
            playerRow: node.row,
            playerCol: node.col
          }
        });
      } catch (error) {
        console.error('Error updating player position:', error);
      }
    }
    
    // Check for encounters
    if (node.hasEncounter) {
      router.push('/game/battle');
    } else if (node.type === 'town') {
      // Heal in town
      await healPlayer();
    } else if (node.type === 'dungeon') {
      router.push('/game/battle?boss=true');
    }
    
    // Regenerate map after movement
    setTimeout(generateMapGrid, 100);
  };

  const healPlayer = async () => {
    if (!user) return;
    
    try {
      await user.update({
        unsafeMetadata: {
          ...user.publicMetadata,
          hp: 100
        }
      });
      
      setGameData(prev => ({ ...prev, hp: 100 }));
      alert('[TOWN] HP restored to 100!');
    } catch (error) {
      console.error('Error healing player:', error);
    }
  };

  const renderDifficultyBadge = () => {
    const difficultyConfig = {
      simple: { label: 'LVL 1', color: '#00ff00' },
      precalc: { label: 'LVL 2', color: '#ffff00' },
      calculus: { label: 'LVL 3', color: '#ff0000' }
    };
    
    const config = difficultyConfig[gameData.difficulty];
    
    return (
      <div className={styles.difficultyBadge} style={{ color: config.color }}>
        {config.label}
      </div>
    );
  };

  const renderHealthBar = () => {
    const percentage = (gameData.hp / 100) * 100;
    const hearts = Math.ceil(gameData.hp / 20); // 5 hearts total
    
    return (
      <div className={styles.healthBarContainer}>
        <div className={styles.healthBarLabel}>
          <span>HP:</span>
          <span>{gameData.hp}/100</span>
        </div>
        <div className={styles.healthBarBackground}>
          <div 
            className={styles.healthBarFill}
            style={{ width: `${percentage}%` }}
          />
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 2px'
          }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ 
                color: i < hearts ? '#ff0000' : '#333333',
                fontSize: '12px'
              }}>
                ♥
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getTileSymbol = (type: TileType) => {
    switch (type) {
      case 'grass': return '.';
      case 'path': return '.';
      case 'water': return '~';
      case 'mountain': return '^';
      case 'town': return 'T';
      case 'dungeon': return 'D';
      default: return '.';
    }
  };

  if (!isLoaded || isUpdatingMetadata) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingPixel}></div>
        <p className={styles.loadingText}>LOADING...</p>
      </div>
    );
  }
  
  if (!user) {
    return <NotUser />;
  }

  return (
    <div className={styles.gameContainer}>
      {/* Header */}
      <header className={styles.gameHeader}>
        <h1 className={styles.gameTitle}> Retro Shift </h1>
        
        <div className={styles.playerStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>PLAYER:</span>
            <span className={styles.statValue}>{user.firstName?.toUpperCase() || 'ADVENTURER'}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>LEVEL:</span>
            <span className={styles.statValue}>{gameData.level}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>DIFF:</span>
            {renderDifficultyBadge()}
          </div>
        </div>
        
        {renderHealthBar()}
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{gameData.wins}</div>
            <div className={styles.statName}>WINS</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{gameData.losses}</div>
            <div className={styles.statName}>LOSSES</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{gameData.gold}</div>
            <div className={styles.statName}>GOLD</div>
          </div>
        </div>
      </header>
      
      {/* Map */}
      <main className={styles.mapContainer}>
        <h2 className={styles.mapTitle}>THE DUNGEON</h2>
        
        <div className={styles.mapGrid}>
          {mapGrid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className={styles.mapRow}>
              {row.map((node) => (
                <button
                  key={node.id}
                  className={`${styles.mapTile} ${styles[node.type]} ${
                    node.accessible ? styles.accessible : ''
                  }`}
                  onClick={() => handleTileClick(node)}
                  disabled={!node.accessible}
                  title={`${node.type.toUpperCase()}${node.hasEncounter ? ' [ENCOUNTER]' : ''}`}
                >
                  {node.row === playerPos.row && node.col === playerPos.col ? '@' : getTileSymbol(node.type)}
                  {node.hasEncounter && node.accessible && '!'}
                </button>
              ))}
            </div>
          ))}
        </div>
        
        <div className={styles.mapLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendTile} ${styles.town}`}>T</div>
            <span>TOWN (SAFE)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendTile} ${styles.dungeon}`}>D</div>
            <span>DUNGEON (BOSS)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendTile} ${styles.path}`}>@</div>
            <span>YOU</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendTile} ${styles.grass}`}>!</div>
            <span>ENCOUNTER</span>
          </div>
        </div>
      </main>
      
      {/* Controls */}
      <footer className={styles.gameFooter}>
        <div className={styles.controls}>
          <button 
            className={styles.controlButton}
            onClick={() => router.push('/game/battle')}
          >
            QUICK BATTLE
          </button>
          <button 
            className={styles.controlButtonSecondary}
            onClick={() => {
              generateMapGrid();
              alert('MAP REFRESHED');
            }}
          >
            REFRESH MAP
          </button>
        </div>
        <div className={styles.gameHint}>
          <p>MOVE TO ADJACENT TILES | ENCOUNTERS = MATH BATTLES | TOWN = HEAL</p>
        </div>
      </footer>
    </div>
  );
}