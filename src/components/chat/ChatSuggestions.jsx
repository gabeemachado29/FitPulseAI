import styles from './ChatSuggestions.module.css';

const SUGGESTIONS = [
  '💡 O que comer no jantar com minhas calorias restantes?',
  '🥩 Como posso bater minha meta de proteína hoje?',
  '🍚 Quais opções saudáveis de substituição para o arroz?',
  '💧 Quantos ml de água ainda devo beber?',
];

export default function ChatSuggestions({ onSelect }) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>Sugestões rápidas:</p>
      <div className={styles.list}>
        {SUGGESTIONS.map((text, idx) => (
          <button
            key={idx}
            type="button"
            className={styles.chip}
            onClick={() => onSelect(text)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
