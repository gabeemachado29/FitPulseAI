import { Trophy, Medal, Flame } from 'lucide-react';
import styles from './Leaderboard.module.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Trophy size={18} color="var(--accent-yellow)" />
        <h3 className={styles.title}>Ranking Semanal dos Amigos 🏆</h3>
      </div>

      <div className={styles.list}>
        {items.map((item, index) => {
          const rankEmoji = MEDALS[index] || `#${index + 1}`;

          return (
            <div
              key={item.id || index}
              className={`${styles.row} ${item.isMe ? styles.isMeRow : ''}`}
            >
              <div className={styles.rankCol}>{rankEmoji}</div>

              <div className={styles.avatarCol}>{item.avatarEmoji || '👤'}</div>

              <div className={styles.infoCol}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.subDetail}>
                  💧 {(item.waterTotalMl / 1000).toFixed(1)}L · 🏋️ {item.workoutsCount} treinos
                </span>
              </div>

              <div className={styles.scoreCol}>
                <Flame size={14} color="var(--accent-orange)" />
                <span>{item.score} pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
