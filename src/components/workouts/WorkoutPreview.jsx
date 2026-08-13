import { Dumbbell, Play } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import styles from './WorkoutPreview.module.css';

export default function WorkoutPreview({ workout, onStart, onCancel }) {
  if (!workout) return null;

  const { name, exercises = [] } = workout;
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);

  return (
    <Card variant="bordered" padding="lg" className={styles.card}>
      <div className={styles.iconWrap}>
        <Dumbbell size={32} color="var(--accent-green)" />
      </div>

      <h3 className={styles.title}>{name}</h3>
      <p className={styles.summaryText}>
        {exercises.length} exercícios · {totalSets} séries
      </p>
      <p className={styles.infoText}>
        Descanso automático após cada série · ajuste a carga a qualquer momento
      </p>

      <ul className={styles.exerciseList}>
        {exercises.map((ex, idx) => (
          <li key={idx} className={styles.exerciseItem}>
            <span className={styles.exName}>{ex.name}</span>
            <span className={styles.exSets}>{ex.sets}×{ex.reps}</span>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={Play}
          onClick={() => onStart(workout)}
        >
          Iniciar treino
        </Button>
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
