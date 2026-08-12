import { create } from 'zustand';

const DEFAULT_REST_SECONDS = 60;

export const useWorkoutStore = create((set, get) => ({
  workouts: [],
  activeSession: null,
  loading: false,
  error: null,

  setWorkouts: (workouts) => set({ workouts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addWorkout: (workout) =>
    set((state) => ({ workouts: [...state.workouts, workout] })),

  updateWorkout: (id, updates) =>
    set((state) => ({
      workouts: state.workouts.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  removeWorkout: (id) =>
    set((state) => ({
      workouts: state.workouts.filter((w) => w.id !== id),
    })),

  /* ── Active Session ── */
  startSession: (workout) => {
    const exercises = workout.exercises.map((ex) => ({
      ...ex,
      completedSets: [],
    }));

    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);

    set({
      activeSession: {
        workoutId: workout.id,
        workoutName: workout.name,
        exercises,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        totalSets,
        completedSetsCount: 0,
        startTime: Date.now(),
        elapsedSeconds: 0,
        caloriesBurned: 0,
        isResting: false,
        restSecondsRemaining: DEFAULT_REST_SECONDS,
        isPaused: false,
      },
    });
  },

  completeSet: (load) => {
    const session = get().activeSession;
    if (!session) return;

    const currentExercise = session.exercises[session.currentExerciseIndex];
    const updatedExercises = session.exercises.map((ex, i) => {
      if (i !== session.currentExerciseIndex) return ex;
      return {
        ...ex,
        completedSets: [
          ...ex.completedSets,
          { reps: ex.reps, load: load || 0 },
        ],
      };
    });

    const newCompletedCount = session.completedSetsCount + 1;
    const isLastSetOfExercise =
      currentExercise.completedSets.length + 1 >= currentExercise.sets;
    const isLastExercise =
      session.currentExerciseIndex >= session.exercises.length - 1;
    const isWorkoutComplete = isLastSetOfExercise && isLastExercise;

    if (isWorkoutComplete) {
      set({
        activeSession: {
          ...session,
          exercises: updatedExercises,
          completedSetsCount: newCompletedCount,
          isResting: false,
        },
      });
      return true;
    }

    let nextExerciseIndex = session.currentExerciseIndex;
    let nextSetIndex = session.currentSetIndex + 1;

    if (isLastSetOfExercise) {
      nextExerciseIndex = session.currentExerciseIndex + 1;
      nextSetIndex = 0;
    }

    set({
      activeSession: {
        ...session,
        exercises: updatedExercises,
        currentExerciseIndex: nextExerciseIndex,
        currentSetIndex: nextSetIndex,
        completedSetsCount: newCompletedCount,
        isResting: true,
        restSecondsRemaining: DEFAULT_REST_SECONDS,
      },
    });

    return false;
  },

  tickTimer: () => {
    const session = get().activeSession;
    if (!session || session.isPaused) return;

    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    const calories = parseFloat((elapsed * 0.09).toFixed(1));

    set({
      activeSession: {
        ...session,
        elapsedSeconds: elapsed,
        caloriesBurned: calories,
      },
    });
  },

  tickRest: () => {
    const session = get().activeSession;
    if (!session || !session.isResting) return;

    if (session.restSecondsRemaining <= 1) {
      set({
        activeSession: { ...session, isResting: false, restSecondsRemaining: 0 },
      });
    } else {
      set({
        activeSession: {
          ...session,
          restSecondsRemaining: session.restSecondsRemaining - 1,
        },
      });
    }
  },

  addRestTime: (seconds) => {
    const session = get().activeSession;
    if (!session) return;
    set({
      activeSession: {
        ...session,
        restSecondsRemaining: session.restSecondsRemaining + seconds,
      },
    });
  },

  skipRest: () => {
    const session = get().activeSession;
    if (!session) return;
    set({
      activeSession: { ...session, isResting: false, restSecondsRemaining: 0 },
    });
  },

  togglePause: () => {
    const session = get().activeSession;
    if (!session) return;
    set({
      activeSession: { ...session, isPaused: !session.isPaused },
    });
  },

  endSession: () => set({ activeSession: null }),

  clearWorkouts: () =>
    set({ workouts: [], activeSession: null, loading: false, error: null }),
}));
