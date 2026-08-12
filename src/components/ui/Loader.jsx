import styles from './Loader.module.css';

export default function Loader({ fullScreen = false, size = 40 }) {
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={styles.spinner} style={{ width: size, height: size }} />
      </div>
    );
  }

  return (
    <div className={styles.inline}>
      <div className={styles.spinner} style={{ width: size, height: size }} />
    </div>
  );
}
