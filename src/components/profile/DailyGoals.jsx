import { Target, Droplets } from 'lucide-react';
import Input from '../ui/Input';
import styles from './DailyGoals.module.css';

export default function DailyGoals({
  calorieGoal,
  hydrationGoal,
  onCalorieChange,
  onHydrationChange,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <div className={styles.titleRow}>
          <Target size={18} color="var(--accent-green)" />
          <h3 className={styles.title}>Meta calórica diária</h3>
        </div>
        <Input
          type="number"
          value={calorieGoal}
          onChange={(val) => onCalorieChange(Number(val))}
          suffix="kcal"
          placeholder="2567"
        />
      </div>

      <div className={styles.field}>
        <div className={styles.titleRow}>
          <Droplets size={18} color="#29B6F6" />
          <h3 className={styles.title}>Meta de hidratação</h3>
        </div>
        <Input
          type="number"
          value={hydrationGoal}
          onChange={(val) => onHydrationChange(Number(val))}
          suffix="ml"
          placeholder="4025"
        />
      </div>
    </div>
  );
}
