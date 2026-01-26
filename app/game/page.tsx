"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Player = {
  x: number;
  y: number;
  radius: number;
  isMoving: boolean;
  direction: "clockwise" | "counterclockwise" | null;
  isOnPlatform: boolean;
  velocity: number;
};

type Platform = {
  angle: number; // in radians
  width: number; // in radians
  type: "safe" | "danger" | "goal";
  value: string; // sin(θ), cos(θ), or tan(θ) value
  label: string;
};

type GameState = "menu" | "playing" | "levelComplete" | "gameOver" | "hint";

export default function UnitCircleGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [circleRotation, setCircleRotation] = useState(0);
  
  // Unit circle state
  const [unitCircle, setUnitCircle] = useState({
    radius: 150,
    centerX: 320,
    centerY: 180,
  });
  
  // Player state
  const [player, setPlayer] = useState<Player>({
    x: 320,
    y: 30, // Start at top
    radius: 12,
    isMoving: false,
    direction: null,
    isOnPlatform: false,
    velocity: 2,
  });
  
  // Platform state
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [currentGoal, setCurrentGoal] = useState<string>("π/2");
  const [hint, setHint] = useState<string>("");
  
  // Game refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keyStateRef = useRef<Record<string, boolean>>({});
  
  // Level configurations
  const levels = [
    {
      id: 1,
      title: "Quadrantal Angles",
      hint: "Remember: cos(θ) is the x value on the unit circle",
      platforms: [
        { angle: 0, width: 0.3, type: "safe", value: "1", label: "cos=1, sin=0" },
        { angle: Math.PI/2, width: 0.3, type: "goal", value: "π/2", label: "cos=0, sin=1" },
        { angle: Math.PI, width: 0.3, type: "danger", value: "-1", label: "cos=-1, sin=0" },
        { angle: 3*Math.PI/2, width: 0.3, type: "danger", value: "-1", label: "cos=0, sin=-1" },
      ],
      rotationSpeed: 0.5,
      goalAngle: Math.PI/2,
    },
    {
      id: 2,
      title: "Special Angles",
      hint: "π/6 = 30°, π/4 = 45°, π/3 = 60°",
      platforms: [
        { angle: Math.PI/6, width: 0.2, type: "safe", value: "√3/2", label: "π/6" },
        { angle: Math.PI/4, width: 0.2, type: "safe", value: "√2/2", label: "π/4" },
        { angle: Math.PI/3, width: 0.2, type: "goal", value: "1/2", label: "π/3" },
        { angle: 2*Math.PI/3, width: 0.2, type: "danger", value: "-1/2", label: "2π/3" },
        { angle: 3*Math.PI/4, width: 0.2, type: "danger", value: "-√2/2", label: "3π/4" },
      ],
      rotationSpeed: 0.7,
      goalAngle: Math.PI/3,
    },
    {
      id: 3,
      title: "Sine Values",
      hint: "sin(θ) = y-coordinate on unit circle",
      platforms: [
        { angle: Math.PI/6, width: 0.15, type: "safe", value: "1/2", label: "sin=1/2" },
        { angle: 5*Math.PI/6, width: 0.15, type: "safe", value: "1/2", label: "sin=1/2" },
        { angle: Math.PI/2, width: 0.15, type: "goal", value: "1", label: "sin=1" },
        { angle: 7*Math.PI/6, width: 0.15, type: "danger", value: "-1/2", label: "sin=-1/2" },
      ],
      rotationSpeed: 0.9,
      goalAngle: Math.PI/2,
    },
    {
      id: 4,
      title: "Cosine Values",
      hint: "cos(θ) = x-coordinate on unit circle",
      platforms: [
        { angle: Math.PI/3, width: 0.15, type: "safe", value: "1/2", label: "cos=1/2" },
        { angle: 5*Math.PI/3, width: 0.15, type: "safe", value: "1/2", label: "cos=1/2" },
        { angle: Math.PI, width: 0.15, type: "danger", value: "-1", label: "cos=-1" },
        { angle: 0, width: 0.15, type: "goal", value: "1", label: "cos=1" },
      ],
      rotationSpeed: 1.1,
      goalAngle: 0,
    },
    {
      id: 5,
      title: "Reference Angles",
      hint: "Reference angle = acute angle to x-axis",
      platforms: [
        { angle: 7*Math.PI/6, width: 0.12, type: "safe", value: "π/6", label: "ref: π/6" },
        { angle: 3*Math.PI/4, width: 0.12, type: "safe", value: "π/4", label: "ref: π/4" },
        { angle: 5*Math.PI/3, width: 0.12, type: "goal", value: "π/3", label: "ref: π/3" },
        { angle: 4*Math.PI/3, width: 0.12, type: "danger", value: "π/3", label: "ref: π/3" },
      ],
      rotationSpeed: 1.3,
      goalAngle: 5*Math.PI/3,
    },
  ];

  // Initialize level
  const startLevel = useCallback((levelNum: number) => {
    const levelConfig = levels[levelNum - 1];
    setLevel(levelNum);
    setRotationSpeed(levelConfig.rotationSpeed);
    setPlatforms(levelConfig.platforms);
    setHint(levelConfig.hint);
    setCurrentGoal(levelConfig.label);
    
    // Reset player position to top of circle
    const startAngle = -Math.PI/2; // Start at top
    setPlayer(prev => ({
      ...prev,
      x: unitCircle.centerX + Math.cos(startAngle) * unitCircle.radius,
      y: unitCircle.centerY + Math.sin(startAngle) * unitCircle.radius,
      isMoving: false,
      direction: null,
      isOnPlatform: false,
    }));
    
    setCircleRotation(0);
    
    // Show hint first
    setGameState("hint");
    
    // Then start game after delay
    setTimeout(() => {
      setGameState("playing");
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }, 2000);
  }, [unitCircle]);

  // Start game
  const startGame = () => {
    setGameState("hint");
    setScore(0);
    setLives(3);
    setCombo(1);
    startLevel(1);
  };

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState !== "playing") return;
    
    const deltaTime = (currentTime - lastTimeRef.current) / 16.67;
    lastTimeRef.current = currentTime;
    
    // Rotate unit circle
    setCircleRotation(prev => prev + rotationSpeed * deltaTime * 0.05);
    
    // Update player position if moving
    setPlayer(prev => {
      if (!prev.isMoving) return prev;
      
      let newAngle = Math.atan2(
        prev.y - unitCircle.centerY,
        prev.x - unitCircle.centerX
      );
      
      if (prev.direction === "clockwise") {
        newAngle -= prev.velocity * deltaTime * 0.03;
      } else if (prev.direction === "counterclockwise") {
        newAngle += prev.velocity * deltaTime * 0.03;
      }
      
      // Normalize angle to [-π, π]
      while (newAngle < -Math.PI) newAngle += 2 * Math.PI;
      while (newAngle > Math.PI) newAngle -= 2 * Math.PI;
      
      const newX = unitCircle.centerX + Math.cos(newAngle) * unitCircle.radius;
      const newY = unitCircle.centerY + Math.sin(newAngle) * unitCircle.radius;
      
      // Check platform collision
      const isOnPlatform = platforms.some(platform => {
        const platformStart = platform.angle - platform.width/2;
        const platformEnd = platform.angle + platform.width/2;
        
        // Adjust for circle rotation
        const adjustedAngle = newAngle - circleRotation;
        const normalizedAngle = ((adjustedAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        
        if (normalizedAngle >= platformStart && normalizedAngle <= platformEnd) {
          if (platform.type === "danger") {
            // Lose a life
            setLives(prevLives => {
              if (prevLives <= 1) {
                setGameState("gameOver");
                return 0;
              }
              return prevLives - 1;
            });
            setCombo(1);
            return false; // Not on safe platform
          } else if (platform.type === "goal") {
            // Level complete
            const points = 100 * combo;
            setScore(prev => prev + points);
            setCombo(prev => prev + 0.5);
            setTimeout(() => {
              if (level < levels.length) {
                startLevel(level + 1);
              } else {
                setGameState("levelComplete");
              }
            }, 500);
            return true;
          } else if (platform.type === "safe") {
            // Safe platform - gain points
            setScore(prev => prev + 50 * combo);
            setCombo(prev => Math.min(prev + 0.2, 5));
            return true;
          }
        }
        return false;
      });
      
      return {
        ...prev,
        x: newX,
        y: newY,
        isOnPlatform,
      };
    });
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, rotationSpeed, unitCircle, platforms, circleRotation, level, startLevel]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keyStateRef.current[e.key] = true;
      
      if (gameState !== "playing") return;
      
      if (e.key === "ArrowLeft" || e.key === "a") {
        setPlayer(prev => ({
          ...prev,
          isMoving: true,
          direction: "counterclockwise",
        }));
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setPlayer(prev => ({
          ...prev,
          isMoving: true,
          direction: "clockwise",
        }));
      } else if (e.key === " ") {
        // Jump to move faster
        setPlayer(prev => ({
          ...prev,
          velocity: Math.min(prev.velocity * 1.5, 5),
        }));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keyStateRef.current[e.key] = false;
      
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "a" || e.key === "d") {
        setPlayer(prev => ({
          ...prev,
          isMoving: false,
          direction: null,
          velocity: 2,
        }));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const { centerX, centerY, radius } = unitCircle;
    
    // Draw unit circle background
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw coordinate axes
    ctx.strokeStyle = "#444477";
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();
    
    // Draw angle markings (0, π/2, π, 3π/2)
    const angleLabels = [
      { angle: 0, label: "0", pos: "right" },
      { angle: Math.PI/2, label: "π/2", pos: "top" },
      { angle: Math.PI, label: "π", pos: "left" },
      { angle: 3*Math.PI/2, label: "3π/2", pos: "bottom" },
      { angle: Math.PI/4, label: "π/4" },
      { angle: 3*Math.PI/4, label: "3π/4" },
      { angle: 5*Math.PI/4, label: "5π/4" },
      { angle: 7*Math.PI/4, label: "7π/4" },
    ];
    
    ctx.fillStyle = "#88ff88";
    ctx.font = "12px monospace";
    angleLabels.forEach(({ angle, label, pos }) => {
      const x = centerX + Math.cos(angle) * (radius + 20);
      const y = centerY + Math.sin(angle) * (radius + 20);
      
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y);
      
      // Draw small tick mark
      ctx.strokeStyle = "#88ff88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const tickX = centerX + Math.cos(angle) * radius;
      const tickY = centerY + Math.sin(angle) * radius;
      const tickX2 = centerX + Math.cos(angle) * (radius + 10);
      const tickY2 = centerY + Math.sin(angle) * (radius + 10);
      ctx.moveTo(tickX, tickY);
      ctx.lineTo(tickX2, tickY2);
      ctx.stroke();
    });
    
    // Draw rotated circle (for visual reference)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(circleRotation);
    ctx.translate(-centerX, -centerY);
    
    // Draw platforms
    platforms.forEach(platform => {
      const startAngle = platform.angle - platform.width/2;
      const endAngle = platform.angle + platform.width/2;
      
      // Set color based on platform type
      if (platform.type === "safe") {
        ctx.fillStyle = "#44ff4466";
        ctx.strokeStyle = "#44ff44";
      } else if (platform.type === "danger") {
        ctx.fillStyle = "#ff444466";
        ctx.strokeStyle = "#ff4444";
      } else if (platform.type === "goal") {
        ctx.fillStyle = "#ffff4466";
        ctx.strokeStyle = "#ffff44";
      }
      
      // Draw platform arc
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, startAngle, endAngle);
      ctx.stroke();
      
      // Draw platform fill
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, startAngle, endAngle);
      ctx.lineTo(
        centerX + Math.cos(endAngle) * (radius - 10),
        centerY + Math.sin(endAngle) * (radius - 10)
      );
      ctx.arc(centerX, centerY, radius - 10, endAngle, startAngle, true);
      ctx.lineTo(
        centerX + Math.cos(startAngle) * (radius + 10),
        centerY + Math.sin(startAngle) * (radius + 10)
      );
      ctx.fill();
      
      // Draw platform label
      const midAngle = platform.angle;
      const labelX = centerX + Math.cos(midAngle) * radius;
      const labelY = centerY + Math.sin(midAngle) * radius;
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(platform.label, labelX, labelY);
    });
    
    ctx.restore();
    
    // Draw player
    ctx.fillStyle = player.isOnPlatform ? "#44ff44" : "#ffffff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player outline
    ctx.strokeStyle = player.isOnPlatform ? "#00ff00" : "#8888ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw current angle indicator
    const playerAngle = Math.atan2(
      player.y - centerY,
      player.x - centerX
    );
    
    ctx.strokeStyle = "#ff88ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(player.x, player.y);
    ctx.stroke();
    
    // Display current angle
    const normalizedAngle = ((playerAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const angleDegrees = Math.round((normalizedAngle * 180) / Math.PI);
    
    ctx.fillStyle = "#ff88ff";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`θ: ${normalizedAngle.toFixed(2)} rad`, 10, 30);
    ctx.fillText(`θ: ${angleDegrees}°`, 10, 45);
    
    // Draw rotation indicator
    ctx.fillStyle = "#00ffff";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(circleRotation) * 15,
      centerY + Math.sin(circleRotation) * 15
    );
    ctx.stroke();
    
  }, [player, unitCircle, platforms, circleRotation, gameState]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-black to-blue-950 text-white p-4">
      <div className="w-[640px] h-[480px] border-4 border-cyan-500 bg-[#0a0a1a] p-4 flex flex-col justify-between retro-crt">
        {/* Top HUD */}
        <div className="flex justify-between items-center text-xs font-mono">
          <div className="flex items-center gap-6">
            <span className="text-green-400">SCORE: {score.toString().padStart(6, '0')}</span>
            <span className="text-yellow-400">LEVEL: {level}/5</span>
            <span className="text-cyan-400">GOAL: {currentGoal}</span>
            <span className="text-pink-400">COMBO: x{combo.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-red-400">LIVES:</span>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 ${i < lives ? 'bg-red-500' : 'bg-gray-700'} border border-red-700`}
                  />
                ))}
              </div>
            </div>
            <span className="text-purple-400">SPEED: {rotationSpeed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Main Game Screen */}
        <div className="flex-1 flex items-center justify-center relative">
          {gameState === "menu" && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent pixel-font">
                UNIT CIRCLE ADVENTURE
              </h1>
              <p className="text-gray-300 text-lg">AP Precalculus Edition</p>
              
              <div className="space-y-6 mt-8">
                <button
                  onClick={startGame}
                  className="block w-64 mx-auto border-2 border-cyan-500 px-8 py-4 hover:bg-cyan-500 hover:text-black transition-all text-lg pixel-button glow"
                >
                  START JOURNEY
                </button>
                
                <div className="text-left max-w-md mx-auto text-sm text-gray-300 space-y-3">
                  <p className="flex items-center gap-3">🎯 <span>Navigate the rotating unit circle</span></p>
                  <p className="flex items-center gap-3">📐 <span>Land on safe platforms at correct angles</span></p>
                  <p className="flex items-center gap-3">⚡ <span>Avoid dangerous angles</span></p>
                  <p className="flex items-center gap-3">🧠 <span>Learn sine, cosine, and radians intuitively</span></p>
                  <p className="flex items-center gap-3">🎮 <span>Arrow Keys to move, Space to jump</span></p>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "hint" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 bg-gradient-to-b from-blue-900/50 to-purple-900/50 p-8 rounded-lg border-2 border-yellow-500 max-w-lg"
            >
              <h2 className="text-2xl font-bold text-yellow-300">LEVEL {level}: {levels[level-1]?.title}</h2>
              
              <div className="space-y-4">
                <div className="text-xl text-cyan-300 bg-black/50 p-4 rounded">
                  💡 {hint}
                </div>
                
                <div className="text-left space-y-2 text-gray-300">
                  <p className="flex items-center gap-2">🎯 <span className="text-yellow-400">Goal Platform:</span> {currentGoal}</p>
                  <p className="flex items-center gap-2">⚠️ <span className="text-red-400">Avoid Red Platforms</span></p>
                  <p className="flex items-center gap-2">🟢 <span className="text-green-400">Safe Green Platforms</span></p>
                  <p className="flex items-center gap-2">⭐ <span className="text-yellow-400">Yellow Platform = Level Goal</span></p>
                </div>
              </div>
              
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-lg text-purple-300"
              >
                Get Ready...
              </motion.div>
            </motion.div>
          )}

          {gameState === "playing" && (
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={640}
                height={360}
                className="border-2 border-blue-800/50 rounded"
              />
              
              {/* Game instructions overlay */}
              <div className="absolute bottom-4 left-4 text-[10px] text-gray-400 space-y-1">
                <p className="text-cyan-400">← → : Move around circle</p>
                <p className="text-cyan-400">SPACE : Jump boost</p>
                <p className="text-yellow-400">Goal: Land on yellow platform</p>
              </div>
              
              {/* Angle info */}
              <div className="absolute top-4 right-4 text-[10px] bg-black/70 p-2 rounded">
                <p className="text-green-400">Circle Rotating...</p>
                <p className="text-cyan-300">Speed: {rotationSpeed.toFixed(1)} rad/s</p>
              </div>
            </div>
          )}

          {gameState === "levelComplete" && level < levels.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6 bg-gradient-to-b from-green-900/50 to-black/50 p-8 rounded-lg border-2 border-green-500 max-w-md"
            >
              <h2 className="text-2xl font-bold text-green-400">LEVEL {level} COMPLETE!</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center px-8">
                  <span className="text-gray-300">Score Gain:</span>
                  <span className="text-xl text-yellow-400">+{100 * combo}</span>
                </div>
                <div className="flex justify-between items-center px-8">
                  <span className="text-gray-300">Combo Multiplier:</span>
                  <span className="text-xl text-purple-400">x{combo.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center px-8">
                  <span className="text-gray-300">Total Score:</span>
                  <span className="text-2xl text-green-300">{score}</span>
                </div>
              </div>
              
              <button
                onClick={() => startLevel(level + 1)}
                className="block w-48 mx-auto border-2 border-green-500 px-6 py-3 hover:bg-green-500 hover:text-black transition-all"
              >
                NEXT LEVEL →
              </button>
            </motion.div>
          )}

          {gameState === "levelComplete" && level === levels.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6 bg-gradient-to-b from-purple-900/50 to-black/50 p-8 rounded-lg border-2 border-purple-500 max-w-md"
            >
              <h2 className="text-3xl font-bold text-purple-400">MASTER ACHIEVED!</h2>
              <p className="text-cyan-300">You've mastered the Unit Circle!</p>
              
              <div className="space-y-4">
                <p className="text-4xl text-yellow-400">FINAL SCORE: {score}</p>
                <p className="text-gray-300">Perfect Combo: x{combo.toFixed(1)}</p>
                <p className="text-gray-300">All levels completed!</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="border-2 border-green-500 px-6 py-3 hover:bg-green-500 hover:text-black transition-all"
                >
                  PLAY AGAIN
                </button>
                <Link href="/">
                  <button className="border-2 border-gray-500 px-6 py-3 hover:bg-gray-500 hover:text-black transition-all">
                    MAIN MENU
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

          {gameState === "gameOver" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6 bg-gradient-to-b from-red-900/50 to-black/50 p-8 rounded-lg border-2 border-red-500 max-w-md"
            >
              <h2 className="text-2xl font-bold text-red-400">GAME OVER</h2>
              
              <div className="space-y-4">
                <p className="text-3xl text-yellow-400">SCORE: {score}</p>
                <p className="text-gray-300">Level Reached: {level}</p>
                <p className="text-gray-300">Highest Combo: x{combo.toFixed(1)}</p>
                <p className="text-gray-300">Keep practicing those angles!</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="border-2 border-green-500 px-6 py-3 hover:bg-green-500 hover:text-black transition-all"
                >
                  TRY AGAIN
                </button>
                <Link href="/">
                  <button className="border-2 border-gray-500 px-6 py-3 hover:bg-gray-500 hover:text-black transition-all">
                    MAIN MENU
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom UI */}
        <div className="flex justify-between items-end text-[10px] font-mono">
          <div className="space-y-1">
            <p className="text-green-400">🟢 SAFE PLATFORMS</p>
            <p className="text-red-400">🔴 DANGEROUS ANGLES</p>
            <p className="text-yellow-400">⭐ GOAL PLATFORM</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-400">CIRCLE ROTATING:</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 h-1 bg-gray-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${(rotationSpeed / 1.5) * 100}%` }}
                  />
                </div>
                <span className="text-cyan-400">{rotationSpeed.toFixed(1)}x</span>
              </div>
            </div>
            
            <Link href="/">
              <button className="border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-all">
                EXIT
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Retro CRT styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          letter-spacing: 1px;
        }
        
        .retro-crt {
          position: relative;
          overflow: hidden;
        }
        
        .retro-crt::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
                      linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
          z-index: 2;
          pointer-events: none;
        }
        
        .retro-crt::after {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: rgba(18, 16, 16, 0.1);
          opacity: 0.15;
          z-index: 2;
          pointer-events: none;
        }
        
        .pixel-button {
          position: relative;
          overflow: hidden;
        }
        
        .pixel-button:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shine 1s;
        }
        
        .glow {
          box-shadow: 
            0 0 10px #00ffff,
            0 0 20px #00ffff,
            inset 0 0 10px #00ffff22;
        }
        
        @keyframes shine {
          to { left: 100%; }
        }
        
        canvas {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>
    </main>
  );
}