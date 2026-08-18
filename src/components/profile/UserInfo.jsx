import Card from '../ui/Card';
import styles from './UserInfo.module.css';

export default function UserInfo({ user }) {
  const name =
    user && typeof user.displayName === 'string' && user.displayName.trim()
      ? user.displayName
      : user && typeof user.email === 'string' && user.email.trim()
      ? user.email.split('@')[0]
      : 'Atleta';

  const email = user && typeof user.email === 'string' ? user.email : '';
  const initial = name ? String(name).charAt(0).toUpperCase() : 'A';

  return (
    <Card variant="default" padding="lg" className={styles.card}>
      <div className={styles.avatar}>
        <span>{initial}</span>
      </div>
      <div className={styles.details}>
        <h2 className={styles.name}>{name}</h2>
        {email && <p className={styles.email}>{email}</p>}
      </div>
    </Card>
  );
}
