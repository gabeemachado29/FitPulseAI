import { Sparkles, Check } from 'lucide-react';
import Button from '../ui/Button';
import styles from './HealthMetrics.module.css';

export default function HealthMetrics({
  bmi = 37.2,
  bmiCategory = 'Obesidade',
  tdee = 2555,
  hydration = 3990,
  bmr = 2129,
  onApplyRecommendation,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Sparkles size={18} color="var(--accent-green)" />
        <h3 className={styles.title}>Recomendação calculada</h3>
      </div>

      {/* IMC Banner */}
      <div className={styles.bmiRow}>
        <span className={styles.bmiLabel}>
          IMC: <strong>{bmi}</strong>
        </span>
        <span className={styles.bmiCat}>{bmiCategory}</span>
      </div>

      {/* 2 Green Metric Boxes */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricBox}>
          <span className={styles.metricVal}>{tdee}</span>
          <span className={styles.metricUnit}>kcal/dia (TDEE)</span>
        </div>
        <div className={styles.metricBox}>
          <span className={styles.metricVal}>{hydration}</span>
          <span className={styles.metricUnit}>ml de água/dia</span>
        </div>
      </div>

      <p className={styles.bmrText}>
        Metabolismo basal: <strong>{bmr} kcal</strong>
      </p>

      <Button
        variant="primary"
        fullWidth
        icon={Check}
        onClick={onApplyRecommendation}
      >
        Usar recomendação calculada
      </Button>
    </div>
  );
}
