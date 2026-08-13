import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, category: '-' };
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal';
  if (bmi < 18.5) category = 'Abaixo do peso';
  else if (bmi < 25) category = 'Peso normal';
  else if (bmi < 30) category = 'Sobrepeso';
  else category = 'Obesidade';

  return { bmi, category };
}

export function calculateBMR(weightKg, heightCm, ageYears, sex = 'masculino') {
  if (!weightKg || !heightCm || !ageYears) return 2000;
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (sex.toLowerCase() === 'feminino') {
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
  const factor = multipliers[activityLevel.toLowerCase()] || 1.2;
  return Math.round(bmr * factor);
}

export function calculateHydrationGoal(weightKg) {
  if (!weightKg) return 2500;
  return Math.round(weightKg * 35);
}

export function calculateMacroGoals(weightKg, tdee) {
  if (!weightKg || !tdee) {
    return { protein: 150, carbs: 200, fat: 60 };
  }
  const protein = Math.round(weightKg * 2.0); // 2g per kg
  const fat = Math.round(weightKg * 0.8);      // 0.8g per kg
  const caloriesFromProteinAndFat = protein * 4 + fat * 9;
  const remainingCalories = Math.max(0, tdee - caloriesFromProteinAndFat);
  const carbs = Math.round(remainingCalories / 4);

  return { protein, carbs, fat };
}

export async function fetchUserProfile(uid) {
  if (!uid) return null;
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  // Return default profile if new user
  const defaultProfile = {
    height: 175,
    weight: 114,
    age: 22,
    sex: 'masculino',
    activityLevel: 'sedentario',
    calorieGoal: 2567,
    hydrationGoal: 4025,
    proteinGoal: 230,
    carbsGoal: 251,
    fatGoal: 71,
    bmi: 37.2,
    bmr: 2129,
    tdee: 2555,
  };

  await setDoc(docRef, { ...defaultProfile, createdAt: serverTimestamp() });
  return defaultProfile;
}

export async function saveUserProfile(uid, profileData) {
  if (!uid) throw new Error('User ID is required');
  const docRef = doc(db, 'users', uid);

  const { bmi, category } = calculateBMI(profileData.height, profileData.weight);
  const bmr = calculateBMR(profileData.weight, profileData.height, profileData.age, profileData.sex);
  const tdee = calculateTDEE(bmr, profileData.activityLevel);

  const updatedData = {
    ...profileData,
    bmi,
    bmiCategory: category,
    bmr,
    tdee,
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, updatedData, { merge: true });
  return updatedData;
}
