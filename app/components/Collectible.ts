export class Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  id: string;
  collected: boolean;
  animationFrame: number;
  floatOffset: number;
  sprite: HTMLImageElement;

  constructor(x: number, y: number, value: string) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    this.value = value;
    this.id = `token_${x}_${y}_${value}`;
    this.collected = false;
    this.animationFrame = 0;
    this.floatOffset = 0;
    this.sprite = new Image();
    this.sprite.src = '/assets/token.png';
  }

  update() {
    if (!this.collected) {
      this.animationFrame += 0.05;
      this.floatOffset = Math.sin(this.animationFrame) * 3;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;

    ctx.save();

    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 15;

    if (this.sprite.complete) {
      ctx.drawImage(
        this.sprite,
        this.x,
        this.y + this.floatOffset,
        this.width,
        this.height
      );
    } else {
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2 + this.floatOffset;
      const radius = this.width / 2;

      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#ffd166');
      gradient.addColorStop(1, '#ffb347');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 12px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.value, centerX, centerY);
    }

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x + 2,
      y: this.y + 2 + this.floatOffset,
      width: this.width - 4,
      height: this.height - 4,
    };
  }
}