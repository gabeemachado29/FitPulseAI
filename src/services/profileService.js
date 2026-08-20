/**
 * FitPulseAI — Profile & Metabolic Goals Service
 * 
 * Implements Mifflin-St Jeor equation for Basal Metabolic Rate (BMR),
 * Total Daily Energy Expenditure (TDEE), macronutrient partitioning,
 * daily water requirements, and onboarding lifecycle management.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const DEFAULT_PROFILE = {
  height: 175,
  weight: 75,
  age: 25,
  sex: 'masculino',
  activityLevel: 'sedentario',
  goal: 'manutencao', // 'perda_peso' | 'manutencao' | 'ganho_massa'
  workoutDaysPerWeek: 3,
  targetWeight: 75,
  calorieGoal: 2200,
  hydrationGoal: 2625,
  proteinGoal: 150,
  carbsGoal: 220,
  fatGoal: 60,
  bmi: 24.5,
  bmr: 1730,
  tdee: 2076,
  has_completed_onboarding: false,
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  theme: 'system',
  language: 'pt-BR',
  notifications: {
    hydration: true,
    meals: true,
  },
};

/**
 * Calculates Body Mass Index (BMI) and categorization.
 * 
 * @param {number} weightKg
 * @param {number} heightCm
 */
export function calculateBMI(weightKg, heightCm) {
  const w = Number(weightKg) || 0;
  const h = Number(heightCm) || 0;

  if (w <= 0 || h <= 0) return { bmi: 0, category: '-' };
  const heightM = h / 100;
  const bmi = parseFloat((w / (heightM * heightM)).toFixed(1));

  let category = 'Normal';
  if (bmi < 18.5) category = 'Abaixo do peso';
  else if (bmi < 25) category = 'Peso normal';
  else if (bmi < 30) category = 'Sobrepeso';
  else category = 'Obesidade';

  return { bmi, category };
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation:
 * - Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * - Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 *
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} ageYears
 * @param {string} [sex='masculino']
 * @returns {number} BMR in kcal
 */
export function calculateBMR(weightKg, heightCm, ageYears, sex = 'masculino') {
  const w = Number(weightKg) || 0;
  const h = Number(heightCm) || 0;
  const a = Number(ageYears) || 0;

  if (w <= 0 || h <= 0 || a <= 0) return 2000;

  const safeSex = typeof sex === 'string' ? sex.toLowerCase() : 'masculino';
  let bmr = 10 * w + 6.25 * h - 5 * a;
  if (safeSex === 'feminino') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  return Math.round(bmr);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on activity multiplier:
 * - Sedentário: 1.2
 * - Leve: 1.375
 * - Moderado: 1.55
 * - Ativo / Intenso: 1.725
 * - Muito Ativo: 1.9
 *
 * @param {number} bmr
 * @param {string} [activityLevel='sedentario']
 * @returns {number} TDEE in kcal
 */
export function calculateTDEE(bmr, activityLevel = 'sedentario') {
  const multipliers = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    ativo: 1.725,
    intenso: 1.725,
    muito_ativo: 1.9,
  };
  const safeActivity = typeof activityLevel === 'string' ? activityLevel.toLowerCase() : 'sedentario';
  const factor = multipliers[safeActivity] || 1.2;
  return Math.round((Number(bmr) || 2000) * factor);
}

/**
 * Calculates daily hydration goal:
 * - Base: 35ml per kg of body weight
 * - +500ml for regular workout activity (>=3 days/week)
 *
 * @param {number} weightKg
 * @param {number} [workoutDaysPerWeek=3]
 * @returns {number} Hydration in ml
 */
export function calculateHydrationGoal(weightKg, workoutDaysPerWeek = 3) {
  const w = Number(weightKg) || 0;
  if (w <= 0) return 2500;
  const base = Math.round(w * 35);
  const workoutBonus = Number(workoutDaysPerWeek) >= 3 ? 500 : 0;
  return base + workoutBonus;
}

/**
 * Calculates macronutrient and calorie targets according to user goal:
 * - Perda de peso: Déficit de 400 kcal, Proteína ~2.0g/kg, Gordura ~0.9g/kg, Carbos restantes
 * - Ganho de massa: Superávit de 400 kcal, Proteína ~2.0g/kg, Gordura ~0.9g/kg, Carbos restantes
 * - Manutenção: Neutro (TDEE), Proteína ~1.8g/kg, Gordura ~0.9g/kg, Carbos restantes
 *
 * @param {object} params
 * @param {number} params.weight
 * @param {number} params.height
 * @param {number} params.age
 * @param {string} params.sex
 * @param {string} params.activityLevel
 * @param {string} [params.goal='manutencao']
 * @param {number} [params.workoutDaysPerWeek=3]
 * @param {number} [params.targetWeight]
 */
