import { Sparkles, Check } from 'lucide-react';
import Button from '../ui/Button';
import styles from './HealthMetrics.module.css';

export default function HealthMetrics({
  bmi = 24.5,
  bmiCategory = 'Normal',
  tdee = 2076,
  hydration = 2625,
  bmr = 1730,
  onApplyRecommendation,
}) {
  const safeBmi = typeof bmi === 'number' && !isNaN(bmi) ? bmi : 0;
  const safeCategory = typeof bmiCategory === 'string' ? bmiCategory : 'Normal';
  const safeTdee = Number(tdee) || 2000;
  const safeHydration = Number(hydration) || 2500;
  const safeBmr = Number(bmr) || 1700;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Sparkles size={18} color="var(--accent-green)" />
        <h3 className={styles.title}>Recomendação calculada</h3>
      </div>

      {/* IMC Banner */}
      <div className={styles.bmiRow}>
        <span className={styles.bmiLabel}>
          IMC: <strong>{safeBmi}</strong>
        </span>
        <span className={styles.bmiCat}>{safeCategory}</span>
      </div>

      {/* 2 Green Metric Boxes */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricBox}>
          <span className={styles.metricVal}>{safeTdee}</span>
          <span className={styles.metricUnit}>kcal/dia (TDEE)</span>
        </div>
        <div className={styles.metricBox}>
          <span className={styles.metricVal}>{safeHydration}</span>
          <span className={styles.metricUnit}>ml de água/dia</span>
        </div>
      </div>

      <p className={styles.bmrText}>
        Metabolismo basal: <strong>{safeBmr} kcal</strong>
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
