import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const DEFAULT_WORKOUTS = [
  {
    name: 'Cardio + Abd',
    dayOfWeek: 'qua',
    exercises: [
      { name: 'Abdominal na polia', muscleGroup: 'Abdômen', sets: 4, reps: 12, load: 0 },
      { name: 'Elevação de pernas', muscleGroup: 'Abdômen', sets: 4, reps: 12, load: 0 },
      { name: 'Corrida na esteira', muscleGroup: 'Cardio', sets: 3, reps: 12, load: 0 },
    ],
  },
];

export async function fetchUserWorkouts(uid) {
  if (!uid) return [];
  const colRef = collection(db, 'users', uid, 'workouts');
  const snap = await getDocs(colRef);

  if (!snap.empty) {
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  }

  // Seed default workout if user has none
  const defaultWorkout = DEFAULT_WORKOUTS[0];
  const newDocRef = doc(collection(db, 'users', uid, 'workouts'));
  const workoutWithId = { ...defaultWorkout, id: newDocRef.id, createdAt: new Date().toISOString() };
  await setDoc(newDocRef, workoutWithId);
  return [workoutWithId];
}

export async function createWorkout(uid, workoutData) {
  if (!uid) throw new Error('User ID is required');
  const colRef = collection(db, 'users', uid, 'workouts');
  const newDocRef = doc(colRef);
  const workoutWithId = {
    ...workoutData,
    id: newDocRef.id,
    createdAt: new Date().toISOString(),
  };

  await setDoc(newDocRef, workoutWithId);
  return workoutWithId;
}

export async function updateWorkout(uid, workoutId, updates) {
  if (!uid || !workoutId) throw new Error('User ID and Workout ID are required');
  const docRef = doc(db, 'users', uid, 'workouts', workoutId);
  const updatedData = { ...updates, updatedAt: new Date().toISOString() };
  await setDoc(docRef, updatedData, { merge: true });
  return { id: workoutId, ...updatedData };
}

export async function deleteWorkout(uid, workoutId) {
  if (!uid || !workoutId) throw new Error('User ID and Workout ID are required');
  const docRef = doc(db, 'users', uid, 'workouts', workoutId);
  await deleteDoc(docRef);
  return workoutId;
}

export async function saveWorkoutSession(uid, sessionData) {
  if (!uid) throw new Error('User ID is required');
  const colRef = collection(db, 'users', uid, 'workoutSessions');
  const newDocRef = doc(colRef);

  const completedSession = {
    ...sessionData,
    id: newDocRef.id,
    completedAt: new Date().toISOString(),
  };

  await setDoc(newDocRef, completedSession);
  return completedSession;
}
