import { useState } from 'react';
import { Pencil, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import styles from './TextScanner.module.css';

export default function TextScanner({ onAnalyzeText, loading }) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || loading) return;
    onAnalyzeText(description);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Pencil size={18} className={styles.pencilIcon} />
          <h3 className={styles.title}>Descreva sua refeição</h3>
        </div>

        <Input
          multiline
          rows={5}
          value={description}
          onChange={setDescription}
          placeholder="Ex: 1 prato de arroz com feijão, 150g de frango grelhado e salada de alface com tomate..."
          required
        />

        <p className={styles.note}>
          Quanto mais detalhes (porções, ingredientes), mais precisa a estimativa.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        icon={Sparkles}
        loading={loading}
        disabled={!description.trim()}
      >
        Analisar com IA
      </Button>
    </form>
  );
}
