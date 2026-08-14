import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Formats a Date to 'YYYY-MM-DD' for Firestore document IDs.
 */
function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Fetches the water log for a specific date.
 * Returns { entries: [...], totalMl: number } or a default empty log.
 */
export async function fetchWaterLog(uid, date) {
  if (!uid) return { entries: [], totalMl: 0 };

  const dateKey = formatDateKey(date);
  const docRef = doc(db, 'users', uid, 'waterLogs', dateKey);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data();
  }

  return { entries: [], totalMl: 0 };
}

/**
 * Adds a water entry (amount in ml) to the log of a specific date.
 */
export async function addWaterEntry(uid, date, amount) {
  if (!uid || !amount) return;

  const dateKey = formatDateKey(date);
  const docRef = doc(db, 'users', uid, 'waterLogs', dateKey);

  const currentLog = await fetchWaterLog(uid, date);

  const newEntry = {
    amount,
    time: new Date().toISOString(),
  };

  const updatedLog = {
    entries: [...currentLog.entries, newEntry],
    totalMl: currentLog.totalMl + amount,
    date: dateKey,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedLog);
  return updatedLog;
}

/**
 * Removes a water entry by index from the log of a specific date.
 */
export async function removeWaterEntry(uid, date, entryIndex) {
  if (!uid && entryIndex == null) return;

  const dateKey = formatDateKey(date);
  const docRef = doc(db, 'users', uid, 'waterLogs', dateKey);

  const currentLog = await fetchWaterLog(uid, date);
  if (!currentLog.entries[entryIndex]) return currentLog;

  const removedAmount = currentLog.entries[entryIndex].amount;
  const updatedEntries = currentLog.entries.filter((_, i) => i !== entryIndex);

  const updatedLog = {
    entries: updatedEntries,
    totalMl: Math.max(0, currentLog.totalMl - removedAmount),
    date: dateKey,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedLog);
  return updatedLog;
}
