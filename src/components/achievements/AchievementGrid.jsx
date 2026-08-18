import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import Card from '../ui/Card';
import AchievementCard from './AchievementCard';
import { useAuth } from '../../hooks/useAuth';
import { ALL_ACHIEVEMENTS, fetchUserAchievements } from '../../services/achievementService';
import styles from './AchievementGrid.module.css';

export default function AchievementGrid() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchUserAchievements(user.uid)
      .then((res) => setUnlocked(Array.isArray(res) ? res : []))
      .catch((err) => {
        console.warn('Error in AchievementGrid fetch:', err);
        setUnlocked([]);
      });
  }, [user]);

  const unlockedList = Array.isArray(unlocked) ? unlocked : [];
  const unlockedIds = new Set(unlockedList.map((a) => a?.id).filter(Boolean));

  return (
    <Card variant="bordered" padding="lg" className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Trophy size={20} color="var(--accent-yellow)" />
          <h3 className={styles.title}>Conquistas & Medalhas 🏆</h3>
        </div>
        <span className={styles.countBadge}>
          {unlockedList.length} / {ALL_ACHIEVEMENTS.length}
        </span>
      </div>

      <div className={styles.grid}>
        {ALL_ACHIEVEMENTS.map((item) => (
          <AchievementCard
            key={item.id}
            achievement={item}
            isUnlocked={unlockedIds.has(item.id)}
          />
        ))}
      </div>
    </Card>
  );
}
