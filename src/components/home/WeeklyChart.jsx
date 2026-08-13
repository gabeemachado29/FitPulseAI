import { useState } from 'react';
import styles from './WeeklyChart.module.css';

const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export default function WeeklyChart({ weeklyLogs = [], calorieGoal = 2567 }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Generate 7 days ending today
  const chartData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = DAY_NAMES[d.getDay()];

    const log = weeklyLogs.find((l) => l.date === dateKey);
    const calories = log ? log.totalCalories : 0;

    chartData.push({
      dateKey,
      dayName,
      calories,
      isToday: i === 0,
    });
  }

  const maxCalories = Math.max(calorieGoal, ...chartData.map((d) => d.calories), 2800);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Evolução semanal (calorias)</h3>
        <span className={styles.subtitle}>toque em um dia</span>
      </div>

      <div className={styles.chartArea}>
        {/* Goal Line */}
        <div
          className={styles.goalLine}
          style={{ bottom: `${(calorieGoal / maxCalories) * 100}%` }}
        >
          <span className={styles.goalLabel}>Meta</span>
        </div>

        {/* Bars */}
        <div className={styles.barsRow}>
          {chartData.map((day, idx) => {
            const barHeightPercent = (day.calories / maxCalories) * 100;

            return (
              <div
                key={day.dateKey}
                className={styles.barCol}
                onMouseEnter={() => setActiveTooltip(idx)}
                onMouseLeave={() => setActiveTooltip(null)}
                onClick={() => setActiveTooltip(activeTooltip === idx ? null : idx)}
              >
                {/* Tooltip */}
                {activeTooltip === idx && (
                  <div className={styles.tooltip}>
                    <span className={styles.tooltipDay}>{day.dayName}</span>
                    <span className={styles.tooltipValue}>
                      Consumido: {day.calories} kcal
                    </span>
                  </div>
                )}

                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${day.isToday ? styles.barToday : ''}`}
                    style={{ height: `${Math.max(barHeightPercent, 4)}%` }}
                  />
                </div>
                <span className={styles.dayLabel}>{day.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotGreen}`} />
          <span>Hoje</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotGray}`} />
          <span>Dias anteriores</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dashLine} />
          <span>Meta</span>
        </div>
      </div>
    </div>
  );
}
