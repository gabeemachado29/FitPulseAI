import { create } from 'zustand';

export const useNutritionStore = create((set, get) => ({
  dailyLog: null,
  weeklyLogs: [],
  loading: false,
  error: null,

  setDailyLog: (log) => set({ dailyLog: log }),
  setWeeklyLogs: (logs) => set({ weeklyLogs: logs }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addMeal: (meal) => {
    const current = get().dailyLog;
    if (!current) {
      set({
        dailyLog: {
          meals: [meal],
          totalCalories: meal.calories,
          totalProtein: meal.protein,
          totalCarbs: meal.carbs,
          totalFat: meal.fat,
        },
      });
    } else {
      set({
        dailyLog: {
          ...current,
          meals: [...current.meals, meal],
          totalCalories: current.totalCalories + meal.calories,
          totalProtein: current.totalProtein + meal.protein,
          totalCarbs: current.totalCarbs + meal.carbs,
          totalFat: current.totalFat + meal.fat,
        },
      });
    }
  },

  removeMeal: (index) => {
    const current = get().dailyLog;
    if (!current) return;
    const meal = current.meals[index];
    const meals = current.meals.filter((_, i) => i !== index);
    set({
      dailyLog: {
        ...current,
        meals,
        totalCalories: current.totalCalories - meal.calories,
        totalProtein: current.totalProtein - meal.protein,
        totalCarbs: current.totalCarbs - meal.carbs,
        totalFat: current.totalFat - meal.fat,
      },
    });
  },

  clearNutrition: () =>
    set({ dailyLog: null, weeklyLogs: [], loading: false, error: null }),
}));
