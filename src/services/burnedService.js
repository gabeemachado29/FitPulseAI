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
 * Fetches the burned calories log for a specific date.
 * Returns { entries: [...], totalBurned: number }
 */
export async function fetchBurnedLog(uid, date) {
  if (!uid) return { entries: [], totalBurned: 0 };

  const dateKey = formatDateKey(date);
  const docRef = doc(db, 'users', uid, 'burnedLogs', dateKey);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data();
  }

  return { entries: [], totalBurned: 0 };
}

/**
 * Adds a burned calorie entry (from workout or Strava).
 * @param {string} uid
 * @param {Date} date
 * @param {{ source: 'workout'|'strava', calories: number, name: string, activityId?: string }} entry
 */
export async function addBurnedEntry(uid, date, entry) {
  if (!uid || !entry) return;

  const dateKey = formatDateKey(date);
  const docRef = doc(db, 'users', uid, 'burnedLogs', dateKey);

  const currentLog = await fetchBurnedLog(uid, date);

  const newEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  const updatedLog = {
    entries: [...currentLog.entries, newEntry],
    totalBurned: currentLog.totalBurned + (entry.calories || 0),
    date: dateKey,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedLog);
  return updatedLog;
}

/**
 * Adds multiple burned entries at once (e.g. multiple Strava activities).
 */
export async function addMultipleBurnedEntries(uid, date, entries) {
  if (!uid || !entries?.length) return;

  const dateKey = formatDateKey(date);
  const docRef = doc(db, 'users', uid, 'burnedLogs', dateKey);

  const currentLog = await fetchBurnedLog(uid, date);

  const newEntries = entries.map((entry) => ({
    ...entry,
    timestamp: new Date().toISOString(),
  }));

  const addedCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);

  const updatedLog = {
    entries: [...currentLog.entries, ...newEntries],
    totalBurned: currentLog.totalBurned + addedCalories,
    date: dateKey,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, updatedLog);
  return updatedLog;
}
