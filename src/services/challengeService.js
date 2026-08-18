/**
 * FitPulseAI — Community Challenges Service
 * Manages active fitness & hydration challenges.
 */

export const ACTIVE_CHALLENGES = [
  {
    id: 'challenge_water_week',
    title: 'Desafio 3L de Água / Dia 💧',
    description: 'Beba pelo menos 3000ml de água todos os dias por 7 dias seguidos.',
    category: 'hydration',
    durationDays: 7,
    participantsCount: 142,
    rewardBadge: '💧 Hidratação Master',
    progressPercent: 71,
    joined: true,
  },
  {
    id: 'challenge_workouts_4x',
    title: 'Maratona 4 Treinos na Semana 🏋️',
    description: 'Complete 4 sessões de treino ativas nesta semana.',
    category: 'workouts',
    durationDays: 7,
    participantsCount: 289,
    rewardBadge: '🏆 Maratonista',
    progressPercent: 50,
    joined: true,
  },
  {
    id: 'challenge_clean_eating',
    title: '7 Dias no Foco da Dieta 🥗',
    description: 'Registre todas as suas refeições sem estourar a meta calórica.',
    category: 'nutrition',
    durationDays: 7,
    participantsCount: 95,
    rewardBadge: '🥗 Foco Total',
    progressPercent: 0,
    joined: false,
  },
];

export async function fetchChallenges() {
  return ACTIVE_CHALLENGES;
}

export async function joinChallenge(challengeId) {
  const challenge = ACTIVE_CHALLENGES.find((c) => c.id === challengeId);
  if (challenge) {
    challenge.joined = true;
    challenge.participantsCount += 1;
  }
  return [...ACTIVE_CHALLENGES];
}
