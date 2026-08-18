import { Check } from 'lucide-react';
import styles from './AchievementCard.module.css';

export default function AchievementCard({ achievement, isUnlocked }) {
  return (
    <div className={`${styles.card} ${isUnlocked ? styles.unlocked : styles.locked}`}>
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{achievement.icon}</span>
        {isUnlocked && (
          <div className={styles.checkBadge}>
            <Check size={10} />
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h4 className={styles.title}>{achievement.title}</h4>
        <p className={styles.desc}>{achievement.description}</p>
      </div>
    </div>
  );
}
