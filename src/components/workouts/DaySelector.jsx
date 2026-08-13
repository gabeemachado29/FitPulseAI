import styles from './DaySelector.module.css';

const DAYS = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
];

export default function DaySelector({ selectedDay, onSelectDay }) {
  return (
    <div className={styles.container}>
      {DAYS.map(({ key, label }) => {
        const isActive = selectedDay === key;
        return (
          <button
            key={key}
            type="button"
            className={`${styles.pill} ${isActive ? styles.active : ''}`}
            onClick={() => onSelectDay(key)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
