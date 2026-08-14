import { Utensils, Camera, Type, Edit2, Trash2, Flame } from 'lucide-react';
import Card from '../ui/Card';
import styles from './MealsList.module.css';

function getSourceIcon(source) {
  if (source === 'foto') return <Camera size={18} />;
  if (source === 'texto') return <Type size={18} />;
  return <Utensils size={18} />;
}

function formatMealTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function MealsList({
  meals = [],
  onEditMeal,
  onRemoveMeal,
}) {
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <Card variant="bordered" padding="lg" className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <Utensils size={20} />
          </div>
          <div>
            <h3 className={styles.title}>Refeições Registradas</h3>
            <p className={styles.subtitle}>Log de hoje</p>
          </div>
        </div>
        {meals.length > 0 && (
          <span className={styles.badge}>
            {totalCalories} kcal
          </span>
        )}
      </div>

      {/* List */}
      {meals.length > 0 ? (
        <div className={styles.list}>
          {meals.map((meal) => {
            const timeStr = formatMealTime(meal.timestamp);
            const name = meal.description || meal.name || 'Refeição';
            return (
              <div key={meal.id} className={styles.mealItem}>
                <div className={styles.mealLeft}>
                  <div className={styles.mealIcon}>
                    {getSourceIcon(meal.source)}
                  </div>
                  <div className={styles.mealDetails}>
                    <span className={styles.mealName}>{name}</span>
                    <span className={styles.mealMeta}>
                      {timeStr && <span>{timeStr} •</span>}
                      <span>P: {meal.protein || 0}g</span>
                      <span>C: {meal.carbs || 0}g</span>
                      <span>G: {meal.fat || 0}g</span>
                    </span>
                  </div>
                </div>

                <div className={styles.mealRight}>
                  <div className={styles.caloriesInfo}>
                    <span className={styles.caloriesVal}>{meal.calories || 0}</span>
                    <span className={styles.caloriesUnit}>kcal</span>
                  </div>

                  <div className={styles.mealActions}>
                    {onEditMeal && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onEditMeal(meal)}
                        title="Editar refeição"
                        aria-label="Editar refeição"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                    {onRemoveMeal && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                        onClick={() => onRemoveMeal(meal.id)}
                        title="Excluir refeição"
                        aria-label="Excluir refeição"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🥗</span>
          <p>Nenhuma refeição registrada hoje.</p>
          <p className={styles.subtitle}>
            Use o Scanner para foto ou texto e adicione seus alimentos!
          </p>
        </div>
      )}
    </Card>
  );
}
