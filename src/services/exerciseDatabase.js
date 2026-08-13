export const EXERCISE_DATABASE = [
  // Peito
  { id: 'ex_1', name: 'Supino reto com barra', muscleGroup: 'Peito', category: 'Peito', defaultSets: 4, defaultReps: 10 },
  { id: 'ex_2', name: 'Supino inclinado com halteres', muscleGroup: 'Peito', category: 'Peito', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_3', name: 'Supino declinado', muscleGroup: 'Peito', category: 'Peito', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_4', name: 'Crucifixo com halteres', muscleGroup: 'Peito', category: 'Peito', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_5', name: 'Crossover na polia alta', muscleGroup: 'Peito', category: 'Peito', defaultSets: 4, defaultReps: 15 },
  { id: 'ex_6', name: 'Flexão de braços', muscleGroup: 'Peito', category: 'Peito', defaultSets: 3, defaultReps: 15 },

  // Costas
  { id: 'ex_7', name: 'Puxada alta frente', muscleGroup: 'Costas', category: 'Costas', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_8', name: 'Remada curvada com barra', muscleGroup: 'Costas', category: 'Costas', defaultSets: 4, defaultReps: 10 },
  { id: 'ex_9', name: 'Remada baixa no triângulo', muscleGroup: 'Costas', category: 'Costas', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_10', name: 'Remada articulada unilateral', muscleGroup: 'Costas', category: 'Costas', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_11', name: 'Pullover na polia alta', muscleGroup: 'Costas', category: 'Costas', defaultSets: 3, defaultReps: 15 },
  { id: 'ex_12', name: 'Levantamento terra', muscleGroup: 'Costas', category: 'Costas', defaultSets: 4, defaultReps: 8 },

  // Pernas
  { id: 'ex_13', name: 'Agachamento livre com barra', muscleGroup: 'Pernas', category: 'Quadríceps', defaultSets: 4, defaultReps: 10 },
  { id: 'ex_14', name: 'Leg Press 45°', muscleGroup: 'Pernas', category: 'Quadríceps', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_15', name: 'Cadeira extensora', muscleGroup: 'Pernas', category: 'Quadríceps', defaultSets: 4, defaultReps: 15 },
  { id: 'ex_16', name: 'Mesa flexora', muscleGroup: 'Pernas', category: 'Posterior', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_17', name: 'Stiff com halteres', muscleGroup: 'Pernas', category: 'Posterior', defaultSets: 4, defaultReps: 10 },
  { id: 'ex_18', name: 'Afundo com halteres', muscleGroup: 'Pernas', category: 'Quadríceps', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_19', name: 'Gêmeos em pé (Panturrilha)', muscleGroup: 'Pernas', category: 'Panturrilha', defaultSets: 4, defaultReps: 20 },

  // Ombros
  { id: 'ex_20', name: 'Desenvolvimento com halteres', muscleGroup: 'Ombros', category: 'Ombros', defaultSets: 4, defaultReps: 10 },
  { id: 'ex_21', name: 'Elevação lateral com halteres', muscleGroup: 'Ombros', category: 'Ombros', defaultSets: 4, defaultReps: 15 },
  { id: 'ex_22', name: 'Elevação frontal na polia', muscleGroup: 'Ombros', category: 'Ombros', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_23', name: 'Crucifixo inverso no peck deck', muscleGroup: 'Ombros', category: 'Ombros', defaultSets: 4, defaultReps: 15 },

  // Braços
  { id: 'ex_24', name: 'Rosca direta com barra W', muscleGroup: 'Braços', category: 'Bíceps', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_25', name: 'Rosca alternada no banco inclinado', muscleGroup: 'Braços', category: 'Bíceps', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_26', name: 'Rosca martelo com halteres', muscleGroup: 'Braços', category: 'Bíceps', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_27', name: 'Tríceps corda na polia', muscleGroup: 'Braços', category: 'Tríceps', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_28', name: 'Tríceps testa com barra W', muscleGroup: 'Braços', category: 'Tríceps', defaultSets: 4, defaultReps: 10 },
  { id: 'ex_29', name: 'Tríceps francês com halter', muscleGroup: 'Braços', category: 'Tríceps', defaultSets: 3, defaultReps: 12 },

  // Abdômen & Cardio
  { id: 'ex_30', name: 'Abdominal na polia', muscleGroup: 'Abdômen', category: 'Abdômen', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_31', name: 'Elevação de pernas', muscleGroup: 'Abdômen', category: 'Abdômen', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_32', name: 'Prancha frontal', muscleGroup: 'Abdômen', category: 'Abdômen', defaultSets: 3, defaultReps: 60 },
  { id: 'ex_33', name: 'Corrida na esteira', muscleGroup: 'Cardio', category: 'Cardio', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_34', name: 'Bicicleta ergométrica', muscleGroup: 'Cardio', category: 'Cardio', defaultSets: 1, defaultReps: 30 },
  { id: 'ex_35', name: 'Elíptico / Transport', muscleGroup: 'Cardio', category: 'Cardio', defaultSets: 1, defaultReps: 20 },
];

export function searchExercises(query) {
  if (!query || !query.trim()) return EXERCISE_DATABASE;
  const term = query.toLowerCase().trim();
  return EXERCISE_DATABASE.filter(
    (ex) =>
      ex.name.toLowerCase().includes(term) ||
      ex.muscleGroup.toLowerCase().includes(term) ||
      ex.category.toLowerCase().includes(term)
  );
}
