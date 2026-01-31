'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import styles from '../page.module.css';

// Battle types and interfaces
interface BattleStats {
  playerHp: number;
  enemyHp: number;
  playerMaxHp: number;
  enemyMaxHp: number;
  turn: 'player' | 'enemy';
  battleStatus: 'active' | 'won' | 'lost' | 'fled';
}

interface MathProblem {
  id: number;
  question: string;
  answer: number;
  choices: number[];
  difficulty: 'simple' | 'precalc' | 'calculus';
  explanation: string;
}

interface Enemy {
  id: number;
  name: string;
  type: 'arithmetic' | 'algebra' | 'calculus';
  difficulty: 'simple' | 'precalc' | 'calculus';
  description: string;
  damage: number;
  maxHp: number;
}

export default function BattlePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // Battle state
  const [battleStats, setBattleStats] = useState<BattleStats>({
    playerHp: 100,
    enemyHp: 100,
    playerMaxHp: 100,
    enemyMaxHp: 100,
    turn: 'player',
    battleStatus: 'active'
  });
  const DIFFICULTY_CONFIG = {
  simple: {
    damageMultiplier: 1,
    enemyDamageMultiplier: 1,
    healOnWin: 15,
    xpReward: 10,
  },
  precalc: {
    damageMultiplier: 1.4,
    enemyDamageMultiplier: 1.2,
    healOnWin: 25,
    xpReward: 25,
  },
  calculus: {
    damageMultiplier: 1.8,
    enemyDamageMultiplier: 1.5,
    healOnWin: 40,
    xpReward: 50,
  },
} as const;


  
  // Game state
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerDifficulty, setPlayerDifficulty] = useState<'simple' | 'precalc' | 'calculus'>('simple');
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState<boolean>(false);
  const [difficultyLocked, setDifficultyLocked] = useState(false);

  // Initialize battle based on user difficulty
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    const initializeBattle = async () => {
      try {
        const metadata = user.publicMetadata;
        const difficulty = metadata.difficulty as 'simple' | 'precalc' | 'calculus' || 'simple';
        setPlayerDifficulty(difficulty);
        
        // Load player stats from metadata
        const playerHp = typeof metadata.hp === 'number' ? metadata.hp : 100;
        const playerMaxHp = 100; // Max HP is always 100
        
        // Generate enemy based on difficulty
        const enemy = generateEnemy(difficulty);
        setCurrentEnemy(enemy);
        
        // Generate first math problem
        const problem = generateMathProblem(difficulty);
        setCurrentProblem(problem);
        
        // Initialize battle stats
        setBattleStats(prev => ({
          ...prev,
          playerHp,
          playerMaxHp,
          enemyHp: enemy.maxHp,
          enemyMaxHp: enemy.maxHp
        }));
        
        // Initial battle log entry
        setBattleLog(prev => [...prev, `A wild ${enemy.name} appears!`, `Difficulty: ${difficulty.toUpperCase()}`]);
        
      } catch (error) {
        console.error('Error initializing battle:', error);
        // Default fallback
        const enemy = generateEnemy('simple');
        const problem = generateMathProblem('simple');
        setCurrentEnemy(enemy);
        setCurrentProblem(problem);
        setBattleStats(prev => ({
          ...prev,
          enemyHp: enemy.maxHp,
          enemyMaxHp: enemy.maxHp
        }));
        setBattleLog(prev => [...prev, `A wild ${enemy.name} appears!`, `Battle initialized with simple difficulty.`]);
      }
    };
    
    initializeBattle();
  }, [user, isLoaded]);
  
  // Generate enemy based on difficulty
  const generateEnemy = useCallback((difficulty: string): Enemy => {
    const enemies: Record<string, Enemy[]> = {
      simple: [
        {
          id: 1,
          name: 'Arithmetic Golem',
          type: 'arithmetic',
          difficulty: 'simple',
          description: 'A creature made of numbers and basic operations',
          damage: 10,
          maxHp: 80
        },
        {
          id: 2,
          name: 'Fraction Fiend',
          type: 'algebra',
          difficulty: 'simple',
          description: 'Lurks in the shadows of denominators',
          damage: 12,
          maxHp: 70
        }
      ],
      precalc: [
        {
          id: 3,
          name: 'Trigonometry Titan',
          type: 'algebra',
          difficulty: 'precalc',
          description: 'Wielder of sine, cosine, and tangent',
          damage: 15,
          maxHp: 100
        },
        {
          id: 4,
          name: 'Logarithmic Lich',
          type: 'algebra',
          difficulty: 'precalc',
          description: 'Master of exponential decay and growth',
          damage: 18,
          maxHp: 90
        }
      ],
      calculus: [
        {
          id: 5,
          name: 'Derivative Dragon',
          type: 'calculus',
          difficulty: 'calculus',
          description: 'Breathes rates of change and slopes',
          damage: 20,
          maxHp: 120
        },
        {
          id: 6,
          name: 'Integral Behemoth',
          type: 'calculus',
          difficulty: 'calculus',
          description: 'Guards the area under curves',
          damage: 22,
          maxHp: 110
        }
      ]
    };
    
    const difficultyEnemies = enemies[difficulty] || enemies.simple;
    return difficultyEnemies[Math.floor(Math.random() * difficultyEnemies.length)];
  }, []);
  
  // Generate math problem based on difficulty
  const generateMathProblem = useCallback((difficulty: string): MathProblem => {
    let question = '';
    let answer = 0;
    let explanation = '';
    
    switch (difficulty) {
      case 'simple':
        // Simple arithmetic
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        switch (operation) {
          case '+':
            answer = num1 + num2;
            question = `${num1} + ${num2} = ?`;
            explanation = `Add ${num1} and ${num2} together`;
            break;
          case '-':
            answer = Math.max(num1, num2) - Math.min(num1, num2);
            question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
            explanation = `Subtract the smaller number from the larger number`;
            break;
          case '*':
            const smallNum1 = Math.floor(Math.random() * 12) + 1;
            const smallNum2 = Math.floor(Math.random() * 12) + 1;
            answer = smallNum1 * smallNum2;
            question = `${smallNum1} × ${smallNum2} = ?`;
            explanation = `Multiply ${smallNum1} by ${smallNum2}`;
            break;
        }
        break;
        
      case 'precalc':
        // Precalculus problems
        const problemTypes = ['algebra', 'trig', 'log'];
        const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch (problemType) {
          case 'algebra':
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            const c = Math.floor(Math.random() * 10) + 1;
            answer = (c - b) / a;
            question = `Solve for x: ${a}x + ${b} = ${c}`;
            explanation = `Subtract ${b} from both sides, then divide by ${a}`;
            break;
          case 'trig':
            const angle = Math.floor(Math.random() * 4) * 90; // 0, 90, 180, 270
            const trigFuncs = ['sin', 'cos'];
            const trigFunc = trigFuncs[Math.floor(Math.random() * trigFuncs.length)];
            
            switch (trigFunc) {
              case 'sin':
                answer = Math.sin(angle * Math.PI / 180);
                question = `sin(${angle}°) = ?`;
                explanation = `Sine of ${angle} degrees`;
                break;
              case 'cos':
                answer = Math.cos(angle * Math.PI / 180);
                question = `cos(${angle}°) = ?`;
                explanation = `Cosine of ${angle} degrees`;
                break;
            }
            break;
          case 'log':
            const base = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
            const value = Math.pow(base, Math.floor(Math.random() * 3) + 1); // base^2, base^3, base^4
            answer = Math.log(value) / Math.log(base);
            question = `log_${base}(${value}) = ?`;
            explanation = `The exponent that raises ${base} to get ${value}`;
            break;
        }
        break;
        
      case 'calculus':
        // Calculus problems
        const calcTypes = ['derivative', 'integral'];
        const calcType = calcTypes[Math.floor(Math.random() * calcTypes.length)];
        
        switch (calcType) {
          case 'derivative':
            const coeff = Math.floor(Math.random() * 5) + 1;
            const power = Math.floor(Math.random() * 3) + 2;
            answer = coeff * power;
            question = `d/dx [${coeff}x^${power}] = ?`;
            explanation = `Multiply coefficient ${coeff} by power ${power}`;
            break;
          case 'integral':
            const intCoeff = Math.floor(Math.random() * 4) + 1;
            const intPower = Math.floor(Math.random() * 2) + 1;
            answer = intCoeff / (intPower + 1);
            question = `∫${intCoeff}x^${intPower} dx = ? (evaluate at x=1, ignore +C)`;
            explanation = `Divide coefficient ${intCoeff} by ${intPower + 1}`;
            break;
        }
        break;
    }
    
    // Generate multiple choice options
    const choices = generateChoices(answer, difficulty);
    
    return {
      id: Date.now(),
      question,
      answer,
      choices,
      difficulty: difficulty as 'simple' | 'precalc' | 'calculus',
      explanation
    };
  }, []);
  
  // Generate multiple choice options
  const generateChoices = useCallback((correctAnswer: number, difficulty: string): number[] => {
    const choices = [correctAnswer];
    
    // Generate 3 wrong answers based on difficulty
    for (let i = 0; i < 3; i++) {
      let wrongAnswer;
      
      switch (difficulty) {
        case 'simple':
          wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
          break;
        case 'precalc':
          wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
          break;
        case 'calculus':
          wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 0.5 : -0.5) * (Math.floor(Math.random() * 4) + 1);
          break;
        default:
          wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      }
      
      // Ensure wrong answer is different from correct answer and other wrong answers
      while (choices.includes(wrongAnswer) || wrongAnswer === correctAnswer) {
        wrongAnswer += (Math.random() > 0.5 ? 1 : -1);
      }
      
      choices.push(wrongAnswer);
    }
    
    // Shuffle the choices
    return choices.sort(() => Math.random() - 0.5);
  }, []);
  
  // Handle answer submission
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentProblem || !currentEnemy || isProcessing || battleStats.battleStatus !== 'active') return;
    
    setIsProcessing(true);
    const submittedAnswer = selectedChoice !== null ? selectedChoice : parseFloat(userAnswer);
    
    if (isNaN(submittedAnswer)) {
      setFeedback('Please enter a valid number or select an option!');
      setIsProcessing(false);
      return;
    }
    
    const isCorrect = Math.abs(submittedAnswer - currentProblem.answer) < 0.001; // Allow for floating point errors
    
    if (isCorrect) {
      // Player deals damage to enemy
      const damageDealt = 20 + Math.floor(Math.random() * 10); // 20-29 damage
      const newEnemyHp = Math.max(0, battleStats.enemyHp - damageDealt);
      
      setBattleStats(prev => ({
        ...prev,
        enemyHp: newEnemyHp,
        turn: 'enemy'
      }));
      
      setFeedback(`Correct! You dealt ${damageDealt} damage to ${currentEnemy.name}!`);
      setBattleLog(prev => [...prev, `You answered correctly and dealt ${damageDealt} damage!`]);
      
      // Check if enemy is defeated
      if (newEnemyHp <= 0) {
        await handleBattleWin();
        setIsProcessing(false);
        return;
      }
      
      // Enemy's turn after a delay
      setTimeout(() => {
        handleEnemyTurn();
      }, 1500);
      
    } else {
      // Player takes damage for wrong answer
      const damageTaken = currentEnemy.damage + Math.floor(Math.random() * 5);
      const newPlayerHp = Math.max(0, battleStats.playerHp - damageTaken);
      
      setBattleStats(prev => ({
        ...prev,
        playerHp: newPlayerHp,
        turn: 'enemy'
      }));
      
      setFeedback(`Incorrect! The answer was ${currentProblem.answer}. ${currentEnemy.name} deals ${damageTaken} damage!`);
      setBattleLog(prev => [...prev, `You answered incorrectly and took ${damageTaken} damage!`]);
      
      // Check if player is defeated
      if (newPlayerHp <= 0) {
        await handleBattleLoss();
        setIsProcessing(false);
        return;
      }
      
      // Generate new problem for next turn
      setTimeout(() => {
        const newProblem = generateMathProblem(playerDifficulty);
        setCurrentProblem(newProblem);
        setUserAnswer('');
        setSelectedChoice(null);
        setFeedback('');
        setBattleStats(prev => ({ ...prev, turn: 'player' }));
        setIsProcessing(false);
      }, 1500);
    }
  }, [currentProblem, currentEnemy, battleStats, userAnswer, selectedChoice, isProcessing, playerDifficulty, generateMathProblem]);
  
  // Handle enemy's turn
  const handleEnemyTurn = useCallback(() => {
    if (!currentEnemy || battleStats.battleStatus !== 'active') return;
    
    const damageTaken = currentEnemy.damage + Math.floor(Math.random() * 5);
    const newPlayerHp = Math.max(0, battleStats.playerHp - damageTaken);
    
    setBattleStats(prev => ({
      ...prev,
      playerHp: newPlayerHp,
      turn: 'player'
    }));
    
    setBattleLog(prev => [...prev, `${currentEnemy.name} attacks you for ${damageTaken} damage!`]);
    
    // Check if player is defeated
    if (newPlayerHp <= 0) {
      handleBattleLoss();
      return;
    }
    
    // Generate new problem for player's turn
    const newProblem = generateMathProblem(playerDifficulty);
    setCurrentProblem(newProblem);
    setUserAnswer('');
    setSelectedChoice(null);
    setFeedback('');
    setIsProcessing(false);
  }, [currentEnemy, battleStats, playerDifficulty, generateMathProblem]);
  
  // Handle battle win
  const handleBattleWin = useCallback(async () => {
    setBattleStats(prev => ({ ...prev, battleStatus: 'won' }));
    setFeedback(`Victory! You defeated ${currentEnemy?.name}!`);
    setBattleLog(prev => [...prev, `You defeated ${currentEnemy?.name}!`, 'Victory! Returning to map...']);
    
    // Update user metadata with win
    if (user) {
      setIsUpdatingMetadata(true);
      try {
        const metadata = user.publicMetadata;
        const currentWins = typeof metadata.wins === 'number' ? metadata.wins : 0;
        
        await user.update({
         unsafeMetadata: {
            ...metadata,
            wins: currentWins + 1,
            hp: Math.min(100, battleStats.playerHp + 20) // Heal 20 HP on win
          }
        });
      } catch (error) {
        console.error('Error updating metadata:', error);
      } finally {
        setIsUpdatingMetadata(false);
      }
    }
    
    // Return to map after delay
    setTimeout(() => {
      router.push('/game');
    }, 3000);
  }, [currentEnemy, user, battleStats.playerHp, router]);
  
  // Handle battle loss
  const handleBattleLoss = useCallback(async () => {
    setBattleStats(prev => ({ ...prev, battleStatus: 'lost' }));
    setFeedback(`Defeat! ${currentEnemy?.name} was too strong!`);
    setBattleLog(prev => [...prev, `You were defeated by ${currentEnemy?.name}!`, 'Returning to map...']);
    
    // Update user metadata with loss
    if (user) {
      setIsUpdatingMetadata(true);
      try {
        const metadata = user.publicMetadata;
        const currentLosses = typeof metadata.losses === 'number' ? metadata.losses : 0;
        
        await user.update({
        unsafeMetadata: {
            ...metadata,
            losses: currentLosses + 1,
            hp: 50 // Reset to 50 HP on loss
          }
        });
      } catch (error) {
        console.error('Error updating metadata:', error);
      } finally {
        setIsUpdatingMetadata(false);
      }
    }
    
    // Return to map after delay
    setTimeout(() => {
      router.push('/game');
    }, 3000);
  }, [currentEnemy, user, router]);
  
  // Handle flee from battle
  const handleFlee = useCallback(async () => {
    setBattleStats(prev => ({ ...prev, battleStatus: 'fled' }));
    setFeedback('You fled from battle!');
    setBattleLog(prev => [...prev, 'You fled from battle!', 'Returning to map...']);
    
    // Update user metadata (flee counts as loss)
    if (user) {
      setIsUpdatingMetadata(true);
      try {
        const metadata = user.publicMetadata;
        const currentLosses = typeof metadata.losses === 'number' ? metadata.losses : 0;
        
        await user.update({
    unsafeMetadata: {
            ...metadata,
            losses: currentLosses + 1,
            hp: Math.max(1, battleStats.playerHp - 10) // Lose 10 HP for fleeing
          }
        });
      } catch (error) {
        console.error('Error updating metadata:', error);
      } finally {
        setIsUpdatingMetadata(false);
      }
    }
    
    // Return to map after delay
    setTimeout(() => {
      router.push('/game');
    }, 2000);
  }, [user, battleStats.playerHp, router]);
  
  // Handle key press for answer submission
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleSubmitAnswer();
    }
  }, [handleSubmitAnswer, isProcessing]);
  
  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingPixel}></div>
        <p className={styles.loadingText}>Loading battle...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>Please sign in to access the battle.</p>
        <button 
          className={styles.returnButton}
          onClick={() => router.push('/game')}
        >
          Return to Map
        </button>
      </div>
    );
  }
  
  return (
    <div className={styles.battleContainer}>
      {/* Battle Header */}
      <header className={styles.battleHeader}>
        <h1 className={styles.battleTitle}>MATH BATTLE</h1>
        <div className={styles.difficultyDisplay}>
          Difficulty: <span className={styles.difficultyText}>{playerDifficulty.toUpperCase()}</span>
        </div>
      </header>
      
      {/* Battle Arena */}
      <main className={styles.battleMain}>
        {/* Enemy Display */}
        <div className={styles.enemySection}>
          <div className={styles.enemyCard}>
            <h2 className={styles.enemyName}>{currentEnemy?.name || 'Loading Enemy...'}</h2>
            <div className={styles.enemyType}>{currentEnemy?.type.toUpperCase()}</div>
            <p className={styles.enemyDescription}>{currentEnemy?.description}</p>
            
            {/* Enemy HP Bar */}
            <div className={styles.hpContainer}>
              <div className={styles.hpLabel}>
                ENEMY HP: {battleStats.enemyHp}/{battleStats.enemyMaxHp}
              </div>
              <div className={styles.hpBarBackground}>
                <div 
                  className={styles.hpBarFillEnemy}
                  style={{ 
                    width: `${(battleStats.enemyHp / battleStats.enemyMaxHp) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Battle Status */}
        <div className={styles.battleStatus}>
          <div className={styles.turnIndicator}>
            {battleStats.battleStatus === 'active' && (
              <div className={`${styles.turnDisplay} ${styles[battleStats.turn]}`}>
                {battleStats.turn === 'player' ? 'YOUR TURN' : 'ENEMY TURN'}
              </div>
            )}
          </div>
          
          {/* Player HP Bar */}
          <div className={styles.playerHpContainer}>
            <div className={styles.hpLabel}>
              YOUR HP: {battleStats.playerHp}/{battleStats.playerMaxHp}
            </div>
            <div className={styles.hpBarBackground}>
              <div 
                className={styles.hpBarFillPlayer}
                style={{ 
                  width: `${(battleStats.playerHp / battleStats.playerMaxHp) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Math Problem Section */}
        <div className={styles.problemSection}>
          <div className={styles.problemCard}>
            <h3 className={styles.problemTitle}>MATH PROBLEM</h3>
            
            {currentProblem && (
              <>
                <div className={styles.problemQuestion}>
                  {currentProblem.question}
                </div>
                
                {/* Multiple Choice Options */}
                <div className={styles.choiceGrid}>
                  {currentProblem.choices.map((choice, index) => (
                    <button
                      key={index}
                      className={`${styles.choiceButton} ${
                        selectedChoice === choice ? styles.choiceSelected : ''
                      }`}
                      onClick={() => setSelectedChoice(choice)}
                      disabled={isProcessing || battleStats.battleStatus !== 'active'}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                
                {/* Manual Input (for non-multiple choice) */}
                <div className={styles.inputSection}>
                  <div className={styles.inputLabel}>Or enter your answer:</div>
                  <input
                    type="number"
                    className={styles.answerInput}
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setSelectedChoice(null);
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={isProcessing || battleStats.battleStatus !== 'active'}
                    placeholder="Enter number..."
                    step="any"
                  />
                </div>
                
                {/* Submit Button */}
                <button
                  className={styles.submitButton}
                  onClick={handleSubmitAnswer}
                  disabled={isProcessing || battleStats.battleStatus !== 'active' || (!selectedChoice && !userAnswer)}
                >
                  {isProcessing ? 'PROCESSING...' : 'SUBMIT ANSWER'}
                </button>
              </>
            )}
            
            {/* Feedback Display */}
            {feedback && (
              <div className={`${styles.feedback} ${
                feedback.includes('Correct!') ? styles.feedbackCorrect : 
                feedback.includes('Incorrect!') ? styles.feedbackIncorrect :
                styles.feedbackNeutral
              }`}>
                {feedback}
              </div>
            )}
            
            {/* Battle Result Overlay */}
            {battleStats.battleStatus !== 'active' && (
              <div className={styles.resultOverlay}>
                <div className={`${styles.resultMessage} ${styles[battleStats.battleStatus]}`}>
                  {battleStats.battleStatus === 'won' && (
                    <>
                      <div className={styles.resultTitle}>VICTORY!</div>
                      <div className={styles.resultSubtitle}>You earned 20 XP</div>
                    </>
                  )}
                  {battleStats.battleStatus === 'lost' && (
                    <>
                      <div className={styles.resultTitle}>DEFEAT!</div>
                      <div className={styles.resultSubtitle}>Better luck next time</div>
                    </>
                  )}
                  {battleStats.battleStatus === 'fled' && (
                    <>
                      <div className={styles.resultTitle}>RETREAT!</div>
                      <div className={styles.resultSubtitle}>You fled from battle</div>
                    </>
                  )}
                  <div className={styles.returningText}>
                    Returning to map in a few seconds...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Battle Log */}
        <div className={styles.battleLogSection}>
          <h3 className={styles.logTitle}>BATTLE LOG</h3>
          <div className={styles.logContainer}>
            {battleLog.map((entry, index) => (
              <div key={index} className={styles.logEntry}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Battle Controls */}
      <footer className={styles.battleFooter}>
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={() => router.push('/game')}
            disabled={isProcessing || isUpdatingMetadata}
          >
            RETURN TO MAP
          </button>
          
          {battleStats.battleStatus === 'active' && (
            <button
              className={styles.fleeButton}
              onClick={handleFlee}
              disabled={isProcessing || isUpdatingMetadata}
            >
              FLEE BATTLE
            </button>
          )}
          
          <button
            className={styles.hintButton}
            onClick={() => currentProblem && setFeedback(`Hint: ${currentProblem.explanation}`)}
            disabled={isProcessing || battleStats.battleStatus !== 'active'}
          >
            GET HINT
          </button>
        </div>
        
        {/* Battle Instructions */}
        <div className={styles.instructions}>
          <p className={styles.instructionText}>
            Solve math problems to damage the enemy. Wrong answers will damage you!
            {battleStats.turn === 'player' ? ' Choose an answer and submit.' : ' Enemy is attacking...'}
          </p>
        </div>
      </footer>
    </div>
  );
}