import { useRef } from 'react';
import { Camera, Flame, Target, Dumbbell } from 'lucide-react';
import Card from '../ui/Card';
import { compressImage } from '../../services/imageUtils';
import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ user, profile, onUpdateAvatar }) {
  const fileInputRef = useRef(null);

  const name =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user?.displayName || user?.email?.split('@')[0] || 'Atleta';

  const email = user?.email || '';
  const photoURL = user?.photoURL || profile?.photoURL;
  const initial = name ? String(name).charAt(0).toUpperCase() : 'A';

  const goalInfo = (() => {
    switch (profile?.goal) {
      case 'perda_peso':
        return { label: 'Emagrecimento', icon: Flame, color: '#FF6D00' };
      case 'ganho_massa':
        return { label: 'Hipertrofia', icon: Dumbbell, color: '#38BDF8' };
      default:
        return { label: 'Manutenção', icon: Target, color: '#00E676' };
    }
  })();

  const GoalIcon = goalInfo.icon;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 400, 0.85);
      if (onUpdateAvatar) {
        onUpdateAvatar(compressed.dataUrl);
      }
    } catch (err) {
      console.error('Erro ao processar imagem de avatar:', err);
    }
  };

  return (
    <Card variant="default" padding="lg" className={styles.card}>
      <div className={styles.avatarWrapper}>
        {photoURL ? (
          <img src={photoURL} alt={name} className={styles.avatarImage} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <span>{initial}</span>
          </div>
        )}
        <button
          type="button"
          className={styles.cameraBtn}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Alterar foto de perfil"
          title="Alterar foto"
        >
          <Camera size={14} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h2 className={styles.name}>{name}</h2>
          <div
            className={styles.goalBadge}
            style={{
              backgroundColor: `${goalInfo.color}15`,
              color: goalInfo.color,
              borderColor: `${goalInfo.color}30`,
            }}
          >
            <GoalIcon size={12} />
            <span>{goalInfo.label}</span>
          </div>
        </div>
        {email && <p className={styles.email}>{email}</p>}
      </div>
    </Card>
  );
}
