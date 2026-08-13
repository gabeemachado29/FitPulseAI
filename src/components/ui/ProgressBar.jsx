import styles from './ProgressBar.module.css';

export default function ProgressBar({
  value = 0,
  max = 100,
  height = 8,
  color = 'var(--accent-green)',
  trackColor = 'var(--border-primary)',
  showLabel = false,
  label = '',
  className = '',
}) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={`${styles.container} ${className}`}>
      {showLabel && (
        <div className={styles.labelRow}>
          {label && <span className={styles.label}>{label}</span>}
          <span className={styles.percentage}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={styles.track}
        style={{ height, backgroundColor: trackColor }}
      >
        <div
          className={styles.fill}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
