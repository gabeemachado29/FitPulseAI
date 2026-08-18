import { Users, Award, Check } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import styles from './ChallengeCard.module.css';

export default function ChallengeCard({ challenge, onJoin }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>{challenge.title}</h4>
        <span className={styles.rewardTag}>
          <Award size={12} /> {challenge.rewardBadge}
        </span>
      </div>

      <p className={styles.desc}>{challenge.description}</p>

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <Users size={14} /> {challenge.participantsCount} participantes
        </span>
        <span className={styles.metaItem}>⏱️ {challenge.durationDays} dias</span>
      </div>

      {challenge.joined ? (
        <div className={styles.progressWrap}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Seu Progresso</span>
            <span className={styles.progressPercent}>{challenge.progressPercent}%</span>
          </div>
          <ProgressBar progress={challenge.progressPercent} color="green" />
        </div>
      ) : (
        <Button
          variant="primary"
          fullWidth
          size="sm"
          onClick={() => onJoin(challenge.id)}
        >
          Participar do Desafio
        </Button>
      )}
    </div>
  );
}
