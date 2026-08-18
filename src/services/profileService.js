import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DEFAULT_PROFILE = {
  height: 175,
  weight: 75,
  age: 25,
  sex: 'masculino',
  activityLevel: 'sedentario',
  calorieGoal: 2200,
  hydrationGoal: 2625,
  proteinGoal: 150,
  carbsGoal: 220,
  fatGoal: 60,
  bmi: 24.5,
  bmr: 1730,
  tdee: 2076,
};

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

export function calculateTDEE(bmr, activityLevel = 'sedentario') {
  const multipliers = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    ativo: 1.725,
    muito_ativo: 1.9,
  };
  const safeActivity = typeof activityLevel === 'string' ? activityLevel.toLowerCase() : 'sedentario';
  const factor = multipliers[safeActivity] || 1.2;
  return Math.round((Number(bmr) || 2000) * factor);
}

export function calculateHydrationGoal(weightKg) {
  const w = Number(weightKg) || 0;
  if (w <= 0) return 2500;
  return Math.round(w * 35);
}

export function calculateMacroGoals(weightKg, tdee) {
  const w = Number(weightKg) || 0;
  const t = Number(tdee) || 2000;

  if (w <= 0 || t <= 0) {
    return { protein: 150, carbs: 200, fat: 60 };
  }
  const protein = Math.round(w * 2.0);
  const fat = Math.round(w * 0.8);
  const caloriesFromProteinAndFat = protein * 4 + fat * 9;
  const remainingCalories = Math.max(0, t - caloriesFromProteinAndFat);
  const carbs = Math.round(remainingCalories / 4);

  return { protein, carbs, fat };
}

/**
 * Fetch user profile from Firestore with timeout protection to prevent page load hangs.
 */
export async function fetchUserProfile(uid) {
  if (!uid) return DEFAULT_PROFILE;

  try {
    const docRef = doc(db, 'users', uid);

    // Timeout getDoc after 3 seconds so page never gets stuck
    const snap = await Promise.race([
      getDoc(docRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 3000)),
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
        calorieGoal: Number(data.calorieGoal) || DEFAULT_PROFILE.calorieGoal,
        hydrationGoal: Number(data.hydrationGoal) || DEFAULT_PROFILE.hydrationGoal,
        proteinGoal: Number(data.proteinGoal) || DEFAULT_PROFILE.proteinGoal,
        carbsGoal: Number(data.carbsGoal) || DEFAULT_PROFILE.carbsGoal,
        fatGoal: Number(data.fatGoal) || DEFAULT_PROFILE.fatGoal,
        ...data,
      };
    }

    // Save initial profile in background if doc doesn't exist
    setDoc(docRef, { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() }).catch(console.warn);
    return DEFAULT_PROFILE;
  } catch (err) {
    console.warn('fetchUserProfile timeout or error, using default profile:', err.message);
    return DEFAULT_PROFILE;
  }
}

export async function saveUserProfile(uid, profileData) {
  if (!uid) throw new Error('User ID is required');
  const docRef = doc(db, 'users', uid);

  const { bmi, category } = calculateBMI(profileData.weight, profileData.height);
  const bmr = calculateBMR(profileData.weight, profileData.height, profileData.age, profileData.sex);
  const tdee = calculateTDEE(bmr, profileData.activityLevel);

  const updatedData = {
    ...profileData,
    bmi,
    bmiCategory: category,
    bmr,
    tdee,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedData, { merge: true });
  return updatedData;
}
