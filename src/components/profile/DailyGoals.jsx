import { Target, Droplets } from 'lucide-react';
import Input from '../ui/Input';
import styles from './DailyGoals.module.css';

export default function DailyGoals({
  calorieGoal = 2200,
  hydrationGoal = 2625,
  onCalorieChange,
  onHydrationChange,
}) {
  const safeCalorie = Number(calorieGoal) || 2200;
  const safeHydration = Number(hydrationGoal) || 2625;

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <div className={styles.titleRow}>
          <Target size={18} color="var(--accent-green)" />
          <h3 className={styles.title}>Meta calórica diária</h3>
        </div>
        <Input
          type="number"
          value={safeCalorie}
          onChange={(val) => onCalorieChange && onCalorieChange(Number(val) || 0)}
          suffix="kcal"
          placeholder="2200"
        />
      </div>

      <div className={styles.field}>
        <div className={styles.titleRow}>
          <Droplets size={18} color="#29B6F6" />
          <h3 className={styles.title}>Meta de hidratação</h3>
        </div>
        <Input
          type="number"
          value={safeHydration}
          onChange={(val) => onHydrationChange && onHydrationChange(Number(val) || 0)}
          suffix="ml"
          placeholder="2625"
        />
      </div>
    </div>
  );
}
