import { X, Flame, Calendar } from 'lucide-react';
import styles from './MealPhotoModal.module.css';

export default function MealPhotoModal({ meal, onClose }) {
  if (!meal) return null;

  const formattedDate = meal.date || meal.timestamp
    ? new Date(meal.timestamp || meal.date).toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <X size={22} />
        </button>

        {meal.photoBase64 ? (
          <div className={styles.imageWrap}>
            <img src={meal.photoBase64.startsWith('data:') ? meal.photoBase64 : `data:image/jpeg;base64,${meal.photoBase64}`} alt={meal.description || 'Prato'} className={styles.image} />
          </div>
        ) : (
          <div className={styles.placeholderImg}>🍽️</div>
        )}

        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>{meal.description || meal.name || 'Refeição'}</h2>
            <div className={styles.calBadge}>
              <Flame size={16} color="var(--accent-orange)" />
              <span>{meal.calories} kcal</span>
            </div>
          </div>

          {formattedDate && (
            <div className={styles.dateRow}>
              <Calendar size={14} />
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Macros Grid */}
          <div className={styles.macrosGrid}>
            <div className={styles.macroBox}>
              <span className={styles.macroVal}>{meal.protein || 0}g</span>
              <span className={styles.macroLabel}>Proteína</span>
            </div>
            <div className={styles.macroBox}>
              <span className={styles.macroVal}>{meal.carbs || 0}g</span>
              <span className={styles.macroLabel}>Carbs</span>
            </div>
            <div className={styles.macroBox}>
              <span className={styles.macroVal}>{meal.fat || 0}g</span>
              <span className={styles.macroLabel}>Gordura</span>
            </div>
          </div>

          {/* Breakdown Items */}
          {Array.isArray(meal.items) && meal.items.length > 0 && (
            <div className={styles.itemsList}>
              <h4 className={styles.itemsTitle}>Alimentos no prato:</h4>
              {meal.items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <span>{item.name} ({item.portion})</span>
                  <span>{item.calories} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
