import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export function getFormattedDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function fetchDailyNutritionLog(uid, dateKey) {
  if (!uid || !dateKey) return null;
  const docRef = doc(db, 'users', uid, 'nutritionLogs', dateKey);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return { date: dateKey, ...snap.data() };
  }

  return {
    date: dateKey,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };
}

export async function addMealToDailyLog(uid, dateKey, meal) {
  if (!uid || !dateKey) throw new Error('User ID and Date are required');
  const docRef = doc(db, 'users', uid, 'nutritionLogs', dateKey);
  const currentLog = await fetchDailyNutritionLog(uid, dateKey);

  const newMeals = [...(currentLog.meals || []), { ...meal, id: `meal_${Date.now()}` }];
  const totalCalories = newMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = newMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = newMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = newMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const updatedLog = {
    date: dateKey,
    meals: newMeals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedLog, { merge: true });
  return updatedLog;
}

export async function removeMealFromDailyLog(uid, dateKey, mealId) {
  if (!uid || !dateKey) throw new Error('User ID and Date are required');
  const docRef = doc(db, 'users', uid, 'nutritionLogs', dateKey);
  const currentLog = await fetchDailyNutritionLog(uid, dateKey);

  const newMeals = (currentLog.meals || []).filter((m) => m.id !== mealId);
  const totalCalories = newMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = newMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = newMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = newMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const updatedLog = {
    date: dateKey,
    meals: newMeals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedLog);
  return updatedLog;
}

export async function updateMealInDailyLog(uid, dateKey, mealId, updatedMeal) {
  if (!uid || !dateKey || !mealId) throw new Error('User ID, Date, and Meal ID are required');
  const docRef = doc(db, 'users', uid, 'nutritionLogs', dateKey);
  const currentLog = await fetchDailyNutritionLog(uid, dateKey);

  const newMeals = (currentLog.meals || []).map((m) =>
    m.id === mealId ? { ...m, ...updatedMeal } : m
  );
  const totalCalories = newMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = newMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = newMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = newMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const updatedLog = {
    date: dateKey,
    meals: newMeals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedLog, { merge: true });
  return updatedLog;
}

export async function fetchWeeklyNutritionLogs(uid) {
  if (!uid) return [];
  const days = [];
  const today = new Date();

  // Get last 7 days keys
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getFormattedDateKey(d));
  }

  const logs = await Promise.all(
    days.map((dateKey) => fetchDailyNutritionLog(uid, dateKey))
  );

  return logs;
}
