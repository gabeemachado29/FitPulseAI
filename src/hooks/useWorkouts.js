import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import {
  fetchUserWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  saveWorkoutSession,
} from '../services/workoutService';

export function useWorkouts() {
  const user = useAuthStore((state) => state.user);
  const workouts = useWorkoutStore((state) => state.workouts);
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const loading = useWorkoutStore((state) => state.loading);
  const error = useWorkoutStore((state) => state.error);

  const setWorkouts = useWorkoutStore((state) => state.setWorkouts);
  const setLoading = useWorkoutStore((state) => state.setLoading);
  const setError = useWorkoutStore((state) => state.setError);

  const startSession = useWorkoutStore((state) => state.startSession);
  const completeSet = useWorkoutStore((state) => state.completeSet);
  const tickTimer = useWorkoutStore((state) => state.tickTimer);
  const tickRest = useWorkoutStore((state) => state.tickRest);
  const addRestTime = useWorkoutStore((state) => state.addRestTime);
  const skipRest = useWorkoutStore((state) => state.skipRest);
  const togglePause = useWorkoutStore((state) => state.togglePause);
  const endSession = useWorkoutStore((state) => state.endSession);

  useEffect(() => {
    if (!user) return;

    async function loadWorkouts() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserWorkouts(user.uid);
        setWorkouts(data);
      } catch (err) {
        console.error('Failed to load workouts:', err);
        setError('Erro ao carregar treinos.');
      } finally {
        setLoading(false);
      }
    }

    loadWorkouts();
  }, [user, setWorkouts, setLoading, setError]);

  const add = async (workoutData) => {
    if (!user) return;
    setLoading(true);
    try {
      const created = await createWorkout(user.uid, workoutData);
      const updatedList = await fetchUserWorkouts(user.uid);
      setWorkouts(updatedList);
      return created;
    } catch (err) {
      console.error('Failed to create workout:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, updates) => {
    if (!user) return;
    try {
      await updateWorkout(user.uid, id, updates);
      const updatedList = await fetchUserWorkouts(user.uid);
      setWorkouts(updatedList);
    } catch (err) {
      console.error('Failed to update workout:', err);
      throw err;
    }
  };

  const remove = async (id) => {
    if (!user) return;
    try {
      await deleteWorkout(user.uid, id);
      const updatedList = await fetchUserWorkouts(user.uid);
      setWorkouts(updatedList);
    } catch (err) {
      console.error('Failed to delete workout:', err);
      throw err;
    }
  };

  const finishAndSaveSession = async () => {
    if (!user || !activeSession) return;
    try {
      await saveWorkoutSession(user.uid, activeSession);
      endSession();
    } catch (err) {
      console.error('Failed to save session:', err);
      throw err;
    }
  };

  return {
    workouts,
    activeSession,
    loading,
    error,
    addWorkout: add,
    updateWorkout: update,
    deleteWorkout: remove,
    startSession,
    completeSet,
    tickTimer,
    tickRest,
    addRestTime,
    skipRest,
    togglePause,
    endSession,
    finishAndSaveSession,
  };
}
