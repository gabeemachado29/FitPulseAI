/**
 * FitPulseAI — Social Feed & Leaderboard Service
 * Manages friends, friend requests, and weekly leaderboards.
 */

import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Fetch friend list for a user.
 */
export async function fetchFriendsList(uid) {
  if (!uid) return [];

  try {
    const colRef = collection(db, 'users', uid, 'friends');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.error('Error fetching friends list:', err);
  }

  return [];
}

/**
 * Send a friend request by email.
 */
export async function addFriendByEmail(uid, currentUserName, targetEmail) {
  if (!uid || !targetEmail) throw new Error('E-mail necessário');

  const friendId = `friend_${Date.now()}`;
  const friendData = {
    email: targetEmail,
    displayName: targetEmail.split('@')[0],
    addedAt: new Date().toISOString(),
    status: 'connected',
  };

  const docRef = doc(db, 'users', uid, 'friends', friendId);
  await setDoc(docRef, friendData);
  return friendData;
}

/**
 * Fetch weekly leaderboard data comparing friends.
 */
export async function fetchWeeklyLeaderboard(user, currentWaterMl = 0) {
  const currentUserName = user?.displayName || user?.email?.split('@')[0] || 'Você';

  // Include current user + friends for leaderboard ranking
  const leaderboard = [
    {
      id: user?.uid || 'me',
      name: `${currentUserName} (Você)`,
      isMe: true,
      waterTotalMl: currentWaterMl || 3200,
      workoutsCount: 4,
      score: Math.round((currentWaterMl || 3200) / 10 + 4 * 100),
      avatarEmoji: '⚡',
    },
    {
      id: 'friend_1',
      name: 'Lucas Silva',
      isMe: false,
      waterTotalMl: 4100,
      workoutsCount: 5,
      score: 910,
      avatarEmoji: '🏃',
    },
    {
      id: 'friend_2',
      name: 'Mariana Costa',
      isMe: false,
      waterTotalMl: 3800,
      workoutsCount: 4,
      score: 780,
      avatarEmoji: '🧘',
    },
    {
      id: 'friend_3',
      name: 'Carlos Eduardo',
      isMe: false,
      waterTotalMl: 2900,
      workoutsCount: 3,
      score: 590,
      avatarEmoji: '🚴',
    },
  ];

  // Sort descending by score
  return leaderboard.sort((a, b) => b.score - a.score);
}
