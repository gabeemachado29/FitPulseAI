import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNutritionStore } from '../store/nutritionStore';
import {
  fetchDailyNutritionLog,
  addMealToDailyLog,
  removeMealFromDailyLog,
  fetchWeeklyNutritionLogs,
  getFormattedDateKey,
} from '../services/nutritionService';

export function useNutrition(selectedDate = new Date()) {
  const user = useAuthStore((state) => state.user);
  const dateKey = getFormattedDateKey(selectedDate);

  const dailyLog = useNutritionStore((state) => state.dailyLog);
  const weeklyLogs = useNutritionStore((state) => state.weeklyLogs);
  const loading = useNutritionStore((state) => state.loading);
  const error = useNutritionStore((state) => state.error);

  const setDailyLog = useNutritionStore((state) => state.setDailyLog);
  const setWeeklyLogs = useNutritionStore((state) => state.setWeeklyLogs);
  const setLoading = useNutritionStore((state) => state.setLoading);
  const setError = useNutritionStore((state) => state.setError);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [dailyData, weeklyData] = await Promise.all([
          fetchDailyNutritionLog(user.uid, dateKey),
          fetchWeeklyNutritionLogs(user.uid),
        ]);
        setDailyLog(dailyData);
        setWeeklyLogs(weeklyData);
      } catch (err) {
        console.error('Failed to load nutrition logs:', err);
        setError('Erro ao carregar registros de nutrição.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, dateKey, setDailyLog, setWeeklyLogs, setLoading, setError]);

  const addMeal = async (meal) => {
    if (!user) return;
    try {
      const updated = await addMealToDailyLog(user.uid, dateKey, meal);
      setDailyLog(updated);
      // Refresh weekly logs
      const updatedWeekly = await fetchWeeklyNutritionLogs(user.uid);
      setWeeklyLogs(updatedWeekly);
      return updated;
    } catch (err) {
      console.error('Failed to add meal:', err);
      throw err;
    }
  };

  const removeMeal = async (mealId) => {
    if (!user) return;
    try {
      const updated = await removeMealFromDailyLog(user.uid, dateKey, mealId);
      setDailyLog(updated);
      const updatedWeekly = await fetchWeeklyNutritionLogs(user.uid);
      setWeeklyLogs(updatedWeekly);
      return updated;
    } catch (err) {
      console.error('Failed to remove meal:', err);
      throw err;
    }
  };

  return {
    dailyLog,
    weeklyLogs,
    loading,
    error,
    addMeal,
    removeMeal,
  };
}
