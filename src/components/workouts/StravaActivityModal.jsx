import { useState, useEffect } from 'react';
import { X, Check, Clock, MapPin, Flame, Zap } from 'lucide-react';
import Loader from '../ui/Loader';
import styles from './StravaActivityModal.module.css';

const TYPE_LABELS = {
  Run: '🏃 Corrida',
  Ride: '🚴 Pedal',
  Swim: '🏊 Natação',
  Walk: '🚶 Caminhada',
  Hike: '🥾 Trilha',
  Workout: '💪 Treino',
  WeightTraining: '🏋️ Musculação',
  Yoga: '🧘 Yoga',
  CrossFit: '🔥 CrossFit',
};

function getActivityLabel(type) {
  return TYPE_LABELS[type] || `🏅 ${type}`;
}

export default function StravaActivityModal({
  isOpen,
  activities,
  loading,
  onApply,
  onClose,
}) {
  const [selected, setSelected] = useState(new Set());

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) setSelected(new Set());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (activityId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  };

  const selectedActivities = activities.filter((a) => selected.has(a.id));
  const totalCalories = selectedActivities.reduce(
    (sum, a) => sum + (a.calories || 0),
    0
  );

  const handleApply = () => {
    if (selectedActivities.length === 0) return;
    onApply(selectedActivities);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Handle Bar */}
        <div className={styles.handle}>
          <div className={styles.handleBar} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.stravaIcon}>
              <Zap size={20} />
            </div>
            <div>
              <h2 className={styles.headerTitle}>Atividades Strava</h2>
              <p className={styles.headerSubtitle}>
                Selecione as atividades para somar calorias
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Activity List */}
        <div className={styles.activityList}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <Loader size={36} />
              <p className={styles.loadingText}>Buscando atividades...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏃</div>
              <p className={styles.emptyText}>
                Nenhuma atividade recente encontrada no Strava.
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              const isSelected = selected.has(activity.id);
              return (
                <div
                  key={activity.id}
                  className={`${styles.activityItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleToggle(activity.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggle(activity.id);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <div
                    className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}
                  >
                    {isSelected && <Check size={14} />}
                  </div>

                  {/* Activity Info */}
                  <div className={styles.activityInfo}>
                    <div className={styles.activityName}>{activity.name}</div>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityType}>
                        {getActivityLabel(activity.type)}
                      </span>
                      {activity.distanceKm > 0 && (
                        <span className={styles.metaItem}>
                          <MapPin size={12} />
                          {activity.distanceKm} km
                        </span>
                      )}
                      <span className={styles.metaItem}>
                        <Clock size={12} />
                        {activity.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Calories */}
                  <div className={styles.activityCalories}>
                    <span className={styles.calValue}>{activity.calories}</span>
                    <span className={styles.calUnit}>kcal</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {activities.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.footerSummary}>
              <span className={styles.selectedCount}>
                {selected.size} {selected.size === 1 ? 'selecionada' : 'selecionadas'}
              </span>
              <span className={styles.totalCalories}>
                {totalCalories.toLocaleString('pt-BR')} kcal
              </span>
            </div>

            <button
              type="button"
              className={styles.applyBtn}
              disabled={selected.size === 0}
              onClick={handleApply}
            >
              <Flame size={16} />
              Aplicar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
