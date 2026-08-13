import { UtensilsCrossed, TrendingDown, Flame } from 'lucide-react';
import styles from './MacroSummary.module.css';

export default function MacroSummary({ consumed = 0, burned = 0, net = 0 }) {
  return (
    <div className={styles.grid}>
      <div className={styles.statCard}>
        <UtensilsCrossed size={18} className={styles.iconYellow} />
        <span className={styles.value}>{consumed}</span>
        <span className={styles.unit}>kcal</span>
        <span className={styles.label}>Consumido</span>
      </div>

      <div className={styles.statCard}>
        <TrendingDown size={18} className={styles.iconBlue} />
        <span className={styles.value}>{burned}</span>
        <span className={styles.unit}>kcal</span>
        <span className={styles.label}>Gasto</span>
      </div>

      <div className={styles.statCard}>
        <Flame size={18} className={styles.iconGreen} />
        <span className={styles.value}>{net}</span>
        <span className={styles.unit}>kcal</span>
        <span className={styles.label}>Líquido</span>
      </div>
    </div>
  );
}