export function calculateComprehensiveGoals({
  weight,
  height,
  age,
  sex = 'masculino',
  activityLevel = 'sedentario',
  goal = 'manutencao',
  workoutDaysPerWeek = 3,
  targetWeight,
}) {
  const w = Number(weight) || 75;
  const h = Number(height) || 175;
  const a = Number(age) || 25;

  const { bmi, category: bmiCategory } = calculateBMI(w, h);
  const bmr = calculateBMR(w, h, a, sex);
  const tdee = calculateTDEE(bmr, activityLevel);

  // Calorie target with deficit/surplus
  let calorieGoal = tdee;
  let proteinFactor = 1.8; // g/kg
  const fatFactor = 0.9;   // g/kg

  if (goal === 'perda_peso') {
    calorieGoal = Math.max(1200, Math.round(tdee - 400));
    proteinFactor = 2.0; // Higher protein to spare lean mass in deficit
  } else if (goal === 'ganho_massa') {
    calorieGoal = Math.round(tdee + 400);
    proteinFactor = 2.0; // Optimal protein for hypertrophy stimulus
  } else {
    calorieGoal = Math.round(tdee);
    proteinFactor = 1.8;
  }

  const proteinGoal = Math.round(w * proteinFactor);
  const fatGoal = Math.round(w * fatFactor);
  const caloriesFromProteinAndFat = proteinGoal * 4 + fatGoal * 9;
  const remainingCalories = Math.max(0, calorieGoal - caloriesFromProteinAndFat);
  const carbsGoal = Math.max(30, Math.round(remainingCalories / 4));

  const hydrationGoal = calculateHydrationGoal(w, workoutDaysPerWeek);

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    hydrationGoal,
    targetWeight: Number(targetWeight) || w,
  };
}

/**
 * Functional alias for backwards compatibility
 */
export function calculateMacroGoals(weightKg, tdee) {
  const w = Number(weightKg) || 0;
  const t = Number(tdee) || 2000;

  if (w <= 0 || t <= 0) {
    return { protein: 150, carbs: 200, fat: 60 };
  }
  const protein = Math.round(w * 2.0);
  const fat = Math.round(w * 0.9);
  const caloriesFromProteinAndFat = protein * 4 + fat * 9;
  const remainingCalories = Math.max(0, t - caloriesFromProteinAndFat);
  const carbs = Math.max(30, Math.round(remainingCalories / 4));

  return { protein, carbs, fat };
}

/**
 * Fetch user profile from Firestore with timeout protection.
 *
 * @param {string} uid
 * @returns {Promise<object>}
 */
export async function fetchUserProfile(uid) {
  if (!uid) return DEFAULT_PROFILE;

  try {
    const docRef = doc(db, 'users', uid);

    const snap = await Promise.race([
      getDoc(docRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 3500)),
    ]);

    if (snap && snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        height: Number(data.height) || DEFAULT_PROFILE.height,
        weight: Number(data.weight) || DEFAULT_PROFILE.weight,
        age: Number(data.age) || DEFAULT_PROFILE.age,
        sex: data.sex || DEFAULT_PROFILE.sex,
        activityLevel: data.activityLevel || DEFAULT_PROFILE.activityLevel,
        goal: data.goal || DEFAULT_PROFILE.goal,
        workoutDaysPerWeek: Number(data.workoutDaysPerWeek) || DEFAULT_PROFILE.workoutDaysPerWeek,
        targetWeight: Number(data.targetWeight) || Number(data.weight) || DEFAULT_PROFILE.targetWeight,
        calorieGoal: Number(data.calorieGoal) || DEFAULT_PROFILE.calorieGoal,
        hydrationGoal: Number(data.hydrationGoal) || DEFAULT_PROFILE.hydrationGoal,
        proteinGoal: Number(data.proteinGoal) || DEFAULT_PROFILE.proteinGoal,
        carbsGoal: Number(data.carbsGoal) || DEFAULT_PROFILE.carbsGoal,
        fatGoal: Number(data.fatGoal) || DEFAULT_PROFILE.fatGoal,
        has_completed_onboarding: Boolean(data.has_completed_onboarding),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        birthDate: data.birthDate || '',
        theme: data.theme || 'system',
        language: data.language || 'pt-BR',
        notifications: data.notifications || DEFAULT_PROFILE.notifications,
        ...data,
      };
    }

    return DEFAULT_PROFILE;
  } catch (err) {
    console.warn('fetchUserProfile timeout or error, using default profile:', err.message);
    return DEFAULT_PROFILE;
  }
}

/**
 * Save / Update user profile to Firestore with recalculated metabolic metrics.
 *
 * @param {string} uid
 * @param {object} profileData
 */
export async function saveUserProfile(uid, profileData) {
  if (!uid) throw new Error('User ID is required');
  const docRef = doc(db, 'users', uid);

  const calculated = calculateComprehensiveGoals({
    weight: profileData.weight,
    height: profileData.height,
    age: profileData.age,
    sex: profileData.sex,
    activityLevel: profileData.activityLevel,
    goal: profileData.goal,
    workoutDaysPerWeek: profileData.workoutDaysPerWeek,
    targetWeight: profileData.targetWeight,
  });

  const updatedData = {
    ...DEFAULT_PROFILE,
    ...profileData,
    ...calculated,
    // Preserve manual overrides if explicitly supplied in profileData
    calorieGoal: Number(profileData.calorieGoal) || calculated.calorieGoal,
    hydrationGoal: Number(profileData.hydrationGoal) || calculated.hydrationGoal,
    proteinGoal: Number(profileData.proteinGoal) || calculated.proteinGoal,
    carbsGoal: Number(profileData.carbsGoal) || calculated.carbsGoal,
    fatGoal: Number(profileData.fatGoal) || calculated.fatGoal,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedData, { merge: true });
  return updatedData;
}
