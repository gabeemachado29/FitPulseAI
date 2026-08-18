import styles from './ChatBubble.module.css';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.row} ${isUser ? styles.userRow : styles.aiRow}`}>
      {!isUser && <div className={styles.avatar}>🤖</div>}
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
        <p className={styles.text}>{message.text}</p>
      </div>
    </div>
  );
}
