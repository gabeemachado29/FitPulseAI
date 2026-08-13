import { useEffect } from 'react';
import { Plus, SkipForward, Check } from 'lucide-react';
import Button from '../ui/Button';
import styles from './RestTimer.module.css';

export default function RestTimer({
  restSeconds = 60,
  completedExerciseName,
  completedSetNumber,
  nextExerciseName,
  onTick,
  onAdd15s,
  onSkip,
}) {
  useEffect(() => {
    const timer = setInterval(() => {
      onTick();
    }, 1000);

    return () => clearInterval(timer);
  }, [onTick]);

  const minutes = Math.floor(restSeconds / 60);
  const seconds = restSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={styles.container}>
      <span className={styles.tag}>DESCANSO</span>

      <div className={styles.timerDisplay}>{formattedTime}</div>

      <p className={styles.completionText}>
        {completedExerciseName} · série {completedSetNumber} concluída{' '}
        <Check size={14} className={styles.checkIcon} />
      </p>

      {nextExerciseName && (
        <p className={styles.nextText}>
          Próxima série: <strong>{nextExerciseName}</strong>
        </p>
      )}

      <div className={styles.actions}>
        <Button
          variant="secondary"
          icon={Plus}
          onClick={() => onAdd15s(15)}
          className={styles.actionBtn}
        >
          15s
        </Button>
        <Button
          variant="secondary"
          icon={SkipForward}
          onClick={onSkip}
          className={styles.actionBtn}
        >
          Pular
        </Button>
      </div>
    </div>
  );
}
