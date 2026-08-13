import styles from './PillToggle.module.css';

export default function PillToggle({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className = '',
}) {
  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${styles[size]} ${className}`}
      role="radiogroup"
    >
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = typeof option === 'string' ? option : option.label;
        const optionIcon = typeof option === 'object' ? option.icon : null;
        const isActive = value === optionValue;

        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`${styles.pill} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(optionValue)}
          >
            {optionIcon && (
              <span className={styles.pillIcon}>{optionIcon}</span>
            )}
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}
