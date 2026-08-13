import { useEffect, useRef, useState } from 'react';
import styles from './ProgressRing.module.css';

export default function ProgressRing({
  value = 0,
  max = 2567,
  size = 220,
  strokeWidth = 10,
  label = 'RESTAM',
  unit = 'kcal',
  subLabel = '',
  color = 'var(--accent-green)',
  trackColor = 'var(--border-primary)',
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const requestRef = useRef(null);
  const startTimeRef = useRef(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const remaining = Math.max(0, max - value);
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const duration = 1200;
    startTimeRef.current = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(percentage * eased);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [percentage]);

  const getProgressColor = () => {
    if (percentage >= 100) return 'var(--accent-red)';
    if (percentage >= 80) return 'var(--accent-yellow)';
    return color;
  };

  return (
    <div className={styles.container}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.svg}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className={styles.track}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={styles.progress}
        />
        {/* Dot at the tip */}
        {animatedValue > 0 && (
          <circle
            cx={
              size / 2 +
              radius *
                Math.cos(
                  ((animatedValue / 100) * 360 - 90) * (Math.PI / 180)
                )
            }
            cy={
              size / 2 +
              radius *
                Math.sin(
                  ((animatedValue / 100) * 360 - 90) * (Math.PI / 180)
                )
            }
            r={strokeWidth / 2 + 2}
            fill={getProgressColor()}
            className={styles.dot}
          />
        )}
      </svg>

      <div className={styles.center}>
        <div
          className={styles.dotIndicator}
          style={{ backgroundColor: getProgressColor() }}
        />
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{remaining.toLocaleString('pt-BR')}</span>
        <span className={styles.unit}>{unit}</span>
        {subLabel && (
          <span className={styles.subLabel}>{subLabel}</span>
        )}
      </div>
    </div>
  );
}
