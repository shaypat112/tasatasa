import { Player } from './Player';
import { Collectible } from './Collectible';

export class CollisionSystem {
  debugMode = false;

  checkCollectibleCollision(playerBounds: any, collectible: Collectible) {
    const playerCenter = {
      x: playerBounds.x + playerBounds.width / 2,
      y: playerBounds.y + playerBounds.height / 2,
    };

    const collectibleCenter = {
      x: collectible.x + collectible.width / 2,
      y: collectible.y + collectible.height / 2 + collectible.floatOffset,
    };

    const dx = playerCenter.x - collectibleCenter.x;
    const dy = playerCenter.y - collectibleCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const playerRadius = Math.min(playerBounds.width, playerBounds.height) / 2;
    const collectibleRadius = Math.min(collectible.width, collectible.height) / 2;

    return distance < (playerRadius + collectibleRadius);
  }

  drawDebug(ctx: CanvasRenderingContext2D, player: Player, collectibles: Collectible[]) {
    if (!this.debugMode) return;

    ctx.save();

    const playerBounds = player.getBounds();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(playerBounds.x, playerBounds.y, playerBounds.width, playerBounds.height);

    collectibles.forEach(collectible => {
      if (!collectible.collected) {
        const bounds = collectible.getBounds();
        ctx.strokeStyle = '#ffff00';
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        ctx.beginPath();
        ctx.arc(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
          Math.min(bounds.width, bounds.height) / 2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    });

    ctx.strokeStyle = '#ff0000';
    ctx.strokeRect(0, 0, player.mapWidth, player.mapHeight);

    ctx.restore();
  }
}