import { useState } from 'react';
import { Droplets, X } from 'lucide-react';
import Card from '../ui/Card';
import ProgressRing from '../ui/ProgressRing';
import { useToastStore } from '../../store/toastStore';
import styles from './WaterTracker.module.css';

const QUICK_AMOUNTS = [
  { label: '150ml', amount: 150, icon: '🥤' },
  { label: '250ml', amount: 250, icon: '🥛' },
  { label: '500ml', amount: 500, icon: '💧' },
  { label: '1L', amount: 1000, icon: '🫗' },
];

export default function WaterTracker({
  dailyWater,
  hydrationGoal = 4025,
  onAddWater,
  onRemoveWater,
  loading,
}) {
  const [showAnimation, setShowAnimation] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const totalMl = dailyWater?.totalMl || 0;
  const entries = dailyWater?.entries || [];
  const percentage = hydrationGoal > 0 ? Math.round((totalMl / hydrationGoal) * 100) : 0;
  const wasGoalReached = totalMl >= hydrationGoal;

  const handleAddWater = async (amount) => {
    // Trigger drop animation
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 700);

    await onAddWater(amount);

    // Check if goal was just reached
    if (!wasGoalReached && (totalMl + amount) >= hydrationGoal) {
      addToast('🎉 Meta de hidratação atingida! Parabéns!', 'success', 4000);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card variant="bordered" padding="lg" className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <Droplets size={20} />
          </div>
          <div>
            <h3 className={styles.title}>Hidratação</h3>
            <p className={styles.subtitle}>Registro do dia</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className={styles.progressSection}>
        <div className={styles.ringWrap}>
          <ProgressRing
            value={totalMl}
            max={hydrationGoal}
            size={120}
            strokeWidth={8}
            label="FALTAM"
            unit="ml"
            color="#38BDF8"
          />
        </div>

        <div className={styles.stats}>
          <div>
            <span className={styles.statMain}>
              {totalMl.toLocaleString('pt-BR')}
            </span>
            <span className={styles.statUnit}>ml</span>
          </div>
          <p className={styles.statGoal}>
            Meta: {hydrationGoal.toLocaleString('pt-BR')} ml
          </p>
          <span className={styles.statPercent}>{percentage}%</span>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className={styles.quickButtons}>
        {QUICK_AMOUNTS.map(({ label, amount, icon }) => (
          <button
            key={amount}
            type="button"
            className={styles.quickBtn}
            onClick={() => handleAddWater(amount)}
            disabled={loading}
          >
            <span className={styles.quickBtnIcon}>{icon}</span>
            <span className={styles.quickBtnLabel}>+{label}</span>
          </button>
        ))}
      </div>

      {/* Entries List */}
      {entries.length > 0 && (
        <div className={styles.entriesSection}>
          <div className={styles.entriesHeader}>
            <span className={styles.entriesTitle}>Registros</span>
            <span className={styles.entriesCount}>
              {entries.length} {entries.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className={styles.entriesList}>
            {[...entries].reverse().map((entry, reverseIdx) => {
              const realIndex = entries.length - 1 - reverseIdx;
              return (
                <div key={`${entry.time}-${realIndex}`} className={styles.entryItem}>
                  <div className={styles.entryInfo}>
                    <span className={styles.entryDrop}>💧</span>
                    <span className={styles.entryAmount}>{entry.amount}ml</span>
                    <span className={styles.entryTime}>
                      {formatTime(entry.time)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.entryRemoveBtn}
                    onClick={() => onRemoveWater(realIndex)}
                    aria-label="Remover registro"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <p className={styles.emptyEntries}>
          Nenhum registro de água hoje. Comece a se hidratar! 💧
        </p>
      )}

      {/* Goal Reached Celebration */}
      {wasGoalReached && (
        <div className={styles.goalReached}>
          🎉 Meta de hidratação atingida!
        </div>
      )}

      {/* Drop Animation */}
      {showAnimation && (
        <div className={styles.addAnimation}>💧</div>
      )}
    </Card>
  );
}
