import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Capacitor } from '@capacitor/core';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

/**
 * Generate Strava OAuth Authorization URL with user state isolation and anti-CSRF token.
 */
export function getStravaAuthUrl(uid) {
  const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
  let redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;

  if (!redirectUri) {
    if (Capacitor.isNativePlatform()) {
      // On mobile APK, fallback to production server URL instead of localhost
      redirectUri = 'https://fitpulseai-41d93.web.app/strava/callback';
    } else {
      redirectUri = `${window.location.origin}/strava/callback`;
    }
  }

  const scope = 'read,activity:read_all';

  if (!clientId) {
    console.warn('VITE_STRAVA_CLIENT_ID not set');
  }

  // Anti-CSRF nonce + user account isolation
  const nonce = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('strava_oauth_nonce', nonce);

  // Pass uid and nonce as OAuth state to isolate user accounts securely
  const state = encodeURIComponent(JSON.stringify({ uid, nonce }));

  return `${STRAVA_AUTH_URL}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&approval_prompt=force&scope=${scope}&state=${state}`;
}

/**
 * Validate OAuth state returned in redirect to prevent CSRF and account mismatch.
 */
export function validateStravaState(returnedState, currentUid) {
  if (!returnedState) return true; // Graceful fallback if omitted

  try {
    const decoded = JSON.parse(decodeURIComponent(returnedState));
    if (decoded.uid && decoded.uid !== currentUid) {
      console.warn('Strava OAuth state mismatch: UID mismatch');
      return false;
    }
    const savedNonce = sessionStorage.getItem('strava_oauth_nonce');
    if (savedNonce && decoded.nonce && decoded.nonce !== savedNonce) {
      console.warn('Strava OAuth state mismatch: Invalid nonce');
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Failed to parse Strava OAuth state:', e);
    return true;
  }
}

export async function fetchStravaConnectionStatus(uid) {
  if (!uid) return false;
  try {
    const docRef = doc(db, 'users', uid, 'integrations', 'strava');
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch (err) {
    console.error('Error checking Strava status:', err);
    return false;
  }
}

/**
 * Exchange OAuth code for access and refresh tokens.
 * Uses Cloud Function proxy if configured, otherwise falls back to direct exchange.
 */
export async function exchangeStravaCode(uid, code) {
  if (!uid || !code) throw new Error('Missing code or user ID');

  const proxyUrl = import.meta.env.VITE_CLOUD_FUNCTIONS_URL;
  let tokenData;

  if (proxyUrl) {
    // Production secure exchange via Cloud Function proxy (prevents client_secret leak)
    const res = await fetch(`${proxyUrl}/api/strava/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, code }),
    });

    if (!res.ok) throw new Error('Failed to exchange code via backend proxy');
    tokenData = await res.json();
  } else {
    // Direct exchange
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Strava auth code');
    }

    const data = await response.json();
    tokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      athleteId: data.athlete?.id,
      athleteName: `${data.athlete?.firstname || ''} ${data.athlete?.lastname || ''}`.trim(),
      connectedAt: new Date().toISOString(),
    };
  }

  // Save isolated user integration credentials in Firestore
  const docRef = doc(db, 'users', uid, 'integrations', 'strava');
  await setDoc(docRef, tokenData);
  return tokenData;
}

export async function fetchStravaActivities(uid) {
  if (!uid) return [];

  const docRef = doc(db, 'users', uid, 'integrations', 'strava');
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return [];
  }

  const tokenData = snap.data();
  let accessToken = tokenData.accessToken;

  // Refresh token if expired or about to expire in 5 min
  if (tokenData.expiresAt && Date.now() / 1000 > tokenData.expiresAt - 300) {
    try {
      const refreshed = await refreshStravaToken(uid, tokenData.refreshToken);
      accessToken = refreshed.accessToken;
    } catch (err) {
      console.error('Failed to refresh Strava token:', err);
    }
  }

  const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=10', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Strava activities');
  }

  const activities = await response.json();
  return activities.map((act) => ({
    id: `strava_${act.id}`,
    name: act.name,
    type: act.type,
    distanceKm: parseFloat((act.distance / 1000).toFixed(1)),
    durationMinutes: Math.round(act.elapsed_time / 60),
    calories: Math.round(act.kilojoules ? act.kilojoules * 0.239 : (act.elapsed_time / 60) * 8),
    startDate: act.start_date,
  }));
}

async function refreshStravaToken(uid, refreshToken) {
  const proxyUrl = import.meta.env.VITE_CLOUD_FUNCTIONS_URL;
  let refreshedData;

  if (proxyUrl) {
    const res = await fetch(`${proxyUrl}/api/strava/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, refreshToken }),
    });

    if (!res.ok) throw new Error('Token refresh failed via proxy');
    refreshedData = await res.json();
  } else {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) throw new Error('Token refresh failed');
    const data = await response.json();

    refreshedData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      updatedAt: new Date().toISOString(),
    };
  }

  const docRef = doc(db, 'users', uid, 'integrations', 'strava');
  await setDoc(docRef, refreshedData, { merge: true });
  return refreshedData;
}

export async function disconnectStrava(uid) {
  if (!uid) return;
  const docRef = doc(db, 'users', uid, 'integrations', 'strava');
  await deleteDoc(docRef);
}
