/**
 * FitPulseAI — Gamification & Badges Service
 * Tracks and unlocks user achievements based on activity.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const ALL_ACHIEVEMENTS = [
  {
    id: 'first_workout',
    title: 'Primeiro Passo 🌟',
    description: 'Concluiu a primeira sessão de treino no app.',
    icon: '🏋️',
    category: 'workouts',
  },
  {
    id: 'water_master',
    title: 'Hidratação Perfeita 💧',
    description: 'Atingiu a meta de água do dia.',
    icon: '💧',
    category: 'hydration',
  },
  {
    id: 'scanner_pro',
    title: 'Mestre do Scanner 📸',
    description: 'Escaneou e salvou 5 refeições por foto ou texto.',
    icon: '📸',
    category: 'nutrition',
  },
  {
    id: 'streak_3d',
    title: 'Foco Total 🔥',
    description: 'Manteve 3 dias consecutivos registrando atividades.',
    icon: '🔥',
    category: 'streak',
  },
  {
    id: 'strava_connected',
    title: 'Conexão Esportiva 🚴',
    description: 'Conectou sua conta do Strava ao FitPulseAI.',
    icon: '⚡',
    category: 'social',
  },
  {
    id: 'iron_athlete',
    title: 'Atleta de Ferro 💪',
    description: 'Completou 5 treinos na mesma semana.',
    icon: '🏆',
    category: 'workouts',
  },
];

/**
 * Fetch unlocked achievements for a user.
 */
export async function fetchUserAchievements(uid) {
  if (!uid) return [];

  try {
    const docRef = doc(db, 'users', uid, 'achievements', 'unlocked');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data().list || [];
    }
  } catch (err) {
    console.error('Error fetching achievements:', err);
  }

  return [];
}

/**
 * Unlock an achievement for a user.
 */
export async function unlockAchievement(uid, achievementId) {
  if (!uid || !achievementId) return;

  const current = await fetchUserAchievements(uid);
  if (current.some((a) => a.id === achievementId)) {
    return current; // Already unlocked
  }

  const found = ALL_ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!found) return current;

  const newUnlocked = [
    ...current,
    {
      ...found,
      unlockedAt: new Date().toISOString(),
    },
  ];

  const docRef = doc(db, 'users', uid, 'achievements', 'unlocked');
  await setDoc(docRef, { list: newUnlocked });

  return newUnlocked;
}
