'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './page.module.css';

interface BattleStats {
  playerHp: number;
  enemyHp: number;
  playerMaxHp: number;
  enemyMaxHp: number;
  turn: 'player' | 'enemy';
  battleStatus: 'active' | 'won' | 'lost' | 'fled';
  round: number;
}

interface MathProblem {
  id: number;
  question: string;
  answer: number;
  choices: number[];
  difficulty: 'simple' | 'precalc' | 'calculus';
  explanation: string;
  timeLimit: number;
}

interface Enemy {
  id: number;
  name: string;
  type: 'arithmetic' | 'algebra' | 'calculus';
  difficulty: 'simple' | 'precalc' | 'calculus';
  description: string;
  damage: number;
  maxHp: number;
  xpReward: number;
  goldReward: number;
  ascii: string[];
}

const ENEMIES: Enemy[] = [
  {
    id: 1,
    name: 'Arithmetic Golem',
    type: 'arithmetic',
    difficulty: 'simple',
    description: 'Basic arithmetic operations',
    damage: 10,
    maxHp: 80,
    xpReward: 10,
    goldReward: 5,
    ascii: [
      "  ▄▄▄▄▄  ",
      " ███████ ",
      "██  ██  ██",
      "███    ███",
      " ███████ ",
      "  ▀▀▀▀▀  "
    ]
  },
  {
    id: 2,
    name: 'Fraction Fiend',
    type: 'algebra',
    difficulty: 'simple',
    description: 'Fractions and basic algebra',
    damage: 12,
    maxHp: 70,
    xpReward: 15,
    goldReward: 8,
    ascii: [
      "   ███   ",
      "  █████  ",
      " ██▀▀▀██ ",
      "██▄▄▄▄▄██",
      " ███████ ",
      "  ▀▀▀▀▀  "
    ]
  },
  {
    id: 3,
    name: 'Trigonometry Titan',
    type: 'algebra',
    difficulty: 'precalc',
    description: 'Trigonometric functions',
    damage: 15,
    maxHp: 100,
    xpReward: 25,
    goldReward: 15,
    ascii: [
      "  ▄▄▄▄▄▄  ",
      " ████████ ",
      "██░░░░░░██",
      "██░████░██",
      "██░░░░░░██",
      " ████████ ",
      "  ▀▀▀▀▀▀  "
    ]
  },
  {
    id: 4,
    name: 'Logarithmic Lich',
    type: 'algebra',
    difficulty: 'precalc',
    description: 'Logarithms and exponents',
    damage: 18,
    maxHp: 90,
    xpReward: 30,
    goldReward: 20,
    ascii: [
      "   ▄▄▄   ",
      "  █████  ",
      " ██▀▀▀██ ",
      "███▄▄▄███",
      " ███████ ",
      "  ▀▀█▀▀  "
    ]
  },
  {
    id: 5,
    name: 'Derivative Dragon',
    type: 'calculus',
    difficulty: 'calculus',
    description: 'Derivatives and rates of change',
    damage: 20,
    maxHp: 120,
    xpReward: 50,
    goldReward: 30,
    ascii: [
      "    ▄▄▄▄▄    ",
      "   ███████   ",
      "  ██▀▀▀▀▀██  ",
      " ██▄▄▄▄▄▄▄██ ",
      "██▀▀▀▀▀▀▀▀▀██",
      " ███████████ ",
      "  ▀▀▀▀▀▀▀▀▀  "
    ]
  },
  {
    id: 6,
    name: 'Integral Behemoth',
    type: 'calculus',
    difficulty: 'calculus',
    description: 'Integration and area under curves',
    damage: 22,
    maxHp: 110,
    xpReward: 60,
    goldReward: 35,
    ascii: [
      "  ▄▄▄▄▄▄▄  ",
      " █████████ ",
      "██▄▄▄▄▄▄▄██",
      "██▀▀▀▀▀▀▀██",
      "██▄▄▄▄▄▄▄██",
      " █████████ ",
      "  ▀▀▀▀▀▀▀  "
    ]
  }
];

