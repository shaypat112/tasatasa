import { useState, useEffect } from 'react';

interface Achievement {
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  timestamp: string;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('retroQuestAchievements');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAchievements(parsed);
      setUnlockedCount(parsed.length);
      setTotalPoints(parsed.reduce((sum: number, a: Achievement) => sum + a.points, 0));
    }
  }, []);

  const unlockAchievement = (achievement: Omit<Achievement, 'timestamp'>) => {
    const newAchievement = {
      ...achievement,
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newAchievement, ...achievements.slice(0, 49)]; // Keep only last 50
    setAchievements(updated);
    setUnlockedCount(updated.length);
    setTotalPoints(updated.reduce((sum, a) => sum + a.points, 0));
    
    localStorage.setItem('retroQuestAchievements', JSON.stringify(updated));
  };

  const clearAchievements = () => {
    setAchievements([]);
    setUnlockedCount(0);
    setTotalPoints(0);
    localStorage.removeItem('retroQuestAchievements');
  };

  return {
    achievements,
    totalPoints,
    unlockedCount,
    unlockAchievement,
    clearAchievements,
  };
};