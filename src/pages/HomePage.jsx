import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNutrition } from '../hooks/useNutrition';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import CalorieCard from '../components/home/CalorieCard';
import WeeklyChart from '../components/home/WeeklyChart';
import NutritionDrawer from '../components/home/NutritionDrawer';
import Loader from '../components/ui/Loader';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { dailyLog, weeklyLogs, loading } = useNutrition(selectedDate);

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleResetToday = () => {
    setSelectedDate(new Date());
  };

  const formattedDate = selectedDate
    .toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .replace(/^\w/, (c) => c.toUpperCase());

  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Gabriel';

  const calorieGoal = profile?.calorieGoal || 2567;
  const consumed = dailyLog?.totalCalories || 0;
  const burned = 0;

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <header className={styles.header}>
        <div>
          <p className="page-header__date">{formattedDate}</p>
          <h1 className="page-header__title">Olá, {firstName} 💪</h1>
        </div>

        {/* Date Selector Pills */}
        <div className={styles.dateNav}>
          <button
            type="button"
            className={styles.navArrow}
            onClick={handlePrevDay}
            aria-label="Dia anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className={`${styles.todayBtn} ${isToday ? styles.todayActive : ''}`}
            onClick={handleResetToday}
          >
            Hoje
          </button>
          <button
            type="button"
            className={styles.navArrow}
            onClick={handleNextDay}
            aria-label="Próximo dia"
            disabled={isToday}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loaderWrap}>
          <Loader size={36} />
        </div>
      ) : (
        <div className={styles.content}>
          {/* Main Calorie Ring Card */}
          <CalorieCard
            consumed={consumed}
            burned={burned}
            goal={calorieGoal}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />

          {/* Weekly Evolution Section */}
          <section className={styles.section}>
            <WeeklyChart weeklyLogs={weeklyLogs} calorieGoal={calorieGoal} />
          </section>
        </div>
      )}

      {/* Nutrition Details Drawer */}
      <NutritionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        dailyLog={dailyLog}
        weeklyLogs={weeklyLogs}
        profile={profile}
      />
    </div>
  );
}
