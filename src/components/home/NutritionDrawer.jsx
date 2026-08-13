import Modal from '../ui/Modal';
import ProgressBar from '../ui/ProgressBar';
import WeeklyChart from './WeeklyChart';
import styles from './NutritionDrawer.module.css';

export default function NutritionDrawer({
  isOpen,
  onClose,
  dailyLog,
  weeklyLogs = [],
  profile,
}) {
  const proteinGoal = profile?.proteinGoal || 230;
  const carbsGoal = profile?.carbsGoal || 251;
  const fatGoal = profile?.fatGoal || 71;
  const calorieGoal = profile?.calorieGoal || 2567;

  const currentProtein = dailyLog?.totalProtein || 0;
  const currentCarbs = dailyLog?.totalCarbs || 0;
  const currentFat = dailyLog?.totalFat || 0;

  // Compute 4 summary stats
  const registeredDays = weeklyLogs.filter((l) => l.totalCalories > 0).length;
  const totalWeeklyCalories = weeklyLogs.reduce((sum, l) => sum + (l.totalCalories || 0), 0);
  const avgConsumed = registeredDays > 0 ? Math.round(totalWeeklyCalories / registeredDays) : 0;
  const avgBurned = 0; // Burned from workouts/strava

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes de Nutrição"
      size="lg"
    >
      <div className={styles.container}>
        {/* Section 1: Macronutrientes de hoje */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            Macronutrientes de hoje
            <span className={styles.subtitleTag}>estimativa</span>
          </h3>

          <div className={styles.macrosList}>
            {/* Proteína */}
            <div className={styles.macroRow}>
              <div className={styles.macroInfo}>
                <span className={styles.macroIcon}>🧀</span>
                <span className={styles.macroName}>Proteína</span>
                <span className={styles.macroValue}>
                  <strong>{currentProtein}</strong> / {proteinGoal}g
                </span>
              </div>
              <ProgressBar
                value={currentProtein}
                max={proteinGoal}
                color="#FFD600"
                height={6}
              />
            </div>

            {/* Carboidratos */}
            <div className={styles.macroRow}>
              <div className={styles.macroInfo}>
                <span className={styles.macroIcon}>🌾</span>
                <span className={styles.macroName}>Carboidratos</span>
                <span className={styles.macroValue}>
                  <strong>{currentCarbs}</strong> / {carbsGoal}g
                </span>
              </div>
              <ProgressBar
                value={currentCarbs}
                max={carbsGoal}
                color="#29B6F6"
                height={6}
              />
            </div>

            {/* Gorduras */}
            <div className={styles.macroRow}>
              <div className={styles.macroInfo}>
                <span className={styles.macroIcon}>💧</span>
                <span className={styles.macroName}>Gorduras</span>
                <span className={styles.macroValue}>
                  <strong>{currentFat}</strong> / {fatGoal}g
                </span>
              </div>
              <ProgressBar
                value={currentFat}
                max={fatGoal}
                color="#EF5350"
                height={6}
              />
            </div>
          </div>

          <p className={styles.noteText}>
            Configure suas metas de macros no Perfil para uma estimativa mais precisa.
          </p>
        </div>

        {/* Section 2: Evolução Semanal */}
        <WeeklyChart weeklyLogs={weeklyLogs} calorieGoal={calorieGoal} />

        {/* Section 3: 4 Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{avgConsumed}</span>
            <span className={styles.statUnit}>kcal</span>
            <span className={styles.statLabel}>Média consumida</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statNumber}>{avgBurned}</span>
            <span className={styles.statUnit}>kcal</span>
            <span className={styles.statLabel}>Média gasta</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statNumber}>{registeredDays}</span>
            <span className={styles.statUnit}>/ 7</span>
            <span className={styles.statLabel}>Dias registrados</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statNumber}>{totalWeeklyCalories}</span>
            <span className={styles.statUnit}>kcal</span>
            <span className={styles.statLabel}>Total da semana</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
