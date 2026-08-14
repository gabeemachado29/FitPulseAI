import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWaterStore } from '../store/waterStore';
import { fetchWaterLog, addWaterEntry, removeWaterEntry } from '../services/waterService';

export function useWater(selectedDate) {
  const user = useAuthStore((state) => state.user);
  const {
    dailyWater,
    loading,
    setDailyWater,
    setLoading,
    addWater: addWaterLocal,
    removeWater: removeWaterLocal,
  } = useWaterStore();

  // Load water log when date or user changes
  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;
    setLoading(true);

    fetchWaterLog(user.uid, selectedDate)
      .then((log) => {
        if (!cancelled) setDailyWater(log);
      })
      .catch((err) => {
        console.error('Error fetching water log:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, selectedDate, setDailyWater, setLoading]);

  const addWater = useCallback(
    async (amount) => {
      if (!user?.uid) return;

      // Optimistic update
      addWaterLocal(amount);

      try {
        const updatedLog = await addWaterEntry(user.uid, selectedDate, amount);
        if (updatedLog) setDailyWater(updatedLog);
      } catch (err) {
        console.error('Error adding water entry:', err);
      }
    },
    [user?.uid, selectedDate, addWaterLocal, setDailyWater]
  );

  const removeWater = useCallback(
    async (index) => {
      if (!user?.uid) return;

      // Optimistic update
      removeWaterLocal(index);

      try {
        const updatedLog = await removeWaterEntry(user.uid, selectedDate, index);
        if (updatedLog) setDailyWater(updatedLog);
      } catch (err) {
        console.error('Error removing water entry:', err);
      }
    },
    [user?.uid, selectedDate, removeWaterLocal, setDailyWater]
  );

  return {
    dailyWater,
    loading,
    addWater,
    removeWater,
  };
}
