import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { fetchUserProfile, saveUserProfile } from '../services/profileService';

export function useProfile() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const loading = useProfileStore((state) => state.loading);
  const error = useProfileStore((state) => state.error);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLoading = useProfileStore((state) => state.setLoading);
  const setError = useProfileStore((state) => state.setError);

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserProfile(user.uid);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Erro ao carregar dados do perfil.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, setProfile, setLoading, setError]);

  const update = async (profileData) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await saveUserProfile(user.uid, profileData);
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Erro ao salvar perfil.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile: update,
  };
}
