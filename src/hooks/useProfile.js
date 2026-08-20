import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { fetchUserProfile, saveUserProfile, DEFAULT_PROFILE } from '../services/profileService';

// Module-level lock to prevent duplicate simultaneous fetches across multiple hook instances
let isFetchingProfile = false;
let lastFetchedUid = null;

export function useProfile() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const loading = useProfileStore((state) => state.loading);
  const error = useProfileStore((state) => state.error);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLoading = useProfileStore((state) => state.setLoading);
  const setError = useProfileStore((state) => state.setError);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;

    // If profile is already loaded in store for this user, do not re-fetch
    if (profile && (profile.id === uid || profile.uid === uid) && lastFetchedUid === uid) {
      return;
    }

    if (isFetchingProfile) return;

    let isMounted = true;
    isFetchingProfile = true;
    lastFetchedUid = uid;

    // Load from local storage cache first for instant synchronous UI display
    try {
      const cached = localStorage.getItem(`fitpulse_profile_${uid}`);
      if (cached && !profile) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setProfile({ ...DEFAULT_PROFILE, ...parsed, id: uid });
        }
      }
    } catch (e) {
      console.warn('Cache read warning:', e);
    }

    setLoading(true);
    setError(null);

    fetchUserProfile(uid)
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          try {
            localStorage.setItem(`fitpulse_profile_${uid}`, JSON.stringify(data));
          } catch (e) {
            console.warn(e);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load profile:', err);
          setError('Erro ao carregar dados do perfil.');
        }
      })
      .finally(() => {
        isFetchingProfile = false;
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      isFetchingProfile = false;
    };
  }, [uid, setProfile, setLoading, setError]);

  const update = useCallback(
    async (profileData) => {
      if (!uid) return;
      setLoading(true);
      setError(null);
      try {
        const updated = await saveUserProfile(uid, profileData);
        setProfile(updated);
        try {
          localStorage.setItem(`fitpulse_profile_${uid}`, JSON.stringify(updated));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      } catch (err) {
        console.error('Failed to save profile:', err);
        setError('Erro ao salvar perfil.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [uid, setProfile, setLoading, setError]
  );

  return {
    profile: profile || (uid ? { ...DEFAULT_PROFILE, id: uid } : DEFAULT_PROFILE),
    loading,
    error,
    updateProfile: update,
  };
}
