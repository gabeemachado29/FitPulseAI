import { create } from 'zustand';

export const useWaterStore = create((set, get) => ({
  dailyWater: {
    entries: [],
    totalMl: 0,
    current_intake_ml: 0,
    date: new Date().toISOString().split('T')[0],
    last_updated_date: new Date().toISOString().split('T')[0],
  },
  loading: false,
  error: null,

  setDailyWater: (log) =>
    set({
      dailyWater: {
        entries: log?.entries || [],
        totalMl: Number(log?.totalMl ?? log?.current_intake_ml) || 0,
        current_intake_ml: Number(log?.current_intake_ml ?? log?.totalMl) || 0,
        date: log?.date || new Date().toISOString().split('T')[0],
        last_updated_date: log?.last_updated_date || log?.date || new Date().toISOString().split('T')[0],
        ...log,
      },
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addWater: (amount) => {
    const current = get().dailyWater;
    const newTotal = (current.totalMl || 0) + Number(amount);
    set({
      dailyWater: {
        ...current,
        entries: [
          ...(current.entries || []),
          { amount: Number(amount), time: new Date().toISOString() },
        ],
        totalMl: newTotal,
        current_intake_ml: newTotal,
      },
    });
  },

  removeWater: (index) => {
    const current = get().dailyWater;
    if (!current.entries || !current.entries[index]) return;

    const removedAmount = current.entries[index].amount || 0;
    const newTotal = Math.max(0, (current.totalMl || 0) - removedAmount);
    set({
      dailyWater: {
        ...current,
        entries: current.entries.filter((_, i) => i !== index),
        totalMl: newTotal,
        current_intake_ml: newTotal,
      },
    });
  },

  clearWater: () =>
    set({
      dailyWater: {
        entries: [],
        totalMl: 0,
        current_intake_ml: 0,
        date: new Date().toISOString().split('T')[0],
        last_updated_date: new Date().toISOString().split('T')[0],
      },
      loading: false,
      error: null,
    }),
}));
