import Button from '../ui/Button';
import Input from '../ui/Input';
import styles from './MacroGoals.module.css';

export default function MacroGoals({
  protein,
  carbs,
  fat,
  onChange,
  onCalculate,
}) {
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
            value={protein}
            onChange={(val) => onChange('proteinGoal', Number(val))}
            suffix="g"
            placeholder="230"
          />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>Carbs</label>
          <Input
            type="number"
            value={carbs}
            onChange={(val) => onChange('carbsGoal', Number(val))}
            suffix="g"
            placeholder="251"
          />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>Gordura</label>
          <Input
            type="number"
            value={fat}
            onChange={(val) => onChange('fatGoal', Number(val))}
            suffix="g"
            placeholder="71"
          />
        </div>
      </div>
    </div>
  );
}
