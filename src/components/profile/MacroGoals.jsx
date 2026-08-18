import Button from '../ui/Button';
import Input from '../ui/Input';
import styles from './MacroGoals.module.css';

export default function MacroGoals({
  protein = 150,
  carbs = 220,
  fat = 60,
  onChange,
  onCalculate,
}) {
  const safeProtein = Number(protein) || 150;
  const safeCarbs = Number(carbs) || 220;
  const safeFat = Number(fat) || 60;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Macronutrientes</h3>
        <Button variant="secondary" size="sm" onClick={onCalculate}>
          Calcular
        </Button>
      </div>

      <div className={styles.grid3}>
        <div className={styles.col}>
          <label className={styles.label}>Proteína</label>
          <Input
            type="number"
            value={safeProtein}
            onChange={(val) => onChange && onChange('proteinGoal', Number(val) || 0)}
            suffix="g"
            placeholder="150"
          />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>Carbs</label>
          <Input
            type="number"
            value={safeCarbs}
            onChange={(val) => onChange && onChange('carbsGoal', Number(val) || 0)}
            suffix="g"
            placeholder="220"
          />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>Gordura</label>
          <Input
            type="number"
            value={safeFat}
            onChange={(val) => onChange && onChange('fatGoal', Number(val) || 0)}
            suffix="g"
            placeholder="60"
          />
        </div>
      </div>
    </div>
  );
}
