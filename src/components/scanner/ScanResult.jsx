import { Check, RotateCcw, Flame } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import styles from './ScanResult.module.css';

export default function ScanResult({ result, onSaveMeal, onReset, saving }) {
  if (!result) return null;

  const { name, calories, protein, carbs, fat, explanation } = result;

  return (
    <Card variant="highlight" padding="lg" className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        <div className={styles.calorieBadge}>
          <Flame size={16} color="var(--accent-orange)" />
          <span>{calories} kcal</span>
        </div>
      </div>

      {explanation && <p className={styles.explanation}>{explanation}</p>}

      {/* Macros Grid */}
      <div className={styles.macrosGrid}>
        <div className={styles.macroBox}>
          <span className={styles.macroVal}>{protein}g</span>
          <span className={styles.macroLabel}>Proteína</span>
        </div>
        <div className={styles.macroBox}>
          <span className={styles.macroVal}>{carbs}g</span>
          <span className={styles.macroLabel}>Carbs</span>
        </div>
        <div className={styles.macroBox}>
          <span className={styles.macroVal}>{fat}g</span>
          <span className={styles.macroLabel}>Gordura</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={Check}
          loading={saving}
          onClick={() => onSaveMeal(result)}
        >
          Adicionar à Nutrição de Hoje
        </Button>
        <Button
          variant="ghost"
          fullWidth
          icon={RotateCcw}
          onClick={onReset}
          disabled={saving}
        >
          Refazer análise
        </Button>
      </div>
    </Card>
  );
}
