"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { gameState } from "@/lib/gameState";

interface GameCanvasProps {
  width?: number;
  height?: number;
  onTokenCollected?: (value: string) => void;
  onPlayerHit?: (damage: number, enemyType?: string) => void;
  onEnemyDefeated?: (enemyType: string, xp: number) => void;
  onPowerUpCollected?: (type: string) => void;
  onFinishLineReached?: () => void;
  gamePhase?: string;
  isPaused?: boolean;
  playerLevel?: number;
  hearts?: number;
  gameOver?: boolean;
}

interface EnemyState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  detectionRadius: number;
  active: boolean;
  hp: number;
  damage: number;
  alive: boolean;
  lastAttackTime: number;
}

interface FinishLineState {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

const GameCanvas = forwardRef(
  (
    {
      width = 800,
      height = 600,
      onTokenCollected,
      onPlayerHit,
      onEnemyDefeated,
      onPowerUpCollected,
      onFinishLineReached,
      gamePhase = "exploration",
      isPaused = false,
      playerLevel = 1,
      hearts = 3,
      gameOver = false,
    }: GameCanvasProps,
    ref,
  ) => {
    const enemyImageRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mapImageRef = useRef<HTMLImageElement | null>(null);

    // Player state
    const [player, setPlayer] = useState({
      x: width / 2,
      y: height / 2,
      width: 32,
      height: 32,
      speed: 4,
      velocityX: 0,
      velocityY: 0,
    });

    // Collectibles state
    const [collectibles, setCollectibles] = useState<
      Array<{
        id: string;
        x: number;
        y: number;
        value: string;
        collected: boolean;
        animationFrame: number;
      }>
    >([]);

    // Enemy state - Fixed: Properly initialize as array
    const [enemies, setEnemies] = useState<EnemyState[]>([
      {
        x: 600,
        y: 400,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        speed: 1.1,
        detectionRadius: 150,
        active: false,
        hp: 60,
        damage: 10,
        alive: true,
        lastAttackTime: 0,
      },
    ]);

    // Bot counter for multiple bots
    const [botCount, setBotCount] = useState(1);

    // Finish line state
    const [finishLine, setFinishLine] = useState<FinishLineState>({
      x: 300,
      y: 500,
      width: 40,
      height: 40,
      active: false,
    });

    // Game state
    const [keys, setKeys] = useState<Record<string, boolean>>({});
    const [mapLoaded, setMapLoaded] = useState(false);
    const [hitCooldown, setHitCooldown] = useState(false);
    const animationRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const lastEnemyUpdateRef = useRef<number>(0);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      activateEnemy: () => {
        spawnEnemy();
      },
      spawnEnemy: () => {
        spawnEnemy();
      },
      activateFinishLine: () => {
        setFinishLine((prev) => ({ ...prev, active: true }));
      },
      togglePause: () => {
        // You can add pause functionality here if needed
      },
      playerAttack: () => {
        // You can add player attack functionality here
      },
      specialAttack: () => {
        // You can add special attack functionality here
      },
      playVictoryAnimation: () => {
        // You can add victory animation functionality here
      },
    }));

    // Load map image
    useEffect(() => {
      const img = new Image();
      img.src = "/map.png";

      img.onload = () => {
        mapImageRef.current = img;
        setMapLoaded(true);
      };

      img.onerror = () => {
        console.error("Failed to load map image, using fallback background");
      };
    }, []);

    // Load enemy image
    useEffect(() => {
      const img = new Image();
      img.src = "/sprites/enemy.png";
      enemyImageRef.current = img;
    }, []);

    // Initialize collectibles
    useEffect(() => {
      const spawnPoints = [
        { x: 100, y: 100, value: "5" },
        { x: 200, y: 300, value: "10" },
        { x: 400, y: 200, value: "π" },
        { x: 600, y: 150, value: "√2" },
        { x: 150, y: 450, value: "7" },
        { x: 300, y: 400, value: "∞" },
        { x: 500, y: 500, value: "3" },
        { x: 700, y: 350, value: "e" },
        { x: 250, y: 250, value: "1" },
        { x: 650, y: 450, value: "9" },
      ];

      const initialCollectibles = spawnPoints.map((point) => ({
        id: `token_${point.x}_${point.y}_${point.value}`,
        x: point.x,
        y: point.y,
        value: point.value,
        collected: false,
        animationFrame: Math.random() * Math.PI * 2,
      }));

      setCollectibles(initialCollectibles);
    }, []);

    // Spawn enemy function
    const spawnEnemy = () => {
      setEnemies((prev) => [
        ...prev,
        {
          x: Math.random() * (width - 40),
          y: Math.random() * (height - 40),
          width: 32,
          height: 32,
          velocityX: 0,
          velocityY: 0,
          speed: 1.1,
          detectionRadius: 150,
          active: true,
          hp: 60,
          damage: 10,
          alive: true,
          lastAttackTime: 0,
        },
      ]);
      setBotCount((prev) => prev + 1);
    };

    // Keyboard event handlers
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));

        if (
          [
            "w",
            "a",
            "s",
            "d",
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
          ].includes(e.key.toLowerCase())
        ) {
          e.preventDefault();
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));

        if (
          [
            "w",
            "a",
            "s",
            "d",
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
          ].includes(e.key.toLowerCase())
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, []);

    // Update enemy AI for all enemies
    const updateEnemies = useCallback(
      (deltaTime: number) => {
        if (isPaused || gameOver) return;

        const now = Date.now();
        if (now - lastEnemyUpdateRef.current < 16) return;

        setEnemies((prev) =>
          prev.map((enemy) => {
            if (!enemy.active || !enemy.alive) return enemy;

            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let newVelX = enemy.velocityX;
            let newVelY = enemy.velocityY;

            if (distance < enemy.detectionRadius) {
              // Chase player
              const angle = Math.atan2(dy, dx);
              newVelX = Math.cos(angle) * enemy.speed;
              newVelY = Math.sin(angle) * enemy.speed;
            } else {
              // Wander randomly
              if (Math.random() < 0.02) {
                newVelX = (Math.random() - 0.5) * enemy.speed;
                newVelY = (Math.random() - 0.5) * enemy.speed;
              }
            }

            // Apply velocity
            const newX = enemy.x + newVelX;
            const newY = enemy.y + newVelY;

            // Boundary check
            const boundedX = Math.max(0, Math.min(width - enemy.width, newX));
            const boundedY = Math.max(0, Math.min(height - enemy.height, newY));

            return {
              ...enemy,
              x: boundedX,
              y: boundedY,
              velocityX: newVelX,
              velocityY: newVelY,
            };
          }),
        );

        lastEnemyUpdateRef.current = now;
      },
      [player, isPaused, gameOver, width, height],
    );

    // Check enemy-player collision for all enemies
    const checkEnemyCollision = useCallback(() => {
      if (hitCooldown || isPaused || gameOver) return false;

      const playerBounds = {
        x: player.x + 4,
        y: player.y + 4,
        width: player.width - 8,
        height: player.height - 8,
      };

      let hitDetected = false;

      setEnemies((prev) =>
        prev.map((enemy) => {
          if (!enemy.active || !enemy.alive || hitDetected) return enemy;

          const enemyBounds = {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height,
          };

          const isColliding =
            playerBounds.x < enemyBounds.x + enemyBounds.width &&
            playerBounds.x + playerBounds.width > enemyBounds.x &&
            playerBounds.y < enemyBounds.y + enemyBounds.height &&
            playerBounds.y + playerBounds.height > enemyBounds.y;

          if (isColliding) {
            const now = Date.now();
            // 1 second attack cooldown
            if (now - enemy.lastAttackTime > 1000) {
              hitDetected = true;
              setHitCooldown(true);

              if (onPlayerHit) {
                onPlayerHit(enemy.damage, "enemy");
              }

              // Reset cooldown after 1 second
              setTimeout(() => {
                setHitCooldown(false);
              }, 1000);

              return { ...enemy, lastAttackTime: now };
            }
          }
          return enemy;
        }),
      );

      return hitDetected;
    }, [player, hitCooldown, isPaused, gameOver, onPlayerHit]);

    // Check finish line collision
    const checkFinishLineCollision = useCallback(() => {
      if (!finishLine.active || isPaused || gameOver) return false;

      const playerBounds = {
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
      };

      const finishBounds = {
        x: finishLine.x,
        y: finishLine.y,
        width: finishLine.width,
        height: finishLine.height,
      };

      const isColliding =
        playerBounds.x < finishBounds.x + finishBounds.width &&
        playerBounds.x + playerBounds.width > finishBounds.x &&
        playerBounds.y < finishBounds.y + finishBounds.height &&
        playerBounds.y + playerBounds.height > finishBounds.y;

      if (isColliding && onFinishLineReached) {
        onFinishLineReached();
        return true;
      }

      return false;
    }, [finishLine, player, isPaused, gameOver, onFinishLineReached]);

    // Game loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const gameLoop = (timestamp: number) => {
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        drawBackground(ctx);

        // Update game state if not paused or game over
        if (!isPaused && !gameOver) {
          // Update collectibles
          const updatedCollectibles = collectibles.map((c) => ({
            ...c,
            animationFrame: c.animationFrame + 0.05,
          }));
          setCollectibles(updatedCollectibles);

          // Update player
          updatePlayer();

          // Update enemies
          updateEnemies(deltaTime);

          // Check collisions
          checkCollisions();
          checkEnemyCollision();
          checkFinishLineCollision();
        }

        // Draw collectibles
        collectibles.forEach((c) => {
          if (!c.collected) {
            drawCollectible(ctx, c);
          }
        });

        // Draw enemies
        enemies.forEach((enemy) => {
          if (enemy.active && enemy.alive) {
            drawEnemy(ctx, enemy);
          }
        });

        // Draw finish line
        if (finishLine.active) {
          drawFinishLine(ctx);
        }

        // Draw player
        drawPlayer(ctx);

        animationRef.current = requestAnimationFrame(gameLoop);
      };

      animationRef.current = requestAnimationFrame((timestamp) => {
        lastTimeRef.current = timestamp;
        gameLoop(timestamp);
      });

      return () => {
        cancelAnimationFrame(animationRef.current);
      };
    }, [
      collectibles,
      keys,
      width,
      height,
      mapLoaded,
      isPaused,
      gameOver,
      enemies,
      updateEnemies,
      checkEnemyCollision,
      checkFinishLineCollision,
    ]);

    const updatePlayer = () => {
      if (gameOver) return;

      let velocityX = 0;
      let velocityY = 0;

      if (keys["w"] || keys["arrowup"]) velocityY = -player.speed;
      if (keys["s"] || keys["arrowdown"]) velocityY = player.speed;
      if (keys["a"] || keys["arrowleft"]) velocityX = -player.speed;
      if (keys["d"] || keys["arrowright"]) velocityX = player.speed;

      // Normalize diagonal movement
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }

      const newX = player.x + velocityX;
      const newY = player.y + velocityY;

      // Boundary checking
      setPlayer((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(width - prev.width, newX)),
        y: Math.max(0, Math.min(height - prev.height, newY)),
        velocityX,
        velocityY,
      }));
    };

    const checkCollisions = () => {
      const playerBounds = {
        x: player.x + 4,
        y: player.y + 4,
        width: player.width - 8,
        height: player.height - 8,
      };

      setCollectibles((prev) =>
        prev.map((c) => {
          if (c.collected) return c;

          const floatOffset = Math.sin(c.animationFrame) * 3;
          const collectibleBounds = {
            x: c.x + 2,
            y: c.y + 2 + floatOffset,
            width: 20,
            height: 20,
          };

          if (isColliding(playerBounds, collectibleBounds)) {
            if (gameState.collectToken(c.id, c.value)) {
              if (onTokenCollected) {
                onTokenCollected(c.value);
              }
              return { ...c, collected: true };
            }
          }
          return c;
        }),
      );
    };

    const isColliding = (rect1: any, rect2: any) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const drawBackground = (ctx: CanvasRenderingContext2D) => {
      if (mapImageRef.current && mapLoaded) {
        ctx.drawImage(mapImageRef.current, 0, 0, width, height);
      } else {
        drawFallbackBackground(ctx);
      }
    };

    const drawFallbackBackground = (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0d1117");
      gradient.addColorStop(1, "#1a1a2e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(67, 97, 238, 0.1)";
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(76, 201, 240, 0.05)";
      ctx.fillRect(100, 100, 200, 20);
      ctx.fillRect(400, 250, 150, 20);
      ctx.fillRect(200, 400, 300, 20);
      ctx.fillRect(600, 150, 100, 20);

      ctx.fillStyle = "rgba(247, 37, 133, 0.1)";
      ctx.fillRect(300, 200, 30, 30);
      ctx.fillRect(550, 300, 30, 30);
      ctx.fillRect(150, 350, 30, 30);
    };

    const drawCollectible = (
      ctx: CanvasRenderingContext2D,
      collectible: (typeof collectibles)[0],
    ) => {
      const floatOffset = Math.sin(collectible.animationFrame) * 3;
      const centerX = collectible.x + 12;
      const centerY = collectible.y + 12 + floatOffset;

      ctx.save();
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        12,
      );
      gradient.addColorStop(0, "#ffd166");
      gradient.addColorStop(0.7, "#ffb347");
      gradient.addColorStop(1, "#ff9500");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(centerX - 3, centerY - 3, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1a1a2e";
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#ffffff";
      ctx.fillText(collectible.value, centerX + 1, centerY + 1);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillText(collectible.value, centerX, centerY);

      ctx.restore();
    };

    const drawPlayer = (ctx: CanvasRenderingContext2D) => {
      if (gameOver) {
        // Draw faded player when game over
        ctx.globalAlpha = 0.5;
      }

      ctx.save();

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.ellipse(
        player.x + player.width / 2,
        player.y + player.height + 4,
        player.width / 2 - 4,
        6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Player body
      ctx.fillStyle = "#4361ee";
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Player highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(player.x, player.y, player.width, 8);
      ctx.fillRect(player.x, player.y, 8, player.height);

      // Eyes
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(player.x + 8, player.y + 8, 6, 6);
      ctx.fillRect(player.x + 18, player.y + 8, 6, 6);

      // Eye pupils
      ctx.fillStyle = "#1a1a2e";
      const eyeOffset = Math.sin(Date.now() / 1000) * 1;
      ctx.fillRect(player.x + 9, player.y + 9 + eyeOffset, 2, 2);
      ctx.fillRect(player.x + 19, player.y + 9 + eyeOffset, 2, 2);

      // Mouth
      ctx.fillStyle = gameOver ? "#888" : "#f72585";
      const mouthWidth = gameOver ? 8 : 12 + Math.sin(Date.now() / 200) * 2;
      ctx.fillRect(
        player.x + (player.width - mouthWidth) / 2,
        player.y + 20,
        mouthWidth,
        4,
      );

      // Player outline
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.strokeRect(player.x, player.y, player.width, player.height);

      ctx.restore();
      ctx.globalAlpha = 1.0;
    };

    const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: EnemyState) => {
      ctx.save();

      // Enemy shadow
      ctx.fillStyle = "rgba(247, 37, 133, 0.3)";
      ctx.beginPath();
      ctx.ellipse(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height + 4,
        enemy.width / 2 - 4,
        6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Enemy body
      ctx.fillStyle = "#f72585";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Enemy eyes (angry)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6);
      ctx.fillRect(enemy.x + 18, enemy.y + 8, 6, 6);

      // Angry eyebrows
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(enemy.x + 7, enemy.y + 5, 8, 2);
      ctx.fillRect(enemy.x + 17, enemy.y + 5, 8, 2);

      // Enemy mouth (angry)
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(enemy.x + 10, enemy.y + 20, 12, 6);

      // Enemy outline
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Enemy health bar
      const healthPercentage = enemy.hp / 60;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 6);
      ctx.fillStyle =
        healthPercentage > 0.5
          ? "#4cc9f0"
          : healthPercentage > 0.25
            ? "#ffd166"
            : "#f72585";
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * healthPercentage, 6);

      ctx.restore();
    };

    const drawFinishLine = (ctx: CanvasRenderingContext2D) => {
      ctx.save();

      // Finish line glow
      ctx.shadowColor = "#4cc9f0";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Finish line body
      ctx.fillStyle = "#4cc9f0";
      ctx.fillRect(
        finishLine.x,
        finishLine.y,
        finishLine.width,
        finishLine.height,
      );

      // Finish line pattern
      ctx.fillStyle = "#4361ee";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(finishLine.x + i * 10, finishLine.y, 5, finishLine.height);
      }

      // Finish flag
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.moveTo(finishLine.x + finishLine.width - 5, finishLine.y);
      ctx.lineTo(
        finishLine.x + finishLine.width - 5,
        finishLine.y + finishLine.height / 2,
      );
      ctx.lineTo(
        finishLine.x + finishLine.width - 15,
        finishLine.y + finishLine.height / 4,
      );
      ctx.closePath();
      ctx.fill();

      // Finish text
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "FINISH",
        finishLine.x + finishLine.width / 2,
        finishLine.y + finishLine.height / 2,
      );

      ctx.restore();
    };

    return (
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="game-canvas"
          style={{ background: "#0d1117" }}
        />

        {!mapLoaded && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#4cc9f0",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            ⏳ Loading map...
            <div
              style={{ fontSize: "14px", marginTop: "10px", color: "#ffd166" }}
            >
              Using fallback background until map loads
            </div>
          </div>
        )}
      </div>
    );
  },
);

GameCanvas.displayName = "GameCanvas";

export default GameCanvas;
