import Card from '../ui/Card';
import ProgressRing from '../ui/ProgressRing';
import MacroSummary from './MacroSummary';
import styles from './CalorieCard.module.css';

export default function CalorieCard({
  consumed = 0,
  burned = 0,
  goal = 2567,
  onOpenDrawer,
}) {
  const net = Math.max(0, consumed - burned);

  return (
    <Card variant="bordered" padding="lg" className={styles.card}>
      <div className={styles.ringWrap}>
        <ProgressRing
          value={consumed}
          max={goal}
          size={220}
          label="RESTAM"
          unit="kcal"
          subLabel={`🔥 meta ${goal} kcal`}
        />
      </div>

      <MacroSummary consumed={consumed} burned={burned} net={net} />

      <button
        type="button"
        className={styles.detailBtn}
        onClick={onOpenDrawer}
      >
        Toque para ver macros e evolução
      </button>
    </Card>
  );
}
