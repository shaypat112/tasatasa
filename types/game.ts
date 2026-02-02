export interface GameProgress {
  userId: string;
  inventory: {
    id: string;
    value: string;
    collectedAt: string;
  }[];
  collectedTokens: string[];
  dailyCollection: {
    date: string;
    count: number;
  };
}