export default function BattlePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monsterId = searchParams.get('monster');
  const isRandom = searchParams.get('random') === 'true';
  
  const [battleStats, setBattleStats] = useState<BattleStats>({
    playerHp: 100,
    enemyHp: 100,
    playerMaxHp: 100,
    enemyMaxHp: 100,
    turn: 'player',
    battleStatus: 'active',
    round: 1
  });
  
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [battleLog, setBattleLog] = useState<string[]>(['Battle initialized. Prepare for combat!']);
  const [playerDifficulty, setPlayerDifficulty] = useState<'simple' | 'precalc' | 'calculus'>('simple');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    
    const initializeBattle = () => {
      try {
        const metadata = user.publicMetadata;
        const difficulty = metadata.difficulty as 'simple' | 'precalc' | 'calculus' || 'simple';
        setPlayerDifficulty(difficulty);
        
        const playerHp = typeof metadata.hp === 'number' ? metadata.hp : 100;
        
        // Select enemy
        let enemy: Enemy;
        if (monsterId) {
          enemy = ENEMIES.find(e => e.id === parseInt(monsterId)) || ENEMIES[0];
        } else if (isRandom) {
          const unlockedEnemies = ENEMIES.filter(e => 
            e.difficulty === difficulty || 
            (difficulty === 'precalc' && e.difficulty === 'simple') ||
            (difficulty === 'calculus' && ['simple', 'precalc'].includes(e.difficulty))
          );
          enemy = unlockedEnemies[Math.floor(Math.random() * unlockedEnemies.length)];
        } else {
          // Default to first enemy
          enemy = ENEMIES[0];
        }
        
        setCurrentEnemy(enemy);
        
        // Generate first problem
        const problem = generateMathProblem(difficulty);
        setCurrentProblem(problem);
        
        setBattleStats(prev => ({
          ...prev,
          playerHp,
          enemyHp: enemy.maxHp,
          enemyMaxHp: enemy.maxHp
        }));
        
        addToBattleLog(`ENCOUNTER: ${enemy.name}`);
        addToBattleLog(`DIFFICULTY: ${difficulty.toUpperCase()}`);
        
        // Start timer
        setTimeLeft(problem.timeLimit);
        
      } catch (error) {
        console.error('Error initializing battle:', error);
        const enemy = ENEMIES[0];
        const problem = generateMathProblem('simple');
        setCurrentEnemy(enemy);
        setCurrentProblem(problem);
        addToBattleLog('Battle initialized with simple difficulty.');
      }
    };
    
    initializeBattle();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, isLoaded, monsterId, isRandom]);
  useEffect(() => {
  if (battleStats.battleStatus !== "active" || !currentProblem) return;

  timerRef.current = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        handleTimeOut();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, [battleStats.battleStatus, currentProblem]);

  
  useEffect(() => {
    if (inputRef.current && battleStats.turn === 'player') {
      inputRef.current.focus();
    }
  }, [battleStats.turn, currentProblem]);

  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 8)]);
  };

  const generateMathProblem = useCallback((difficulty: string): MathProblem => {
    let question = '';
    let answer = 0;
    let explanation = '';
    let timeLimit = 30;
    
    switch (difficulty) {
      case 'simple':
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        switch (operation) {
          case '+':
            answer = num1 + num2;
            question = `${num1} + ${num2} = ?`;
            explanation = `Add ${num1} and ${num2}`;
            timeLimit = 20;
            break;
          case '-':
            answer = Math.max(num1, num2) - Math.min(num1, num2);
            question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
            explanation = `Subtract ${Math.min(num1, num2)} from ${Math.max(num1, num2)}`;
            timeLimit = 20;
            break;
          case '*':
            const smallNum1 = Math.floor(Math.random() * 12) + 1;
            const smallNum2 = Math.floor(Math.random() * 12) + 1;
            answer = smallNum1 * smallNum2;
            question = `${smallNum1} × ${smallNum2} = ?`;
            explanation = `Multiply ${smallNum1} by ${smallNum2}`;
            timeLimit = 25;
            break;
        }
        break;
        
      case 'precalc':
        const problemTypes = ['algebra', 'trig', 'log'];
        const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (problemType) {
          case 'algebra':
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = Math.floor(Math.random() * 10) + 1;
            answer = (c - b) / a;
            question = `Solve: ${a}x + ${b} = ${c}`;
            explanation = `x = (${c} - ${b}) / ${a}`;
            timeLimit = 30;
            break;
          case 'trig':
            const angles = [0, 30, 45, 60, 90, 180, 270, 360];
            const angle = angles[Math.floor(Math.random() * angles.length)];
            const trigFuncs = ['sin', 'cos', 'tan'];
            const trigFunc = trigFuncs[Math.floor(Math.random() * trigFuncs.length)];
            
            switch (trigFunc) {
              case 'sin':
                answer = Math.round(Math.sin(angle * Math.PI / 180) * 100) / 100;
                question = `sin(${angle}°) = ?`;
                explanation = `Sine of ${angle} degrees`;
                break;
              case 'cos':
                answer = Math.round(Math.cos(angle * Math.PI / 180) * 100) / 100;
                question = `cos(${angle}°) = ?`;
                explanation = `Cosine of ${angle} degrees`;
                break;
              case 'tan':
                answer = Math.round(Math.tan(angle * Math.PI / 180) * 100) / 100;
                question = `tan(${angle}°) = ?`;
                explanation = `Tangent of ${angle} degrees`;
                break;
            }
            timeLimit = 35;
            break;
          case 'log':
            const base = Math.floor(Math.random() * 3) + 2;
            const exponent = Math.floor(Math.random() * 4) + 1;
            const value = Math.pow(base, exponent);
            answer = exponent;
            question = `log_${base}(${value}) = ?`;
            explanation = `${base}^? = ${value}`;
            timeLimit = 35;
            break;
        }
        break;
        
      case 'calculus':
        const calcTypes = ['derivative', 'integral', 'limit'];
        const calcType = calcTypes[Math.floor(Math.random() * calcTypes.length)];
        
        switch (calcType) {
          case 'derivative':
            const coeff = Math.floor(Math.random() * 5) + 1;
            const power = Math.floor(Math.random() * 3) + 2;
            answer = coeff * power;
            question = `d/dx [${coeff}x^${power}] at x=1`;
            explanation = `${coeff}*${power}*x^${power-1}`;
            timeLimit = 40;
            break;
          case 'integral':
            const intCoeff = Math.floor(Math.random() * 4) + 1;
            const intPower = Math.floor(Math.random() * 2) + 1;
            answer = intCoeff / (intPower + 1);
            question = `∫${intCoeff}x^${intPower} dx (x=1, ignore +C)`;
            explanation = `${intCoeff}x^${intPower+1}/${intPower+1}`;
            timeLimit = 45;
            break;
          case 'limit':
            answer = 1;
            question = `lim(x→0) sin(x)/x`;
            explanation = `Standard limit = 1`;
            timeLimit = 40;
            break;
        }
        break;
    }
    
    // Generate choices
    const choices = [answer];
    for (let i = 0; i < 3; i++) {
      let wrongAnswer;
      if (difficulty === 'calculus') {
        wrongAnswer = answer + (Math.random() > 0.5 ? 0.5 : -0.5) * (i + 1);
      } else {
        wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (i + 1);
      }
      
      if (choices.includes(wrongAnswer)) {
        wrongAnswer += 1;
      }
      
      choices.push(wrongAnswer);
    }
    
    // Shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    return {
      id: Date.now(),
      question,
      answer,
      choices,
      difficulty: difficulty as 'simple' | 'precalc' | 'calculus',
      explanation,
      timeLimit
    };
  }, []);

  const handleTimeOut = () => {
    if (battleStats.battleStatus !== 'active') return;
    
    const damage = currentEnemy?.damage || 10;
    const newPlayerHp = Math.max(0, battleStats.playerHp - damage);
    
    setBattleStats(prev => ({
      ...prev,
      playerHp: newPlayerHp,
      turn: 'enemy'
    }));
    
    setFeedback('TIME OUT! You took damage!');
    setCombo(0);
    addToBattleLog(`Time out! Took ${damage} damage.`);
    
    if (newPlayerHp <= 0) {
      handleBattleLoss();
      return;
    }
    
    setTimeout(handleEnemyTurn, 1000);
  };

  const handleSubmitAnswer = async () => {
    if (!currentProblem || !currentEnemy || isProcessing || battleStats.battleStatus !== 'active') return;
    
    setIsProcessing(true);
    if (timerRef.current) {
  clearInterval(timerRef.current);
  timerRef.current = null;
}

    
    const submittedAnswer = parseFloat(userAnswer);
    const isCorrect = Math.abs(submittedAnswer - currentProblem.answer) < 0.001;
    
    if (isCorrect) {
      // Calculate damage based on time left and combo
      const timeBonus = Math.floor(timeLeft / 5);
      const comboBonus = combo * 2;
      const baseDamage = 20;
      const totalDamage = baseDamage + timeBonus + comboBonus;
      
      const newEnemyHp = Math.max(0, battleStats.enemyHp - totalDamage);
      const newCombo = combo + 1;
      const newScore = score + (timeLeft * 10) + (combo * 50);
      
      setBattleStats(prev => ({
        ...prev,
        enemyHp: newEnemyHp,
        round: prev.round + 1
      }));
      
      setCombo(newCombo);
      setScore(newScore);
      
      setFeedback(`CORRECT! ${totalDamage} damage! Combo: x${newCombo}`);
      addToBattleLog(`Hit! ${totalDamage} damage (Combo: x${newCombo})`);
      
      if (newEnemyHp <= 0) {
        await handleBattleWin();
        setIsProcessing(false);
        return;
      }
      
      // Enemy turn
      setTimeout(() => {
        handleEnemyTurn();
      }, 1500);
      
    } else {
      // Incorrect answer
      const damage = currentEnemy.damage + Math.floor(Math.random() * 5);
      const newPlayerHp = Math.max(0, battleStats.playerHp - damage);
      
      setBattleStats(prev => ({
        ...prev,
        playerHp: newPlayerHp,
        turn: 'enemy'
      }));
      
      setCombo(0);
      setFeedback(`WRONG! Answer was ${currentProblem.answer}. Took ${damage} damage!`);
      addToBattleLog(`Wrong! Took ${damage} damage.`);
      
      if (newPlayerHp <= 0) {
        await handleBattleLoss();
        setIsProcessing(false);
        return;
      }
    }
    
    // Generate new problem
    setTimeout(() => {
      const newProblem = generateMathProblem(playerDifficulty);
      setCurrentProblem(newProblem);
      setUserAnswer('');
      setTimeLeft(newProblem.timeLimit);
      setFeedback('');
      setBattleStats(prev => ({ ...prev, turn: 'player' }));
      setIsProcessing(false);
    }, 1000);
  };

  const handleEnemyTurn = () => {
    if (!currentEnemy || battleStats.battleStatus !== 'active') return;
    
    const damage = currentEnemy.damage + Math.floor(Math.random() * 8);
    const newPlayerHp = Math.max(0, battleStats.playerHp - damage);
    
    setBattleStats(prev => ({
      ...prev,
      playerHp: newPlayerHp,
      turn: 'player'
    }));
    
    addToBattleLog(`${currentEnemy.name} attacks for ${damage} damage!`);
    
    if (newPlayerHp <= 0) {
      handleBattleLoss();
    } else {
      // Start timer for next player turn
      if (currentProblem) {
        setTimeLeft(currentProblem.timeLimit);
      }
    }
  };

  const handleBattleWin = async () => {
    setBattleStats(prev => ({ ...prev, battleStatus: 'won' }));
    setFeedback('VICTORY! Monster defeated!');
    addToBattleLog('*** VICTORY ***');
    
    if (user && currentEnemy) {
      try {
        const metadata = user.publicMetadata;
        const currentWins = typeof metadata.wins === 'number' ? metadata.wins : 0;
        const currentGold = typeof metadata.gold === 'number' ? metadata.gold : 0;
        const currentXP = typeof metadata.xp === 'number' ? metadata.xp : 0;
        const currentLevel = typeof metadata.level === 'number' ? metadata.level : 1;
        const battleLog = Array.isArray(metadata.battleLog) ? metadata.battleLog : [];
        
        // Calculate XP needed for next level
        const xpNeeded = 100 * Math.pow(1.5, currentLevel - 1);
        const newXP = currentXP + currentEnemy.xpReward;
        const newLevel = newXP >= xpNeeded ? currentLevel + 1 : currentLevel;
        
        // Add to battle log
        const logEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          enemy: currentEnemy.name,
          result: 'won' as const,
          xpGained: currentEnemy.xpReward,
          goldGained: currentEnemy.goldReward
        };
        
        await user.update({
          unsafeMetadata: {
            ...metadata,
            wins: currentWins + 1,
            gold: currentGold + currentEnemy.goldReward,
            xp: newXP,
            level: newLevel,
            hp: Math.min(100, battleStats.playerHp + 20),
            battleLog: [...battleLog, logEntry].slice(-10)
          }
        });
        
      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    }
    
    setTimeout(() => {
      router.push('/game');
    }, 3000);
  };

  const handleBattleLoss = async () => {
    setBattleStats(prev => ({ ...prev, battleStatus: 'lost' }));
    setFeedback('DEFEAT! Try again!');
    addToBattleLog('*** DEFEAT ***');
    
    if (user && currentEnemy) {
      try {
        const metadata = user.publicMetadata;
        const currentLosses = typeof metadata.losses === 'number' ? metadata.losses : 0;
        const battleLog = Array.isArray(metadata.battleLog) ? metadata.battleLog : [];
        
        const logEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          enemy: currentEnemy.name,
          result: 'lost' as const,
          xpGained: 0,
          goldGained: 0
        };
        
        await user.update({
          unsafeMetadata: {
            ...metadata,
            losses: currentLosses + 1,
            hp: 50,
            battleLog: [...battleLog, logEntry].slice(-10)
          }
        });
      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    }
    
    setTimeout(() => {
      router.push('/game');
    }, 3000);
  };

  const handleFlee = () => {
    if (battleStats.battleStatus !== 'active') return;
    
    setBattleStats(prev => ({ ...prev, battleStatus: 'fled' }));
    setFeedback('Retreated from battle!');
    addToBattleLog('Retreated from battle.');
    
    if (user) {
      try {
        const metadata = user.publicMetadata;
        const currentLosses = typeof metadata.losses === 'number' ? metadata.losses : 0;
        const battleLog = Array.isArray(metadata.battleLog) ? metadata.battleLog : [];
        
        const logEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          enemy: currentEnemy?.name || 'Unknown',
          result: 'fled' as const,
          xpGained: 0,
          goldGained: 0
        };
        
        user.update({
          unsafeMetadata: {
            ...metadata,
            losses: currentLosses + 1,
            hp: Math.max(1, battleStats.playerHp - 20),
            battleLog: [...battleLog, logEntry].slice(-10)
          }
        });
      } catch (error) {
        console.error('Error updating metadata:', error);
      }
    }
    
    setTimeout(() => {
      router.push('/game');
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing && battleStats.battleStatus === 'active') {
      handleSubmitAnswer();
    } else if (e.key === 'Escape') {
      router.push('/game');
    }
  };

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>LOADING BATTLE...</p>
      </div>
    );
  }

  return (
    <div className={styles.battleContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/game')}
          >
            ← BACK TO DASHBOARD
          </button>
          <h1 className={styles.title}>MATH BATTLE ARENA</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.scoreDisplay}>
            SCORE: <span className={styles.scoreValue}>{score}</span>
          </div>
          <div className={styles.comboDisplay}>
            COMBO: <span className={styles.comboValue}>x{combo}</span>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Battle Arena */}
        <div className={styles.battleArena}>
          {/* Player Section */}
          <div className={styles.playerSection}>
            <div className={styles.characterCard}>
              <div className={styles.characterAscii}>
                <div className={styles.asciiBox}>
                  {[
                    "   ▄▄▄▄▄   ",
                    "  ███████  ",
                    " ██     ██ ",
                    "██  ███  ██",
                    "██       ██",
                    " ██     ██ ",
                    "  ███████  ",
                    "   ▀▀▀▀▀   "
                  ].map((line, i) => (
                    <div key={i} className={styles.asciiLine}>{line}</div>
                  ))}
                </div>
              </div>
              <div className={styles.characterInfo}>
                <h3>{user?.firstName?.toUpperCase() || 'HERO'}</h3>
                <div className={styles.hpBar}>
                  <div className={styles.hpLabel}>HP</div>
                  <div className={styles.hpBarContainer}>
                    <div 
                      className={styles.hpBarFill}
                      style={{ width: `${(battleStats.playerHp / battleStats.playerMaxHp) * 100}%` }}
                    ></div>
                  </div>
                  <div className={styles.hpValue}>
                    {battleStats.playerHp}/{battleStats.playerMaxHp}
                  </div>
                </div>
                <div className={styles.statusInfo}>
                  <span className={styles.statusItem}>Level: {playerDifficulty.toUpperCase()}</span>
                  <span className={styles.statusItem}>Turn: {battleStats.turn === 'player' ? 'YOURS' : 'ENEMY'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* VS Separator */}
          <div className={styles.vsSection}>
            <div className={styles.vsBadge}>VS</div>
            <div className={styles.roundInfo}>
              ROUND {battleStats.round}
            </div>
          </div>

          {/* Enemy Section */}
          <div className={styles.enemySection}>
            <div className={styles.characterCard}>
              <div className={styles.characterInfo}>
                <h3>{currentEnemy?.name || 'LOADING...'}</h3>
                <div className={styles.enemyType}>{currentEnemy?.type.toUpperCase()}</div>
                <div className={styles.hpBar}>
                  <div className={styles.hpLabel}>HP</div>
                  <div className={styles.hpBarContainer}>
                    <div 
                      className={styles.hpBarFill}
                      style={{ width: `${(battleStats.enemyHp / battleStats.enemyMaxHp) * 100}%` }}
                    ></div>
                  </div>
                  <div className={styles.hpValue}>
                    {battleStats.enemyHp}/{battleStats.enemyMaxHp}
                  </div>
                </div>
                <div className={styles.rewardInfo}>
                  <span className={styles.rewardItem}>🎯 {currentEnemy?.xpReward || 0} XP</span>
                  <span className={styles.rewardItem}>💰 {currentEnemy?.goldReward || 0} Gold</span>
                </div>
              </div>
              <div className={styles.characterAscii}>
                <div className={styles.asciiBox}>
                  {currentEnemy?.ascii?.map((line, i) => (
                    <div key={i} className={styles.asciiLine}>{line}</div>
                  )) || (
                    <div className={styles.loadingAscii}>Loading...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Math Problem Section */}
        <div className={styles.problemSection}>
          <div className={styles.problemHeader}>
            <h2>MATH CHALLENGE</h2>
            <div className={styles.timer}>
              <div className={styles.timerLabel}>TIME</div>
              <div className={`${styles.timerValue} ${timeLeft < 10 ? styles.warning : ''}`}>
                {timeLeft}s
              </div>
            </div>
          </div>
          
          <div className={styles.problemBox}>
            {currentProblem && (
              <>
                <div className={styles.problemDisplay}>
                  <div className={styles.problemText}>{currentProblem.question}</div>
                  <div className={styles.difficultyBadge}>
                    {currentProblem.difficulty.toUpperCase()}
                  </div>
                </div>
                
                <div className={styles.answerSection}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>YOUR ANSWER:</label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isProcessing || battleStats.battleStatus !== 'active'}
                      className={styles.answerInput}
                      placeholder="Enter answer..."
                    />
                    <button
                      className={styles.submitButton}
                      onClick={handleSubmitAnswer}
                      disabled={isProcessing || battleStats.battleStatus !== 'active' || !userAnswer}
                    >
                      SUBMIT
                    </button>
                  </div>
                  
                  <div className={styles.quickChoices}>
                    <span className={styles.quickLabel}>QUICK SELECT:</span>
                    {currentProblem.choices.map((choice, index) => (
                      <button
                        key={index}
                        className={styles.quickChoice}
                        onClick={() => setUserAnswer(choice.toString())}
                        disabled={isProcessing || battleStats.battleStatus !== 'active'}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {feedback && (
              <div className={`${styles.feedback} ${
                feedback.includes('CORRECT') ? styles.success :
                feedback.includes('WRONG') ? styles.error :
                feedback.includes('TIME') ? styles.warning :
                styles.info
              }`}>
                {feedback}
              </div>
            )}
          </div>
        </div>

        {/* Battle Log */}
        <div className={styles.logSection}>
          <div className={styles.logHeader}>
            <h3>BATTLE LOG</h3>
            <button 
              className={styles.fleeButton}
              onClick={handleFlee}
              disabled={isProcessing || battleStats.battleStatus !== 'active'}
            >
              FLEE BATTLE
            </button>
          </div>
          <div className={styles.logContent}>
            {battleLog.map((entry, index) => (
              <div key={index} className={styles.logEntry}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Battle Result Overlay */}
      {battleStats.battleStatus !== 'active' && (
        <div className={styles.resultOverlay}>
          <div className={`${styles.resultModal} ${styles[battleStats.battleStatus]}`}>
            <h2 className={styles.resultTitle}>
              {battleStats.battleStatus === 'won' ? 'VICTORY!' :
               battleStats.battleStatus === 'lost' ? 'DEFEAT!' : 'RETREAT!'}
            </h2>
            
            <div className={styles.resultContent}>
              {battleStats.battleStatus === 'won' && currentEnemy && (
                <>
                  <div className={styles.resultRewards}>
                    <div className={styles.rewardItem}>
                      <div className={styles.rewardIcon}>🎯</div>
                      <div className={styles.rewardText}>
                        <div className={styles.rewardLabel}>XP GAINED</div>
                        <div className={styles.rewardValue}>+{currentEnemy.xpReward}</div>
                      </div>
                    </div>
                    <div className={styles.rewardItem}>
                      <div className={styles.rewardIcon}>💰</div>
                      <div className={styles.rewardText}>
                        <div className={styles.rewardLabel}>GOLD GAINED</div>
                        <div className={styles.rewardValue}>+{currentEnemy.goldReward}</div>
                      </div>
                    </div>
                    <div className={styles.rewardItem}>
                      <div className={styles.rewardIcon}>⭐</div>
                      <div className={styles.rewardText}>
                        <div className={styles.rewardLabel}>FINAL SCORE</div>
                        <div className={styles.rewardValue}>{score}</div>
                      </div>
                    </div>
                  </div>
                  <p className={styles.resultMessage}>
                    You defeated the {currentEnemy.name}!
                  </p>
                </>
              )}
              
              {battleStats.battleStatus === 'lost' && (
                <p className={styles.resultMessage}>
                  The {currentEnemy?.name} was too strong. Try again!
                </p>
              )}
              
              {battleStats.battleStatus === 'fled' && (
                <p className={styles.resultMessage}>
                  You retreated from battle.
                </p>
              )}
              
              <div className={styles.resultTimer}>
                Returning to dashboard in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}