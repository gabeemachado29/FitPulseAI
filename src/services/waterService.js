/**
 * FitPulseAI — Water Tracking Service (WaterTrackingService)
 * Manages hydration intake with automatic midnight date reset,
 * historical daily logs persistence, and local cache synchronization.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Formats a date object or string into local 'YYYY-MM-DD' format.
 * Prevents UTC timezone discrepancies around midnight.
 *
 * @param {Date|string|number} [date]
 * @returns {string} 'YYYY-MM-DD'
 */
export function formatLocalDateKey(date) {
  const d = date ? (date instanceof Date ? date : new Date(date)) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class WaterTrackingService {
  /**
   * Returns today's date string formatted as 'YYYY-MM-DD'.
   */
  static getTodayDateString() {
    return formatLocalDateKey(new Date());
  }

  /**
   * Verifies if a daily reset is needed (past midnight).
   * If a new day is detected:
   * - Persists the previous day's log
   * - Resets current_intake_ml to 0 for today
   * - Updates last_updated_date to today
   *
   * @param {string} uid - User ID
   * @returns {Promise<{resetOccurred: boolean, log: object}>}
   */
  static async checkAndPerformDailyReset(uid) {
    if (!uid) return { resetOccurred: false, log: { entries: [], totalMl: 0, current_intake_ml: 0 } };

    const todayStr = this.getTodayDateString();
    const localMetaKey = `fitpulse_water_meta_${uid}`;
    
    let lastUpdatedDate = null;
    try {
      const metaRaw = localStorage.getItem(localMetaKey);
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        lastUpdatedDate = meta?.last_updated_date;
      }
    } catch (e) {
      console.warn('Erro ao ler meta de água local:', e);
    }

    // Fetch today's log from Firestore
    const todayDocRef = doc(db, 'users', uid, 'waterLogs', todayStr);
    const todaySnap = await getDoc(todayDocRef);

    if (todaySnap.exists()) {
      const data = todaySnap.data();
      const activeLog = {
        entries: data.entries || [],
        totalMl: Number(data.totalMl ?? data.current_intake_ml) || 0,
        current_intake_ml: Number(data.current_intake_ml ?? data.totalMl) || 0,
        date: todayStr,
        last_updated_date: todayStr,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };

      localStorage.setItem(localMetaKey, JSON.stringify({ last_updated_date: todayStr }));
      return { resetOccurred: false, log: activeLog };
    }

    // If today's document doesn't exist yet, this is a new day / reset
    const newDayLog = {
      entries: [],
      totalMl: 0,
      current_intake_ml: 0,
      date: todayStr,
      last_updated_date: todayStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(todayDocRef, newDayLog);
      localStorage.setItem(localMetaKey, JSON.stringify({ last_updated_date: todayStr }));
    } catch (err) {
      console.warn('Falha ao inicializar log de água do dia:', err);
    }

    return {
      resetOccurred: lastUpdatedDate !== null && lastUpdatedDate !== todayStr,
      log: newDayLog,
    };
  }

  /**
   * Fetches the water log for a specific date with daily reset protection.
   *
   * @param {string} uid - User ID
   * @param {Date|string} date - Target date
   * @returns {Promise<{entries: Array, totalMl: number, current_intake_ml: number, date: string, last_updated_date: string}>}
   */
  static async fetchWaterLog(uid, date) {
    if (!uid) return { entries: [], totalMl: 0, current_intake_ml: 0 };

    const targetDateKey = formatLocalDateKey(date);
    const todayStr = this.getTodayDateString();

    // If fetching for today, execute daily reset check
    if (targetDateKey === todayStr) {
      const { log } = await this.checkAndPerformDailyReset(uid);
      return log;
    }

    // Historical date fetch
    const docRef = doc(db, 'users', uid, 'waterLogs', targetDateKey);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const total = Number(data.totalMl ?? data.current_intake_ml) || 0;
      return {
        entries: data.entries || [],
        totalMl: total,
        current_intake_ml: total,
        date: targetDateKey,
        last_updated_date: data.last_updated_date || targetDateKey,
        ...data,
      };
    }

    return {
      entries: [],
      totalMl: 0,
      current_intake_ml: 0,
      date: targetDateKey,
      last_updated_date: targetDateKey,
    };
  }

  /**
   * Adds a water entry (amount in ml) to the log of a specific date.
   *
   * @param {string} uid
   * @param {Date|string} date
   * @param {number} amount
   */
  static async addWaterEntry(uid, date, amount) {
    if (!uid || !amount || amount <= 0) return null;

    const dateKey = formatLocalDateKey(date);
    const docRef = doc(db, 'users', uid, 'waterLogs', dateKey);

    const currentLog = await this.fetchWaterLog(uid, date);
    const newEntry = {
      amount: Number(amount),
      time: new Date().toISOString(),
    };

    const newTotal = (currentLog.totalMl || 0) + Number(amount);

    const updatedLog = {
      entries: [...(currentLog.entries || []), newEntry],
      totalMl: newTotal,
      current_intake_ml: newTotal,
      date: dateKey,
      last_updated_date: dateKey,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, updatedLog);

    // Update local meta
    try {
      localStorage.setItem(
        `fitpulse_water_meta_${uid}`,
        JSON.stringify({ last_updated_date: dateKey })
      );
    } catch (e) {
      console.warn(e);
    }

    return updatedLog;
  }

  /**
   * Removes a water entry by index from the log of a specific date.
   *
   * @param {string} uid
   * @param {Date|string} date
   * @param {number} entryIndex
   */
  static async removeWaterEntry(uid, date, entryIndex) {
    if (!uid || entryIndex == null) return null;

    const dateKey = formatLocalDateKey(date);
    const docRef = doc(db, 'users', uid, 'waterLogs', dateKey);

    const currentLog = await this.fetchWaterLog(uid, date);
    const entries = currentLog.entries || [];

    if (!entries[entryIndex]) return currentLog;

    const removedAmount = entries[entryIndex].amount || 0;
    const updatedEntries = entries.filter((_, i) => i !== entryIndex);
    const newTotal = Math.max(0, (currentLog.totalMl || 0) - removedAmount);

    const updatedLog = {
      entries: updatedEntries,
      totalMl: newTotal,
      current_intake_ml: newTotal,
      date: dateKey,
      last_updated_date: dateKey,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, updatedLog);
    return updatedLog;
  }
}

/**
 * Functional Exports for backwards compatibility across components and hooks
 */
export async function fetchWaterLog(uid, date) {
  return WaterTrackingService.fetchWaterLog(uid, date);
}

export async function addWaterEntry(uid, date, amount) {
  return WaterTrackingService.addWaterEntry(uid, date, amount);
}

export async function removeWaterEntry(uid, date, entryIndex) {
  return WaterTrackingService.removeWaterEntry(uid, date, entryIndex);
}

export async function checkAndPerformDailyReset(uid) {
  return WaterTrackingService.checkAndPerformDailyReset(uid);
}
