import { GameProgress } from '../types/game';
import { firebaseService } from './firebase';

class GameStateManager {
  private userId: string | null = null;
  private inventory: GameProgress['inventory'] = [];
  private collectedTokens = new Set<string>();
  private dailyCollection = {
    date: new Date().toDateString(),
    count: 0,
  };
  async saveProgress(extra?: {
  score?: number;
  level?: number;
  tokens?: number;
  hearts?: number;
  enemiesDefeated?: number;
  completed?: boolean;
  finishedAt?: number;
}): Promise<boolean> {
  if (!this.userId) return false;

  const payload = {
    userId: this.userId,
    inventory: this.inventory,
    collectedTokens: Array.from(this.collectedTokens),
    dailyCollection: this.dailyCollection,
    meta: {
      ...extra,
    },
  };

  return await firebaseService.saveProgress(payload);
}


resetAllProgress() {
  this.resetLocalProgress();
}

  
  async initialize(userId: string) {
    this.userId = userId;
    firebaseService.setUserId(userId);
    await this.loadFromFirebase();
  }

  private async loadFromFirebase() {
    if (!this.userId) return;

    const data = await firebaseService.loadProgress(this.userId);
    if (data) {
      this.inventory = data.inventory;
      this.collectedTokens = new Set(data.collectedTokens);
      this.dailyCollection = data.dailyCollection || this.dailyCollection;
    }
  }

  async saveToFirebase(): Promise<boolean> {
    if (!this.userId) return false;

    const playerData = {
      userId: this.userId,
      inventory: this.inventory,
      collectedTokens: Array.from(this.collectedTokens),
      dailyCollection: this.dailyCollection,
    };

    return await firebaseService.saveProgress(playerData);
  }

  collectToken(tokenId: string, value: string): boolean {
    if (this.collectedTokens.has(tokenId)) return false;

    this.collectedTokens.add(tokenId);
    this.inventory.push({
      id: tokenId,
      value,
      collectedAt: new Date().toISOString(),
    });

    this.dailyCollection.count++;
    return true;
  }

  getInventory() {
    return [...this.inventory];
  }

  getTokenCount() {
    return this.collectedTokens.size;
  }

  resetLocalProgress() {
    this.inventory = [];
    this.collectedTokens.clear();
    this.dailyCollection.count = 0;
  }

  // Getter for userId
  getUserId() {
    return this.userId;
  }
}

// Create and export a singleton instance
const gameState = new GameStateManager();
export { gameState };