import { Play, Pencil, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import styles from './WorkoutCard.module.css';

export default function WorkoutCard({
  workout,
  onStart,
  onEdit,
  onDelete,
}) {
  const { name, exercises = [] } = workout;

  return (
    <Card variant="default" padding="lg" className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        <div className={styles.iconActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onEdit(workout)}
            aria-label="Editar treino"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onDelete(workout.id)}
            aria-label="Excluir treino"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className={styles.subtitle}>
        {exercises.length} {exercises.length === 1 ? 'exercício' : 'exercícios'}
      </p>

      <ul className={styles.exerciseList}>
        {exercises.map((ex, idx) => (
          <li key={idx} className={styles.exerciseItem}>
            <span className={styles.exerciseName}>{ex.name}</span>
            <span className={styles.exerciseSets}>
              {ex.sets}×{ex.reps}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant="primary"
        fullWidth
        icon={Play}
        onClick={() => onStart(workout)}
        className={styles.startBtn}
      >
        Treinar agora
      </Button>
    </Card>
  );
}
