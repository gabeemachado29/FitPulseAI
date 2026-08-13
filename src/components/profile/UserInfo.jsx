import Card from '../ui/Card';
import styles from './UserInfo.module.css';

export default function UserInfo({ user }) {
  const name = user?.displayName || 'Gabriel Machado França';
  const email = user?.email || 'gabrielmachado.f29@gmail.com';
  const initial = name.charAt(0).toUpperCase();

  return (
    <Card variant="default" padding="lg" className={styles.card}>
      <div className={styles.avatar}>
        <span>{initial}</span>
      </div>
      <div className={styles.details}>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.email}>{email}</p>
      </div>
    </Card>
  );
}
