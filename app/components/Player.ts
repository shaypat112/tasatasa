export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  keys: { [key: string]: boolean };
  sprite: HTMLImageElement | null;
  mapWidth: number;
  mapHeight: number;
  frame: number;
  animationSpeed: number;
  direction: string;

  constructor(mapWidth: number, mapHeight: number) {
    this.x = mapWidth / 2;
    this.y = mapHeight / 2;
    this.width = 32;
    this.height = 32;
    this.speed = 4;
    this.velocityX = 0;
    this.velocityY = 0;
    this.keys = {};
    this.sprite = null;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.frame = 0;
    this.animationSpeed = 0.1;
    this.direction = 'down';

    this.loadSprite();
  }

  loadSprite() {
    this.sprite = new Image();
    this.sprite.src = '/assets/player.png';
  }

  update() {
    this.velocityX = 0;
    this.velocityY = 0;

    if (this.keys['w'] || this.keys['ArrowUp']) {
      this.velocityY = -this.speed;
      this.direction = 'up';
    }
    if (this.keys['s'] || this.keys['ArrowDown']) {
      this.velocityY = this.speed;
      this.direction = 'down';
    }
    if (this.keys['a'] || this.keys['ArrowLeft']) {
      this.velocityX = -this.speed;
      this.direction = 'left';
    }
    if (this.keys['d'] || this.keys['ArrowRight']) {
      this.velocityX = this.speed;
      this.direction = 'right';
    }

    if (this.velocityX !== 0 && this.velocityY !== 0) {
      this.velocityX *= 0.707;
      this.velocityY *= 0.707;
    }

    const newX = this.x + this.velocityX;
    const newY = this.y + this.velocityY;

    if (newX >= 0 && newX <= this.mapWidth - this.width) {
      this.x = newX;
    }
    if (newY >= 0 && newY <= this.mapHeight - this.height) {
      this.y = newY;
    }

    if (this.velocityX !== 0 || this.velocityY !== 0) {
      this.frame += this.animationSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x + 4, this.y + 34, this.width - 8, 8);

    if (this.sprite && this.sprite.complete) {
      const frameX = Math.floor(this.frame % 4) * this.width;
      const frameY = this.getDirectionRow() * this.height;

      ctx.drawImage(
        this.sprite,
        frameX, frameY, this.width, this.height,
        this.x, this.y, this.width, this.height
      );
    } else {
      ctx.fillStyle = '#4361ee';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x + 8, this.y + 8, 6, 6);
      ctx.fillRect(this.x + 18, this.y + 8, 6, 6);
      ctx.fillStyle = '#f72585';
      ctx.fillRect(this.x + 10, this.y + 20, 12, 4);
    }

    ctx.restore();
  }

  getDirectionRow() {
    switch (this.direction) {
      case 'down': return 0;
      case 'left': return 1;
      case 'right': return 2;
      case 'up': return 3;
      default: return 0;
    }
  }

  getBounds() {
    return {
      x: this.x + 4,
      y: this.y + 4,
      width: this.width - 8,
      height: this.height - 8,
    };
  }
}