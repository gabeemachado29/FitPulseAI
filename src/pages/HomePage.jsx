import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNutrition } from '../hooks/useNutrition';
import { useWater } from '../hooks/useWater';
import { useToastStore } from '../store/toastStore';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import CalorieCard from '../components/home/CalorieCard';
import MealsList from '../components/home/MealsList';
import MealEditModal from '../components/home/MealEditModal';
import WaterTracker from '../components/home/WaterTracker';
import HealthConnectCard from '../components/home/HealthConnectCard';
import WeeklyChart from '../components/home/WeeklyChart';
import NutritionDrawer from '../components/home/NutritionDrawer';
import Loader from '../components/ui/Loader';
import { fetchBurnedLog } from '../services/burnedService';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { dailyLog, weeklyLogs, loading, removeMeal, updateMeal } = useNutrition(selectedDate);
  const { dailyWater, loading: waterLoading, addWater, removeWater } = useWater(selectedDate);
  const addToast = useToastStore((state) => state.addToast);

  const [editingMeal, setEditingMeal] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleOpenEdit = (meal) => {
    setEditingMeal(meal);
  };

  const handleSaveMealEdit = async (mealId, updatedData) => {
    setEditLoading(true);
    try {
      await updateMeal(mealId, updatedData);
      addToast('Refeição atualizada com sucesso!', 'success');
      setEditingMeal(null);
    } catch (err) {
      console.error('Error updating meal:', err);
      addToast('Erro ao atualizar refeição.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRemoveMeal = async (mealId) => {
    try {
      await removeMeal(mealId);
      addToast('Refeição removida.', 'info');
    } catch (err) {
      console.error('Error removing meal:', err);
      addToast('Erro ao remover refeição.', 'error');
    }
  };

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
  const hydrationGoal = profile?.hydrationGoal || 4025;
  const consumed = dailyLog?.totalCalories || 0;

  const [burned, setBurned] = useState(0);

  // Load burned calories for selected date
  useEffect(() => {
    if (!user?.uid) return;
    fetchBurnedLog(user.uid, selectedDate).then((log) => {
      setBurned(log.totalBurned || 0);
    });
  }, [user?.uid, selectedDate]);

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

          {/* Meals List */}
          <MealsList
            meals={dailyLog?.meals || []}
            onEditMeal={handleOpenEdit}
            onRemoveMeal={handleRemoveMeal}
          />

          {/* Water Tracker */}
          <WaterTracker
            dailyWater={dailyWater}
            hydrationGoal={hydrationGoal}
            onAddWater={addWater}
            onRemoveWater={removeWater}
            loading={waterLoading}
          />

          {/* Smartwatch / Health Connect Widget */}
          <HealthConnectCard />

          {/* Weekly Evolution Section */}
          <section className={styles.section}>
            <WeeklyChart weeklyLogs={weeklyLogs} calorieGoal={calorieGoal} />
          </section>
        </div>
      )}

      {/* Meal Edit Modal */}
      <MealEditModal
        isOpen={!!editingMeal}
        meal={editingMeal}
        onSave={handleSaveMealEdit}
        onClose={() => setEditingMeal(null)}
        loading={editLoading}
      />

      {/* Nutrition Details Drawer */}
      <NutritionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        dailyLog={dailyLog}
        weeklyLogs={weeklyLogs}
        profile={profile}
        onEditMeal={handleOpenEdit}
        onRemoveMeal={handleRemoveMeal}
      />
    </div>
  );
}
