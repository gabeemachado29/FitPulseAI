import { Flame, Calendar } from 'lucide-react';
import styles from './MealPhotoGrid.module.css';

export default function MealPhotoGrid({ meals, onSelectMeal }) {
  if (!meals || meals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📸</div>
        <h3 className={styles.emptyTitle}>Nenhuma foto registrada</h3>
        <p className={styles.emptyText}>
          Use o <strong>Scanner por Foto</strong> para salvar suas refeições e acompanhar a evolução visual da sua dieta!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {meals.map((meal, idx) => {
        const dateStr = meal.date || meal.timestamp
          ? new Date(meal.timestamp || meal.date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
            })
          : '';

        const imgSrc = meal.photoBase64
          ? meal.photoBase64.startsWith('data:')
            ? meal.photoBase64
            : `data:image/jpeg;base64,${meal.photoBase64}`
          : null;

        return (
          <div
            key={meal.id || idx}
            className={styles.card}
            onClick={() => onSelectMeal(meal)}
            role="button"
            tabIndex={0}
          >
            {imgSrc ? (
              <img src={imgSrc} alt={meal.description || 'Prato'} className={styles.image} />
            ) : (
              <div className={styles.placeholderImg}>🍽️</div>
            )}

            <div className={styles.overlay}>
              <span className={styles.mealName}>{meal.description || meal.name || 'Refeição'}</span>
              <div className={styles.cardFooter}>
                <span className={styles.calText}>
                  <Flame size={12} />
                  {meal.calories} kcal
                </span>
                {dateStr && <span className={styles.dateText}>{dateStr}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
