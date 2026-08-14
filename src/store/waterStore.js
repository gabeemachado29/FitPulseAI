import { create } from 'zustand';

export const useWaterStore = create((set, get) => ({
  dailyWater: { entries: [], totalMl: 0 },
  loading: false,
  error: null,

  setDailyWater: (log) => set({ dailyWater: log }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addWater: (amount) => {
    const current = get().dailyWater;
    set({
      dailyWater: {
        ...current,
        entries: [
          ...current.entries,
          { amount, time: new Date().toISOString() },
        ],
        totalMl: current.totalMl + amount,
      },
    });
  },

  removeWater: (index) => {
    const current = get().dailyWater;
    if (!current.entries[index]) return;

    const removedAmount = current.entries[index].amount;
    set({
      dailyWater: {
        ...current,
        entries: current.entries.filter((_, i) => i !== index),
        totalMl: Math.max(0, current.totalMl - removedAmount),
      },
    });
  },

  clearWater: () =>
    set({ dailyWater: { entries: [], totalMl: 0 }, loading: false, error: null }),
}));
