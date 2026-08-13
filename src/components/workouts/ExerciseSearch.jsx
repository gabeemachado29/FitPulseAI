import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import Input from '../ui/Input';
import { searchExercises } from '../../services/exerciseDatabase';
import styles from './ExerciseSearch.module.css';

export default function ExerciseSearch({ onSelectExercise, onClose }) {
  const [query, setQuery] = useState('');
  const results = searchExercises(query);

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <Input
          icon={Search}
          placeholder="Buscar exercício ou músculo..."
          value={query}
          onChange={setQuery}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.list}>
        {results.map((exercise) => (
          <div key={exercise.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{exercise.name}</span>
              <span className={styles.itemCategory}>{exercise.muscleGroup}</span>
            </div>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => onSelectExercise(exercise)}
              aria-label={`Adicionar ${exercise.name}`}
            >
              <Plus size={18} />
            </button>
          </div>
        ))}
        {results.length === 0 && (
          <p className={styles.emptyText}>Nenhum exercício encontrado</p>
        )}
      </div>

      <button type="button" className={styles.closeSearchBtn} onClick={onClose}>
        Fechar busca
      </button>
    </div>
  );
}
